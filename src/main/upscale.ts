import { app, ipcMain, utilityProcess, type UtilityProcess } from 'electron'
import { createReadStream } from 'fs'
import { promises as fs, constants as fsConstants } from 'fs'
import { createHash, randomUUID } from 'crypto'
import { basename, dirname, extname, join, delimiter } from 'path'
import sharp from 'sharp'

/**
 * 阅读时 AI 增强引擎。
 *
 * main 只做配置、缓存与串行调度；waifu2x 原生进程由一个懒启动、长存活的
 * Electron utility process 拉起，避免其进程管理与输出处理占用主进程事件循环。
 */

export interface UpscaleConfig {
  enabled: boolean
  model: string
  scale: 1 | 2
  denoise: -1 | 0 | 1 | 2 | 3
  cacheLimitMB: number
}

export interface UpscaleStatus {
  engineReady: boolean
  gpu: 'available' | 'cpu-only' | 'none'
  model: string
}

export interface UpscalePeekResult {
  status: '1' | '0' | 'failed'
  error?: string
}

type EngineGpu = UpscaleStatus['gpu']

interface EngineResources {
  binary: string
  modelDir: string
}

interface WorkerReply {
  id: string
  ok: boolean
  error?: string
}

interface PendingWorkerRequest {
  resolve: () => void
  reject: (error: Error) => void
}

const DEFAULT_CONFIG: UpscaleConfig = {
  enabled: false,
  model: 'cunet',
  scale: 2,
  denoise: 1,
  cacheLimitMB: 2048
}

const WORKER_SOURCE = String.raw`
const { execFile } = require('node:child_process')
const parentPort = process.parentPort

parentPort.on('message', (event) => {
  const { id, binary, args, timeout } = event.data
  const child = execFile(
    binary,
    args,
    { timeout, maxBuffer: 8 * 1024 * 1024 },
    (error, _stdout, stderr) => {
      if (!error) {
        parentPort.postMessage({ id, ok: true })
        return
      }
      const detail = typeof stderr === 'string' ? stderr.trim() : String(stderr || '').trim()
      parentPort.postMessage({
        id,
        ok: false,
        error: detail ? error.message + '\n' + detail : error.message
      })
    }
  )
  child.stdin?.end()
})
`

const PROBE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAD0lEQVQImWNowAEYhpYEAILzYAEeEbvlAAAAAElFTkSuQmCC',
  'base64'
)

const NATIVE_INPUT_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

const settingsFile = (): string => join(app.getPath('userData'), 'settings.json')
export const upscaledRoot = (): string => join(app.getPath('userData'), 'upscaled')
const workerFile = (): string => join(app.getPath('userData'), 'upscale-worker.cjs')

let worker: UtilityProcess | null = null
let workerReady: Promise<UtilityProcess> | null = null
let workerSeq = 0
let setupDone = false
let serialTail: Promise<void> = Promise.resolve()
let statusCache: Promise<UpscaleStatus> | null = null

const workerPending = new Map<string, PendingWorkerRequest>()
const inFlight = new Map<string, Promise<string>>()

async function readSettings(): Promise<Record<string, unknown>> {
  try {
    return JSON.parse(await fs.readFile(settingsFile(), 'utf-8'))
  } catch {
    return {}
  }
}

async function patchSettings(patch: Record<string, unknown>): Promise<void> {
  const current = await readSettings()
  await fs.writeFile(settingsFile(), JSON.stringify({ ...current, ...patch }, null, 2), 'utf-8')
}

function normalizedConfig(value: unknown): UpscaleConfig {
  const raw = value && typeof value === 'object' ? (value as Partial<UpscaleConfig>) : {}
  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_CONFIG.enabled,
    model: raw.model === 'cunet' ? raw.model : DEFAULT_CONFIG.model,
    scale: raw.scale === 1 || raw.scale === 2 ? raw.scale : DEFAULT_CONFIG.scale,
    denoise:
      raw.denoise === -1 ||
      raw.denoise === 0 ||
      raw.denoise === 1 ||
      raw.denoise === 2 ||
      raw.denoise === 3
        ? raw.denoise
        : DEFAULT_CONFIG.denoise,
    cacheLimitMB:
      typeof raw.cacheLimitMB === 'number' &&
      Number.isFinite(raw.cacheLimitMB) &&
      raw.cacheLimitMB >= 0
        ? Math.floor(raw.cacheLimitMB)
        : DEFAULT_CONFIG.cacheLimitMB
  }
}

export async function getUpscaleConfig(): Promise<UpscaleConfig> {
  const settings = await readSettings()
  return normalizedConfig(settings.upscale)
}

function validateConfigPatch(value: unknown): Partial<UpscaleConfig> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('INVALID_UPSCALE_CONFIG')
  }
  const patch = value as Record<string, unknown>
  const allowed = new Set(['enabled', 'model', 'scale', 'denoise', 'cacheLimitMB'])
  if (Object.keys(patch).some((key) => !allowed.has(key))) throw new Error('INVALID_UPSCALE_CONFIG')
  if ('enabled' in patch && typeof patch.enabled !== 'boolean') {
    throw new Error('INVALID_UPSCALE_CONFIG')
  }
  if ('model' in patch && patch.model !== 'cunet') throw new Error('INVALID_UPSCALE_CONFIG')
  if ('scale' in patch && patch.scale !== 1 && patch.scale !== 2) {
    throw new Error('INVALID_UPSCALE_CONFIG')
  }
  if (
    'denoise' in patch &&
    patch.denoise !== -1 &&
    patch.denoise !== 0 &&
    patch.denoise !== 1 &&
    patch.denoise !== 2 &&
    patch.denoise !== 3
  ) {
    throw new Error('INVALID_UPSCALE_CONFIG')
  }
  if (
    'cacheLimitMB' in patch &&
    (typeof patch.cacheLimitMB !== 'number' ||
      !Number.isFinite(patch.cacheLimitMB) ||
      patch.cacheLimitMB < 0)
  ) {
    throw new Error('INVALID_UPSCALE_CONFIG')
  }
  return patch as Partial<UpscaleConfig>
}

async function setUpscaleConfig(value: unknown): Promise<UpscaleConfig> {
  const patch = validateConfigPatch(value)
  const current = await getUpscaleConfig()
  const next = normalizedConfig({ ...current, ...patch })
  await patchSettings({ upscale: next })
  if (patch.model !== undefined && patch.model !== current.model) statusCache = null
  if (patch.cacheLimitMB !== undefined) await enqueue(() => pruneCache(next.cacheLimitMB))
  return next
}

async function canAccess(path: string, mode = fsConstants.F_OK): Promise<boolean> {
  try {
    await fs.access(path, mode)
    return true
  } catch {
    return false
  }
}

function binaryName(): string {
  return process.platform === 'win32' ? 'waifu2x-ncnn-vulkan.exe' : 'waifu2x-ncnn-vulkan'
}

function resourceRoots(): string[] {
  const appPath = app.getAppPath()
  const unpackedAppPath = appPath.replace(/app\.asar$/, 'app.asar.unpacked')
  return [
    join(__dirname, '..', '..', 'resources', 'waifu2x-ncnn-vulkan'),
    join(process.cwd(), 'resources', 'waifu2x-ncnn-vulkan'),
    join(appPath, 'resources', 'waifu2x-ncnn-vulkan'),
    join(unpackedAppPath, 'resources', 'waifu2x-ncnn-vulkan'),
    join(process.resourcesPath, 'waifu2x-ncnn-vulkan'),
    join(process.resourcesPath, 'resources', 'waifu2x-ncnn-vulkan'),
    join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'waifu2x-ncnn-vulkan')
  ]
}

async function findSystemBinary(): Promise<string | null> {
  const name = binaryName()
  for (const dir of (process.env.PATH ?? '').split(delimiter).filter(Boolean)) {
    const candidate = join(dir, name)
    if (await canAccess(candidate, process.platform === 'win32' ? fsConstants.F_OK : fsConstants.X_OK)) {
      return candidate
    }
  }
  return null
}

async function resolveEngineResources(model: string): Promise<EngineResources | null> {
  const explicitBinary = process.env.CTK_WAIFU2X_BIN ?? process.env.WAIFU2X_BIN
  const candidates = [
    ...(explicitBinary ? [explicitBinary] : []),
    ...resourceRoots().map((root) => join(root, binaryName()))
  ]
  const systemBinary = await findSystemBinary()
  if (systemBinary) candidates.push(systemBinary)

  for (const binary of candidates) {
    const executable = await canAccess(
      binary,
      process.platform === 'win32' ? fsConstants.F_OK : fsConstants.X_OK
    )
    if (!executable) continue
    const explicitModels = process.env.CTK_WAIFU2X_MODELS ?? process.env.WAIFU2X_MODELS
    const modelCandidates = [
      ...(explicitModels
        ? [
            explicitModels,
            join(explicitModels, `models-${model}`),
            join(explicitModels, model)
          ]
        : []),
      join(dirname(binary), `models-${model}`),
      ...resourceRoots().map((root) => join(root, `models-${model}`))
    ]
    for (const modelDir of modelCandidates) {
      if (await canAccess(modelDir)) return { binary, modelDir }
    }
  }
  return null
}

async function ensureWorkerScript(): Promise<string> {
  const path = workerFile()
  try {
    if ((await fs.readFile(path, 'utf-8')) === WORKER_SOURCE) return path
  } catch {
    // 首次运行尚无 worker 文件。
  }
  const temp = `${path}.${randomUUID()}.tmp`
  await fs.writeFile(temp, WORKER_SOURCE, 'utf-8')
  await fs.rename(temp, path)
  return path
}

async function ensureWorker(): Promise<UtilityProcess> {
  if (worker) return worker
  if (workerReady) return workerReady
  workerReady = (async () => {
    const path = await ensureWorkerScript()
    const proc = utilityProcess.fork(path, [], { stdio: ['ignore', 'pipe', 'pipe'] })
    proc.stdout?.on('data', (data: Buffer) => {
      const message = data.toString().trimEnd()
      if (message) console.log('[upscale-worker]', message)
    })
    proc.stderr?.on('data', (data: Buffer) => {
      const message = data.toString().trimEnd()
      if (message) console.error('[upscale-worker]', message)
    })
    proc.on('message', (reply: WorkerReply) => {
      const pending = workerPending.get(reply.id)
      if (!pending) return
      workerPending.delete(reply.id)
      if (reply.ok) pending.resolve()
      else pending.reject(new Error(reply.error ?? 'UPSCALE_ENGINE_FAILED'))
    })
    proc.on('exit', (code) => {
      if (worker === proc) worker = null
      const error = new Error(`UPSCALE_WORKER_EXITED:${code}`)
      for (const pending of workerPending.values()) pending.reject(error)
      workerPending.clear()
    })
    worker = proc
    return proc
  })().finally(() => {
    workerReady = null
  })
  return workerReady
}

async function runEngine(binary: string, args: string[], timeout: number): Promise<void> {
  const proc = await ensureWorker()
  const id = `${Date.now()}-${workerSeq++}`
  return new Promise<void>((resolve, reject) => {
    workerPending.set(id, { resolve, reject })
    try {
      proc.postMessage({ id, binary, args, timeout })
    } catch (error) {
      workerPending.delete(id)
      reject(error)
    }
  })
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const result = serialTail.then(task, task)
  serialTail = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

async function probeGpu(resources: EngineResources): Promise<EngineGpu> {
  await fs.mkdir(upscaledRoot(), { recursive: true })
  const id = randomUUID()
  const input = join(upscaledRoot(), `.probe-${id}.png`)
  const output = join(upscaledRoot(), `.probe-${id}-out.png`)
  await fs.writeFile(input, PROBE_PNG)
  const baseArgs = [
    '-i',
    input,
    '-o',
    output,
    '-n',
    '0',
    '-s',
    '1',
    '-m',
    resources.modelDir,
    '-f',
    'png'
  ]
  try {
    try {
      await enqueue(() => runEngine(resources.binary, baseArgs, 30_000))
      if (await canAccess(output)) return 'available'
    } catch {
      // 自动 GPU 失败后再探测官方支持的 CPU 模式。
    }
    await fs.rm(output, { force: true })
    try {
      await enqueue(() => runEngine(resources.binary, [...baseArgs, '-g', '-1'], 30_000))
      return (await canAccess(output)) ? 'cpu-only' : 'none'
    } catch {
      return 'none'
    }
  } finally {
    await Promise.all([fs.rm(input, { force: true }), fs.rm(output, { force: true })])
  }
}

export async function getUpscaleStatus(): Promise<UpscaleStatus> {
  if (!statusCache) {
    const nextStatus: Promise<UpscaleStatus> = (async (): Promise<UpscaleStatus> => {
      const config = await getUpscaleConfig()
      const resources = await resolveEngineResources(config.model)
      if (!resources) return { engineReady: false, gpu: 'none', model: config.model }
      const gpu = await probeGpu(resources)
      return { engineReady: true, gpu, model: config.model }
    })().catch((error) => {
      statusCache = null
      throw error
    })
    statusCache = nextStatus
  }
  return statusCache as Promise<UpscaleStatus>
}

async function hashFile(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const hash = createHash('sha1')
    const stream = createReadStream(path)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

async function cacheEntries(): Promise<Array<{ path: string; bytes: number; usedAt: number }>> {
  let names: string[]
  try {
    names = await fs.readdir(upscaledRoot())
  } catch {
    return []
  }
  const entries = await Promise.all(
    names
      .filter((name) => extname(name).toLowerCase() === '.png' && !name.startsWith('.'))
      .map(async (name) => {
        const path = join(upscaledRoot(), name)
        try {
          const stat = await fs.stat(path)
          return stat.isFile() ? { path, bytes: stat.size, usedAt: stat.mtimeMs } : null
        } catch {
          return null
        }
      })
  )
  return entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
}

export async function upscaleCacheSize(): Promise<number> {
  return (await cacheEntries()).reduce((total, entry) => total + entry.bytes, 0)
}

async function pruneCache(limitMB: number, protectedPath?: string): Promise<void> {
  const limit = Math.max(0, Math.floor(limitMB * 1024 * 1024))
  const entries = await cacheEntries()
  let total = entries.reduce((sum, entry) => sum + entry.bytes, 0)
  if (total <= limit) return
  entries.sort((a, b) => a.usedAt - b.usedAt)
  for (const entry of entries) {
    if (entry.path === protectedPath) continue
    await fs.rm(entry.path, { force: true })
    total -= entry.bytes
    if (total <= limit) break
  }
}

export async function clearUpscaleCache(): Promise<number> {
  return enqueue(async () => {
    const bytes = await upscaleCacheSize()
    await fs.rm(upscaledRoot(), { recursive: true, force: true })
    await fs.mkdir(upscaledRoot(), { recursive: true })
    return bytes
  })
}

async function buildEnhancedImage(
  sourcePath: string,
  outputPath: string,
  config: UpscaleConfig,
  resources: EngineResources,
  gpu: Exclude<EngineGpu, 'none'>
): Promise<string> {
  await fs.mkdir(upscaledRoot(), { recursive: true })
  const temp = join(upscaledRoot(), `.${basename(outputPath)}.${randomUUID()}.tmp.png`)
  const needsPngInput = !NATIVE_INPUT_EXTS.has(extname(sourcePath).toLowerCase())
  const engineInput = needsPngInput
    ? join(upscaledRoot(), `.input-${randomUUID()}.tmp.png`)
    : sourcePath
  if (needsPngInput) await sharp(sourcePath, { animated: false }).png().toFile(engineInput)
  const args = [
    '-i',
    engineInput,
    '-o',
    temp,
    '-n',
    String(config.denoise),
    '-s',
    String(config.scale),
    '-m',
    resources.modelDir,
    '-f',
    'png'
  ]
  if (gpu === 'cpu-only') args.push('-g', '-1')

  try {
    await runEngine(resources.binary, args, 10 * 60_000)
    if (!(await canAccess(temp))) throw new Error('UPSCALE_OUTPUT_MISSING')
    await fs.rename(temp, outputPath)
    await pruneCache(config.cacheLimitMB, outputPath)
    return outputPath
  } finally {
    await Promise.all([
      fs.rm(temp, { force: true }),
      ...(needsPngInput ? [fs.rm(engineInput, { force: true })] : [])
    ])
  }
}

/** 增强一张磁盘图片；同一内容 + 参数的并发请求会合并。 */
export async function enhance(sourcePath: string): Promise<string> {
  const config = await getUpscaleConfig()
  const sourceHash = await hashFile(sourcePath)
  const key = createHash('sha1')
    .update(sourceHash)
    .update(config.model)
    .update(String(config.scale))
    .update(String(config.denoise))
    .digest('hex')
  const outputPath = join(upscaledRoot(), `${key}.png`)

  if (await canAccess(outputPath)) {
    const now = new Date()
    await fs.utimes(outputPath, now, now).catch(() => undefined)
    return outputPath
  }

  const active = inFlight.get(key)
  if (active) return active
  const promise = (async () => {
    // 能力探测本身也走串行队列，须在增强任务入队前完成，避免队列内嵌套等待。
    const [resources, status] = await Promise.all([
      resolveEngineResources(config.model),
      getUpscaleStatus()
    ])
    const gpu = status.gpu
    if (!resources || !status.engineReady || gpu === 'none') {
      throw new Error('UPSCALE_ENGINE_NOT_READY')
    }
    return enqueue(() => buildEnhancedImage(sourcePath, outputPath, config, resources, gpu))
  })().finally(() => {
    inFlight.delete(key)
  })
  inFlight.set(key, promise)
  return promise
}

/**
 * 确认一张阅读页的增强状态。enhance() 命中缓存时只做轻量读取，未命中时与
 * comic:// 图片请求共享 inFlight 任务，避免状态确认重复运行引擎。
 */
async function peekUpscale(sourcePath: unknown): Promise<UpscalePeekResult> {
  if (typeof sourcePath !== 'string' || !sourcePath) {
    return { status: 'failed', error: 'INVALID_UPSCALE_SOURCE' }
  }
  const config = await getUpscaleConfig()
  if (!config.enabled) return { status: '0' }
  try {
    const outputPath = await enhance(sourcePath)
    if (outputPath === sourcePath) {
      return { status: 'failed', error: 'enhance() 返回原图路径' }
    }
    return { status: '1' }
  } catch (error) {
    return { status: 'failed', error: error instanceof Error ? error.message : String(error) }
  }
}

function disposeWorker(): void {
  if (worker) worker.kill()
  worker = null
  const error = new Error('UPSCALE_WORKER_DISPOSED')
  for (const pending of workerPending.values()) pending.reject(error)
  workerPending.clear()
}

export function setupUpscale(): void {
  if (setupDone) return
  setupDone = true
  ipcMain.handle('upscale:getConfig', async (): Promise<UpscaleConfig> => getUpscaleConfig())
  ipcMain.handle('upscale:setConfig', async (_event, patch: unknown): Promise<UpscaleConfig> =>
    setUpscaleConfig(patch)
  )
  ipcMain.handle('upscale:status', async (): Promise<UpscaleStatus> => getUpscaleStatus())
  ipcMain.handle('upscale:clearCache', async (): Promise<number> => clearUpscaleCache())
  ipcMain.handle('upscale:cacheSize', async (): Promise<number> => upscaleCacheSize())
  ipcMain.handle('upscale:peek', async (_event, sourcePath: unknown): Promise<UpscalePeekResult> =>
    peekUpscale(sourcePath)
  )
  app.once('before-quit', disposeWorker)
}

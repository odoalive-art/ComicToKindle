import { app, ipcMain, safeStorage } from 'electron'
import { join, extname, relative, sep, dirname, basename } from 'path'
import { promises as fs } from 'fs'
import { createHash } from 'crypto'
import { execFile } from 'child_process'
import sevenBin from '7zip-bin'
import { isDocumentFile, prepareDocument } from './document'

/**
 * 压缩包来源层：用内置 7-Zip 把 CBZ/ZIP/CBR/RAR/7z 解出图片到缓存目录，供阅读器、
 * 封面、转换流水线共用。设计要点：
 *
 *   - 解压后端 = 内置 7za（7zip-bin 打包各平台二进制），支持加密 zip（ZipCrypto/AES）、
 *     CBR(rar)、7z；打包时需在 electron-builder asarUnpack 放行该二进制。
 *   - 缓存：解出的图片落 userData/extracted/<hash>/，hash = sha1(所有分卷的 路径+mtime+size)，
 *     源包（任一分卷）变更自然产生新缓存；完成后写 .manifest.json（按阅读顺序的相对路径），
 *     存在即视为缓存完整，避免重复解压。
 *   - 分卷：支持多卷压缩包——7z/zip 数字分卷（name.7z.001/.002…）、RAR 新式（name.partN.rar）、
 *     RAR 旧式（name.rar + name.r00/.r01…）。库视图只展示「入口卷」（.001 / .part1.rar / .rar），
 *     续卷在扫描时隐藏；解压只把入口路径喂给 7za，由其自动拼接同目录其余分卷。
 *   - 密码：共享密码池，每个密码经 safeStorage 加密存 settings.json 的 archivePasswords。
 *     解压加密包时逐个试，命中提到队首；全不中返回 needs-password，由 renderer 弹框补录。
 */

/**
 * 统一调用内置 7za：**主动关闭子进程 stdin**——遇到加密包时 7za 会打印 "Enter password:"
 * 并阻塞读 stdin，execFile 默认不关闭 stdin 会令其永久挂起；关闭后读到 EOF 即快速失败。
 * 可选 timeout 作为兜底（到时杀进程）。
 */
function run7za(
  args: string[],
  opts: { maxBuffer?: number; timeout?: number } = {}
): Promise<{ stdout: string }> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      bin7za(),
      args,
      { maxBuffer: opts.maxBuffer ?? 64 * 1024 * 1024, timeout: opts.timeout },
      (err, stdout) => {
        if (err) reject(err)
        else resolve({ stdout })
      }
    )
    child.stdin?.end()
  })
}

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'])
const ARCHIVE_EXTS = new Set(['.cbz', '.zip', '.cbr', '.rar', '.7z'])

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const naturalSort = (a: string, b: string): number => collator.compare(a, b)

const isImageName = (name: string): boolean => IMAGE_EXTS.has(extname(name).toLowerCase())

// ---------- 分卷压缩包 ----------
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

interface SplitInfo {
  /** 是分卷的某一部分（数字分卷 / RAR 续卷） */
  part: boolean
  /** 是分卷入口（第一卷：.001 / .part1.rar）。旧式 RAR 入口是主 .rar，故不在此判定 */
  first: boolean
}

/**
 * 判定文件名是否为分卷压缩包的一部分。覆盖：
 *   - 数字分卷  name.7z.001 / name.zip.002 / name.cbz.003 …（入口 = .001）
 *   - RAR 新式  name.part1.rar / name.part01.rar …（入口 = part1）
 *   - RAR 旧式续卷  name.r00 / name.r01 …（入口是主 name.rar，不属续卷）
 */
function splitInfo(name: string): SplitInfo {
  const lower = name.toLowerCase()
  const numbered = lower.match(/\.(?:7z|zip|cbz|rar|cbr)\.(\d{2,})$/)
  if (numbered) return { part: true, first: parseInt(numbered[1], 10) === 1 }
  const partRar = lower.match(/\.part(\d+)\.rar$/)
  if (partRar) return { part: true, first: parseInt(partRar[1], 10) === 1 }
  if (/\.r\d{2}$/.test(lower)) return { part: true, first: false } // 旧式 RAR 续卷
  return { part: false, first: false }
}

/** 单档归档或分卷入口 = 应作为一卷展示、可作为解压入口 */
export const isArchiveFile = (name: string): boolean => {
  const s = splitInfo(name)
  if (s.part) return s.first
  return ARCHIVE_EXTS.has(extname(name).toLowerCase())
}

/** 分卷的非入口续卷（.002…/.rNN）——库视图应隐藏、不单独解压 */
export const isSplitContinuation = (name: string): boolean => {
  const s = splitInfo(name)
  return s.part && !s.first
}

/** 列出某入口卷在同目录下的全部分卷（含自身，自然排序）；单档归档返回自身 */
export async function splitSiblings(filePath: string): Promise<string[]> {
  const dir = dirname(filePath)
  const name = basename(filePath)
  const lower = name.toLowerCase()
  let groupRe: RegExp | null = null

  const numbered = lower.match(/^(.*\.(?:7z|zip|cbz|rar|cbr))\.\d{2,}$/)
  const partRar = lower.match(/^(.*)\.part\d+\.rar$/)
  if (numbered) {
    groupRe = new RegExp(`^${escapeRe(numbered[1])}\\.\\d{2,}$`, 'i')
  } else if (partRar) {
    groupRe = new RegExp(`^${escapeRe(partRar[1])}\\.part\\d+\\.rar$`, 'i')
  } else if (/\.rar$/i.test(lower) || /\.r\d{2}$/.test(lower)) {
    const base = escapeRe(name.replace(/\.(rar|r\d{2})$/i, ''))
    groupRe = new RegExp(`^${base}\\.(rar|r\\d{2})$`, 'i')
  }
  if (!groupRe) return [filePath]

  const entries = await fs.readdir(dir).catch(() => [] as string[])
  const matched = entries
    .filter((n) => groupRe!.test(n))
    .sort(naturalSort)
    .map((n) => join(dir, n))
  return matched.length > 0 ? matched : [filePath]
}

/** 打包进 asar 后 7za 二进制位于 app.asar.unpacked，需替换路径 */
function bin7za(): string {
  return sevenBin.path7za.replace('app.asar', 'app.asar.unpacked')
}

export function extractedRoot(): string {
  return join(app.getPath('userData'), 'extracted')
}

// 清空压缩包解压缓存（CBZ/ZIP/RAR/7z 解出的图）。属可重建的「转换准备缓存」，
// 应用启动时清空，避免堆积；清后首次读压缩包卷会重新解压。
export async function clearExtractedCache(): Promise<void> {
  await fs.rm(extractedRoot(), { recursive: true, force: true }).catch(() => {})
}

// ---------- 设置 / 密码池 ----------
const settingsFile = (): string => join(app.getPath('userData'), 'settings.json')

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

/** 读出已记住的密码（解密） */
async function loadPasswordPool(): Promise<string[]> {
  const settings = await readSettings()
  const raw = settings.archivePasswords
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string') continue
    try {
      if (safeStorage.isEncryptionAvailable()) {
        out.push(safeStorage.decryptString(Buffer.from(item, 'base64')))
      }
    } catch {
      /* 解密失败的条目跳过 */
    }
  }
  return out
}

/** 把密码写入池（去重 + 提到队首），加密存储 */
async function rememberPassword(password: string): Promise<void> {
  if (!password || !safeStorage.isEncryptionAvailable()) return
  const pool = await loadPasswordPool()
  const next = [password, ...pool.filter((p) => p !== password)]
  const encrypted = next.map((p) => safeStorage.encryptString(p).toString('base64'))
  await patchSettings({ archivePasswords: encrypted })
}

// ---------- 缓存 ----------
async function cacheDirFor(filePath: string): Promise<string> {
  // 分卷包把所有分卷的指纹纳入 key，任一分卷变更即失效；单档归档只含自身
  const parts = await splitSiblings(filePath)
  const fingerprints: string[] = []
  for (const p of parts) {
    const stat = await fs.stat(p)
    fingerprints.push(`${p}:${stat.mtimeMs}:${stat.size}`)
  }
  const hash = createHash('sha1').update(fingerprints.join('|')).digest('hex')
  return join(extractedRoot(), hash)
}

const manifestPath = (cacheDir: string): string => join(cacheDir, '.manifest.json')

interface CacheManifest {
  images: string[] // 按阅读顺序的相对路径
}

/** 缓存完整则返回按阅读顺序的图片绝对路径，否则 null */
export async function getCachedImages(filePath: string): Promise<string[] | null> {
  try {
    const dir = await cacheDirFor(filePath)
    const manifest = JSON.parse(await fs.readFile(manifestPath(dir), 'utf-8')) as CacheManifest
    if (Array.isArray(manifest.images) && manifest.images.length > 0) {
      return manifest.images.map((rel) => join(dir, rel))
    }
    return null
  } catch {
    return null
  }
}

/** 递归收集目录下所有图片相对路径，按自然顺序（全路径）排序 */
async function collectExtractedImages(dir: string): Promise<string[]> {
  const out: string[] = []
  async function walk(current: string): Promise<void> {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const e of entries) {
      if (e.name.startsWith('.')) continue
      const full = join(current, e.name)
      if (e.isDirectory()) await walk(full)
      else if (e.isFile() && isImageName(e.name)) out.push(full)
    }
  }
  await walk(dir)
  return out
    .map((p) => relative(dir, p))
    .sort((a, b) => naturalSort(a.split(sep).join('/'), b.split(sep).join('/')))
}

// ---------- 7za 调用 ----------
interface EntryInfo {
  /** 包内图片条目数 */
  imageCount: number
  /** 是否含加密条目（标准 zip 加密头不加密，可不带密码列出） */
  encrypted: boolean
  /** 列表本身失败（如 7z 加密头），需密码才能列 */
  listFailed: boolean
}

/** 不带密码列出包内条目，拿图片数 + 加密标志 */
export async function inspectArchive(filePath: string): Promise<EntryInfo> {
  try {
    const { stdout } = await run7za(['l', '-slt', '-sccUTF-8', filePath], {
      timeout: 30_000
    })
    let imageCount = 0
    let encrypted = false
    let curPath: string | null = null
    for (const line of stdout.split(/\r?\n/)) {
      if (line.startsWith('Path = ')) {
        curPath = line.slice(7)
      } else if (line.startsWith('Encrypted = ')) {
        if (curPath && isImageName(curPath) && line.slice(12).trim() === '+') encrypted = true
        if (curPath && isImageName(curPath)) imageCount++ // Encrypted 行随每个文件条目出现
      }
    }
    // 明文条目没有 Encrypted 行，需另数一遍图片条目
    if (imageCount === 0) {
      for (const line of stdout.split(/\r?\n/)) {
        if (line.startsWith('Path = ') && isImageName(line.slice(7))) imageCount++
      }
    }
    return { imageCount, encrypted, listFailed: false }
  } catch {
    // 列表失败：多为 7z 加密头，需密码
    return { imageCount: 0, encrypted: true, listFailed: true }
  }
}

export type ProgressCb = (percent: number) => void

/**
 * 流式解压：-bsp1 让 7za 把百分比写到 stdout（形如 " 37%"，以 \r/退格刷新），
 * 逐块解析末位百分比回传，供 renderer 显示进度条。同样关闭 stdin 防加密挂起。
 */
function extract7za(args: string[], onProgress?: ProgressCb): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = execFile(bin7za(), args, { maxBuffer: 64 * 1024 * 1024 }, (err) => {
      if (err) reject(err)
      else resolve()
    })
    child.stdin?.end()
    if (onProgress) {
      let last = -1
      child.stdout?.on('data', (buf: Buffer) => {
        const m = buf.toString().match(/(\d+)%/g)
        if (!m) return
        const pct = parseInt(m[m.length - 1], 10)
        if (pct !== last && pct >= 0 && pct <= 100) {
          last = pct
          onProgress(pct)
        }
      })
    }
  })
}

/** 解压全部到缓存目录，写 manifest，返回图片绝对路径 */
async function extractAll(
  filePath: string,
  password?: string,
  onProgress?: ProgressCb
): Promise<string[]> {
  const dir = await cacheDirFor(filePath)
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  await fs.mkdir(dir, { recursive: true })
  const args = ['x', '-y', '-bsp1', `-o${dir}`]
  if (password) args.push(`-p${password}`)
  args.push(filePath)
  await extract7za(args, onProgress)
  const images = await collectExtractedImages(dir)
  if (images.length === 0) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    throw new Error('NO_IMAGES')
  }
  const manifest: CacheManifest = { images }
  await fs.writeFile(manifestPath(dir), JSON.stringify(manifest), 'utf-8')
  return images.map((rel) => join(dir, rel))
}

export type PrepareStatus = 'ready' | 'needs-password' | 'error'

export interface PrepareResult {
  status: PrepareStatus
  message?: string
  /** ready 时回传页数 */
  pageCount?: number
}

/**
 * 确保某压缩包已解出到缓存（幂等）。
 * 加密包会逐个试已记住的密码；全不中返回 needs-password 让 renderer 补录。
 */
export async function prepareArchive(
  filePath: string,
  onProgress?: ProgressCb
): Promise<PrepareResult> {
  if (isDocumentFile(filePath)) {
    try {
      const images = await prepareDocument(filePath, onProgress)
      return { status: 'ready', pageCount: images.length }
    } catch (err) {
      console.error('[prepareDocument] failed:', filePath, err)
      return { status: 'error', message: (err as Error).message }
    }
  }

  const cached = await getCachedImages(filePath)
  if (cached) return { status: 'ready', pageCount: cached.length }

  let info: EntryInfo
  try {
    info = await inspectArchive(filePath)
  } catch {
    return { status: 'error', message: 'INSPECT_FAILED' }
  }

  // 不加密：直接解
  if (!info.encrypted && !info.listFailed) {
    if (info.imageCount === 0) return { status: 'error', message: 'NO_IMAGES' }
    try {
      const images = await extractAll(filePath, undefined, onProgress)
      return { status: 'ready', pageCount: images.length }
    } catch (err) {
      return { status: 'error', message: (err as Error).message }
    }
  }

  // 加密：逐个试密码池。直接尝试解压（而非先 7za t 整包校验再解压），
  // 省去一整遍读取——进度从解压一开始就有，密码错则 7za 快速失败转下一个。
  const pool = await loadPasswordPool()
  for (const pw of pool) {
    try {
      const images = await extractAll(filePath, pw, onProgress)
      await rememberPassword(pw) // 命中提到队首
      return { status: 'ready', pageCount: images.length }
    } catch (err) {
      // 解压成功但无图 = 真错误，不再试其它密码；其余失败多为密码不对，继续
      if ((err as Error).message === 'NO_IMAGES') {
        return { status: 'error', message: 'NO_IMAGES' }
      }
    }
  }
  return { status: 'needs-password' }
}

/** 用用户输入的密码解锁；正确则解压（可选记住），错误返回 needs-password */
export async function unlockArchive(
  filePath: string,
  password: string,
  remember: boolean,
  onProgress?: ProgressCb
): Promise<PrepareResult> {
  if (isDocumentFile(filePath)) {
    return prepareArchive(filePath, onProgress)
  }

  // 直接解压（省去单独 7za t 整包校验那一遍，进度立即开始）。
  try {
    const images = await extractAll(filePath, password, onProgress)
    if (remember) await rememberPassword(password)
    return { status: 'ready', pageCount: images.length }
  } catch (err) {
    // 解压成功但无图 = 真错误；其余失败基本是密码不对
    if ((err as Error).message === 'NO_IMAGES') {
      return { status: 'error', message: 'NO_IMAGES' }
    }
    return { status: 'needs-password', message: 'WRONG_PASSWORD' }
  }
}

// ---------- IPC ----------
export function setupArchive(): void {
  // iCloud 同步等场景会丢失 7za 二进制的执行位（spawn EACCES），启动时幂等补回。
  fs.chmod(bin7za(), 0o755).catch((err) => console.error('[archive] chmod 7za failed:', err))

  ipcMain.handle('archive:prepare', async (event, filePath: string): Promise<PrepareResult> => {
    const emit = (percent: number): void =>
      event.sender.send('archive:progress', { filePath, percent })
    return prepareArchive(filePath, emit)
  })

  ipcMain.handle(
    'archive:unlock',
    async (event, filePath: string, password: string, remember: boolean): Promise<PrepareResult> => {
      const emit = (percent: number): void =>
        event.sender.send('archive:progress', { filePath, percent })
      return unlockArchive(filePath, password, remember, emit)
    }
  )
}

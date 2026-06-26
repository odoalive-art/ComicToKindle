import { utilityProcess, type UtilityProcess } from 'electron'
import { join } from 'path'
import type { ConvertOptions, ConvertResult, PreviewPageResult } from './convert'
import type { ConvertJobInput, HostToWorker, WorkerToHost } from './convert-ipc'

/**
 * 转换子进程（utilityProcess）的主进程侧管理器。
 *
 * 懒启动一个长存活的子进程承载所有转换/预览图像管线；本模块只负责进程生命周期、
 * 请求-响应路由（按 id）与进度转发。子进程崩溃时自动重启，并让所有在途请求失败。
 */

type ProgressFn = (percent: number, message: string) => void

interface Pending {
  resolve: (value: unknown) => void
  reject: (err: Error) => void
  onProgress?: ProgressFn
}

let child: UtilityProcess | null = null
const pending = new Map<string, Pending>()
let seq = 0

const nextId = (): string => `${Date.now()}-${seq++}`

function spawn(): UtilityProcess {
  // out/main/convert-worker.js 与 index.js 同目录（electron.vite 多入口输出）
  const workerPath = join(__dirname, 'convert-worker.js')
  // stdio[0]（stdin）对 utilityProcess 必须为 'ignore'；stdout/stderr 用 pipe 转主进程日志
  const proc = utilityProcess.fork(workerPath, [], { stdio: ['ignore', 'pipe', 'pipe'] })

  proc.stdout?.on('data', (d: Buffer) => console.log('[convert-worker]', d.toString().trimEnd()))
  proc.stderr?.on('data', (d: Buffer) => console.error('[convert-worker]', d.toString().trimEnd()))

  proc.on('message', (msg: WorkerToHost) => {
    const p = pending.get(msg.id)
    switch (msg.type) {
      case 'progress':
        p?.onProgress?.(msg.percent, msg.message)
        break
      case 'log':
        console.log('[convert]', msg.message)
        break
      case 'done':
        pending.delete(msg.id)
        p?.resolve(msg.result)
        break
      case 'previewResult':
        pending.delete(msg.id)
        p?.resolve(msg.result)
        break
      case 'pdfRendered':
        pending.delete(msg.id)
        p?.resolve(msg.relImages)
        break
      case 'error':
        pending.delete(msg.id)
        p?.reject(new Error(msg.message))
        break
    }
  })

  proc.on('exit', (code) => {
    if (child === proc) child = null
    // 子进程意外退出：让所有在途请求失败，避免 handler 永久挂起
    if (pending.size > 0) {
      const err = new Error(`转换子进程已退出（code ${code}）`)
      for (const [, p] of pending) p.reject(err)
      pending.clear()
    }
  })

  return proc
}

function ensureChild(): UtilityProcess {
  if (!child) child = spawn()
  return child
}

function send(msg: HostToWorker): void {
  ensureChild().postMessage(msg)
}

// id 由调用方提供（用源卷路径，天然唯一且与 cancelConvert 同键），便于按卷取消
export function runConvert(
  id: string,
  input: ConvertJobInput,
  onProgress?: ProgressFn
): Promise<ConvertResult> {
  return new Promise<ConvertResult>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject, onProgress })
    send({ type: 'convert', id, input })
  })
}

export function runPreview(
  srcPath: string,
  pageIndex: number,
  options?: ConvertOptions
): Promise<PreviewPageResult> {
  const id = nextId()
  return new Promise<PreviewPageResult>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject })
    send({ type: 'preview', id, srcPath, pageIndex, options })
  })
}

// 在子进程里把 PDF 整本光栅化为 PNG（CPU 重活，移出主进程避免准备期卡顿）。
// dir 为缓存目录（主进程算好），返回相对 dir 的页路径列表（'pages/NNNN.png'）。
export function runRenderPdf(
  filePath: string,
  dir: string,
  onProgress?: ProgressFn
): Promise<string[]> {
  const id = nextId()
  return new Promise<string[]>((resolve, reject) => {
    pending.set(id, { resolve: resolve as (v: unknown) => void, reject, onProgress })
    send({ type: 'renderPdf', id, filePath, dir })
  })
}

// 取消由 runConvert 返回的某个在途任务。仅子进程已启动时有意义。
export function cancelConvert(id: string): void {
  if (child) child.postMessage({ type: 'cancel', id } satisfies HostToWorker)
}

// 应用退出时杀掉子进程，避免遗留孤儿进程
export function disposeConvertHost(): void {
  if (child) {
    child.kill()
    child = null
  }
}

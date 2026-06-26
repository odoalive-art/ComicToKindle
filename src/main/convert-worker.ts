import { convertMangaToEPUB, previewConvertPage } from './convert'
import { renderPdfPages } from './pdf-render'
import type { HostToWorker, WorkerToHost } from './convert-ipc'

/**
 * 转换子进程入口（Electron utilityProcess）。
 *
 * 把 CPU 密集的 sharp 图像管线（灰度/缩放/mozjpeg/双页拆分）整体移出主进程，
 * 跑在独立的 V8 / event loop / libuv 线程池里——转换期间主进程几乎空闲，
 * comic:// 读图、库扫描等不再被线程池争用阻塞。
 *
 * 与主进程的通信走 process.parentPort（见 convert-ipc.ts 的消息协议）。
 */

const parentPort = process.parentPort

// 已请求取消的任务 id（转换在下一张图/下一卷边界处通过 checkCancelled 中止）
const cancelledIds = new Set<string>()

function post(msg: WorkerToHost): void {
  parentPort.postMessage(msg)
}

async function handleConvert(msg: Extract<HostToWorker, { type: 'convert' }>): Promise<void> {
  const { id, input } = msg
  try {
    const result = await convertMangaToEPUB({
      imagePaths: input.imagePaths,
      outputDir: input.outputDir,
      title: input.title,
      author: input.author,
      options: input.options,
      onProgress: (percent, message) => post({ type: 'progress', id, percent, message }),
      onLog: (message) => post({ type: 'log', id, message }),
      checkCancelled: () => cancelledIds.has(id)
    })
    post({ type: 'done', id, result })
  } catch (err) {
    post({ type: 'error', id, message: (err as Error).message })
  } finally {
    cancelledIds.delete(id)
  }
}

async function handlePreview(msg: Extract<HostToWorker, { type: 'preview' }>): Promise<void> {
  const { id, srcPath, pageIndex, options } = msg
  try {
    const result = await previewConvertPage(srcPath, pageIndex, options)
    post({ type: 'previewResult', id, result })
  } catch (err) {
    post({ type: 'error', id, message: (err as Error).message })
  }
}

async function handleRenderPdf(msg: Extract<HostToWorker, { type: 'renderPdf' }>): Promise<void> {
  const { id, filePath, dir } = msg
  try {
    const relImages = await renderPdfPages(filePath, dir, (percent) =>
      post({ type: 'progress', id, percent, message: '' })
    )
    post({ type: 'pdfRendered', id, relImages })
  } catch (err) {
    post({ type: 'error', id, message: (err as Error).message })
  }
}

parentPort.on('message', (e: { data: HostToWorker }) => {
  const msg = e.data
  switch (msg.type) {
    case 'convert':
      void handleConvert(msg)
      break
    case 'preview':
      void handlePreview(msg)
      break
    case 'renderPdf':
      void handleRenderPdf(msg)
      break
    case 'cancel':
      cancelledIds.add(msg.id)
      break
  }
})

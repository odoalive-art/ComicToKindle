import { promises as fs } from 'fs'
import { dirname, join, sep } from 'path'
import { createRequire } from 'module'
import { createCanvas } from '@napi-rs/canvas'

/**
 * PDF 整本光栅化的纯渲染核心（pdfjs + @napi-rs/canvas）。
 *
 * 刻意不依赖 Electron `app`：缓存目录由调用方（主进程 document.ts）算好后传入，
 * 故本模块可在转换子进程（utilityProcess）里运行——把逐页 render 这段 CPU 重活
 * 移出主进程，避免大 PDF 转换前的「准备期」堵死主进程 event loop。
 */

const nodeRequire = createRequire(__filename)

async function loadPdfJs(): Promise<typeof import('pdfjs-dist/legacy/build/pdf.mjs')> {
  return import('pdfjs-dist/legacy/build/pdf.mjs')
}

function pdfAssetDir(name: 'standard_fonts' | 'cmaps' | 'wasm'): string {
  const root = dirname(nodeRequire.resolve('pdfjs-dist/package.json'))
  return join(root, name) + sep
}

export type RenderProgressCb = (percent: number) => void

/**
 * 把 PDF 逐页渲染为 PNG，写入 `dir/pages/NNNN.png`，返回相对 `dir` 的页路径列表
 * （'pages/NNNN.png'）。失败会清掉 `dir` 并抛出。manifest 写入由调用方负责。
 */
export async function renderPdfPages(
  filePath: string,
  dir: string,
  onProgress?: RenderProgressCb
): Promise<string[]> {
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  const pagesDir = join(dir, 'pages')
  await fs.mkdir(pagesDir, { recursive: true })

  const pdfjs = await loadPdfJs()
  const data = new Uint8Array(await fs.readFile(filePath))
  const task = pdfjs.getDocument({
    data,
    disableWorker: true,
    useSystemFonts: true,
    standardFontDataUrl: pdfAssetDir('standard_fonts'),
    cMapUrl: pdfAssetDir('cmaps'),
    cMapPacked: true,
    wasmUrl: pdfAssetDir('wasm')
  } as never)
  const doc = await task.promise
  const relImages: string[] = []

  try {
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
      const canvasContext = canvas.getContext('2d')
      // pdfjs v6：用 node canvas 的 2D context 渲染时必须显式传 canvas:null，
      // 否则 pdfjs 会把 canvasContext.canvas 当 DOM canvas 处理而报错。
      await page.render({ canvas: null, canvasContext, viewport } as never).promise
      const rel = join('pages', `${String(i).padStart(4, '0')}.png`)
      await fs.writeFile(join(dir, rel), canvas.toBuffer('image/png'))
      relImages.push(rel)
      onProgress?.(Math.round((i / doc.numPages) * 100))
    }
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    throw err
  } finally {
    await task.destroy() // pdfjs v6：销毁在 loadingTask 上（doc 无 destroy），否则 finally 抛错吞掉结果
  }

  return relImages
}

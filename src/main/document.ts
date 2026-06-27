import { app } from 'electron'
import { execFile } from 'child_process'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import { dirname, extname, join, normalize, relative, resolve, sep } from 'path'
import { createRequire } from 'module'
import { XMLParser } from 'fast-xml-parser'
import { createCanvas } from '@napi-rs/canvas'
import sevenBin from '7zip-bin'
import { runRenderPdf } from './convert-host'

/**
 * 文档来源层：把 PDF / 图片型 EPUB 转成图片页缓存，供阅读器与 Kindle 转换流水线复用。
 *
 * - PDF：用 PDF.js + @napi-rs/canvas 离线渲染为 PNG。
 * - EPUB：解包后按 OPF spine 顺序解析 XHTML 里的本地图片引用，复制成缓存页。
 *
 * 纯文本/重排版 EPUB 不在第一版支持范围内；若 spine 中找不到可用本地图片，会返回 NO_IMAGES。
 */

const nodeRequire = createRequire(__filename)
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'])
const DOCUMENT_EXTS = new Set(['.pdf', '.epub'])
const PDF_RENDER_SCALE = 2
const PDF_MAX_RENDER_PIXELS = 24_000_000
const PDF_MAX_RENDER_EDGE = 12_000

export const isDocumentFile = (name: string): boolean =>
  DOCUMENT_EXTS.has(extname(name).toLowerCase())

export function documentType(filePath: string): 'pdf' | 'epub' | null {
  const ext = extname(filePath).toLowerCase()
  if (ext === '.pdf') return 'pdf'
  if (ext === '.epub') return 'epub'
  return null
}

export function documentsRoot(): string {
  return join(app.getPath('userData'), 'documents')
}

// 清空 PDF/EPUB 页缓存（整本渲染的 PNG / 抽出的图）。属可重建的「转换准备缓存」，
// 应用启动时清空，避免堆积；清后首次转换/阅读 PDF 会重新渲染。
export async function clearDocumentsCache(): Promise<void> {
  await fs.rm(documentsRoot(), { recursive: true, force: true }).catch(() => {})
}

async function cacheDirFor(filePath: string): Promise<string> {
  const stat = await fs.stat(filePath)
  const key = `${filePath}:${stat.mtimeMs}:${stat.size}:document-v2`
  return join(documentsRoot(), createHash('sha1').update(key).digest('hex'))
}

const manifestPath = (cacheDir: string): string => join(cacheDir, '.manifest.json')

interface DocumentManifest {
  images: string[]
}

export async function getCachedDocumentImages(filePath: string): Promise<string[] | null> {
  try {
    const dir = await cacheDirFor(filePath)
    const manifest = JSON.parse(await fs.readFile(manifestPath(dir), 'utf-8')) as DocumentManifest
    if (Array.isArray(manifest.images) && manifest.images.length > 0) {
      return manifest.images.map((rel) => join(dir, rel))
    }
    return null
  } catch {
    return null
  }
}

async function writeManifest(
  dir: string,
  images: string[],
  emptyCode = 'NO_IMAGES'
): Promise<string[]> {
  if (images.length === 0) throw new Error(emptyCode)
  await fs.writeFile(
    manifestPath(dir),
    JSON.stringify({ images } satisfies DocumentManifest),
    'utf-8'
  )
  return images.map((rel) => join(dir, rel))
}

export type DocumentProgressCb = (percent: number) => void

export interface DocumentInfo {
  pageCount: number
}

export async function inspectDocument(filePath: string): Promise<DocumentInfo> {
  const cached = await getCachedDocumentImages(filePath)
  if (cached) return { pageCount: cached.length }

  const type = documentType(filePath)
  if (type === 'pdf') return inspectPdf(filePath)
  if (type === 'epub') return inspectEpub(filePath)
  return { pageCount: 0 }
}

export async function prepareDocument(
  filePath: string,
  onProgress?: DocumentProgressCb
): Promise<string[]> {
  const cached = await getCachedDocumentImages(filePath)
  if (cached) return cached

  const type = documentType(filePath)
  if (type === 'pdf') return renderPdf(filePath, onProgress)
  if (type === 'epub') return extractEpubImages(filePath, onProgress)
  throw new Error('UNSUPPORTED_DOCUMENT')
}

async function loadPdfJs(): Promise<typeof import('pdfjs-dist/legacy/build/pdf.mjs')> {
  return import('pdfjs-dist/legacy/build/pdf.mjs')
}

function pdfAssetDir(name: 'standard_fonts' | 'cmaps' | 'wasm'): string {
  const root = dirname(nodeRequire.resolve('pdfjs-dist/package.json'))
  return join(root, name) + sep
}

async function inspectPdf(filePath: string): Promise<DocumentInfo> {
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
  try {
    const doc = await task.promise
    if (doc.numPages < 1) throw new Error('PDF_NO_PAGES')
    return { pageCount: doc.numPages }
  } catch (err) {
    throw normalizeDocumentError('pdf', err)
  } finally {
    await task.destroy().catch(() => {})
  }
}

function normalizeDocumentError(type: 'pdf' | 'epub', err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err)
  const lower = message.toLowerCase()
  if (type === 'pdf') {
    if (message === 'PDF_NO_PAGES') {
      return new Error(
        'PDF_NO_PAGES: PDF 不包含可渲染页面，请检查文件内容后重试。 / The PDF contains no renderable pages. Check the file and retry.'
      )
    }
    if (message.startsWith('PDF_')) return new Error(message)
    if (lower.includes('password')) {
      return new Error(
        'PDF_PASSWORD_REQUIRED: 此 PDF 受密码保护，当前无法打开；请先移除密码后重试。 / This PDF is password-protected. Remove the password and retry.'
      )
    }
    if (
      lower.includes('invalid pdf') ||
      lower.includes('missing pdf') ||
      lower.includes('unexpected response') ||
      lower.includes('xref')
    ) {
      return new Error(
        'PDF_INVALID: PDF 已损坏或结构不完整，请用 PDF 工具重新导出后重试。 / The PDF is damaged or incomplete. Re-export it and retry.'
      )
    }
    return new Error(
      `PDF_RENDER_FAILED: PDF 页面渲染失败，请尝试重新导出或拆分 PDF 后重试。 / PDF rendering failed. Re-export or split the PDF, then retry. (${message})`
    )
  }
  if (message === 'NO_IMAGES' || message === 'EPUB_REFLOW_UNSUPPORTED') {
    return new Error(
      'EPUB_REFLOW_UNSUPPORTED: 暂不支持纯文本/重排 EPUB；请先转换为图片型 EPUB 或图片目录。 / Reflowable or text-only EPUB is not supported. Convert it to an image-based EPUB or image folder first.'
    )
  }
  if (message.startsWith('EPUB_')) return new Error(message)
  if (lower.includes('container') || lower.includes('is not archive')) {
    return new Error(
      'EPUB_INVALID: EPUB 已损坏或缺少必要目录结构，请重新导出后重试。 / The EPUB is damaged or missing required files. Re-export it and retry.'
    )
  }
  return new Error(
    `EPUB_PREPARE_FAILED: EPUB 页面准备失败，请重新导出后重试。 / EPUB preparation failed. Re-export it and retry. (${message})`
  )
}

interface PdfRenderPlan {
  pageCount: number
  needsAdaptiveRendering: boolean
}

async function inspectPdfRenderPlan(
  filePath: string,
  onProgress?: DocumentProgressCb
): Promise<PdfRenderPlan> {
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
  try {
    const doc = await task.promise
    if (doc.numPages < 1) throw new Error('PDF_NO_PAGES')
    let needsAdaptiveRendering = false
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const viewport = page.getViewport({ scale: PDF_RENDER_SCALE })
      if (
        viewport.width * viewport.height > PDF_MAX_RENDER_PIXELS ||
        viewport.width > PDF_MAX_RENDER_EDGE ||
        viewport.height > PDF_MAX_RENDER_EDGE
      ) {
        needsAdaptiveRendering = true
        break
      }
      page.cleanup()
      onProgress?.(Math.max(1, Math.round((i / doc.numPages) * 5)))
    }
    return { pageCount: doc.numPages, needsAdaptiveRendering }
  } catch (err) {
    throw normalizeDocumentError('pdf', err)
  } finally {
    await task.destroy().catch(() => {})
  }
}

function adaptivePdfScale(width: number, height: number): number {
  const pixelScale = Math.sqrt(PDF_MAX_RENDER_PIXELS / Math.max(1, width * height))
  const edgeScale = PDF_MAX_RENDER_EDGE / Math.max(1, width, height)
  const scale = Math.min(PDF_RENDER_SCALE, pixelScale, edgeScale)
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}

function shouldRetryPdfInMain(err: unknown): boolean {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase()
  return !(
    message.includes('password') ||
    message.includes('invalid pdf') ||
    message.includes('missing pdf') ||
    message.includes('xref')
  )
}

async function renderPdfAdaptive(
  filePath: string,
  dir: string,
  onProgress?: DocumentProgressCb
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
  const relImages: string[] = []
  try {
    const doc = await task.promise
    if (doc.numPages < 1) throw new Error('PDF_NO_PAGES')
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const base = page.getViewport({ scale: 1 })
      const viewport = page.getViewport({ scale: adaptivePdfScale(base.width, base.height) })
      const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
      const canvasContext = canvas.getContext('2d')
      await page.render({ canvas: null, canvasContext, viewport } as never).promise
      const rel = join('pages', `${String(i).padStart(4, '0')}.png`)
      await fs.writeFile(join(dir, rel), canvas.toBuffer('image/png'))
      canvas.width = 1
      canvas.height = 1
      relImages.push(rel)
      page.cleanup()
      onProgress?.(5 + Math.round((i / doc.numPages) * 93))
      await new Promise<void>((resolvePromise) => setImmediate(resolvePromise))
    }
    return relImages
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    throw normalizeDocumentError('pdf', err)
  } finally {
    await task.destroy().catch(() => {})
  }
}

// PDF 整本光栅化：普通页面委托转换子进程，避免大 PDF 准备期堵死主进程；检测到超大页时
// 在主进程走自适应像素上限渲染，逐页让出 event loop，避免 canvas 分配过大导致崩溃。
async function renderPdf(filePath: string, onProgress?: DocumentProgressCb): Promise<string[]> {
  const dir = await cacheDirFor(filePath)
  let lastProgress = 0
  const report = (percent: number): void => {
    lastProgress = Math.max(lastProgress, Math.min(100, percent))
    onProgress?.(lastProgress)
  }
  report(0)
  try {
    const plan = await inspectPdfRenderPlan(filePath, report)
    report(5)
    let relImages: string[]
    if (plan.needsAdaptiveRendering) {
      relImages = await renderPdfAdaptive(filePath, dir, report)
    } else {
      try {
        relImages = await runRenderPdf(filePath, dir, (percent) =>
          report(5 + Math.round((percent / 100) * 93))
        )
      } catch (err) {
        // utility process 对少数特殊字体/Canvas 环境可能失败；回退同一套 PDF.js 资源在
        // main 逐页渲染，并继续使用自适应像素上限。进度只前进、不回退。
        if (!shouldRetryPdfInMain(err)) throw err
        relImages = await renderPdfAdaptive(filePath, dir, report)
      }
    }
    const images = await writeManifest(dir, relImages, 'PDF_NO_PAGES')
    report(100)
    return images
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    throw normalizeDocumentError('pdf', err)
  }
}

/**
 * 取 PDF 封面图绝对路径（用于库网格）：整本已渲染则用首页；否则只渲染第一页缓存为
 * <hash>/cover.png（比整本渲染快得多），失败返回 null（库视图用占位图标兜底）。
 */
export async function getPdfCoverImage(filePath: string): Promise<string | null> {
  const cached = await getCachedDocumentImages(filePath)
  if (cached) return cached[0] ?? null
  const dir = await cacheDirFor(filePath)
  const coverPath = join(dir, 'cover.png')
  try {
    await fs.access(coverPath)
    return coverPath
  } catch {
    /* 尚未渲染封面，继续渲染首页 */
  }
  try {
    await renderPdfFirstPage(filePath, dir, coverPath)
    return coverPath
  } catch (err) {
    console.error('[getPdfCoverImage] render failed:', filePath, err)
    return null
  }
}

async function renderPdfFirstPage(filePath: string, dir: string, coverPath: string): Promise<void> {
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
  try {
    const page = await doc.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({
      scale: Math.min(1.5, adaptivePdfScale(base.width, base.height))
    })
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const canvasContext = canvas.getContext('2d')
    await page.render({ canvas: null, canvasContext, viewport } as never).promise
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(coverPath, canvas.toBuffer('image/png'))
  } finally {
    await task.destroy() // pdfjs v6：销毁在 loadingTask 上（doc 无 destroy），否则 finally 抛错吞掉结果
  }
}

function bin7za(): string {
  return sevenBin.path7za.replace('app.asar', 'app.asar.unpacked')
}

function run7za(
  args: string[],
  opts: { maxBuffer?: number; timeout?: number } = {}
): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = execFile(
      bin7za(),
      args,
      { maxBuffer: opts.maxBuffer ?? 64 * 1024 * 1024, timeout: opts.timeout },
      (err, stdout) => {
        if (err) reject(err)
        else resolvePromise(stdout)
      }
    )
    child.stdin?.end()
  })
}

async function inspectEpub(filePath: string): Promise<DocumentInfo> {
  const stdout = await run7za(['l', '-slt', '-sccUTF-8', filePath], { timeout: 30_000 })
  let count = 0
  for (const line of stdout.split(/\r?\n/)) {
    if (line.startsWith('Path = ') && IMAGE_EXTS.has(extname(line.slice(7)).toLowerCase())) count++
  }
  return { pageCount: count }
}

async function extractEpubImages(
  filePath: string,
  onProgress?: DocumentProgressCb
): Promise<string[]> {
  const dir = await cacheDirFor(filePath)
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  const rawDir = join(dir, 'raw')
  await fs.mkdir(rawDir, { recursive: true })

  try {
    onProgress?.(0)
    await run7za(['x', '-y', `-o${rawDir}`, filePath])
    onProgress?.(60)
    // 不再二次复制到 pages/：解包目录的原图直接作为页面缓存，manifest 按 spine 顺序
    // 记相对 dir 的路径（如 raw/OEBPS/images/001.jpg），comic:// 放行 documentsRoot 即可读。
    const ordered = await collectEpubImageFiles(rawDir)
    const relImages: string[] = []
    for (const src of ordered) {
      const stat = await fs.stat(src).catch(() => null)
      if (!stat?.isFile()) continue
      relImages.push(relative(dir, src))
    }
    onProgress?.(90)
    const images = await writeManifest(dir, relImages, 'EPUB_REFLOW_UNSUPPORTED')
    onProgress?.(100)
    return images
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    throw normalizeDocumentError('epub', err)
  }
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  removeNSPrefix: true,
  parseAttributeValue: false,
  trimValues: true
})

async function collectEpubImageFiles(root: string): Promise<string[]> {
  const containerPath = join(root, 'META-INF', 'container.xml')
  const container = xmlParser.parse(await fs.readFile(containerPath, 'utf-8')) as Record<
    string,
    unknown
  >
  const rootfile = firstArray(asObjectPath(container, ['container', 'rootfiles', 'rootfile']))[0]
  const opfRel = typeof rootfile?.['full-path'] === 'string' ? rootfile['full-path'] : null
  if (!opfRel) throw new Error('EPUB_CONTAINER_INVALID')

  const opfPath = resolveEpubHrefInside(root, root, opfRel)
  if (!opfPath) throw new Error('EPUB_CONTAINER_INVALID')
  const opfDir = dirname(opfPath)
  const opf = xmlParser.parse(await fs.readFile(opfPath, 'utf-8')) as Record<string, unknown>
  const manifestItems = firstArray(asObjectPath(opf, ['package', 'manifest', 'item']))
  const spineItems = firstArray(asObjectPath(opf, ['package', 'spine', 'itemref']))

  const byId = new Map<string, Record<string, unknown>>()
  for (const item of manifestItems) {
    const id = item.id
    if (typeof id === 'string') byId.set(id, item)
  }

  const out: string[] = []
  for (const itemRef of spineItems) {
    const idref = itemRef.idref
    if (typeof idref !== 'string') continue
    const item = byId.get(idref)
    const href = typeof item?.href === 'string' ? item.href : null
    if (!href) continue
    const mediaType = typeof item?.['media-type'] === 'string' ? item['media-type'] : ''
    if (mediaType.startsWith('image/')) {
      maybePushImage(out, root, opfDir, href)
      continue
    }
    const docPath = resolveEpubHrefInside(root, opfDir, href)
    if (!docPath) continue
    const docText = await fs.readFile(docPath, 'utf-8').catch(() => '')
    for (const imageHref of extractImageHrefs(docText)) {
      maybePushImage(out, root, dirname(docPath), imageHref)
    }
  }

  if (out.length === 0) {
    for (const item of manifestItems) {
      const mediaType = typeof item['media-type'] === 'string' ? item['media-type'] : ''
      const href = typeof item.href === 'string' ? item.href : null
      if (href && mediaType.startsWith('image/')) maybePushImage(out, root, opfDir, href)
    }
  }

  return uniqueInOrder(out)
}

function asObjectPath(root: unknown, pathParts: string[]): unknown {
  let current = root
  for (const part of pathParts) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

function firstArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item) => item && typeof item === 'object')
  if (value && typeof value === 'object') return [value as Record<string, unknown>]
  return []
}

function extractImageHrefs(xhtml: string): string[] {
  const parsed = safeParseXml(xhtml)
  const fromTree: string[] = []
  collectImageHrefsFromNode(parsed, fromTree)
  const fromRegex = [
    ...xhtml.matchAll(/<(?:img|image)\b[^>]*(?:src|href|xlink:href)=["']([^"']+)["']/gi)
  ].map((match) => match[1])
  return [...new Set([...fromTree, ...fromRegex])]
}

function safeParseXml(text: string): unknown {
  try {
    return xmlParser.parse(text)
  } catch {
    return null
  }
}

function collectImageHrefsFromNode(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    node.forEach((item) => collectImageHrefsFromNode(item, out))
    return
  }
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  for (const key of ['src', 'href']) {
    const value = obj[key]
    if (typeof value === 'string' && IMAGE_EXTS.has(extname(stripHref(value)).toLowerCase())) {
      out.push(value)
    }
  }
  for (const value of Object.values(obj)) collectImageHrefsFromNode(value, out)
}

function stripHref(href: string): string {
  return href.split('#')[0].split('?')[0]
}

function resolveEpubHref(baseDir: string, href: string): string {
  const stripped = stripHref(href)
  let decoded = stripped
  try {
    decoded = decodeURIComponent(stripped)
  } catch {
    /* 保留原始路径 */
  }
  return normalize(resolve(baseDir, decoded))
}

function isWithinRoot(rootPath: string, candidate: string): boolean {
  const root = resolve(rootPath)
  const abs = resolve(candidate)
  return abs === root || abs.startsWith(root + sep)
}

function resolveEpubHrefInside(epubRoot: string, baseDir: string, href: string): string | null {
  const resolved = resolveEpubHref(baseDir, href)
  return isWithinRoot(epubRoot, resolved) ? resolved : null
}

function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    if (seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function maybePushImage(out: string[], epubRoot: string, baseDir: string, href: string): void {
  const resolved = resolveEpubHrefInside(epubRoot, baseDir, href)
  if (!resolved) return
  if (!IMAGE_EXTS.has(extname(resolved).toLowerCase())) return
  out.push(resolved)
}

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

async function writeManifest(dir: string, images: string[]): Promise<string[]> {
  if (images.length === 0) throw new Error('NO_IMAGES')
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
  const doc = await task.promise
  const pageCount = doc.numPages
  await task.destroy() // pdfjs v6：销毁在 loadingTask 上（doc 无 destroy），否则 finally 抛错吞掉结果
  return { pageCount }
}

// PDF 整本光栅化：缓存目录/manifest 留在主进程，逐页 render（pdfjs CPU 重活）委托给
// 转换子进程（convert-host.runRenderPdf），避免大 PDF 准备期堵死主进程 event loop。
async function renderPdf(filePath: string, onProgress?: DocumentProgressCb): Promise<string[]> {
  const dir = await cacheDirFor(filePath)
  const relImages = await runRenderPdf(filePath, dir, (percent) => onProgress?.(percent))
  return writeManifest(dir, relImages)
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
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    const canvasContext = canvas.getContext('2d')
    await page.render({ canvasContext, viewport } as never).promise
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
    onProgress?.(100)
    return writeManifest(dir, relImages)
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
    throw err
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

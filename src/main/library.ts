import { app, dialog, ipcMain, protocol, BrowserWindow, shell } from 'electron'
import { join, extname, resolve, dirname, basename, sep } from 'path'
import { promises as fs } from 'fs'
import { createHash, randomUUID } from 'crypto'
import sharp from 'sharp'
import {
  getCachedImages,
  prepareArchive,
  inspectArchive,
  extractedRoot,
  isArchiveFile,
  isSplitContinuation,
  splitSiblings
} from './archive'
import {
  documentType,
  documentsRoot,
  getCachedDocumentImages,
  getPdfCoverImage,
  inspectDocument,
  isDocumentFile,
  prepareDocument
} from './document'

/**
 * 漫画库数据层：目录扫描 + 封面/图片服务 + 库根目录持久化。
 *
 * 扫描模型（见 classifyDir / listChildren）：不预设固定层级，递归判定每个目录的角色——
 *   直接含图片或 cbz/pdf/epub 单文件 = 「卷」(可读单元，其下单话子文件夹按阅读顺序递归收图)；
 *   自身无漫画但子树里有 = 「部」(可下钻容器，可任意深嵌套)；整棵子树无漫画则不展示。
 *   部文件夹命名通常为 `[作者] 标题`，据此解析作者/标题（可被 seriesMeta 覆盖）。
 */

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'])
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.bmp': 'image/bmp'
}

export interface LibrarySeries {
  id: string
  path: string
  name: string
  title: string
  author: string | null
  volumeCount: number
  coverUrl: string | null
}

export interface LibraryVolume {
  id: string
  path: string
  name: string
  title: string
  kind: 'folder' | 'file'
  sourceType: 'folder' | 'archive' | 'pdf' | 'epub'
  pageCount: number
  coverUrl: string | null
  /** 压缩包卷册：加密且尚未解锁缓存（需密码） */
  locked?: boolean
}

/**
 * 库根目录的一个顶层项：要么是一本「书(卷册)」，要么是一个「部文件夹」(装了多卷)。
 * 判定规则见 scanLibrary：图片直接铺在文件夹里 / 散落的 cbz·pdf·epub = 书；
 * 文件夹里装着多个卷(子文件夹/压缩包/文档) = 部文件夹。
 */
export type LibraryEntry =
  | (LibrarySeries & { type: 'folder' })
  | (LibraryVolume & { type: 'book'; author: string | null })

// 自然排序：2.jpg 排在 10.jpg 前面
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const naturalSort = (a: string, b: string): number => collator.compare(a, b)

const isImage = (name: string): boolean => IMAGE_EXTS.has(extname(name).toLowerCase())
/** 可作为一卷展示的单文件：可解压归档（含分卷入口）或显示型 pdf/epub */
const isVolumeFile = (name: string): boolean => isArchiveFile(name) || isDocumentFile(name)
const isHidden = (name: string): boolean => name.startsWith('.')

// 当前库根目录，用于 comic:// 协议的越权访问校验
let currentRoot: string | null = null

export interface LibraryManifest {
  version: 1
  libraryId: string
  name: string
  createdAt: string
  updatedAt: string
  series: SeriesNode[]
  ungrouped: string[]
}

export interface SeriesNode {
  id: string
  title: string
  author: string | null
  bookIds: string[]
  createdAt: string
}

export interface BookRecord {
  id: string
  sourceType: 'archive' | 'pdf' | 'epub' | 'folder'
  sourceFile: string | null
  displayName: string
  originalName: string
  importedFrom: string
  pageCount: number
  addedAt: string
  seriesTitleHint: string | null
  seriesAuthorHint: string | null
}

export interface ImportCandidate {
  sourcePath: string
  sourceType: BookRecord['sourceType']
  displayName: string
}

export interface ImportScanResult {
  candidates: ImportCandidate[]
  skipped: Array<{ path: string; reason: string }>
}

export interface ImportOptions {
  deleteSourceAfter?: boolean
}

export interface BookView {
  id: string
  sourceType: BookRecord['sourceType']
  displayName: string
  pageCount: number
  coverUrl: string | null
  locked: boolean
  sourceVolumePath: string
}

export interface TrashBookView {
  trashId: string
  bookId: string
  displayName: string
  originalName: string
  sourceType: BookRecord['sourceType']
  seriesTitleHint: string | null
  seriesAuthorHint: string | null
  pageCount: number
}

export interface LibraryView {
  series: Array<SeriesNode & { coverUrl: string | null; volumeCount: number }>
  ungrouped: BookView[]
}

// ---------- 设置持久化 ----------
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

// ---------- App 独占 .ctklib 库包 ----------
const MANAGED_EXT = '.ctklib'

function isManagedLibraryPath(root: string | null): boolean {
  return !!root && extname(root).toLowerCase() === MANAGED_EXT
}

function libraryRoot(): string | null {
  return currentRoot
}

function booksDir(): string {
  const root = libraryRoot()
  if (!root) throw new Error('NO_ROOT')
  return join(root, 'books')
}

function bucketDir(id: string): string {
  return join(booksDir(), id)
}

function trashDir(): string {
  const root = libraryRoot()
  if (!root) throw new Error('NO_ROOT')
  return join(root, 'trash')
}

function bucketSourcePath(rec: BookRecord): string {
  const dir = bucketDir(rec.id)
  return rec.sourceType === 'folder' ? join(dir, 'images') : join(dir, rec.sourceFile ?? 'source')
}

async function atomicWriteJson(path: string, data: unknown): Promise<void> {
  const tmp = `${path}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8')
  await fs.rename(tmp, path)
}

function shortId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 12)
}

function manifestFile(root = libraryRoot()): string {
  if (!root) throw new Error('NO_ROOT')
  return join(root, 'library.json')
}

function bookRecordFile(id: string): string {
  return join(bucketDir(id), 'book.json')
}

async function writeLibraryManifest(m: LibraryManifest): Promise<void> {
  m.updatedAt = new Date().toISOString()
  await atomicWriteJson(manifestFile(), m)
}

async function readBookRecord(id: string): Promise<BookRecord> {
  const rec = JSON.parse(await fs.readFile(bookRecordFile(id), 'utf-8')) as BookRecord
  if (!rec || rec.id !== id) throw new Error('INVALID_BOOK')
  return rec
}

async function writeBookRecord(rec: BookRecord): Promise<void> {
  await atomicWriteJson(bookRecordFile(rec.id), rec)
}

async function readAllBookRecords(): Promise<BookRecord[]> {
  const root = booksDir()
  const entries = await readDirSafe(root)
  const records: BookRecord[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.endsWith('.tmp')) continue
    try {
      records.push(await readBookRecord(entry.name))
    } catch {
      /* 损坏桶跳过，避免单本坏记录拖垮整库 */
    }
  }
  return records.sort((a, b) => naturalSort(a.displayName, b.displayName))
}

async function rebuildManifestFromBooks(root: string): Promise<LibraryManifest> {
  currentRoot = root
  const now = new Date().toISOString()
  const records = await readAllBookRecords()
  const byTitle = new Map<string, SeriesNode>()
  const ungrouped: string[] = []
  for (const rec of records) {
    const title = rec.seriesTitleHint?.trim()
    if (!title) {
      ungrouped.push(rec.id)
      continue
    }
    let series = byTitle.get(title)
    if (!series) {
      series = {
        id: shortId(),
        title,
        author: rec.seriesAuthorHint ?? null,
        bookIds: [],
        createdAt: rec.addedAt || now
      }
      byTitle.set(title, series)
    }
    series.bookIds.push(rec.id)
  }
  const manifest: LibraryManifest = {
    version: 1,
    libraryId: randomUUID(),
    name: basename(root, MANAGED_EXT),
    createdAt: now,
    updatedAt: now,
    series: [...byTitle.values()],
    ungrouped
  }
  await writeLibraryManifest(manifest)
  return manifest
}

async function readLibraryManifest(): Promise<LibraryManifest> {
  const root = libraryRoot()
  if (!root) throw new Error('NO_ROOT')
  try {
    const data = JSON.parse(await fs.readFile(manifestFile(root), 'utf-8')) as LibraryManifest
    if (data?.version === 1 && Array.isArray(data.series) && Array.isArray(data.ungrouped)) {
      return data
    }
  } catch {
    /* 缺失或损坏时从桶自描述重建 */
  }
  return rebuildManifestFromBooks(root)
}

async function cleanupTmpBuckets(): Promise<void> {
  const entries = await readDirSafe(booksDir())
  await Promise.all(
    entries
      .filter((e) => e.isDirectory() && e.name.endsWith('.tmp'))
      .map((e) => fs.rm(join(booksDir(), e.name), { recursive: true, force: true }))
  )
  await fs.rm(join(libraryRoot() ?? '', 'library.json.tmp'), { force: true }).catch(() => {})
}

async function createLibrary(parentDir: string, nameRaw: string): Promise<string> {
  const sanitized = sanitizeName(nameRaw)
  const safeName = sanitized.toLowerCase().endsWith(MANAGED_EXT)
    ? sanitized.slice(0, -MANAGED_EXT.length)
    : sanitized
  const root = join(parentDir, `${safeName}${MANAGED_EXT}`)
  if (await pathExists(root)) throw new Error('NAME_EXISTS')
  await fs.mkdir(join(root, 'books'), { recursive: true })
  await fs.mkdir(join(root, 'trash'), { recursive: true })
  currentRoot = root
  const now = new Date().toISOString()
  await writeLibraryManifest({
    version: 1,
    libraryId: randomUUID(),
    name: safeName,
    createdAt: now,
    updatedAt: now,
    series: [],
    ungrouped: []
  })
  await patchSettings({ libraryPackagePath: root, libraryRoot: undefined })
  return root
}

async function openLibrary(packagePath: string): Promise<LibraryManifest> {
  const stat = await fs.stat(packagePath).catch(() => null)
  if (!stat?.isDirectory() || extname(packagePath).toLowerCase() !== MANAGED_EXT) {
    throw new Error('INVALID_LIBRARY')
  }
  currentRoot = packagePath
  await fs.mkdir(booksDir(), { recursive: true })
  await fs.mkdir(join(packagePath, 'trash'), { recursive: true })
  await cleanupTmpBuckets()
  const manifest = await readLibraryManifest()
  await patchSettings({ libraryPackagePath: packagePath })
  return manifest
}

async function getSavedLibrary(): Promise<string | null> {
  const settings = await readSettings()
  const root = typeof settings.libraryPackagePath === 'string' ? settings.libraryPackagePath : null
  if (!root) return null
  try {
    await openLibrary(root)
    return root
  } catch {
    return null
  }
}

// ---------- 扫描辅助 ----------
async function readDirSafe(dir: string): Promise<import('fs').Dirent[]> {
  try {
    return await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

/** 递归（深度受限）查找第一张图片，按自然顺序 */
async function findFirstImage(dir: string, depth = 3): Promise<string | null> {
  const entries = await readDirSafe(dir)
  const images = entries
    .filter((e) => e.isFile() && isImage(e.name))
    .map((e) => e.name)
    .sort(naturalSort)
  if (images.length > 0) return join(dir, images[0])
  if (depth <= 0) return null
  const subDirs = entries
    .filter((e) => e.isDirectory() && !isHidden(e.name))
    .map((e) => e.name)
    .sort(naturalSort)
  for (const sub of subDirs) {
    const found = await findFirstImage(join(dir, sub), depth - 1)
    if (found) return found
  }
  return null
}

/** 递归（深度受限）统计图片数量 */
async function countImages(dir: string, depth = 4): Promise<number> {
  const entries = await readDirSafe(dir)
  let total = entries.filter((e) => e.isFile() && isImage(e.name)).length
  if (depth > 0) {
    for (const e of entries) {
      if (e.isDirectory() && !isHidden(e.name)) {
        total += await countImages(join(dir, e.name), depth - 1)
      }
    }
  }
  return total
}

async function scanImportPath(srcPath: string, result: ImportScanResult): Promise<void> {
  const stat = await fs.stat(srcPath).catch(() => null)
  if (!stat) {
    result.skipped.push({ path: srcPath, reason: 'NOT_FOUND' })
    return
  }
  const name = basename(srcPath)
  if (isHidden(name)) return

  if (stat.isFile()) {
    if (isVolumeFile(name) && !isSplitContinuation(name)) {
      result.candidates.push({
        sourcePath: srcPath,
        sourceType: (isArchiveFile(name)
          ? 'archive'
          : documentType(srcPath)) as ImportCandidate['sourceType'],
        displayName: name.replace(/\.[^.]+$/, '')
      })
    } else {
      result.skipped.push({ path: srcPath, reason: 'UNSUPPORTED_FILE' })
    }
    return
  }

  if (!stat.isDirectory()) {
    result.skipped.push({ path: srcPath, reason: 'UNSUPPORTED_ENTRY' })
    return
  }

  const entries = await readDirSafe(srcPath)
  const directImages = entries.some((e) => e.isFile() && !isHidden(e.name) && isImage(e.name))
  if (directImages) {
    result.candidates.push({
      sourcePath: srcPath,
      sourceType: 'folder',
      displayName: name
    })
    return
  }

  let foundChildCandidate = false
  const before = result.candidates.length
  for (const entry of entries.sort((a, b) => naturalSort(a.name, b.name))) {
    if (isHidden(entry.name)) continue
    await scanImportPath(join(srcPath, entry.name), result)
  }
  foundChildCandidate = result.candidates.length > before
  if (!foundChildCandidate) result.skipped.push({ path: srcPath, reason: 'NO_IMAGES' })
}

async function scanImportSource(srcRoot: string): Promise<ImportScanResult> {
  const result: ImportScanResult = { candidates: [], skipped: [] }
  await scanImportPath(srcRoot, result)
  const seen = new Set<string>()
  result.candidates = result.candidates.filter((candidate) => {
    const key = resolve(candidate.sourcePath)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return result
}

async function copyImageTree(srcDir: string, destDir: string): Promise<void> {
  await fs.mkdir(destDir, { recursive: true })
  const entries = await readDirSafe(srcDir)
  for (const entry of entries) {
    if (isHidden(entry.name)) continue
    const src = join(srcDir, entry.name)
    const dest = join(destDir, entry.name)
    if (entry.isDirectory()) {
      await copyImageTree(src, dest)
    } else if (entry.isFile() && isImage(entry.name)) {
      await fs.mkdir(dirname(dest), { recursive: true })
      await fs.copyFile(src, dest)
    }
  }
}

async function writeCover(firstImage: string | null, out: string): Promise<string | null> {
  if (!firstImage) return null
  try {
    await sharp(firstImage, { failOn: 'none' })
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(out)
    return out
  } catch {
    return null
  }
}

function managedSourceName(originalName: string): string {
  const numbered = originalName.match(/^(.*)(\.(?:7z|zip|cbz|rar|cbr)\.\d{2,})$/i)
  if (numbered) return `source${numbered[2].toLowerCase()}`
  const partRar = originalName.match(/^(.*)(\.part\d+\.rar)$/i)
  if (partRar) return `source${partRar[2].toLowerCase()}`
  const oldRar = originalName.match(/^(.*)(\.(?:rar|r\d{2}))$/i)
  if (oldRar) return `source${oldRar[2].toLowerCase()}`
  return `source${extname(originalName).toLowerCase()}`
}

async function importBooks(
  candidates: ImportCandidate[],
  opts: ImportOptions,
  onProgress: (done: number, total: number, name: string) => void
): Promise<string[]> {
  if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
  const manifest = await readLibraryManifest()
  const imported: string[] = []
  await fs.mkdir(booksDir(), { recursive: true })

  for (const candidate of candidates) {
    const id = shortId()
    const finalDir = bucketDir(id)
    const tmpDir = `${finalDir}.tmp`
    await fs.rm(tmpDir, { recursive: true, force: true })
    await fs.mkdir(tmpDir, { recursive: true })
    const addedAt = new Date().toISOString()
    let sourceFile: string | null = null
    let pageCount = 0
    let firstImage: string | null = null

    try {
      if (candidate.sourceType === 'folder') {
        const imagesDir = join(tmpDir, 'images')
        await copyImageTree(candidate.sourcePath, imagesDir)
        pageCount = await countImages(imagesDir)
        firstImage = await findFirstImage(imagesDir)
      } else {
        sourceFile = managedSourceName(basename(candidate.sourcePath))
        const dest = join(tmpDir, sourceFile)
        if (candidate.sourceType === 'archive') {
          const parts = await splitSiblings(candidate.sourcePath)
          for (const part of parts) {
            await fs.copyFile(part, join(tmpDir, managedSourceName(basename(part))))
          }
        } else {
          await fs.copyFile(candidate.sourcePath, dest)
        }
        const info = await inspectFileVolume(dest, sourceFile).catch(() => null)
        pageCount = info?.pageCount ?? 0
        if (candidate.sourceType === 'archive') {
          const prepared = await prepareArchive(dest).catch(() => null)
          if (prepared?.status === 'ready') {
            const cached = await getCachedImages(dest)
            firstImage = cached?.[0] ?? null
            pageCount = cached?.length ?? pageCount
          }
        } else if (candidate.sourceType === 'pdf') {
          firstImage = await getPdfCoverImage(dest).catch(() => null)
        } else {
          const pages = await prepareDocument(dest).catch(() => null)
          firstImage = pages?.[0] ?? null
          pageCount = pages?.length ?? pageCount
        }
      }

      const rec: BookRecord = {
        id,
        sourceType: candidate.sourceType,
        sourceFile,
        displayName: candidate.displayName,
        originalName: basename(candidate.sourcePath),
        importedFrom: candidate.sourcePath,
        pageCount,
        addedAt,
        seriesTitleHint: null,
        seriesAuthorHint: null
      }
      await atomicWriteJson(join(tmpDir, 'book.json'), rec)
      await writeCover(firstImage, join(tmpDir, 'cover.webp'))
      await fs.rename(tmpDir, finalDir)
      manifest.ungrouped.push(id)
      await writeLibraryManifest(manifest)
      imported.push(id)
      if (opts.deleteSourceAfter) {
        await fs.rm(candidate.sourcePath, { recursive: true, force: true }).catch(() => {})
      }
      onProgress(imported.length, candidates.length, candidate.displayName)
    } catch (error) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
      throw error
    }
  }
  return imported
}

const toComicUrl = (absPath: string): string => `comic://img/?p=${encodeURIComponent(absPath)}`
/** 封面用缩略图通道：comic:// 协议据 thumb=1 返回降采样 webp（见 handleComicProtocol） */
const toThumbUrl = (absPath: string): string =>
  `comic://img/?p=${encodeURIComponent(absPath)}&thumb=1`

function isWithinPath(absPath: string, rootPath: string): boolean {
  const abs = resolve(absPath)
  const root = resolve(rootPath)
  return abs === root || abs.startsWith(root + sep)
}

// ---------- 封面缩略图缓存 ----------
// 漫画原图常达数 MB（本库单页约 4MB），网格里 10+ 张封面若直接解全图会拖慢加载并造成交互卡顿。
// 这里用 sharp 把封面降到 ~480px webp，按 路径+mtime+size 缓存到 userData/thumbs，源图变更自动失效。
const THUMB_WIDTH = 480
const thumbsRoot = (): string => join(app.getPath('userData'), 'thumbs')

async function buildThumb(absPath: string): Promise<string> {
  const stat = await fs.stat(absPath)
  const key = `${absPath}:${stat.mtimeMs}:${stat.size}:w${THUMB_WIDTH}`
  const out = join(thumbsRoot(), `${createHash('sha1').update(key).digest('hex')}.webp`)
  try {
    await fs.access(out)
    return out // 命中缓存
  } catch {
    /* 未生成 */
  }
  await fs.mkdir(thumbsRoot(), { recursive: true })
  await sharp(absPath, { failOn: 'none' })
    .rotate() // 尊重 EXIF 方向
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(out)
  return out
}

/** 从 `[作者] 标题` 解析出作者与标题 */
function parseSeriesName(name: string): { title: string; author: string | null } {
  const match = name.match(/^\s*[[【]([^\]】]+)[\]】]\s*(.+)$/)
  if (match) return { author: match[1].trim(), title: match[2].trim() }
  return { title: name, author: null }
}

// 用户对某部漫画名称/作者的自定义覆盖（存 settings.json 的 seriesMeta，按部文件夹名为键），
// 免去为改书名/作者而重命名本地文件夹。
interface SeriesMetaOverride {
  title?: string
  author?: string | null
}

async function readSeriesMeta(): Promise<Record<string, SeriesMetaOverride>> {
  const settings = await readSettings()
  const raw = settings.seriesMeta
  return raw && typeof raw === 'object' ? (raw as Record<string, SeriesMetaOverride>) : {}
}

/** 解析文件夹名得默认名称/作者，再叠加用户覆盖 */
function resolveSeriesMeta(
  name: string,
  override?: SeriesMetaOverride
): { title: string; author: string | null } {
  const parsed = parseSeriesName(name)
  return {
    title: override?.title?.trim() || parsed.title,
    author: override ? override.author?.trim() || null : parsed.author
  }
}

// ---------- 单文件卷 inspect 结果缓存（压缩包页数/加密态、PDF 页数）----------
// inspectArchive 会起 7z、inspectDocument 会跑 pdfjs，单个文件夹里十几个压缩包并发列举可达数秒，
// 且每次进入都重算。按「路径:mtime:size」缓存——源文件变更则 key 变、自动失效——重进瞬开。
interface InspectEntry {
  imageCount?: number
  encrypted?: boolean
  pageCount?: number
}
const inspectCacheFile = (): string => join(app.getPath('userData'), 'inspect-cache.json')
let inspectCache: Record<string, InspectEntry> | null = null
let inspectCacheDirty = false
let inspectFlushTimer: ReturnType<typeof setTimeout> | null = null

async function loadInspectCache(): Promise<Record<string, InspectEntry>> {
  if (inspectCache) return inspectCache
  let loaded: Record<string, InspectEntry> = {}
  try {
    loaded = JSON.parse(await fs.readFile(inspectCacheFile(), 'utf-8'))
  } catch {
    loaded = {}
  }
  inspectCache = loaded
  return loaded
}

function scheduleInspectFlush(): void {
  inspectCacheDirty = true
  if (inspectFlushTimer) return
  inspectFlushTimer = setTimeout(() => {
    inspectFlushTimer = null
    if (!inspectCacheDirty || !inspectCache) return
    inspectCacheDirty = false
    void fs.writeFile(inspectCacheFile(), JSON.stringify(inspectCache)).catch(() => {})
  }, 800)
}

async function statKey(path: string): Promise<string | null> {
  try {
    const s = await fs.stat(path)
    return `${path}:${s.mtimeMs}:${s.size}`
  } catch {
    return null
  }
}

// ---------- 扫描实现 ----------

/** 单文件卷的即时基础信息（无重 IO）：id/path/name/title/kind/sourceType。 */
function fileVolumeBase(
  path: string,
  name: string
): Pick<LibraryVolume, 'id' | 'path' | 'name' | 'title' | 'kind' | 'sourceType'> {
  return {
    id: path,
    path,
    name,
    title: name.replace(/\.[^.]+$/, ''),
    kind: 'file' as const,
    sourceType: (isArchiveFile(name) ? 'archive' : documentType(path)) as 'archive' | 'pdf' | 'epub'
  }
}

export interface VolumeInspect {
  pageCount: number
  locked: boolean
  coverUrl: string | null
}

/**
 * 单文件卷的「重活」展示信息：页数 / 加密态 / 封面。压缩包起 7z 列举、PDF 跑 pdfjs 渲首页，
 * 都不便宜——优先吃解压缓存 / inspect 缓存，缺才真算并写缓存。供懒加载 IPC 与 eager 构建复用。
 */
async function inspectFileVolume(path: string, name: string): Promise<VolumeInspect> {
  // 已解出缓存 → 用缓存首图作封面、缓存页数
  const extracted = isArchiveFile(name)
    ? await getCachedImages(path)
    : isDocumentFile(name)
      ? await getCachedDocumentImages(path)
      : null
  if (extracted && extracted.length > 0) {
    return { pageCount: extracted.length, locked: false, coverUrl: toThumbUrl(extracted[0]) }
  }
  const cache = await loadInspectCache()
  const key = await statKey(path)
  if (isArchiveFile(name)) {
    // 未解出 → 轻量列表拿页数 + 加密状态（封面待首次打开后出现）；命中缓存则免起 7z
    let entry = key ? cache[key] : undefined
    if (!entry || entry.imageCount === undefined) {
      const info = await inspectArchive(path).catch(() => null)
      entry = { imageCount: info?.imageCount ?? 0, encrypted: info?.encrypted ?? false }
      if (key) {
        cache[key] = entry
        scheduleInspectFlush()
      }
    }
    return { pageCount: entry.imageCount ?? 0, locked: entry.encrypted ?? false, coverUrl: null }
  }
  // PDF 未准备 → 只渲染首页作封面（带缓存）；EPUB 封面解包较重，仍待首次打开后出现
  let entry = key ? cache[key] : undefined
  if (!entry || entry.pageCount === undefined) {
    const info = await inspectDocument(path).catch(() => null)
    entry = { pageCount: info?.pageCount ?? 0 }
    if (key) {
      cache[key] = entry
      scheduleInspectFlush()
    }
  }
  let coverUrl: string | null = null
  if (documentType(path) === 'pdf') {
    const cover = await getPdfCoverImage(path).catch(() => null)
    coverUrl = cover ? toThumbUrl(cover) : null
  }
  return { pageCount: entry.pageCount ?? 0, locked: false, coverUrl }
}

/**
 * 构造一个「单文件卷册」(压缩包 / pdf / epub) 的展示信息。
 * eager=true（书架扫描）：同步取齐页数/加密/封面。
 * eager=false（文件视图）：只读已就绪缓存，缺则占位（pageCount 0 / 通用图标），
 * 由 renderer 拿到列表后再后台逐个 inspectVolume 补齐——避免列目录时被一堆 7z/pdfjs 阻塞。
 */
async function buildFileVolume(path: string, name: string, eager = true): Promise<LibraryVolume> {
  const base = fileVolumeBase(path, name)
  if (eager) {
    const info = await inspectFileVolume(path, name)
    return { ...base, pageCount: info.pageCount, coverUrl: info.coverUrl, locked: info.locked }
  }
  // 懒加载：只吃现成缓存，不起 7z / 不跑 pdfjs / 不渲 PDF 封面
  const extracted = isArchiveFile(name)
    ? await getCachedImages(path)
    : isDocumentFile(name)
      ? await getCachedDocumentImages(path)
      : null
  if (extracted && extracted.length > 0) {
    return { ...base, pageCount: extracted.length, coverUrl: toThumbUrl(extracted[0]) }
  }
  const cache = await loadInspectCache()
  const key = await statKey(path)
  const entry = key ? cache[key] : undefined
  if (entry) {
    return {
      ...base,
      pageCount: (isArchiveFile(name) ? entry.imageCount : entry.pageCount) ?? 0,
      coverUrl: null,
      locked: entry.encrypted ?? false
    }
  }
  return { ...base, pageCount: 0, coverUrl: null, locked: false }
}

async function coverUrlForBook(id: string): Promise<string | null> {
  const cover = join(bucketDir(id), 'cover.webp')
  return (await pathExists(cover)) ? toComicUrl(cover) : null
}

async function bookRecordToView(rec: BookRecord): Promise<BookView> {
  const sourcePath = bucketSourcePath(rec)
  let locked = false
  let pageCount = rec.pageCount
  if (rec.sourceType !== 'folder') {
    const info = await inspectFileVolume(sourcePath, basename(sourcePath)).catch(() => null)
    locked = info?.locked ?? false
    pageCount = pageCount || info?.pageCount || 0
  }
  return {
    id: rec.id,
    sourceType: rec.sourceType,
    displayName: rec.displayName,
    pageCount,
    coverUrl: await coverUrlForBook(rec.id),
    locked,
    sourceVolumePath: sourcePath
  }
}

async function getLibraryView(): Promise<LibraryView> {
  const manifest = await readLibraryManifest()
  const records = new Map((await readAllBookRecords()).map((rec) => [rec.id, rec]))
  const series = await Promise.all(
    manifest.series.map(async (node) => {
      const first = node.bookIds.map((id) => records.get(id)).find(Boolean)
      return {
        ...node,
        volumeCount: node.bookIds.length,
        coverUrl: first ? await coverUrlForBook(first.id) : null
      }
    })
  )
  const ungrouped = await Promise.all(
    manifest.ungrouped
      .map((id) => records.get(id))
      .filter((rec): rec is BookRecord => !!rec)
      .map((rec) => bookRecordToView(rec))
  )
  return { series, ungrouped }
}

async function getSeriesBooks(seriesId: string): Promise<BookView[]> {
  const manifest = await readLibraryManifest()
  const node = manifest.series.find((s) => s.id === seriesId)
  if (!node) return []
  const records = new Map((await readAllBookRecords()).map((rec) => [rec.id, rec]))
  return Promise.all(
    node.bookIds
      .map((id) => records.get(id))
      .filter((rec): rec is BookRecord => !!rec)
      .map((rec) => bookRecordToView(rec))
  )
}

function managedBookToEntry(book: BookView, author: string | null): LibraryEntry {
  return {
    type: 'book',
    id: book.id,
    path: book.sourceVolumePath,
    name: book.displayName,
    title: book.displayName,
    author,
    kind: book.sourceType === 'folder' ? 'folder' : 'file',
    sourceType: book.sourceType,
    pageCount: book.pageCount,
    coverUrl: book.coverUrl,
    locked: book.locked
  }
}

async function managedScanLibrary(root: string): Promise<LibraryEntry[]> {
  await openLibrary(root)
  const view = await getLibraryView()
  const groups: LibraryEntry[] = view.series.map((node) => ({
    type: 'folder',
    id: node.id,
    path: node.id,
    name: node.title,
    title: node.title,
    author: node.author,
    volumeCount: node.volumeCount,
    coverUrl: node.coverUrl
  }))
  const loose = view.ungrouped.map((book) => managedBookToEntry(book, null))
  return [...groups, ...loose]
}

async function managedListVolumes(seriesId: string): Promise<LibraryEntry[]> {
  const manifest = await readLibraryManifest()
  const node = manifest.series.find((s) => s.id === seriesId)
  if (!node) return []
  return (await getSeriesBooks(seriesId)).map((book) => managedBookToEntry(book, node.author))
}

function removeBookIdsFromManifest(manifest: LibraryManifest, ids: Set<string>): void {
  manifest.ungrouped = manifest.ungrouped.filter((id) => !ids.has(id))
  for (const series of manifest.series) {
    series.bookIds = series.bookIds.filter((id) => !ids.has(id))
  }
}

async function updateBookHints(
  ids: string[],
  title: string | null,
  author: string | null
): Promise<void> {
  await Promise.all(
    ids.map(async (id) => {
      const rec = await readBookRecord(id)
      rec.seriesTitleHint = title
      rec.seriesAuthorHint = author
      await writeBookRecord(rec)
    })
  )
}

async function createSeries(
  titleRaw: string,
  authorRaw: string | null,
  bookIds: string[]
): Promise<SeriesNode> {
  if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
  const title = titleRaw.trim()
  if (!title) throw new Error('INVALID_NAME')
  const author = authorRaw?.trim() || null
  const manifest = await readLibraryManifest()
  const ids = [...new Set(bookIds)]
  const idSet = new Set(ids)
  removeBookIdsFromManifest(manifest, idSet)
  const node: SeriesNode = {
    id: shortId(),
    title,
    author,
    bookIds: ids,
    createdAt: new Date().toISOString()
  }
  manifest.series.push(node)
  await writeLibraryManifest(manifest)
  await updateBookHints(ids, title, author)
  return node
}

async function renameSeries(
  seriesId: string,
  titleRaw: string,
  authorRaw: string | null
): Promise<void> {
  const title = titleRaw.trim()
  if (!title) throw new Error('INVALID_NAME')
  const author = authorRaw?.trim() || null
  const manifest = await readLibraryManifest()
  const node = manifest.series.find((s) => s.id === seriesId)
  if (!node) throw new Error('NOT_FOUND')
  node.title = title
  node.author = author
  await writeLibraryManifest(manifest)
  await updateBookHints(node.bookIds, title, author)
}

async function deleteSeries(seriesId: string): Promise<void> {
  const manifest = await readLibraryManifest()
  const node = manifest.series.find((s) => s.id === seriesId)
  if (!node) throw new Error('NOT_FOUND')
  manifest.series = manifest.series.filter((s) => s.id !== seriesId)
  manifest.ungrouped.push(...node.bookIds)
  await writeLibraryManifest(manifest)
  await updateBookHints(node.bookIds, null, null)
}

async function assignBooks(bookIds: string[], targetSeriesId: string | null): Promise<void> {
  const ids = [...new Set(bookIds)]
  if (ids.length === 0) return
  const idSet = new Set(ids)
  const manifest = await readLibraryManifest()
  removeBookIdsFromManifest(manifest, idSet)
  if (targetSeriesId === null) {
    manifest.ungrouped.push(...ids)
    await writeLibraryManifest(manifest)
    await updateBookHints(ids, null, null)
    return
  }
  const node = manifest.series.find((s) => s.id === targetSeriesId)
  if (!node) throw new Error('NOT_FOUND')
  node.bookIds.push(...ids)
  await writeLibraryManifest(manifest)
  await updateBookHints(ids, node.title, node.author)
}

async function reorderSeries(orderedSeriesIds: string[]): Promise<void> {
  const manifest = await readLibraryManifest()
  const order = new Map(orderedSeriesIds.map((id, i) => [id, i]))
  manifest.series.sort((a, b) => (order.get(a.id) ?? 999999) - (order.get(b.id) ?? 999999))
  await writeLibraryManifest(manifest)
}

async function reorderBooks(seriesId: string | null, orderedBookIds: string[]): Promise<void> {
  const manifest = await readLibraryManifest()
  const order = new Map(orderedBookIds.map((id, i) => [id, i]))
  if (seriesId === null) {
    manifest.ungrouped.sort((a, b) => (order.get(a) ?? 999999) - (order.get(b) ?? 999999))
  } else {
    const node = manifest.series.find((s) => s.id === seriesId)
    if (!node) throw new Error('NOT_FOUND')
    node.bookIds.sort((a, b) => (order.get(a) ?? 999999) - (order.get(b) ?? 999999))
  }
  await writeLibraryManifest(manifest)
}

async function renameBook(id: string, displayNameRaw: string): Promise<void> {
  const displayName = displayNameRaw.trim()
  if (!displayName) throw new Error('INVALID_NAME')
  const rec = await readBookRecord(id)
  rec.displayName = displayName
  await writeBookRecord(rec)
}

async function trashBooks(idsRaw: string[]): Promise<void> {
  const root = libraryRoot()
  if (!root || !isManagedLibraryPath(root)) throw new Error('NO_LIBRARY')
  const ids = [...new Set(idsRaw)]
  if (ids.length === 0) return
  const manifest = await readLibraryManifest()
  const idSet = new Set(ids)
  const trashRoot = join(root, 'trash')
  await fs.mkdir(trashRoot, { recursive: true })

  for (const id of ids) {
    const src = bucketDir(id)
    const stat = await fs.stat(src).catch(() => null)
    if (!stat?.isDirectory()) throw new Error('NOT_FOUND')
    let dest = join(trashRoot, id)
    if (await pathExists(dest)) dest = join(trashRoot, `${id}-${Date.now()}`)
    await fs.rename(src, dest)
  }

  removeBookIdsFromManifest(manifest, idSet)
  await writeLibraryManifest(manifest)
}

async function readTrashRecord(trashId: string): Promise<BookRecord> {
  const root = trashDir()
  const dir = resolve(join(root, trashId))
  if (!isWithinPath(dir, root)) throw new Error('OUT_OF_ROOT')
  const rec = JSON.parse(await fs.readFile(join(dir, 'book.json'), 'utf-8')) as BookRecord
  if (!rec?.id) throw new Error('INVALID_BOOK')
  return rec
}

async function listTrashBooks(): Promise<TrashBookView[]> {
  const root = libraryRoot()
  if (!root || !isManagedLibraryPath(root)) throw new Error('NO_LIBRARY')
  await fs.mkdir(trashDir(), { recursive: true })
  const entries = await readDirSafe(trashDir())
  const books: TrashBookView[] = []
  for (const entry of entries.sort((a, b) => naturalSort(a.name, b.name))) {
    if (!entry.isDirectory() || entry.name.endsWith('.tmp')) continue
    try {
      const rec = await readTrashRecord(entry.name)
      books.push({
        trashId: entry.name,
        bookId: rec.id,
        displayName: rec.displayName,
        originalName: rec.originalName,
        sourceType: rec.sourceType,
        seriesTitleHint: rec.seriesTitleHint,
        seriesAuthorHint: rec.seriesAuthorHint,
        pageCount: rec.pageCount
      })
    } catch {
      /* 单个 trash 桶损坏时跳过 */
    }
  }
  return books
}

function restoreBookIntoManifest(manifest: LibraryManifest, rec: BookRecord): void {
  removeBookIdsFromManifest(manifest, new Set([rec.id]))
  const title = rec.seriesTitleHint?.trim() || null
  if (!title) {
    manifest.ungrouped.push(rec.id)
    return
  }
  const author = rec.seriesAuthorHint ?? null
  let node = manifest.series.find((s) => s.title === title && (s.author ?? null) === author)
  if (!node) {
    node = {
      id: shortId(),
      title,
      author,
      bookIds: [],
      createdAt: new Date().toISOString()
    }
    manifest.series.push(node)
  }
  node.bookIds.push(rec.id)
}

async function restoreTrashBooks(trashIdsRaw: string[]): Promise<void> {
  const root = libraryRoot()
  if (!root || !isManagedLibraryPath(root)) throw new Error('NO_LIBRARY')
  const trashIds = [...new Set(trashIdsRaw)]
  if (trashIds.length === 0) return
  const manifest = await readLibraryManifest()

  for (const trashId of trashIds) {
    const src = resolve(join(trashDir(), trashId))
    if (!isWithinPath(src, trashDir())) throw new Error('OUT_OF_ROOT')
    const rec = await readTrashRecord(trashId)
    const dest = bucketDir(rec.id)
    if (await pathExists(dest)) throw new Error('NAME_EXISTS')
    await fs.rename(src, dest)
    restoreBookIntoManifest(manifest, rec)
  }

  await writeLibraryManifest(manifest)
}

async function emptyTrash(): Promise<void> {
  const root = libraryRoot()
  if (!root || !isManagedLibraryPath(root)) throw new Error('NO_LIBRARY')
  await fs.rm(trashDir(), { recursive: true, force: true })
  await fs.mkdir(trashDir(), { recursive: true })
}

/**
 * 判定一个目录在库里的角色（递归，深度受限），替代旧的「固定层级 + 命名约定」扫描：
 *   - 'volume'：目录**直接**含图片，或直接放着 cbz/pdf/epub 单文件 → 可读的「卷」；
 *               其下的「单话子文件夹」由 collectPages 递归收图，不再单列。
 *   - 'part'  ：自身无漫画，但某层子目录里递归地有 → 可下钻的「部」容器。
 *   - 'empty' ：整棵子树都没有漫画资源 → 不展示（只识别含真实漫画资源的目录）。
 */
async function classifyDir(dir: string, depth = 6): Promise<'volume' | 'part' | 'empty'> {
  const entries = await readDirSafe(dir)
  // 直接铺着图片 → 文件夹本身就是一卷可读单元
  if (entries.some((e) => e.isFile() && !isHidden(e.name) && isImage(e.name))) return 'volume'
  // 直接放着 cbz/pdf/epub 单文件 → 文件夹是「部」，这些文件各自作为其下的一卷（由 listChildren 单列）
  if (
    entries.some(
      (e) => e.isFile() && !isHidden(e.name) && isVolumeFile(e.name) && !isSplitContinuation(e.name)
    )
  )
    return 'part'
  if (depth <= 0) return 'empty'
  for (const e of entries) {
    if (e.isDirectory() && !isHidden(e.name)) {
      if ((await classifyDir(join(dir, e.name), depth - 1)) !== 'empty') return 'part'
    }
  }
  return 'empty'
}

/** 统计一个「部」目录下有效子条目（卷 或 子部）的数量，用于书架徽标 */
async function countValidChildren(dir: string): Promise<number> {
  const sub = (await readDirSafe(dir)).filter(
    (e) => !isHidden(e.name) && !isSplitContinuation(e.name)
  )
  const flags = await Promise.all(
    sub.map(async (e) => {
      if (e.isFile()) return isVolumeFile(e.name) ? 1 : 0
      if (!e.isDirectory()) return 0
      return (await classifyDir(join(dir, e.name))) !== 'empty' ? 1 : 0
    })
  )
  return flags.reduce((a: number, b: number) => a + b, 0)
}

/**
 * 列出一个目录下的库条目（书/卷 或 可下钻的部），自然排序。每一级都是同构的条目清单——
 * 库根（顶层书架）与任意「部」下钻共用此函数，从而支持任意深度的嵌套。
 */
async function listChildren(dir: string): Promise<LibraryEntry[]> {
  const dirents = (await readDirSafe(dir))
    .filter((e) => !isHidden(e.name) && !isSplitContinuation(e.name))
    .sort((a, b) => naturalSort(a.name, b.name))

  const overrides = await readSeriesMeta()
  const result: LibraryEntry[] = []
  for (const e of dirents) {
    const path = join(dir, e.name)
    if (e.isFile()) {
      // 散落的单文件卷册（cbz/pdf/epub…）→ 各算一本独立的书
      if (!isVolumeFile(e.name)) continue
      const vol = await buildFileVolume(path, e.name)
      const parsed = parseSeriesName(vol.title)
      result.push({ ...vol, type: 'book', title: parsed.title, author: parsed.author })
      continue
    }
    if (!e.isDirectory()) continue

    const cls = await classifyDir(path)
    if (cls === 'empty') continue // 隐藏整棵子树都没有漫画的目录
    const { title, author } = resolveSeriesMeta(e.name, overrides[e.name])
    if (cls === 'volume') {
      // 直接铺着图片的文件夹本身就是一本书（卷）
      const [cover, pageCount] = await Promise.all([findFirstImage(path), countImages(path)])
      result.push({
        type: 'book',
        id: path,
        path,
        name: e.name,
        title,
        author,
        kind: 'folder',
        sourceType: 'folder',
        pageCount,
        coverUrl: cover ? toThumbUrl(cover) : null
      })
    } else {
      // 'part'：含子级漫画的容器 → 可下钻的「部」
      const [volumeCount, cover] = await Promise.all([
        countValidChildren(path),
        findFirstImage(path)
      ])
      result.push({
        type: 'folder',
        id: path,
        path,
        name: e.name,
        title,
        author,
        volumeCount,
        coverUrl: cover ? toThumbUrl(cover) : null
      })
    }
  }
  return result
}

/**
 * 扫描库根，返回顶层「书/卷 或 部」清单。
 */
async function scanLibrary(root: string): Promise<LibraryEntry[]> {
  if (isManagedLibraryPath(root)) return managedScanLibrary(root)
  currentRoot = root
  return listChildren(root)
}

/** 列出某「部」目录下的条目（可能含可继续下钻的子部），与顶层书架同构。 */
async function listVolumes(seriesPath: string): Promise<LibraryEntry[]> {
  if (isManagedLibraryPath(currentRoot)) return managedListVolumes(seriesPath)
  return listChildren(seriesPath)
}

// ---------- 文件视图（忠实磁盘，不做部/卷折叠/隐藏）----------
// 与书架视图相反：树/网格 1:1 映射磁盘，所有文件夹（含空/无漫画）都展示，便于像 Finder/Eagle 那样整理。

/** 文件视图树节点：某目录的一个直接子文件夹（轻量，仅供左侧树） */
export interface DirNode {
  id: string
  path: string
  name: string
  /** 是否还含子文件夹（决定树是否显示展开箭头） */
  hasSubfolders: boolean
}

export interface RawPlainFile {
  id: string
  path: string
  name: string
  ext: string
  sizeBytes: number
  coverUrl: string | null
}

/** 文件视图：某目录下的完整直接内容（子文件夹卡 + 可读单文件 + 普通文件 + 自身是否可当一卷读） */
export interface RawListing {
  /**
   * 直接子文件夹（忠实，含空目录），带封面/子项数供网格卡片展示，并叠加 seriesMeta
   * 解析出的书名/作者（把该子文件夹当作「部」时用于「编辑书籍信息」与转换预填）。
   */
  folders: Array<
    DirNode & {
      childCount: number
      coverUrl: string | null
      title: string
      author: string | null
      /** 该文件夹自身直接铺着图片 → 可当作一卷直接阅读（classifyDir==='volume'） */
      readable: boolean
      /** readable 时的直接图片页数（粗略，供卡片展示；阅读器仍递归收全） */
      pageCount: number
    }
  >
  /** 直接放着的可读单文件（cbz/pdf/epub），各算一卷 */
  files: LibraryVolume[]
  /** 其他直接文件（含图片、分卷续卷和普通文档），用于文件整理 */
  plainFiles: RawPlainFile[]
  /**
   * 本文件夹自身：是否直接铺着图片（可作为一卷阅读），以及把它当作「部」时的
   * 名称/书名/作者（转换其下单文件卷时作系列信息）。
   */
  self: {
    readable: boolean
    pageCount: number
    coverUrl: string | null
    name: string
    title: string
    author: string | null
  }
}

const sortedChildDirs = (entries: import('fs').Dirent[]): string[] =>
  entries
    .filter((e) => e.isDirectory() && !isHidden(e.name))
    .map((e) => e.name)
    .sort(naturalSort)

const sortedVolumeFiles = (entries: import('fs').Dirent[]): string[] =>
  entries
    .filter(
      (e) => e.isFile() && !isHidden(e.name) && isVolumeFile(e.name) && !isSplitContinuation(e.name)
    )
    .map((e) => e.name)
    .sort(naturalSort)

const sortedPlainFiles = (entries: import('fs').Dirent[]): string[] =>
  entries
    .filter(
      (e) =>
        e.isFile() &&
        !isHidden(e.name) &&
        // 可读单文件由 files 表达，避免同一文件在网格中重复出现；分卷续卷仍作为普通文件展示。
        !(isVolumeFile(e.name) && !isSplitContinuation(e.name))
    )
    .map((e) => e.name)
    .sort(naturalSort)

/** 某目录是否含直接子文件夹（用于树的展开箭头） */
async function hasSubfolders(dir: string): Promise<boolean> {
  const entries = await readDirSafe(dir)
  return entries.some((e) => e.isDirectory() && !isHidden(e.name))
}

/** 文件视图树：列某目录的直接子文件夹（忠实，含空目录），轻量不算封面 */
async function listSubdirs(dir: string): Promise<DirNode[]> {
  if (isManagedLibraryPath(currentRoot)) return []
  assertWithinRoot(dir)
  const entries = await readDirSafe(dir)
  const names = sortedChildDirs(entries)
  return Promise.all(
    names.map(async (name) => {
      const path = join(dir, name)
      return { id: path, path, name, hasSubfolders: await hasSubfolders(path) }
    })
  )
}

/** 文件视图网格：列某目录的完整直接内容（忠实磁盘） */
async function listDirRaw(dir: string): Promise<RawListing> {
  if (isManagedLibraryPath(currentRoot)) {
    const root = currentRoot ?? ''
    return {
      folders: [],
      files: [],
      plainFiles: [],
      self: {
        readable: false,
        pageCount: 0,
        coverUrl: null,
        name: basename(root),
        title: basename(root, MANAGED_EXT),
        author: null
      }
    }
  }
  assertWithinRoot(dir)
  const entries = await readDirSafe(dir)
  const overrides = await readSeriesMeta()

  const folderNames = sortedChildDirs(entries)
  const folders = await Promise.all(
    folderNames.map(async (name) => {
      const path = join(dir, name)
      const sub = await readDirSafe(path)
      const childCount =
        sortedChildDirs(sub).length + sortedVolumeFiles(sub).length + sortedPlainFiles(sub).length
      // 直接铺着图片 = 本身就是一卷可读单元（与 classifyDir==='volume' 同义），双击应进阅读器而非下钻
      const directImages = sub.filter((e) => e.isFile() && !isHidden(e.name) && isImage(e.name))
      const cover = await findFirstImage(path)
      const { title, author } = resolveSeriesMeta(name, overrides[name])
      return {
        id: path,
        path,
        name,
        hasSubfolders: sub.some((e) => e.isDirectory() && !isHidden(e.name)),
        childCount,
        coverUrl: cover ? toThumbUrl(cover) : null,
        title,
        author,
        readable: directImages.length > 0,
        pageCount: directImages.length
      }
    })
  )

  const fileNames = sortedVolumeFiles(entries)
  // 文件视图：单文件卷只出占位（页数/封面/锁由 renderer 后台 inspectVolume 懒补），列目录瞬开
  const files = await Promise.all(
    fileNames.map((name) => buildFileVolume(join(dir, name), name, false))
  )
  const plainFiles = await Promise.all(
    sortedPlainFiles(entries).map(async (name) => {
      const path = join(dir, name)
      const stat = await fs.stat(path)
      return {
        id: path,
        path,
        name,
        ext: extname(name).replace(/^\./, '').toUpperCase(),
        sizeBytes: stat.size,
        coverUrl: isImage(name) ? toThumbUrl(path) : null
      }
    })
  )

  // 自身直接含图片 → 可作为一卷读；并解析「把本目录当作部」时的书名/作者
  const selfName = basename(dir)
  const selfMeta = resolveSeriesMeta(selfName, overrides[selfName])
  const hasDirectImage = entries.some((e) => e.isFile() && !isHidden(e.name) && isImage(e.name))
  let self: RawListing['self'] = {
    readable: false,
    pageCount: 0,
    coverUrl: null,
    name: selfName,
    title: selfMeta.title,
    author: selfMeta.author
  }
  if (hasDirectImage) {
    const [cover, pageCount] = await Promise.all([findFirstImage(dir), countImages(dir)])
    self = { ...self, readable: true, pageCount, coverUrl: cover ? toThumbUrl(cover) : null }
  }

  return { folders, files, plainFiles, self }
}

/** 按阅读顺序递归收集一卷的所有页：本级图片（自然排序）在前，再依次进入子文件夹（自然排序） */
async function collectPages(dir: string, depth = 5): Promise<string[]> {
  const entries = await readDirSafe(dir)
  const images = entries
    .filter((e) => e.isFile() && isImage(e.name))
    .map((e) => e.name)
    .sort(naturalSort)
  const pages = images.map((name) => join(dir, name))
  if (depth > 0) {
    const subDirs = entries
      .filter((e) => e.isDirectory() && !isHidden(e.name))
      .map((e) => e.name)
      .sort(naturalSort)
    for (const sub of subDirs) {
      pages.push(...(await collectPages(join(dir, sub), depth - 1)))
    }
  }
  return pages
}

/** 卷册路径是否为压缩包单文件 */
async function isArchiveVolume(volumePath: string): Promise<boolean> {
  if (!isArchiveFile(volumePath)) return false
  try {
    return (await fs.stat(volumePath)).isFile()
  } catch {
    return false
  }
}

async function isDocumentVolume(volumePath: string): Promise<boolean> {
  if (!isDocumentFile(volumePath)) return false
  try {
    return (await fs.stat(volumePath)).isFile()
  } catch {
    return false
  }
}

/**
 * 解出一卷的图片绝对路径（按阅读顺序）。
 * 文件夹卷 → 递归收图；压缩包卷 → 读缓存，缺则尝试用密码池解；
 * 仍需密码时抛 'NEEDS_PASSWORD'，由 renderer 走解锁流程后重试。
 */
async function resolveVolumeImagePaths(volumePath: string): Promise<string[]> {
  if (await isDocumentVolume(volumePath)) {
    const cached = await getCachedDocumentImages(volumePath)
    if (cached) return cached
    return prepareDocument(volumePath)
  }
  if (!(await isArchiveVolume(volumePath))) return collectPages(volumePath)
  const cached = await getCachedImages(volumePath)
  if (cached) return cached
  const result = await prepareArchive(volumePath)
  if (result.status === 'ready') return (await getCachedImages(volumePath)) ?? []
  if (result.status === 'needs-password') throw new Error('NEEDS_PASSWORD')
  throw new Error(result.message ?? 'EXTRACT_FAILED')
}

async function listPages(volumePath: string): Promise<string[]> {
  const pages = await resolveVolumeImagePaths(volumePath).catch(() => [] as string[])
  return pages.map(toComicUrl)
}

/**
 * 按阅读顺序收集一卷的所有图片**绝对路径**（不含 comic:// 包装）。
 * 供转换流水线使用，能正确处理「单话子文件夹」与压缩包卷册。
 */
export async function collectVolumeImagePaths(volumePath: string): Promise<string[]> {
  return resolveVolumeImagePaths(volumePath)
}

// ---------- 文件整理（应用内本地文件操作） ----------
// 在 app 内对本地库做重命名/移动/新建/删除，省去切到 Finder 手动整理。
// 所有路径都必须落在当前库根目录内（assertWithinRoot），抛出的错误码供 renderer 翻译。

/** 规范化并校验路径必须落在当前库根目录内（防越权/路径穿越），返回规范化绝对路径 */
function assertWithinRoot(p: string): string {
  if (!currentRoot) throw new Error('NO_ROOT')
  const root = resolve(currentRoot)
  const abs = resolve(p)
  if (abs !== root && !abs.startsWith(root + sep)) throw new Error('OUT_OF_ROOT')
  return abs
}

// 跨平台非法文件名字符（含路径分隔符），避免穿越/非法名（空格允许，漫画名常含空格）
const INVALID_NAME = /[\\/:*?"<>|]/
/** 校验并清洗用户输入的单段文件夹/文件名（不得含分隔符、. / .. / 过长） */
function sanitizeName(name: string): string {
  const trimmed = name.trim()
  if (!trimmed || trimmed === '.' || trimmed === '..') throw new Error('INVALID_NAME')
  if (INVALID_NAME.test(trimmed) || trimmed.length > 255) throw new Error('INVALID_NAME')
  return trimmed
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

/** 重命名一个部/卷（文件夹或单文件）。返回新绝对路径。 */
async function renameEntry(targetPath: string, newNameRaw: string): Promise<string> {
  const abs = assertWithinRoot(targetPath)
  const root = resolve(currentRoot!)
  if (abs === root) throw new Error('CANNOT_RENAME_ROOT')
  const parent = dirname(abs)
  const stat = await fs.stat(abs).catch(() => null)
  if (!stat) throw new Error('NOT_FOUND')

  let finalName = sanitizeName(newNameRaw)
  // 单文件卷（cbz/zip…）若用户未带原扩展名，则补回，避免改没文件类型
  if (stat.isFile()) {
    const ext = extname(abs)
    if (ext && extname(finalName).toLowerCase() !== ext.toLowerCase()) finalName += ext
  }

  const dest = join(parent, finalName)
  if (resolve(dest) === abs) return abs // 名称未变
  if (await pathExists(dest)) throw new Error('NAME_EXISTS')
  await fs.rename(abs, dest)

  // 重命名的是顶层「部」文件夹 → 迁移其 seriesMeta 覆盖键（键为文件夹名）
  if (parent === root) {
    const all = await readSeriesMeta()
    const oldKey = basename(abs)
    if (all[oldKey]) {
      all[finalName] = all[oldKey]
      delete all[oldKey]
      await patchSettings({ seriesMeta: all })
    }
  }
  return dest
}

/** 移动若干个部/卷到目标文件夹（同库内）。 */
async function moveEntries(sourcePaths: string[], destDir: string): Promise<void> {
  const root = resolve(currentRoot!)
  const dest = assertWithinRoot(destDir)
  const destStat = await fs.stat(dest).catch(() => null)
  if (!destStat || !destStat.isDirectory()) throw new Error('DEST_NOT_DIR')
  for (const src of sourcePaths) {
    const absSrc = assertWithinRoot(src)
    if (absSrc === root) throw new Error('CANNOT_MOVE_ROOT')
    // 不能移进自身或自身子目录
    if (dest === absSrc || dest.startsWith(absSrc + sep)) throw new Error('MOVE_INTO_SELF')
    const target = join(dest, basename(absSrc))
    if (resolve(target) === absSrc) continue // 已在目标目录，跳过
    if (await pathExists(target)) throw new Error('NAME_EXISTS')
    await fs.rename(absSrc, target)
  }
}

/** 在指定父目录下新建文件夹。返回新文件夹绝对路径。 */
async function createFolderIn(parentPath: string, nameRaw: string): Promise<string> {
  const parent = assertWithinRoot(parentPath)
  const name = sanitizeName(nameRaw)
  const dest = join(parent, name)
  if (await pathExists(dest)) throw new Error('NAME_EXISTS')
  await fs.mkdir(dest)
  return dest
}

/** 把若干个部/卷移入系统废纸篓（可在 Finder 还原）。 */
async function trashEntries(paths: string[]): Promise<void> {
  const root = resolve(currentRoot!)
  for (const p of paths) {
    const abs = assertWithinRoot(p)
    if (abs === root) throw new Error('CANNOT_DELETE_ROOT')
    await shell.trashItem(abs)
  }
}

// ---------- comic:// 协议 ----------
/** 必须在 app ready 之前调用 */
export function registerComicScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'comic',
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
    }
  ])
}

function handleComicProtocol(): void {
  protocol.handle('comic', async (request) => {
    const params = new URL(request.url).searchParams
    const filePath = params.get('p')
    const wantThumb = params.get('thumb') === '1'
    // 安全校验：必须是图片或 PDF。托管库只放行 books/ 桶目录；旧目录库放行当前库根。
    const norm = filePath ? resolve(filePath) : null
    const isPdfFile = !!(norm && extname(norm).toLowerCase() === '.pdf')
    const inRoot = !!(
      norm &&
      currentRoot &&
      (isManagedLibraryPath(currentRoot)
        ? isWithinPath(norm, join(currentRoot, 'books'))
        : isWithinPath(norm, currentRoot))
    )
    const inCache = !!(norm && isWithinPath(norm, extractedRoot()))
    const inDocumentCache = !!(norm && isWithinPath(norm, documentsRoot()))
    if (
      !filePath ||
      (!isImage(filePath) && !isPdfFile) ||
      (!inRoot && !inCache && !inDocumentCache)
    ) {
      return new Response('Forbidden', { status: 403 })
    }
    try {
      // PDF 原文件：直接回传，由 Chromium 内置查看器渲染（来源预览，不预渲染整本）
      if (isPdfFile) {
        const pdfData = await fs.readFile(filePath)
        return new Response(new Uint8Array(pdfData), {
          headers: { 'content-type': 'application/pdf' }
        })
      }
      // 封面走缩略图通道：返回降采样 webp，避免解全图拖慢网格；失败则回退原图
      if (wantThumb) {
        try {
          const thumb = await buildThumb(filePath)
          const tData = await fs.readFile(thumb)
          return new Response(new Uint8Array(tData), { headers: { 'content-type': 'image/webp' } })
        } catch {
          /* 缩略图生成失败 → 回退原图 */
        }
      }
      const data = await fs.readFile(filePath)
      const mime = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
      return new Response(new Uint8Array(data), { headers: { 'content-type': mime } })
    } catch {
      return new Response('Not Found', { status: 404 })
    }
  })
}

// ---------- IPC ----------
/** 在 app ready 之后调用 */
export function setupLibrary(): void {
  handleComicProtocol()

  ipcMain.handle('library:create', async (event, name: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory', 'createDirectory'],
      title: '选择新库包保存位置'
    }
    const { canceled, filePaths } = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (canceled || filePaths.length === 0) return null
    return createLibrary(filePaths[0], name)
  })

  ipcMain.handle('library:open', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory'],
      title: '打开 ComicToKindle 库包'
    }
    const { canceled, filePaths } = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (canceled || filePaths.length === 0) return null
    await openLibrary(filePaths[0])
    return filePaths[0]
  })

  ipcMain.handle('library:getSaved', async () => getSavedLibrary())

  ipcMain.handle('library:view', async (): Promise<LibraryView> => {
    if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
    return getLibraryView()
  })

  ipcMain.handle('library:seriesBooks', async (_event, seriesId: string): Promise<BookView[]> => {
    if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
    return getSeriesBooks(seriesId)
  })

  ipcMain.handle('library:inspectBook', async (_event, id: string): Promise<VolumeInspect> => {
    if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
    const rec = await readBookRecord(id)
    if (rec.sourceType === 'folder') {
      const first = await findFirstImage(bucketSourcePath(rec))
      const pageCount = await countImages(bucketSourcePath(rec))
      return { pageCount, locked: false, coverUrl: first ? toThumbUrl(first) : null }
    }
    return inspectFileVolume(bucketSourcePath(rec), basename(bucketSourcePath(rec)))
  })

  ipcMain.handle(
    'library:scanImport',
    async (event, srcRoot?: string): Promise<ImportScanResult> => {
      const target = srcRoot
      if (!target) {
        const win = BrowserWindow.fromWebContents(event.sender)
        const options: Electron.OpenDialogOptions = {
          properties: ['openFile', 'openDirectory', 'multiSelections'],
          title: '选择要导入的漫画文件或文件夹'
        }
        const { canceled, filePaths } = win
          ? await dialog.showOpenDialog(win, options)
          : await dialog.showOpenDialog(options)
        if (canceled || filePaths.length === 0) return { candidates: [], skipped: [] }
        const combined: ImportScanResult = { candidates: [], skipped: [] }
        for (const filePath of filePaths) {
          const next = await scanImportSource(filePath)
          combined.candidates.push(...next.candidates)
          combined.skipped.push(...next.skipped)
        }
        return combined
      }
      return scanImportSource(target)
    }
  )

  ipcMain.handle(
    'library:import',
    async (event, candidates: ImportCandidate[], opts: ImportOptions = {}): Promise<string[]> => {
      if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
      return importBooks(candidates, opts, (done, total, name) => {
        event.sender.send('library:importProgress', { done, total, name })
      })
    }
  )

  ipcMain.handle(
    'library:createSeries',
    async (_event, title: string, author: string | null, bookIds: string[]): Promise<SeriesNode> =>
      createSeries(title, author, bookIds)
  )

  ipcMain.handle(
    'library:renameSeries',
    async (_event, seriesId: string, title: string, author: string | null): Promise<void> =>
      renameSeries(seriesId, title, author)
  )

  ipcMain.handle(
    'library:deleteSeries',
    async (_event, seriesId: string): Promise<void> => deleteSeries(seriesId)
  )

  ipcMain.handle(
    'library:assignBooks',
    async (_event, bookIds: string[], targetSeriesId: string | null): Promise<void> =>
      assignBooks(bookIds, targetSeriesId)
  )

  ipcMain.handle(
    'library:reorderSeries',
    async (_event, orderedSeriesIds: string[]): Promise<void> => reorderSeries(orderedSeriesIds)
  )

  ipcMain.handle(
    'library:reorderBooks',
    async (_event, seriesId: string | null, orderedBookIds: string[]): Promise<void> =>
      reorderBooks(seriesId, orderedBookIds)
  )

  ipcMain.handle(
    'library:renameBook',
    async (_event, id: string, displayName: string): Promise<void> => renameBook(id, displayName)
  )

  ipcMain.handle(
    'library:trashBooks',
    async (_event, ids: string[]): Promise<void> => trashBooks(ids)
  )

  ipcMain.handle('library:listTrash', async (): Promise<TrashBookView[]> => listTrashBooks())

  ipcMain.handle(
    'library:restoreTrashBooks',
    async (_event, trashIds: string[]): Promise<void> => restoreTrashBooks(trashIds)
  )

  ipcMain.handle('library:emptyTrash', async (): Promise<void> => emptyTrash())

  ipcMain.handle('library:pickFolder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory'],
      title: '打开 ComicToKindle 库包'
    }
    const { canceled, filePaths } = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (canceled || filePaths.length === 0) return null
    const root = filePaths[0]
    await openLibrary(root)
    return root
  })

  ipcMain.handle('library:getSavedRoot', async () => {
    return getSavedLibrary()
  })

  ipcMain.handle('library:scan', async (_event, root: string) => scanLibrary(root))

  ipcMain.handle('library:listVolumes', async (_event, seriesPath: string) =>
    listVolumes(seriesPath)
  )

  // 文件视图：忠实列磁盘
  ipcMain.handle('library:listSubdirs', async (_event, dir: string) => listSubdirs(dir))
  ipcMain.handle('library:listDirRaw', async (_event, dir: string) => listDirRaw(dir))

  // 懒加载单文件卷的页数/加密态/封面（文件视图列目录后由 renderer 后台逐个调用补齐）
  ipcMain.handle(
    'library:inspectVolume',
    async (_event, volumePath: string): Promise<VolumeInspect> => {
      assertWithinRoot(volumePath)
      return inspectFileVolume(volumePath, basename(volumePath))
    }
  )

  ipcMain.handle('library:listPages', async (_event, volumePath: string) => listPages(volumePath))

  // 保存某部漫画的名称/作者覆盖（按部文件夹名为键），不改动本地文件夹
  ipcMain.handle(
    'library:setSeriesMeta',
    async (_event, name: string, meta: { title: string; author: string | null }) => {
      const all = await readSeriesMeta()
      all[name] = { title: meta.title.trim(), author: meta.author?.trim() || null }
      await patchSettings({ seriesMeta: all })
      return resolveSeriesMeta(name, all[name])
    }
  )

  // ---------- 文件整理 IPC（应用内本地文件操作）----------
  ipcMain.handle('library:rename', async (_event, targetPath: string, newName: string) =>
    renameEntry(targetPath, newName)
  )

  ipcMain.handle('library:move', async (_event, sourcePaths: string[], destDir: string) =>
    moveEntries(sourcePaths, destDir)
  )

  ipcMain.handle('library:createFolder', async (_event, parentPath: string, name: string) =>
    createFolderIn(parentPath, name)
  )

  ipcMain.handle('library:trash', async (_event, paths: string[]) => trashEntries(paths))
}

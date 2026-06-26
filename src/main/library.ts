import { app, dialog, ipcMain, protocol, BrowserWindow } from 'electron'
import { join, extname, resolve, dirname, basename, sep } from 'path'
import { promises as fs, createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
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
 * 漫画库数据层（App 独占 .ctklib 库包）：库包生命周期 + 导入(复制成桶) + manifest 分组 +
 * 封面/图片服务。库的「真相」是根 library.json（部/分组树+排序），分组只改 manifest、绝不移动
 * 物理桶；每个 books/<id>/ 桶自带 book.json 冗余，manifest 损坏可从桶重建。卷册取图复用
 * collectVolumeImagePaths（压缩包/PDF/EPUB/散图夹四类同形）。
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

// 文件夹（纯收纳容器，只有名字；不再有"系列作者"这类身份）
export interface LibrarySeries {
  id: string
  path: string
  name: string
  title: string
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
 * 库书架的一个顶层项：要么是一本「书(卷册)」(散卷)，要么是一个「部」(分组)。
 * 由 manifest 派生（managedScanLibrary）：ungrouped → book，series → folder。
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

// 导入进行中标记：导入会在库内建 `<bucket>.tmp` 临时桶，期间任何并发的扫描/开库
// （managedScanLibrary→openLibrary→cleanupTmpBuckets）都不能删 .tmp 桶，否则正在写入
// 的桶会被清掉，导致 book.json 写入 ENOENT。ipcMain 处理器与 importBooks 的 await 会交错，
// 故必须用此标记保护。
let importing = false

export interface LibraryManifest {
  version: 1
  libraryId: string
  name: string
  createdAt: string
  updatedAt: string
  series: SeriesNode[]
  ungrouped: string[]
}

// 文件夹节点：名字 + 内含书 id 列表。纯收纳，无作者。
export interface SeriesNode {
  id: string
  title: string
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
  author: string | null // 本书自带的作者（跟书走，不随归属的「部」变化）
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
  // 导入进行中绝不清 .tmp 桶（正在写入的就是 .tmp 桶）；残留的崩溃桶留到下次开库再清。
  if (importing) return
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

/**
 * 把开库面板选中的路径上溯到最近的 `.ctklib` 库包根——macOS openDirectory 面板里 `.ctklib`
 * 是普通文件夹，双击会「进入」，用户常因此选中包内子目录（books/ 等），上溯即可纠正。
 */
function resolveManagedRoot(selected: string): string | null {
  let cur = resolve(selected)
  for (let i = 0; i < 12; i++) {
    if (extname(cur).toLowerCase() === MANAGED_EXT) return cur
    const parent = dirname(cur)
    if (parent === cur) break
    cur = parent
  }
  return null
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
    if (isSplitContinuation(name)) {
      return
    }

    if (isVolumeFile(name)) {
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

// onBytes：每拷一块回传该块字节数，供导入按字节算整体进度（单个大卷也能平滑推进）。
type OnBytes = (chunk: number) => void

async function copyFileWithProgress(src: string, dest: string, onBytes?: OnBytes): Promise<void> {
  if (!onBytes) return fs.copyFile(src, dest)
  const rs = createReadStream(src)
  rs.on('data', (chunk) => onBytes(chunk.length))
  await pipeline(rs, createWriteStream(dest))
}

async function copyImageTree(srcDir: string, destDir: string, onBytes?: OnBytes): Promise<void> {
  await fs.mkdir(destDir, { recursive: true })
  const entries = await readDirSafe(srcDir)
  for (const entry of entries) {
    if (isHidden(entry.name)) continue
    const src = join(srcDir, entry.name)
    const dest = join(destDir, entry.name)
    if (entry.isDirectory()) {
      await copyImageTree(src, dest, onBytes)
    } else if (entry.isFile() && isImage(entry.name)) {
      await fs.mkdir(dirname(dest), { recursive: true })
      await copyFileWithProgress(src, dest, onBytes)
    }
  }
}

// 一个候选要拷多少字节（folder=树内图片之和，archive=各分卷之和，单文件=自身）——用于算整体进度分母
async function imageTreeBytes(dir: string): Promise<number> {
  let total = 0
  const entries = await readDirSafe(dir)
  for (const entry of entries) {
    if (isHidden(entry.name)) continue
    const p = join(dir, entry.name)
    if (entry.isDirectory()) total += await imageTreeBytes(p)
    else if (entry.isFile() && isImage(entry.name)) total += (await fs.stat(p)).size
  }
  return total
}

async function candidateCopyBytes(candidate: ImportCandidate): Promise<number> {
  try {
    if (candidate.sourceType === 'folder') return await imageTreeBytes(candidate.sourcePath)
    if (candidate.sourceType === 'archive') {
      const parts = await splitSiblings(candidate.sourcePath)
      let total = 0
      for (const part of parts) total += (await fs.stat(part)).size
      return total
    }
    return (await fs.stat(candidate.sourcePath)).size
  } catch {
    return 0
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
  onProgress: (p: { done: number; total: number; name: string; fraction: number }) => void
): Promise<string[]> {
  if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
  importing = true
  try {
    return await runImport(candidates, opts, onProgress)
  } finally {
    importing = false
  }
}

async function runImport(
  candidates: ImportCandidate[],
  opts: ImportOptions,
  onProgress: (p: { done: number; total: number; name: string; fraction: number }) => void
): Promise<string[]> {
  const manifest = await readLibraryManifest()
  const imported: string[] = []
  await fs.mkdir(booksDir(), { recursive: true })

  // 预算总字节，按拷贝字节数回传整体进度（节流 ~80ms，避免 IPC 刷屏）
  let totalBytes = 0
  for (const c of candidates) totalBytes += await candidateCopyBytes(c)
  let copiedBytes = 0
  let lastEmit = 0
  const emit = (name: string, force = false): void => {
    const now = Date.now()
    if (!force && now - lastEmit < 80) return
    lastEmit = now
    const fraction =
      totalBytes > 0 ? Math.min(1, copiedBytes / totalBytes) : imported.length / candidates.length
    onProgress({ done: imported.length, total: candidates.length, name, fraction })
  }
  emit(candidates[0]?.displayName ?? '', true)

  for (const candidate of candidates) {
    const onBytes: OnBytes = (n) => {
      copiedBytes += n
      emit(candidate.displayName)
    }
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
        await copyImageTree(candidate.sourcePath, imagesDir, onBytes)
        pageCount = await countImages(imagesDir)
        firstImage = await findFirstImage(imagesDir)
      } else {
        sourceFile = managedSourceName(basename(candidate.sourcePath))
        const dest = join(tmpDir, sourceFile)
        if (candidate.sourceType === 'archive') {
          const parts = await splitSiblings(candidate.sourcePath)
          for (const part of parts) {
            await copyFileWithProgress(
              part,
              join(tmpDir, managedSourceName(basename(part))),
              onBytes
            )
          }
        } else {
          await copyFileWithProgress(candidate.sourcePath, dest, onBytes)
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
      emit(candidate.displayName, true)
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
    author: rec.seriesAuthorHint,
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
    volumeCount: node.volumeCount,
    coverUrl: node.coverUrl
  }))
  const loose = view.ungrouped.map((book) => managedBookToEntry(book, book.author))
  return [...groups, ...loose]
}

async function managedListVolumes(seriesId: string): Promise<LibraryEntry[]> {
  const manifest = await readLibraryManifest()
  const node = manifest.series.find((s) => s.id === seriesId)
  if (!node) return []
  // 卡片显示每本自带的作者（跟书走）；node.author 仅作部级标签/批量默认值
  return (await getSeriesBooks(seriesId)).map((book) => managedBookToEntry(book, book.author))
}

function removeBookIdsFromManifest(manifest: LibraryManifest, ids: Set<string>): void {
  manifest.ungrouped = manifest.ungrouped.filter((id) => !ids.has(id))
  for (const series of manifest.series) {
    series.bookIds = series.bookIds.filter((id) => !ids.has(id))
  }
}

// 改归属（属于哪个部，title=null 即散卷）。author 省略时不动作者——作者跟书走，
// 仅建/改部时主动批量设置、或单本编辑时才写。移动/解散都不许偷偷改作者。
async function updateBookHints(
  ids: string[],
  title: string | null,
  author?: string | null
): Promise<void> {
  await Promise.all(
    ids.map(async (id) => {
      const rec = await readBookRecord(id)
      rec.seriesTitleHint = title
      if (author !== undefined) rec.seriesAuthorHint = author
      await writeBookRecord(rec)
    })
  )
}

// 新建文件夹并把书放进去。文件夹纯收纳，无作者；书各自保留自带作者。
async function createSeries(titleRaw: string, bookIds: string[]): Promise<SeriesNode> {
  if (!isManagedLibraryPath(currentRoot)) throw new Error('NO_LIBRARY')
  const title = titleRaw.trim()
  if (!title) throw new Error('INVALID_NAME')
  const manifest = await readLibraryManifest()
  const ids = [...new Set(bookIds)]
  const idSet = new Set(ids)
  removeBookIdsFromManifest(manifest, idSet)
  const node: SeriesNode = {
    id: shortId(),
    title,
    bookIds: ids,
    createdAt: new Date().toISOString()
  }
  manifest.series.push(node)
  await writeLibraryManifest(manifest)
  await updateBookHints(ids, title) // 只设归属，不动作者
  return node
}

// 重命名文件夹（同步成员归属 hint）。不碰作者。
async function renameSeries(seriesId: string, titleRaw: string): Promise<void> {
  const title = titleRaw.trim()
  if (!title) throw new Error('INVALID_NAME')
  const manifest = await readLibraryManifest()
  const node = manifest.series.find((s) => s.id === seriesId)
  if (!node) throw new Error('NOT_FOUND')
  node.title = title
  await writeLibraryManifest(manifest)
  await updateBookHints(node.bookIds, title)
}

async function deleteSeries(seriesId: string, deleteBooks = false): Promise<void> {
  const manifest = await readLibraryManifest()
  const node = manifest.series.find((s) => s.id === seriesId)
  if (!node) throw new Error('NOT_FOUND')
  if (deleteBooks) {
    // 连卷册一并删除：先把部内卷册移入库内回收站（trashBooks 自行读写 manifest 并摘除 ids），
    // 再从最新 manifest 里移除已清空的部节点。
    await trashBooks(node.bookIds)
    const fresh = await readLibraryManifest()
    fresh.series = fresh.series.filter((s) => s.id !== seriesId)
    await writeLibraryManifest(fresh)
    return
  }
  // 解散：部内卷册移到「未分组」，卷册本身（含各自作者）保留。
  manifest.series = manifest.series.filter((s) => s.id !== seriesId)
  manifest.ungrouped.push(...node.bookIds)
  await writeLibraryManifest(manifest)
  await updateBookHints(node.bookIds, null)
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
    await updateBookHints(ids, null)
    return
  }
  const node = manifest.series.find((s) => s.id === targetSeriesId)
  if (!node) throw new Error('NOT_FOUND')
  node.bookIds.push(...ids)
  await writeLibraryManifest(manifest)
  // 移入部只改归属，不动作者（作者跟书走）；想统一作者用部的「编辑信息」
  await updateBookHints(ids, node.title)
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

// 编辑单本书的「书籍信息」= 书名(displayName) + 作者。作者跟书走，不动归属。
async function setBookMeta(
  id: string,
  displayNameRaw: string,
  authorRaw: string | null
): Promise<void> {
  const displayName = displayNameRaw.trim()
  if (!displayName) throw new Error('INVALID_NAME')
  const rec = await readBookRecord(id)
  rec.displayName = displayName
  rec.seriesAuthorHint = authorRaw?.trim() || null
  await writeBookRecord(rec)
}

// 批量给多本书设同一作者（多选 →「批量设置作者」，替代旧的文件夹级作者）。
async function setBooksAuthor(ids: string[], authorRaw: string | null): Promise<void> {
  const author = authorRaw?.trim() || null
  for (const id of [...new Set(ids)]) {
    const rec = await readBookRecord(id)
    rec.seriesAuthorHint = author
    await writeBookRecord(rec)
  }
}

async function renameBooks(updates: { id: string; displayName: string }[]): Promise<void> {
  // 先全量校验再逐个落盘：任一名称非法则整批不写，避免改了一半。
  const normalized = updates.map((u) => ({ id: u.id, displayName: u.displayName.trim() }))
  if (normalized.some((u) => !u.id || !u.displayName)) throw new Error('INVALID_NAME')
  for (const u of normalized) {
    const rec = await readBookRecord(u.id)
    rec.displayName = u.displayName
    await writeBookRecord(rec)
  }
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
  let node = manifest.series.find((s) => s.title === title)
  if (!node) {
    node = {
      id: shortId(),
      title,
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

/** 扫描库根（托管 .ctklib），返回顶层「部 + 散卷」清单。 */
async function scanLibrary(root: string): Promise<LibraryEntry[]> {
  return managedScanLibrary(root)
}

/** 列出某「部」下的卷册条目（读 manifest）。 */
async function listVolumes(seriesId: string): Promise<LibraryEntry[]> {
  return managedListVolumes(seriesId)
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

  ipcMain.handle('library:create', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.SaveDialogOptions = {
      title: '新建 ComicToKindle 库包',
      defaultPath: `ComicToKindle${MANAGED_EXT}`,
      nameFieldLabel: '库包名称',
      buttonLabel: '新建',
      properties: ['createDirectory']
    }
    const { canceled, filePath } = win
      ? await dialog.showSaveDialog(win, options)
      : await dialog.showSaveDialog(options)
    if (canceled || !filePath) return null
    return createLibrary(dirname(filePath), basename(filePath))
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
    const root = resolveManagedRoot(filePaths[0])
    if (!root) throw new Error('INVALID_LIBRARY')
    await openLibrary(root)
    return root
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
    async (event, srcRoot?: string | string[]): Promise<ImportScanResult> => {
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
      if (Array.isArray(target)) {
        const combined: ImportScanResult = { candidates: [], skipped: [] }
        for (const filePath of target) {
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
      return importBooks(candidates, opts, (p) => {
        event.sender.send('library:importProgress', p)
      })
    }
  )

  ipcMain.handle(
    'library:createSeries',
    async (_event, title: string, bookIds: string[]): Promise<SeriesNode> =>
      createSeries(title, bookIds)
  )

  ipcMain.handle(
    'library:renameSeries',
    async (_event, seriesId: string, title: string): Promise<void> => renameSeries(seriesId, title)
  )

  ipcMain.handle(
    'library:deleteSeries',
    async (_event, seriesId: string, deleteBooks?: boolean): Promise<void> =>
      deleteSeries(seriesId, deleteBooks === true)
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
    'library:setBookMeta',
    async (_event, id: string, displayName: string, author: string | null): Promise<void> =>
      setBookMeta(id, displayName, author)
  )

  ipcMain.handle(
    'library:setBooksAuthor',
    async (_event, ids: string[], author: string | null): Promise<void> =>
      setBooksAuthor(ids, author)
  )

  ipcMain.handle(
    'library:renameBooks',
    async (_event, updates: { id: string; displayName: string }[]): Promise<void> =>
      renameBooks(updates)
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

  ipcMain.handle('library:listVolumes', async (_event, seriesId: string) => listVolumes(seriesId))

  ipcMain.handle('library:listPages', async (_event, volumePath: string) => listPages(volumePath))
}

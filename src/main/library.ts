import { app, dialog, ipcMain, protocol, BrowserWindow, shell } from 'electron'
import { join, extname, resolve, dirname, basename, sep } from 'path'
import { promises as fs } from 'fs'
import { createHash } from 'crypto'
import sharp from 'sharp'
import {
  getCachedImages,
  prepareArchive,
  inspectArchive,
  extractedRoot,
  isArchiveFile,
  isSplitContinuation
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
 * 目录约定：
 *   根目录 / 部(文件夹) / 卷册(文件夹或单文件) / [单话子文件夹] / 图片
 *   部文件夹命名通常为 `[作者] 标题`。
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
const isVolumeFile = (name: string): boolean =>
  isArchiveFile(name) || isDocumentFile(name)
const isHidden = (name: string): boolean => name.startsWith('.')

// 当前库根目录，用于 comic:// 协议的越权访问校验
let currentRoot: string | null = null

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

const isVolumeEntry = (e: import('fs').Dirent): boolean =>
  !isHidden(e.name) &&
  !isSplitContinuation(e.name) && // 隐藏分卷续卷（.002…/.rNN），只保留入口卷
  (e.isDirectory() || (e.isFile() && isVolumeFile(e.name)))

// ---------- 扫描实现 ----------

/** 构造一个「单文件卷册」(压缩包 / pdf / epub) 的展示信息（封面/页数/加密态，缓存优先）。 */
async function buildFileVolume(path: string, name: string): Promise<LibraryVolume> {
  const docType = documentType(path)
  const base = {
    id: path,
    path,
    name,
    title: name.replace(/\.[^.]+$/, ''),
    kind: 'file' as const,
    sourceType: (isArchiveFile(name) ? 'archive' : docType) as 'archive' | 'pdf' | 'epub'
  }
  // 已解出缓存 → 用缓存首图作封面、缓存页数
  const cached = isArchiveFile(name)
    ? await getCachedImages(path)
    : isDocumentFile(name)
      ? await getCachedDocumentImages(path)
      : null
  if (cached && cached.length > 0) {
    return { ...base, pageCount: cached.length, coverUrl: toThumbUrl(cached[0]) }
  }
  if (isArchiveFile(name)) {
    // 未解出 → 轻量列表拿页数 + 加密状态（封面待首次打开后出现）
    const info = await inspectArchive(path).catch(() => null)
    return {
      ...base,
      pageCount: info?.imageCount ?? 0,
      coverUrl: null,
      locked: info?.encrypted ?? false
    }
  }
  // PDF 未准备 → 只渲染首页作封面（带缓存）；EPUB 封面解包较重，仍待首次打开后出现
  const info = await inspectDocument(path).catch(() => null)
  let coverUrl: string | null = null
  if (docType === 'pdf') {
    const cover = await getPdfCoverImage(path).catch(() => null)
    coverUrl = cover ? toThumbUrl(cover) : null
  }
  return { ...base, pageCount: info?.pageCount ?? 0, coverUrl }
}

/**
 * 扫描库根，返回「书 / 部文件夹」统一清单（自然排序）。
 * 主单位是「书(卷册)」：散落在库根的图片文件夹 / cbz / pdf / epub 各算一本书；
 * 只有「装了多个卷」的文件夹才算「部」(需双击进入看卷)。
 */
async function scanLibrary(root: string): Promise<LibraryEntry[]> {
  currentRoot = root
  const dirents = (await readDirSafe(root))
    .filter((e) => !isHidden(e.name) && !isSplitContinuation(e.name))
    .sort((a, b) => naturalSort(a.name, b.name))

  const overrides = await readSeriesMeta()
  const result: LibraryEntry[] = []
  for (const e of dirents) {
    const path = join(root, e.name)
    if (e.isFile()) {
      // 库根下散落的单文件卷册（cbz/pdf/epub…）→ 各算一本独立的书
      if (!isVolumeFile(e.name)) continue
      const vol = await buildFileVolume(path, e.name)
      const parsed = parseSeriesName(vol.title)
      result.push({ ...vol, type: 'book', title: parsed.title, author: parsed.author })
      continue
    }
    if (!e.isDirectory()) continue

    const sub = await readDirSafe(path)
    const volumeCount = sub.filter(isVolumeEntry).length
    const cover = await findFirstImage(path)
    const { title, author } = resolveSeriesMeta(e.name, overrides[e.name])
    if (volumeCount > 0) {
      // 装了多卷 → 部文件夹
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
    } else if (cover) {
      // 图片直接铺在文件夹里（无更细的卷）→ 这文件夹本身就是一本书
      const pageCount = await countImages(path)
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
        coverUrl: toThumbUrl(cover)
      })
    } else {
      // 空文件夹 → 仍作为部文件夹呈现（卷数 0）
      result.push({
        type: 'folder',
        id: path,
        path,
        name: e.name,
        title,
        author,
        volumeCount: 0,
        coverUrl: null
      })
    }
  }
  return result
}

async function listVolumes(seriesPath: string): Promise<LibraryVolume[]> {
  const entries = (await readDirSafe(seriesPath)).filter(isVolumeEntry)
  entries.sort((a, b) => naturalSort(a.name, b.name))

  const result: LibraryVolume[] = []
  for (const entry of entries) {
    const path = join(seriesPath, entry.name)
    if (entry.isDirectory()) {
      const [cover, pageCount] = await Promise.all([findFirstImage(path), countImages(path)])
      result.push({
        id: path,
        path,
        name: entry.name,
        title: entry.name,
        kind: 'folder',
        sourceType: 'folder',
        pageCount,
        coverUrl: cover ? toThumbUrl(cover) : null
      })
    } else {
      result.push(await buildFileVolume(path, entry.name))
    }
  }
  return result
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
    // 安全校验：必须是图片或 PDF、且位于当前库根目录或来源缓存目录内
    const norm = filePath ? resolve(filePath) : null
    const isPdfFile = !!(norm && extname(norm).toLowerCase() === '.pdf')
    const inRoot = !!(norm && currentRoot && isWithinPath(norm, currentRoot))
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

  ipcMain.handle('library:pickFolder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory'],
      title: '选择漫画库文件夹'
    }
    const { canceled, filePaths } = win
      ? await dialog.showOpenDialog(win, options)
      : await dialog.showOpenDialog(options)
    if (canceled || filePaths.length === 0) return null
    const root = filePaths[0]
    await patchSettings({ libraryRoot: root })
    currentRoot = root
    return root
  })

  ipcMain.handle('library:getSavedRoot', async () => {
    const settings = await readSettings()
    const root = typeof settings.libraryRoot === 'string' ? settings.libraryRoot : null
    if (root) {
      try {
        await fs.access(root)
        currentRoot = root
        return root
      } catch {
        return null
      }
    }
    return null
  })

  ipcMain.handle('library:scan', async (_event, root: string) => scanLibrary(root))

  ipcMain.handle('library:listVolumes', async (_event, seriesPath: string) =>
    listVolumes(seriesPath)
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

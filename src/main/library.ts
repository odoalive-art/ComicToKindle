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
  currentRoot = root
  return listChildren(root)
}

/** 列出某「部」目录下的条目（可能含可继续下钻的子部），与顶层书架同构。 */
async function listVolumes(seriesPath: string): Promise<LibraryEntry[]> {
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
  /** 直接子文件夹（忠实，含空目录），带封面/子项数供网格卡片展示 */
  folders: Array<DirNode & { childCount: number; coverUrl: string | null }>
  /** 直接放着的可读单文件（cbz/pdf/epub），各算一卷 */
  files: LibraryVolume[]
  /** 其他直接文件（含图片、分卷续卷和普通文档），用于文件整理 */
  plainFiles: RawPlainFile[]
  /** 本文件夹自身是否直接铺着图片（可作为一卷阅读） */
  self: { readable: boolean; pageCount: number; coverUrl: string | null }
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
  assertWithinRoot(dir)
  const entries = await readDirSafe(dir)

  const folderNames = sortedChildDirs(entries)
  const folders = await Promise.all(
    folderNames.map(async (name) => {
      const path = join(dir, name)
      const sub = await readDirSafe(path)
      const childCount =
        sortedChildDirs(sub).length + sortedVolumeFiles(sub).length + sortedPlainFiles(sub).length
      const cover = await findFirstImage(path)
      return {
        id: path,
        path,
        name,
        hasSubfolders: sub.some((e) => e.isDirectory() && !isHidden(e.name)),
        childCount,
        coverUrl: cover ? toThumbUrl(cover) : null
      }
    })
  )

  const fileNames = sortedVolumeFiles(entries)
  const files = await Promise.all(fileNames.map((name) => buildFileVolume(join(dir, name), name)))
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

  // 自身直接含图片 → 可作为一卷读
  const hasDirectImage = entries.some((e) => e.isFile() && !isHidden(e.name) && isImage(e.name))
  let self: RawListing['self'] = { readable: false, pageCount: 0, coverUrl: null }
  if (hasDirectImage) {
    const [cover, pageCount] = await Promise.all([findFirstImage(dir), countImages(dir)])
    self = { readable: true, pageCount, coverUrl: cover ? toThumbUrl(cover) : null }
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

  // 文件视图：忠实列磁盘
  ipcMain.handle('library:listSubdirs', async (_event, dir: string) => listSubdirs(dir))
  ipcMain.handle('library:listDirRaw', async (_event, dir: string) => listDirRaw(dir))

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

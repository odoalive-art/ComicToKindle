import { app, dialog, ipcMain, protocol, BrowserWindow } from 'electron'
import { join, extname } from 'path'
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

/**
 * 漫画库数据层：目录扫描 + 封面/图片服务 + 库根目录持久化。
 *
 * 目录约定：
 *   根目录 / 部(文件夹) / 卷册(文件夹或单文件) / [单话子文件夹] / 图片
 *   部文件夹命名通常为 `[作者] 标题`。
 */

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'])
// 显示但暂不解析的单文件卷册；可解压归档（cbz/zip/cbr/rar/7z 及分卷）交由 archive.isArchiveFile 判定
const VIEW_ONLY_EXTS = new Set(['.pdf', '.epub'])

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
  pageCount: number
  coverUrl: string | null
  /** 压缩包卷册：加密且尚未解锁缓存（需密码） */
  locked?: boolean
}

// 自然排序：2.jpg 排在 10.jpg 前面
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const naturalSort = (a: string, b: string): number => collator.compare(a, b)

const isImage = (name: string): boolean => IMAGE_EXTS.has(extname(name).toLowerCase())
/** 可作为一卷展示的单文件：可解压归档（含分卷入口）或显示型 pdf/epub */
const isVolumeFile = (name: string): boolean =>
  isArchiveFile(name) || VIEW_ONLY_EXTS.has(extname(name).toLowerCase())
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
async function scanLibrary(root: string): Promise<LibrarySeries[]> {
  currentRoot = root
  const entries = await readDirSafe(root)
  const seriesDirs = entries
    .filter((e) => e.isDirectory() && !isHidden(e.name))
    .map((e) => e.name)
    .sort(naturalSort)

  const overrides = await readSeriesMeta()
  const result: LibrarySeries[] = []
  for (const name of seriesDirs) {
    const dir = join(root, name)
    const sub = await readDirSafe(dir)
    const volumeCount = sub.filter(isVolumeEntry).length
    const cover = await findFirstImage(dir)
    const { title, author } = resolveSeriesMeta(name, overrides[name])
    result.push({
      id: dir,
      path: dir,
      name,
      title,
      author,
      volumeCount,
      coverUrl: cover ? toThumbUrl(cover) : null
    })
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
        pageCount,
        coverUrl: cover ? toThumbUrl(cover) : null
      })
    } else {
      const base = {
        id: path,
        path,
        name: entry.name,
        title: entry.name.replace(/\.[^.]+$/, ''),
        kind: 'file' as const
      }
      // 已解出缓存 → 用缓存首图作封面、缓存页数
      const cached = isArchiveFile(entry.name) ? await getCachedImages(path) : null
      if (cached && cached.length > 0) {
        result.push({ ...base, pageCount: cached.length, coverUrl: toThumbUrl(cached[0]) })
      } else if (isArchiveFile(entry.name)) {
        // 未解出 → 轻量列表拿页数 + 加密状态（封面待首次打开后出现）
        const info = await inspectArchive(path).catch(() => null)
        result.push({
          ...base,
          pageCount: info?.imageCount ?? 0,
          coverUrl: null,
          locked: info?.encrypted ?? false
        })
      } else {
        // pdf/epub 等暂不支持解析
        result.push({ ...base, pageCount: 0, coverUrl: null })
      }
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

/**
 * 解出一卷的图片绝对路径（按阅读顺序）。
 * 文件夹卷 → 递归收图；压缩包卷 → 读缓存，缺则尝试用密码池解；
 * 仍需密码时抛 'NEEDS_PASSWORD'，由 renderer 走解锁流程后重试。
 */
async function resolveVolumeImagePaths(volumePath: string): Promise<string[]> {
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
    // 安全校验：必须是图片、且位于当前库根目录或压缩包解压缓存目录内
    const norm = filePath ? join(filePath) : null
    const inRoot = !!(norm && currentRoot && norm.startsWith(join(currentRoot)))
    const inCache = !!(norm && norm.startsWith(join(extractedRoot())))
    if (!filePath || !isImage(filePath) || (!inRoot && !inCache)) {
      return new Response('Forbidden', { status: 403 })
    }
    try {
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
}

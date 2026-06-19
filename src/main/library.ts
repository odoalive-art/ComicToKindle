import { app, dialog, ipcMain, protocol, BrowserWindow } from 'electron'
import { join, extname } from 'path'
import { promises as fs } from 'fs'

/**
 * 漫画库数据层：目录扫描 + 封面/图片服务 + 库根目录持久化。
 *
 * 目录约定：
 *   根目录 / 部(文件夹) / 卷册(文件夹或单文件) / [单话子文件夹] / 图片
 *   部文件夹命名通常为 `[作者] 标题`。
 */

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'])
// 预留给将来的单文件卷册（暂未在库中出现）
const ARCHIVE_EXTS = new Set(['.cbz', '.cbr', '.zip', '.pdf', '.epub'])

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
}

// 自然排序：2.jpg 排在 10.jpg 前面
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
const naturalSort = (a: string, b: string): number => collator.compare(a, b)

const isImage = (name: string): boolean => IMAGE_EXTS.has(extname(name).toLowerCase())
const isArchive = (name: string): boolean => ARCHIVE_EXTS.has(extname(name).toLowerCase())
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

/** 从 `[作者] 标题` 解析出作者与标题 */
function parseSeriesName(name: string): { title: string; author: string | null } {
  const match = name.match(/^\s*[[【]([^\]】]+)[\]】]\s*(.+)$/)
  if (match) return { author: match[1].trim(), title: match[2].trim() }
  return { title: name, author: null }
}

const isVolumeEntry = (e: import('fs').Dirent): boolean =>
  !isHidden(e.name) && (e.isDirectory() || (e.isFile() && isArchive(e.name)))

// ---------- 扫描实现 ----------
async function scanLibrary(root: string): Promise<LibrarySeries[]> {
  currentRoot = root
  const entries = await readDirSafe(root)
  const seriesDirs = entries
    .filter((e) => e.isDirectory() && !isHidden(e.name))
    .map((e) => e.name)
    .sort(naturalSort)

  const result: LibrarySeries[] = []
  for (const name of seriesDirs) {
    const dir = join(root, name)
    const sub = await readDirSafe(dir)
    const volumeCount = sub.filter(isVolumeEntry).length
    const cover = await findFirstImage(dir)
    const { title, author } = parseSeriesName(name)
    result.push({
      id: dir,
      path: dir,
      name,
      title,
      author,
      volumeCount,
      coverUrl: cover ? toComicUrl(cover) : null
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
        coverUrl: cover ? toComicUrl(cover) : null
      })
    } else {
      result.push({
        id: path,
        path,
        name: entry.name,
        title: entry.name.replace(/\.[^.]+$/, ''),
        kind: 'file',
        pageCount: 0,
        coverUrl: null
      })
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

async function listPages(volumePath: string): Promise<string[]> {
  const pages = await collectPages(volumePath)
  return pages.map(toComicUrl)
}

/**
 * 按阅读顺序收集一卷的所有图片**绝对路径**（不含 comic:// 包装）。
 * 供转换流水线使用，能正确处理「单话子文件夹」的嵌套结构。
 */
export async function collectVolumeImagePaths(volumePath: string): Promise<string[]> {
  return collectPages(volumePath)
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
    const filePath = new URL(request.url).searchParams.get('p')
    // 安全校验：必须是图片、且位于当前库根目录内
    if (
      !filePath ||
      !isImage(filePath) ||
      !currentRoot ||
      !join(filePath).startsWith(join(currentRoot))
    ) {
      return new Response('Forbidden', { status: 403 })
    }
    try {
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
}

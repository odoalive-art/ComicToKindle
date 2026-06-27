import { ElectronAPI } from '@electron-toolkit/preload'

// 文件夹（纯收纳容器，只有名字；无作者）
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
 * 库根目录的一个顶层项：一本「书(卷册)」或一个「部文件夹」(装了多卷)。
 * 与 main/library.ts 的 LibraryEntry 同形。
 */
export type LibraryEntry =
  | (LibrarySeries & { type: 'folder' })
  | (LibraryVolume & { type: 'book'; author: string | null })

export interface SeriesNode {
  id: string
  title: string
  bookIds: string[]
  createdAt: string
}

export interface BookView {
  id: string
  sourceType: 'archive' | 'pdf' | 'epub' | 'folder'
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
  sourceType: 'archive' | 'pdf' | 'epub' | 'folder'
  seriesTitleHint: string | null
  seriesAuthorHint: string | null
  pageCount: number
}

export interface LibraryView {
  series: Array<SeriesNode & { coverUrl: string | null; volumeCount: number }>
  ungrouped: BookView[]
}

export interface ImportCandidate {
  sourcePath: string
  sourceType: 'archive' | 'pdf' | 'epub' | 'folder'
  displayName: string
}

export interface ImportScanResult {
  candidates: ImportCandidate[]
  skipped: Array<{ path: string; reason: string }>
}

export interface ImportProgress {
  done: number // 已完成的卷数
  total: number // 总卷数
  name: string // 当前正在导入的卷名
  fraction: number // 整体字节进度 0..1（按拷贝字节数算，单个大卷也能平滑推进）
}

export interface LibraryAPI {
  create: () => Promise<string | null>
  open: () => Promise<string | null>
  getSaved: () => Promise<string | null>
  view: () => Promise<LibraryView>
  seriesBooks: (seriesId: string) => Promise<BookView[]>
  inspectBook: (id: string) => Promise<{
    pageCount: number
    locked: boolean
    coverUrl: string | null
  }>
  scanImport: (srcRoot?: string | string[]) => Promise<ImportScanResult>
  getPathForFile: (file: File) => string
  importBooks: (
    candidates: ImportCandidate[],
    opts: { deleteSourceAfter?: boolean }
  ) => Promise<string[]>
  createSeries: (title: string, bookIds: string[]) => Promise<SeriesNode>
  renameSeries: (seriesId: string, title: string) => Promise<void>
  deleteSeries: (seriesId: string, deleteBooks?: boolean) => Promise<void>
  assignBooks: (bookIds: string[], targetSeriesId: string | null) => Promise<void>
  reorderSeries: (orderedSeriesIds: string[]) => Promise<void>
  reorderBooks: (seriesId: string | null, orderedBookIds: string[]) => Promise<void>
  renameBook: (id: string, displayName: string) => Promise<void>
  setBookMeta: (id: string, displayName: string, author: string | null) => Promise<void>
  setBooksAuthor: (ids: string[], author: string | null) => Promise<void>
  renameBooks: (updates: { id: string; displayName: string }[]) => Promise<void>
  trashBooks: (ids: string[]) => Promise<void>
  listTrash: () => Promise<TrashBookView[]>
  restoreTrashBooks: (trashIds: string[]) => Promise<void>
  emptyTrash: () => Promise<void>
  onImportProgress: (cb: (payload: ImportProgress) => void) => () => void
  pickFolder: () => Promise<string | null>
  getSavedRoot: () => Promise<string | null>
  scan: (root: string) => Promise<LibraryEntry[]>
  /** 列出某「部」下的卷册条目（托管库读 manifest） */
  listVolumes: (seriesPath: string) => Promise<LibraryEntry[]>
  listPages: (volumePath: string) => Promise<string[]>
}

export type ArchivePrepareStatus = 'ready' | 'needs-password' | 'error'

export interface ArchivePrepareResult {
  status: ArchivePrepareStatus
  /** error/needs-password 时的稳定码：WRONG_PASSWORD | NO_IMAGES | INSPECT_FAILED | EXTRACT_FAILED */
  message?: string
  /** ready 时回传页数 */
  pageCount?: number
}

/** 解压进度：filePath = 入口卷路径，percent = 0–100 */
export interface ArchiveProgress {
  filePath: string
  percent: number
}

export interface ArchiveAPI {
  prepare: (filePath: string) => Promise<ArchivePrepareResult>
  unlock: (filePath: string, password: string, remember: boolean) => Promise<ArchivePrepareResult>
  onProgress: (cb: (payload: ArchiveProgress) => void) => () => void
}

export type DeviceProfile = 'pw3' | 'pw5' | 'pw6' | 'ko3' | 'oasis' | 'scribe' | 'original'

export interface ConvertOptions {
  deviceProfile?: DeviceProfile
  mangaMode?: boolean
  grayscale?: boolean
  splitDoublePages?: boolean
  imageQuality?: number
  maxVolumeSize?: number
  backgroundColor?: string
  concurrency?: number
}

export interface ConvertOutput {
  path: string
  fileName: string
  sizeBytes: number
  volTitle: string
}

export type ArtifactStatus = 'ready' | 'delivered' | 'failed'

export interface Artifact {
  id: string
  sourceVolumePath: string
  seriesName: string
  title: string
  author: string | null
  outputs: ConvertOutput[]
  format: 'epub'
  pageCount: number
  createdAt: string
  status: ArtifactStatus
}

export interface ConvertRequest {
  sourceVolumePath: string
  seriesName: string
  title: string
  author?: string | null
  options?: ConvertOptions
}

export interface ConvertProgress {
  sourceVolumePath: string
  percent: number
  message: string
}

export interface PreviewPageOutput {
  dataUrl: string
  width: number
  height: number
  bytes: number
}

export interface ConvertPreviewRequest {
  sourceVolumePath: string
  pageIndex: number
  options?: ConvertOptions
}

export interface ConvertPreviewResult {
  isCover: boolean
  split: boolean
  profile: { width: number | null; height: number | null }
  original: { width: number; height: number; bytes: number; dataUrl: string }
  outputs: PreviewPageOutput[]
  pageIndex: number
  pageCount: number
}

export interface ConvertAPI {
  volume: (req: ConvertRequest) => Promise<Artifact>
  preview: (req: ConvertPreviewRequest) => Promise<ConvertPreviewResult>
  cancel: (sourceVolumePath: string) => Promise<void>
  onProgress: (cb: (payload: ConvertProgress) => void) => () => void
}

export interface ArtifactsAPI {
  list: () => Promise<Artifact[]>
  reveal: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export type ConvertJobStatus = 'queued' | 'converting' | 'interrupted' | 'failed'

/**
 * 转换队列持久化记录。renderer 的 ConvertJob 与之同形（双方独立声明）。
 * options 是入队时冻结的 ConvertOptionsState 快照（设置页后续变更不影响已排队任务）。
 */
export interface PersistedConvertJob {
  id: string
  sourceVolumePath: string
  seriesPathName: string
  title: string
  author: string | null
  status: ConvertJobStatus
  percent: number
  error?: string
  options?: ConvertOptions
  enqueuedAt?: string
}

export interface QueueAPI {
  load: () => Promise<PersistedConvertJob[]>
  save: (jobs: PersistedConvertJob[]) => Promise<void>
}

export interface DeliveryConfigInput {
  host: string
  port: number
  user: string
  kindleEmail: string
  password?: string
}

export interface DeliveryConfigPublic {
  host: string
  port: number
  user: string
  kindleEmail: string
  hasPassword: boolean
}

export interface DeliveryResult {
  success: boolean
  /** 稳定错误码，由 renderer 按语言翻译：missing-fields | auth-failed | connection-failed | not-configured | not-found | unknown */
  code?: string
  /** 原始错误细节（如 SMTP 服务器返回的英文），unknown 时供展示 */
  detail?: string
}

export interface DeliverAPI {
  getConfig: () => Promise<DeliveryConfigPublic>
  saveConfig: (cfg: DeliveryConfigInput) => Promise<void>
  testSMTP: (cfg: {
    host: string
    port: number
    user: string
    password?: string
  }) => Promise<DeliveryResult>
  send: (artifactId: string) => Promise<DeliveryResult>
}

export interface WebPushResult {
  success: boolean
  /** 稳定结果码，由 renderer 按语言翻译：not-found | no-outputs | too-large | inject-failed | unknown */
  code?: string
  detail?: string
  /** 自动填充成功的文件名 */
  injected?: string[]
}

export interface WebPushAPI {
  getUrl: () => Promise<string>
  setUrl: (url: string) => Promise<void>
  openBlank: () => Promise<void>
  open: (artifactId: string) => Promise<WebPushResult>
  reveal: (artifactId: string) => Promise<void>
}

export interface CustomAPI {
  library: LibraryAPI
  archive: ArchiveAPI
  convert: ConvertAPI
  artifacts: ArtifactsAPI
  queue: QueueAPI
  deliver: DeliverAPI
  webpush: WebPushAPI
  setBackgroundColor: (color: string) => void
  /** 订阅主进程转发的「重命名选中项」快捷键（Cmd/Ctrl+R）；返回取消订阅函数 */
  onRenameShortcut: (cb: () => void) => () => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}

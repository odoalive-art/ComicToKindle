import { ElectronAPI } from '@electron-toolkit/preload'

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

export interface LibraryAPI {
  pickFolder: () => Promise<string | null>
  getSavedRoot: () => Promise<string | null>
  scan: (root: string) => Promise<LibrarySeries[]>
  listVolumes: (seriesPath: string) => Promise<LibraryVolume[]>
  listPages: (volumePath: string) => Promise<string[]>
  /** 保存某部漫画的名称/作者覆盖（按部文件夹名为键），返回叠加后的结果 */
  setSeriesMeta: (
    name: string,
    meta: { title: string; author: string | null }
  ) => Promise<{ title: string; author: string | null }>
  /** 重命名部/卷（文件夹或单文件，库内），返回新绝对路径 */
  rename: (targetPath: string, newName: string) => Promise<string>
  /** 把若干部/卷移动到目标文件夹（同库内） */
  move: (sourcePaths: string[], destDir: string) => Promise<void>
  /** 在父目录下新建文件夹，返回新绝对路径 */
  createFolder: (parentPath: string, name: string) => Promise<string>
  /** 把若干部/卷移入系统废纸篓 */
  trash: (paths: string[]) => Promise<void>
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
  unlock: (
    filePath: string,
    password: string,
    remember: boolean
  ) => Promise<ArchivePrepareResult>
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
  seriesTitle: string
  volumeTitle: string
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
  seriesTitle: string
  volumeTitle: string
  author?: string | null
  options?: ConvertOptions
}

export interface ConvertProgress {
  sourceVolumePath: string
  percent: number
  message: string
}

export interface ConvertAPI {
  volume: (req: ConvertRequest) => Promise<Artifact>
  cancel: (sourceVolumePath: string) => Promise<void>
  onProgress: (cb: (payload: ConvertProgress) => void) => () => void
}

export interface ArtifactsAPI {
  list: () => Promise<Artifact[]>
  reveal: (id: string) => Promise<void>
  export: (id: string) => Promise<boolean>
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
  seriesTitle: string
  volumeTitle: string
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
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}

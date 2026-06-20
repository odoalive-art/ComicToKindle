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
  pageCount: number
  coverUrl: string | null
}

export interface LibraryAPI {
  pickFolder: () => Promise<string | null>
  getSavedRoot: () => Promise<string | null>
  scan: (root: string) => Promise<LibrarySeries[]>
  listVolumes: (seriesPath: string) => Promise<LibraryVolume[]>
  listPages: (volumePath: string) => Promise<string[]>
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
  convert: ConvertAPI
  artifacts: ArtifactsAPI
  deliver: DeliverAPI
  webpush: WebPushAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}

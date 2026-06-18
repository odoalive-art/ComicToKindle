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

export interface CustomAPI {
  library: LibraryAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
  }
}

export type ViewId =
  | 'library'
  | 'web-push'
  | 'devices-emails'
  | 'extensions'
  | 'design-components'
  | 'foundation-standards'
  | 'app-components'
  | 'archive'

export type ThemeMode = 'light' | 'dark'

// 来自 preload 的 window.api.library 返回类型（单一事实来源：src/preload/index.d.ts）
// 库根顶层项 = 「书(卷册)」或「部文件夹」；书本质上是一卷 LibraryVolume + 作者
export type LibraryEntry = Awaited<ReturnType<Window['api']['library']['scan']>>[number]
export type LibrarySeries = Extract<LibraryEntry, { type: 'folder' }>
export type LibraryBook = Extract<LibraryEntry, { type: 'book' }>
// 某「部」下钻后列出的条目同样是 LibraryEntry（书/卷 或 可继续下钻的子部）。
// 「卷(可读单元)」即其中的 book 变体——读图/转换/解锁等只处理它。
export type LibraryDirEntry = Awaited<ReturnType<Window['api']['library']['listVolumes']>>[number]
export type LibraryVolume = Extract<LibraryDirEntry, { type: 'book' }>

export type Artifact = Awaited<ReturnType<Window['api']['artifacts']['list']>>[number]
export type ImportScanResult = Awaited<ReturnType<Window['api']['library']['scanImport']>>
export type ImportTarget =
  | { kind: 'ungrouped' }
  | { kind: 'series'; seriesId: string }
  | { kind: 'new'; title: string }
export type TrashBookView = Awaited<ReturnType<Window['api']['library']['listTrash']>>[number]

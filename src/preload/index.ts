import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  library: {
    create: (): Promise<string | null> => ipcRenderer.invoke('library:create'),
    open: (): Promise<string | null> => ipcRenderer.invoke('library:open'),
    getSaved: (): Promise<string | null> => ipcRenderer.invoke('library:getSaved'),
    view: () => ipcRenderer.invoke('library:view'),
    seriesBooks: (seriesId: string) => ipcRenderer.invoke('library:seriesBooks', seriesId),
    inspectBook: (id: string) => ipcRenderer.invoke('library:inspectBook', id),
    scanImport: (srcRoot?: string | string[]) => ipcRenderer.invoke('library:scanImport', srcRoot),
    getPathForFile: (file: File): string => webUtils.getPathForFile(file),
    importBooks: (candidates: unknown, opts: unknown) =>
      ipcRenderer.invoke('library:import', candidates, opts),
    createSeries: (title: string, bookIds: string[]) =>
      ipcRenderer.invoke('library:createSeries', title, bookIds),
    renameSeries: (seriesId: string, title: string) =>
      ipcRenderer.invoke('library:renameSeries', seriesId, title),
    deleteSeries: (seriesId: string, deleteBooks?: boolean) =>
      ipcRenderer.invoke('library:deleteSeries', seriesId, deleteBooks),
    assignBooks: (bookIds: string[], targetSeriesId: string | null) =>
      ipcRenderer.invoke('library:assignBooks', bookIds, targetSeriesId),
    reorderSeries: (orderedSeriesIds: string[]) =>
      ipcRenderer.invoke('library:reorderSeries', orderedSeriesIds),
    reorderBooks: (seriesId: string | null, orderedBookIds: string[]) =>
      ipcRenderer.invoke('library:reorderBooks', seriesId, orderedBookIds),
    renameBook: (id: string, displayName: string) =>
      ipcRenderer.invoke('library:renameBook', id, displayName),
    setBookMeta: (id: string, displayName: string, author: string | null) =>
      ipcRenderer.invoke('library:setBookMeta', id, displayName, author),
    setBooksAuthor: (ids: string[], author: string | null) =>
      ipcRenderer.invoke('library:setBooksAuthor', ids, author),
    renameBooks: (updates: { id: string; displayName: string }[]) =>
      ipcRenderer.invoke('library:renameBooks', updates),
    trashBooks: (ids: string[]) => ipcRenderer.invoke('library:trashBooks', ids),
    listTrash: () => ipcRenderer.invoke('library:listTrash'),
    restoreTrashBooks: (trashIds: string[]) =>
      ipcRenderer.invoke('library:restoreTrashBooks', trashIds),
    emptyTrash: () => ipcRenderer.invoke('library:emptyTrash'),
    onImportProgress: (cb: (payload: unknown) => void): (() => void) => {
      const listener = (_e: unknown, payload: unknown): void => cb(payload)
      ipcRenderer.on('library:importProgress', listener)
      return () => ipcRenderer.removeListener('library:importProgress', listener)
    },
    pickFolder: (): Promise<string | null> => ipcRenderer.invoke('library:pickFolder'),
    getSavedRoot: (): Promise<string | null> => ipcRenderer.invoke('library:getSavedRoot'),
    scan: (root: string) => ipcRenderer.invoke('library:scan', root),
    listVolumes: (seriesPath: string) => ipcRenderer.invoke('library:listVolumes', seriesPath),
    listPages: (volumePath: string) => ipcRenderer.invoke('library:listPages', volumePath)
  },
  archive: {
    prepare: (filePath: string) => ipcRenderer.invoke('archive:prepare', filePath),
    unlock: (filePath: string, password: string, remember: boolean) =>
      ipcRenderer.invoke('archive:unlock', filePath, password, remember),
    onProgress: (cb: (payload: unknown) => void): (() => void) => {
      const listener = (_e: unknown, payload: unknown): void => cb(payload)
      ipcRenderer.on('archive:progress', listener)
      return () => ipcRenderer.removeListener('archive:progress', listener)
    }
  },
  convert: {
    volume: (req: unknown) => ipcRenderer.invoke('convert:volume', req),
    preview: (req: unknown) => ipcRenderer.invoke('convert:preview', req),
    cancel: (sourceVolumePath: string) => ipcRenderer.invoke('convert:cancel', sourceVolumePath),
    onProgress: (cb: (payload: unknown) => void): (() => void) => {
      const listener = (_e: unknown, payload: unknown): void => cb(payload)
      ipcRenderer.on('convert:progress', listener)
      return () => ipcRenderer.removeListener('convert:progress', listener)
    }
  },
  artifacts: {
    list: () => ipcRenderer.invoke('artifacts:list'),
    reveal: (id: string) => ipcRenderer.invoke('artifacts:reveal', id),
    remove: (id: string) => ipcRenderer.invoke('artifacts:remove', id)
  },
  queue: {
    load: () => ipcRenderer.invoke('queue:load'),
    save: (jobs: unknown) => ipcRenderer.invoke('queue:save', jobs)
  },
  deliver: {
    getConfig: () => ipcRenderer.invoke('deliver:getConfig'),
    saveConfig: (cfg: unknown) => ipcRenderer.invoke('deliver:saveConfig', cfg),
    testSMTP: (cfg: unknown) => ipcRenderer.invoke('deliver:testSMTP', cfg),
    send: (artifactId: string) => ipcRenderer.invoke('deliver:send', artifactId)
  },
  webpush: {
    getUrl: (): Promise<string> => ipcRenderer.invoke('webpush:getUrl'),
    setUrl: (url: string) => ipcRenderer.invoke('webpush:setUrl', url),
    openBlank: () => ipcRenderer.invoke('webpush:openBlank'),
    open: (artifactId: string) => ipcRenderer.invoke('webpush:open', artifactId),
    reveal: (artifactId: string) => ipcRenderer.invoke('webpush:reveal', artifactId)
  },
  upscale: {
    getConfig: () => ipcRenderer.invoke('upscale:getConfig'),
    setConfig: (patch: unknown) => ipcRenderer.invoke('upscale:setConfig', patch),
    status: () => ipcRenderer.invoke('upscale:status'),
    clearCache: () => ipcRenderer.invoke('upscale:clearCache'),
    cacheSize: () => ipcRenderer.invoke('upscale:cacheSize'),
    peek: (sourcePath: string) => ipcRenderer.invoke('upscale:peek', sourcePath)
  },
  setBackgroundColor: (color: string): void => ipcRenderer.send('set-background-color', color),
  // 主进程把被收敛的浏览器快捷键复用为应用动作（如 Cmd/Ctrl+R → 重命名选中项）后转发到这里
  onRenameShortcut: (cb: () => void): (() => void) => {
    const listener = (): void => cb()
    ipcRenderer.on('app:rename-selected', listener)
    return () => ipcRenderer.removeListener('app:rename-selected', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

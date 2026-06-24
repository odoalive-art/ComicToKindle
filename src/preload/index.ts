import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  library: {
    create: (name: string): Promise<string | null> => ipcRenderer.invoke('library:create', name),
    open: (): Promise<string | null> => ipcRenderer.invoke('library:open'),
    getSaved: (): Promise<string | null> => ipcRenderer.invoke('library:getSaved'),
    view: () => ipcRenderer.invoke('library:view'),
    seriesBooks: (seriesId: string) => ipcRenderer.invoke('library:seriesBooks', seriesId),
    inspectBook: (id: string) => ipcRenderer.invoke('library:inspectBook', id),
    scanImport: (srcRoot?: string) => ipcRenderer.invoke('library:scanImport', srcRoot),
    importBooks: (candidates: unknown, opts: unknown) =>
      ipcRenderer.invoke('library:import', candidates, opts),
    createSeries: (title: string, author: string | null, bookIds: string[]) =>
      ipcRenderer.invoke('library:createSeries', title, author, bookIds),
    renameSeries: (seriesId: string, title: string, author: string | null) =>
      ipcRenderer.invoke('library:renameSeries', seriesId, title, author),
    deleteSeries: (seriesId: string) => ipcRenderer.invoke('library:deleteSeries', seriesId),
    assignBooks: (bookIds: string[], targetSeriesId: string | null) =>
      ipcRenderer.invoke('library:assignBooks', bookIds, targetSeriesId),
    reorderSeries: (orderedSeriesIds: string[]) =>
      ipcRenderer.invoke('library:reorderSeries', orderedSeriesIds),
    reorderBooks: (seriesId: string | null, orderedBookIds: string[]) =>
      ipcRenderer.invoke('library:reorderBooks', seriesId, orderedBookIds),
    renameBook: (id: string, displayName: string) =>
      ipcRenderer.invoke('library:renameBook', id, displayName),
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
    listSubdirs: (dir: string) => ipcRenderer.invoke('library:listSubdirs', dir),
    listDirRaw: (dir: string) => ipcRenderer.invoke('library:listDirRaw', dir),
    inspectVolume: (volumePath: string) => ipcRenderer.invoke('library:inspectVolume', volumePath),
    listPages: (volumePath: string) => ipcRenderer.invoke('library:listPages', volumePath),
    setSeriesMeta: (name: string, meta: { title: string; author: string | null }) =>
      ipcRenderer.invoke('library:setSeriesMeta', name, meta),
    rename: (targetPath: string, newName: string): Promise<string> =>
      ipcRenderer.invoke('library:rename', targetPath, newName),
    move: (sourcePaths: string[], destDir: string): Promise<void> =>
      ipcRenderer.invoke('library:move', sourcePaths, destDir),
    createFolder: (parentPath: string, name: string): Promise<string> =>
      ipcRenderer.invoke('library:createFolder', parentPath, name),
    trash: (paths: string[]): Promise<void> => ipcRenderer.invoke('library:trash', paths)
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
    export: (id: string): Promise<boolean> => ipcRenderer.invoke('artifacts:export', id),
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
  setBackgroundColor: (color: string): void => ipcRenderer.send('set-background-color', color)
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

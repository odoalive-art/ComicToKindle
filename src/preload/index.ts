import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  library: {
    pickFolder: (): Promise<string | null> => ipcRenderer.invoke('library:pickFolder'),
    getSavedRoot: (): Promise<string | null> => ipcRenderer.invoke('library:getSavedRoot'),
    scan: (root: string) => ipcRenderer.invoke('library:scan', root),
    listVolumes: (seriesPath: string) => ipcRenderer.invoke('library:listVolumes', seriesPath),
    listPages: (volumePath: string) => ipcRenderer.invoke('library:listPages', volumePath)
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

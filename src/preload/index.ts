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
  },
  convert: {
    volume: (req: unknown) => ipcRenderer.invoke('convert:volume', req),
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
  deliver: {
    getConfig: () => ipcRenderer.invoke('deliver:getConfig'),
    saveConfig: (cfg: unknown) => ipcRenderer.invoke('deliver:saveConfig', cfg),
    testSMTP: (cfg: unknown) => ipcRenderer.invoke('deliver:testSMTP', cfg),
    send: (artifactId: string) => ipcRenderer.invoke('deliver:send', artifactId)
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

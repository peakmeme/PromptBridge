import { contextBridge, ipcRenderer } from 'electron'
import { exposeElectronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  ping: () => ipcRenderer.send('ping'),
  processFile: (filePath: string) => ipcRenderer.invoke('process-file', filePath),
  hideSearchWindow: () => ipcRenderer.send('hide-search-window'),
  searchKnowledge: (query: string) => ipcRenderer.invoke('search-knowledge', query),
  clearKnowledge: () => ipcRenderer.invoke('clear-knowledge'),
  getIndexedFiles: () => ipcRenderer.invoke('get-indexed-files'),
  deleteIndexedFiles: (filePaths: string[]) => ipcRenderer.invoke('delete-indexed-files', filePaths),
  getDbPath: () => ipcRenderer.invoke('get-db-path')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    exposeElectronAPI()
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = exposeElectronAPI()
  // @ts-ignore (define in dts)
  window.api = api
}

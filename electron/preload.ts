import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

const maximizedListeners = new Map<() => void, (event: IpcRendererEvent) => void>()
const notMaximizedListeners = new Map<() => void, (event: IpcRendererEvent) => void>()

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  restore: () => ipcRenderer.send('restore'),
  close: () => ipcRenderer.send('close'),

  onMaximized: (callback: () => void) => {
    const wrapped = (_event: IpcRendererEvent) => callback()
    maximizedListeners.set(callback, wrapped)
    ipcRenderer.on('maximized', wrapped)
  },
  offMaximized: (callback: () => void) => {
    const wrapped = maximizedListeners.get(callback)
    if (wrapped) {
      ipcRenderer.removeListener('maximized', wrapped)
      maximizedListeners.delete(callback)
    }
  },

  onNotMaximized: (callback: () => void) => {
    const wrapped = (_event: IpcRendererEvent) => callback()
    notMaximizedListeners.set(callback, wrapped)
    ipcRenderer.on('not-maximized', wrapped)
  },
  offNotMaximized: (callback: () => void) => {
    const wrapped = notMaximizedListeners.get(callback)
    if (wrapped) {
      ipcRenderer.removeListener('not-maximized', wrapped)
      notMaximizedListeners.delete(callback)
    }
  },

})

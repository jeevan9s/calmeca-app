import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { exportType, exportResponse, importResponse } from '@/services/db'

const maximizedListeners = new Map<() => void, (event: IpcRendererEvent) => void>()
const notMaximizedListeners = new Map<() => void, (event: IpcRendererEvent) => void>()
const loginSuccessListeners = new Map<(event: IpcRendererEvent, data: any) => void, (event: IpcRendererEvent, data: any) => void>()

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  restore: () => ipcRenderer.send('restore'),
  close: () => ipcRenderer.send('close'),
  googleLogin: async () => ipcRenderer.invoke('google-login'),
  googleLogout: async () => ipcRenderer.invoke('google-logout'),

  gTextExport: (content: string, filename: string, type: exportType): Promise<exportResponse> =>
    ipcRenderer.invoke('drive-export-text', { content, filename, type }),

  gImportFile: (fileId: string): Promise<importResponse> =>
    ipcRenderer.invoke('drive-import-file', fileId),

  openGooglePicker: async (): Promise<string> =>
    ipcRenderer.invoke('open-google-picker'),

  sendFileId: (fileId: string) =>
    ipcRenderer.send('google-picker-file-id', fileId),

  startLoginRedirect: async () =>
    ipcRenderer.invoke('start-google-login'),

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

  onLoginSuccess: (callback: (event: IpcRendererEvent, data: any) => void) => {
    loginSuccessListeners.set(callback, callback)
    ipcRenderer.on('google-login-success', callback)
  },

  removeLoginSuccessListener: (callback: (event: IpcRendererEvent, data: any) => void) => {
    const wrapped = loginSuccessListeners.get(callback)
    if (wrapped) {
      ipcRenderer.removeListener('google-login-success', wrapped)
      loginSuccessListeners.delete(callback)
    }
  },
})

const pickerArgs = process.argv.reduce<Record<string, string>>((acc, arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/)
  if (match) acc[match[1]] = match[2]
  return acc
}, {})

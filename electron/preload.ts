import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

const maximizedListeners = new Map<() => void, (event: IpcRendererEvent) => void>();
const notMaximizedListeners = new Map<() => void, (event: IpcRendererEvent) => void>();
const loginSuccessListeners = new Map<(data: any) => void, (event: IpcRendererEvent, data: any) => void>();

contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  restore: () => ipcRenderer.send("restore"),
  close: () => ipcRenderer.send("close"),

  googleLogin: async () => ipcRenderer.invoke("google-login"),
  googleLogout: async () => ipcRenderer.invoke("google-logout"),
  startMicrosoftLogin: async () => ipcRenderer.invoke("start-microsoft-login"),
  microsoftLogout: async () => ipcRenderer.invoke("microsoft-logout"),

  startLoginRedirect: async () => ipcRenderer.invoke("start-google-login"),

  fetchGoogleCalendarEvents: () => ipcRenderer.invoke("fetch-google-calendar-events"),
  addGoogleCalendarEvent: (summary: string, start: string) =>
    ipcRenderer.invoke("add-google-calendar-event", { summary, start }),

  readPDF: (filePath: string) => ipcRenderer.invoke("read-pdf", filePath),
  extractCourse: (text: string) => ipcRenderer.invoke("extract-course", text),
  extractCourseFromPDF: (filePath: string) => ipcRenderer.invoke("extract-course-from-pdf", filePath),

  onMaximized: (callback: () => void) => {
    const wrapped = (_event: IpcRendererEvent) => callback();
    maximizedListeners.set(callback, wrapped);
    ipcRenderer.on("maximized", wrapped);
  },
  offMaximized: (callback: () => void) => {
    const wrapped = maximizedListeners.get(callback);
    if (wrapped) {
      ipcRenderer.removeListener("maximized", wrapped);
      maximizedListeners.delete(callback);
    }
  },

  onNotMaximized: (callback: () => void) => {
    const wrapped = (_event: IpcRendererEvent) => callback();
    notMaximizedListeners.set(callback, wrapped);
    ipcRenderer.on("not-maximized", wrapped);
  },
  offNotMaximized: (callback: () => void) => {
    const wrapped = notMaximizedListeners.get(callback);
    if (wrapped) {
      ipcRenderer.removeListener("not-maximized", wrapped);
      notMaximizedListeners.delete(callback);
    }
  },

  onLoginSuccess: (callback: (data: any) => void) => {
    const wrapped = (_event: IpcRendererEvent, data: any) => callback(data);
    loginSuccessListeners.set(callback, wrapped);
    ipcRenderer.on("google-login-success", wrapped);
  },
  removeLoginSuccessListener: (callback: (data: any) => void) => {
    const wrapped = loginSuccessListeners.get(callback);
    if (wrapped) {
      ipcRenderer.removeListener("google-login-success", wrapped);
      loginSuccessListeners.delete(callback);
    }
  },

  onMicrosoftLoginSuccess: (callback: (data: any) => void) => {
    const wrapped = (_event: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on("microsoft-login-success", wrapped);
  },
  removeMicrosoftLoginSuccessListener: (callback: (data: any) => void) => {
    ipcRenderer.removeListener("microsoft-login-success", callback);
  },
});

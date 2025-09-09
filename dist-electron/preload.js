"use strict";
const electron = require("electron");
const maximizedListeners = /* @__PURE__ */ new Map();
const notMaximizedListeners = /* @__PURE__ */ new Map();
const loginSuccessListeners = /* @__PURE__ */ new Map();
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => electron.ipcRenderer.send("minimize"),
  maximize: () => electron.ipcRenderer.send("maximize"),
  restore: () => electron.ipcRenderer.send("restore"),
  close: () => electron.ipcRenderer.send("close"),
  googleLogin: async () => electron.ipcRenderer.invoke("google-login"),
  googleLogout: async () => electron.ipcRenderer.invoke("google-logout"),
  startMicrosoftLogin: async () => electron.ipcRenderer.invoke("start-microsoft-login"),
  microsoftLogout: async () => electron.ipcRenderer.invoke("microsoft-logout"),
  startLoginRedirect: async () => electron.ipcRenderer.invoke("start-google-login"),
  fetchGoogleCalendarEvents: () => electron.ipcRenderer.invoke("fetch-google-calendar-events"),
  addGoogleCalendarEvent: (summary, start) => electron.ipcRenderer.invoke("add-google-calendar-event", { summary, start }),
  readPDF: (filePath) => electron.ipcRenderer.invoke("read-pdf", filePath),
  extractCourse: (text) => electron.ipcRenderer.invoke("extract-course", text),
  extractCourseFromPDF: (filePath) => electron.ipcRenderer.invoke("extract-course-from-pdf", filePath),
  onMaximized: (callback) => {
    const wrapped = (_event) => callback();
    maximizedListeners.set(callback, wrapped);
    electron.ipcRenderer.on("maximized", wrapped);
  },
  offMaximized: (callback) => {
    const wrapped = maximizedListeners.get(callback);
    if (wrapped) {
      electron.ipcRenderer.removeListener("maximized", wrapped);
      maximizedListeners.delete(callback);
    }
  },
  onNotMaximized: (callback) => {
    const wrapped = (_event) => callback();
    notMaximizedListeners.set(callback, wrapped);
    electron.ipcRenderer.on("not-maximized", wrapped);
  },
  offNotMaximized: (callback) => {
    const wrapped = notMaximizedListeners.get(callback);
    if (wrapped) {
      electron.ipcRenderer.removeListener("not-maximized", wrapped);
      notMaximizedListeners.delete(callback);
    }
  },
  onLoginSuccess: (callback) => {
    const wrapped = (_event, data) => callback(data);
    loginSuccessListeners.set(callback, wrapped);
    electron.ipcRenderer.on("google-login-success", wrapped);
  },
  removeLoginSuccessListener: (callback) => {
    const wrapped = loginSuccessListeners.get(callback);
    if (wrapped) {
      electron.ipcRenderer.removeListener("google-login-success", wrapped);
      loginSuccessListeners.delete(callback);
    }
  },
  onMicrosoftLoginSuccess: (callback) => {
    const wrapped = (_event, data) => callback(data);
    electron.ipcRenderer.on("microsoft-login-success", wrapped);
  },
  removeMicrosoftLoginSuccessListener: (callback) => {
    electron.ipcRenderer.removeListener("microsoft-login-success", callback);
  }
});

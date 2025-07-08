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
  gTextExport: (content, filename, type) => electron.ipcRenderer.invoke("drive-export-text", { content, filename, type }),
  gImportFile: (fileId) => electron.ipcRenderer.invoke("drive-import-file", fileId),
  openGooglePicker: async () => electron.ipcRenderer.invoke("open-google-picker"),
  sendFileId: (fileId) => electron.ipcRenderer.send("google-picker-file-id", fileId),
  startLoginRedirect: async () => electron.ipcRenderer.invoke("start-google-login"),
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
    loginSuccessListeners.set(callback, callback);
    electron.ipcRenderer.on("google-login-success", callback);
  },
  removeLoginSuccessListener: (callback) => {
    const wrapped = loginSuccessListeners.get(callback);
    if (wrapped) {
      electron.ipcRenderer.removeListener("google-login-success", wrapped);
      loginSuccessListeners.delete(callback);
    }
  }
});
process.argv.reduce((acc, arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});

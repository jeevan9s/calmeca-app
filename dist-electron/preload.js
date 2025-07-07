"use strict";
const electron = require("electron");
const maximizedListeners = /* @__PURE__ */ new Map();
const notMaximizedListeners = /* @__PURE__ */ new Map();
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => electron.ipcRenderer.send("minimize"),
  maximize: () => electron.ipcRenderer.send("maximize"),
  restore: () => electron.ipcRenderer.send("restore"),
  close: () => electron.ipcRenderer.send("close"),
  googleLogin: async () => electron.ipcRenderer.invoke("google-login"),
  googleLogout: async () => electron.ipcRenderer.invoke("google-logout"),
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
  }
});

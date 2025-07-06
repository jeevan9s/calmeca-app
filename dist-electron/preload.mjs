"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  minimize: () => electron.ipcRenderer.send("minimize"),
  maximize: () => electron.ipcRenderer.send("maximize"),
  restore: () => electron.ipcRenderer.send("restore"),
  close: () => electron.ipcRenderer.send("close"),
  // Listen for maximize/unmaximize events
  onMaximized: (callback) => electron.ipcRenderer.on("maximized", callback),
  onNotMaximized: (callback) => electron.ipcRenderer.on("not-maximized", callback),
  // Google authentication
  googleLogin: () => electron.ipcRenderer.invoke("google-login"),
  googleLogout: () => electron.ipcRenderer.invoke("google-logout"),
  // Listen for main process messages
  onMainProcessMessage: (callback) => {
    electron.ipcRenderer.on("main-process-message", (_event, message) => callback(message));
  }
});

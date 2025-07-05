const { app, ipcMain } = require('electron');
const { BrowserWindow, setVibrancy } = require('electron-acrylic-window');


import dotenv from "dotenv"
dotenv.config()


const path = require('path');

const APP_ROOT = path.join(__dirname, '..');
const RENDERER_DIST = path.join(APP_ROOT, 'dist');

let win: typeof BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 400,
    minWidth: 600,
    center: true,
    frame: false,
    resizable: true,
    transparent: true,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    icon: path.join(APP_ROOT, 'public', 'taskbar.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  setVibrancy(win, {
    theme: 'dark',
    effect: 'acrylic',
    useCustomWindowRefreshMethod: true,
    maximumRefreshRate: 60,
    disableOnBlur: true,
    debug: true,
  });

  win.on('maximize', () => {
    win?.webContents.send('maximized');
  });

  win.on('unmaximize', () => {
    win?.webContents.send('not-maximized');
  });

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  // Load renderer
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

ipcMain.on('minimize', () => win?.minimize());
ipcMain.on('maximize', () => win?.maximize());
ipcMain.on('restore', () => {
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.restore(); 
  }
});
ipcMain.on('close', () => win?.close());


// google auth
import { clearSavedTokens, getAuthClient } from "../src/services/utils & integrations/googleAuth";
import { google } from "googleapis";

// listeners for login & logut requests
ipcMain.handle('google-login', async () => {
  try {
    const authClient = await getAuthClient()

    const oauth2 = google.oauth2({version: 'v2', auth: authClient})
    const {data} = await oauth2.userinfo.get()
    return { success:true, tokens: authClient.credentials, user: {
      name: data.name,
      email: data.email,
      picture: data.picture
    }}
  } catch (err:unknown) {
    let message = 'Unkown error'
    if (err instanceof Error) {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    }
    console.error('Google login failed: ', message)
    return { success: false, error: message} 
  }
})

ipcMain.handle('google-logout', async () => {
  try {
    clearSavedTokens()
    return { success: true}
  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) {
      message = err.message
     } else if (typeof err === 'string') {
      message = err
     }
     console.log('Google logout failed: ', message)
     return {success: false, error: message}
  }
})


import type { IpcMainInvokeEvent } from 'electron'
import { exportTextFeatureGDrive } from "../src/services/utils & integrations/googleService";
import { exportType } from "../src/services/db";

interface ExportTextArgs {
  content: string
  filename: string
  exportType: exportType
}

ipcMain.handle('google-export-text', async (_event: IpcMainInvokeEvent, args: ExportTextArgs) => {
  const { content, filename, exportType } = args

  try {
    const result = await exportTextFeatureGDrive(content, filename, exportType)
    return { success: true, ...result }
  } catch (err: unknown) {
    console.error('Export failed:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
})


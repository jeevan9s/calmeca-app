import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import express from 'express'
import { createRequire } from 'module'
import {
  initializeTokenPath,
} from '../src/services/integrations-utils/google/googleAuth'
import { initializeTokenPath as initializeMsTokenPath } from '../src/services/integrations-utils/microsoft/microsoftAuth'


import { registerGoogleHandlers } from '@/lib/handlers/googleHandlers'
import { registerMicrosoftHandlers } from '@/lib/handlers/microsoftHandler'
import { registerNLPHandlers } from "@/lib/handlers/NLPHandler";

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let win: BrowserWindow | null = null
let setVibrancy: any = null

try {
  const electronAcrylic = require('electron-acrylic-window')
  setVibrancy = electronAcrylic.setVibrancy
} catch (error) {
  console.warn('electron-acrylic-window not available:', error)
}

app.name = 'Calmeca'


initializeTokenPath()
initializeMsTokenPath()

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    center: true,
    frame: false,
    transparent: true,
    resizable: true,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'taskbar.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    
  })

  win.on('resize', () => {
  if (win && win.webContents) {
    win.webContents.send(win.isMaximized() ? 'maximized' : 'not-maximized')
  }
})

  if (setVibrancy && win) {
    try {
      setVibrancy(win, {
        theme: 'dark',
        effect: 'acrylic',
        useCustomWindowRefreshMethod: true,
        maximumRefreshRate: 60,
        disableOnBlur: true,
        debug: true,
      })
    } catch (error) {
      console.warn('Failed to apply vibrancy:', error)
    }
  }

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)

  } else {
    win.loadFile(path.join(__dirname, './index.html'))
  }

  win.on('closed', () => {
    win = null
  })

  win.on('maximize', () => {
    if (win && win.webContents) {
      win.webContents.send('maximized')
    }
  })

  win.on('unmaximize', () => {
    if (win && win.webContents) {
      win.webContents.send('not-maximized')
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.disableHardwareAcceleration()
app.whenReady().then(() => {
  createWindow()

  const expressApp = express()
  const PORT = 3000
  expressApp.use(express.static(path.join(__dirname, '..', 'assets')))
  expressApp.listen(PORT, () => {
    console.log(`Static server running on http://localhost:${PORT}`)
  })
})


ipcMain.on('minimize', () => {
  if (win) win.minimize()
})

ipcMain.on('maximize', () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})

ipcMain.on('restore', () => {
  if (!win) return

  if (win.isMinimized()) {
    win.restore()
  } else if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.focus()
  }
})


ipcMain.on('close', () => {
  if (win) win.close()
})

// GOOGLE, MICROSOFT, NLP handlers
registerGoogleHandlers(win!);
registerMicrosoftHandlers(win!);
registerNLPHandlers(win!);




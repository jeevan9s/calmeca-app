import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Paths
const APP_ROOT = path.join(__dirname, '..')
const RENDERER_DIST = path.join(APP_ROOT, 'dist')

let win: BrowserWindow | null = null

function createWindow() {
win = new BrowserWindow({
  width: 800,
  height: 600,
  center: true,
  frame: false,
  resizable: true,
  autoHideMenuBar: true,
  icon: path.join(APP_ROOT, 'public', 'electron-vite.svg'),
  webPreferences: {
    preload: path.join(__dirname, 'preload.mjs'),
    contextIsolation: true,
    nodeIntegration: false,
  },
});

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Load dev server if present, else load built HTML
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit app except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

// On macOS recreate window when dock icon clicked and no windows open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)

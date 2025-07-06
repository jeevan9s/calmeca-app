import { app, BrowserWindow , ipcMain} from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { setVibrancy } = require('electron-acrylic-window')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let win: BrowserWindow | null = null


// window init
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
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  setVibrancy(win, {
    theme: 'dark',
    effect: 'acrylic',
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, './index.html'))
  }

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  win.on('closed', () => {
    win = null
  })

  win.on('maximize', () => {
  win!.webContents.send('maximized');
});

win.on('unmaximize', () => {
  win!.webContents.send('not-maximized');
});
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
app.whenReady().then(createWindow)

// IPC controls
ipcMain.on('minimize', () => win?.minimize());

ipcMain.on('maximize', () => {
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on('restore', () => {
  win?.restore();
});

ipcMain.on('close', () => win?.close());

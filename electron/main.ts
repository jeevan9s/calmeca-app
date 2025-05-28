const { app, ipcMain } = require('electron');
const { BrowserWindow, setVibrancy } = require('electron-acrylic-window');
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

// IPC controls
ipcMain.on('minimize', () => win?.minimize());
ipcMain.on('maximize', () => win?.maximize());
ipcMain.on('restore', () => win?.restore());
ipcMain.on('close', () => win?.close());

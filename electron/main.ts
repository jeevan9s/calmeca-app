import { app, BrowserWindow , ipcMain} from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { createRequire } from 'module'
import { google } from 'googleapis';
import { getAuthClient, clearSavedTokens } from 'src/services/integrations-utils/google/googleAuth'


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
    useCustomWindowRefreshMethod: true,
    maximumRefreshRate: 60,
    disableOnBlur: true,
    debug: true,
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

app.disableHardwareAcceleration();
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

ipcMain.handle('google-login', async () => {
  try {
    const authClient = await getAuthClient();

    const oauth2 = google.oauth2({ version: 'v2', auth: authClient });
    const { data } = await oauth2.userinfo.get();

    return {
      success: true,
      tokens: authClient.credentials,
      user: {
        name: data.name,
        email: data.email,
        picture: data.picture,
      },
    };
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
    console.error('Google login failed: ', message);
    return { success: false, error: message };
  }
});

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
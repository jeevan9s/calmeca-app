import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import express from 'express'
import { createRequire } from 'module'
import { google } from 'googleapis'
import {
  getAuthClient,
  clearSavedTokens,
  initializeTokenPath,
  getTokenPath,
} from '../src/services/integrations-utils/google/googleAuth'
import { exportTextFeatureGDrive, importDriveFile } from '@/services/integrations-utils/google/googleService'
import { exportType } from '@/services/db'

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
  if (win) win.restore()
})

ipcMain.on('close', () => {
  if (win) win.close()
})

ipcMain.handle('start-google-login', async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { authUrl, verifier } = await (await import('../src/services/integrations-utils/google/googleAuth')).authenticateWithGoogle()
      
      let authWindow: BrowserWindow | null = new BrowserWindow({
        width: 500,
        height: 600,
        parent: win ?? undefined,
        modal: true,
        show: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, '..', 'assets', 'taskbar.png'),
        webPreferences: {
          preload: path.join(__dirname, '..', 'src', 'preload.js'),
          contextIsolation: true,
          nodeIntegration: false,
        }
      })

      authWindow.loadURL(authUrl)
      authWindow.once('ready-to-show', () => {
        if (authWindow) authWindow.show()
      })

      const clientId = process.env.G_CLIENT_ID
      const clientSecret = process.env.G_CLIENT_SECRET
      const redirectUri = process.env.G_REDIRECT_URI

      if (!clientId || !clientSecret || !redirectUri) {
        reject(new Error('Missing OAuth configuration'))
        authWindow?.close()
        return
      }

      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

      authWindow.webContents.on('will-redirect', async (event, url) => {
        if (!url.startsWith(redirectUri)) return

        event.preventDefault()
        const parsedUrl = new URL(url)
        const code = parsedUrl.searchParams.get('code')
        const error = parsedUrl.searchParams.get('error')

        if (error) {
          reject(new Error(`OAuth error: ${error}`))
          authWindow?.close()
          return
        }

        if (!code) {
          reject(new Error('No code found in redirect URL'))
          authWindow?.close()
          return
        }

        console.log('Exchanging token with code:', code)
        console.log('Client ID:', clientId)
        console.log('Redirect URI:', redirectUri)

        try {
          const { tokens } = await oauth2Client.getToken({
            code,
            codeVerifier: verifier,
            redirect_uri: redirectUri,
          })
          console.log('Received tokens:', tokens)
          oauth2Client.setCredentials(tokens)

          const tokenPath = getTokenPath()
          const fs = await import('fs')
          fs.writeFileSync(tokenPath, JSON.stringify(tokens))

          if (authWindow) {
            authWindow.loadFile(path.join(__dirname, '..', 'assets', 'oauth-redirect.html'))
          }

          setTimeout(() => {
            authWindow?.close()
            authWindow = null
            resolve({ success: true, tokens })
          }, 10000)
        } catch (tokenError) {
          console.error('Token exchange failed:', tokenError)
          reject(tokenError)
          authWindow?.close()
          authWindow = null
        }
      })

      authWindow.on('closed', () => {
        authWindow = null
        reject(new Error('User closed the login window'))
      })
    } catch (error) {
      console.error('Failed to start Google login:', error)
      reject(error)
    }
  })
})

// GOOGLE AUTH HANDLERS

ipcMain.handle('google-login', async () => {
  try {
    const authClient = await getAuthClient()
    if (!authClient) throw new Error('No valid auth client')
    
    const oauth2 = google.oauth2({ version: 'v2', auth: authClient })
    const { data } = await oauth2.userinfo.get()

    return {
      success: true,
      tokens: authClient.credentials,
      user: {
        name: data.name,
        email: data.email,
        picture: data.picture,
      },
    }
  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    }
    console.error(message)
    return { success: false, error: message }
  }
})

  function showLogoutNotification() {
new Notification({
  title: 'Logout Successful',
  body: 'Google logout successful',
  silent: false,
}).show();

}

ipcMain.handle('google-logout', async () => {
  try {
    clearSavedTokens()
    showLogoutNotification()
    return { success: true }

  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    }
    console.error(message)
    return { success: false, error: message }
  }
})

// GOOGLE IMPORT/EXPORT HANDLERS
ipcMain.handle('drive-export-text', async (_event, args: { content: string; filename: string; type: exportType }) => {
  try {
    const { content, filename, type } = args
    const res = await exportTextFeatureGDrive(content, filename, type)
    console.log("file exported: ", filename)
    return {
  success: true,
  fileId: res.fileId,
  name: res.name,
  driveUrl: res.driveUrl,
}
  } catch (error) {
    console.error('Export error:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('drive-import-file', async (_event, fileId: string) => {
  try {
    const res = await importDriveFile(fileId)

    console.log("Imported file:", res.name) 
    return {
      success: true,
      name: res.name,
      content: res.content,
    }
  } catch (error) {
    console.log("Import error: ", error)
    return { success: false, error: (error as Error).message }
  }
})

// drive picka
ipcMain.handle('open-google-picker', async () => {
  const apiKey = process.env.G_API_KEY ?? ''
  const token = (await getAuthClient())?.credentials.access_token ?? ''
  // console.log('Google Picker API Key:', apiKey);
  // console.log('Google Picker OAuth Token:', token);

  const pickerWindow = new BrowserWindow({
    width: 600,
    height: 600,
    modal: true,
    backgroundColor: '#121212',
    parent: BrowserWindow.getFocusedWindow() ?? undefined,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'taskbar.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
    },
  })


await pickerWindow.loadURL('http://localhost:3000/picker.html')


  await pickerWindow.webContents.executeJavaScript(`
    window.pickerConfig = {
      apiKey: ${JSON.stringify(apiKey)},
      token: ${JSON.stringify(token)}
    };
  `)

  pickerWindow.show()

  return new Promise((resolve, reject) => {
    const handleMessage = (_event: any, fileId: string) => {
      resolve(fileId)
      pickerWindow.close()
    }

    ipcMain.once('google-picker-file-id', handleMessage)

    pickerWindow.on('closed', () => {
      ipcMain.removeListener('google-picker-file-id', handleMessage)
      reject(new Error('Picker window closed without selection'))
    })
  })
})

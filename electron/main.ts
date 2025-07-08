import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { createRequire } from 'module'
import { google } from 'googleapis'
import {
  getAuthClient,
  clearSavedTokens,
  initializeTokenPath,
  getTokenPath,
} from '../src/services/integrations-utils/google/googleAuth'

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
    win.webContents.openDevTools()
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
app.whenReady().then(createWindow)

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
      console.log('Client secret present?', !!clientSecret)

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
    console.error('Google login failed:', message)
    return { success: false, error: message }
  }
})

ipcMain.handle('google-logout', async () => {
  try {
    clearSavedTokens()
    return { success: true }
  } catch (err: unknown) {
    let message = 'Unknown error'
    if (err instanceof Error) {
      message = err.message
    } else if (typeof err === 'string') {
      message = err
    }
    console.error('Google logout failed:', message)
    return { success: false, error: message }
  }
})
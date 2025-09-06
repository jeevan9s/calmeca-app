import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import express from 'express'
import { createRequire } from 'module'
import { google } from 'googleapis'
import {
  getAuthClient,
  clearSavedTokens,
  initializeTokenPath,
  getTokenPath,
} from '../src/services/integrations-utils/google/googleAuth'

import {
  getAuthUrl as getMsAuthUrl,
  acquireTokenByCode as acquireMsTokenByCode,
  clearSavedTokens as clearMsTokens,
  initializeTokenPath as initializeMsTokenPath,
  getTokenPath as getMsTokenPath,
  loadSavedTokens as loadMsTokens,
} from '../src/services/integrations-utils/microsoft/microsoftAuth';





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

// GOOGLE

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

      authWindow.on('closed', () => {
        authWindow = null
        reject(new Error('login window closed'))
      })

      const clientId = process.env.G_CLIENT_ID
      const clientSecret = process.env.G_CLIENT_SECRET
      const redirectUri = process.env.G_REDIRECT_URI

      if (!clientId || !clientSecret || !redirectUri) {
        reject(new Error('missing OAuth configuration'))
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
          reject(new Error('no code found in redirect URL'))
          authWindow?.close()
          return
        }

        // console.log('exchanging token with code:', code)
        // console.log('Client ID:', clientId)
        // console.log('Redirect URI:', redirectUri)

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

          const oauth2 = google.oauth2({version: 'v2', auth: oauth2Client})
          const {data} = await oauth2.userinfo.get()

          if (win) {
            win.webContents.send('google-login-success', {
              user: {
                name: data.name,
                email: data.email,
                picture: data.picture
              }
            })
          }

          if (authWindow) {
            authWindow.loadFile(path.join(__dirname, '..', 'assets', 'oauth-redirect.html'))
          }

          setTimeout(() => {
            authWindow?.close()
            authWindow = null
            resolve({
              success: true, tokens,
              user: {
                name: data.name,
                email: data.email,
                picture: data.picture
              }
            })
          })
        } catch (tokenError) {
          console.error('Token exchange failed:', tokenError)
          reject(tokenError)
          authWindow?.close()
          authWindow = null
        }
      })
    } catch (error) {
      console.error('Failed to start Google login:', error)
      reject(error)
    }
  })
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
    console.error(message)
    return { success: false, error: message }
  }
})


// MICROSOFT

ipcMain.handle('start-microsoft-login', async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const authUrl = await getMsAuthUrl();

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
      });

      authWindow.loadURL(authUrl);
      authWindow.once('ready-to-show', () => {
        if (authWindow) authWindow.show();
      });

      authWindow.on('closed', () => {
        authWindow = null;
        reject(new Error('login window closed'));
      });

      const redirectUri = process.env.MS_REDIRECT_URI;

      if (!redirectUri) {
        reject(new Error('missing Microsoft OAuth configuration'));
        authWindow?.close();
        return;
      }

      authWindow.webContents.on('will-redirect', async (event, url) => {
        if (!url.startsWith(redirectUri)) return;

        event.preventDefault();
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get('code');
        const error = parsedUrl.searchParams.get('error');

        if (error) {
          reject(new Error(`OAuth error: ${error}`));
          authWindow?.close();
          return;
        }

        if (!code) {
          reject(new Error('no code found in redirect URL'));
          authWindow?.close();
          return;
        }

        try {
          const tokens = await acquireMsTokenByCode(code);

          if (win) {
            win.webContents.send('microsoft-login-success', {
              user: {
                name: tokens.account?.name,
                username: tokens.account?.username,
                homeAccountId: tokens.account?.homeAccountId,
              }
            });
          }

          if (authWindow) {
            authWindow.loadFile(path.join(__dirname, '..', 'assets', 'oauth-redirect.html'));
          }

          setTimeout(() => {
            authWindow?.close();
            authWindow = null;
            resolve({
              success: true,
              tokens,
              user: {
                name: tokens.account?.name,
                username: tokens.account?.username,
                homeAccountId: tokens.account?.homeAccountId,
              }
            });
          });
        } catch (tokenError) {
          console.error('Microsoft token exchange failed:', tokenError);
          reject(tokenError);
          authWindow?.close();
          authWindow = null;
        }
      });
    } catch (error) {
      console.error('Failed to start Microsoft login:', error);
      reject(error);
    }
  });
});


ipcMain.handle('microsoft-logout', async () => {
  try {
    clearMsTokens();
    return { success: true };
  } catch (err: unknown) {
    let message = 'Unknown error';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
    console.error(message);
    return { success: false, error: message };
  }
});

ipcMain.handle("fetch-google-calendar-events", async () => {
  const tokenPath = getTokenPath();
  if (!fs.existsSync(tokenPath)) throw new Error("Not logged in");
  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
  const clientId = process.env.G_CLIENT_ID;
  const clientSecret = process.env.G_CLIENT_SECRET;
  const redirectUri = process.env.G_REDIRECT_URI;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  return (res.data.items || []).map((item) => ({
    id: item.id,
    summary: item.summary || "(No Title)",
    start: item.start?.dateTime || item.start?.date || "",
    end: item.end?.dateTime || item.end?.date || "",
  }));
});

ipcMain.handle("add-google-calendar-event", async (_event, { summary, start }) => {
  const tokenPath = getTokenPath();
  if (!fs.existsSync(tokenPath)) throw new Error("Not logged in");
  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));
  const clientId = process.env.G_CLIENT_ID;
  const clientSecret = process.env.G_CLIENT_SECRET;
  const redirectUri = process.env.G_REDIRECT_URI;
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials(tokens);

  // Ensure start is a valid ISO string with timezone
  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) throw new Error("Invalid start date");
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const event = {
    summary,
    start: { dateTime: startDate.toISOString() },
    end: { dateTime: endDate.toISOString() },
  };

  await google.calendar({ version: "v3", auth: oauth2Client }).events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return { success: true };
});


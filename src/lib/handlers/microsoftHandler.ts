// IPC handler organizaition for Microsoft 

import { ipcMain, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { getAuthUrl as getMsAuthUrl,
  acquireTokenByCode as acquireMsTokenByCode,
  clearSavedTokens as clearMsTokens,
  initializeTokenPath as initializeMsTokenPath,
  getTokenPath as getMsTokenPath,
  loadSavedTokens as loadMsTokens,
 } from "@/services/integrations-utils/microsoft/microsoftAuth";

let win: BrowserWindow | null = null;

export function registerMicrosoftHandlers(mainWindow: BrowserWindow) {

    win = mainWindow;

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
}
import { app, BrowserWindow, ipcMain, Notification } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import { createRequire } from "module";
import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";
dotenv.config();
const env = process.env;
const client_id = env.G_CLIENT_ID;
const redirect_uri = env.G_REDIRECT_URI;
const client_secret = env.G_CLIENT_SECRET;
const scopes = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email"
];
if (!client_id || !redirect_uri) {
  throw new Error("Missing G_CLIENT_ID or G_REDIRECT_URI in env variables");
}
function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest().toString("base64url");
  if (!verifier || !challenge) {
    throw new Error("Failed to generate PKCE values");
  }
  return { verifier, challenge };
}
let tokenPath = null;
function initializeTokenPath() {
  tokenPath = path.join(app.getPath("userData"), "tokens.json");
}
function getTokenPath() {
  if (!tokenPath) {
    throw new Error("Token path is not initialized yet. Call initializeTokenPath() first.");
  }
  return tokenPath;
}
function loadSavedTokens() {
  try {
    const token_path = getTokenPath();
    if (fs.existsSync(token_path)) {
      const tokenData = fs.readFileSync(token_path, "utf-8");
      if (!tokenData.trim()) return null;
      return JSON.parse(tokenData);
    }
    return null;
  } catch {
    return null;
  }
}
async function getAuthClient() {
  if (!client_secret) {
    throw new Error("Missing G_CLIENT_SECRET in environment variables");
  }
  const oauth2Client = new google.auth.OAuth2({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
  });
  const savedTokens = loadSavedTokens();
  if (savedTokens) {
    oauth2Client.setCredentials(savedTokens);
    try {
      await oauth2Client.getAccessToken();
      return oauth2Client;
    } catch {
      try {
        clearSavedTokens();
      } catch {
      }
    }
  }
  throw new Error("No valid login session, please authenticate.");
}
async function authenticateWithGoogle() {
  if (!client_secret) {
    throw new Error("Missing G_CLIENT_SECRET in environment variables");
  }
  const { verifier, challenge } = generatePKCE();
  const oauth2Client = new google.auth.OAuth2({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
  });
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    code_challenge_method: "S256",
    code_challenge: challenge,
    prompt: "consent"
  });
  if (!authUrl) {
    throw new Error("Failed to generate authentication URL");
  }
  return { authUrl, verifier };
}
function clearSavedTokens() {
  const token_path = getTokenPath();
  if (fs.existsSync(token_path)) {
    try {
      fs.unlinkSync(token_path);
    } catch (err) {
      throw err;
    }
  }
}
const googleAuth = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  authenticateWithGoogle,
  clearSavedTokens,
  getAuthClient,
  getTokenPath,
  initializeTokenPath,
  loadSavedTokens
}, Symbol.toStringTag, { value: "Module" }));
const require2 = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let win = null;
let setVibrancy = null;
try {
  const electronAcrylic = require2("electron-acrylic-window");
  setVibrancy = electronAcrylic.setVibrancy;
} catch (error) {
  console.warn("electron-acrylic-window not available:", error);
}
app.name = "Calmeca";
initializeTokenPath();
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
    backgroundColor: "#00000000",
    autoHideMenuBar: true,
    icon: path.join(__dirname, "..", "assets", "taskbar.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (setVibrancy && win) {
    try {
      setVibrancy(win, {
        theme: "dark",
        effect: "acrylic",
        useCustomWindowRefreshMethod: true,
        maximumRefreshRate: 60,
        disableOnBlur: true,
        debug: true
      });
    } catch (error) {
      console.warn("Failed to apply vibrancy:", error);
    }
  }
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "./index.html"));
  }
  win.on("closed", () => {
    win = null;
  });
  win.on("maximize", () => {
    if (win && win.webContents) {
      win.webContents.send("maximized");
    }
  });
  win.on("unmaximize", () => {
    if (win && win.webContents) {
      win.webContents.send("not-maximized");
    }
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.disableHardwareAcceleration();
app.whenReady().then(createWindow);
ipcMain.on("minimize", () => {
  if (win) win.minimize();
});
ipcMain.on("maximize", () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});
ipcMain.on("restore", () => {
  if (win) win.restore();
});
ipcMain.on("close", () => {
  if (win) win.close();
});
ipcMain.handle("start-google-login", async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const { authUrl, verifier } = await (await Promise.resolve().then(() => googleAuth)).authenticateWithGoogle();
      let authWindow = new BrowserWindow({
        width: 500,
        height: 600,
        parent: win ?? void 0,
        modal: true,
        show: false,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "..", "assets", "taskbar.png"),
        webPreferences: {
          preload: path.join(__dirname, "..", "src", "preload.js"),
          contextIsolation: true,
          nodeIntegration: false
        }
      });
      authWindow.loadURL(authUrl);
      authWindow.once("ready-to-show", () => {
        if (authWindow) authWindow.show();
      });
      const clientId = process.env.G_CLIENT_ID;
      const clientSecret = process.env.G_CLIENT_SECRET;
      const redirectUri = process.env.G_REDIRECT_URI;
      if (!clientId || !clientSecret || !redirectUri) {
        reject(new Error("Missing OAuth configuration"));
        authWindow == null ? void 0 : authWindow.close();
        return;
      }
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      authWindow.webContents.on("will-redirect", async (event, url) => {
        if (!url.startsWith(redirectUri)) return;
        event.preventDefault();
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get("code");
        const error = parsedUrl.searchParams.get("error");
        if (error) {
          reject(new Error(`OAuth error: ${error}`));
          authWindow == null ? void 0 : authWindow.close();
          return;
        }
        if (!code) {
          reject(new Error("No code found in redirect URL"));
          authWindow == null ? void 0 : authWindow.close();
          return;
        }
        console.log("Exchanging token with code:", code);
        console.log("Client ID:", clientId);
        console.log("Redirect URI:", redirectUri);
        try {
          const { tokens } = await oauth2Client.getToken({
            code,
            codeVerifier: verifier,
            redirect_uri: redirectUri
          });
          console.log("Received tokens:", tokens);
          oauth2Client.setCredentials(tokens);
          const tokenPath2 = getTokenPath();
          const fs2 = await import("fs");
          fs2.writeFileSync(tokenPath2, JSON.stringify(tokens));
          if (authWindow) {
            authWindow.loadFile(path.join(__dirname, "..", "assets", "oauth-redirect.html"));
          }
          setTimeout(() => {
            authWindow == null ? void 0 : authWindow.close();
            authWindow = null;
            resolve({ success: true, tokens });
          }, 1e4);
        } catch (tokenError) {
          console.error("Token exchange failed:", tokenError);
          reject(tokenError);
          authWindow == null ? void 0 : authWindow.close();
          authWindow = null;
        }
      });
      authWindow.on("closed", () => {
        authWindow = null;
        reject(new Error("User closed the login window"));
      });
    } catch (error) {
      console.error("Failed to start Google login:", error);
      reject(error);
    }
  });
});
ipcMain.handle("google-login", async () => {
  try {
    const authClient = await getAuthClient();
    if (!authClient) throw new Error("No valid auth client");
    const oauth2 = google.oauth2({ version: "v2", auth: authClient });
    const { data } = await oauth2.userinfo.get();
    return {
      success: true,
      tokens: authClient.credentials,
      user: {
        name: data.name,
        email: data.email,
        picture: data.picture
      }
    };
  } catch (err) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    console.error(message);
    return { success: false, error: message };
  }
});
function showLogoutNotification() {
  new Notification({
    title: "Logout Successful",
    body: "Google logout successful",
    silent: false
  }).show();
}
ipcMain.handle("google-logout", async () => {
  try {
    clearSavedTokens();
    showLogoutNotification();
    return { success: true };
  } catch (err) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    console.error(message);
    return { success: false, error: message };
  }
});

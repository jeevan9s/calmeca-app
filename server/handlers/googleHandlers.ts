ipcMain.handle("delete-google-calendar-event", async (_event, eventId) => {
  const oauth2Client = await getOAuthClient();
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  try {
    await calendar.events.delete({ calendarId: "primary", eventId });
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
});
import { ipcMain, BrowserWindow } from "electron";
import path from "path";
import { google } from "googleapis";
import {
  clearSavedTokens,
  authenticateWithGoogle,
  getTokenPath,
} from "@/services/integrations-utils/google/googleAuth";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win: BrowserWindow | null = null;

async function getOAuthClient() {
  const tokenPath = getTokenPath();
  if (!fs.existsSync(tokenPath)) throw new Error("Not logged in");

  const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf-8"));

  const oauth2Client = new google.auth.OAuth2(
    process.env.G_CLIENT_ID,
    process.env.G_CLIENT_SECRET,
    process.env.G_REDIRECT_URI
  );

  oauth2Client.setCredentials(tokens);

  // Refresh token if expired
  const newToken = await oauth2Client.getAccessToken();
  if (newToken.token) {
    const updatedTokens = { ...tokens, access_token: newToken.token };
    fs.writeFileSync(tokenPath, JSON.stringify(updatedTokens));
    oauth2Client.setCredentials(updatedTokens);
  }

  return oauth2Client;
}

export function registerGoogleHandlers(mainWindow: BrowserWindow) {
  win = mainWindow;

  ipcMain.handle("start-google-login", async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const { authUrl, verifier } = await authenticateWithGoogle();

        let authWindow: BrowserWindow | null = new BrowserWindow({
          width: 500,
          height: 600,
          parent: win ?? undefined,
          modal: true,
          show: false,
          autoHideMenuBar: true,
          icon: path.join(__dirname, "..", "assets", "taskbar.png"),
          webPreferences: {
            preload: path.join(__dirname, "..", "src", "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
          },
        });

        authWindow.loadURL(authUrl);
        authWindow.once("ready-to-show", () => authWindow?.show());
        authWindow.on("closed", () => {
          authWindow = null;
          reject(new Error("Login window closed"));
        });

        const { G_CLIENT_ID, G_CLIENT_SECRET, G_REDIRECT_URI } = process.env;
        if (!G_CLIENT_ID || !G_CLIENT_SECRET || !G_REDIRECT_URI) {
          reject(new Error("Missing OAuth configuration"));
          authWindow?.close();
          return;
        }

        const oauth2Client = new google.auth.OAuth2(
          G_CLIENT_ID,
          G_CLIENT_SECRET,
          G_REDIRECT_URI
        );

        authWindow.webContents.on("will-redirect", async (event, url) => {
          if (!url.startsWith(G_REDIRECT_URI!)) return;

          event.preventDefault();
          const parsedUrl = new URL(url);
          const code = parsedUrl.searchParams.get("code");
          const error = parsedUrl.searchParams.get("error");

          if (error) {
            reject(new Error(`OAuth error: ${error}`));
            authWindow?.close();
            return;
          }

          if (!code) {
            reject(new Error("No code found in redirect URL"));
            authWindow?.close();
            return;
          }

          try {
            const { tokens } = await oauth2Client.getToken({
              code,
              codeVerifier: verifier,
              redirect_uri: G_REDIRECT_URI,
            });
            oauth2Client.setCredentials(tokens);

            const tokenPath = getTokenPath();
            fs.writeFileSync(tokenPath, JSON.stringify(tokens));

            const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
            const { data } = await oauth2.userinfo.get();

            win?.webContents.send("google-login-success", {
              user: {
                name: data.name,
                email: data.email,
                picture: data.picture,
              },
            });

            authWindow?.loadFile(
              path.join(__dirname, "..", "assets", "oauth-redirect.html")
            );
            setTimeout(() => {
              authWindow?.close();
              authWindow = null;
              resolve({
                success: true,
                tokens,
                user: {
                  name: data.name,
                  email: data.email,
                  picture: data.picture,
                },
              });
            });
          } catch (tokenError) {
            console.error("Token exchange failed:", tokenError);
            reject(tokenError);
            authWindow?.close();
          }
        });
      } catch (error) {
        console.error("Failed to start Google login:", error);
        reject(error);
      }
    });
  });

  ipcMain.handle("google-logout", async () => {
    try {
      clearSavedTokens();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Unknown error" };
    }
  });

  ipcMain.handle("get-logged-in-user", async () => {
    try {
      const oauth2Client = await getOAuthClient();
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      return {
        name: data.name,
        email: data.email,
        picture: data.picture,
      };
    } catch (err) {
      console.error("Failed to get logged-in user:", err);
      return null;
    }
  });

    ipcMain.handle("fetch-google-calendar-events", async (_event, category?: string) => {
    const oauth2Client = await getOAuthClient();
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const CALENDAR_IDS = {
      default: "primary",
      designTeams: "b1eab8a0b93a92b3fa0558e8dfa71ea88becbeb28bdb9ed21893f39ca22ee48a@group.calendar.google.com",
    };

    const res = await calendar.events.list({
      calendarId: category === "designTeams" ? CALENDAR_IDS.designTeams : CALENDAR_IDS.default,
      timeMin: new Date().toISOString(),
      maxResults: 30,
      singleEvents: true,
      orderBy: "startTime",
    });

    const filteredEvents = await res.data.items?.filter(event => {return !event.summary?.includes("Week")} )

    return (filteredEvents || []).map((e) => ({
      id: e.id,
      summary: e.summary || "untitled)",
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      location: e.location,
    }));
    
  });

  ipcMain.handle(
  "add-google-calendar-event",
  async (
    _event,
    summary: string,
    startStr: string,
    endStr?: string,
    allDay = false,
    recurrence: string = "none"
  ) => {
    console.log("[GoogleCalendar] Adding event:", { summary, startStr, endStr, allDay, recurrence });
    if (recurrence && recurrence !== "none") {
      console.log("[GoogleCalendar] Recurrence received:", recurrence);
    }
    const oauth2Client = await getOAuthClient();
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const startDate = new Date(startStr);
    if (isNaN(startDate.getTime())) throw new Error("Invalid start date");

    const endDate = endStr
      ? new Date(endStr)
      : allDay
      ? new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

    // Delete duplicates
    try {
      const res = await calendar.events.list({
        calendarId: "primary",
        q: summary,
        timeMin: new Date(2000, 0, 1).toISOString(),
        timeMax: new Date(2100, 0, 1).toISOString(),
        singleEvents: true,
      });

      const existingEvents = res.data.items || [];
      for (const evt of existingEvents) {
        if (evt.summary === summary) {
          await calendar.events.delete({ calendarId: "primary", eventId: evt.id! });
        }
      }
    } catch (err) {
      console.warn("Failed to delete duplicate events:", err);
    }

    const event: any = { summary };

    const localDate = (d: Date) => d.toISOString().split("T")[0];

    if (allDay) {
      event.start = { date: localDate(startDate) };
      event.end = { date: localDate(endDate) };
    } else {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      event.start = { dateTime: startDate.toISOString(), timeZone: tz };
      event.end = { dateTime: endDate.toISOString(), timeZone: tz };
    }

    // Recurrence
    if (typeof recurrence === "string" && recurrence !== "none") {
      let rrule = "";
      if (recurrence === "daily") rrule = "RRULE:FREQ=DAILY";
      else if (recurrence === "weekly") rrule = "RRULE:FREQ=WEEKLY";
      else if (recurrence === "monthly") rrule = "RRULE:FREQ=MONTHLY";
      else if (recurrence.startsWith("custom:")) {
        const interval = parseInt(recurrence.split(":")[1]);
        if (!isNaN(interval) && interval > 0) rrule = `RRULE:FREQ=DAILY;INTERVAL=${interval}`;
      }
      console.log("[GoogleCalendar] RRULE generated:", rrule);
      if (rrule) event.recurrence = [rrule];
    }

    try {
      const result = await calendar.events.insert({ calendarId: "primary", requestBody: event });
      console.log("[GoogleCalendar] Event inserted successfully:", result.data);
      return { success: true };
    } catch (err) {
      console.error("[GoogleCalendar] Failed to insert event:", err);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
);

}


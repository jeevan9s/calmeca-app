const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";
const SCOPES = "https://www.googleapis.com/auth/calendar";

function generateCodeVerifier(): string {
  const arr = new Uint32Array(56);
  crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => ("0" + dec.toString(16)).slice(-2)).join("");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!cachedRefreshToken) return false;

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        refresh_token: cachedRefreshToken ?? "",
        grant_type: "refresh_token",
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      cachedAccessToken = data.access_token;
      if (typeof Neutralino !== "undefined") {
        await Neutralino.storage.setData("google_access_token", cachedAccessToken);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("failed to refresh access token:", error);
    return false;
  }
}

export async function getLoggedInUser() {
  if (!cachedAccessToken) return null;

  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${cachedAccessToken}` },
    });

    if (!res.ok) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) return null;
      return getLoggedInUser();
    }

    return await res.json();
  } catch {
    return null;
  }
}

export async function googleLogin(): Promise<boolean> {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  if (typeof Neutralino !== "undefined") {
    await Neutralino.storage.setData("google_code_verifier", verifier);
  } else {
    localStorage.setItem("google_code_verifier", verifier);
  }

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: SCOPES,
      code_challenge: challenge,
      code_challenge_method: "S256",
      prompt: "consent",
    });

  if (typeof Neutralino !== "undefined") {
    await Neutralino.os.open(authUrl);

    // Instantly prompt the user inside the app to paste the token or accept auto-read
    const promptResult = await Neutralino.os.showPromptBox(
      "Google Sign-In",
      "Approve access in your browser. Google will display a code on screen. Click OK once copied to automatically capture it.",
      "okCancel"
    );

    if (promptResult === "OK") {
      let authCode: string | null = null;
      
      try {
        const clipboardText = await Neutralino.clipboard.readText();
        if (clipboardText && clipboardText.trim().length > 10) {
          authCode = clipboardText.trim();
        }
      } catch {
        // fallback
      }

      if (!authCode) {
        authCode = window.prompt("Please paste your Google authorization code here:");
      }

      if (authCode && authCode.trim()) {
        return await handleOauthCallback(authCode.trim());
      }
    }
    return false;
  } else {
    window.location.href = authUrl;
    return false;
  }
}

export async function initGoogleAuth(): Promise<boolean> {
  if (typeof Neutralino !== "undefined") {
    cachedAccessToken = await Neutralino.storage
      .getData("google_access_token")
      .catch(() => null);
    cachedRefreshToken = await Neutralino.storage
      .getData("google_refresh_token")
      .catch(() => null);
  } else {
    cachedAccessToken = localStorage.getItem("google_access_token");
    cachedRefreshToken = localStorage.getItem("google_refresh_token");
  }

  return !!cachedAccessToken;
}

async function handleOauthCallback(authCode: string): Promise<boolean> {
  try {
    let verifier: string | null = null;
    if (typeof Neutralino !== "undefined") {
      verifier = await Neutralino.storage.getData("google_code_verifier").catch(() => null);
    }
    if (!verifier) {
      verifier = localStorage.getItem("google_code_verifier");
    }
    if (!verifier) return false;

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        code: authCode,
        code_verifier: verifier,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      cachedAccessToken = data.access_token;
      cachedRefreshToken = data.refresh_token || cachedRefreshToken;

      if (typeof Neutralino !== "undefined") {
        await Neutralino.storage.setData("google_access_token", cachedAccessToken);
        if (cachedRefreshToken) {
          await Neutralino.storage.setData("google_refresh_token", cachedRefreshToken);
        }
        await Neutralino.window.reload();
      } else {
        localStorage.setItem("google_access_token", cachedAccessToken ?? "");
        if (cachedRefreshToken) {
          localStorage.setItem("google_refresh_token", cachedRefreshToken);
        }
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("token exchange error:", error);
    return false;
  }
}

export async function googleLogout() {
  cachedAccessToken = null;
  cachedRefreshToken = null;

  try {
    if (typeof Neutralino != "undefined") {
      await Neutralino.storage.setData("google_access_token", "");
      await Neutralino.storage.setData("google_refresh_token", "");
      await Neutralino.storage.setData("google_code_verifier", "");
    } else {
      localStorage.removeItem("google_access_token");
      localStorage.removeItem("google_refresh_token");
      localStorage.removeItem("google_code_verifier");
    }
  } catch (error) {
    console.error("failed to clear local auth storage on logout", error);
  }

  window.location.reload();
}

export async function fetchGoogleCalendarEvents(category?: string) {}
export async function addGoogleCalendarEvent(summary: string, start: string, end: string, allDay = false, recurrence = "none") {}
export async function deleteGoogleCalendarEvent(eventId: string) {}
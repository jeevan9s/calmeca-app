const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const REDIRECT_URI = "http://127.0.0.1:5173/dashboard";
const SCOPES = "https://www.googleapis.com/auth/calendar";

/*
PCKE FLOW
- create a random string for code verifier 
- execute a SHA-256 hash on the verifier; this hash is the code challenge 
- the code challenge is sent to get an auth code 
- the auth code and original verifier are sent to the token endpoint 
- the server hashes the verifier, if hash == code challenge tokens are issued
*/

// create a highly randomized string
function generateCodeVerifier(): string {
  const arr = new Uint32Array(56);
  crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => ("0" + dec.toString(16)).slice(-2)).join("");
}

// hash verifier into challenge
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier); // encode into UINT8
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

    // if google returns new token, update
    if (data.access_token) {
      cachedAccessToken = data.access_token;

      if (typeof Neutralino !== "undefined") {
        await Neutralino.storage.setData(
          "google_access_token",
          cachedAccessToken,
        );
      }

      return true;
    }

    // if refresh token invalid
    return false;
  } catch (error) {
    console.error("failed to refresh access tokenL:", error);
    return false;
  }
}

// native fetch wrapper for google calendar REST API
const apiRequest = async (path: string, init?: RequestInit) => {
  if (!cachedAccessToken) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
  }

  try {
    let response = await fetch(
      `https://www.googleapis.com/calendar/v3${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${cachedAccessToken}`,
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      },
    );

    // token expired mid-session
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        response = await fetch(
          `https://www.googleapis.com/calendar/v3${path}`,
          {
            ...init,
            headers: {
              Authorization: `Bearer ${cachedAccessToken}`,
              "Content-Type": "application/json",
              ...(init?.headers || {}),
            },
          },
        );
      }
    }

    if (!response.ok) return null;
    if (response.status === 204) return { success: true };
    return response.json();
  } catch {
    return null;
  }
};

export async function getLoggedInUser() {
  if (!cachedAccessToken) return null;

  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${cachedAccessToken}` },
    });

    // token expired
    if (!res.ok) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) return null;
      return getLoggedInUser();
    }

    return await res.json(); // returns name, email, picture
  } catch {
    return null;
  }
}

export async function googleLogin() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  if (typeof Neutralino !== "undefined") {
    await Neutralino.storage.setData("google_code_verifier", verifier);
  } else {
    localStorage.setItem("google_code_verifier", verifier);
  }

  console.log("CLIENT_ID:", CLIENT_ID);

  // build url
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
  } else {
    window.location.href = authUrl;
  }
}

export async function initGoogleAuth(): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    window.history.replaceState({}, document.title, window.location.pathname);
    return await handleOauthCallback(code);
  }

  // load existing
  cachedAccessToken = await Neutralino.storage
    .getData("google_access_token")
    .catch(() => null);
  cachedRefreshToken = await Neutralino.storage
    .getData("google_refresh_token")
    .catch(() => null);

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
  // clear records

  cachedAccessToken = null;
  cachedRefreshToken = null;

  try {
    if (typeof Neutralino != "undefined") {
      await Neutralino.storage.setData("google_access_token", "");
      await Neutralino.storage.setData("google_refresh_token", "");
      await Neutralino.storage.setData("google_code_verifier", "");
    }
  } catch (error) {
    console.error("failed to clear local auth storage on logout", error);
  }

  window.location.reload();
}

export async function fetchGoogleCalendarEvents(category?: string) {}

export async function addGoogleCalendarEvent(
  summary: string,
  start: string,
  end: string,
  allDay = false,
  recurrence = "none",
) {}

export async function deleteGoogleCalendarEvent(eventId: string) {}

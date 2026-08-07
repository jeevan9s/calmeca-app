const CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID || "";
const REDIRECT_URI = "http://localhost";
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
export const apiRequest = async (path: string, init?: RequestInit) => {
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
      const refreshed = refreshAccessToken();
      if (!refreshed) return null;
      return getLoggedInUser();
    }

    return await res.json(); // returns name, email, picture
  } catch {
    return null;
  }
}

export async function startGoogleLogin() {}

export async function googleLogout() {}

export async function fetchGoogleCalendarEvents(category?: string) {}

export async function addGoogleCalendarEvent(
  summary: string,
  start: string,
  end: string,
  allDay = false,
  recurrence = "none",
) {}

export async function deleteGoogleCalendarEvent(eventId: string) {}

export async function extractCourseFromPDF(base64: string) {}

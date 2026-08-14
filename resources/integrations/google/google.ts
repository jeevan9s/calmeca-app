import { GCalEvent } from "@/services/db";
import { getGoogleAuthConfig } from "./googleConfig";

const {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
} = getGoogleAuthConfig();
const SCOPES = "openid profile email https://www.googleapis.com/auth/calendar";
const CALLBACK_POLL_INTERVAL_MS = 1000;
const CALLBACK_TIMEOUT_MS = 2 * 60 * 1000;

/*
PKCE FLOW
- create a random string for code verifier
- execute a SHA-256 hash on the verifier; this hash is the code challenge
- the code challenge is sent to get an auth code
- the auth code and original verifier are sent to the token endpoint
- the server hashes the verifier, if hash == code challenge tokens are issued
*/

function generateCodeVerifier(): string {
  const arr = new Uint8Array(64);
  crypto.getRandomValues(arr);
  return Array.from(arr, (dec) => dec.toString(16).padStart(2, "0")).join("");
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

function generateState(length = 32): string {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (value) => value.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

async function waitForCallbackCode(state: string): Promise<string | null> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < CALLBACK_TIMEOUT_MS) {
    try {
      const response = await fetch(
        `http://127.0.0.1:8085/callback-status?state=${encodeURIComponent(state)}`,
      );
      if (response.ok) {
        const text = await response.text();
        if (!text) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, CALLBACK_POLL_INTERVAL_MS),
          );
          continue;
        }

        const data = JSON.parse(text);
        if (data.code) {
          return data.code as string;
        }
      }
    } catch {
      // ignore transient polling errors
    }

    await new Promise((resolve) =>
      window.setTimeout(resolve, CALLBACK_POLL_INTERVAL_MS),
    );
  }

  return null;
}

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

function logAuthDebug(message: string, details?: Record<string, unknown>) {
  console.info(`[google-auth] ${message}`, details ?? {});
}

async function readStoredValue(key: string): Promise<string | null> {
  if (typeof Neutralino !== "undefined") {
    try {
      return (await Neutralino.storage.getData(key)) as string | null;
    } catch {
      return null;
    }
  }

  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem(key);
  }

  return null;
}

async function writeStoredValue(key: string, value: string): Promise<void> {
  if (typeof Neutralino !== "undefined") {
    try {
      await Neutralino.storage.setData(key, value);
      return;
    } catch {
      // fall back to browser storage below
    }
  }

  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, value);
  }
}

async function clearStoredValue(key: string): Promise<void> {
  if (typeof Neutralino !== "undefined") {
    try {
      await Neutralino.storage.setData(key, "");
      return;
    } catch {
      // fall back to browser storage below
    }
  }

  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(key);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  if (!cachedRefreshToken) return false;

  try {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      refresh_token: cachedRefreshToken ?? "",
      grant_type: "refresh_token",
    });

    if (CLIENT_SECRET) {
      body.set("client_secret", CLIENT_SECRET);
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    if (data.access_token) {
      cachedAccessToken = data.access_token;
      if (data.refresh_token) {
        cachedRefreshToken = data.refresh_token;
      }

      if (cachedAccessToken) {
        await writeStoredValue("google_access_token", cachedAccessToken);
      }
      if (cachedRefreshToken) {
        await writeStoredValue("google_refresh_token", cachedRefreshToken);
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error("failed to refresh access token:", error);
    return false;
  }
}

const apiRequest = async (path: string, init?: RequestInit) => {
  if (!cachedAccessToken) {
    const storedToken = await readStoredValue("google_access_token");
    if (storedToken) {
      cachedAccessToken = storedToken;
      cachedRefreshToken =
        (await readStoredValue("google_refresh_token")) ?? cachedRefreshToken;
    }
  }

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
  if (!cachedAccessToken) {
    const storedToken = await readStoredValue("google_access_token");
    if (storedToken) {
      cachedAccessToken = storedToken;
      cachedRefreshToken =
        (await readStoredValue("google_refresh_token")) ?? cachedRefreshToken;
    }
  }

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

export async function googleLogin() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  logAuthDebug("starting login flow", {
    clientIdPresent: Boolean(CLIENT_ID),
    redirectUri: REDIRECT_URI,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  });

  if (!CLIENT_ID) {
    const errorMessage =
      "VITE_GOOGLE_CLIENT_ID is missing. Google auth cannot start.";
    console.error(`[google-auth] ${errorMessage}`);
    throw new Error(errorMessage);
  }

  await writeStoredValue("google_code_verifier", verifier);
  await writeStoredValue("google_auth_state", state);

  // clear any stale code from a previous attempt before opening the browser
  try {
    await fetch("http://127.0.0.1:8085/reset");
  } catch {
    /* server may not be running */
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("include_granted_scopes", "true");
  authUrl.searchParams.set("state", state);

  if (typeof Neutralino !== "undefined") {
    await Neutralino.os.open(authUrl.toString());
    const code = await waitForCallbackCode(state);
    if (!code) {
      throw new Error(
        "timed out waiting for the Google callback.",
      );
    }

    const success = await handleOauthCallback(code, state);
    if (!success) {
      throw new Error(
        "Google authentication failed",
      );
    }
    return;
  } else {
    window.location.href = authUrl.toString();
  }
}

export async function initGoogleAuth(): Promise<boolean> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");

  logAuthDebug("initializing auth", {
    hasCode: Boolean(code),
    hasState: Boolean(state),
    redirectUri: REDIRECT_URI,
  });

  if (code) {
    const storedState = await readStoredValue("google_auth_state");
    if (state && storedState && state !== storedState) {
      console.error("Google auth state mismatch; rejecting callback");
      await clearStoredValue("google_auth_state");
      await clearStoredValue("google_code_verifier");
      window.history.replaceState({}, document.title, window.location.pathname);
      return false;
    }

    window.history.replaceState({}, document.title, window.location.pathname);
    return await handleOauthCallback(code, state);
  }

  cachedAccessToken = await readStoredValue("google_access_token");
  cachedRefreshToken = await readStoredValue("google_refresh_token");

  return !!cachedAccessToken;
}

// debug
function describeGoogleAuthError(
  data: Record<string, unknown> | undefined,
  status: number,
): string {
  const errorDescription =
    (data?.error_description as string | undefined) ||
    (data?.error as string | undefined) ||
    "Unknown error";

  if (errorDescription.toLowerCase().includes("client_secret")) {
    return "Google rejected the token exchange because the current OAuth client is not configured for this desktop/public-client flow. In Google Cloud Console, create or switch to an OAuth client of type Desktop app / Installed app, or provide VITE_GOOGLE_CLIENT_SECRET if you are using a web-app client.";
  }

  if (errorDescription.toLowerCase().includes("redirect_uri")) {
    return `Google auth failed because the redirect URI did not match. Please verify that Google Cloud Console uses ${REDIRECT_URI}.`;
  }

  return `Google auth failed: ${errorDescription} (status ${status}).`;
}

async function handleOauthCallback(
  authCode: string,
  state?: string | null,
): Promise<boolean> {
  try {
    logAuthDebug("exchanging auth code for tokens", {
      hasCode: Boolean(authCode),
      redirectUri: REDIRECT_URI,
      hasVerifier: Boolean(await readStoredValue("google_code_verifier")),
    });

    const storedState = await readStoredValue("google_auth_state");
    if (state && storedState && state !== storedState) {
      console.error("Google auth state mismatch; rejecting callback");
      await clearStoredValue("google_auth_state");
      await clearStoredValue("google_code_verifier");
      return false;
    }

    const verifier = await readStoredValue("google_code_verifier");
    if (!verifier) return false;

    const tokenRequestBody = new URLSearchParams({
      client_id: CLIENT_ID,
      code: authCode,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    });

    if (CLIENT_SECRET) {
      tokenRequestBody.set("client_secret", CLIENT_SECRET);
    }

    logAuthDebug("token exchange request", {
      clientId: CLIENT_ID,
      redirectUri: REDIRECT_URI,
      codeLength: authCode.length,
      verifierLength: verifier.length,
      body: tokenRequestBody.toString(),
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenRequestBody,
    });

    const data = await response.json();
    logAuthDebug("token exchange response", {
      status: response.status,
      ok: response.ok,
      responseBody: data,
      error: data.error,
      errorDescription: data.error_description,
      errorHint: data.error_hint,
    });

    if (!response.ok) {
      throw new Error(describeGoogleAuthError(data, response.status));
    }

    if (data.access_token) {
      cachedAccessToken = data.access_token;
      cachedRefreshToken = data.refresh_token || cachedRefreshToken;

      if (cachedAccessToken) {
        await writeStoredValue("google_access_token", cachedAccessToken);
      }
      if (cachedRefreshToken) {
        await writeStoredValue("google_refresh_token", cachedRefreshToken);
      }
      await clearStoredValue("google_code_verifier");
      await clearStoredValue("google_auth_state");
      return true;
    }
    return false;
  } catch (error) {
    console.error("token exchange error:", error);
    throw error;
  }
}

export async function googleLogout() {
  cachedAccessToken = null;
  cachedRefreshToken = null;

  try {
    await clearStoredValue("google_access_token");
    await clearStoredValue("google_refresh_token");
    await clearStoredValue("google_code_verifier");
    await clearStoredValue("google_auth_state");
  } catch (error) {
    console.error("failed to clear local auth storage on logout", error);
  }
}

export async function fetchGoogleCalendarEvents(
  category?: string,
): Promise<any[]> {
  const now = new Date();
  const future = new Date();
  future.setMonth(future.getMonth() + 3);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const data = await apiRequest(`/calendars/primary/events?${params}`);
  if (!data || !data.items) return [];

  const events = data.items.map((item: any) => ({
    id: item.id,
    summary: item.summary || "",
    start: item.start?.dateTime || item.start?.date || "",
    end: item.end?.dateTime || item.end?.date || "",
    description: item.description,
    location: item.location,
  }));

  if (category) {
    return events.filter((e: any) =>
      e.summary?.toLowerCase().includes(category.toLowerCase()),
    );
  }

  // console.log(events);
  return events;
}

export async function addGoogleCalendarEvent(
  event: GCalEvent,
): Promise<any | null> {
  const data = await apiRequest(`/calendars/primary/events`, {
    method: "POST",
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.start },
      end: { dateTime: event.end },
    }),
  });

  if (!data) return null;

  return {
    id: data.id,
    summary: data.summary || "",
    start: data.start?.dateTime || data.start?.date || "",
    end: data.end?.dateTime || data.end?.date || "",
    description: data.description,
    location: data.location,
  };
}

export async function updateGoogleCalendarEvent(
  eventId: string,
  event: Partial<GCalEvent>,
): Promise<any | null> {
  const body: Record<string, any> = {};
  if (event.summary !== undefined) body.summary = event.summary;
  if (event.description !== undefined) body.description = event.description;
  if (event.location !== undefined) body.location = event.location;
  if (event.start !== undefined) body.start = { dateTime: event.start };
  if (event.end !== undefined) body.end = { dateTime: event.end };

  const data = await apiRequest(
    `/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );

  if (!data) return null;

  return {
    id: data.id,
    summary: data.summary || "",
    start: data.start?.dateTime || data.start?.date || "",
    end: data.end?.dateTime || data.end?.date || "",
    description: data.description,
    location: data.location,
  };
}

export async function deleteGoogleCalendarEvent(
  eventId: string,
): Promise<boolean> {
  const result = await apiRequest(
    `/calendars/primary/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE" },
  );
  return result !== null;
}

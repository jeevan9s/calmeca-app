const runtimeConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || "http://127.0.0.1:8085/callback",
};

export function getGoogleAuthConfig() {
  return runtimeConfig;
}

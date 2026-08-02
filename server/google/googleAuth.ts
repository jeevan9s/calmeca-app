import { google, Auth } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { app } from 'electron';

dotenv.config();
const env = process.env;

const client_id = env.G_CLIENT_ID;
const redirect_uri = env.G_REDIRECT_URI;
const client_secret = env.G_CLIENT_SECRET;

const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

if (!client_id || !redirect_uri) {
  throw new Error("Missing G_CLIENT_ID or G_REDIRECT_URI in env variables");
}

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest().toString('base64url');
  return { verifier, challenge };
}

let tokenPath: string | null = null;

export function initializeTokenPath() {
  tokenPath = path.join(app.getPath('userData'), 'tokens.json');
}

export function getTokenPath() {
  if (!tokenPath) throw new Error('Token path not initialized. Call initializeTokenPath() first.');
  return tokenPath;
}

export function loadSavedTokens() {
  try {
    const token_path = getTokenPath();
    if (fs.existsSync(token_path)) {
      const tokenData = fs.readFileSync(token_path, 'utf-8');
      if (!tokenData.trim()) return null;
      return JSON.parse(tokenData);
    }
    return null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: any) {
  const token_path = getTokenPath();
  fs.writeFileSync(token_path, JSON.stringify(tokens));
}

export async function getAuthClient(): Promise<Auth.OAuth2Client> {
  if (!client_secret) throw new Error('Missing G_CLIENT_SECRET in env variables');

  const oauth2Client = new google.auth.OAuth2({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri,
  });

  const savedTokens = loadSavedTokens();

  if (savedTokens) {
    oauth2Client.setCredentials(savedTokens);

    try {
      // This will automatically refresh using refresh_token if needed
      const tokenInfo = await oauth2Client.getAccessToken();
      if (!tokenInfo.token) throw new Error('Token refresh failed');
      
      // Save new access token if refreshed
      const updatedTokens = { ...savedTokens, access_token: tokenInfo.token };
      saveTokens(updatedTokens);
      oauth2Client.setCredentials(updatedTokens);

      return oauth2Client;
    } catch (err) {
      console.warn('Saved token invalid or expired. Clearing tokens.');
      clearSavedTokens();
    }
  }

  throw new Error('No valid login session. Please authenticate.');
}

export async function authenticateWithGoogle(): Promise<{ authUrl: string; verifier: string }> {
  if (!client_secret) throw new Error('Missing G_CLIENT_SECRET in env variables');

  const { verifier, challenge } = generatePKCE();

  const oauth2Client = new google.auth.OAuth2({
    clientId: client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri,
  });

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',      // important for refresh token
    scope: scopes,
    code_challenge_method: 'S256' as Auth.CodeChallengeMethod,
    code_challenge: challenge,
    prompt: 'consent',           // forces refresh token
  });

  return { authUrl, verifier };
}

export function clearSavedTokens() {
  const token_path = getTokenPath();
  if (fs.existsSync(token_path)) fs.unlinkSync(token_path);
}

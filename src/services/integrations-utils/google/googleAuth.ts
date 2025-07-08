import { google, Auth } from 'googleapis'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { app } from 'electron'

dotenv.config()
const env = process.env

const client_id = env.G_CLIENT_ID
const redirect_uri = env.G_REDIRECT_URI
const client_secret = env.G_CLIENT_SECRET
const scopes = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
]

if (!client_id || !redirect_uri) {
  throw new Error("Missing G_CLIENT_ID or G_REDIRECT_URI in env variables")
}

function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest().toString('base64url')
  
  if (!verifier || !challenge) {
    throw new Error('Failed to generate PKCE values')
  }
  
  return { verifier, challenge }
}

let tokenPath: string | null = null

export function initializeTokenPath() {
  tokenPath = path.join(app.getPath('userData'), 'tokens.json')
}

export function getTokenPath() {
  if (!tokenPath) {
    throw new Error('Token path is not initialized yet. Call initializeTokenPath() first.')
  }
  return tokenPath
}

export function loadSavedTokens() {
  try {
    const token_path = getTokenPath()
    if (fs.existsSync(token_path)) {
      const tokenData = fs.readFileSync(token_path, 'utf-8')
      
      if (!tokenData.trim()) {
        console.warn('Token file is empty')
        return null
      }
      
      return JSON.parse(tokenData)
    }
    return null
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error('Invalid JSON in token file:', err.message)
    } else if (err instanceof Error && 'code' in err) {
      console.error('File system error loading tokens:', err.message)
    } else {
      console.error('Unknown error loading tokens:', err)
    }
    return null
  }
}

export async function getAuthClient(): Promise<Auth.OAuth2Client> {
  if (!client_secret) {
    throw new Error('Missing G_CLIENT_SECRET in environment variables')
  }

  const oauth2Client = new google.auth.OAuth2({
    clientId: client_id!,
    clientSecret: client_secret,
    redirectUri: redirect_uri!,
  })

  const savedTokens = loadSavedTokens()

  if (savedTokens) {
    oauth2Client.setCredentials(savedTokens)
    try {
      await oauth2Client.getAccessToken()
      return oauth2Client
    } catch (err: any) {
      console.log('Saved token invalid or expired:', err.message)
      try {
        clearSavedTokens()
      } catch (clearError) {
        console.warn('Failed to clear invalid tokens:', clearError)
      }
    }
  }

  throw new Error('No valid login session, please authenticate.')
}

export async function authenticateWithGoogle(): Promise<{ authUrl: string; verifier: string }> {
  if (!client_secret) {
    throw new Error('Missing G_CLIENT_SECRET in environment variables')
  }

  const { verifier, challenge } = generatePKCE()

  const oauth2Client = new google.auth.OAuth2({
    clientId: client_id!,
    clientSecret: client_secret,
    redirectUri: redirect_uri!,
  })

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    code_challenge_method: 'S256' as Auth.CodeChallengeMethod,
    code_challenge: challenge,
    prompt: 'consent',
  })

  if (!authUrl) {
    throw new Error('Failed to generate authentication URL')
  }

  return { authUrl, verifier }
}

export function clearSavedTokens() {
  const token_path = getTokenPath()
  
  if (fs.existsSync(token_path)) {
    try {
      fs.unlinkSync(token_path)
      console.log('Saved tokens cleared.')
    } catch (err) {
      console.error('Failed to delete token file:', err)
      throw err
    }
  } else {
    console.log('No token file found to clear (this is normal for first-time logout).')
  }
}
// Google Auth Init

import { google, Auth } from 'googleapis'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import express from 'express'
import open from 'open'
import crypto from 'crypto'

dotenv.config()
const env = process.env

const client_id = env.G_CLIENT_ID
const redirect_uri = env.G_REDIRECT_URI
const token_path = path.join(process.cwd(), 'tokens.json')
const scopes = ['https://www.googleapis.com/auth/drive.file'];

if (!client_id || !redirect_uri) {
    throw new Error("Missing G_CLIENT_ID or  G_REDIRECT_URI in env variables")
}

// gen PKCE verifier and challenge
function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url') // generate the verifier, rando 32-bit string
    const challenge = crypto.createHash('sha256').update(verifier).digest().toString('base64url') // hashes the verifier to send to G
    
    return {verifier, challenge}
}

// load existing tokens
function loadSavedTokens(): Auth.Credentials | null {
    try {
        if (fs.existsSync(token_path)) {
            const tokenData = fs.readFileSync(token_path, 'utf8')
            return JSON.parse(tokenData)
        }
        return null
    } catch (err) {
        console.error('Failed to load saved tokens: ', err)
        return null
    }
}

// create OAuth client & restore tokens
export async function getAuthClient(): Promise <Auth.OAuth2Client> {
    const oauth2Client = new google.auth.OAuth2({
        clientId: client_id,
        redirectUri: redirect_uri
    })

    const savedTokens = loadSavedTokens()

    if (savedTokens) {
        oauth2Client.setCredentials(savedTokens)
        try {
            await oauth2Client.getAccessToken()
            console.log('Using saved tokens; refreshed access token silently')
            return oauth2Client
        } catch (err) {
            console.log('Failed to refresh token silently', err)
        }
    }

    return authenticateWithGoogle()
}


// login flow w PKCE, returns client
export async function authenticateWithGoogle(): Promise<Auth.OAuth2Client>{
    return new Promise((resolve, reject) => {

        const {verifier, challenge} = generatePKCE()
        
        const oauth2Client = new google.auth.OAuth2({
            clientId: client_id,
            redirectUri: redirect_uri
        })

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            code_challenge_method: 'S256',
            code_challenge: challenge,
        } as Auth.GenerateAuthUrlOpts)

        open(authUrl) // open url in default browser (scope, login)

        // small server to catch google's redirect (auth code after user login)
        const app = express()
        const server = app.listen(3000, () => {
            console.log('Listening on port 3000 for OAuth callback')
        })

        const timeoutId = setTimeout(() => {
            server.close()
            reject(new Error('OAuth login timed out after 3 minutes'))
        }, 3 * 60 * 1000)

        app.get('/oauth2callback', async (req,res) => {
            const code = req.query.code?.toString() // extract the auth code

            if (!code) {
                res.status(400).end()
                clearTimeout(timeoutId)
                server.close()
                return reject('No code found in callback')
            }

            try {
                // exchange auth code + verifier for long/short term tokens
                const { tokens } = await oauth2Client.getToken({
                    code, 
                    codeVerifier: verifier,
                    redirect_uri: redirect_uri
                })
                oauth2Client.setCredentials(tokens)
                // implement persistent login, saving tokens
                fs.writeFileSync(token_path, JSON.stringify(tokens))

                console.log("Google Login Successful!")
                res.status(200).end()
                clearTimeout(timeoutId)
                server.close()
                resolve(oauth2Client)


            } catch (err) {
                console.error("Token exchange error:", err)
                res.status(500).end()
                clearTimeout(timeoutId)
                server.close()
                reject(err)
            }
        })

        // rejection handling (timeout / user cancels)
        process.on('unhandledRejection', (_reason) =>{
            try {
                clearTimeout(timeoutId)
                server.close()
            } catch {}
        })


    })

}
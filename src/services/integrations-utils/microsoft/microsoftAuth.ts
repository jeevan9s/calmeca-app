import { PublicClientApplication, Configuration, AuthorizationUrlRequest, AuthenticationResult } from "@azure/msal-node";
import { Client } from "@microsoft/microsoft-graph-client";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { app } from "electron";

dotenv.config();

const env = process.env;

const clientId = env.MS_CLIENT_ID;
const tenantId = env.MS_TENANT_ID || "common"; 
const redirectUri = env.MS_REDIRECT_URI;

if (!clientId || !redirectUri) {
    throw new Error("missing MS_CLIENT_ID or MS_REDIRECT_URI in env");
}

// MSAL config
const msalConfig: Configuration = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
    }
};

const pca = new PublicClientApplication(msalConfig);

let tokenPath: string | null = null;

export function initializeTokenPath() {
    tokenPath = path.join(app.getPath('userData'), 'msTokens.json');
}

export function getTokenPath() {
    if (!tokenPath) {
        throw new Error('token path is not initialized. call initializeTokenPath() first.');
    }
    return tokenPath;
}

export function loadSavedTokens(): AuthenticationResult | null {
    const tokenFile = getTokenPath();
    if (fs.existsSync(tokenFile)) {
        const data = fs.readFileSync(tokenFile, 'utf-8');
        if (!data.trim()) return null;
        return JSON.parse(data) as AuthenticationResult;
    }
    return null;
}

export function saveTokens(tokens: AuthenticationResult) {
    fs.writeFileSync(getTokenPath(), JSON.stringify(tokens, null, 2), 'utf-8');
}

export function clearSavedTokens() {
    const file = getTokenPath();
    if (fs.existsSync(file)) fs.unlinkSync(file);
}

export function getMicrosoftGraphClient(): Client {
    const tokens = loadSavedTokens();
    if (!tokens || !tokens.accessToken) {
        throw new Error("No valid Microsoft access token found.");
    }
    return Client.init({
        authProvider: (done) => {
            done(null, tokens.accessToken);
        }
    });
}

export async function getAuthUrl(): Promise<string> {
    const authRequest: AuthorizationUrlRequest = {
        scopes: ["Files.ReadWrite", "User.Read"],
        redirectUri: redirectUri!,
    };
    return await pca.getAuthCodeUrl(authRequest);
}

export async function acquireTokenByCode(authCode: string): Promise<AuthenticationResult> {
    const tokenRequest = {
        code: authCode,
        scopes: ["Files.ReadWrite", "User.Read"],
        redirectUri: redirectUri!,
    };
    const result = await pca.acquireTokenByCode(tokenRequest);
    saveTokens(result);
    return result;
}

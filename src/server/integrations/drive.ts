import { google } from "googleapis";
import { env } from "@/server/env";

function createServiceAccountAuth() {
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) return null;

  return new google.auth.JWT({
    email,
    key: rawKey.replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

function createOAuth2Auth() {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const refreshToken = env.GOOGLE_DRIVE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

let _serviceAccountAuth: ReturnType<typeof createServiceAccountAuth> | undefined;
let _oauth2Auth: ReturnType<typeof createOAuth2Auth> | undefined;

function getServiceAccountAuth() {
  if (_serviceAccountAuth === undefined) _serviceAccountAuth = createServiceAccountAuth();
  return _serviceAccountAuth;
}

function getOAuth2Auth() {
  if (_oauth2Auth === undefined) _oauth2Auth = createOAuth2Auth();
  return _oauth2Auth;
}

export function getDriveClient() {
  const auth = getServiceAccountAuth();
  if (!auth) return null;
  return google.drive({ version: "v3", auth });
}

// Utilisé pour les uploads — OAuth2 user credentials (quota du compte Gmail)
export function getDriveWriteClient() {
  const auth = getOAuth2Auth();
  if (!auth) return null;
  return google.drive({ version: "v3", auth });
}

export function getSheetsClient() {
  const auth = getServiceAccountAuth();
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

// Utilisé pour créer des sheets — OAuth2 user credentials (quota du compte Gmail)
export function getSheetsWriteClient() {
  const auth = getOAuth2Auth();
  if (!auth) return null;
  return google.sheets({ version: "v4", auth });
}

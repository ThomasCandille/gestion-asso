/**
 * Script one-shot pour générer le GOOGLE_DRIVE_REFRESH_TOKEN.
 *
 * Prérequis dans Google Cloud Console :
 *   - Ajouter http://localhost:4242 comme URI de redirection autorisée
 *     dans Identifiants > OAuth 2.0 > Client Web
 *
 * Usage :
 *   node scripts/get-drive-token.mjs
 */

import http from "http";
import { URL } from "url";
import { google } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌  GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET doivent être définis dans .env");
  process.exit(1);
}

const PORT = 4242;
const REDIRECT_URI = `http://localhost:${PORT}`;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive"],
  prompt: "consent",
});

console.log("─────────────────────────────────────────────────");
console.log("1. Ouvrir cette URL dans le navigateur :");
console.log("");
console.log(authUrl);
console.log("");
console.log("2. Se connecter avec le compte Gmail propriétaire des dossiers Drive.");
console.log("3. Autoriser l'accès → la page redirige automatiquement.");
console.log("─────────────────────────────────────────────────");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.writeHead(400);
    res.end(`Erreur : ${error}`);
    console.error(`\n❌  Erreur Google OAuth : ${error}`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.writeHead(400);
    res.end("Code manquant.");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>✓ Autorisé. Vous pouvez fermer cet onglet.</h2>");

    console.log("\n✓ Token généré. Ajouter dans .env :");
    console.log("");
    console.log(`GOOGLE_DRIVE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    console.log("");
  } catch (err) {
    res.writeHead(500);
    res.end(`Erreur : ${err.message}`);
    console.error(`\n❌  Erreur lors de l'échange du code : ${err.message}`);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log(`\nEn attente du callback sur ${REDIRECT_URI}...`);
});

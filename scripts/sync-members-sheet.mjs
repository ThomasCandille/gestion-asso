import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";

// Charger le .env manuellement
const envPath = resolve(process.cwd(), ".env");
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (!match) continue;
  const key = match[1].trim();
  const val = match[2].trim().replace(/^["']|["']$/g, "");
  if (key && !(key in process.env)) process.env[key] = val;
}

const SHEET_ID = process.env.GOOGLE_MEMBERS_SHEET_ID;
const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SA_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n",
);
const DB_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/gestion_asso?schema=public";

if (!SHEET_ID || !SA_EMAIL || !SA_KEY) {
  console.error(
    "Variables manquantes : GOOGLE_MEMBERS_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DB_URL }),
});

const auth = new google.auth.JWT({
  email: SA_EMAIL,
  key: SA_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const HEADER = [
  "ID",
  "Prénom",
  "Nom",
  "Email",
  "Téléphone",
  "Rôle",
  "Pôles",
  "Date d'entrée",
];

async function main() {
  // Récupérer tous les membres actifs
  const members = await prisma.member.findMany({
    include: { memberPoles: { select: { pole: true } } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  console.log(`${members.length} membre(s) trouvé(s) en base.`);

  const rows = members.map((m) => [
    m.id,
    m.firstName,
    m.lastName,
    m.email,
    m.phone,
    m.role,
    m.memberPoles.map((p) => p.pole).join(", "),
    m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("fr-FR") : "",
  ]);

  // Effacer tout le contenu existant
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: "A:H",
  });

  // Réécrire header + toutes les lignes
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: "A1",
    valueInputOption: "RAW",
    requestBody: { values: [HEADER, ...rows] },
  });

  console.log(`Sheet mise à jour : ${rows.length} membre(s) synchronisé(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

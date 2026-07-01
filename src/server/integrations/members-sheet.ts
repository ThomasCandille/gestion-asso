import { getSheetsClient } from "./google-clients";
import { env } from "@/server/env";
import type { MemberDto } from "@/features/members/member-service";

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

function getSheetId(): string | null {
  return env.GOOGLE_MEMBERS_SHEET_ID ?? null;
}

async function ensureHeader(sheetId: string): Promise<void> {
  const sheets = getSheetsClient();
  if (!sheets) return;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A1:H1",
  });

  const firstRow = response.data.values?.[0];
  if (!firstRow || firstRow[0] !== "ID") {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: { values: [HEADER] },
    });
  }
}

function memberToRow(member: MemberDto): string[] {
  return [
    member.id,
    member.firstName,
    member.lastName,
    member.email,
    member.phone,
    member.role,
    member.poles.join(", "),
    member.joinedAt
      ? new Date(member.joinedAt).toLocaleDateString("fr-FR")
      : "",
  ];
}

export async function appendMemberRow(member: MemberDto): Promise<void> {
  const sheets = getSheetsClient();
  const sheetId = getSheetId();
  if (!sheets || !sheetId) return;

  await ensureHeader(sheetId);

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "A:A",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [memberToRow(member)] },
  });
}

export async function removeMemberRow(memberId: string): Promise<void> {
  const sheets = getSheetsClient();
  const sheetId = getSheetId();
  if (!sheets || !sheetId) return;

  const colResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "A:A",
  });

  const rows = colResponse.data.values ?? [];
  const rowIndex = rows.findIndex((row) => row[0] === memberId);
  if (rowIndex === -1) return;

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: "sheets(properties(sheetId))",
  });
  const gid = meta.data.sheets?.[0]?.properties?.sheetId ?? 0;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: gid,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

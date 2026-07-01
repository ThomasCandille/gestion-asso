import { getDriveWriteClient, getSheetsWriteClient } from "./google-clients";
import { env } from "@/server/env";
import type { EventType } from "@/features/events/event-rules";

export type RgbColor = { red: number; green: number; blue: number };

export const SHEET_COLORS = {
  blue: { red: 0.22, green: 0.46, blue: 0.69 },
  green: { red: 0.18, green: 0.62, blue: 0.46 },
} satisfies Record<string, RgbColor>;

export function formatDate(iso: string | null): string {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatBudget(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function getEventFolderId(eventType: EventType): string | null {
  if (eventType === "INTERNAL") return env.GOOGLE_DRIVE_POLE_INTERNE_FOLDER_ID ?? null;
  if (eventType === "EXTERNAL") return env.GOOGLE_DRIVE_POLE_EXTERNE_FOLDER_ID ?? null;
  return null;
}

type BuildSheetOptions = {
  name: string;
  folderId: string;
  data: string[][];
  headerRows: number[];
  headerColor: RgbColor;
  colWidths?: [number, number];
};

export async function buildSheet({
  name,
  folderId,
  data,
  headerRows,
  headerColor,
  colWidths = [220, 400],
}: BuildSheetOptions): Promise<{ sheetId: string; sheetUrl: string } | null> {
  const drive = getDriveWriteClient();
  const sheets = getSheetsWriteClient();
  if (!drive || !sheets) return null;

  const file = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [folderId],
    },
    fields: "id,webViewLink",
  });

  const sheetFileId = file.data.id;
  const sheetUrl = file.data.webViewLink;
  if (!sheetFileId || !sheetUrl) return null;

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetFileId,
    range: "A1",
    valueInputOption: "RAW",
    requestBody: { values: data },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetFileId,
    requestBody: {
      requests: [
        ...headerRows.map((rowIndex) => ({
          repeatCell: {
            range: {
              sheetId: 0,
              startRowIndex: rowIndex,
              endRowIndex: rowIndex + 1,
              startColumnIndex: 0,
              endColumnIndex: 2,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true, fontSize: 11 },
                backgroundColor: headerColor,
                borders: {
                  bottom: { style: "SOLID", color: { red: 1, green: 1, blue: 1 } },
                },
              },
            },
            fields: "userEnteredFormat(textFormat,backgroundColor,borders)",
          },
        })),
        {
          updateDimensionProperties: {
            range: { sheetId: 0, dimension: "COLUMNS", startIndex: 0, endIndex: 1 },
            properties: { pixelSize: colWidths[0] },
            fields: "pixelSize",
          },
        },
        {
          updateDimensionProperties: {
            range: { sheetId: 0, dimension: "COLUMNS", startIndex: 1, endIndex: 2 },
            properties: { pixelSize: colWidths[1] },
            fields: "pixelSize",
          },
        },
      ],
    },
  });

  return { sheetId: sheetFileId, sheetUrl };
}

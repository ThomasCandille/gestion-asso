import { Readable } from "stream";
import { getDriveClient, getDriveWriteClient } from "@/server/integrations/drive";
import { env } from "@/server/env";
import type { AppSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import type { AdminFolderKey, DriveFile } from "./documents-rules";

export class DocumentsPermissionError extends Error {
  constructor(message = "Action documents non autorisée.") {
    super(message);
    this.name = "DocumentsPermissionError";
  }
}

const FOLDER_ENV_KEYS: Record<AdminFolderKey, keyof typeof env> = {
  global: "GOOGLE_DRIVE_GLOBAL_FOLDER_ID",
  bureau: "GOOGLE_DRIVE_BUREAU_FOLDER_ID",
  ca: "GOOGLE_DRIVE_CA_FOLDER_ID",
  poleExterne: "GOOGLE_DRIVE_POLE_EXTERNE_FOLDER_ID",
  poleInterne: "GOOGLE_DRIVE_POLE_INTERNE_FOLDER_ID",
  poleCommunication: "GOOGLE_DRIVE_POLE_COMMUNICATION_FOLDER_ID",
};

function mapToDriveFile(f: {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  webViewLink?: string | null;
  thumbnailLink?: string | null;
  size?: string | null;
  modifiedTime?: string | null;
}): DriveFile {
  return {
    id: f.id ?? "",
    name: f.name ?? "(sans nom)",
    mimeType: f.mimeType ?? "application/octet-stream",
    webViewLink: f.webViewLink ?? "#",
    thumbnailLink: f.thumbnailLink ?? null,
    size: f.size ?? null,
    modifiedTime: f.modifiedTime ?? new Date().toISOString(),
  };
}

export async function listAdminFolderFiles(
  folderKey: AdminFolderKey,
): Promise<DriveFile[]> {
  const drive = getDriveClient();
  if (!drive) return [];

  const folderId = env[FOLDER_ENV_KEYS[folderKey]] as string | undefined;
  if (!folderId) return [];

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,webViewLink,thumbnailLink,size,modifiedTime)",
    orderBy: "name",
    pageSize: 100,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return (response.data.files ?? []).map(mapToDriveFile);
}

export async function listMediaFiles(): Promise<DriveFile[]> {
  const drive = getDriveClient();
  if (!drive) return [];

  const folderId = env.GOOGLE_DRIVE_MEDIA_FOLDER_ID;
  if (!folderId) return [];

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id,name,mimeType,webViewLink,thumbnailLink,size,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: 200,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return (response.data.files ?? []).map(mapToDriveFile);
}

export async function uploadMediaFile(
  actor: AppSession,
  name: string,
  mimeType: string,
  buffer: Buffer,
): Promise<DriveFile> {
  if (!hasPermission(actor.role, "documents:manage")) {
    throw new DocumentsPermissionError();
  }

  const drive = getDriveWriteClient();
  if (!drive) throw new Error("Drive upload non configuré (GOOGLE_DRIVE_REFRESH_TOKEN manquant).");

  const folderId = env.GOOGLE_DRIVE_MEDIA_FOLDER_ID;
  if (!folderId) throw new Error("Dossier médias non configuré.");

  const response = await drive.files.create({
    requestBody: {
      name,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id,name,mimeType,webViewLink,thumbnailLink,size,modifiedTime",
    supportsAllDrives: true,
  });

  return mapToDriveFile(response.data);
}

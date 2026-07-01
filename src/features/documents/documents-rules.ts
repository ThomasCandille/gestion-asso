import type { Pole, Role } from "@/server/permissions";
import { isOfficeRole } from "@/server/permissions";

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink: string | null;
  size: string | null;
  modifiedTime: string;
};

export type AdminFolderKey =
  | "global"
  | "bureau"
  | "ca"
  | "poleExterne"
  | "poleInterne"
  | "poleCommunication";

export type AdminFolder = {
  key: AdminFolderKey;
  label: string;
};

export const adminFolders: AdminFolder[] = [
  { key: "global", label: "Global" },
  { key: "bureau", label: "Bureau" },
  { key: "ca", label: "CA" },
  { key: "poleExterne", label: "Pôle Externe" },
  { key: "poleInterne", label: "Pôle Interne" },
  { key: "poleCommunication", label: "Pôle Communication" },
];

export function getAccessibleFolderKeys(
  role: Role,
  poles: readonly Pole[],
): AdminFolderKey[] {
  const bureau = isOfficeRole(role);
  const keys: AdminFolderKey[] = [];

  if (bureau) keys.push("global", "bureau", "ca");
  if (bureau || poles.includes("EXTERNE")) keys.push("poleExterne");
  if (bureau || poles.includes("INTERNE")) keys.push("poleInterne");
  if (bureau || poles.includes("COMMUNICATION")) keys.push("poleCommunication");

  return keys;
}

export type MimeCategory =
  | "image"
  | "video"
  | "pdf"
  | "doc"
  | "sheet"
  | "slide"
  | "file";

export function getMimeCategory(mimeType: string): MimeCategory {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "application/vnd.google-apps.document") return "doc";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "sheet";
  if (mimeType === "application/vnd.google-apps.presentation") return "slide";
  return "file";
}

export const mimeCategoryLabels: Record<MimeCategory, string> = {
  image: "Image",
  video: "Vidéo",
  pdf: "PDF",
  doc: "Google Docs",
  sheet: "Google Sheets",
  slide: "Google Slides",
  file: "Fichier",
};

export function formatFileSize(size: string | null): string {
  if (!size) return "—";
  const bytes = parseInt(size, 10);
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatModifiedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

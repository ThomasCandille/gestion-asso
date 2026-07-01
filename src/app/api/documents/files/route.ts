import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { getAccessibleFolderKeys } from "@/features/documents/documents-rules";
import {
  listAdminFolderFiles,
  listMediaFiles,
} from "@/features/documents/documents-service";
import type { AdminFolderKey } from "@/features/documents/documents-rules";

export async function GET(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");

  if (folder === "media") {
    const files = await listMediaFiles();
    return NextResponse.json({ files });
  }

  const validKeys: AdminFolderKey[] = [
    "global",
    "bureau",
    "ca",
    "poleExterne",
    "poleInterne",
    "poleCommunication",
  ];

  if (!folder || !validKeys.includes(folder as AdminFolderKey)) {
    return NextResponse.json({ error: "Dossier invalide" }, { status: 400 });
  }

  const accessible = getAccessibleFolderKeys(session.role, session.poles);
  if (!accessible.includes(folder as AdminFolderKey)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const files = await listAdminFolderFiles(folder as AdminFolderKey);
  return NextResponse.json({ files });
}

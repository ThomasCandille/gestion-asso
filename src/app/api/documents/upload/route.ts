import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { uploadMediaFile } from "@/features/documents/documents-service";

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo

export async function POST(req: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant." }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (max 50 Mo)." },
      { status: 413 },
    );
  }

  const allowed = ["image/", "video/"];
  if (!allowed.some((prefix) => file.type.startsWith(prefix))) {
    return NextResponse.json(
      { error: "Seules les images et vidéos sont acceptées." },
      { status: 415 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const created = await uploadMediaFile(
      session,
      file.name,
      file.type,
      buffer,
    );
    return NextResponse.json({ file: created }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Upload impossible.";
    const status = message.includes("autorisé") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

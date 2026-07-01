import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  listCampaigns,
  createCampaign,
  CommPermissionError,
} from "@/features/communication/comm-service";
import { getCurrentSession } from "@/server/auth/session";

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation invalide.", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof CommPermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  try {
    return NextResponse.json({ campaigns: await listCampaigns() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  try {
    const campaign = await createCampaign(session, await request.json());
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

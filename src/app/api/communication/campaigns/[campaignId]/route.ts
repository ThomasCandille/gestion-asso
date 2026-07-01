import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  updateCampaign,
  deleteCampaign,
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

type Params = { params: Promise<{ campaignId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const { campaignId } = await params;
  try {
    const campaign = await updateCampaign(session, campaignId, await request.json());
    return NextResponse.json({ campaign });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const { campaignId } = await params;
  try {
    await deleteCampaign(session, campaignId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}

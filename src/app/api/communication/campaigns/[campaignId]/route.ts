import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  updateCampaign,
  deleteCampaign,
} from "@/features/communication/comm-service";
import { getCurrentSession } from "@/server/auth/session";


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
    return routeErrorResponse(error);
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
    return routeErrorResponse(error);
  }
}

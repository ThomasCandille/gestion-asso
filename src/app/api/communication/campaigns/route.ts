import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  listCampaigns,
  createCampaign,
} from "@/features/communication/communication-service";
import { getCurrentSession } from "@/server/auth/session";


export async function GET() {
  if (!await getCurrentSession()) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  try {
    return NextResponse.json({ campaigns: await listCampaigns() });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  try {
    const campaign = await createCampaign(session, await request.json());
    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import { createPost } from "@/features/communication/communication-service";
import { getCurrentSession } from "@/server/auth/session";


type Params = { params: Promise<{ campaignId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { campaignId } = await params;
  try {
    const post = await createPost(session, campaignId, await request.json());
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

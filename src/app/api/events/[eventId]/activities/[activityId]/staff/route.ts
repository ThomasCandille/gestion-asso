import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  registerAsStaff,
  unregisterAsStaff,
} from "@/features/events/activity-service";
import { getCurrentSession } from "@/server/auth/session";


type Params = { params: Promise<{ eventId: string; activityId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { eventId, activityId } = await params;

  try {
    const body = (await request.json().catch(() => ({}))) as {
      memberId?: string;
    };
    const activity = await registerAsStaff(
      session,
      eventId,
      activityId,
      body.memberId,
    );
    return NextResponse.json({ activity });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { eventId, activityId } = await params;

  try {
    const body = (await request.json()) as { memberId: string };
    const activity = await unregisterAsStaff(
      session,
      eventId,
      activityId,
      body.memberId,
    );
    return NextResponse.json({ activity });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

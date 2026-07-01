import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  deleteActivity,
  updateActivity,
} from "@/features/events/activity-service";
import { getCurrentSession } from "@/server/auth/session";


type Params = { params: Promise<{ eventId: string; activityId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const { eventId, activityId } = await params;

  try {
    const activity = await updateActivity(
      session,
      eventId,
      activityId,
      await request.json(),
    );
    return NextResponse.json({ activity });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const { eventId, activityId } = await params;

  try {
    await deleteActivity(session, eventId, activityId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

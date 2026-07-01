import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  deleteActivity,
  updateActivity,
  ActivityPermissionError,
  ActivityRuleError,
} from "@/features/events/activity-service";
import { getCurrentSession } from "@/server/auth/session";

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation invalide.", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof ActivityPermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof ActivityRuleError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
}

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
    return errorResponse(error);
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
    return errorResponse(error);
  }
}

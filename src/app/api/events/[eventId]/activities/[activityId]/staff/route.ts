import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  registerAsStaff,
  unregisterAsStaff,
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

export async function POST(request: Request, { params }: Params) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
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
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
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
    return errorResponse(error);
  }
}

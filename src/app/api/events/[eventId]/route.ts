import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  cancelEvent,
  getEventById,
  updateEvent,
  EventPermissionError,
  EventRuleError,
} from "@/features/events/event-service";
import { getCurrentSession } from "@/server/auth/session";

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation invalide.", details: error.issues },
      { status: 400 },
    );
  }
  if (error instanceof EventPermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof EventRuleError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
}

type Params = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const { eventId } = await params;
  const event = await getEventById(eventId);

  if (!event) {
    return NextResponse.json(
      { error: "Evenement introuvable." },
      { status: 404 },
    );
  }

  return NextResponse.json({ event });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const { eventId } = await params;

  try {
    const event = await updateEvent(session, eventId, await request.json());
    return NextResponse.json({ event });
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

  const { eventId } = await params;

  try {
    const event = await cancelEvent(session, eventId);
    return NextResponse.json({ event });
  } catch (error) {
    return errorResponse(error);
  }
}

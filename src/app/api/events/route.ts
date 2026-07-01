import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createEvent,
  listEvents,
  EventPermissionError,
  EventRuleError,
} from "@/features/events/event-service";
import { eventFiltersSchema } from "@/features/events/event-schemas";
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

export async function GET(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const filters = eventFiltersSchema.parse({
      search: searchParams.get("search") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
    });

    return NextResponse.json({ events: await listEvents(filters) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  try {
    const event = await createEvent(session, await request.json());
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  cancelEvent,
  getEventById,
  updateEvent,
} from "@/features/events/event-service";
import { getCurrentSession } from "@/server/auth/session";


type Params = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!await getCurrentSession()) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
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
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { eventId } = await params;

  try {
    const event = await updateEvent(session, eventId, await request.json());
    return NextResponse.json({ event });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { eventId } = await params;

  try {
    const event = await cancelEvent(session, eventId);
    return NextResponse.json({ event });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

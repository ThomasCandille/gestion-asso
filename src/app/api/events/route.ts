import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  createEvent,
  listEvents,
} from "@/features/events/event-service";
import { eventFiltersSchema } from "@/features/events/event-schemas";
import { getCurrentSession } from "@/server/auth/session";


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
    return routeErrorResponse(error);
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
    return routeErrorResponse(error);
  }
}

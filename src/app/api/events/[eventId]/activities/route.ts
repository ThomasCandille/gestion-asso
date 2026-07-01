import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  createActivity,
  listActivities,
} from "@/features/events/activity-service";
import { getCurrentSession } from "@/server/auth/session";


type Params = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!await getCurrentSession()) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { eventId } = await params;

  try {
    return NextResponse.json({ activities: await listActivities(eventId) });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { eventId } = await params;

  try {
    const activity = await createActivity(
      session,
      eventId,
      await request.json(),
    );
    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  createMember,
  listMembers,
} from "@/features/members/member-service";
import { memberFiltersSchema } from "@/features/members/member-schemas";
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
    const filters = memberFiltersSchema.parse({
      search: searchParams.get("search") || undefined,
      pole: searchParams.get("pole") || undefined,
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      year: searchParams.get("year") || undefined,
    });

    return NextResponse.json({ members: await listMembers(filters) });
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
    const member = await createMember(session, await request.json());
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

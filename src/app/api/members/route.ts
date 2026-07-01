import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createMember,
  listMembers,
  MemberPermissionError,
  MemberRuleError,
} from "@/features/members/member-service";
import { memberFiltersSchema } from "@/features/members/member-schemas";
import { getCurrentSession } from "@/server/auth/session";

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation invalide.", details: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof MemberPermissionError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error instanceof MemberRuleError) {
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
    const filters = memberFiltersSchema.parse({
      search: searchParams.get("search") || undefined,
      pole: searchParams.get("pole") || undefined,
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      year: searchParams.get("year") || undefined,
    });

    return NextResponse.json({ members: await listMembers(filters) });
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
    const member = await createMember(session, await request.json());
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

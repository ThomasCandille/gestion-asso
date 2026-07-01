import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  deactivateMember,
  getMemberById,
  MemberPermissionError,
  MemberRuleError,
  updateMember,
} from "@/features/members/member-service";
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

type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  const { memberId } = await context.params;
  const member = await getMemberById(memberId);

  if (!member) {
    return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
  }

  return NextResponse.json({ member });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  try {
    const { memberId } = await context.params;
    const member = await updateMember(session, memberId, await request.json());
    return NextResponse.json({ member });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  try {
    const { memberId } = await context.params;
    const member = await deactivateMember(session, memberId);
    return NextResponse.json({ member });
  } catch (error) {
    return errorResponse(error);
  }
}

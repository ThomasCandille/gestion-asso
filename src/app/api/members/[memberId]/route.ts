import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import {
  deactivateMember,
  getMemberById,
  updateMember,
} from "@/features/members/member-service";
import { getCurrentSession } from "@/server/auth/session";


type RouteContext = {
  params: Promise<{
    memberId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!await getCurrentSession()) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
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
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  try {
    const { memberId } = await context.params;
    const member = await updateMember(session, memberId, await request.json());
    return NextResponse.json({ member });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  try {
    const { memberId } = await context.params;
    const member = await deactivateMember(session, memberId);
    return NextResponse.json({ member });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

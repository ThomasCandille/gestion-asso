import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import { addAssignee, removeAssignee } from "@/features/communication/comm-service";
import { getCurrentSession } from "@/server/auth/session";


type Params = { params: Promise<{ postId: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const { postId } = await params;
  try {
    const { memberId } = await request.json();
    const post = await addAssignee(session, postId, memberId);
    return NextResponse.json({ post });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }

  const { postId } = await params;
  try {
    const { memberId } = await request.json();
    const post = await removeAssignee(session, postId, memberId);
    return NextResponse.json({ post });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

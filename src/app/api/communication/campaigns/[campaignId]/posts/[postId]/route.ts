import { NextResponse } from "next/server";
import { routeErrorResponse } from "@/lib/api";
import { updatePost, deletePost } from "@/features/communication/communication-service";
import { getCurrentSession } from "@/server/auth/session";


type Params = { params: Promise<{ postId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { postId } = await params;
  try {
    const post = await updatePost(session, postId, await request.json());
    return NextResponse.json({ post });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }
  const { postId } = await params;
  try {
    await deletePost(session, postId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

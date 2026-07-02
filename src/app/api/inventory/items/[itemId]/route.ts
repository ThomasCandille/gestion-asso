import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { routeErrorResponse } from "@/lib/api";
import {
  deleteInventoryItem,
  updateInventoryItem,
} from "@/features/inventory/inventory-service";

type Params = { params: Promise<{ itemId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { itemId } = await params;
  try {
    const item = await updateInventoryItem(session, itemId, await request.json());
    return NextResponse.json({ item });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { itemId } = await params;
  try {
    await deleteInventoryItem(session, itemId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

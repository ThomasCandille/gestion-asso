import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { routeErrorResponse } from "@/lib/api";
import {
  createInventoryItem,
  listInventoryItems,
} from "@/features/inventory/inventory-service";

export async function GET() {
  if (!await getCurrentSession()) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const items = await listInventoryItems();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const item = await createInventoryItem(session, await request.json());
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}

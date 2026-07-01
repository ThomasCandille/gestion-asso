import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { inventoryItemFormSchema } from "@/features/inventory/inventory-schemas";
import {
  deleteInventoryItem,
  updateInventoryItem,
  InventoryPermissionError,
} from "@/features/inventory/inventory-service";
import type { InventoryCategory } from "@/features/inventory/inventory-rules";

type Params = { params: Promise<{ itemId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { itemId } = await params;

  try {
    const body = await request.json();
    const parsed = inventoryItemFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 },
      );
    }

    const { name, category, quantity, unit, minQuantity, location, notes } = parsed.data;
    const item = await updateInventoryItem(session, itemId, {
      name,
      category: category as InventoryCategory,
      quantity: quantity as number,
      unit: unit ?? null,
      minQuantity: (minQuantity as number | undefined) ?? null,
      location: location ?? null,
      notes: notes ?? null,
    });
    return NextResponse.json({ item });
  } catch (err) {
    if (err instanceof InventoryPermissionError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { itemId } = await params;

  try {
    await deleteInventoryItem(session, itemId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof InventoryPermissionError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

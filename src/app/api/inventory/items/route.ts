import { NextResponse } from "next/server";
import { getCurrentSession } from "@/server/auth/session";
import { inventoryItemFormSchema } from "@/features/inventory/inventory-schemas";
import {
  createInventoryItem,
  listInventoryItems,
  InventoryPermissionError,
} from "@/features/inventory/inventory-service";
import type { InventoryCategory } from "@/features/inventory/inventory-rules";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const items = await listInventoryItems();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

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
    const item = await createInventoryItem(session, {
      name,
      category: category as InventoryCategory,
      quantity: quantity as number,
      unit: unit || undefined,
      minQuantity: (minQuantity as number | undefined) || undefined,
      location: location || undefined,
      notes: notes || undefined,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof InventoryPermissionError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

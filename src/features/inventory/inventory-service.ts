import { prisma } from "@/server/db/client";
import { hasPermission } from "@/server/permissions";
import type { AppSession } from "@/server/auth/session";
import type { InventoryCategory } from "./inventory-rules";

export class InventoryPermissionError extends Error {
  constructor() {
    super("Permission refusée : gestion de l'inventaire requise.");
    this.name = "InventoryPermissionError";
  }
}

function assertCanManage(actor: AppSession) {
  if (!hasPermission(actor.role, "inventory:manage")) {
    throw new InventoryPermissionError();
  }
}

export type InventoryItemDto = {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string | null;
  minQuantity: number | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const select = {
  id: true,
  name: true,
  category: true,
  quantity: true,
  unit: true,
  minQuantity: true,
  location: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toDto(item: {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string | null;
  minQuantity: number | null;
  location: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): InventoryItemDto {
  return {
    id: item.id,
    name: item.name,
    category: item.category as InventoryCategory,
    quantity: item.quantity,
    unit: item.unit,
    minQuantity: item.minQuantity,
    location: item.location,
    notes: item.notes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function listInventoryItems(): Promise<InventoryItemDto[]> {
  const items = await prisma.inventoryItem.findMany({
    select,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return items.map(toDto);
}

export async function createInventoryItem(
  actor: AppSession,
  input: {
    name: string;
    category: InventoryCategory;
    quantity: number;
    unit?: string;
    minQuantity?: number;
    location?: string;
    notes?: string;
  },
): Promise<InventoryItemDto> {
  assertCanManage(actor);
  const item = await prisma.inventoryItem.create({
    data: {
      name: input.name,
      category: input.category,
      quantity: input.quantity,
      unit: input.unit ?? null,
      minQuantity: input.minQuantity ?? null,
      location: input.location ?? null,
      notes: input.notes ?? null,
    },
    select,
  });
  return toDto(item);
}

export async function updateInventoryItem(
  actor: AppSession,
  itemId: string,
  input: {
    name?: string;
    category?: InventoryCategory;
    quantity?: number;
    unit?: string | null;
    minQuantity?: number | null;
    location?: string | null;
    notes?: string | null;
  },
): Promise<InventoryItemDto> {
  assertCanManage(actor);
  const item = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: input,
    select,
  });
  return toDto(item);
}

export async function deleteInventoryItem(
  actor: AppSession,
  itemId: string,
): Promise<void> {
  assertCanManage(actor);
  await prisma.inventoryItem.delete({ where: { id: itemId } });
}

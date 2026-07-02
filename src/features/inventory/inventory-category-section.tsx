"use client";

import { AlertTriangle, Edit3, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/lib/ui";
import {
  inventoryCategoryEmoji,
  inventoryCategoryLabels,
  inventoryCategoryStyles,
  isLowStock,
  type InventoryCategory,
} from "./inventory-rules";
import type { InventoryItemDto } from "./inventory-service";

function quantityLabel(item: InventoryItemDto) {
  return item.unit ? `${item.quantity} ${item.unit}` : `${item.quantity}`;
}

type Props = {
  category: InventoryCategory;
  items: InventoryItemDto[];
  isSaving: boolean;
  canManage: boolean;
  onAddItem: (category: InventoryCategory) => void;
  onEditItem: (item: InventoryItemDto) => void;
  onDeleteItem: (id: string) => void;
};

export function InventoryCategorySection({
  category,
  items,
  isSaving,
  canManage,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            {inventoryCategoryEmoji[category]}
          </span>
          <h2 className="font-semibold text-zinc-950">
            {inventoryCategoryLabels[category]}
          </h2>
          <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
            {items.length}
          </span>
        </div>
        {canManage ? (
          <button
            type="button"
            onClick={() => onAddItem(category)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Ajouter
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Quantité</th>
              <th className="px-4 py-3 hidden sm:table-cell">Emplacement</th>
              <th className="px-4 py-3 hidden md:table-cell">Notes</th>
              {canManage ? <th className="px-4 py-3">Actions</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item) => {
              const low = isLowStock(item.quantity, item.minQuantity);
              return (
                <tr key={item.id} className="group hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-950">{item.name}</span>
                      {low ? (
                        <span
                          title={`Stock bas — seuil : ${item.minQuantity}`}
                          className="text-amber-500"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" aria-label="Stock bas" />
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        low
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : inventoryCategoryStyles[item.category]
                      }
                    >
                      {quantityLabel(item)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">
                    {item.location ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden md:table-cell max-w-xs truncate">
                    {item.notes ?? "—"}
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden />
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          disabled={isSaving}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

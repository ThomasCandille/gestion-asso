"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge, controlClass, StatCard } from "@/lib/ui";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import {
  inventoryCategoryEmoji,
  inventoryCategoryLabels,
  inventoryCategoryStyles,
  inventoryCategoryValues,
  isLowStock,
  type InventoryCategory,
} from "./inventory-rules";
import { inventoryItemFormSchema, type InventoryItemFormInput } from "./inventory-schemas";
import type { InventoryItemDto } from "./inventory-service";
import { InventoryItemForm } from "./inventory-form";

type Props = {
  initialItems: InventoryItemDto[];
  canManage: boolean;
};

const emptyForm: InventoryItemFormInput = {
  name: "",
  category: "FOOD",
  quantity: "0",
  unit: "",
  minQuantity: "",
  location: "",
  notes: "",
};

function toFormState(item: InventoryItemDto): InventoryItemFormInput {
  return {
    name: item.name,
    category: item.category,
    quantity: String(item.quantity),
    unit: item.unit ?? "",
    minQuantity: item.minQuantity !== null ? String(item.minQuantity) : "",
    location: item.location ?? "",
    notes: item.notes ?? "",
  };
}

function quantityLabel(item: InventoryItemDto) {
  return item.unit
    ? `${item.quantity} ${item.unit}`
    : `${item.quantity}`;
}

export function InventoryClient({ initialItems, canManage }: Props) {
  const [items, setItems] = useState(initialItems);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InventoryItemFormInput>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | "ALL">("ALL");

  const stats = useMemo(() => {
    const total = items.length;
    const lowStock = items.filter((i) => isLowStock(i.quantity, i.minQuantity)).length;
    const byCategory = Object.fromEntries(
      inventoryCategoryValues.map((cat) => [
        cat,
        items.filter((i) => i.category === cat).length,
      ]),
    ) as Record<InventoryCategory, number>;
    return { total, lowStock, byCategory };
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.location ?? "").toLowerCase().includes(q) ||
        (item.notes ?? "").toLowerCase().includes(q);
      const matchCat = selectedCategory === "ALL" || item.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [items, search, selectedCategory]);

  const groupedItems = useMemo(() => {
    const groups: Record<InventoryCategory, InventoryItemDto[]> = {
      FOOD: [],
      EQUIPMENT: [],
      DECORATION: [],
      CONSUMABLE: [],
      OTHER: [],
    };
    for (const item of filteredItems) {
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  const visibleCategories = inventoryCategoryValues.filter(
    (cat) => selectedCategory === "ALL" ? groupedItems[cat].length > 0 : cat === selectedCategory,
  );

  function startCreate(defaultCategory?: InventoryCategory) {
    setEditingId(null);
    setForm({ ...emptyForm, category: defaultCategory ?? "FOOD" });
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function startEdit(item: InventoryItemDto) {
    setEditingId(item.id);
    setForm(toFormState(item));
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function updateForm<K extends keyof InventoryItemFormInput>(
    field: K,
    value: InventoryItemFormInput[K],
  ) {
    setFeedback(null);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = inventoryItemFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      setFeedback(null);
      return;
    }

    setIsSaving(true);
    try {
      const { name, category, quantity, unit, minQuantity, location, notes } = parsed.data;
      const payload = {
        name,
        category,
        quantity,
        unit: unit || undefined,
        minQuantity: (minQuantity as number | undefined) || undefined,
        location: location || undefined,
        notes: notes || undefined,
      };

      const response = await fetch(
        editingId
          ? `/api/inventory/items/${encodeURIComponent(editingId)}`
          : "/api/inventory/items",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { item: InventoryItemDto };
      const saved = data.item;

      setItems((current) => {
        if (!editingId) return [...current, saved].sort((a, b) =>
          a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
        );
        return current.map((it) => (it.id === editingId ? saved : it));
      });
      setErrors([]);
      setShowForm(false);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Enregistrement impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (!confirm(`Supprimer « ${item?.name ?? "cet article"} » ?`)) return;

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/inventory/items/${encodeURIComponent(itemId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await readApiError(response));
      setItems((current) => current.filter((i) => i.id !== itemId));
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Suppression impossible."]);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              IIMPACT
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
              Inventaire
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {canManage ? (
              <button
                type="button"
                onClick={() => startCreate()}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Nouvel article
              </button>
            ) : null}
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-0"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total articles" value={stats.total} />
          {stats.lowStock > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                Stock bas
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-700">
                {stats.lowStock}
              </p>
            </div>
          ) : (
            <StatCard label="Stock bas" value={0} tone="emerald" />
          )}
          {inventoryCategoryValues.slice(0, 3).map((cat) => (
            <StatCard
              key={cat}
              label={inventoryCategoryLabels[cat]}
              value={stats.byCategory[cat]}
            />
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article…"
              className={`${controlClass} pl-9`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                selectedCategory === "ALL"
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              Tout
            </button>
            {inventoryCategoryValues.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                  selectedCategory === cat
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {inventoryCategoryEmoji[cat]} {inventoryCategoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
            <Package className="mx-auto h-10 w-10 text-zinc-300" aria-hidden />
            <p className="mt-4 font-semibold text-zinc-700">
              {search || selectedCategory !== "ALL"
                ? "Aucun article ne correspond aux filtres."
                : "L'inventaire est vide."}
            </p>
            {canManage && !search && selectedCategory === "ALL" ? (
              <button
                type="button"
                onClick={() => startCreate()}
                className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                Ajouter le premier article
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Category sections */}
        {visibleCategories.map((cat) => {
          const catItems = groupedItems[cat];
          if (catItems.length === 0) return null;
          return (
            <section key={cat}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden>
                    {inventoryCategoryEmoji[cat]}
                  </span>
                  <h2 className="font-semibold text-zinc-950">
                    {inventoryCategoryLabels[cat]}
                  </h2>
                  <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
                    {catItems.length}
                  </span>
                </div>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => startCreate(cat)}
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
                    {catItems.map((item) => {
                      const low = isLowStock(item.quantity, item.minQuantity);
                      return (
                        <tr key={item.id} className="group hover:bg-zinc-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-950">
                                {item.name}
                              </span>
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
                                  onClick={() => startEdit(item)}
                                  className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                                >
                                  <Edit3 className="h-3.5 w-3.5" aria-hidden />
                                  Modifier
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteItem(item.id)}
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
        })}
      </div>

      {canManage ? (
        <Modal
          open={showForm}
          title={editingId ? "Modifier l'article" : "Nouvel article"}
          onClose={() => setShowForm(false)}
        >
          <InventoryItemForm
            editingId={editingId}
            form={form}
            errors={errors}
            feedback={feedback}
            isSaving={isSaving}
            onClose={() => setShowForm(false)}
            onSubmit={submitItem}
            onUpdateForm={updateForm}
          />
        </Modal>
      ) : null}
    </main>
  );
}

"use client";

import { controlClass, FormFeedback, TextField, TextareaField } from "@/lib/ui";
import {
  commonUnits,
  inventoryCategoryLabels,
  inventoryCategoryValues,
  type InventoryCategory,
} from "./inventory-rules";
import type { InventoryItemFormInput } from "./inventory-schemas";

type Props = {
  editingId: string | null;
  form: InventoryItemFormInput;
  errors: string[];
  feedback: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof InventoryItemFormInput>(
    field: K,
    value: InventoryItemFormInput[K],
  ) => void;
};

export function InventoryItemForm({
  editingId,
  form,
  errors,
  feedback,
  isSaving,
  onClose,
  onSubmit,
  onUpdateForm,
}: Props) {
  return (
    <>
      <FormFeedback feedback={feedback} errors={errors} />

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Nom"
          value={form.name}
          onChange={(v) => onUpdateForm("name", v)}
        />

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">Catégorie</span>
          <select
            value={form.category}
            onChange={(e) => onUpdateForm("category", e.target.value as InventoryCategory)}
            className={controlClass}
          >
            {inventoryCategoryValues.map((cat) => (
              <option key={cat} value={cat}>
                {inventoryCategoryLabels[cat]}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Quantité"
            value={form.quantity}
            onChange={(v) => onUpdateForm("quantity", v)}
          />

          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Unité (optionnel)</span>
            <input
              list="unit-options"
              value={form.unit}
              onChange={(e) => onUpdateForm("unit", e.target.value)}
              placeholder="kg, unités…"
              className={controlClass}
            />
            <datalist id="unit-options">
              {commonUnits.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </label>
        </div>

        <TextField
          label="Seuil d'alerte stock bas (optionnel)"
          value={form.minQuantity}
          onChange={(v) => onUpdateForm("minQuantity", v)}
        />

        <TextField
          label="Emplacement (optionnel)"
          value={form.location}
          onChange={(v) => onUpdateForm("location", v)}
        />

        <TextareaField
          label="Notes (optionnel)"
          value={form.notes}
          onChange={(v) => onUpdateForm("notes", v)}
          rows={2}
        />

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Enregistrement..."
              : editingId
                ? "Enregistrer"
                : "Ajouter l'article"}
          </button>
        </div>
      </form>
    </>
  );
}

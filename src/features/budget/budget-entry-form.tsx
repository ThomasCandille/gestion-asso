"use client";

import { controlClass, FormFeedback, TextField } from "@/lib/ui";
import {
  budgetEntryTypeLabels,
  budgetEntryTypeValues,
  type BudgetEntryType,
} from "./budget-rules";
import type { BudgetEntryFormInput } from "./budget-schemas";

type EventOption = { id: string; title: string };

type Props = {
  editingId: string | null;
  form: BudgetEntryFormInput;
  errors: string[];
  feedback: string | null;
  isSaving: boolean;
  eventOptions: EventOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof BudgetEntryFormInput>(
    field: K,
    value: BudgetEntryFormInput[K],
  ) => void;
};

export function BudgetEntryForm({
  editingId,
  form,
  errors,
  feedback,
  isSaving,
  eventOptions,
  onClose,
  onSubmit,
  onUpdateForm,
}: Props) {
  return (
    <>
      <FormFeedback feedback={feedback} errors={errors} />

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">Type</span>
          <select
            value={form.type}
            onChange={(e) => onUpdateForm("type", e.target.value as BudgetEntryType)}
            className={controlClass}
          >
            {budgetEntryTypeValues.map((t) => (
              <option key={t} value={t}>
                {budgetEntryTypeLabels[t]}
              </option>
            ))}
          </select>
        </label>

        <TextField
          label="Libellé"
          value={form.label}
          onChange={(v) => onUpdateForm("label", v)}
        />

        <TextField
          label="Montant (€)"
          type="number"
          min={0}
          step={0.01}
          value={form.amountEuros}
          onChange={(v) => onUpdateForm("amountEuros", v)}
        />

        <TextField
          label="Date"
          type="date"
          value={form.occurredAt ?? ""}
          onChange={(v) => onUpdateForm("occurredAt", v)}
        />

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">
            Événement lié (optionnel)
          </span>
          <select
            value={form.eventId ?? ""}
            onChange={(e) => onUpdateForm("eventId", e.target.value || undefined)}
            className={controlClass}
          >
            <option value="">— Aucun événement —</option>
            {eventOptions.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </label>

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
            {isSaving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter l'entrée"}
          </button>
        </div>
      </form>
    </>
  );
}

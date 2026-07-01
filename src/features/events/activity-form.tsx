"use client";

import { FormFeedback, TextField, TextareaField } from "@/lib/ui";

export type ActivityFormState = {
  title: string;
  description: string;
  rules: string;
  prizes: string;
  budgetEuros: string;
};

type Props = {
  editingId: string | null;
  form: ActivityFormState;
  errors: string[];
  feedback: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof ActivityFormState>(
    field: K,
    value: ActivityFormState[K],
  ) => void;
};

export function ActivityFormSection({
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
          label="Titre"
          value={form.title}
          onChange={(v) => onUpdateForm("title", v)}
        />

        <TextareaField
          label="Description"
          value={form.description}
          onChange={(v) => onUpdateForm("description", v)}
        />

        <TextareaField
          label="Regles"
          value={form.rules}
          onChange={(v) => onUpdateForm("rules", v)}
        />

        <TextField
          label="Lots"
          value={form.prizes}
          onChange={(v) => onUpdateForm("prizes", v)}
        />

        <TextField
          label="Budget (€)"
          value={form.budgetEuros}
          onChange={(v) => onUpdateForm("budgetEuros", v)}
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
            {isSaving ? "Enregistrement..." : editingId ? "Enregistrer" : "Creer l'activite"}
          </button>
        </div>
      </form>
    </>
  );
}

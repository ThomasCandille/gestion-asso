"use client";

import { controlClass, FormFeedback, TextField, TextareaField } from "@/lib/ui";
import {
  communicationStatusValues,
  communicationStatusLabels,
  type CommunicationStatus,
} from "./comm-rules";
import type { CampaignFormInput } from "./comm-schemas";

type EventOption = { id: string; title: string };

type Props = {
  editingId: string | null;
  form: CampaignFormInput;
  errors: string[];
  feedback: string | null;
  isSaving: boolean;
  eventOptions: EventOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof CampaignFormInput>(field: K, value: CampaignFormInput[K]) => void;
};

export function CampaignForm({
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
        <TextField
          label="Titre"
          value={form.title}
          onChange={(v) => onUpdateForm("title", v)}
        />

        <TextareaField
          label="Description (optionnel)"
          value={form.description ?? ""}
          onChange={(v) => onUpdateForm("description", v)}
          rows={2}
        />

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">Événement</span>
          <select
            value={form.eventId}
            onChange={(e) => onUpdateForm("eventId", e.target.value)}
            className={controlClass}
            disabled={!!editingId}
          >
            <option value="">— Sélectionner un événement —</option>
            {eventOptions.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">Statut</span>
          <select
            value={form.status}
            onChange={(e) => onUpdateForm("status", e.target.value as CommunicationStatus)}
            className={controlClass}
          >
            {communicationStatusValues.map((s) => (
              <option key={s} value={s}>
                {communicationStatusLabels[s]}
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
            {isSaving ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer la campagne"}
          </button>
        </div>
      </form>
    </>
  );
}

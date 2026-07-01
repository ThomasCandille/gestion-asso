"use client";

import { controlClass, FormFeedback, TextField } from "@/lib/ui";
import {
  eventStatusLabels,
  eventStatusValues,
  eventTypeLabels,
  eventTypeValues,
  type EventStatus,
  type EventType,
} from "./event-rules";

export type EventFormState = {
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  location: string;
  startsAt: string;
  endsAt: string;
};

type Props = {
  editingEventId: string | null;
  form: EventFormState;
  errors: string[];
  feedback: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K],
  ) => void;
};

export function EventFormSection({
  editingEventId,
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

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Type</span>
            <select
              value={form.type}
              onChange={(e) => onUpdateForm("type", e.target.value as EventType)}
              className={controlClass}
            >
              {eventTypeValues.map((type) => (
                <option key={type} value={type}>
                  {eventTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Statut</span>
            <select
              value={form.status}
              onChange={(e) => onUpdateForm("status", e.target.value as EventStatus)}
              className={controlClass}
            >
              {eventStatusValues.map((status) => (
                <option key={status} value={status}>
                  {eventStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TextField
          label="Lieu"
          value={form.location}
          onChange={(v) => onUpdateForm("location", v)}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Date debut"
            type="date"
            value={form.startsAt}
            onChange={(v) => onUpdateForm("startsAt", v)}
          />
          <TextField
            label="Date fin"
            type="date"
            value={form.endsAt}
            onChange={(v) => onUpdateForm("endsAt", v)}
          />
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">Description</span>
          <textarea
            value={form.description}
            onChange={(e) => onUpdateForm("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none transition hover:border-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
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
            {isSaving ? "Enregistrement..." : editingEventId ? "Enregistrer" : "Creer l'evenement"}
          </button>
        </div>
      </form>
    </>
  );
}

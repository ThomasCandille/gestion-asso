"use client";

import { controlClass, FormFeedback, TextField, TextareaField } from "@/lib/ui";
import {
  communicationStatusValues,
  communicationStatusLabels,
  postTypeValues,
  postTypeLabels,
  type CommunicationStatus,
  type PostType,
} from "./comm-rules";
import type { PostFormInput } from "./comm-schemas";

type MemberOption = { id: string; firstName: string; lastName: string };

type Props = {
  editingId: string | null;
  form: PostFormInput;
  errors: string[];
  feedback: string | null;
  isSaving: boolean;
  memberOptions: MemberOption[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof PostFormInput>(field: K, value: PostFormInput[K]) => void;
};

export function PostForm({
  editingId,
  form,
  errors,
  feedback,
  isSaving,
  memberOptions,
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
          <label className="block space-y-1">
            <span className="text-xs font-medium text-zinc-600">Type de publication</span>
            <select
              value={form.postType}
              onChange={(e) => onUpdateForm("postType", e.target.value as PostType)}
              className={controlClass}
            >
              {postTypeValues.map((t) => (
                <option key={t} value={t}>
                  {postTypeLabels[t]}
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
        </div>

        <TextField
          label="Date de publication (optionnel)"
          type="datetime-local"
          value={form.scheduledAt ?? ""}
          onChange={(v) => onUpdateForm("scheduledAt", v)}
        />

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">Auteur (optionnel)</span>
          <select
            value={form.authorId ?? ""}
            onChange={(e) => onUpdateForm("authorId", e.target.value || undefined)}
            className={controlClass}
          >
            <option value="">— Aucun auteur —</option>
            {memberOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>
        </label>

        <TextareaField
          label="Contenu / légende (optionnel)"
          value={form.content ?? ""}
          onChange={(v) => onUpdateForm("content", v)}
          rows={3}
        />

        <TextareaField
          label="Description médias (optionnel)"
          value={form.mediaDescription ?? ""}
          onChange={(v) => onUpdateForm("mediaDescription", v)}
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
            {isSaving ? "Enregistrement..." : editingId ? "Enregistrer" : "Ajouter le post"}
          </button>
        </div>
      </form>
    </>
  );
}

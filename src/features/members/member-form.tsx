"use client";

import { Info } from "lucide-react";
import { controlClass, FormFeedback, TextField } from "@/lib/ui";
import {
  isOfficeRole,
  memberRoleValues,
  memberStatusValues,
  poleLabels,
  poleValues,
  roleLabels,
  statusLabels,
  type MemberRole,
  type MemberStatus,
  type Pole,
} from "./member-rules";
import type { MemberFormInput } from "./member-schemas";

type Props = {
  editingMemberId: string | null;
  form: MemberFormInput;
  errors: string[];
  feedback: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onUpdateForm: <K extends keyof MemberFormInput>(
    field: K,
    value: MemberFormInput[K],
  ) => void;
  onTogglePole: (pole: Pole) => void;
};

export function MemberFormSection({
  editingMemberId,
  form,
  errors,
  feedback,
  isSaving,
  onClose,
  onSubmit,
  onUpdateForm,
  onTogglePole,
}: Props) {
  return (
    <>
      <FormFeedback feedback={feedback} errors={errors} />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Prenom"
            value={form.firstName}
            onChange={(v) => onUpdateForm("firstName", v)}
          />
          <TextField
            label="Nom"
            value={form.lastName}
            onChange={(v) => onUpdateForm("lastName", v)}
          />
        </div>

        <TextField
          label="Email"
          value={form.email}
          onChange={(v) => onUpdateForm("email", v)}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Telephone"
            value={form.phone}
            onChange={(v) => onUpdateForm("phone", v)}
          />
          <TextField
            label="Annee"
            value={form.year}
            onChange={(v) => onUpdateForm("year", v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Role</span>
            <select
              value={form.role}
              onChange={(e) => onUpdateForm("role", e.target.value as MemberRole)}
              className={controlClass}
            >
              {memberRoleValues.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-zinc-600">Statut</span>
            <select
              value={form.status}
              onChange={(e) => onUpdateForm("status", e.target.value as MemberStatus)}
              className={controlClass}
            >
              {memberStatusValues.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-zinc-600">Poles</legend>
          <div className="grid grid-cols-3 gap-2">
            {poleValues.map((pole) => {
              const checked = form.poles.includes(pole);
              return (
                <button
                  key={pole}
                  type="button"
                  disabled={isOfficeRole(form.role)}
                  onClick={() => onTogglePole(pole)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                    checked
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {poleLabels[pole]}
                </button>
              );
            })}
          </div>
          {isOfficeRole(form.role) ? (
            <p className="flex gap-2 text-xs text-zinc-500">
              <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Les membres du bureau ne sont pas rattaches a un pole.
            </p>
          ) : null}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Discord"
            value={form.discordUsername ?? ""}
            onChange={(v) => onUpdateForm("discordUsername", v)}
          />
          <TextField
            label="Date entree"
            type="date"
            value={form.joinedAt ?? ""}
            onChange={(v) => onUpdateForm("joinedAt", v)}
          />
        </div>

        <TextField
          label="Photo URL"
          value={form.photoUrl ?? ""}
          onChange={(v) => onUpdateForm("photoUrl", v)}
        />

        <TextField
          label="Mot de passe initial"
          type="password"
          value={form.password ?? ""}
          onChange={(v) => onUpdateForm("password", v)}
        />

        <label className="block space-y-1">
          <span className="text-xs font-medium text-zinc-600">Notes internes</span>
          <textarea
            value={form.internalNotes ?? ""}
            onChange={(e) => onUpdateForm("internalNotes", e.target.value)}
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
            {isSaving ? "Enregistrement..." : editingMemberId ? "Enregistrer" : "Creer le membre"}
          </button>
        </div>
      </form>
    </>
  );
}

"use client";

import {
  Edit3,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { formatBudget } from "./event-formatters";
import type { ActivityDto } from "./activity-service";

type ActivityView = ActivityDto;

export type MemberOption = { id: string; firstName: string; lastName: string };

type Props = {
  activity: ActivityView;
  currentMemberId: string;
  isEditing: boolean;
  canManage: boolean;
  canRegister: boolean;
  isSaving: boolean;
  members: MemberOption[];
  selectedMemberId: string;
  onStartEdit: () => void;
  onDelete: () => void;
  onToggleSelf: () => void;
  onRegisterMember: (memberId: string) => void;
  onUnregisterMember: (memberId: string) => void;
  onSelectMember: (memberId: string) => void;
};

export function ActivityCard({
  activity,
  currentMemberId,
  isEditing,
  canManage,
  canRegister,
  isSaving,
  members,
  selectedMemberId,
  onStartEdit,
  onDelete,
  onToggleSelf,
  onRegisterMember,
  onUnregisterMember,
  onSelectMember,
}: Props) {
  const isRegistered = activity.staff.some((s) => s.memberId === currentMemberId);

  const staffIds = new Set(activity.staff.map((s) => s.memberId));
  const availableMembers = members.filter((m) => !staffIds.has(m.id));

  return (
    <article
      className={`rounded-lg border bg-white shadow-sm transition hover:border-zinc-300 ${
        isEditing
          ? "border-blue-300 ring-2 ring-blue-100"
          : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-zinc-950">{activity.title}</h3>
          {activity.description ? (
            <p className="mt-1 text-sm text-zinc-600">{activity.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {activity.expectedRevenueCents > 0 ? (
            <span className="text-sm font-medium text-emerald-700">
              +{formatBudget(activity.expectedRevenueCents)}
            </span>
          ) : null}
          <span className="text-sm font-medium text-zinc-700">
            {formatBudget(activity.budgetCents)}
          </span>
          {canManage ? (
            <>
              <button
                type="button"
                onClick={onStartEdit}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden />
                Modifier
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={isSaving}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Supprimer
              </button>
            </>
          ) : null}
        </div>
      </div>

      {activity.rules || activity.prizes ? (
        <div className="grid gap-3 border-t border-zinc-100 px-4 py-3 sm:grid-cols-2">
          {activity.rules ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Regles
              </p>
              <p className="mt-1 text-sm text-zinc-700">{activity.rules}</p>
            </div>
          ) : null}
          {activity.prizes ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Lots
              </p>
              <p className="mt-1 text-sm text-zinc-700">{activity.prizes}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="border-t border-zinc-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-400" aria-hidden />
            <span className="text-sm font-medium text-zinc-700">
              Staff ({activity.staff.length})
            </span>
          </div>
          {canRegister ? (
            <button
              type="button"
              onClick={onToggleSelf}
              disabled={isSaving}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                isRegistered
                  ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 focus-visible:outline-red-500"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 focus-visible:outline-emerald-500"
              }`}
            >
              {isRegistered ? (
                <>
                  <UserMinus className="h-3.5 w-3.5" aria-hidden />
                  Se desinscrire
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" aria-hidden />
                  S&apos;inscrire comme staff
                </>
              )}
            </button>
          ) : null}
        </div>

        {activity.staff.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {activity.staff.map((s) => (
              <span
                key={s.memberId}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${
                  s.memberId === currentMemberId
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                }`}
              >
                {s.firstName} {s.lastName}
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => onUnregisterMember(s.memberId)}
                    disabled={isSaving}
                    aria-label={`Retirer ${s.firstName} ${s.lastName} du staff`}
                    className="ml-0.5 rounded hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <UserMinus className="h-3 w-3" aria-hidden />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-zinc-400">
            Aucun staff inscrit pour le moment.
          </p>
        )}

        {canManage && availableMembers.length > 0 ? (
          <div className="mt-3 flex items-center gap-2">
            <select
              value={selectedMemberId}
              onChange={(e) => onSelectMember(e.target.value)}
              className="h-8 flex-1 rounded-md border border-zinc-200 bg-white px-2 text-xs outline-none transition hover:border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Choisir un membre...</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (selectedMemberId) onRegisterMember(selectedMemberId);
              }}
              disabled={!selectedMemberId || isSaving}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 text-xs font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden />
              Ajouter
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}


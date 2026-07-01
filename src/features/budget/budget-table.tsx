"use client";

import { Edit3, RotateCcw, Trash2 } from "lucide-react";
import { Badge, controlClass } from "@/lib/ui";
import { formatCents } from "@/lib/formats";
import {
  budgetEntryTypeLabels,
  budgetEntryTypeValues,
  type BudgetEntryType,
} from "./budget-rules";
import type { BudgetEntryDto } from "./budget-service";

const typeStyles: Record<BudgetEntryType, string> = {
  REVENUE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  EXPENSE: "bg-red-50 text-red-700 ring-red-200",
  FORECAST: "bg-amber-50 text-amber-700 ring-amber-200",
};

type EventOption = { id: string; title: string };

export type BudgetTableFilters = {
  type: BudgetEntryType | "ALL";
  eventId: string | "ALL";
  search: string;
};

type Props = {
  entries: BudgetEntryDto[];
  filters: BudgetTableFilters;
  hasActiveFilters: boolean;
  isSaving: boolean;
  canManage: boolean;
  eventOptions: EventOption[];
  onFilterChange: (partial: Partial<BudgetTableFilters>) => void;
  onClearFilters: () => void;
  onEdit: (entry: BudgetEntryDto) => void;
  onDelete: (id: string) => void;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function BudgetTable({
  entries,
  filters,
  hasActiveFilters,
  isSaving,
  canManage,
  eventOptions,
  onFilterChange,
  onClearFilters,
  onEdit,
  onDelete,
}: Props) {
  const filtered = entries.filter((e) => {
    const matchType = filters.type === "ALL" || e.type === filters.type;
    const matchEvent =
      filters.eventId === "ALL" ||
      (filters.eventId === "" ? !e.eventId : e.eventId === filters.eventId);
    const matchSearch =
      !filters.search ||
      e.label.toLowerCase().includes(filters.search.toLowerCase()) ||
      (e.eventTitle ?? "").toLowerCase().includes(filters.search.toLowerCase());
    return matchType && matchEvent && matchSearch;
  });

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-zinc-950">Filtres</h2>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Réinitialiser
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Rechercher un libellé..."
            className={controlClass}
          />

          <select
            value={filters.type}
            onChange={(e) =>
              onFilterChange({ type: e.target.value as BudgetEntryType | "ALL" })
            }
            className={controlClass}
          >
            <option value="ALL">Tous types</option>
            {budgetEntryTypeValues.map((t) => (
              <option key={t} value={t}>
                {budgetEntryTypeLabels[t]}
              </option>
            ))}
          </select>

          <select
            value={filters.eventId}
            onChange={(e) => onFilterChange({ eventId: e.target.value })}
            className={controlClass}
          >
            <option value="ALL">Tous événements</option>
            <option value="">Sans événement</option>
            {eventOptions.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <h2 className="font-semibold text-zinc-950">Entrées budgétaires</h2>
          <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-600">
            {filtered.length} entrée{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Libellé</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Événement</th>
                {canManage ? <th className="px-4 py-3">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 6 : 5}
                    className="px-4 py-10 text-center"
                  >
                    <p className="font-medium text-zinc-800">
                      Aucune entrée ne correspond aux filtres.
                    </p>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-900"
                      >
                        Réinitialiser les filtres
                      </button>
                    ) : null}
                  </td>
                </tr>
              ) : null}

              {filtered.map((entry) => (
                <tr key={entry.id} className="bg-white hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Badge className={typeStyles[entry.type]}>
                      {budgetEntryTypeLabels[entry.type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {entry.label}
                    {entry.activityTitle ? (
                      <span className="ml-1.5 text-xs text-zinc-400">
                        ({entry.activityTitle})
                      </span>
                    ) : null}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold tabular-nums ${
                      entry.type === "REVENUE"
                        ? "text-emerald-700"
                        : entry.type === "EXPENSE"
                          ? "text-red-700"
                          : "text-amber-700"
                    }`}
                  >
                    {entry.type === "EXPENSE" || entry.type === "FORECAST"
                      ? "−"
                      : "+"}
                    {formatCents(entry.amountCents)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {formatDate(entry.occurredAt)}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {entry.eventTitle ?? (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden />
                          Modifier
                        </button>
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => onDelete(entry.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

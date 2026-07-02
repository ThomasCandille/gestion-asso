"use client";

import {
  Ban,
  Edit3,
  LayoutDashboard,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Badge, controlClass, StatCard } from "@/lib/ui";
import {
  eventStatusLabels,
  eventStatusStyles,
  eventStatusValues,
  eventTypeLabels,
  eventTypeStyles,
  eventTypeValues,
  isTerminalStatus,
  type EventStatus,
  type EventType,
} from "./event-rules";
import type { EventView } from "./event-dto";
import { formatDate } from "./event-formatters";

type Filters = {
  search: string;
  type: EventType | "ALL";
  status: EventStatus | "ALL";
};

type Stats = {
  total: number;
  inProgress: number;
  planned: number;
  done: number;
};

type Props = {
  stats: Stats;
  filters: Filters;
  filteredEvents: EventView[];
  selectedEventId: string | null;
  isSaving: boolean;
  canManage: boolean;
  onSelectEvent: (id: string) => void;
  onStartEdit: (event: EventView) => void;
  onCancelEvent: (id: string) => void;
  onFilterChange: (partial: Partial<Filters>) => void;
  onClearFilters: () => void;
};

export function EventListSection({
  stats,
  filters,
  filteredEvents,
  selectedEventId,
  isSaving,
  canManage,
  onSelectEvent,
  onStartEdit,
  onCancelEvent,
  onFilterChange,
  onClearFilters,
}: Props) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "ALL" ||
    filters.status !== "ALL";

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="En cours" value={stats.inProgress} tone="amber" />
        <StatCard label="Planifies" value={stats.planned} tone="blue" />
        <StatCard label="Termines" value={stats.done} tone="emerald" />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-zinc-950">Filtres</h2>
            <p className="text-sm text-zinc-500">Recherche par titre ou lieu.</p>
          </div>
          <button
            type="button"
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reinitialiser
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
          <label className="relative">
            <span className="sr-only">Recherche</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              placeholder="Rechercher"
              className={`${controlClass} pl-9`}
            />
          </label>
          <select
            value={filters.type}
            onChange={(e) =>
              onFilterChange({ type: e.target.value as EventType | "ALL" })
            }
            className={controlClass}
          >
            <option value="ALL">Tous types</option>
            {eventTypeValues.map((type) => (
              <option key={type} value={type}>
                {eventTypeLabels[type]}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as EventStatus | "ALL" })
            }
            className={controlClass}
          >
            <option value="ALL">Tous statuts</option>
            {eventStatusValues.map((status) => (
              <option key={status} value={status}>
                {eventStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div>
            <h2 className="font-semibold text-zinc-950">Liste</h2>
            <p className="text-xs text-zinc-500">
              Cliquer sur une ligne affiche sa fiche detail.
            </p>
          </div>
          <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-medium text-zinc-600">
            {filteredEvents.length}{" "}
            {filteredEvents.length !== 1 ? "evenements" : "evenement"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Evenement</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <p className="font-medium text-zinc-800">
                      Aucun evenement ne correspond aux filtres.
                    </p>
                    <button
                      type="button"
                      onClick={onClearFilters}
                      className="mt-3 text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      Reinitialiser les filtres
                    </button>
                  </td>
                </tr>
              ) : null}
              {filteredEvents.map((event) => {
                const isSelected = selectedEventId === event.id;
                const isTerminal = isTerminalStatus(event.status);
                return (
                  <tr
                    key={event.id}
                    onClick={() => onSelectEvent(event.id)}
                    className={`group cursor-pointer transition ${
                      isSelected
                        ? "bg-blue-50/70 shadow-[inset_4px_0_0_#2563eb]"
                        : "bg-white hover:bg-zinc-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent(event.id);
                        }}
                        className="rounded-md text-left outline-none transition focus-visible:ring-4 focus-visible:ring-blue-100"
                      >
                        <span className="block font-medium text-zinc-950 transition group-hover:text-blue-700">
                          {event.title}
                        </span>
                        {event.location ? (
                          <span className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin className="h-3 w-3" aria-hidden />
                            {event.location}
                          </span>
                        ) : null}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={eventTypeStyles[event.type]}>
                        {eventTypeLabels[event.type]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={eventStatusStyles[event.status]}>
                        {eventStatusLabels[event.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {formatDate(event.startsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/evenements/${encodeURIComponent(event.id)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                          Dashboard
                        </Link>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartEdit(event);
                              }}
                              disabled={isTerminal}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Edit3 className="h-3.5 w-3.5" aria-hidden />
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCancelEvent(event.id);
                              }}
                              disabled={isSaving || isTerminal}
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Ban className="h-3.5 w-3.5" aria-hidden />
                              Annuler
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

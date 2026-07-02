"use client";

import { Edit3, RotateCcw, Search, UserRoundX } from "lucide-react";
import { Badge, controlClass, StatCard } from "@/lib/ui";
import {
  memberFullName,
  memberPoleText,
  memberRoleValues,
  memberStatusValues,
  poleLabels,
  poleValues,
  roleLabels,
  roleStyles,
  statusLabels,
  statusStyles,
  type MemberRole,
  type MemberStatus,
  type Pole,
} from "./member-rules";
import type { MemberView } from "./member-dto";

export type MemberFiltersState = {
  search: string;
  pole: Pole | "ALL";
  role: MemberRole | "ALL";
  status: MemberStatus | "ALL";
  year: string;
};

type Stats = {
  total: number;
  active: number;
  office: number;
  leads: number;
};

type Props = {
  stats: Stats;
  years: string[];
  filteredMembers: MemberView[];
  selectedMemberId: string | null;
  isSaving: boolean;
  filters: MemberFiltersState;
  hasActiveFilters: boolean;
  canManage?: boolean;
  onSelectMember: (id: string) => void;
  onEdit?: (member: MemberView) => void;
  onDeactivate?: (id: string) => void;
  onClearFilters: () => void;
  onFilterChange: (partial: Partial<MemberFiltersState>) => void;
};

export function MemberTable({
  stats,
  years,
  filteredMembers,
  selectedMemberId,
  isSaving,
  filters,
  hasActiveFilters,
  canManage = false,
  onSelectMember,
  onEdit,
  onDeactivate,
  onClearFilters,
  onFilterChange,
}: Props) {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Actifs" value={stats.active} tone="emerald" />
        <StatCard label="Bureau" value={stats.office} tone="violet" />
        <StatCard label="Responsables" value={stats.leads} tone="amber" />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-zinc-950">Filtres</h2>
            <p className="text-sm text-zinc-500">
              Recherche instantanee par nom, email, telephone ou Discord.
            </p>
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

        <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
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
            value={filters.pole}
            onChange={(e) =>
              onFilterChange({ pole: e.target.value as Pole | "ALL" })
            }
            className={controlClass}
          >
            <option value="ALL">Tous poles</option>
            {poleValues.map((pole) => (
              <option key={pole} value={pole}>
                {poleLabels[pole]}
              </option>
            ))}
          </select>

          <select
            value={filters.role}
            onChange={(e) =>
              onFilterChange({ role: e.target.value as MemberRole | "ALL" })
            }
            className={controlClass}
          >
            <option value="ALL">Tous roles</option>
            {memberRoleValues.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as MemberStatus | "ALL" })
            }
            className={controlClass}
          >
            <option value="ALL">Tous statuts</option>
            {memberStatusValues.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) => onFilterChange({ year: e.target.value })}
            className={controlClass}
          >
            <option value="ALL">Toutes annees</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
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
            {filteredMembers.length} membres
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Pole</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Annee</th>
                {canManage ? <th className="px-4 py-3">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-4 py-10 text-center">
                    <p className="font-medium text-zinc-800">
                      Aucun membre ne correspond aux filtres.
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

              {filteredMembers.map((member) => {
                const isSelected = selectedMemberId === member.id;
                const isInactive = member.status === "INACTIVE";

                return (
                  <tr
                    key={member.id}
                    onClick={() => onSelectMember(member.id)}
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
                          onSelectMember(member.id);
                        }}
                        className="rounded-md text-left outline-none transition focus-visible:ring-4 focus-visible:ring-blue-100"
                      >
                        <span className="block font-medium text-zinc-950 transition group-hover:text-blue-700">
                          {memberFullName(member)}
                        </span>
                        <span className="block text-xs text-zinc-500">
                          {member.email}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {memberPoleText(member)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={roleStyles[member.role]}>
                        {roleLabels[member.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusStyles[member.status]}>
                        {statusLabels[member.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{member.year}</td>
                    {canManage ? (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(member);
                            }}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden />
                            Modifier
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeactivate?.(member.id);
                            }}
                            disabled={isSaving || isInactive}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-zinc-200 px-2 text-xs font-medium text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <UserRoundX className="h-3.5 w-3.5" aria-hidden />
                            Desactiver
                          </button>
                        </div>
                      </td>
                    ) : null}
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

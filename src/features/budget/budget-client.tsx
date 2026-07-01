"use client";

import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/lib/ui";
import { Modal } from "@/lib/modal";
import { readApiError } from "@/lib/api";
import { formatCents } from "@/lib/formats";
import { budgetEntryFormSchema, type BudgetEntryFormInput } from "./budget-schemas";
import type { BudgetEntryDto, BudgetForecast, BudgetSummary, EventBudgetRow } from "./budget-service";
import { BudgetEntryForm } from "./budget-entry-form";
import { BudgetTable, type BudgetTableFilters } from "./budget-table";
import { BudgetEventBreakdown } from "./budget-event-breakdown";
import { BudgetForecast as BudgetForecastView } from "./budget-forecast";

type Tab = "overview" | "forecast" | "entries";

type EventOption = { id: string; title: string };

type Props = {
  initialEntries: BudgetEntryDto[];
  initialSummary: BudgetSummary;
  initialBreakdown: EventBudgetRow[];
  initialForecast: BudgetForecast;
  eventOptions: EventOption[];
  canManage: boolean;
};

const emptyForm: BudgetEntryFormInput = {
  type: "EXPENSE",
  label: "",
  amountEuros: "",
  occurredAt: "",
  eventId: undefined,
  activityId: undefined,
};

export function BudgetClient({
  initialEntries,
  initialSummary,
  initialBreakdown,
  initialForecast,
  eventOptions,
  canManage,
}: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [summary, setSummary] = useState(initialSummary);
  const [breakdown, setBreakdown] = useState(initialBreakdown);
  const [tab, setTab] = useState<Tab>("overview");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BudgetEntryFormInput>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [tableFilters, setTableFilters] = useState<BudgetTableFilters>({
    type: "ALL",
    eventId: "ALL",
    search: "",
  });

  const hasActiveTableFilters =
    tableFilters.type !== "ALL" ||
    tableFilters.eventId !== "ALL" ||
    tableFilters.search !== "";

  function recomputeSummary(nextEntries: BudgetEntryDto[]): BudgetSummary {
    let revenueCents = 0;
    let expenseCents = 0;
    let forecastCents = 0;
    for (const e of nextEntries) {
      if (e.type === "REVENUE") revenueCents += e.amountCents;
      else if (e.type === "EXPENSE") expenseCents += e.amountCents;
      else if (e.type === "FORECAST") forecastCents += e.amountCents;
    }
    return {
      revenueCents,
      expenseCents,
      forecastCents,
      balanceCents: revenueCents - expenseCents,
      forecastBalanceCents: revenueCents - expenseCents - forecastCents,
    };
  }

  function recomputeBreakdown(nextEntries: BudgetEntryDto[]): EventBudgetRow[] {
    return breakdown.map((row) => {
      const eventEntries = nextEntries.filter((e) => e.eventId === row.eventId);
      let revenueCents = 0;
      let expenseCents = 0;
      let forecastCents = 0;
      for (const e of eventEntries) {
        if (e.type === "REVENUE") revenueCents += e.amountCents;
        else if (e.type === "EXPENSE") expenseCents += e.amountCents;
        else if (e.type === "FORECAST") forecastCents += e.amountCents;
      }
      return {
        ...row,
        revenueCents,
        expenseCents,
        forecastCents,
        balanceCents: revenueCents - expenseCents,
      };
    });
  }

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setErrors([]);
    setFeedback(null);
    setShowForm(true);
  }

  function startEdit(entry: BudgetEntryDto) {
    setEditingId(entry.id);
    setForm({
      type: entry.type,
      label: entry.label,
      amountEuros: (entry.amountCents / 100).toFixed(2),
      occurredAt: entry.occurredAt ? entry.occurredAt.slice(0, 10) : "",
      eventId: entry.eventId ?? undefined,
      activityId: entry.activityId ?? undefined,
    });
    setErrors([]);
    setFeedback(null);
    setTab("entries");
    setShowForm(true);
  }

  function updateForm<K extends keyof BudgetEntryFormInput>(
    field: K,
    value: BudgetEntryFormInput[K],
  ) {
    setFeedback(null);
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitEntry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = budgetEntryFormSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      setFeedback(null);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        editingId
          ? `/api/budget/entries/${encodeURIComponent(editingId)}`
          : "/api/budget/entries",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const data = (await response.json()) as { entry: BudgetEntryDto };
      const saved = data.entry;

      const nextEntries = editingId
        ? entries.map((en) => (en.id === editingId ? saved : en))
        : [saved, ...entries];

      setEntries(nextEntries);
      setSummary(recomputeSummary(nextEntries));
      setBreakdown(recomputeBreakdown(nextEntries));
      setErrors([]);
      setShowForm(false);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Enregistrement impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteEntry(entryId: string) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/budget/entries/${encodeURIComponent(entryId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(await readApiError(response));

      const nextEntries = entries.filter((e) => e.id !== entryId);
      setEntries(nextEntries);
      setSummary(recomputeSummary(nextEntries));
      setBreakdown(recomputeBreakdown(nextEntries));

      if (editingId === entryId) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }
      setErrors([]);
    } catch (err) {
      setErrors([err instanceof Error ? err.message : "Suppression impossible."]);
      setFeedback(null);
    } finally {
      setIsSaving(false);
    }
  }

  const balancePositive = summary.balanceCents >= 0;
  const forecastPositive = summary.forecastBalanceCents >= 0;

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              IIMPACT
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
              Budget
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Solde réel
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                balancePositive ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {balancePositive ? "+" : "−"}
              {formatCents(Math.abs(summary.balanceCents))}
            </p>
          </div>
          <StatCard
            label="Recettes"
            value={Math.round(summary.revenueCents / 100)}
            tone="emerald"
          />
          <StatCard
            label="Dépenses"
            value={Math.round(summary.expenseCents / 100)}
            tone="zinc"
          />
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Solde prévisionnel
            </p>
            <p
              className={`mt-1 text-2xl font-semibold tabular-nums ${
                forecastPositive ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {forecastPositive ? "+" : "−"}
              {formatCents(Math.abs(summary.forecastBalanceCents))}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">
              inclut {formatCents(summary.forecastCents)} de prévisions
            </p>
          </div>
        </div>

        <div className="mb-4 flex w-fit gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
          {(
            [
              { key: "overview", label: "Vue globale" },
              { key: "forecast", label: "Prévisionnel" },
              { key: "entries", label: "Entrées" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                tab === key
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "overview" ? (
          <BudgetEventBreakdown rows={breakdown} />
        ) : tab === "forecast" ? (
          <BudgetForecastView forecast={initialForecast} />
        ) : (
          <div className="space-y-4">
            {canManage ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={startCreate}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 active:translate-y-0"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Nouvelle entrée
                </button>
              </div>
            ) : null}
            <BudgetTable
              entries={entries}
              filters={tableFilters}
              hasActiveFilters={hasActiveTableFilters}
              isSaving={isSaving}
              canManage={canManage}
              eventOptions={eventOptions}
              onFilterChange={(partial) =>
                setTableFilters((prev) => ({ ...prev, ...partial }))
              }
              onClearFilters={() =>
                setTableFilters({ type: "ALL", eventId: "ALL", search: "" })
              }
              onEdit={startEdit}
              onDelete={deleteEntry}
            />
          </div>
        )}
      </div>

      {canManage ? (
        <Modal
          open={showForm}
          title={editingId ? "Modifier l'entrée" : "Nouvelle entrée"}
          onClose={() => setShowForm(false)}
        >
          <BudgetEntryForm
            editingId={editingId}
            form={form}
            errors={errors}
            feedback={feedback}
            isSaving={isSaving}
            eventOptions={eventOptions}
            onClose={() => setShowForm(false)}
            onSubmit={submitEntry}
            onUpdateForm={updateForm}
          />
        </Modal>
      ) : null}
    </main>
  );
}

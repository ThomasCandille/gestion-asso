"use client";

import { StatCard } from "@/lib/ui";
import { formatCents } from "@/lib/formats";
import type { BudgetSummary } from "./budget-service";

type Props = {
  summary: BudgetSummary;
};

export function BudgetSummaryCards({ summary }: Props) {
  const balancePositive = summary.balanceCents >= 0;
  const forecastPositive = summary.forecastBalanceCents >= 0;

  return (
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
  );
}

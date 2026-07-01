"use client";

import { Badge } from "@/lib/ui";
import { formatCents } from "@/lib/formats";
import { eventTypeLabels, eventTypeStyles } from "../events/event-rules";
import type { EventBudgetRow } from "./budget-service";

function ProgressBar({
  value,
  max,
  tone,
}: {
  value: number;
  max: number;
  tone: "emerald" | "red" | "amber";
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const colors = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-amber-400",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
      <div
        className={`h-full rounded-full transition-all ${colors[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

type Props = {
  rows: EventBudgetRow[];
};

export function BudgetEventBreakdown({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        Aucun événement avec un budget défini.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 px-4 py-3">
        <h2 className="font-semibold text-zinc-950">Répartition par événement</h2>
        <p className="text-xs text-zinc-500">
          Budget alloué vs dépenses réelles vs prévisions.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Événement</th>
              <th className="px-4 py-3">Alloué</th>
              <th className="px-4 py-3">Recettes</th>
              <th className="px-4 py-3">Dépenses</th>
              <th className="px-4 py-3">Prévisions</th>
              <th className="px-4 py-3">Solde</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map((row) => {
              const isDeficit = row.balanceCents < 0;
              const hasForecastDeficit =
                row.revenueCents - row.expenseCents - row.forecastCents < 0;

              return (
                <tr key={row.eventId} className="bg-white hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-zinc-900">
                        {row.eventTitle}
                      </span>
                      <Badge
                        className={
                          eventTypeStyles[row.eventType] ??
                          "bg-zinc-100 text-zinc-600 ring-zinc-200"
                        }
                      >
                        {eventTypeLabels[row.eventType] ?? row.eventType}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700">
                    {formatCents(row.allocatedCents)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className="block tabular-nums font-medium text-emerald-700">
                        +{formatCents(row.revenueCents)}
                      </span>
                      <ProgressBar
                        value={row.revenueCents}
                        max={row.allocatedCents}
                        tone="emerald"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className="block tabular-nums font-medium text-red-700">
                        −{formatCents(row.expenseCents)}
                      </span>
                      <ProgressBar
                        value={row.expenseCents}
                        max={row.allocatedCents}
                        tone="red"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-amber-700">
                    {row.forecastCents > 0
                      ? `−${formatCents(row.forecastCents)}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`tabular-nums font-semibold ${
                          isDeficit ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {isDeficit ? "−" : "+"}
                        {formatCents(Math.abs(row.balanceCents))}
                      </span>
                      {row.forecastCents > 0 ? (
                        <span
                          className={`text-xs ${hasForecastDeficit ? "text-red-500" : "text-zinc-400"}`}
                        >
                          avec prév. :{" "}
                          {hasForecastDeficit ? "−" : "+"}
                          {formatCents(
                            Math.abs(
                              row.revenueCents -
                                row.expenseCents -
                                row.forecastCents,
                            ),
                          )}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

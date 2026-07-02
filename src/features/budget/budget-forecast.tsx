"use client";

import { CalendarClock, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/lib/ui";
import { formatCents } from "@/lib/formats";
import {
  eventStatusLabels,
  eventStatusStyles,
  eventTypeLabels,
  eventTypeStyles,
} from "../events/event-rules";
import type { BudgetForecast, EventForecastRow } from "./budget-service";

function formatDate(iso: string | null) {
  if (!iso) return "Date inconnue";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BalanceChip({ cents }: { cents: number }) {
  const positive = cents >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
        positive
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-red-50 text-red-700 ring-1 ring-red-200"
      }`}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" aria-hidden />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden />
      )}
      {positive ? "+" : "−"}
      {formatCents(Math.abs(cents))}
    </span>
  );
}

function EventRow({ row, index }: { row: EventForecastRow; index: number }) {
  return (
    <li className="relative flex gap-4">
      {/* Ligne verticale de la timeline */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-zinc-200 text-xs font-semibold text-zinc-500">
          {index + 1}
        </div>
        <div className="mt-1 w-px flex-1 bg-zinc-200" />
      </div>

      <div className="mb-6 flex-1 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-semibold text-zinc-950">{row.eventTitle}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge
                className={
                  eventTypeStyles[row.eventType] ??
                  "bg-zinc-100 text-zinc-600 ring-zinc-200"
                }
              >
                {eventTypeLabels[row.eventType] ?? row.eventType}
              </Badge>
              <Badge
                className={
                  eventStatusStyles[row.eventStatus] ??
                  "bg-zinc-100 text-zinc-600 ring-zinc-200"
                }
              >
                {eventStatusLabels[row.eventStatus] ?? row.eventStatus}
              </Badge>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden />
              {formatDate(row.startsAt)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-zinc-500">Solde après</p>
            <BalanceChip cents={row.runningBalanceCents} />
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 text-sm sm:grid-cols-4">
          <div className="rounded bg-zinc-50 px-2.5 py-2">
            <dt className="text-xs text-zinc-500">Dépenses prévues</dt>
            <dd className="mt-0.5 font-medium tabular-nums text-red-700">
              −{formatCents(row.remainingCents)}
            </dd>
          </div>
          <div className="rounded bg-zinc-50 px-2.5 py-2">
            <dt className="text-xs text-zinc-500">Recettes prévues</dt>
            <dd className="mt-0.5 font-medium tabular-nums text-emerald-700">
              {row.totalRevenueCents > 0
                ? `+${formatCents(row.totalRevenueCents)}`
                : "—"}
            </dd>
          </div>
          <div className="rounded bg-zinc-50 px-2.5 py-2">
            <dt className="text-xs text-zinc-500">Déjà dépensé</dt>
            <dd className="mt-0.5 font-medium tabular-nums text-zinc-700">
              {row.expenseCents > 0
                ? `−${formatCents(row.expenseCents)}`
                : "—"}
            </dd>
          </div>
          <div
            className={`rounded px-2.5 py-2 ${
              row.netImpactCents >= 0 ? "bg-emerald-50" : "bg-red-50"
            }`}
          >
            <dt
              className={`text-xs ${
                row.netImpactCents >= 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              Impact net
            </dt>
            <dd
              className={`mt-0.5 font-semibold tabular-nums ${
                row.netImpactCents >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {row.netImpactCents >= 0
                ? `+${formatCents(Math.abs(row.netImpactCents))}`
                : `−${formatCents(Math.abs(row.netImpactCents))}`}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

type Props = {
  forecast: BudgetForecast;
};

export function BudgetForecast({ forecast }: Props) {
  const {
    currentBalanceCents,
    projectedBalanceCents,
    freeEntriesForecastCents,
    upcomingEvents,
  } = forecast;

  const totalEventImpact = upcomingEvents.reduce(
    (sum, r) => sum + r.netImpactCents,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Résumé haut de page */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Solde actuel
          </p>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${
              currentBalanceCents >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {currentBalanceCents >= 0 ? "+" : "−"}
            {formatCents(Math.abs(currentBalanceCents))}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Recettes − dépenses réelles</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Impact net événements
          </p>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${
              totalEventImpact - freeEntriesForecastCents >= 0
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {totalEventImpact - freeEntriesForecastCents >= 0 ? "+" : "−"}
            {formatCents(Math.abs(totalEventImpact - freeEntriesForecastCents))}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            {upcomingEvents.length} événement
            {upcomingEvents.length !== 1 ? "s" : ""} à venir
            {freeEntriesForecastCents > 0
              ? ` − ${formatCents(freeEntriesForecastCents)} hors événement`
              : ""}
          </p>
        </div>

        <div
          className={`rounded-lg border p-5 shadow-sm ${
            projectedBalanceCents >= 0
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${
              projectedBalanceCents >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            Solde projeté final
          </p>
          <p
            className={`mt-1 text-2xl font-semibold tabular-nums ${
              projectedBalanceCents >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {projectedBalanceCents >= 0 ? "+" : "−"}
            {formatCents(Math.abs(projectedBalanceCents))}
          </p>
          <p
            className={`mt-1 text-xs ${
              projectedBalanceCents >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            Après tous les événements à venir
          </p>
        </div>
      </div>

      {/* Timeline */}
      {upcomingEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-zinc-300" aria-hidden />
          <p className="mt-3 font-medium text-zinc-700">
            Aucun événement planifié ou en cours.
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Les événements avec le statut Planifié ou En cours apparaissent ici.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-950">
              Chronologie prévisionnelle
            </h2>
            <span className="text-sm text-zinc-500">
              Point de départ :{" "}
              <span
                className={`font-semibold ${
                  currentBalanceCents >= 0
                    ? "text-emerald-700"
                    : "text-red-700"
                }`}
              >
                {currentBalanceCents >= 0 ? "+" : "−"}
                {formatCents(Math.abs(currentBalanceCents))}
              </span>
            </span>
          </div>

          <ul className="space-y-0">
            {upcomingEvents.map((row, i) => (
              <EventRow key={row.eventId} row={row} index={i} />
            ))}

            {/* Nœud final */}
            <li className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 text-xs font-bold ${
                    projectedBalanceCents >= 0
                      ? "bg-emerald-600 ring-emerald-200 text-white"
                      : "bg-red-600 ring-red-200 text-white"
                  }`}
                >
                  ✓
                </div>
              </div>
              <div className="mb-2 flex-1 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-950">
                    Solde projeté final
                  </p>
                  <BalanceChip cents={projectedBalanceCents} />
                </div>
                {freeEntriesForecastCents > 0 ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    Inclut {formatCents(freeEntriesForecastCents)} de prévisions
                    hors événement
                  </p>
                ) : null}
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

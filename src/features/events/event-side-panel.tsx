"use client";

import { CalendarDays } from "lucide-react";
import { Badge, InfoItem } from "@/lib/ui";
import {
  eventStatusLabels,
  eventStatusStyles,
  eventTypeLabels,
  type EventType,
} from "./event-rules";
import type { EventView } from "./event-dto";
import { formatBudget, formatDate } from "./event-formatters";

type Props = {
  event: EventView | null;
};

export function EventSidePanel({ event }: Props) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
          <CalendarDays className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-zinc-950">
            {event ? event.title : "Aucun evenement"}
          </h2>
          <p className="text-sm text-zinc-500">
            {event
              ? eventTypeLabels[event.type as EventType]
              : "Selectionner un evenement"}
          </p>
        </div>
      </div>

      {event ? (
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2">
            <dt className="text-zinc-500">Statut</dt>
            <dd>
              <Badge className={eventStatusStyles[event.status]}>
                {eventStatusLabels[event.status]}
              </Badge>
            </dd>
          </div>
          <InfoItem label="Lieu" value={event.location ?? "—"} />
          <InfoItem label="Debut" value={formatDate(event.startsAt)} />
          <InfoItem label="Fin" value={formatDate(event.endsAt)} />
          <InfoItem label="Depenses prevues" value={formatBudget(event.totalExpenseCents)} />
          <InfoItem label="Recettes prevues" value={formatBudget(event.totalRevenueCents)} />
          {event.description ? (
            <div className="rounded-lg bg-zinc-50 p-3">
              <dt className="text-zinc-500">Description</dt>
              <dd className="mt-1 text-zinc-900">{event.description}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </section>
  );
}

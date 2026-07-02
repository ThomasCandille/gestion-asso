import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/lib/ui";
import {
  eventStatusLabels,
  eventStatusStyles,
  eventTypeLabels,
  eventTypeStyles,
} from "./event-rules";
import type { EventView } from "./event-dto";
import { formatDate } from "./event-formatters";

type Props = { event: EventView };

export function EventDashboardHeader({ event }: Props) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
              IIMPACT — Evenement
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">
              {event.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={eventTypeStyles[event.type]}>
                {eventTypeLabels[event.type]}
              </Badge>
              <Badge className={eventStatusStyles[event.status]}>
                {eventStatusLabels[event.status]}
              </Badge>
              {event.location ? (
                <span className="flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {event.location}
                </span>
              ) : null}
              {event.startsAt ? (
                <span className="text-sm text-zinc-500">
                  {formatDate(event.startsAt)}
                  {event.endsAt ? ` → ${formatDate(event.endsAt)}` : ""}
                </span>
              ) : null}
            </div>
          </div>
          <Link
            href="/evenements"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:translate-y-0"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Evenements
          </Link>
        </div>
      </div>
    </header>
  );
}

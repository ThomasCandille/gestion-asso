import { InfoItem } from "@/lib/ui";
import type { EventView } from "./event-dto";
import { formatBudget, formatDate } from "./event-formatters";

type Props = { event: EventView };

export function EventInfoPanel({ event }: Props) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-zinc-950">Infos evenement</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <InfoItem label="Lieu" value={event.location ?? "—"} />
        <InfoItem label="Debut" value={formatDate(event.startsAt)} />
        <InfoItem label="Fin" value={formatDate(event.endsAt)} />
        <InfoItem
          label="Depenses prevues"
          value={formatBudget(event.totalExpenseCents)}
        />
        <InfoItem
          label="Recettes prevues"
          value={formatBudget(event.totalRevenueCents)}
        />
        {event.description ? (
          <div className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-zinc-500">Description</dt>
            <dd className="mt-1 text-zinc-900">{event.description}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

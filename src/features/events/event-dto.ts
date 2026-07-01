import type { EventType, EventStatus } from "./event-rules";

export type EventView = {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  location?: string;
  startsAt?: string;
  endsAt?: string;
  budgetCents: number;
  createdAt: string;
  updatedAt: string;
};

export type EventViewPayload = Omit<
  EventView,
  "description" | "location" | "startsAt" | "endsAt"
> & {
  description?: string | null;
  location?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export function normalizeEventView(event: EventViewPayload): EventView {
  return {
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    type: event.type,
    status: event.status,
    location: event.location ?? undefined,
    startsAt: event.startsAt ? event.startsAt.slice(0, 10) : undefined,
    endsAt: event.endsAt ? event.endsAt.slice(0, 10) : undefined,
    budgetCents: event.budgetCents,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export const eventTypeValues = ["INTERNAL", "EXTERNAL"] as const;
export const eventStatusValues = [
  "DRAFT",
  "PLANNED",
  "IN_PROGRESS",
  "DONE",
  "CANCELED",
] as const;

export type EventType = (typeof eventTypeValues)[number];
export type EventStatus = (typeof eventStatusValues)[number];

export const eventTypeLabels: Record<EventType, string> = {
  INTERNAL: "Interne",
  EXTERNAL: "Externe",
};

export const eventTypeStyles: Record<EventType, string> = {
  INTERNAL: "bg-violet-50 text-violet-700 ring-violet-200",
  EXTERNAL: "bg-cyan-50 text-cyan-700 ring-cyan-200",
};

export const eventStatusLabels: Record<EventStatus, string> = {
  DRAFT: "Brouillon",
  PLANNED: "Planifie",
  IN_PROGRESS: "En cours",
  DONE: "Termine",
  CANCELED: "Annule",
};

export const eventStatusStyles: Record<EventStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  PLANNED: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  DONE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELED: "bg-red-50 text-red-700 ring-red-200",
};

export function isTerminalStatus(status: EventStatus) {
  return status === "DONE" || status === "CANCELED";
}

export function hasEventTypeAccess(
  actor: { poles: string[] },
  eventType: EventType,
): boolean {
  return (
    (eventType === "INTERNAL" && actor.poles.includes("INTERNE")) ||
    (eventType === "EXTERNAL" && actor.poles.includes("EXTERNE"))
  );
}

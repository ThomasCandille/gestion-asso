import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import type { AppSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import type { EventType, EventStatus } from "./event-rules";
import { isTerminalStatus, hasEventTypeAccess } from "./event-rules";
import { toOptionalDate } from "@/lib/formats";
import {
  eventFiltersSchema,
  eventFormSchema,
  type EventFilters,
} from "./event-schemas";
import { createEventSheet } from "@/server/integrations/events-sheet";

const eventSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  status: true,
  location: true,
  startsAt: true,
  endsAt: true,
  sheetId: true,
  activities: { select: { budgetCents: true, expectedRevenueCents: true } },
  sheetUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EventSelect;

type EventRow = Prisma.EventGetPayload<{ select: typeof eventSelect }>;

export type EventDto = {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  status: EventStatus;
  location: string | null;
  startsAt: string | null;
  endsAt: string | null;
  totalExpenseCents: number;
  totalRevenueCents: number;
  sheetId: string | null;
  sheetUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export class EventPermissionError extends Error {
  constructor(message = "Action evenement non autorisee.") {
    super(message);
    this.name = "EventPermissionError";
  }
}

export class EventRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventRuleError";
  }
}

function toEventDto(event: EventRow): EventDto {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    type: event.type as EventType,
    status: event.status as EventStatus,
    location: event.location,
    startsAt: event.startsAt?.toISOString() ?? null,
    endsAt: event.endsAt?.toISOString() ?? null,
    totalExpenseCents: event.activities.reduce((sum, a) => sum + a.budgetCents, 0),
    totalRevenueCents: event.activities.reduce((sum, a) => sum + a.expectedRevenueCents, 0),
    sheetId: event.sheetId,
    sheetUrl: event.sheetUrl,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}

function assertCanManageEventType(actor: AppSession, eventType: EventType) {
  if (!hasPermission(actor.role, "events:manage")) throw new EventPermissionError();
  if (actor.role === "POLE_LEAD" && !hasEventTypeAccess(actor, eventType)) {
    throw new EventPermissionError("Vous n'avez pas acces a ce type d'evenement.");
  }
}

function buildEventWhere(filters: EventFilters): Prisma.EventWhereInput {
  return {
    type: filters.type,
    status: filters.status,
    OR: filters.search
      ? [
          { title: { contains: filters.search, mode: "insensitive" } },
          { location: { contains: filters.search, mode: "insensitive" } },
        ]
      : undefined,
  };
}



export async function listEvents(filters: EventFilters = {}) {
  const parsed = eventFiltersSchema.parse(filters);
  const events = await prisma.event.findMany({
    where: buildEventWhere(parsed),
    select: eventSelect,
    orderBy: [
      { startsAt: { sort: "asc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  });
  return events.map(toEventDto);
}

export async function getEventById(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: eventSelect,
  });
  return event ? toEventDto(event) : null;
}

export async function createEvent(actor: AppSession, input: unknown) {
  const parsed = eventFormSchema.parse(input);
  assertCanManageEventType(actor, parsed.type);

  const event = await prisma.event.create({
    data: {
      title: parsed.title,
      description: parsed.description || null,
      type: parsed.type,
      status: parsed.status,
      location: parsed.location || null,
      startsAt: toOptionalDate(parsed.startsAt),
      endsAt: toOptionalDate(parsed.endsAt),
    },
    select: eventSelect,
  });

  const dto = toEventDto(event);

  try {
    const sheet = await createEventSheet(dto);
    if (sheet) {
      await prisma.event.update({
        where: { id: event.id },
        data: { sheetId: sheet.sheetId, sheetUrl: sheet.sheetUrl },
      });
      dto.sheetId = sheet.sheetId;
      dto.sheetUrl = sheet.sheetUrl;
    }
  } catch {
    // L'échec de la création du Sheet ne bloque pas la création de l'événement
  }

  return dto;
}

export async function updateEvent(
  actor: AppSession,
  eventId: string,
  input: unknown,
) {
  const existing = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: eventSelect,
  });

  assertCanManageEventType(actor, existing.type as EventType);

  if (isTerminalStatus(existing.status as EventStatus)) {
    throw new EventRuleError(
      "Un evenement termine ou annule ne peut pas etre modifie.",
    );
  }

  const parsed = eventFormSchema.parse(input);

  if (parsed.type !== existing.type) {
    assertCanManageEventType(actor, parsed.type);
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      title: parsed.title,
      description: parsed.description || null,
      type: parsed.type,
      status: parsed.status,
      location: parsed.location || null,
      startsAt: toOptionalDate(parsed.startsAt),
      endsAt: toOptionalDate(parsed.endsAt),
    },
    select: eventSelect,
  });

  return toEventDto(event);
}

export async function cancelEvent(actor: AppSession, eventId: string) {
  const existing = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: eventSelect,
  });

  assertCanManageEventType(actor, existing.type as EventType);

  if (isTerminalStatus(existing.status as EventStatus)) {
    throw new EventRuleError("L'evenement est deja dans un etat final.");
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data: { status: "CANCELED" },
    select: eventSelect,
  });

  return toEventDto(event);
}

/**
 * SSOT — types et statuts d'événements IIMPACT.
 *
 * Miroir des valeurs Prisma / event-rules.ts du projet principal.
 * Toute référence aux types ou statuts d'événement dans ce skill doit
 * importer d'ici, jamais hardcoder de string.
 */

export const EVENT_TYPES = {
  INTERNAL: { label: 'Interne', pole: 'INTERNE' },
  EXTERNAL: { label: 'Externe', pole: 'EXTERNE' },
} as const;

export type EventType = keyof typeof EVENT_TYPES;

export const EVENT_TYPE_VALUES = Object.keys(EVENT_TYPES) as EventType[];

export const EVENT_STATUSES = {
  DRAFT: 'Brouillon',
  PLANNED: 'Planifié',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminé',
  CANCELED: 'Annulé',
} as const;

export type EventStatus = keyof typeof EVENT_STATUSES;

export const EVENT_STATUS_VALUES = Object.keys(EVENT_STATUSES) as EventStatus[];

export const DEFAULT_EVENT_STATUS: EventStatus = 'DRAFT';

export function isEventType(x: string): x is EventType {
  return x in EVENT_TYPES;
}

export function isEventStatus(x: string): x is EventStatus {
  return x in EVENT_STATUSES;
}

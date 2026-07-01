import type { EventType, EventStatus } from '../config/event-types.js';
import type { PostType, ContentStatus } from '../config/communication-templates.js';

/** Payload de création d'un événement (POST /api/events). */
export type EventInput = {
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  location?: string;
  startsAt?: string; // ISO datetime — ex: "2026-09-15T18:00:00"
  endsAt?: string;
  budgetEuros?: string; // string décimale — ex: "500" ou "1500.50"
};

/** Payload de création d'une activité (POST /api/events/{id}/activities). */
export type ActivityInput = {
  title: string;
  description?: string;
  rules?: string;
  prizes?: string;
  budgetEuros?: string;
};

/** Payload de création d'une publication (POST /api/campaigns/{id}/posts). */
export type PostInput = {
  title: string;
  postType: PostType;
  status: ContentStatus;
  content?: string;
  mediaDescription?: string;
  scheduledAt?: string; // ISO datetime
};

/** Payload de création d'une campagne (POST /api/communication/campaigns). */
export type CampaignInput = {
  title: string;
  description?: string;
  status: ContentStatus;
  posts: PostInput[];
};

/** Plan complet soumis à validate-event avant toute création API. */
export type EventCreationPlan = {
  event: EventInput;
  activities: ActivityInput[];
  campaign: CampaignInput;
};

/** Champ manquant ou invalide dans le plan. */
export type MissingField = {
  object: 'event' | 'activity' | 'campaign' | 'post';
  index?: number; // pour les activités et publications
  field: string;
  label: string;
};

/** Résultat de la validation du plan. */
export type ValidationResult = {
  valid: boolean;
  missingFields: MissingField[];
  warnings: string[];
};

/** Résultat de la création complète — loggué en session. */
export type CreationResult = {
  eventId: string;
  activityIds: string[];
  campaignId: string;
  postIds: string[];
};

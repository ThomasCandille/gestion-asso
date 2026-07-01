/**
 * SSOT — types, statuts et règles du plan de communication IIMPACT.
 *
 * Miroir des valeurs Prisma / communication-schemas.ts du projet principal.
 */

export const POST_TYPES = {
  POST: 'Post',
  REEL: 'Reel',
  STORY: 'Story',
  CAROUSEL: 'Carousel',
} as const;

export type PostType = keyof typeof POST_TYPES;

export const CONTENT_STATUSES = {
  IDEA: 'Idée',
  DRAFT: 'Brouillon',
  IN_REVIEW: 'En révision',
  SCHEDULED: 'Planifié',
  PUBLISHED: 'Publié',
  CANCELLED: 'Annulé',
} as const;

export type ContentStatus = keyof typeof CONTENT_STATUSES;

export const DEFAULT_CAMPAIGN_STATUS: ContentStatus = 'DRAFT';
export const DEFAULT_POST_STATUS: ContentStatus = 'IDEA';

/**
 * Règle métier IIMPACT : un plan de communication minimal contient
 * au moins ces 3 types de publications.
 */
export const MIN_REQUIRED_POSTS = 3;

export type DefaultPostTemplate = {
  labelSuffix: string;
  postType: PostType;
  daysFromStart: number | null;
  daysFromEnd: number | null;
};

/**
 * Templates par défaut pour les 3 publications minimales.
 *
 * daysFromStart < 0 → avant le début de l'événement
 * daysFromEnd > 0  → après la fin de l'événement
 */
export const DEFAULT_POST_TEMPLATES: DefaultPostTemplate[] = [
  {
    labelSuffix: 'Teaser',
    postType: 'POST',
    daysFromStart: -7,
    daysFromEnd: null,
  },
  {
    labelSuffix: 'Trailer',
    postType: 'REEL',
    daysFromStart: -1,
    daysFromEnd: null,
  },
  {
    labelSuffix: 'Récap',
    postType: 'POST',
    daysFromStart: null,
    daysFromEnd: 2,
  },
];

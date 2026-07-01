import { describe, it, expect, beforeAll } from 'vitest';
import { buildDefaultCommunicationPlan, shiftIsoDate } from './build-communication-plan.js';
import type { EventInput } from './types.js';

beforeAll(() => {
  process.env.EVENT_SKILL_DISABLE_LOG = '1';
});

function makeEvent(overrides: Partial<EventInput> = {}): EventInput {
  return {
    title: 'Gala de printemps',
    type: 'EXTERNAL',
    status: 'DRAFT',
    ...overrides,
  };
}

describe('shiftIsoDate', () => {
  it('ajoute des jours positifs', () => {
    expect(shiftIsoDate('2026-09-15', 2)).toBe('2026-09-17');
  });

  it('soustrait des jours négatifs', () => {
    expect(shiftIsoDate('2026-09-15', -7)).toBe('2026-09-08');
  });

  it('gère les changements de mois', () => {
    expect(shiftIsoDate('2026-09-01', -2)).toBe('2026-08-30');
  });

  it('gère les changements d\'année', () => {
    expect(shiftIsoDate('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('fonctionne avec un datetime ISO complet', () => {
    expect(shiftIsoDate('2026-09-15T18:00:00', -7)).toBe('2026-09-08');
  });

  it('throw sur une date invalide', () => {
    expect(() => shiftIsoDate('pas-une-date', 1)).toThrow(/invalide/i);
  });
});

describe('buildDefaultCommunicationPlan', () => {
  it('génère un plan avec 3 publications', () => {
    const plan = buildDefaultCommunicationPlan(makeEvent());
    expect(plan.posts).toHaveLength(3);
  });

  it('inclut le titre de l\'événement dans le titre de la campagne', () => {
    const plan = buildDefaultCommunicationPlan(makeEvent({ title: 'Soirée jazz' }));
    expect(plan.title).toContain('Soirée jazz');
  });

  it('inclut le titre dans chaque publication', () => {
    const plan = buildDefaultCommunicationPlan(makeEvent({ title: 'Soirée jazz' }));
    for (const post of plan.posts) {
      expect(post.title).toContain('Soirée jazz');
    }
  });

  it('retourne Teaser, Trailer et Récap dans cet ordre', () => {
    const plan = buildDefaultCommunicationPlan(makeEvent());
    expect(plan.posts[0].title).toContain('Teaser');
    expect(plan.posts[1].title).toContain('Trailer');
    expect(plan.posts[2].title).toContain('Récap');
  });

  it('assigne les types de publication corrects (POST, REEL, POST)', () => {
    const plan = buildDefaultCommunicationPlan(makeEvent());
    expect(plan.posts[0].postType).toBe('POST');
    expect(plan.posts[1].postType).toBe('REEL');
    expect(plan.posts[2].postType).toBe('POST');
  });

  it('calcule les dates si startsAt et endsAt sont fournis', () => {
    const plan = buildDefaultCommunicationPlan(
      makeEvent({ startsAt: '2026-09-15T18:00:00', endsAt: '2026-09-15T23:00:00' }),
    );
    expect(plan.posts[0].scheduledAt).toBe('2026-09-08'); // -7 jours
    expect(plan.posts[1].scheduledAt).toBe('2026-09-14'); // -1 jour
    expect(plan.posts[2].scheduledAt).toBe('2026-09-17'); // +2 jours après fin
  });

  it('omet scheduledAt si aucune date fournie', () => {
    const plan = buildDefaultCommunicationPlan(makeEvent());
    for (const post of plan.posts) {
      expect(post.scheduledAt).toBeUndefined();
    }
  });

  it('omet scheduledAt du récap si endsAt absent mais startsAt présent', () => {
    const plan = buildDefaultCommunicationPlan(makeEvent({ startsAt: '2026-09-15' }));
    expect(plan.posts[0].scheduledAt).toBe('2026-09-08');
    expect(plan.posts[1].scheduledAt).toBe('2026-09-14');
    expect(plan.posts[2].scheduledAt).toBeUndefined();
  });

  it('est déterministe — même input → même output', () => {
    const event = makeEvent({ startsAt: '2026-09-15', endsAt: '2026-09-16' });
    const a = buildDefaultCommunicationPlan(event);
    const b = buildDefaultCommunicationPlan(event);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

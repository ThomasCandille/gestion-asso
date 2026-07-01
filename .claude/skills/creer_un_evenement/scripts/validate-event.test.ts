import { describe, it, expect, beforeAll } from 'vitest';
import { validateEventPlan } from './validate-event.js';
import type { EventCreationPlan } from './types.js';

beforeAll(() => {
  process.env.EVENT_SKILL_DISABLE_LOG = '1';
});

function makePlan(overrides: Partial<EventCreationPlan> = {}): EventCreationPlan {
  return {
    event: {
      title: 'Gala de printemps',
      type: 'EXTERNAL',
      status: 'DRAFT',
    },
    activities: [
      { title: 'Atelier photo' },
    ],
    campaign: {
      title: 'Communication Gala',
      status: 'DRAFT',
      posts: [
        { title: 'Teaser — Gala', postType: 'POST', status: 'IDEA' },
        { title: 'Trailer — Gala', postType: 'REEL', status: 'IDEA' },
        { title: 'Récap — Gala', postType: 'POST', status: 'IDEA' },
      ],
    },
    ...overrides,
  };
}

describe('validateEventPlan', () => {
  it('valide un plan complet', () => {
    const result = validateEventPlan(makePlan());
    expect(result.valid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('rejette un titre manquant', () => {
    const result = validateEventPlan(makePlan({ event: { title: '', type: 'INTERNAL', status: 'DRAFT' } }));
    expect(result.valid).toBe(false);
    expect(result.missingFields.some((f) => f.field === 'title')).toBe(true);
  });

  it('rejette un titre trop court (1 caractère)', () => {
    const result = validateEventPlan(makePlan({ event: { title: 'A', type: 'INTERNAL', status: 'DRAFT' } }));
    expect(result.valid).toBe(false);
  });

  it('rejette un type manquant', () => {
    const result = validateEventPlan(
      makePlan({ event: { title: 'Test', type: '' as 'INTERNAL', status: 'DRAFT' } }),
    );
    expect(result.valid).toBe(false);
    expect(result.missingFields.some((f) => f.field === 'type')).toBe(true);
  });

  it('rejette un type invalide', () => {
    const result = validateEventPlan(
      makePlan({ event: { title: 'Test', type: 'AUTRE' as 'INTERNAL', status: 'DRAFT' } }),
    );
    expect(result.valid).toBe(false);
  });

  it('rejette un statut invalide', () => {
    const result = validateEventPlan(
      makePlan({ event: { title: 'Test', type: 'INTERNAL', status: 'INCONNU' as 'DRAFT' } }),
    );
    expect(result.valid).toBe(false);
  });

  it('rejette des dates incohérentes (fin avant début)', () => {
    const result = validateEventPlan(
      makePlan({
        event: {
          title: 'Test',
          type: 'INTERNAL',
          status: 'DRAFT',
          startsAt: '2026-09-15T18:00:00',
          endsAt: '2026-09-14T18:00:00',
        },
      }),
    );
    expect(result.valid).toBe(false);
    expect(result.missingFields.some((f) => f.field === 'endsAt')).toBe(true);
  });

  it('rejette un budget au mauvais format', () => {
    const result = validateEventPlan(
      makePlan({ event: { title: 'Test', type: 'INTERNAL', status: 'DRAFT', budgetEuros: 'abc' } }),
    );
    expect(result.valid).toBe(false);
  });

  it('accepte un budget en centimes décimaux', () => {
    const result = validateEventPlan(
      makePlan({ event: { title: 'Test', type: 'INTERNAL', status: 'DRAFT', budgetEuros: '1500.50' } }),
    );
    expect(result.valid).toBe(true);
  });

  it('émet un warning si aucune activité', () => {
    const result = validateEventPlan(makePlan({ activities: [] }));
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => /activité/i.test(w))).toBe(true);
  });

  it('rejette une activité sans titre', () => {
    const result = validateEventPlan(
      makePlan({ activities: [{ title: '' }] }),
    );
    expect(result.valid).toBe(false);
    expect(result.missingFields.some((f) => f.object === 'activity')).toBe(true);
  });

  it('émet un warning si < 3 publications', () => {
    const plan = makePlan();
    plan.campaign.posts = [{ title: 'Post unique', postType: 'POST', status: 'IDEA' }];
    const result = validateEventPlan(plan);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => /minimum recommandé/i.test(w))).toBe(true);
  });

  it('rejette une publication sans titre', () => {
    const plan = makePlan();
    plan.campaign.posts = [
      { title: '', postType: 'POST', status: 'IDEA' },
      { title: 'Trailer', postType: 'REEL', status: 'IDEA' },
      { title: 'Récap', postType: 'POST', status: 'IDEA' },
    ];
    const result = validateEventPlan(plan);
    expect(result.valid).toBe(false);
    expect(result.missingFields.some((f) => f.object === 'post')).toBe(true);
  });

  it('rejette une publication sans postType', () => {
    const plan = makePlan();
    plan.campaign.posts[0] = { title: 'Teaser', postType: '' as 'POST', status: 'IDEA' };
    const result = validateEventPlan(plan);
    expect(result.valid).toBe(false);
  });

  it('throw si le plan est null', () => {
    expect(() => validateEventPlan(null as unknown as EventCreationPlan)).toThrow();
  });
});

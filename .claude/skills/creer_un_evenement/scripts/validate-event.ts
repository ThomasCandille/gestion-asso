import { isEventType, isEventStatus } from '../config/event-types.js';
import { MIN_REQUIRED_POSTS } from '../config/communication-templates.js';
import type { EventCreationPlan, MissingField, ValidationResult } from './types.js';
import { logSessionEntry } from './log.js';

/**
 * Valide un EventCreationPlan avant tout appel API.
 *
 * Fonction pure : pas d'accès BDD, pas d'appel HTTP, pas de Date.now().
 * Retourne les champs manquants (bloquants) et les avertissements (informationnels).
 *
 * @throws si le plan lui-même est null/undefined
 */
export function validateEventPlan(plan: EventCreationPlan): ValidationResult {
  if (!plan || typeof plan !== 'object') {
    throw new Error('Le plan de création doit être un objet JSON valide.');
  }

  const missingFields: MissingField[] = [];
  const warnings: string[] = [];

  // ---- Événement ----
  if (!plan.event || typeof plan.event !== 'object') {
    missingFields.push({ object: 'event', field: 'event', label: 'Objet événement manquant' });
  } else {
    if (!plan.event.title || plan.event.title.trim().length < 2) {
      missingFields.push({
        object: 'event',
        field: 'title',
        label: 'Titre de l\'événement (min 2 caractères)',
      });
    }
    if (!plan.event.type) {
      missingFields.push({
        object: 'event',
        field: 'type',
        label: 'Type d\'événement (INTERNAL ou EXTERNAL)',
      });
    } else if (!isEventType(plan.event.type)) {
      missingFields.push({
        object: 'event',
        field: 'type',
        label: `Type invalide "${plan.event.type}" — valeurs acceptées : INTERNAL, EXTERNAL`,
      });
    }
    if (plan.event.status && !isEventStatus(plan.event.status)) {
      missingFields.push({
        object: 'event',
        field: 'status',
        label: `Statut invalide "${plan.event.status}" — valeurs acceptées : DRAFT, PLANNED, IN_PROGRESS, DONE, CANCELED`,
      });
    }
    if (
      plan.event.startsAt &&
      plan.event.endsAt &&
      plan.event.startsAt > plan.event.endsAt
    ) {
      missingFields.push({
        object: 'event',
        field: 'endsAt',
        label: 'La date de fin doit être après la date de début',
      });
    }
    if (plan.event.budgetEuros !== undefined && !/^\d+([.,]\d{1,2})?$/.test(plan.event.budgetEuros)) {
      missingFields.push({
        object: 'event',
        field: 'budgetEuros',
        label: `Format budget invalide "${plan.event.budgetEuros}" — exemple : "500" ou "1500.50"`,
      });
    }
  }

  // ---- Activités ----
  if (!Array.isArray(plan.activities)) {
    missingFields.push({ object: 'activity', field: 'activities', label: 'activities doit être un tableau' });
  } else {
    if (plan.activities.length === 0) {
      warnings.push("Aucune activité définie. L'événement sera créé sans activité.");
    }
    for (const [i, activity] of plan.activities.entries()) {
      if (!activity.title || activity.title.trim().length < 2) {
        missingFields.push({
          object: 'activity',
          index: i,
          field: 'title',
          label: `Activité ${i + 1} — titre obligatoire (min 2 caractères)`,
        });
      }
      if (activity.budgetEuros !== undefined && !/^\d+([.,]\d{1,2})?$/.test(activity.budgetEuros)) {
        missingFields.push({
          object: 'activity',
          index: i,
          field: 'budgetEuros',
          label: `Activité ${i + 1} — format budget invalide "${activity.budgetEuros}"`,
        });
      }
    }
  }

  // ---- Campagne ----
  if (!plan.campaign || typeof plan.campaign !== 'object') {
    missingFields.push({ object: 'campaign', field: 'campaign', label: 'Objet campagne manquant' });
  } else {
    if (!plan.campaign.title || plan.campaign.title.trim().length < 1) {
      missingFields.push({
        object: 'campaign',
        field: 'title',
        label: 'Titre de la campagne de communication',
      });
    }

    if (!Array.isArray(plan.campaign.posts)) {
      missingFields.push({ object: 'campaign', field: 'posts', label: 'posts doit être un tableau' });
    } else {
      if (plan.campaign.posts.length < MIN_REQUIRED_POSTS) {
        warnings.push(
          `Plan de communication : ${plan.campaign.posts.length} publication(s) définie(s), minimum recommandé : ${MIN_REQUIRED_POSTS} (teaser, trailer, récap).`,
        );
      }
      for (const [i, post] of plan.campaign.posts.entries()) {
        if (!post.title || post.title.trim().length < 1) {
          missingFields.push({
            object: 'post',
            index: i,
            field: 'title',
            label: `Publication ${i + 1} — titre obligatoire`,
          });
        }
        if (!post.postType) {
          missingFields.push({
            object: 'post',
            index: i,
            field: 'postType',
            label: `Publication ${i + 1} — postType obligatoire (POST, REEL, STORY, CAROUSEL)`,
          });
        }
        if (!post.status) {
          missingFields.push({
            object: 'post',
            index: i,
            field: 'status',
            label: `Publication ${i + 1} — status obligatoire`,
          });
        }
      }
    }
  }

  const result: ValidationResult = {
    valid: missingFields.length === 0,
    missingFields,
    warnings,
  };

  logSessionEntry('validate-event', {
    input: {
      eventTitle: plan.event?.title ?? null,
      activities: plan.activities?.length ?? 0,
      posts: plan.campaign?.posts?.length ?? 0,
    },
    output: {
      valid: result.valid,
      missingFields: result.missingFields.length,
      warnings: result.warnings.length,
    },
  });

  return result;
}

/* --------------------------------------------------------------------------
 * CLI — usage :
 *   echo '<plan JSON>' | npx tsx .claude/skills/creer_un_evenement/scripts/validate-event.ts
 * ou :
 *   npx tsx .claude/skills/creer_un_evenement/scripts/validate-event.ts < plan.json
 * -------------------------------------------------------------------------- */

function isMain() {
  return import.meta.url === `file://${process.argv[1]}`;
}

if (isMain()) {
  const chunks: Buffer[] = [];
  process.stdin.on('data', (chunk) => chunks.push(chunk));
  process.stdin.on('end', () => {
    try {
      const plan = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as EventCreationPlan;
      const result = validateEventPlan(plan);
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.valid ? 0 : 1);
    } catch (e) {
      console.error(String(e));
      process.exit(1);
    }
  });
}

import { DEFAULT_CAMPAIGN_STATUS, DEFAULT_POST_STATUS, DEFAULT_POST_TEMPLATES } from '../config/communication-templates.js';
import type { EventInput, CampaignInput } from './types.js';
import { logSessionEntry } from './log.js';

/**
 * Génère un plan de communication par défaut à partir des données d'un événement.
 *
 * Fonction pure : pas d'accès BDD, pas d'appel HTTP.
 * Les dates de publication sont calculées à partir des dates de l'événement si disponibles.
 * Si les dates sont absentes, `scheduledAt` est omis (à compléter par l'utilisateur).
 *
 * @param event données de l'événement (au minimum title et type)
 * @param referenceDate date de référence pour les calculs (injectable pour les tests), format ISO YYYY-MM-DD ou datetime
 */
export function buildDefaultCommunicationPlan(
  event: EventInput,
  _referenceDate?: string,
): CampaignInput {
  const campaignTitle = `Communication — ${event.title}`;

  const posts = DEFAULT_POST_TEMPLATES.map((template) => {
    let scheduledAt: string | undefined;

    if (template.daysFromStart !== null && event.startsAt) {
      scheduledAt = shiftIsoDate(event.startsAt, template.daysFromStart);
    } else if (template.daysFromEnd !== null && event.endsAt) {
      scheduledAt = shiftIsoDate(event.endsAt, template.daysFromEnd);
    }

    return {
      title: `${template.labelSuffix} — ${event.title}`,
      postType: template.postType,
      status: DEFAULT_POST_STATUS,
      ...(scheduledAt ? { scheduledAt } : {}),
    };
  });

  const plan: CampaignInput = {
    title: campaignTitle,
    description: `Plan de communication pour l'événement "${event.title}".`,
    status: DEFAULT_CAMPAIGN_STATUS,
    posts,
  };

  logSessionEntry('build-communication-plan', {
    input: { eventTitle: event.title, eventType: event.type, hasStartsAt: !!event.startsAt, hasEndsAt: !!event.endsAt },
    output: { campaignTitle: plan.title, postsCount: plan.posts.length },
  });

  return plan;
}

/**
 * Décale une date ISO (date ou datetime) d'un nombre de jours.
 * Retourne une date ISO au format YYYY-MM-DD (pas de composante horaire).
 *
 * @param isoDate date de base au format ISO
 * @param days nombre de jours à ajouter (négatif = avant)
 */
export function shiftIsoDate(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Date invalide : "${isoDate}"`);
  }
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/* --------------------------------------------------------------------------
 * CLI — usage :
 *   echo '<eventInput JSON>' | npx tsx .claude/skills/creer_un_evenement/scripts/build-communication-plan.ts
 * ou :
 *   npx tsx .claude/skills/creer_un_evenement/scripts/build-communication-plan.ts < event.json
 * -------------------------------------------------------------------------- */

function isMain() {
  return import.meta.url === `file://${process.argv[1]}`;
}

if (isMain()) {
  const chunks: Buffer[] = [];
  process.stdin.on('data', (chunk) => chunks.push(chunk));
  process.stdin.on('end', () => {
    try {
      const event = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as EventInput;
      const plan = buildDefaultCommunicationPlan(event);
      console.log(JSON.stringify(plan, null, 2));
    } catch (e) {
      console.error(String(e));
      process.exit(1);
    }
  });
}

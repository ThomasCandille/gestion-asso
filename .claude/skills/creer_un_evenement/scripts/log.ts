import { mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Helper d'auditabilité — chaque exécution d'un script du skill creer-un-evenement
 * loggue une ligne JSON dans `sessions/YYYY-MM/log.jsonl`.
 *
 * Pattern TPB : le SKILL décide (probabiliste), le script exécute (déterministe),
 * la session logue (auditabilité).
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SESSIONS_ROOT = join(HERE, '..', 'sessions');

export type LogEntry = {
  timestamp: string;
  script: string;
  input?: unknown;
  output?: unknown;
  error?: string;
};

export function logSessionEntry(
  script: string,
  entry: Omit<LogEntry, 'timestamp' | 'script'>,
): void {
  // Test-friendly : désactiver via env var pour ne pas polluer les sessions.
  if (process.env.EVENT_SKILL_DISABLE_LOG === '1') return;

  const now = new Date();
  const yyyyMM = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const monthDir = join(SESSIONS_ROOT, yyyyMM);
  if (!existsSync(monthDir)) mkdirSync(monthDir, { recursive: true });

  const line: LogEntry = {
    timestamp: now.toISOString(),
    script,
    ...entry,
  };
  appendFileSync(join(monthDir, 'log.jsonl'), JSON.stringify(line) + '\n', 'utf-8');
}

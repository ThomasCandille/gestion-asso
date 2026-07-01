---
name: creer-un-evenement
description: >
  OPERATIONAL — Crée un événement complet dans la base de données IIMPACT :
  l'événement principal, ses activités associées, et un plan de communication
  (campagne + publications teaser/trailer/récap).
  Utiliser quand : l'utilisateur demande de créer un nouvel événement,
  préparer un événement interne ou externe, monter un plan de comm complet.
  Ne PAS utiliser pour : modifier un événement existant, supprimer des données,
  accéder à Google Drive (hors scope de ce skill), créer des inscriptions.
---

> **Tier**: OPERATIONAL · **Domain**: événements / communication · **Pattern**: mixte (scripts déterministes + appels API + prose LLM)

# Créer un événement — IIMPACT

## WHY

La création d'un événement IIMPACT implique 4 ressources liées (événement → activités → campagne → publications) dans un ordre strict. Sans skill, le LLM oublie des étapes, invente des données manquantes, ou appelle les API dans le mauvais ordre. Ce skill centralise la séquence, la validation pré-création, et le format du résumé final.

## SCOPE

### Couvert
- Création d'un événement (INTERNAL ou EXTERNAL) avec ses champs optionnels
- Création des activités associées à l'événement
- Création d'un plan de communication : campagne + publications (teaser, trailer, récap)
- Validation du plan avant tout appel API
- Génération d'un plan de communication par défaut si l'utilisateur n'en fournit pas
- Résumé final en prose des éléments créés

### PAS couvert (out of scope)
- Modification ou suppression d'éléments existants
- Création de dossiers Google Drive / documents Google Docs
- Inscriptions participants ou staff
- Entrées budgétaires (recettes, dépenses)
- Création en masse (plusieurs événements en un seul appel)

## INPUTS

### RÈGLE CARDINALE

Avant toute exécution, demander à l'utilisateur les informations de l'événement. **Ne PAS inventer de données, ne PAS compléter des champs vides par des valeurs fictives.**

Formulation type :
> *« Pour créer l'événement, j'ai besoin d'au minimum : le titre et le type (Interne ou Externe). Tu peux aussi me donner les dates, le lieu, le budget, une description, et les activités prévues. »*

### Champs requis (le plan ne peut pas être créé sans eux)
| Champ | Objet | Exemple |
|-------|-------|---------|
| `title` | événement | "Gala de printemps" |
| `type` | événement | "INTERNAL" ou "EXTERNAL" |

### Champs recommandés (laisser vide si absent, ne pas inventer)
| Champ | Objet | Format | Exemple |
|-------|-------|--------|---------|
| `description` | événement | texte libre | "Soirée festive annuelle" |
| `status` | événement | enum | "DRAFT" (défaut) |
| `location` | événement | texte libre | "Salle Pleyel, Paris" |
| `startsAt` | événement | ISO datetime | "2026-09-15T18:00:00" |
| `endsAt` | événement | ISO datetime | "2026-09-15T23:00:00" |
| `budgetEuros` | événement | string décimale | "500" ou "1500.50" |
| `title` | activité (×N) | texte min 2 car. | "Atelier photo" |
| `title` | campagne comm | texte libre | "Com' Gala printemps" |

### Session

Les appels API nécessitent une authentification. Le serveur Next.js doit être accessible.

**Option A — Cookie de session (recommandée)** : récupérer la valeur du cookie `demo-profile`
depuis les DevTools du navigateur (Application → Cookies → localhost:3000).

**Option B — Variable d'environnement** : définir `EVENT_API_BASE_URL` et `EVENT_SESSION_COOKIE`
dans le shell courant :
```bash
export EVENT_API_BASE_URL=http://localhost:3000
export EVENT_SESSION_COOKIE="demo-profile=<valeur>"
```

## HOW TO INVOKE

### Mode auto (souhaité si la description est précise)
Claude Code charge ce skill automatiquement face à des demandes du type :
- "crée un événement"
- "prépare le plan de l'événement X"
- "monte un nouvel événement interne"
- "crée le plan de comm pour l'événement Y"

### Mode explicite (fiable, préféré)
```
utilise le skill creer-un-evenement pour créer un événement [description]
```

## PROCESS — 5 étapes

### Étape 0 : pré-requis
Vérifier que le serveur est accessible :
```bash
curl -s ${EVENT_API_BASE_URL:-http://localhost:3000}/api/health
```
Si la réponse n'est pas 200, informer l'utilisateur que le serveur de développement doit être lancé (`npm run dev`).

### Étape 1 : collecte et validation du plan
1. Collecter les informations auprès de l'utilisateur (voir INPUTS).
2. Construire un `EventCreationPlan` (voir `scripts/types.ts`).
3. Appeler `validateEventPlan()` depuis `scripts/validate-event.ts` :
   ```bash
   echo '<plan JSON>' | npx tsx .claude/skills/creer_un_evenement/scripts/validate-event.ts
   ```
4. Si `valid: false` → afficher les `missingFields`, arrêter la création, demander les données manquantes.
5. Afficher les `warnings` à l'utilisateur (informationnel, pas bloquant).

### Étape 2 : plan de communication par défaut
Si l'utilisateur n'a pas fourni de plan de communication :
```bash
echo '<eventInput JSON>' | npx tsx .claude/skills/creer_un_evenement/scripts/build-communication-plan.ts
```
Proposer le plan généré à l'utilisateur. Il peut ajuster les titres, dates et types de publication avant la création.

### Étape 3 : création dans la base de données
Appels dans cet **ordre strict** (chaque étape dépend de l'ID retourné par la précédente) :

#### 3a — Créer l'événement
```
POST /api/events
Body: { title, type, status, description?, location?, startsAt?, endsAt?, budgetEuros? }
Response: { event: { id, title, ... } }
```
Stocker l'`eventId` retourné.

#### 3b — Créer chaque activité
```
POST /api/events/{eventId}/activities
Body: { title, description?, rules?, prizes?, budgetEuros? }
Response: { activity: { id, title, ... } }
```
Répéter pour chaque activité.

#### 3c — Créer la campagne de communication
```
POST /api/communication/campaigns
Body: { title, description?, eventId, status }
Response: { campaign: { id, title, ... } }
```
Stocker le `campaignId` retourné.

#### 3d — Créer chaque publication
```
POST /api/communication/campaigns/{campaignId}/posts
Body: { title, postType, status, content?, mediaDescription?, scheduledAt? }
Response: { post: { id, title, ... } }
```
Répéter pour chaque publication (minimum : teaser, trailer, récap).

### Étape 4 : log de session
Après la création, logger le résultat dans `sessions/YYYY-MM/log.jsonl` via `logSessionEntry` de `scripts/log.ts`.

### Étape 5 : résumé final
Rédiger un résumé en suivant la doctrine `prose/format-event-summary.md`.

## SESSIONS

Chaque exécution des scripts déterministes et chaque création API appendent une ligne JSON dans `sessions/YYYY-MM/log.jsonl` :
```json
{"timestamp":"2026-07-15T...","script":"validate-event","input":{...},"output":{...}}
{"timestamp":"2026-07-15T...","script":"event-created","input":{"title":"Gala"},"output":{"eventId":"clx..."}}
```

Pattern TPB : le SKILL décide (probabiliste), les scripts valident (déterministe), la session logue (auditabilité).

## WHAT LLMs GET WRONG (WLGW)

| # | AP | BAD | GOOD | Why |
|---|---|---|---|---|
| AP1 | **Inventer des données** | Claude invente un titre, une date, un lieu | Demander chaque champ manquant à l'utilisateur | Règle TPB : ne jamais fabriquer une donnée pour un système externe |
| AP2 | **Mauvais ordre de création** | Créer la campagne avant l'événement | Toujours : événement → activités → campagne → publications | La campagne requiert `eventId`, la publication requiert `campaignId` |
| AP3 | **Créer sans valider** | Appel direct POST /api/events sans `validateEventPlan` | Toujours appeler le script de validation en étape 1 | Évite les erreurs 400 Zod en cours de séquence |
| AP4 | **Budget en nombre** | `budgetEuros: 500` (number) | `budgetEuros: "500"` (string) | Le schéma Zod attend une string décimale, pas un number |
| AP5 | **Plan de comm < 3 publications** | Une seule publication "générale" | Minimum : teaser + trailer + récap | Règle métier IIMPACT — 3 types distincts pour un plan complet |
| AP6 | **Champ vide vs champ omis** | `location: ""` → peut échouer la validation Zod | Omettre les champs optionnels si l'utilisateur ne les a pas fournis | Les champs optionnels acceptent `undefined`, pas toujours `""` |
| AP7 | **Continuer en silence après erreur** | Une activité échoue (404), Claude continue avec la campagne | Arrêter la séquence, signaler l'erreur, ne pas créer les éléments dépendants | La création est transactionnelle dans le sens métier |
| AP8 | **Omettre les IDs dans le résumé** | "L'événement a été créé avec succès." | Inclure l'eventId, les activityIds, le campaignId, les postIds | L'utilisateur a besoin des IDs pour les retrouver ou les compléter |
| AP9 | **Créer sans session** | Les API retournent 401 | Vérifier la session avant d'appeler POST /api/events | Toutes les routes sont protégées côté serveur — 401 arrête la séquence |

## VALIDATION

Le skill est valide si :
- [ ] `echo '{"event":{"title":"Test","type":"INTERNAL","status":"DRAFT"},"activities":[],"campaign":{"title":"Comm Test","status":"DRAFT","posts":[]}}' | npx tsx .claude/skills/creer_un_evenement/scripts/validate-event.ts` retourne `valid: true` avec 1 warning
- [ ] `echo '{"title":"Test","type":"EXTERNAL"}' | npx tsx .claude/skills/creer_un_evenement/scripts/build-communication-plan.ts` retourne une campagne avec 3 posts
- [ ] `npx vitest run .claude/skills/creer_un_evenement/scripts/` retourne 100 % vert
- [ ] Un événement créé via ce skill a ses activités et sa campagne dans la BDD
- [ ] `sessions/YYYY-MM/log.jsonl` contient une ligne par étape exécutée

## Références

- Types partagés : `scripts/types.ts`
- Valeurs SSOT événement : `config/event-types.ts`
- Templates communication : `config/communication-templates.ts`
- Validation déterministe : `scripts/validate-event.ts`
- Plan comm par défaut : `scripts/build-communication-plan.ts`
- Logger de session : `scripts/log.ts`
- Doctrine de résumé final : `prose/format-event-summary.md`
- Schémas Zod du projet : `src/features/events/event-schemas.ts`, `src/features/events/activity-schemas.ts`, `src/features/communication/communication-schemas.ts`

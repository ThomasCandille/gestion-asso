# IIMPACT — Gestion association

Application web de gestion interne pour l'association événementielle IIMPACT. Elle centralise la gestion des membres, des événements et activités, du budget, de l'inventaire, du calendrier de communication et des documents Google Drive.

Le brief fonctionnel est dans `Projet.md`. Les règles de travail pour Claude Code sont dans `CLAUDE.md`.

## Stack

- Next.js App Router (TypeScript strict)
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma 7
- Zod + React Hook Form
- Vitest + Playwright
- Auth maison (session cookie, RBAC par rôle et pôle)
- Google Drive API pour les documents

## Lancer le projet

### Prérequis

- Node.js LTS
- Docker (pour PostgreSQL)

### Installation

```bash
npm install
docker compose up -d       # lance PostgreSQL
cp .env.example .env.local # puis renseigner les variables
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

### Commandes utiles

```bash
npm run dev           # serveur de développement
npm run build         # build de production
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # Vitest (tests unitaires)
npm run test:e2e      # Playwright
npm run prisma:migrate
npm run prisma:generate
```

### Connexion en démo

L'authentification utilise un cookie de profil. Trois profils sont disponibles en développement :

| Profil       | Rôle         | Accès                          |
|--------------|--------------|-------------------------------|
| `bureau`     | PRESIDENT    | Tout                          |
| `responsable`| POLE_LEAD    | Son pôle uniquement           |
| `membre`     | MEMBER       | Lecture                       |

Poser le cookie `demo-profile=bureau` (ou `responsable` / `membre`) via les DevTools ou la page `/auth/login`.

## Structure

```
src/app           routes Next.js et route handlers
src/features      domaines métier (membres, events, budget, inventaire, communication, documents)
src/server        env, DB, auth, permissions
src/lib           utilitaires partagés (formats, modal, ui)
prisma            schéma et migrations
.claude/skills    skills Claude Code (creer_un_evenement, technical_debt)
docs              architecture, permissions, modèle de données
e2e               tests Playwright
```

## Scripts déterministes

Les règles métier critiques sont extraites en fonctions pures testées indépendamment de la base :

| Fichier | Fonctions |
|---|---|
| `features/budget/budget-rules.ts` | `computeBudgetBalance` |
| `features/inventory/inventory-rules.ts` | `isLowStock` |
| `features/members/member-rules.ts` | `canMemberRegisterForEvent`, `hasPoleIntersection` |
| `features/members/member-schemas.ts` | validation RBAC pôles/rôles |
| `server/permissions.ts` | `hasPermission`, `canManagePole` |
| `.claude/skills/creer_un_evenement/` | `validateEventPlan`, `buildDefaultCommunicationPlan` |
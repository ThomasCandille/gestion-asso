# IIMPACT - Gestion association

Application web de gestion interne pour l'association evenementielle IIMPACT.

Le brief fonctionnel est dans `Projet.md`. Les regles de travail pour Codex sont dans `../AGENTS.md`.

## Stack initiale

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- PostgreSQL
- Prisma 7
- Auth.js / NextAuth comme socle d'authentification interne
- Zod
- Vitest
- Playwright
- Google Drive et Google Docs pour le stockage documentaire

## Installation

```bash
npm install
```

## Configuration locale

```bash
cp .env.example .env.local
```

Renseigner ensuite les variables locales. Ne jamais commiter `.env.local`.

Pour les commandes Prisma, exposer aussi `DATABASE_URL` dans l'environnement ou utiliser un fichier `.env` local ignore par git.

## Commandes npm

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
```

## Structure

- `src/app` : routes Next.js et route handlers.
- `src/server` : env, DB, auth, permissions et services serveur.
- `src/lib` : utilitaires partages.
- `prisma` : schema et migrations.
- `docs` : architecture, permissions, modele de donnees et integrations.
- `e2e` : tests Playwright.

Voir aussi `docs/project-schema.md` pour les schemas Mermaid du socle initialise.

## Etat actuel

Le projet est initialise. Le module membres contient une premiere interface
`/membres`, les schemas de validation, les routes API et le modele Prisma.

Le branchement complet sur l'authentification et la base PostgreSQL reste a
finaliser.

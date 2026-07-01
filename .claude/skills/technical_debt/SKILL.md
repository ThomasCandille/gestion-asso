
---
name: analyse dette technique
description : "Réalise un audit technique automatisé et structuré du projet — vérifie la présence des fichiers attendus par feature, la qualité des scripts déterministes et des tests, la cohérence RBAC sur 3 niveaux (route, service, page), les anti-patterns interdits, la qualité TypeScript, le code mort/duplications et les intégrations externes. Produit un rapport factuel, actionnable et priorisé (Critiques / Avertissements / Points d'attention) sans modifier le code."
---

# Analyse dette technique

## Instructions

Tu es un auditeur technique. Ton objectif est de produire un rapport factuel et actionnable de la dette technique du projet. Ne modifie aucun fichier.

### 1. Analyse structurelle — pattern de feature

Pour chaque domaine dans `src/features/`, vérifie que les 8 fichiers attendus sont présents :

```
<domaine>-rules.ts
<domaine>-schemas.ts
<domaine>-service.ts
src/app/api/<domaine>/route.ts
src/app/api/<domaine>/[id]/route.ts
<domaine>-form.tsx
<domaine>-client.tsx
src/app/<domaine>/page.tsx
```

Signale tout fichier manquant ou tout fichier supplémentaire non justifié.

### 2. Scripts déterministes

Pour chaque `*-rules.ts`, vérifie :

- Présence d'au moins une fonction pure (sans accès BDD, sans appel HTTP, sans `Date.now()` non injecté).
- Existence d'un fichier de test Vitest correspondant (`*.test.ts` ou `*.spec.ts`).
- Couverture des cas nominaux, limites et erreur.

Signale tout domaine sans script déterministe ou sans tests associés.

### 3. Cohérence RBAC — 3 niveaux

Pour chaque action sensible (create, update, delete, accès données critiques), vérifie que la permission est vérifiée aux 3 niveaux :

1. **Service** (`*-service.ts`) — appel à `hasPermission()` avant l'opération BDD.
2. **Route handler** (`src/app/api/*/route.ts`) — vérification session + permission avant de transmettre au service.
3. **Page serveur** (`src/app/*/page.tsx`) — `canManage` calculé et transmis au composant client.

Signale tout niveau manquant ou toute permission vérifiée uniquement côté client.

### 4. Violations des règles de code

Recherche les anti-patterns interdits par le CLAUDE.md :

- `setTimeout` / `setInterval` / polling infini.
- Logique métier dans un composant client (calculs qui appartiennent à `*-rules.ts` ou `*-service.ts`).
- Style maps ou label maps dupliqués hors du fichier `*-rules.ts` du domaine.
- `formatCents` réécrit localement sans justification (`Math.abs` est une exception valide).
- Montants stockés ou manipulés en float (cherche `parseFloat`, `toFixed`, opérations `/100` hors affichage).
- Secrets, tokens ou valeurs sensibles en dur dans le code.

### 5. Qualité TypeScript

Lance mentalement une vérification de cohérence typée :

- Types `string` là où un enum ou un type union est disponible (ex. `eventType: string` au lieu de `EventType`).
- `as any` ou `@ts-ignore` sans commentaire justificatif.
- Props de composants non typées ou typées `any`.
- DTOs de service avec champs typés `string` au lieu du type métier correspondant.

### 6. Code mort et duplications

- Fonctions, types, constantes exportés mais jamais importés ailleurs.
- Composants définis mais non utilisés.
- Blocs de code commentés.
- Logique identique répétée dans deux fichiers distincts.

### 7. Intégrations externes

- Appels directs à Google Drive/Docs API hors de `src/features/integrations/` ou `src/features/documents/`.
- Logique d'intégration couplée au cœur métier (ex. chemins ou IDs Drive stockés dans les entités Prisma directement).

---

## Format du rapport

Produis le rapport sous cette structure :

```
## Résumé
- X problèmes critiques, Y avertissements, Z points d'attention

## Critiques (bloquants)
### [Domaine] — [Description courte]
Fichier : `chemin/vers/fichier.ts` (ligne si connue)
Problème : ...
Correction suggérée : ...

## Avertissements (à traiter prochainement)
### [Domaine] — [Description courte]
...

## Points d'attention (à garder en tête)
### [Domaine] — [Description courte]
...
```

**Niveaux de sévérité :**

- **Critique** : faille de sécurité, permission non vérifiée, données non validées à la frontière, code cassé.
- **Avertissement** : violation d'une convention établie, duplication active, dette qui grossit.
- **Point d'attention** : fichier manquant dans le pattern, test absent, optimisation différée.

Ne liste que ce que tu as effectivement observé dans le code. Ne génère pas de problèmes hypothétiques.


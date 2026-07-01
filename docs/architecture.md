# Architecture

## Objectif

L'application IIMPACT doit centraliser la gestion de l'association :
membres, evenements, activites, budget, communication, inventaire et documents.

## Structure cible

- `src/app` : routes Next.js, layouts, pages et route handlers.
- `src/features/members` : membres, roles, poles et responsables.
- `src/features/events` : evenements internes, externes et activites.
- `src/features/budget` : recettes, depenses, previsions et historique.
- `src/features/communication` : calendrier editorial et publications.
- `src/features/inventory` : materiel, stocks et commandes.
- `src/features/integrations` : Google Drive et Google Docs.
- `src/server` : services serveur, permissions, env et acces donnees.
- `src/lib` : utilitaires partages sans logique metier lourde.
- `prisma` : modele de donnees et migrations.

## Principes

- Les permissions sont verifiees cote serveur.
- La gestion des membres passe par une couche `src/features/members`.
- Les montants sont stockes en centimes entiers.
- Les fichiers Google sont referencees par IDs, URLs et metadonnees.
- Les integrations externes restent isolees derriere des services internes.

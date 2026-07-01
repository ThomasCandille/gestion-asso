# AGENTS.md

## Contexte du projet

Ce workspace part de zero pour un projet de site de gestion d'association evenementielle IIMPACT.

La source fonctionnelle de reference est `gestion_asso/Projet.md`. Avant toute analyse, conception ou modification, lire ce fichier et respecter son vocabulaire metier.

## Role attendu de l'agent

- Repondre en francais, sauf demande explicite contraire.
- Rester pragmatique et factuel.
- Ne pas developper l'application sans demande explicite.
- Ne pas creer de scaffold, dependances, framework, base de donnees ou fichier technique produit sans validation claire.
- Pour les demandes larges, commencer par clarifier le besoin ou proposer un plan court.
- Pour les demandes de configuration agent, limiter les changements aux fichiers de cadrage comme `AGENTS.md` ou documents equivalents explicitement demandes.
- Ne pas modifier les fichiers de cadrage existants sans demande explicite.

## Regles de travail

- Lire les fichiers existants avant de modifier quoi que ce soit.
- Ne jamais supprimer, deplacer ou reecrire un fichier existant sans demande explicite.
- Ne pas ecraser des changements utilisateur.
- Garder les modifications petites, justifiees et directement reliees a la demande.
- Expliquer les choix importants dans la reponse finale.
- Signaler clairement ce qui n'a pas ete fait.
- Si une partie du code ne fonctionne pas, corriger ou refactoriser le perimetre necessaire pour la rendre fonctionnelle.
- Pas de god files, pas de code dupliqué, pas de code mort.
- Pas de setTimeout, pas de setInterval, pas de polling infini.
- Ne pas utiliser de librairie externe si la stack cible du projet la couvre deja.

## Stack technique cible

Cette stack est le cadre technique par defaut du projet quand le developpement sera explicitement demande. Ne pas initialiser, installer ou configurer ces outils sans demande claire de l'utilisateur.

### Socle applicatif

- Langage principal : TypeScript en mode strict.
- Runtime : Node.js LTS.
- Gestionnaire de paquets : npm par defaut.
- Framework web : Next.js avec App Router.
- Interface : React avec composants serveur par defaut et composants client uniquement quand l'interactivite l'impose.
- Backend applicatif : couche serveur Next.js, route handlers et services metier internes.
- API externe publique : a eviter au debut, sauf besoin explicite. Privilegier les actions serveur et services internes pour limiter la surface d'exposition.

### Interface et design system

- Styling : Tailwind CSS.
- Composants UI : shadcn/ui comme base de composants reutilisables et modifiables.
- Primitives accessibles : Radix UI via shadcn/ui lorsque pertinent.
- Icones : lucide-react.
- Graphiques et dashboards : Recharts par defaut pour les graphiques simples.
- Tables riches : TanStack Table si les listes deviennent filtrables, triables ou paginees.
- Calendriers : choisir une librairie React specialisee seulement apres cadrage des vues attendues.
- Points d'attention : garder l'interface simple, accessible et responsive. Eviter les composants trop lourds ou complexes si le besoin peut etre satisfait par des primitives simples. Ajouter des elements d'interactivité (hover, active, ...) pour les composants interactifs. Eviter les composants qui ne sont pas accessibles ou qui ne respectent pas les standards ARIA.

### Donnees et persistance

- Base de donnees principale : PostgreSQL.
- ORM : Prisma.
- Migrations : Prisma Migrate.
- Donnees sensibles : jamais en clair si elles peuvent etre chiffrees ou referencees.
- Fichiers externes : stocker des references, IDs, URLs ou metadonnees, pas les fichiers eux-memes sauf besoin metier explicite.
- Historique : prevoir une modelisation durable pour les recettes, depenses, budgets, inscriptions, changements de statut et actions importantes.

### Authentification et permissions

- Authentification : Auth.js / NextAuth.
- L'authentification des membres est developpee par le projet et n'utilise pas Google comme provider de connexion.
- Google sert uniquement aux integrations de stockage et de documents via Google Drive et Google Docs.
- Autorisation : RBAC metier base sur les roles, poles et responsabilites de l'association.
- Les permissions doivent etre verifiees cote serveur, pas seulement dans l'interface.
- Les pages, actions serveur, route handlers et integrations externes doivent toutes passer par les memes helpers d'autorisation.

### Validation, formulaires et logique metier

- Validation : Zod pour les schemas d'entree, formulaires, payloads d'API et variables d'environnement.
- Formulaires : React Hook Form avec resolver Zod.
- Dates : utiliser une librairie explicite si les calculs de calendrier deviennent complexes.
- Argent : stocker les montants en centimes entiers, jamais en float.
- Statuts : modeliser les statuts metier avec enums ou unions typees.
- Ne pas dupliquer les regles metier entre interface et serveur ; la source de verite doit etre cote serveur.

### Integrations externes

- Google Drive : Google Drive API pour les dossiers, fichiers, medias et documents de l'association.
- Google Docs : Google Docs API pour les documents editables, comptes rendus, modeles et contenus administratifs.
- SharePoint est exclu du projet a cause des droits d'acces. Ne pas proposer, configurer ou utiliser SharePoint, Microsoft Graph ou une integration Microsoft sans nouvelle demande explicite de l'utilisateur.
- OAuth : configurer uniquement via variables d'environnement et jamais avec des secrets commités.
- Synchronisation : preferer une synchronisation explicite et observable plutot qu'une logique implicite difficile a auditer.
- Suppression distante : interdite par defaut, sauf demande explicite et garde-fous metier.

### Tests et qualite

- Tests unitaires : Vitest.
- Tests de logique metier : obligatoires pour roles, permissions, budget, inscriptions et workflows critiques.
- Tests de composants : Testing Library si les composants portent une logique d'interaction importante.
- Tests end-to-end : Playwright pour les parcours essentiels.
- Lint : ESLint.
- Formatage : Prettier.
- Typage : `tsc --noEmit` doit rester propre.
- Les tests doivent etre ajoutes proportionnellement au risque de la modification.

### Environnements, securite et deploiement

- Variables d'environnement : `.env.local` en local, jamais commite.
- Exemple d'environnement : `.env.example` sans secret reel.
- Base locale : Docker Compose autorise pour PostgreSQL quand le projet sera initialise.
- CI : GitHub Actions pour lint, typecheck, tests et build.
- Deploiement cible : Vercel par defaut pour Next.js, sauf contrainte contraire.
- Logs : prevoir des logs serveur utiles pour les integrations externes et operations critiques.
- Monitoring : Sentry ou equivalent seulement si demande ou si le projet passe en phase production.

### Organisation du code attendue

Quand le projet sera cree, privilegier une organisation par domaines metier :

- `src/app` pour les routes Next.js ;
- `src/features/members` pour les membres ;
- `src/features/events` pour les evenements et activites ;
- `src/features/budget` pour budget, recettes, depenses et previsions ;
- `src/features/communication` pour calendrier editorial et publications ;
- `src/features/inventory` pour inventaire, stocks et commandes ;
- `src/features/integrations` pour Google Drive et Google Docs ;
- `src/server` pour services serveur, permissions et acces donnees ;
- `src/lib` pour utilitaires partages sans logique metier lourde ;
- `prisma` pour schema, migrations et seed.

### Regles de decision technique

- Ne pas introduire une nouvelle librairie si la stack cible couvre deja le besoin.
- Toute exception a la stack cible doit etre expliquee et validee par l'utilisateur.
- Ne pas choisir une technologie uniquement parce qu'elle est populaire ; elle doit resoudre un besoin du brief.
- Garder les integrations externes isolees derriere des services internes testables.
- Ne pas coupler le modele de donnees aux noms ou chemins exacts des dossiers Google Drive et documents Google Docs.

## Domaine metier a respecter

Le projet concerne une association evenementielle avec :

- gestion des membres ;
- poles interne, externe et communication ;
- responsables de pole ;
- bureau compose de presidents, tresorier, vice-tresorier et secretaire ;
- evenements internes et externes ;
- activites rattachees aux evenements ;
- inscriptions participants et staff ;
- suivi budgetaire par evenement et activite ;
- calendrier de communication ;
- inventaire ;
- integrations prevues avec Google Drive et Google Docs.

## Regles d'acces metier

Quand une conception fonctionnelle ou technique sera demandee, tenir compte des regles suivantes :

- Le bureau a une vision globale sur les membres, les evenements et le budget.
- Les tresoriers pilotent le budget, les comptes, les recettes, les depenses et les previsions.
- Le secretaire gere les membres, les evenements et l'administratif.
- Les responsables de pole gerent les membres et evenements de leur pole.
- Le pole externe accede aux dashboards des evenements externes et de leurs activites.
- Le pole interne accede aux dashboards des evenements internes et de leurs activites.
- La communication gere le calendrier editorial et le suivi des publications liees aux evenements externes.
- Les inscriptions staff dependent du type d'evenement et des activites prevues.

## Integrations Google Drive et Google Docs

Google Drive et Google Docs font partie du perimetre prevu du projet.

SharePoint ne fait plus partie du projet a cause des droits d'acces. Ne pas l'utiliser comme solution de stockage, de synchronisation ou d'integration.

Cette regle remplace la mention SharePoint du brief initial dans `gestion_asso/Projet.md`.

Google Drive est utilise pour les dossiers, fichiers et medias de l'association :

- documents administratifs ;
- comptes rendus ;
- budgets et justificatifs ;
- documents lies aux evenements ;
- modeles de documents ;
- photos et videos des evenements ;
- dossiers medias par evenement ;
- archives visuelles de l'association.

Google Docs est utilise pour les documents editables de l'association :

- comptes rendus ;
- documents administratifs ;
- documents de preparation d'evenement ;
- modeles de documents ;
- documents de suivi quand un format texte collaboratif est pertinent.

### Dossiers externes concernes

Completer les emplacements reels quand ils sont connus. Ne pas ajouter de secret, token, client secret ou information sensible dans ce fichier.

Les liens Google Drive ci-dessous sont utiles au cadrage tant que le repository reste prive. Si le repository devient public, les retirer du fichier versionne ou les deplacer dans un document non versionne.

| Service | Dossier | Usage | Droits attendus |
| --- | --- | --- | --- |
| Google Drive | `https://drive.google.com/drive/folders/151NYdP3wsJM-flxlWVcFOJU7w1nQebE_?usp=drive_link` | Global | lecture/ecriture |
| Google Drive | `https://drive.google.com/drive/folders/108VoWFGXKcy-T1VX5iwmPoivDC1k-pMK?usp=drive_link` | Bureau | lecture/ecriture |
| Google Drive | `https://drive.google.com/drive/folders/1EWnAp1HY2_LwD1vC-BLiXuP6lCmPysjF?usp=drive_link` | CA | lecture/ecriture |
| Google Drive | `https://drive.google.com/drive/folders/1bb3iG6X5gFRukCLYFbVb3llxD6TyEW7p?usp=drive_link` | Pole Externe | lecture/ecriture |
| Google Drive | `https://drive.google.com/drive/folders/16QH-EJ_bVfVJedm-WhBxlpdT2aPcbBSE?usp=drive_link` | Pole Interne | lecture/ecriture restreinte |
| Google Drive | `https://drive.google.com/drive/folders/1X8OvjnzNhwy5NXeZUu_WNLITkg8aTup4?usp=drive_link` | Pole Communication | lecture/ecriture restreinte |
| Google Drive | `https://drive.google.com/drive/folders/1JUD8Zaew4BSvLSzRrXkj39ztoAjd0--2?usp=drive_link` | medias photos videos | lecture/upload |

### Regles d'integration

- Ne pas creer de configuration OAuth, API key, secret, service account ou connecteur sans demande explicite.
- Ne jamais stocker de token, secret ou identifiant sensible dans le repository.
- Les liens vers les dossiers peuvent etre documentes seulement s'ils ne sont pas secrets et si le repository reste prive.
- Avant de developper une integration, clarifier les cas d'usage exacts : lecture, ecriture, synchronisation, upload, recherche ou archivage.
- L'application doit stocker des references vers les fichiers externes plutot que dupliquer inutilement les fichiers.
- Les integrations externes doivent etre isolees du coeur metier.
- Les droits d'acces aux fichiers externes doivent respecter les roles du projet.
- Les budgets et justificatifs doivent etre accessibles seulement au bureau et aux tresoriers, sauf regle contraire.
- Les medias d'evenements doivent etre rattaches a l'evenement correspondant.
- Ne pas ecrire dans Google Drive ou Google Docs sans demande explicite. Toute ecriture doit etre justifiee par un besoin metier.
- Ne pas utiliser SharePoint ou Microsoft Graph, meme pour les medias, sauf nouvelle validation explicite.

## Principes de conception future

Si le developpement est explicitement demande plus tard :

- Modeliser d'abord les roles, permissions, evenements, activites, budgets et inscriptions.
- Eviter de melanger logique metier, interface et integrations externes.
- Prevoir un historique fiable pour les recettes, depenses et couts par evenement.
- Traiter Google Drive et Google Docs comme integrations prevues, configurables et isolees du coeur metier.
- Ne jamais stocker de secrets dans le repository.
- Ajouter des tests lorsque la logique touche aux roles, permissions, budget ou inscriptions.

## Limites actuelles

La stack cible est definie dans ce fichier, mais ne pas creer de structure applicative, installer de dependances ou configurer de services sans demande explicite. Le brief doit d'abord etre transforme en cadrage, specifications ou plan de realisation si l'utilisateur le demande.

## Conventions etablies pendant le developpement

Ces conventions ont ete appliquees et validees. Les respecter dans toute modification future.

### Pattern de feature (8 fichiers)

Chaque domaine metier suit ce schema strict dans `gestion_asso/src/features/<domaine>/` :

```
<domaine>-rules.ts       # types, labels, style maps — source de verite UI
<domaine>-schemas.ts     # schemas Zod pour formulaires et API
<domaine>-service.ts     # acces BDD + verification de permissions
src/app/api/<domaine>/route.ts          # GET + POST
src/app/api/<domaine>/[id]/route.ts     # PATCH + DELETE
<domaine>-form.tsx       # formulaire React avec prop onClose
<domaine>-client.tsx     # composant client, etat local, fetch, Modal
src/app/<domaine>/page.tsx              # page serveur : session → donnees → permissions → client
```

### Pattern Modal

Les formulaires ne s'affichent plus dans un aside — ils sont dans une `<Modal>` :

- Etat : `showForm: boolean` + `editingId: string | null`
- `startCreate()` et `startEdit()` appellent `setShowForm(true)`, n'appellent pas `setFeedback()`
- Succes du submit : `setShowForm(false)`
- La modale est rendue conditionnellement : `{canManage && <Modal open={showForm} ...>}`
- Composant Modal : `src/lib/modal.tsx` (Escape, clic backdrop, overflow lock)

### Centralisation des utilitaires

- `formatCents(cents)` → `@/lib/formats` pour l'affichage standard
  - Exception : si `Math.abs` est necessaire, une version locale est justifiee
- Style maps (`eventTypeStyles`, `eventStatusStyles`, etc.) → `*-rules.ts` du domaine
- Ne jamais recopier un style map ou un label map dans un autre fichier

### Types stricts dans les DTOs de service

- Les champs `eventType` et `eventStatus` dans les DTOs sont types `EventType`/`EventStatus`, pas `string`
- Les valeurs Prisma sont castees avec `as EventType` / `as EventStatus` dans les mappers de service
- Importer ces types depuis `../events/event-rules`, pas depuis `@prisma/client`

### Parametres de route App Router

```ts
// Toujours await params dans les route handlers Next.js 15+
type Params = { params: Promise<{ id: string }> };
export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
}
```

### Inventaire

- Enum Prisma : `InventoryCategory` (FOOD, EQUIPMENT, DECORATION, CONSUMABLE, OTHER)
- Types TS dans `src/features/inventory/inventory-rules.ts`
- Permission `inventory:manage` : PRESIDENT uniquement
- Helper `isLowStock(quantity, minQuantity)` dans `inventory-rules.ts`

### Commandes slash disponibles

Invoquer avec `/nom-commande` dans Claude Code :

- `/nouvelle-feature <domaine>` — scaffold complet d'une feature
- `/migration <nom>` — modifier le schema Prisma + migrer
- `/seed <domaine>` — ajouter des donnees de seed realistes
- `/check` — tsc + lint + points d'attention
- `/nettoyer` — passer en revue le code mort et les duplications
- `/test <domaine>` — generer les tests Vitest (regles pures, permissions, schemas)
- `/rbac` — auditer la coherence des permissions sur les 3 niveaux (service, route, page)
- `/deterministe <domaine>` — extraire un script deterministe dans `*-rules.ts` et generer les tests Vitest

## Scripts deterministes et hooks

### Scripts deterministes

Chaque domaine metier doit contenir au moins un script deterministe extrait et couvert par des tests Vitest.

Un script deterministe est une fonction pure sans effets de bord : pas d'acces BDD, pas d'appel HTTP, pas de date dynamique. Il calcule un resultat a partir de ses seuls arguments.

Exemples types :
- `isLowStock(quantity, minQuantity)` dans `inventory-rules.ts`
- `canRegister(member, event, existingRegistrations)` dans `registrations-rules.ts`
- `computeBudgetBalance(incomes, expenses)` dans `budget-rules.ts`

Regles :
- Le script doit etre dans le fichier `*-rules.ts` du domaine, pas dans un service.
- Les tests doivent couvrir le cas nominal, les cas limites et les cas d'erreur.
- Un script extrait mais non teste n'est pas valide.

Utiliser `/deterministe <domaine>` pour automatiser l'extraction et la generation des tests.

### Pre-commit hook

Un hook Claude Code est configure dans `.claude/settings.json` pour bloquer tout `git commit` si `tsc --noEmit` ou `eslint` echoue.

Le hook se declenche sur `PreToolUse` avec le filtre `Bash(git commit *)` :
- Silencieux tant que `gestion_asso/package.json` n'existe pas (projet non initialise).
- Actif des que le projet est initialise : `tsc --noEmit && eslint . --max-warnings 0`.
- Bloque le commit (exit non-zero) si l'une des deux verifications echoue.

Ce hook protege uniquement les commits passes via Claude Code. Pour proteger egalement les commits directs en terminal, installer un vrai hook git dans `.git/hooks/pre-commit` avec le meme contenu.

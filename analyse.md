Résumé
4 problèmes critiques — dont 1 bloquant l'ensemble du RBAC
7 avertissements — violations de conventions établies, duplications actives
4 points d'attention — couverture de tests incomplète, pattern de feature à clarifier
Critiques (bloquants)
Auth — Session hardcodée, RBAC entièrement fictif
Fichier : src/server/auth/session.ts:10

Problème : getCurrentSession() retourne toujours OPEN_SESSION (rôle PRESIDENT, tous les pôles). Tous les contrôles de permission s'appuient sur ce retour — ils passent systématiquement. Aucun utilisateur réel n'est authentifié.

Correction suggérée : Implémenter l'authentification réelle via Auth.js / NextAuth avant toute mise en production. C'est la dépendance racine de tous les autres points RBAC.

RBAC — Page membres sans vérification de session ni de permission
Fichier : src/app/membres/page.tsx

Problème : La page appelle listMembers() directement, sans getCurrentSession() ni redirect("/auth/login"). Contrairement à budget/page.tsx et documents/page.tsx qui appliquent le pattern complet, cette page expose la liste des membres sans aucune garde d'accès côté serveur. De plus, canManage n'est pas calculé ni transmis au composant client — MembersClientProps ne reçoit que initialMembers.

Correction suggérée : Aligner sur le pattern de budget/page.tsx — appeler getCurrentSession(), rediriger si absent, calculer canManage = hasPermission(session.role, "members:manage") et le passer à MembersClient.

RBAC — Fonctions de lecture sans contrôle d'accès (service layer)
Fichiers :

src/features/budget/budget-service.ts:111 — listBudgetEntries, getBudgetSummary, getEventBudgetBreakdown, getBudgetForecast
src/features/events/event-service.ts:103 — listEvents, getEventById
src/features/members/member-service.ts:178 — listMembers, getMemberById
Problème : Ces fonctions n'ont pas de paramètre actor et ne vérifient aucune permission. Seules les opérations d'écriture (createBudgetEntry, updateEvent, etc.) contrôlent le rôle. Tout utilisateur authentifié peut donc lire l'intégralité des données budgétaires, membres et événements sans restriction.

Correction suggérée : Ajouter un paramètre actor: AppSession et appeler assertCanManage(actor) ou équivalent en tête de chaque fonction de lecture exposant des données sensibles.

RBAC — roleStyles et statusStyles calculés côté client sans canManage
Fichier : src/features/members/members-client.tsx:48

Problème : MembersClientProps ne contient pas de prop canManage. Le composant expose-t-il les boutons créer/modifier/désactiver à tous les rôles ? L'examen des props confirme que la permission n'est pas transmise depuis le serveur, contrairement aux autres features (budget, documents). Si les boutons sont rendus sans condition, n'importe quel utilisateur connecté peut déclencher des mutations.

Correction suggérée : Ajouter canManage: boolean aux props et conditionner le rendu des actions sur cette valeur, en parallèle de la correction de la page serveur.

Avertissements (à traiter prochainement)
Budget — Logique métier dupliquée dans le client
Fichier : src/features/budget/budget-client.tsx:70

Problème : recomputeSummary() (lignes 70–86) et recomputeBreakdown() (lignes 88–107) reproduisent côté client la logique de getBudgetSummary() et getEventBudgetBreakdown() du service. La règle de calcul du solde (revenueCents - expenseCents) est dupliquée en deux endroits distincts.

Correction suggérée : Extraire computeBudgetSummary(entries) et computeBreakdown(entries, rows) dans budget-rules.ts comme scripts déterministes. Les utiliser à la fois dans le service et dans le client.

Budget — budget-rules.ts sans script déterministe ni tests
Fichier : src/features/budget/budget-rules.ts

Problème : Le fichier contient uniquement des types et labels. Le CLAUDE.md exige au moins un script déterministe par domaine. Le calcul computeBudgetBalance(revenueCents, expenseCents, forecastCents) est une fonction pure évidente, actuellement noyée dans le service et dupliquée dans le client. Aucun fichier budget-rules.test.ts n'existe.

Correction suggérée : Utiliser /deterministe budget pour extraire et tester ce script.

Communication — campaignStatusStyles et postStatusStyles identiques
Fichier : src/features/communication/comm-rules.ts:45

Problème : Les objets campaignStatusStyles (lignes 45–52) et postStatusStyles (lignes 54–61) sont identiques mot pour mot. C'est une duplication active dans le même fichier.

Correction suggérée : Définir une seule constante communicationStatusStyles et supprimer l'une des deux.

Membres — Style maps dans le client au lieu de member-rules.ts
Fichier : src/features/members/members-client.tsx:48

Problème : roleStyles (lignes 48–55) et statusStyles (lignes 57–60) sont définis dans le composant client. La convention établie impose que les style maps soient dans *-rules.ts du domaine. member-rules.ts n'expose que des labels, pas les styles correspondants.

Correction suggérée : Déplacer roleStyles et statusStyles dans member-rules.ts et les importer dans le client.

Budget — Double requête BDD après création
Fichier : src/features/budget/budget-service.ts:285

Problème : createBudgetEntry fait un prisma.budgetEntry.create() suivi immédiatement d'un prisma.budgetEntry.findUniqueOrThrow() sur le même id. C'est deux aller-retours BDD là où un seul suffit.

Correction suggérée : Utiliser include: { event: ..., activity: ... } directement dans prisma.budgetEntry.create().

Documents — new Date() comme fallback de date manquante
Fichier : src/features/documents/documents-service.ts:41

Problème : modifiedTime: f.modifiedTime ?? new Date().toISOString() utilise la date courante comme valeur par défaut lorsque l'API Drive ne renvoie pas de modifiedTime. Un fichier sans date de modification affichera la date de consultation, ce qui est trompeur.

Correction suggérée : Utiliser null comme valeur par défaut et adapter formatModifiedDate pour gérer null explicitement.

Upload — Code HTTP 403 détecté par analyse du message texte
Fichier : src/app/api/documents/upload/route.ts:55

Problème : const status = message.includes("autorisé") ? 403 : 500 — le code HTTP retourné dépend de la présence d'un mot dans la chaîne du message d'erreur. Si le message change, le code HTTP change silencieusement.

Correction suggérée : Tester err instanceof DocumentsPermissionError (le service expose cette classe) pour déterminer le code HTTP.

Points d'attention
Tests — Fonctions pures sans couverture Vitest
Les fonctions pures suivantes existent mais n'ont pas de fichier de test :

isTerminalStatus, hasEventTypeAccess → src/features/events/event-rules.ts (pas de event-rules.test.ts)
isLowStock → src/features/inventory/inventory-rules.ts (pas de inventory-rules.test.ts)
getAccessibleFolderKeys → src/features/documents/documents-rules.ts (pas de documents-rules.test.ts)
comm-rules.ts ne contient pas de fonction pure — à envisager pour la transition de statut (ex. canPublish(status))
Action suggérée : /test events, /test inventory, /test documents

Pattern de feature — Fichiers supplémentaires non documentés dans events/
Le domaine events/ dépasse largement les 8 fichiers du pattern standard : activity-card.tsx, activity-form.tsx, activity-schemas.ts, activity-service.ts, event-dashboard-client.tsx, event-format.ts, event-view.ts. Cette extension est cohérente avec la richesse du domaine, mais elle n'est pas documentée dans CLAUDE.md comme exception au pattern.

Action suggérée : Documenter le sous-pattern activity-* dans les conventions du CLAUDE.md.

documents/ — Pattern incomplet
Le domaine documents/ n'a pas de documents-schemas.ts ni de route [id]/route.ts. Cohérent avec un modèle lecture/upload sans CRUD complet, mais à clarifier : si un CRUD de ExternalFileReference (le modèle Prisma) est prévu, les fichiers manquants devront être créés.

member-service.ts — canManageMember et assertCanManageMember dupliquent la même logique
Fichier : src/features/members/member-service.ts:98

Les deux fonctions implémentent la même règle (rôle bureau ou POLE_LEAD avec intersection de pôles). assertCanManageMember pourrait simplement appeler canManageMember et lever si false.
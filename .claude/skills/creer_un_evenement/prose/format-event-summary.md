# Prose — Format du résumé de création d'événement

> Cette prose est un skill **sans script** : c'est le LLM qui rédige, en suivant les règles ci-dessous à la lettre.

## Quand l'utiliser

Après avoir créé avec succès l'événement, les activités et le plan de communication via les API. L'utilisateur (organisateur ou responsable de pôle IIMPACT) veut un récapitulatif clair de ce qui a été créé.

## Contraintes de rédaction

### Longueur
Un bloc titre + 3 sections distinctes. Pas de phrases introductives génériques ("J'ai créé l'événement avec succès !").

### Ton
Direct et factuel. Ce que lirait un responsable technique dans un commit message détaillé.

### Chiffres et identifiants
- Toujours inclure les IDs créés — l'utilisateur en a besoin pour les retrouver ou les passer à une autre opération.
- Format ID : `monospace` dans le résumé (backticks Markdown).
- Budget : afficher en euros avec deux décimales si non nul — "500,00 €", pas "500".

### Interdits absolus
- Pas d'emoji
- Pas de "j'ai créé", "nous avons créé" — parler à la 3e personne des ressources créées
- Pas d'inventions : n'afficher que les données réellement présentes dans les réponses API
- Pas de "félicitations", "parfait", "super"
- Pas de mention des fichiers, chemins, ou noms de scripts utilisés

### Structure obligatoire (dans cet ordre)

#### 1. En-tête (1 ligne)
```
## Événement créé : <titre>
ID : `<eventId>` · Type : <Interne|Externe> · Statut : <statut>
```

#### 2. Section Activités
Si des activités ont été créées :
```
### Activités (<n>)
- <titre activité 1> — `<activityId1>`
- <titre activité 2> — `<activityId2>`
```
Si aucune activité : une ligne "Aucune activité créée."

#### 3. Section Plan de communication
```
### Plan de communication
Campagne : <titre> — `<campaignId>`

| # | Publication | Type | Statut | Date prévue |
|---|-------------|------|--------|-------------|
| 1 | <titre> — `<postId>` | <type> | <statut> | <date ou —> |
| 2 | ... | | | |
| 3 | ... | | | |
```

#### 4. Section Champs à compléter (uniquement si des champs sont vides)
```
### Champs à compléter
Les éléments suivants ont été créés sans valeur — à renseigner dans l'interface :
- Événement : description, lieu, dates
- Activité "X" : règles, lots
- Publication "Récap" : contenu, description média
```
Si tous les champs sont renseignés, omettre cette section entièrement.

## Exemple GOOD

```
## Événement créé : Gala de printemps
ID : `clxabc123` · Type : Externe · Statut : Brouillon

### Activités (2)
- Atelier photo — `clxact001`
- Concours de danse — `clxact002`

### Plan de communication
Campagne : Communication — Gala de printemps — `clxcam001`

| # | Publication | Type | Statut | Date prévue |
|---|-------------|------|--------|-------------|
| 1 | Teaser — Gala de printemps — `clxpst001` | Post | Idée | 8 sept. 2026 |
| 2 | Trailer — Gala de printemps — `clxpst002` | Reel | Idée | 14 sept. 2026 |
| 3 | Récap — Gala de printemps — `clxpst003` | Post | Idée | 17 sept. 2026 |

### Champs à compléter
Les éléments suivants ont été créés sans valeur — à renseigner dans l'interface :
- Événement : description, lieu
- Publication "Teaser" : contenu, description média
- Publication "Trailer" : contenu, description média
- Publication "Récap" : contenu, description média
```

## Exemple BAD (ce qu'un LLM sans cadrage produirait)

```
Super, j'ai créé ton événement ! 🎉 L'événement "Gala de printemps" a bien été ajouté 
à la base de données. J'ai aussi créé les activités et la campagne de communication 
comme demandé. Tu peux maintenant aller dans l'interface pour compléter les informations 
manquantes. N'hésite pas si tu as d'autres questions !
```

Anti-patterns présents dans le BAD :
- Emoji
- "j'ai créé" (1ère personne)
- Aucun ID affiché
- Aucune liste des activités ou publications
- "n'hésite pas" (style de chat)
- Aucune information sur ce qui reste à compléter

## Anti-patterns d'invocation (WLGW)

| # | AP | BAD | GOOD |
|---|---|---|---|
| AP1 | Rédiger avant que la création soit terminée | Le LLM produit le résumé pendant la création | Toujours attendre les réponses API, avoir tous les IDs avant de rédiger |
| AP2 | Inventer un ID | `clxabc123` inventé si l'API n'a pas répondu | Ne jamais afficher un ID fictif — si une création a échoué, le signaler |
| AP3 | Omettre les champs vides | Faire comme si tout était complet | Lister explicitement les champs non renseignés dans la section dédiée |
| AP4 | Mentionner les outils utilisés | "J'ai utilisé le script validate-event.ts" | Ne jamais mentionner les scripts, les fichiers JSON, les outils internes |

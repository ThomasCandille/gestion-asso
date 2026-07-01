# Schema du projet

Ce document donne une vue d'ensemble du socle initialise.

## Vue technique globale

```mermaid
flowchart LR
  User[Membres IIMPACT] --> UI[Next.js App Router]

  UI --> Pages[src/app pages]
  UI --> API[src/app/api route handlers]

  Pages --> Server[src/server]
  API --> Server

  Server --> Auth[Auth interne projet]
  Server --> Permissions[RBAC roles + poles]
  Server --> Prisma[Prisma Client]
  Server --> Google[Services Google Drive / Docs]

  Prisma --> DB[(PostgreSQL)]
  Google --> Drive[(Google Drive fichiers + medias)]
  Google --> Docs[(Google Docs documents editables)]

  Server --> Env[Zod env validation]
```

## Flux d'une action protegee

```mermaid
sequenceDiagram
  actor Member as Membre
  participant Page as Page Next.js
  participant Server as Service serveur
  participant Session as Session interne
  participant RBAC as Permissions RBAC
  participant DB as PostgreSQL
  participant Google as Google Drive / Docs

  Member->>Page: Lance une action metier
  Page->>Server: Appel serveur ou route handler
  Server->>Session: Lit la session membre
  Server->>RBAC: Verifie role, pole et permission
  alt Donnees internes
    Server->>DB: Lecture / ecriture via Prisma
    DB-->>Server: Resultat
  else Document ou media
    Server->>Google: Lecture / ecriture si autorisee
    Google-->>Server: Reference fichier
  end
  Server-->>Page: Reponse typee
  Page-->>Member: Interface mise a jour
```

## Domaines fonctionnels

```mermaid
flowchart TB
  App[IIMPACT Gestion Association]

  App --> Members[Membres]
  App --> Events[Evenements]
  App --> Budget[Budget]
  App --> Communication[Communication]
  App --> Inventory[Inventaire]
  App --> Documents[Documents]

  Members --> Roles[Roles]
  Members --> Poles[Poles]
  Members --> Leads[Responsables de pole]

  Events --> Internal[Evenements internes]
  Events --> External[Evenements externes]
  Events --> Activities[Activites]
  Events --> Staff[Staff]
  Events --> Registrations[Inscriptions]

  Budget --> Revenues[Recettes]
  Budget --> Expenses[Depenses]
  Budget --> Forecasts[Previsions]
  Budget --> History[Historique]

  Communication --> Calendar[Calendrier editorial]
  Communication --> Posts[Publications]
  Communication --> Tracking[Suivi d'avancement]

  Inventory --> Items[Materiel]
  Inventory --> Stocks[Stocks]
  Inventory --> Orders[Commandes]

  Documents --> Drive[Google Drive]
  Documents --> Docs[Google Docs]
```

## Modele de donnees initial

```mermaid
erDiagram
  MEMBER ||--o{ EVENT_REGISTRATION : registers
  MEMBER ||--o{ STAFF_ASSIGNMENT : staffs
  MEMBER ||--o{ COMMUNICATION_POST : authors
  MEMBER ||--o{ MEMBER_POLE : belongs_to
  MEMBER ||--o{ PASSWORD_RESET_TOKEN : owns

  EVENT ||--o{ ACTIVITY : contains
  EVENT ||--o{ EVENT_REGISTRATION : has
  EVENT ||--o{ STAFF_ASSIGNMENT : needs
  EVENT ||--o{ BUDGET_ENTRY : tracks
  EVENT ||--o{ COMMUNICATION_POST : plans
  EVENT ||--o{ EXTERNAL_FILE_REFERENCE : links

  ACTIVITY ||--o{ STAFF_ASSIGNMENT : assigns
  ACTIVITY ||--o{ BUDGET_ENTRY : tracks

  MEMBER {
    string id
    string email
    string passwordHash
    string firstName
    string lastName
    string phone
    string year
    enum status
    enum role
  }

  MEMBER_POLE {
    string id
    string memberId
    enum pole
  }

  PASSWORD_RESET_TOKEN {
    string id
    string memberId
    string tokenHash
    datetime expiresAt
    datetime usedAt
  }

  EVENT {
    string id
    string title
    enum type
    enum status
    string location
    datetime startsAt
    int budgetCents
  }

  ACTIVITY {
    string id
    string eventId
    string title
    string rules
    string prizes
    int budgetCents
  }

  BUDGET_ENTRY {
    string id
    string eventId
    string activityId
    enum type
    string label
    int amountCents
  }

  COMMUNICATION_POST {
    string id
    string eventId
    string authorId
    string channel
    enum status
    datetime scheduledAt
  }

  EXTERNAL_FILE_REFERENCE {
    string id
    enum provider
    string externalId
    string name
    string url
  }
```

## Organisation des fichiers

```text
gestion_asso/
├── Projet.md
├── README.md
├── .env.example
├── package.json
├── next.config.ts
├── prisma.config.ts
├── prisma/
│   └── schema.prisma
├── docs/
│   ├── architecture.md
│   ├── data-model.md
│   ├── development-roadmap.md
│   ├── integrations-google.md
│   ├── permissions.md
│   └── project-schema.md
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── membres/page.tsx
│   │   └── api/health/route.ts
│   ├── features/members/
│   │   ├── member-demo-data.ts
│   │   ├── member-rules.ts
│   │   ├── member-schemas.ts
│   │   ├── member-service.ts
│   │   └── members-client.tsx
│   ├── lib/
│   │   └── utils.ts
│   └── server/
│       ├── auth/session.ts
│       ├── db/client.ts
│       ├── env.ts
│       ├── permissions.ts
│       └── permissions.test.ts
└── e2e/
    └── home.spec.ts
```

## Etat actuel

```mermaid
flowchart LR
  Done[Initialise]
  Next[Prochaine etape]

  Done --> A[Frontend minimal]
  Done --> B[API health]
  Done --> C[Schema Prisma]
  Done --> D[Permissions serveur]
  Done --> E[Docs de cadrage]
  Done --> F[Tests unitaires]

  Next --> G[Auth membres]
  Next --> H[Migrations DB]
  Next --> I[CRUD membres]
  Next --> J[Evenements + activites]
  Next --> K[Budget]
  Next --> L[Integrations Google]
```

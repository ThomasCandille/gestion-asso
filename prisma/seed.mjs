import { scrypt as scryptCallback, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import seedMembers from "../src/features/members/member-fixtures.json" with { type: "json" };

const scrypt = promisify(scryptCallback);
const keyLength = 64;
const defaultPassword = process.env.SEED_MEMBER_PASSWORD ?? "Iimpact2026!";
const databaseUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/gestion_asso?schema=public";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, keyLength);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

function nullable(value) {
  return value || null;
}

function optionalDate(value) {
  return value ? new Date(value) : null;
}

// ─── Reset ────────────────────────────────────────────────────────────────────

async function resetDatabase() {
  await prisma.postAssignee.deleteMany({});
  await prisma.communicationPost.deleteMany({});
  await prisma.communicationCampaign.deleteMany({});
  await prisma.staffAssignment.deleteMany({});
  await prisma.budgetEntry.deleteMany({});
  await prisma.eventRegistration.deleteMany({});
  await prisma.externalFileReference.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.memberPole.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.inventoryItem.deleteMany({});
  console.log("Base de données réinitialisée.");
}

// ─── Membres ──────────────────────────────────────────────────────────────────

async function seedMember(member) {
  const memberPoles = member.poles.map((pole) => ({ pole }));
  return prisma.member.create({
    data: {
      id: member.id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      year: member.year,
      status: member.status,
      role: member.role,
      photoUrl: nullable(member.photoUrl),
      joinedAt: optionalDate(member.joinedAt),
      internalNotes: nullable(member.internalNotes),
      discordUsername: nullable(member.discordUsername),
      passwordHash: await hashPassword(defaultPassword),
      memberPoles: { create: memberPoles },
    },
  });
}

// ─── Inventaire ───────────────────────────────────────────────────────────────

const inventoryItems = [
  // Aliments
  { name: "Farine T55", category: "FOOD", quantity: 5, unit: "kg", minQuantity: 2, location: "Placard cuisine", notes: "Pour les crêpes et gâteaux" },
  { name: "Sucre en poudre", category: "FOOD", quantity: 3, unit: "kg", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Sucre glace", category: "FOOD", quantity: 1, unit: "kg", minQuantity: null, location: "Placard cuisine", notes: null },
  { name: "Oeufs", category: "FOOD", quantity: 24, unit: "unités", minQuantity: 12, location: "Réfrigérateur", notes: "Vérifier la date" },
  { name: "Beurre", category: "FOOD", quantity: 4, unit: "plaques 250g", minQuantity: 2, location: "Réfrigérateur", notes: null },
  { name: "Lait entier", category: "FOOD", quantity: 6, unit: "litres", minQuantity: 3, location: "Réfrigérateur", notes: null },
  { name: "Crème fraîche", category: "FOOD", quantity: 2, unit: "bouteilles", minQuantity: 1, location: "Réfrigérateur", notes: null },
  { name: "Confiture fraise", category: "FOOD", quantity: 4, unit: "pots", minQuantity: 2, location: "Placard cuisine", notes: null },
  { name: "Confiture abricot", category: "FOOD", quantity: 3, unit: "pots", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Nutella", category: "FOOD", quantity: 2, unit: "pots 750g", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Miel", category: "FOOD", quantity: 2, unit: "pots", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Café moulu", category: "FOOD", quantity: 3, unit: "paquets 250g", minQuantity: 2, location: "Placard cuisine", notes: "Café arabica" },
  { name: "Café en capsules", category: "FOOD", quantity: 40, unit: "capsules", minQuantity: 20, location: "Placard cuisine", notes: "Compatibles Nespresso" },
  { name: "Thé noir", category: "FOOD", quantity: 2, unit: "boîtes", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Chocolat chaud", category: "FOOD", quantity: 2, unit: "boîtes 500g", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Jus d'orange", category: "FOOD", quantity: 6, unit: "bouteilles 1L", minQuantity: 3, location: "Réserve", notes: "Pur jus sans sucre ajouté" },
  { name: "Jus de pomme", category: "FOOD", quantity: 4, unit: "bouteilles 1L", minQuantity: 2, location: "Réserve", notes: null },
  { name: "Sirop de grenadine", category: "FOOD", quantity: 1, unit: "bouteille", minQuantity: null, location: "Placard cuisine", notes: null },
  { name: "Pain de mie", category: "FOOD", quantity: 3, unit: "sachets", minQuantity: 2, location: "Placard cuisine", notes: "Remplacer si périmé" },
  { name: "Croissants surgelés", category: "FOOD", quantity: 20, unit: "unités", minQuantity: 10, location: "Congélateur", notes: null },
  { name: "Pains au chocolat surgelés", category: "FOOD", quantity: 15, unit: "unités", minQuantity: 8, location: "Congélateur", notes: null },
  { name: "Céréales", category: "FOOD", quantity: 2, unit: "boîtes", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Granola", category: "FOOD", quantity: 1, unit: "paquet 500g", minQuantity: null, location: "Placard cuisine", notes: null },
  { name: "Sel", category: "FOOD", quantity: 2, unit: "paquets", minQuantity: 1, location: "Placard cuisine", notes: null },
  { name: "Levure chimique", category: "FOOD", quantity: 3, unit: "sachets", minQuantity: 2, location: "Placard cuisine", notes: null },
  { name: "Huile de tournesol", category: "FOOD", quantity: 2, unit: "bouteilles 1L", minQuantity: 1, location: "Placard cuisine", notes: null },
  // Matériel
  { name: "Cafetière filtre", category: "EQUIPMENT", quantity: 2, unit: "unités", minQuantity: 1, location: "Cuisine — plan de travail", notes: "Capacité 12 tasses" },
  { name: "Machine Nespresso", category: "EQUIPMENT", quantity: 1, unit: "unités", minQuantity: 1, location: "Cuisine — plan de travail", notes: null },
  { name: "Bouilloire électrique", category: "EQUIPMENT", quantity: 2, unit: "unités", minQuantity: 1, location: "Cuisine", notes: null },
  { name: "Grille-pain", category: "EQUIPMENT", quantity: 2, unit: "unités", minQuantity: 1, location: "Cuisine", notes: null },
  { name: "Crêpière", category: "EQUIPMENT", quantity: 1, unit: "unités", minQuantity: 1, location: "Cuisine — placard bas", notes: null },
  { name: "Saladier inox grand", category: "EQUIPMENT", quantity: 4, unit: "unités", minQuantity: 2, location: "Cuisine — placard bas", notes: null },
  { name: "Fouet", category: "EQUIPMENT", quantity: 3, unit: "unités", minQuantity: 2, location: "Cuisine — tiroir ustensiles", notes: null },
  { name: "Spatule silicone", category: "EQUIPMENT", quantity: 4, unit: "unités", minQuantity: 2, location: "Cuisine — tiroir ustensiles", notes: null },
  { name: "Louche", category: "EQUIPMENT", quantity: 2, unit: "unités", minQuantity: 1, location: "Cuisine — tiroir ustensiles", notes: null },
  { name: "Tasses à café", category: "EQUIPMENT", quantity: 30, unit: "unités", minQuantity: 20, location: "Cuisine — étagère", notes: null },
  { name: "Verres à jus", category: "EQUIPMENT", quantity: 30, unit: "unités", minQuantity: 20, location: "Cuisine — étagère", notes: null },
  { name: "Assiettes plates", category: "EQUIPMENT", quantity: 40, unit: "unités", minQuantity: 20, location: "Cuisine — étagère", notes: null },
  { name: "Bols", category: "EQUIPMENT", quantity: 20, unit: "unités", minQuantity: 10, location: "Cuisine — étagère", notes: null },
  { name: "Couteaux à beurre", category: "EQUIPMENT", quantity: 25, unit: "unités", minQuantity: 15, location: "Cuisine — tiroir", notes: null },
  { name: "Petites cuillères", category: "EQUIPMENT", quantity: 30, unit: "unités", minQuantity: 20, location: "Cuisine — tiroir", notes: null },
  { name: "Plateaux de service", category: "EQUIPMENT", quantity: 6, unit: "unités", minQuantity: 3, location: "Cuisine — placard bas", notes: null },
  { name: "Table pliante", category: "EQUIPMENT", quantity: 4, unit: "unités", minQuantity: 2, location: "Réserve — fond", notes: null },
  { name: "Chaises pliantes", category: "EQUIPMENT", quantity: 20, unit: "unités", minQuantity: 10, location: "Réserve — fond", notes: null },
  // Décorations
  { name: "Nappes blanches", category: "DECORATION", quantity: 10, unit: "unités", minQuantity: 4, location: "Réserve — étagère textile", notes: "Tissu lavable" },
  { name: "Nappes colorées", category: "DECORATION", quantity: 8, unit: "unités", minQuantity: 3, location: "Réserve — étagère textile", notes: "Plusieurs couleurs" },
  { name: "Chemin de table doré", category: "DECORATION", quantity: 5, unit: "rouleaux", minQuantity: null, location: "Réserve — étagère textile", notes: null },
  { name: "Guirlandes lumineuses LED", category: "DECORATION", quantity: 6, unit: "unités", minQuantity: 3, location: "Réserve — bac déco", notes: "Piles incluses" },
  { name: "Guirlandes fanions", category: "DECORATION", quantity: 4, unit: "unités", minQuantity: 2, location: "Réserve — bac déco", notes: null },
  { name: "Ballons gonflables (blanc/bleu)", category: "DECORATION", quantity: 50, unit: "unités", minQuantity: 20, location: "Réserve — bac déco", notes: null },
  { name: "Pompons papier", category: "DECORATION", quantity: 12, unit: "unités", minQuantity: null, location: "Réserve — bac déco", notes: null },
  { name: "Photophores", category: "DECORATION", quantity: 15, unit: "unités", minQuantity: 5, location: "Réserve — bac déco", notes: null },
  { name: "Bougies chauffe-plat", category: "DECORATION", quantity: 30, unit: "unités", minQuantity: 10, location: "Réserve — bac déco", notes: null },
  { name: "Vases cylindriques", category: "DECORATION", quantity: 8, unit: "unités", minQuantity: null, location: "Réserve — bac déco", notes: "En verre transparent" },
  { name: "Confettis", category: "DECORATION", quantity: 5, unit: "paquets", minQuantity: 2, location: "Réserve — bac déco", notes: null },
  { name: "Banderole IIMPACT", category: "DECORATION", quantity: 2, unit: "unités", minQuantity: 1, location: "Réserve — bac déco", notes: "Logo officiel" },
  // Consommables
  { name: "Serviettes en papier blanches", category: "CONSUMABLE", quantity: 300, unit: "unités", minQuantity: 100, location: "Cuisine — placard", notes: null },
  { name: "Serviettes en papier colorées", category: "CONSUMABLE", quantity: 150, unit: "unités", minQuantity: 50, location: "Cuisine — placard", notes: null },
  { name: "Gobelets carton 25cl", category: "CONSUMABLE", quantity: 100, unit: "unités", minQuantity: 40, location: "Cuisine — placard", notes: "Pour les boissons chaudes" },
  { name: "Assiettes carton", category: "CONSUMABLE", quantity: 80, unit: "unités", minQuantity: 30, location: "Cuisine — placard", notes: null },
  { name: "Couverts jetables", category: "CONSUMABLE", quantity: 60, unit: "sets", minQuantity: 20, location: "Cuisine — placard", notes: "Couteau + fourchette + cuillère" },
  { name: "Film alimentaire", category: "CONSUMABLE", quantity: 2, unit: "rouleaux", minQuantity: 1, location: "Cuisine — tiroir", notes: null },
  { name: "Papier aluminium", category: "CONSUMABLE", quantity: 2, unit: "rouleaux", minQuantity: 1, location: "Cuisine — tiroir", notes: null },
  { name: "Sacs poubelle 50L", category: "CONSUMABLE", quantity: 30, unit: "unités", minQuantity: 15, location: "Placard ménage", notes: null },
  { name: "Éponges vaisselle", category: "CONSUMABLE", quantity: 6, unit: "unités", minQuantity: 3, location: "Placard ménage", notes: null },
  { name: "Liquide vaisselle", category: "CONSUMABLE", quantity: 2, unit: "bouteilles", minQuantity: 1, location: "Placard ménage", notes: null },
  { name: "Essuie-tout", category: "CONSUMABLE", quantity: 4, unit: "rouleaux", minQuantity: 2, location: "Cuisine", notes: null },
  { name: "Piques à brochettes", category: "CONSUMABLE", quantity: 50, unit: "unités", minQuantity: null, location: "Cuisine — tiroir", notes: "Pour les buffets" },
  { name: "Caissettes à muffins", category: "CONSUMABLE", quantity: 100, unit: "unités", minQuantity: 30, location: "Cuisine — placard", notes: null },
  { name: "Papier cuisson", category: "CONSUMABLE", quantity: 2, unit: "rouleaux", minQuantity: 1, location: "Cuisine — tiroir", notes: null },
];

// ─── Événements ───────────────────────────────────────────────────────────────

// IDs déterministes pour les événements (préfixe 0002)
const EVT = {
  GALA_2025:   "a1b2c3d4-0002-0000-0000-000000000001",
  BOARD_GAMES: "a1b2c3d4-0002-0000-0000-000000000002",
  FORUM_2026:  "a1b2c3d4-0002-0000-0000-000000000003",
  WE_BUREAU:   "a1b2c3d4-0002-0000-0000-000000000004",
  GALA_2026:   "a1b2c3d4-0002-0000-0000-000000000005",
  JPO_2026:    "a1b2c3d4-0002-0000-0000-000000000006",
};

// IDs déterministes pour les activités (préfixe 0003)
const ACT = {
  GALA25_DJ:       "a1b2c3d4-0003-0000-0000-000000000001",
  GALA25_BAR:      "a1b2c3d4-0003-0000-0000-000000000002",
  GALA25_BUFFET:   "a1b2c3d4-0003-0000-0000-000000000003",
  BG_TOURNOI:      "a1b2c3d4-0003-0000-0000-000000000004",
  BG_PIZZA:        "a1b2c3d4-0003-0000-0000-000000000005",
  FORUM_STAND:     "a1b2c3d4-0003-0000-0000-000000000006",
  FORUM_GOODIES:   "a1b2c3d4-0003-0000-0000-000000000007",
  FORUM_ANIM:      "a1b2c3d4-0003-0000-0000-000000000008",
  WE_ESCAPE:       "a1b2c3d4-0003-0000-0000-000000000009",
  WE_REPAS:        "a1b2c3d4-0003-0000-0000-000000000010",
  GALA26_CONCERT:  "a1b2c3d4-0003-0000-0000-000000000011",
  GALA26_BAR:      "a1b2c3d4-0003-0000-0000-000000000012",
  GALA26_BILLETS:  "a1b2c3d4-0003-0000-0000-000000000013",
  JPO_PRES:        "a1b2c3d4-0003-0000-0000-000000000014",
  JPO_ATELIERS:    "a1b2c3d4-0003-0000-0000-000000000015",
};

// IDs membres
const M = {
  SOPHIE:  "a1b2c3d4-0001-0000-0000-000000000001",
  LUCAS:   "a1b2c3d4-0001-0000-0000-000000000002",
  CAMILLE: "a1b2c3d4-0001-0000-0000-000000000003",
  ANTOINE: "a1b2c3d4-0001-0000-0000-000000000004",
  EMMA:    "a1b2c3d4-0001-0000-0000-000000000005",
  MAXIME:  "a1b2c3d4-0001-0000-0000-000000000006",
  LEA:     "a1b2c3d4-0001-0000-0000-000000000007",
  HUGO:    "a1b2c3d4-0001-0000-0000-000000000008",
  CHLOE:   "a1b2c3d4-0001-0000-0000-000000000009",
  THOMAS:  "a1b2c3d4-0001-0000-0000-000000000010",
  INES:    "a1b2c3d4-0001-0000-0000-000000000011",
  NATHAN:  "a1b2c3d4-0001-0000-0000-000000000012",
};

const events = [
  {
    id: EVT.GALA_2025,
    title: "Gala d'automne IIMPACT 2025",
    description: "Grande soirée annuelle avec animations, bar et buffet. Plus de 80 participants.",
    type: "EXTERNAL",
    status: "DONE",
    location: "Salle Confluence, Lyon",
    startsAt: new Date("2025-11-15"),
    endsAt: new Date("2025-11-15"),
  },
  {
    id: EVT.BOARD_GAMES,
    title: "Soirée board games de décembre",
    description: "Soirée jeux de société et pizza pour les membres de l'association.",
    type: "INTERNAL",
    status: "DONE",
    location: "Salle associative campus",
    startsAt: new Date("2025-12-12"),
    endsAt: new Date("2025-12-12"),
  },
  {
    id: EVT.FORUM_2026,
    title: "Forum des associations — printemps 2026",
    description: "Participation au forum des associations de l'université. Stand de présentation et vente de goodies.",
    type: "EXTERNAL",
    status: "DONE",
    location: "Hall principal — Université Lyon 1",
    startsAt: new Date("2026-03-20"),
    endsAt: new Date("2026-03-20"),
  },
  {
    id: EVT.WE_BUREAU,
    title: "Week-end cohésion bureau",
    description: "Week-end team building pour le bureau : escape game et repas d'équipe.",
    type: "INTERNAL",
    status: "IN_PROGRESS",
    location: "Lyon centre",
    startsAt: new Date("2026-07-05"),
    endsAt: new Date("2026-07-06"),
  },
  {
    id: EVT.GALA_2026,
    title: "Grand gala de fin d'année 2026",
    description: "Gala de fin d'année avec concert acoustique, bar et vente de billets. Objectif : 150 participants.",
    type: "EXTERNAL",
    status: "PLANNED",
    location: "Le Transbordeur, Villeurbanne",
    startsAt: new Date("2026-11-28"),
    endsAt: new Date("2026-11-28"),
  },
  {
    id: EVT.JPO_2026,
    title: "Journée portes ouvertes 2026",
    description: "Présentation de l'association aux nouveaux étudiants avec ateliers découverte.",
    type: "EXTERNAL",
    status: "DRAFT",
    location: null,
    startsAt: new Date("2026-09-08"),
    endsAt: new Date("2026-09-08"),
  },
];

// budgetCents = dépenses prévues de l'activité
// expectedRevenueCents = recettes prévues de l'activité
const activities = [
  // Gala automne 2025
  {
    id: ACT.GALA25_DJ,
    eventId: EVT.GALA_2025,
    title: "Animation DJ & danse",
    description: "DJ set de 4h avec piste de danse. Sonorisation incluse dans la prestation.",
    rules: null,
    prizes: null,
    budgetCents: 32000,
    expectedRevenueCents: 0,
  },
  {
    id: ACT.GALA25_BAR,
    eventId: EVT.GALA_2025,
    title: "Bar associatif",
    description: "Bar géré par les bénévoles. Boissons soft et alcoolisées.",
    rules: "Vérification des CNI obligatoire. Pas de vente après minuit.",
    prizes: null,
    budgetCents: 18000,
    expectedRevenueCents: 60000,
  },
  {
    id: ACT.GALA25_BUFFET,
    eventId: EVT.GALA_2025,
    title: "Buffet soirée",
    description: "Buffet traiteur inclus dans le prix d'entrée. Prévoir végétarien et sans gluten.",
    rules: null,
    prizes: null,
    budgetCents: 27000,
    expectedRevenueCents: 0,
  },

  // Board games
  {
    id: ACT.BG_TOURNOI,
    eventId: EVT.BOARD_GAMES,
    title: "Tournoi de Catan",
    description: "Tournoi en 4 parties avec finale. Classement par points.",
    rules: "Règles officielles Catan. 3 à 4 joueurs par table. Finale entre les 4 meilleurs.",
    prizes: "1er : carnet IIMPACT + goodies — 2e et 3e : goodies",
    budgetCents: 1500,
    expectedRevenueCents: 0,
  },
  {
    id: ACT.BG_PIZZA,
    eventId: EVT.BOARD_GAMES,
    title: "Atelier pizza & crêpes",
    description: "Moment convivial autour de pizzas maison et crêpes sucrées.",
    rules: null,
    prizes: null,
    budgetCents: 6000,
    expectedRevenueCents: 0,
  },

  // Forum associations
  {
    id: ACT.FORUM_STAND,
    eventId: EVT.FORUM_2026,
    title: "Stand IIMPACT",
    description: "Stand de présentation : roll-up, flyers, démo des activités. Inscription possible sur place.",
    rules: null,
    prizes: null,
    budgetCents: 5500,
    expectedRevenueCents: 0,
  },
  {
    id: ACT.FORUM_GOODIES,
    eventId: EVT.FORUM_2026,
    title: "Vente de goodies",
    description: "Vente de t-shirts, stickers et tote bags aux couleurs IIMPACT.",
    rules: null,
    prizes: null,
    budgetCents: 12000,
    expectedRevenueCents: 28000,
  },
  {
    id: ACT.FORUM_ANIM,
    eventId: EVT.FORUM_2026,
    title: "Mini-jeux d'animation",
    description: "Jeux rapides pour attirer les visiteurs au stand : quiz, palet, chamboule-tout.",
    rules: null,
    prizes: "Lot de goodies pour les gagnants",
    budgetCents: 4000,
    expectedRevenueCents: 0,
  },

  // Week-end cohésion bureau
  {
    id: ACT.WE_ESCAPE,
    eventId: EVT.WE_BUREAU,
    title: "Escape game",
    description: "Session d'escape game pour 10 personnes. Réservation confirmée.",
    rules: null,
    prizes: null,
    budgetCents: 22000,
    expectedRevenueCents: 0,
  },
  {
    id: ACT.WE_REPAS,
    eventId: EVT.WE_BUREAU,
    title: "Repas d'équipe",
    description: "Dîner collectif en restaurant samedi soir + déjeuner dimanche.",
    rules: null,
    prizes: null,
    budgetCents: 18000,
    expectedRevenueCents: 0,
  },

  // Grand gala 2026
  {
    id: ACT.GALA26_CONCERT,
    eventId: EVT.GALA_2026,
    title: "Concert acoustique",
    description: "Concert live de 2h avec un groupe local. Scène principale.",
    rules: null,
    prizes: null,
    budgetCents: 50000,
    expectedRevenueCents: 0,
  },
  {
    id: ACT.GALA26_BAR,
    eventId: EVT.GALA_2026,
    title: "Bar et restauration",
    description: "Bar et petite restauration (tapas) pendant la soirée.",
    rules: "Vérification des CNI. Arrêt des ventes à 1h.",
    prizes: null,
    budgetCents: 30000,
    expectedRevenueCents: 90000,
  },
  {
    id: ACT.GALA26_BILLETS,
    eventId: EVT.GALA_2026,
    title: "Vente de billets",
    description: "Billetterie en ligne + à la porte. Tarif préférentiel membres. Objectif 150 billets.",
    rules: "Tarif membre : 8€ — tarif public : 12€",
    prizes: null,
    budgetCents: 5000,
    expectedRevenueCents: 140000,
  },

  // JPO 2026
  {
    id: ACT.JPO_PRES,
    eventId: EVT.JPO_2026,
    title: "Présentation de l'association",
    description: "Slot de 20 min sur scène + questions/réponses.",
    rules: null,
    prizes: null,
    budgetCents: 3000,
    expectedRevenueCents: 0,
  },
  {
    id: ACT.JPO_ATELIERS,
    eventId: EVT.JPO_2026,
    title: "Ateliers découverte",
    description: "Ateliers de 30 min animés par chaque pôle pour présenter les activités de l'asso.",
    rules: null,
    prizes: null,
    budgetCents: 8000,
    expectedRevenueCents: 0,
  },
];

const staffAssignments = [
  // Gala 2025
  { eventId: EVT.GALA_2025, activityId: ACT.GALA25_DJ,     memberId: M.MAXIME },
  { eventId: EVT.GALA_2025, activityId: ACT.GALA25_DJ,     memberId: M.SOPHIE },
  { eventId: EVT.GALA_2025, activityId: ACT.GALA25_BAR,    memberId: M.CHLOE },
  { eventId: EVT.GALA_2025, activityId: ACT.GALA25_BAR,    memberId: M.INES },
  { eventId: EVT.GALA_2025, activityId: ACT.GALA25_BAR,    memberId: M.HUGO },
  { eventId: EVT.GALA_2025, activityId: ACT.GALA25_BUFFET, memberId: M.EMMA },
  { eventId: EVT.GALA_2025, activityId: ACT.GALA25_BUFFET, memberId: M.ANTOINE },
  // Board games
  { eventId: EVT.BOARD_GAMES, activityId: ACT.BG_TOURNOI, memberId: M.EMMA },
  { eventId: EVT.BOARD_GAMES, activityId: ACT.BG_TOURNOI, memberId: M.HUGO },
  { eventId: EVT.BOARD_GAMES, activityId: ACT.BG_PIZZA,   memberId: M.EMMA },
  // Forum
  { eventId: EVT.FORUM_2026, activityId: ACT.FORUM_STAND,   memberId: M.MAXIME },
  { eventId: EVT.FORUM_2026, activityId: ACT.FORUM_STAND,   memberId: M.SOPHIE },
  { eventId: EVT.FORUM_2026, activityId: ACT.FORUM_STAND,   memberId: M.LEA },
  { eventId: EVT.FORUM_2026, activityId: ACT.FORUM_GOODIES, memberId: M.CHLOE },
  { eventId: EVT.FORUM_2026, activityId: ACT.FORUM_GOODIES, memberId: M.THOMAS },
  { eventId: EVT.FORUM_2026, activityId: ACT.FORUM_ANIM,    memberId: M.INES },
  // Week-end bureau
  { eventId: EVT.WE_BUREAU, activityId: ACT.WE_ESCAPE, memberId: M.SOPHIE },
  { eventId: EVT.WE_BUREAU, activityId: ACT.WE_ESCAPE, memberId: M.LUCAS },
  { eventId: EVT.WE_BUREAU, activityId: ACT.WE_ESCAPE, memberId: M.ANTOINE },
  { eventId: EVT.WE_BUREAU, activityId: ACT.WE_ESCAPE, memberId: M.EMMA },
  { eventId: EVT.WE_BUREAU, activityId: ACT.WE_REPAS,  memberId: M.CAMILLE },
  // Grand gala 2026
  { eventId: EVT.GALA_2026, activityId: ACT.GALA26_CONCERT, memberId: M.MAXIME },
  { eventId: EVT.GALA_2026, activityId: ACT.GALA26_CONCERT, memberId: M.LEA },
  { eventId: EVT.GALA_2026, activityId: ACT.GALA26_BAR,     memberId: M.CHLOE },
  { eventId: EVT.GALA_2026, activityId: ACT.GALA26_BAR,     memberId: M.HUGO },
  { eventId: EVT.GALA_2026, activityId: ACT.GALA26_BAR,     memberId: M.INES },
  { eventId: EVT.GALA_2026, activityId: ACT.GALA26_BILLETS, memberId: M.ANTOINE },
  { eventId: EVT.GALA_2026, activityId: ACT.GALA26_BILLETS, memberId: M.THOMAS },
];

// Entrées budget réelles pour les événements terminés
const budgetEntries = [
  // ── Gala automne 2025 (DONE) ──
  {
    eventId: EVT.GALA_2025,
    activityId: ACT.GALA25_BAR,
    type: "REVENUE",
    label: "Recettes bar soirée",
    amountCents: 58500,
    occurredAt: new Date("2025-11-15"),
  },
  {
    eventId: EVT.GALA_2025,
    activityId: null,
    type: "REVENUE",
    label: "Vente de billets d'entrée",
    amountCents: 87000,
    occurredAt: new Date("2025-11-10"),
  },
  {
    eventId: EVT.GALA_2025,
    activityId: ACT.GALA25_DJ,
    type: "EXPENSE",
    label: "Prestation DJ & sonorisation",
    amountCents: 32000,
    occurredAt: new Date("2025-11-15"),
  },
  {
    eventId: EVT.GALA_2025,
    activityId: null,
    type: "EXPENSE",
    label: "Location salle Confluence",
    amountCents: 40000,
    occurredAt: new Date("2025-11-01"),
  },
  {
    eventId: EVT.GALA_2025,
    activityId: ACT.GALA25_BUFFET,
    type: "EXPENSE",
    label: "Traiteur buffet soirée",
    amountCents: 26500,
    occurredAt: new Date("2025-11-15"),
  },
  {
    eventId: EVT.GALA_2025,
    activityId: ACT.GALA25_BAR,
    type: "EXPENSE",
    label: "Approvisionnement bar",
    amountCents: 17800,
    occurredAt: new Date("2025-11-14"),
  },
  {
    eventId: EVT.GALA_2025,
    activityId: null,
    type: "EXPENSE",
    label: "Décoration salle",
    amountCents: 8200,
    occurredAt: new Date("2025-11-15"),
  },

  // ── Soirée board games (DONE) ──
  {
    eventId: EVT.BOARD_GAMES,
    activityId: ACT.BG_PIZZA,
    type: "EXPENSE",
    label: "Ingrédients pizza et crêpes",
    amountCents: 5800,
    occurredAt: new Date("2025-12-12"),
  },
  {
    eventId: EVT.BOARD_GAMES,
    activityId: ACT.BG_TOURNOI,
    type: "EXPENSE",
    label: "Lots tournoi Catan",
    amountCents: 1400,
    occurredAt: new Date("2025-12-12"),
  },

  // ── Forum associations printemps 2026 (DONE) ──
  {
    eventId: EVT.FORUM_2026,
    activityId: ACT.FORUM_GOODIES,
    type: "REVENUE",
    label: "Vente goodies stand",
    amountCents: 31200,
    occurredAt: new Date("2026-03-20"),
  },
  {
    eventId: EVT.FORUM_2026,
    activityId: ACT.FORUM_GOODIES,
    type: "EXPENSE",
    label: "Fabrication t-shirts et stickers",
    amountCents: 11500,
    occurredAt: new Date("2026-03-10"),
  },
  {
    eventId: EVT.FORUM_2026,
    activityId: ACT.FORUM_STAND,
    type: "EXPENSE",
    label: "Impression flyers et roll-up",
    amountCents: 5200,
    occurredAt: new Date("2026-03-15"),
  },
  {
    eventId: EVT.FORUM_2026,
    activityId: ACT.FORUM_ANIM,
    type: "EXPENSE",
    label: "Matériel mini-jeux",
    amountCents: 3800,
    occurredAt: new Date("2026-03-18"),
  },

  // ── Grand gala 2026 (PLANNED — prévision de dépense hors budget activité) ──
  {
    eventId: EVT.GALA_2026,
    activityId: ACT.GALA26_CONCERT,
    type: "FORECAST",
    label: "Supplément cachet groupe musical (négociation en cours)",
    amountCents: 10000,
    occurredAt: null,
  },
];

const eventRegistrations = [
  { eventId: EVT.GALA_2025,   memberId: M.NATHAN },
  { eventId: EVT.BOARD_GAMES, memberId: M.HUGO },
  { eventId: EVT.BOARD_GAMES, memberId: M.INES },
  { eventId: EVT.BOARD_GAMES, memberId: M.THOMAS },
  { eventId: EVT.BOARD_GAMES, memberId: M.NATHAN },
  { eventId: EVT.GALA_2026,   memberId: M.HUGO },
  { eventId: EVT.GALA_2026,   memberId: M.THOMAS },
  { eventId: EVT.GALA_2026,   memberId: M.CHLOE },
];

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await resetDatabase();

  // Membres
  for (const member of seedMembers) {
    await seedMember(member);
  }
  console.log(`${seedMembers.length} membres créés.`);

  // Inventaire
  for (const item of inventoryItems) {
    await prisma.inventoryItem.create({ data: item });
  }
  console.log(`${inventoryItems.length} articles d'inventaire créés.`);

  // Événements
  for (const event of events) {
    await prisma.event.create({ data: event });
  }
  console.log(`${events.length} événements créés.`);

  // Activités
  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }
  console.log(`${activities.length} activités créées.`);

  // Assignations staff
  for (const assignment of staffAssignments) {
    await prisma.staffAssignment.create({ data: assignment });
  }
  console.log(`${staffAssignments.length} assignations staff créées.`);

  // Entrées budget
  for (const entry of budgetEntries) {
    await prisma.budgetEntry.create({ data: entry });
  }
  console.log(`${budgetEntries.length} entrées budget créées.`);

  // Inscriptions
  for (const reg of eventRegistrations) {
    await prisma.eventRegistration.create({ data: reg });
  }
  console.log(`${eventRegistrations.length} inscriptions créées.`);

  console.log(`\nMot de passe initial : ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

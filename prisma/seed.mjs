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

async function upsertMember(member) {
  const existingMember = await prisma.member.findUnique({
    where: { email: member.email },
    select: { id: true },
  });

  const data = {
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
  };
  const memberPoles = member.poles.map((pole) => ({ pole }));

  if (existingMember) {
    return prisma.member.update({
      where: { id: existingMember.id },
      data: {
        ...data,
        memberPoles: {
          deleteMany: {},
          create: memberPoles,
        },
      },
    });
  }

  return prisma.member.create({
    data: {
      id: member.id,
      ...data,
      passwordHash: await hashPassword(defaultPassword),
      memberPoles: {
        create: memberPoles,
      },
    },
  });
}

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

async function upsertInventoryItem(item) {
  const existing = await prisma.inventoryItem.findFirst({
    where: { name: item.name, category: item.category },
    select: { id: true },
  });

  if (existing) {
    return prisma.inventoryItem.update({
      where: { id: existing.id },
      data: item,
    });
  }

  return prisma.inventoryItem.create({ data: item });
}

async function main() {
  for (const member of seedMembers) {
    await upsertMember(member);
  }
  console.log(`${seedMembers.length} membres de depart synchronises.`);

  for (const item of inventoryItems) {
    await upsertInventoryItem(item);
  }
  console.log(`${inventoryItems.length} articles d'inventaire synchronises.`);

  console.log(`Mot de passe initial local: ${defaultPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

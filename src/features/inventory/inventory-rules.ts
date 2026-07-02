export type InventoryCategory =
  | "FOOD"
  | "EQUIPMENT"
  | "DECORATION"
  | "CONSUMABLE"
  | "OTHER";

export const inventoryCategoryValues: InventoryCategory[] = [
  "FOOD",
  "EQUIPMENT",
  "DECORATION",
  "CONSUMABLE",
  "OTHER",
];

export const inventoryCategoryLabels: Record<InventoryCategory, string> = {
  FOOD: "Aliments",
  EQUIPMENT: "Matériel",
  DECORATION: "Décorations",
  CONSUMABLE: "Consommables",
  OTHER: "Autre",
};

export const inventoryCategoryEmoji: Record<InventoryCategory, string> = {
  FOOD: "🥐",
  EQUIPMENT: "☕",
  DECORATION: "🎉",
  CONSUMABLE: "🧻",
  OTHER: "📦",
};

export const inventoryCategoryStyles: Record<InventoryCategory, string> = {
  FOOD: "bg-amber-50 text-amber-700 ring-amber-200",
  EQUIPMENT: "bg-blue-50 text-blue-700 ring-blue-200",
  DECORATION: "bg-rose-50 text-rose-700 ring-rose-200",
  CONSUMABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OTHER: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export const commonUnits = [
  "unités",
  "kg",
  "g",
  "litres",
  "cl",
  "paquets",
  "boîtes",
  "rouleaux",
  "sachets",
  "bouteilles",
];

export { isLowStock } from "./scripts/inventory-scripts";

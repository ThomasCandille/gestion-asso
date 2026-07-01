import { z } from "zod";
import { inventoryCategoryValues } from "./inventory-rules";

export const inventoryItemFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  category: z.enum(inventoryCategoryValues as [string, ...string[]]),
  quantity: z
    .string()
    .regex(/^\d+$/, "La quantité doit être un entier positif")
    .transform(Number),
  unit: z.string().max(30).optional(),
  minQuantity: z
    .string()
    .regex(/^\d+$/, "Le seuil doit être un entier positif")
    .transform(Number)
    .optional()
    .or(z.literal("")),
  location: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type InventoryItemFormInput = {
  name: string;
  category: string;
  quantity: string;
  unit: string;
  minQuantity: string;
  location: string;
  notes: string;
};

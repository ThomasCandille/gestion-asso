import { z } from "zod";

export const activityFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Le titre doit faire au moins 2 caracteres."),
  description: z.string().trim().optional(),
  rules: z.string().trim().optional(),
  prizes: z.string().trim().optional(),
  budgetEuros: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, "Montant invalide (ex: 150 ou 150.50).")
    .optional()
    .default("0"),
  expectedRevenueEuros: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, "Montant invalide (ex: 150 ou 150.50).")
    .optional()
    .default("0"),
});

export type ActivityFormInput = z.infer<typeof activityFormSchema>;

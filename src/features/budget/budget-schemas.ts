import { z } from "zod";

export const budgetEntryFormSchema = z.object({
  type: z.enum(["REVENUE", "EXPENSE", "FORECAST"]),
  label: z.string().min(1, "Le libellé est obligatoire.").max(200),
  amountEuros: z
    .string()
    .min(1, "Le montant est obligatoire.")
    .refine(
      (v) => !isNaN(parseFloat(v.replace(",", "."))) && parseFloat(v.replace(",", ".")) >= 0,
      "Le montant doit être un nombre positif.",
    ),
  occurredAt: z.string().optional(),
  eventId: z.string().optional(),
  activityId: z.string().optional(),
});

export type BudgetEntryFormInput = z.infer<typeof budgetEntryFormSchema>;

export const budgetFiltersSchema = z.object({
  type: z.enum(["REVENUE", "EXPENSE", "FORECAST"]).optional(),
  eventId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type BudgetFilters = z.infer<typeof budgetFiltersSchema>;

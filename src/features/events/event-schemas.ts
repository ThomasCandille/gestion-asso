import { z } from "zod";
import { eventTypeValues, eventStatusValues } from "./event-rules";

export const eventTypeSchema = z.enum(eventTypeValues);
export const eventStatusSchema = z.enum(eventStatusValues);

export const eventFiltersSchema = z.object({
  search: z.string().optional(),
  type: eventTypeSchema.optional(),
  status: eventStatusSchema.optional(),
});

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Le titre doit faire au moins 2 caracteres."),
    description: z.string().trim().optional(),
    type: eventTypeSchema,
    status: eventStatusSchema.default("DRAFT"),
    location: z.string().trim().optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    budgetEuros: z
      .string()
      .regex(
        /^\d+([.,]\d{1,2})?$/,
        "Montant invalide (ex: 150 ou 150.50).",
      )
      .optional()
      .default("0"),
  })
  .refine(
    (data) => {
      if (data.startsAt && data.endsAt && data.startsAt > data.endsAt) {
        return false;
      }
      return true;
    },
    {
      message: "La date de fin doit etre apres la date de debut.",
      path: ["endsAt"],
    },
  );

export type EventFilters = z.infer<typeof eventFiltersSchema>;
export type EventFormInput = z.infer<typeof eventFormSchema>;

import { z } from "zod";
import {
  isOfficeRole,
  memberRoleValues,
  memberStatusValues,
  poleValues,
  yearValues,
} from "./member-rules";

export const poleSchema = z.enum(poleValues);
export const memberYearSchema = z.enum(yearValues);
export const memberRoleSchema = z.enum(memberRoleValues);
export const memberStatusSchema = z.enum(memberStatusValues);

export const memberFiltersSchema = z.object({
  search: z.string().optional(),
  pole: poleSchema.optional(),
  role: memberRoleSchema.optional(),
  status: memberStatusSchema.optional(),
  year: z.string().optional(),
});

export const memberFormSchema = z
  .object({
    firstName: z.string().trim().min(1, "Le prenom est obligatoire."),
    lastName: z.string().trim().min(1, "Le nom est obligatoire."),
    email: z.string().trim().email("Email invalide."),
    phone: z
      .string()
      .trim()
      .min(10, "Le telephone est obligatoire.")
      .max(20, "Numero de telephone trop long.")
      .regex(/^[\d\s+\-().]+$/, "Format de numero invalide."),
    year: memberYearSchema,
    status: memberStatusSchema.default("ACTIVE"),
    role: memberRoleSchema.default("MEMBER"),
    poles: z.array(poleSchema).default([]),
    photoUrl: z
      .string()
      .trim()
      .url("URL de photo invalide.")
      .or(z.literal(""))
      .optional(),
    joinedAt: z.string().optional(),
    internalNotes: z.string().trim().optional(),
    discordUsername: z.string().trim().optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit faire au moins 8 caracteres.")
      .or(z.literal(""))
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (isOfficeRole(value.role) && value.poles.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["poles"],
        message: "Les membres du bureau ne sont pas rattaches a un pole.",
      });
    }

    if (!isOfficeRole(value.role) && value.poles.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["poles"],
        message: "Un membre hors bureau doit appartenir a au moins un pole.",
      });
    }
  });

export type MemberFilters = z.infer<typeof memberFiltersSchema>;
export type MemberFormInput = z.infer<typeof memberFormSchema>;

export const memberSelfProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Le prenom est obligatoire."),
  lastName: z.string().trim().min(1, "Le nom est obligatoire."),
  email: z.string().trim().email("Email invalide."),
  phone: z
    .string()
    .trim()
    .min(10, "Le telephone est obligatoire.")
    .max(20, "Numero de telephone trop long.")
    .regex(/^[\d\s+\-().]+$/, "Format de numero invalide."),
  photoUrl: z
    .string()
    .trim()
    .url("URL de photo invalide.")
    .or(z.literal(""))
    .optional(),
  discordUsername: z.string().trim().optional(),
});

export type MemberSelfProfileInput = z.infer<typeof memberSelfProfileSchema>;

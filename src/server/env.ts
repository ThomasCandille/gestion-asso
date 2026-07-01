import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      "postgresql://postgres:postgres@localhost:5432/gestion_asso?schema=public",
    ),
  AUTH_SECRET: z.string().min(32).optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  ENABLE_DEV_SESSION: z.enum(["true", "false"]).default("false"),
  DEV_SESSION_EMAIL: z.string().email().default("alex.martin@iimpact.fr"),
  SEED_MEMBER_PASSWORD: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  GOOGLE_DRIVE_GLOBAL_FOLDER_ID: z.string().optional(),
  GOOGLE_DRIVE_BUREAU_FOLDER_ID: z.string().optional(),
  GOOGLE_DRIVE_CA_FOLDER_ID: z.string().optional(),
  GOOGLE_DRIVE_POLE_EXTERNE_FOLDER_ID: z.string().optional(),
  GOOGLE_DRIVE_POLE_INTERNE_FOLDER_ID: z.string().optional(),
  GOOGLE_DRIVE_POLE_COMMUNICATION_FOLDER_ID: z.string().optional(),
  GOOGLE_DRIVE_MEDIA_FOLDER_ID: z.string().optional(),
  GOOGLE_DRIVE_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_MEMBERS_SHEET_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);

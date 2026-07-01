import { z } from "zod";

export const campaignFormSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire.").max(200),
  description: z.string().max(1000).optional(),
  eventId: z.string().min(1, "L'événement est obligatoire."),
  status: z.enum(["IDEA", "DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "CANCELLED"]),
});

export type CampaignFormInput = z.infer<typeof campaignFormSchema>;

export const postFormSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire.").max(200),
  postType: z.enum(["POST", "REEL", "STORY", "CAROUSEL"]),
  status: z.enum(["IDEA", "DRAFT", "IN_REVIEW", "SCHEDULED", "PUBLISHED", "CANCELLED"]),
  content: z.string().max(2200).optional(),
  mediaDescription: z.string().max(1000).optional(),
  scheduledAt: z.string().optional(),
  authorId: z.string().optional(),
});

export type PostFormInput = z.infer<typeof postFormSchema>;

import { env } from "@/server/env";
import type { CampaignDto } from "@/features/communication/comm-service";
import { eventTypeLabels, eventStatusLabels } from "@/features/events/event-rules";
import type { CommunicationStatus } from "@/features/communication/comm-rules";
import { communicationStatusLabels } from "@/features/communication/comm-rules";
import { buildSheet, formatDate, SHEET_COLORS } from "./sheet-builder";

export async function createCampaignSheet(
  campaign: CampaignDto,
): Promise<{ sheetId: string; sheetUrl: string } | null> {
  const folderId = env.GOOGLE_DRIVE_POLE_COMMUNICATION_FOLDER_ID ?? null;
  if (!folderId) return null;

  const postRows: string[][] =
    campaign.posts.length === 0
      ? [["–", ""]]
      : [
          ["Titre", "Type · Statut · Date prévue"],
          ...campaign.posts.map((post) => [
            post.title,
            [
              post.postType,
              communicationStatusLabels[post.status as CommunicationStatus] ?? post.status,
              formatDate(post.scheduledAt),
            ].join(" · "),
          ]),
        ];

  const data: string[][] = [
    [`PLAN DE COMMUNICATION — ${campaign.title}`, ""],
    ["", ""],
    ["ÉVÉNEMENT LIÉ", ""],
    ["Titre", campaign.eventTitle],
    ["Type", eventTypeLabels[campaign.eventType as "INTERNAL" | "EXTERNAL"] ?? campaign.eventType],
    ["Date", formatDate(campaign.eventStartsAt)],
    ["Statut événement", eventStatusLabels[campaign.eventStatus as "DRAFT" | "PLANNED" | "IN_PROGRESS" | "DONE" | "CANCELED"] ?? campaign.eventStatus],
    ["", ""],
    ["CAMPAGNE", ""],
    ["Titre", campaign.title],
    ["Description", campaign.description ?? "–"],
    ["Statut", communicationStatusLabels[campaign.status as CommunicationStatus] ?? campaign.status],
    ["Créée le", formatDate(campaign.createdAt)],
    ["", ""],
    ["PUBLICATIONS PRÉVUES", ""],
    ...postRows,
    ["", ""],
    ["MÉTADONNÉES", ""],
    ["Identifiant campagne", campaign.id],
    ["ID événement", campaign.eventId],
  ];

  const postsOffset = postRows.length;

  return buildSheet({
    name: `Plan de com — ${campaign.title}`,
    folderId,
    data,
    headerRows: [0, 2, 8, 14, 15 + postsOffset],
    headerColor: SHEET_COLORS.green,
    colWidths: [220, 420],
  });
}

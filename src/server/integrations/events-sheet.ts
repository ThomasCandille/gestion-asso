import type { EventDto } from "@/features/events/event-service";
import { eventTypeLabels, eventStatusLabels } from "@/features/events/event-rules";
import { buildSheet, formatDate, formatBudget, getEventFolderId, SHEET_COLORS } from "./sheet-builder";

export async function createEventSheet(
  event: EventDto,
): Promise<{ sheetId: string; sheetUrl: string } | null> {
  const folderId = getEventFolderId(event.type);
  if (!folderId) return null;

  const data = [
    [`ÉVÉNEMENT — ${event.title}`, ""],
    ["", ""],
    ["INFORMATIONS GÉNÉRALES", ""],
    ["Titre", event.title],
    ["Type", eventTypeLabels[event.type] ?? event.type],
    ["Statut", eventStatusLabels[event.status] ?? event.status],
    ["Lieu", event.location ?? "–"],
    ["", ""],
    ["PLANNING", ""],
    ["Date de début", formatDate(event.startsAt)],
    ["Date de fin", formatDate(event.endsAt)],
    ["", ""],
    ["BUDGET", ""],
    ["Budget prévisionnel", formatBudget(event.budgetCents)],
    ["", ""],
    ["DESCRIPTION", ""],
    ["Description", event.description ?? "–"],
    ["", ""],
    ["MÉTADONNÉES", ""],
    ["Identifiant", event.id],
    ["Créé le", formatDate(event.createdAt)],
  ];

  return buildSheet({
    name: `Événement — ${event.title}`,
    folderId,
    data,
    headerRows: [0, 2, 8, 12, 16, 18],
    headerColor: SHEET_COLORS.blue,
  });
}

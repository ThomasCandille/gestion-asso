import type { ActivityDto } from "@/features/events/activity-service";
import type { EventType } from "@/features/events/event-rules";
import { eventTypeLabels } from "@/features/events/event-rules";
import { buildSheet, formatBudget, getEventFolderId, SHEET_COLORS } from "./sheet-builder";

export async function createActivitySheet(
  activity: ActivityDto,
  eventTitle: string,
  eventType: EventType,
): Promise<{ sheetId: string; sheetUrl: string } | null> {
  const folderId = getEventFolderId(eventType);
  if (!folderId) return null;

  const staffRows: string[][] =
    activity.staff.length > 0
      ? activity.staff.map((s) => [`${s.firstName} ${s.lastName}`, s.memberId])
      : [["–", ""]];

  const data: string[][] = [
    [`ACTIVITÉ — ${activity.title}`, ""],
    ["", ""],
    ["ÉVÉNEMENT PARENT", ""],
    ["Titre de l'événement", eventTitle],
    ["Type d'événement", eventTypeLabels[eventType] ?? eventType],
    ["", ""],
    ["INFORMATIONS", ""],
    ["Titre", activity.title],
    ["Description", activity.description ?? "–"],
    ["", ""],
    ["RÈGLES ET LOTS", ""],
    ["Règles", activity.rules ?? "–"],
    ["Lots", activity.prizes ?? "–"],
    ["", ""],
    ["BUDGET", ""],
    ["Budget prévisionnel", formatBudget(activity.budgetCents)],
    ["", ""],
    ["STAFF", ""],
    ...staffRows,
    ["", ""],
    ["MÉTADONNÉES", ""],
    ["Identifiant", activity.id],
    ["ID Événement", activity.eventId],
  ];

  const staffOffset = staffRows.length;

  return buildSheet({
    name: `Activité — ${activity.title}`,
    folderId,
    data,
    headerRows: [0, 2, 6, 10, 14, 17, 19 + staffOffset],
    headerColor: SHEET_COLORS.blue,
  });
}

import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import type { AppSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import type { EventType } from "./event-rules";
import { activityFormSchema } from "./activity-schemas";

const activityInclude = {
  staff: {
    select: {
      memberId: true,
      member: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  },
} satisfies Prisma.ActivityInclude;

type ActivityRow = Prisma.ActivityGetPayload<{
  include: typeof activityInclude;
}>;

export type ActivityDto = {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  rules: string | null;
  prizes: string | null;
  budgetCents: number;
  staff: { memberId: string; firstName: string; lastName: string }[];
  createdAt: string;
  updatedAt: string;
};

export class ActivityPermissionError extends Error {
  constructor(message = "Action activite non autorisee.") {
    super(message);
    this.name = "ActivityPermissionError";
  }
}

export class ActivityRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActivityRuleError";
  }
}

function toActivityDto(activity: ActivityRow): ActivityDto {
  return {
    id: activity.id,
    eventId: activity.eventId,
    title: activity.title,
    description: activity.description,
    rules: activity.rules,
    prizes: activity.prizes,
    budgetCents: activity.budgetCents,
    staff: activity.staff.map((s) => ({
      memberId: s.memberId,
      firstName: s.member.firstName,
      lastName: s.member.lastName,
    })),
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  };
}

function assertCanManageActivities(actor: AppSession, eventType: EventType) {
  if (!hasPermission(actor.role, "events:manage")) {
    throw new ActivityPermissionError();
  }
  if (actor.role === "POLE_LEAD") {
    const allowed =
      (eventType === "INTERNAL" && actor.poles.includes("INTERNE")) ||
      (eventType === "EXTERNAL" && actor.poles.includes("EXTERNE"));
    if (!allowed) {
      throw new ActivityPermissionError(
        "Vous n'avez pas acces aux activites de ce type d'evenement.",
      );
    }
  }
}

function canRegisterAsStaff(actor: AppSession, eventType: EventType): boolean {
  if (hasPermission(actor.role, "events:manage")) return true;
  if (eventType === "EXTERNAL") return true;
  if (eventType === "INTERNAL") return actor.poles.includes("INTERNE");
  return false;
}

function parseBudgetCents(budgetEuros: string): number {
  const value = parseFloat(budgetEuros.replace(",", "."));
  return isNaN(value) ? 0 : Math.round(value * 100);
}

async function getEventType(eventId: string): Promise<EventType> {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { type: true },
  });
  return event.type as EventType;
}

export async function listActivities(eventId: string) {
  const activities = await prisma.activity.findMany({
    where: { eventId },
    include: activityInclude,
    orderBy: { createdAt: "asc" },
  });
  return activities.map(toActivityDto);
}

export async function createActivity(
  actor: AppSession,
  eventId: string,
  input: unknown,
) {
  const eventType = await getEventType(eventId);
  assertCanManageActivities(actor, eventType);

  const parsed = activityFormSchema.parse(input);

  const activity = await prisma.activity.create({
    data: {
      eventId,
      title: parsed.title,
      description: parsed.description || null,
      rules: parsed.rules || null,
      prizes: parsed.prizes || null,
      budgetCents: parseBudgetCents(parsed.budgetEuros),
    },
    include: activityInclude,
  });

  return toActivityDto(activity);
}

export async function updateActivity(
  actor: AppSession,
  eventId: string,
  activityId: string,
  input: unknown,
) {
  const eventType = await getEventType(eventId);
  assertCanManageActivities(actor, eventType);

  const parsed = activityFormSchema.parse(input);

  const activity = await prisma.activity.update({
    where: { id: activityId, eventId },
    data: {
      title: parsed.title,
      description: parsed.description || null,
      rules: parsed.rules || null,
      prizes: parsed.prizes || null,
      budgetCents: parseBudgetCents(parsed.budgetEuros),
    },
    include: activityInclude,
  });

  return toActivityDto(activity);
}

export async function deleteActivity(
  actor: AppSession,
  eventId: string,
  activityId: string,
) {
  const eventType = await getEventType(eventId);
  assertCanManageActivities(actor, eventType);

  await prisma.activity.delete({ where: { id: activityId, eventId } });
}

export async function registerAsStaff(
  actor: AppSession,
  eventId: string,
  activityId: string,
  targetMemberId?: string,
) {
  const eventType = await getEventType(eventId);
  const memberId = targetMemberId ?? actor.memberId;

  if (memberId !== actor.memberId) {
    assertCanManageActivities(actor, eventType);
  } else if (!canRegisterAsStaff(actor, eventType)) {
    throw new ActivityPermissionError(
      "Vous n'etes pas autorise a vous inscrire comme staff sur cet evenement.",
    );
  }

  const existing = await prisma.staffAssignment.findFirst({
    where: { activityId, memberId },
  });

  if (existing) {
    throw new ActivityRuleError(
      memberId === actor.memberId
        ? "Vous etes deja inscrit comme staff sur cette activite."
        : "Ce membre est deja inscrit comme staff sur cette activite.",
    );
  }

  await prisma.staffAssignment.create({
    data: { eventId, activityId, memberId },
  });

  const activity = await prisma.activity.findUniqueOrThrow({
    where: { id: activityId },
    include: activityInclude,
  });

  return toActivityDto(activity);
}

export async function unregisterAsStaff(
  actor: AppSession,
  eventId: string,
  activityId: string,
  memberId: string,
) {
  const eventType = await getEventType(eventId);

  const isSelf = actor.memberId === memberId;
  const canManage = hasPermission(actor.role, "events:manage") &&
    (actor.role !== "POLE_LEAD" ||
      (eventType === "INTERNAL" && actor.poles.includes("INTERNE")) ||
      (eventType === "EXTERNAL" && actor.poles.includes("EXTERNE")));

  if (!isSelf && !canManage) {
    throw new ActivityPermissionError(
      "Vous ne pouvez pas desinscrire un autre membre.",
    );
  }

  await prisma.staffAssignment.deleteMany({
    where: { activityId, memberId },
  });

  const activity = await prisma.activity.findUniqueOrThrow({
    where: { id: activityId },
    include: activityInclude,
  });

  return toActivityDto(activity);
}

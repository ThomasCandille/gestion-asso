import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import type { AppSession } from "@/server/auth/session";
import { hasPermission } from "@/server/permissions";
import type { EventType } from "../events/event-rules";
import { parseEurosToCents } from "@/lib/formats";
import type { BudgetEntryType } from "./budget-rules";
import {
  budgetEntryFormSchema,
  budgetFiltersSchema,
  type BudgetFilters,
} from "./budget-schemas";

export type { EventForecastRow, BudgetForecast } from "./budget-forecast-service";
export { getBudgetForecast } from "./budget-forecast-service";

const entrySelect = {
  id: true,
  type: true,
  label: true,
  amountCents: true,
  occurredAt: true,
  createdAt: true,
  eventId: true,
  activityId: true,
  event: { select: { id: true, title: true, type: true } },
  activity: { select: { id: true, title: true } },
} satisfies Prisma.BudgetEntrySelect;

type EntryRow = Prisma.BudgetEntryGetPayload<{ select: typeof entrySelect }>;

export type BudgetEntryDto = {
  id: string;
  type: BudgetEntryType;
  label: string;
  amountCents: number;
  occurredAt: string | null;
  createdAt: string;
  eventId: string | null;
  eventTitle: string | null;
  activityId: string | null;
  activityTitle: string | null;
};

export type BudgetSummary = {
  revenueCents: number;
  expenseCents: number;
  forecastCents: number;
  balanceCents: number;
  forecastBalanceCents: number;
};

export type EventBudgetRow = {
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  allocatedCents: number;
  revenueCents: number;
  expenseCents: number;
  forecastCents: number;
  balanceCents: number;
};


export class BudgetPermissionError extends Error {
  constructor(message = "Action budget non autorisée.") {
    super(message);
    this.name = "BudgetPermissionError";
  }
}

function assertCanManage(actor: AppSession) {
  if (!hasPermission(actor.role, "budget:manage")) {
    throw new BudgetPermissionError();
  }
}

function toEntryDto(row: EntryRow): BudgetEntryDto {
  return {
    id: row.id,
    type: row.type as BudgetEntryType,
    label: row.label,
    amountCents: row.amountCents,
    occurredAt: row.occurredAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    eventId: row.eventId,
    eventTitle: row.event?.title ?? null,
    activityId: row.activityId,
    activityTitle: row.activity?.title ?? null,
  };
}



export async function listBudgetEntries(filters: BudgetFilters = {}): Promise<BudgetEntryDto[]> {
  const f = budgetFiltersSchema.parse(filters);

  const where: Prisma.BudgetEntryWhereInput = {
    type: f.type,
    eventId: f.eventId,
    occurredAt: f.from || f.to
      ? {
          gte: f.from ? new Date(f.from) : undefined,
          lte: f.to ? new Date(f.to) : undefined,
        }
      : undefined,
  };

  const rows = await prisma.budgetEntry.findMany({
    where,
    select: entrySelect,
    orderBy: [
      { occurredAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
  });

  return rows.map(toEntryDto);
}

export async function getBudgetSummary(): Promise<BudgetSummary> {
  const groups = await prisma.budgetEntry.groupBy({
    by: ["type"],
    _sum: { amountCents: true },
  });

  const byType = Object.fromEntries(
    groups.map((g) => [g.type, g._sum.amountCents ?? 0]),
  );

  const revenueCents = byType["REVENUE"] ?? 0;
  const expenseCents = byType["EXPENSE"] ?? 0;
  const forecastCents = byType["FORECAST"] ?? 0;

  return {
    revenueCents,
    expenseCents,
    forecastCents,
    balanceCents: revenueCents - expenseCents,
    forecastBalanceCents: revenueCents - expenseCents - forecastCents,
  };
}

export async function getEventBudgetBreakdown(): Promise<EventBudgetRow[]> {
  const events = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      activities: { select: { budgetCents: true, expectedRevenueCents: true } },
      budgetEntries: {
        select: { type: true, amountCents: true },
      },
    },
    orderBy: [{ startsAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });

  return events.map((event) => {
    let revenueCents = 0;
    let expenseCents = 0;
    let forecastCents = 0;

    for (const entry of event.budgetEntries) {
      if (entry.type === "REVENUE") revenueCents += entry.amountCents;
      else if (entry.type === "EXPENSE") expenseCents += entry.amountCents;
      else if (entry.type === "FORECAST") forecastCents += entry.amountCents;
    }

    const allocatedCents = event.activities.reduce((sum, a) => sum + a.budgetCents, 0);

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventType: event.type as EventType,
      allocatedCents,
      revenueCents,
      expenseCents,
      forecastCents,
      balanceCents: revenueCents - expenseCents,
    };
  });
}

export async function createBudgetEntry(actor: AppSession, input: unknown): Promise<BudgetEntryDto> {
  assertCanManage(actor);
  const parsed = budgetEntryFormSchema.parse(input);

  const createData: Prisma.BudgetEntryUncheckedCreateInput = {
    type: parsed.type,
    label: parsed.label,
    amountCents: parseEurosToCents(parsed.amountEuros),
    occurredAt: parsed.occurredAt ? new Date(parsed.occurredAt) : null,
    eventId: parsed.eventId ?? null,
    activityId: parsed.activityId ?? null,
  };

  const created = await prisma.budgetEntry.create({ data: createData });

  const row = await prisma.budgetEntry.findUniqueOrThrow({
    where: { id: created.id },
    select: entrySelect,
  });

  return toEntryDto(row);
}

export async function updateBudgetEntry(
  actor: AppSession,
  entryId: string,
  input: unknown,
): Promise<BudgetEntryDto> {
  assertCanManage(actor);
  const parsed = budgetEntryFormSchema.parse(input);

  const updateData: Prisma.BudgetEntryUncheckedUpdateInput = {
    type: parsed.type,
    label: parsed.label,
    amountCents: parseEurosToCents(parsed.amountEuros),
    occurredAt: parsed.occurredAt ? new Date(parsed.occurredAt) : null,
    eventId: parsed.eventId ?? null,
    activityId: parsed.activityId ?? null,
  };

  await prisma.budgetEntry.update({
    where: { id: entryId },
    data: updateData,
  });

  const row = await prisma.budgetEntry.findUniqueOrThrow({
    where: { id: entryId },
    select: entrySelect,
  });

  return toEntryDto(row);
}

export async function deleteBudgetEntry(actor: AppSession, entryId: string): Promise<void> {
  assertCanManage(actor);
  await prisma.budgetEntry.delete({ where: { id: entryId } });
}

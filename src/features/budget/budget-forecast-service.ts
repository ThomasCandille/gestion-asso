import { prisma } from "@/server/db/client";
import type { EventStatus, EventType } from "../events/event-rules";

export type EventForecastRow = {
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  eventStatus: EventStatus;
  startsAt: string | null;
  allocatedCents: number;
  totalRevenueCents: number;
  expenseCents: number;
  forecastEntryCents: number;
  remainingCents: number;
  netImpactCents: number;
  runningBalanceCents: number;
};

export type BudgetForecast = {
  currentBalanceCents: number;
  projectedBalanceCents: number;
  freeEntriesForecastCents: number;
  upcomingEvents: EventForecastRow[];
};

export async function getBudgetForecast(): Promise<BudgetForecast> {
  const [summaryGroups, upcomingEvents, freeForecasts] = await Promise.all([
    prisma.budgetEntry.groupBy({
      by: ["type"],
      _sum: { amountCents: true },
    }),
    prisma.event.findMany({
      where: { status: { in: ["PLANNED", "IN_PROGRESS"] } },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        startsAt: true,
        activities: { select: { budgetCents: true, expectedRevenueCents: true } },
        budgetEntries: { select: { type: true, amountCents: true } },
      },
      orderBy: [{ startsAt: { sort: "asc", nulls: "last" } }],
    }),
    prisma.budgetEntry.findMany({
      where: { type: "FORECAST" },
      select: { amountCents: true, eventId: true },
    }),
  ]);

  const byType = Object.fromEntries(
    summaryGroups.map((g) => [g.type, g._sum.amountCents ?? 0]),
  );
  const currentBalanceCents = (byType.REVENUE ?? 0) - (byType.EXPENSE ?? 0);

  const freeEntriesForecastCents = freeForecasts
    .filter((e) => e.eventId === null)
    .reduce((sum, e) => sum + e.amountCents, 0);

  let runningBalance = currentBalanceCents - freeEntriesForecastCents;

  const rows: EventForecastRow[] = upcomingEvents.map((event) => {
    let expenseCents = 0;
    let forecastEntryCents = 0;
    for (const entry of event.budgetEntries) {
      if (entry.type === "EXPENSE") expenseCents += entry.amountCents;
      else if (entry.type === "FORECAST") forecastEntryCents += entry.amountCents;
    }
    const allocatedCents = event.activities.reduce((sum, a) => sum + a.budgetCents, 0);
    const totalRevenueCents = event.activities.reduce(
      (sum, a) => sum + a.expectedRevenueCents,
      0,
    );
    const remainingCents = Math.max(0, allocatedCents - expenseCents + forecastEntryCents);
    const netImpactCents = totalRevenueCents - remainingCents;
    runningBalance += netImpactCents;

    return {
      eventId: event.id,
      eventTitle: event.title,
      eventType: event.type as EventType,
      eventStatus: event.status as EventStatus,
      startsAt: event.startsAt?.toISOString() ?? null,
      allocatedCents,
      totalRevenueCents,
      expenseCents,
      forecastEntryCents,
      remainingCents,
      netImpactCents,
      runningBalanceCents: runningBalance,
    };
  });

  return {
    currentBalanceCents,
    projectedBalanceCents: runningBalance,
    freeEntriesForecastCents,
    upcomingEvents: rows,
  };
}

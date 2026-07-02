import type { BudgetEntryDto, BudgetSummary, EventBudgetRow } from "./budget-service";

export function recomputeSummary(entries: BudgetEntryDto[]): BudgetSummary {
  let revenueCents = 0;
  let expenseCents = 0;
  let forecastCents = 0;
  for (const e of entries) {
    if (e.type === "REVENUE") revenueCents += e.amountCents;
    else if (e.type === "EXPENSE") expenseCents += e.amountCents;
    else if (e.type === "FORECAST") forecastCents += e.amountCents;
  }
  return {
    revenueCents,
    expenseCents,
    forecastCents,
    balanceCents: revenueCents - expenseCents,
    forecastBalanceCents: revenueCents - expenseCents - forecastCents,
  };
}

export function recomputeBreakdown(
  entries: BudgetEntryDto[],
  currentBreakdown: EventBudgetRow[],
): EventBudgetRow[] {
  return currentBreakdown.map((row) => {
    const eventEntries = entries.filter((e) => e.eventId === row.eventId);
    let revenueCents = 0;
    let expenseCents = 0;
    let forecastCents = 0;
    for (const e of eventEntries) {
      if (e.type === "REVENUE") revenueCents += e.amountCents;
      else if (e.type === "EXPENSE") expenseCents += e.amountCents;
      else if (e.type === "FORECAST") forecastCents += e.amountCents;
    }
    return {
      ...row,
      revenueCents,
      expenseCents,
      forecastCents,
      balanceCents: revenueCents - expenseCents,
    };
  });
}

import type { BudgetEntry, BudgetBalance } from "../budget-rules";

export function computeBudgetBalance(entries: BudgetEntry[]): BudgetBalance {
  let revenueCents = 0;
  let expenseCents = 0;
  let forecastCents = 0;

  for (const entry of entries) {
    if (entry.type === "REVENUE") revenueCents += entry.amountCents;
    else if (entry.type === "EXPENSE") expenseCents += entry.amountCents;
    else if (entry.type === "FORECAST") forecastCents += entry.amountCents;
  }

  return {
    revenueCents,
    expenseCents,
    forecastCents,
    balanceCents: revenueCents - expenseCents,
  };
}

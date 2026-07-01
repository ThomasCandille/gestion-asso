export type BudgetEntryType = "REVENUE" | "EXPENSE" | "FORECAST";

export const budgetEntryTypeValues: BudgetEntryType[] = [
  "REVENUE",
  "EXPENSE",
  "FORECAST",
];

export const budgetEntryTypeLabels: Record<BudgetEntryType, string> = {
  REVENUE: "Recette",
  EXPENSE: "Dépense",
  FORECAST: "Prévision",
};

export type BudgetEntry = {
  type: BudgetEntryType;
  amountCents: number;
};

export type BudgetBalance = {
  revenueCents: number;
  expenseCents: number;
  forecastCents: number;
  balanceCents: number;
};

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

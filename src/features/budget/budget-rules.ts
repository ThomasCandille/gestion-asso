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

export { computeBudgetBalance } from "./scripts/budget-scripts";

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

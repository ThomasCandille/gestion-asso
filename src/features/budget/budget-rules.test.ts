import { describe, expect, it } from "vitest";
import { computeBudgetBalance } from "./budget-rules";

describe("computeBudgetBalance", () => {
  it("retourne des zéros pour un tableau vide", () => {
    const result = computeBudgetBalance([]);
    expect(result).toEqual({
      revenueCents: 0,
      expenseCents: 0,
      forecastCents: 0,
      balanceCents: 0,
    });
  });

  it("calcule le solde recettes - dépenses", () => {
    const result = computeBudgetBalance([
      { type: "REVENUE", amountCents: 50000 },
      { type: "EXPENSE", amountCents: 20000 },
    ]);
    expect(result.balanceCents).toBe(30000);
    expect(result.revenueCents).toBe(50000);
    expect(result.expenseCents).toBe(20000);
  });

  it("cumule plusieurs entrées du même type", () => {
    const result = computeBudgetBalance([
      { type: "REVENUE", amountCents: 10000 },
      { type: "REVENUE", amountCents: 5000 },
      { type: "EXPENSE", amountCents: 3000 },
    ]);
    expect(result.revenueCents).toBe(15000);
    expect(result.balanceCents).toBe(12000);
  });

  it("isole les prévisions du solde réel", () => {
    const result = computeBudgetBalance([
      { type: "REVENUE", amountCents: 10000 },
      { type: "FORECAST", amountCents: 8000 },
    ]);
    expect(result.forecastCents).toBe(8000);
    expect(result.balanceCents).toBe(10000);
  });

  it("retourne un solde négatif quand les dépenses dépassent les recettes", () => {
    const result = computeBudgetBalance([
      { type: "REVENUE", amountCents: 5000 },
      { type: "EXPENSE", amountCents: 12000 },
    ]);
    expect(result.balanceCents).toBe(-7000);
  });
});

import { describe, expect, it } from "vitest";
import { isLowStock } from "./inventory-rules";

describe("isLowStock", () => {
  it("retourne false si minQuantity est null", () => {
    expect(isLowStock(0, null)).toBe(false);
    expect(isLowStock(5, null)).toBe(false);
  });

  it("retourne true quand la quantité est égale au seuil", () => {
    expect(isLowStock(3, 3)).toBe(true);
  });

  it("retourne true quand la quantité est en dessous du seuil", () => {
    expect(isLowStock(1, 5)).toBe(true);
  });

  it("retourne false quand la quantité est au-dessus du seuil", () => {
    expect(isLowStock(10, 5)).toBe(false);
  });

  it("retourne false pour un stock à zéro avec seuil à zéro", () => {
    expect(isLowStock(0, 0)).toBe(true);
  });
});

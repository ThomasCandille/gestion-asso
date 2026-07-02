export function isLowStock(quantity: number, minQuantity: number | null): boolean {
  if (minQuantity === null || minQuantity === undefined) return false;
  return quantity <= minQuantity;
}

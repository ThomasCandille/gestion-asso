export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

export function parseEurosToCents(euros: string): number {
  const value = parseFloat(euros.replace(",", "."));
  return isNaN(value) ? 0 : Math.round(value * 100);
}

export function toOptionalDate(value: string | undefined | null): Date | null {
  return value ? new Date(value) : null;
}

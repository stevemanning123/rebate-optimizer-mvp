export function money(n: number): string {
  return n.toLocaleString(undefined, { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

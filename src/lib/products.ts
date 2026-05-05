/**
 * Product catalog — single source of truth for pricing.
 * The server uses this to validate amounts. Client cannot override.
 */

export type Product = {
  id: string;
  naam: string;
  prijs: number; // in EUR
};

export const PRODUCTS: Record<string, Product> = {
  welkomst: { id: "welkomst", naam: "Welkomstpakket Drenthe", prijs: 27.50 },
  boodschappen: { id: "boodschappen", naam: "Boodschappenpakket", prijs: 19.50 },
  latecheck: { id: "latecheck", naam: "Late check-out", prijs: 25.00 },
};

// Fietsverhuur has dynamic pricing — validated server-side
export const FIETS_PRIJZEN: Record<string, { dag: number; week: number }> = {
  fiets: { dag: 8.50, week: 42.50 },
  kinderfiets: { dag: 6.50, week: 32.50 },
  ebike: { dag: 25.00, week: 125.00 },
  atb: { dag: 22.50, week: 112.50 },
  zitje: { dag: 2.50, week: 12.50 },
};

export function getProduct(id: string): Product | null {
  return PRODUCTS[id] || null;
}

export function calcFietsTotal(fietsen: Record<string, number>, dagen: number): number {
  let total = 0;
  const isWeek = dagen >= 7;
  for (const [id, qty] of Object.entries(fietsen)) {
    if (qty <= 0) continue;
    const p = FIETS_PRIJZEN[id];
    if (!p) continue;
    if (isWeek) {
      total += (p.week * Math.floor(dagen / 7) + p.dag * (dagen % 7)) * qty;
    } else {
      total += p.dag * dagen * qty;
    }
  }
  return total;
}

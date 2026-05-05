import { getSupabase } from "@/lib/supabase";

export type Product = {
  id: string;
  naam: string;
  omschrijving: string | null;
  prijs: number;
  categorie: string;
  actief: boolean;
  volgorde: number;
};

// Cache for 5 minutes to avoid DB calls on every request
let cache: { products: Product[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function getProducts(): Promise<Product[]> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.products;
  }
  try {
    const { data } = await getSupabase()
      .from("products")
      .select("*")
      .eq("actief", true)
      .order("volgorde");
    const products = (data || []) as Product[];
    cache = { products, timestamp: Date.now() };
    return products;
  } catch {
    return cache?.products || [];
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function calcFietsTotal(fietsen: Record<string, number>, dagen: number): Promise<number> {
  const products = await getProducts();
  const fietsPrices = Object.fromEntries(
    products.filter(p => p.categorie === "fiets").map(p => [p.id, p.prijs])
  );

  let total = 0;
  const isWeek = dagen >= 7;
  for (const [id, qty] of Object.entries(fietsen)) {
    if (qty <= 0) continue;
    const dagPrijs = fietsPrices[id];
    if (!dagPrijs) continue;
    const weekPrijs = dagPrijs * 5; // week = 5x dag
    if (isWeek) {
      total += (weekPrijs * Math.floor(dagen / 7) + dagPrijs * (dagen % 7)) * qty;
    } else {
      total += dagPrijs * dagen * qty;
    }
  }
  return total;
}

// Clear cache (after admin edits)
export function clearProductCache() {
  cache = null;
}

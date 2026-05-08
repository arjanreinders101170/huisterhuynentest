import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

export const LODGES = ["lodge_1", "lodge_2"] as const;
export type Lodge = (typeof LODGES)[number];

export const LodgeSchema = z.enum(LODGES);

/**
 * Throws a typed error when `s` is not a recognised lodge identifier.
 */
export function assertLodge(s: unknown): asserts s is Lodge {
  const parsed = LodgeSchema.safeParse(s);
  if (!parsed.success) {
    throw new Error(`Invalid lodge: ${String(s)}`);
  }
}

/**
 * Look up a stay by its share token and return the bound lodge.
 * Returns `null` when the token is missing, unknown, or when the stay has
 * an `expires_at` in the past.
 */
export async function getLodgeFromStayToken(token: string): Promise<Lodge | null> {
  if (!token) return null;

  const { data, error } = await getSupabase()
    .from("stays")
    .select("lodge, expires_at, check_out")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return null;

  // Prefer explicit expires_at; fall back to check_out + 1 day for legacy rows.
  const now = Date.now();
  if (data.expires_at) {
    if (new Date(data.expires_at as string).getTime() <= now) return null;
  } else if (data.check_out) {
    const fallback = new Date(data.check_out as string).getTime() + 24 * 60 * 60 * 1000;
    if (fallback <= now) return null;
  }

  const parsed = LodgeSchema.safeParse(data.lodge);
  return parsed.success ? parsed.data : null;
}

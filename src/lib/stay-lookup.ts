import { getSupabase } from "@/lib/supabase";

/* Server-side verificatie van een stay-token.
 *
 * De regels die een verblijf "lopend" maken stonden verspreid over /api/stay,
 * /api/nuki/unlock en /api/chat, elk met hun eigen kopie. Die routes hebben
 * bewust extra eisen bovenop deze basis — nuki kijkt ook naar de check-in-tijd,
 * chat cachet resultaten — maar de kern hoort op één plek te staan, zodat een
 * nieuwe route niet per ongeluk een lossere variant introduceert.
 */

export type GeverifieerdVerblijf = {
  id: string;
  lodge: string;
  guestId: string | null;
  checkIn: string;
  checkOut: string;
};

/**
 * Zoekt het verblijf bij een token en controleert of het nog loopt.
 * Retourneert null bij een onbekend token, een afgesloten verblijf, of een
 * verblijf waarvan de check-outdag voorbij is.
 */
export async function verifieerStayToken(token: string): Promise<GeverifieerdVerblijf | null> {
  if (!token) return null;
  try {
    const { data } = await getSupabase()
      .from("stays")
      .select("id, lodge, guest_id, check_in, check_out, status")
      .eq("token", token)
      .maybeSingle();

    if (!data) return null;
    if (data.status === "vertrokken") return null;

    // Toegang loopt tot het einde van de check-outdag.
    const checkOut = new Date(data.check_out as string);
    checkOut.setHours(23, 59, 59);
    if (Date.now() > checkOut.getTime()) return null;

    return {
      id: data.id as string,
      lodge: data.lodge as string,
      guestId: (data.guest_id as string | null) ?? null,
      checkIn: data.check_in as string,
      checkOut: data.check_out as string,
    };
  } catch {
    return null;
  }
}

/** Naam en e-mailadres van de gast bij een verblijf, uit de database. */
export async function gastVanVerblijf(
  guestId: string | null
): Promise<{ naam: string; email: string } | null> {
  if (!guestId) return null;
  try {
    const { data } = await getSupabase()
      .from("guests")
      .select("naam, email")
      .eq("id", guestId)
      .maybeSingle();
    if (!data?.email) return null;
    return { naam: (data.naam as string) || "Gast", email: data.email as string };
  } catch {
    return null;
  }
}

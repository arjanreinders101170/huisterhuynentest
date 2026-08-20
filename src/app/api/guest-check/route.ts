import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const emailSchema = z.string().email().max(254);

/**
 * Maakt LIKE-metatekens letterlijk.
 *
 * ILIKE behandelt zijn rechterkant als patroon, dus veranderde ongefilterde
 * invoer dit endpoint in een zoekmachine over de gastentabel: "%@gmail.com"
 * matcht elke Gmail-gast, en "a%" laat zich teken voor teken versmallen.
 * Escapen in plaats van weggooien, want _ komt legitiem in e-mailadressen
 * voor (jan_jansen@…) en moet gewoon als letterlijk teken blijven werken.
 */
function escapeLike(value: string): string {
  return value.replace(/([\\%_])/g, "\\$1");
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  /* Eerst valideren dat dit überhaupt een e-mailadres is. Dat weert meteen
   * de patroon-achtige invoer waarmee je anders de tabel zou aftasten. */
  const parsed = emailSchema.safeParse(raw ?? "");
  if (!parsed.success) {
    return NextResponse.json({ known: false });
  }
  const email = parsed.data;

  try {
    const { data } = await getSupabase()
      .from("guests")
      .select("naam, laatste_bezoek")
      .ilike("email", escapeLike(email))
      .single();

    if (!data) return NextResponse.json({ known: false });

    const voornaam = (data.naam || "").split(" ")[0] || data.naam || "";
    return NextResponse.json({ known: true, naam: voornaam });
  } catch {
    return NextResponse.json({ known: false });
  }
}

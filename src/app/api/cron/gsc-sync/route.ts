import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { haalMaandOp, maandGrenzen, vorigeMaand, GscConfigError, type GscRow } from "@/lib/gsc";

export const runtime = "nodejs";
// Twee dimensies ophalen en wegschrijven duurt langer dan de standaardlimiet.
export const maxDuration = 300;

/** Supabase slikt geen tienduizenden rijen in één insert. */
const BATCH = 500;

async function schrijfMaand(maand: string, queries: GscRow[], pages: GscRow[]): Promise<void> {
  const sb = getSupabase();

  // Eerst leegmaken: Search Console corrigeert cijfers nog dagen na afloop na,
  // dus een hersynchronisatie moet de oude rijen vervangen in plaats van
  // ernaast te komen staan.
  await sb.from("gsc_metrics").delete().eq("maand", maand);

  const rijen = [
    ...queries.map(r => ({ maand, dimensie: "query", sleutel: r.sleutel, klikken: r.klikken, vertoningen: r.vertoningen, positie: r.positie })),
    ...pages.map(r => ({ maand, dimensie: "page", sleutel: r.sleutel, klikken: r.klikken, vertoningen: r.vertoningen, positie: r.positie })),
  ];

  for (let i = 0; i < rijen.length; i += BATCH) {
    const { error } = await sb.from("gsc_metrics").insert(rijen.slice(i, i + BATCH));
    if (error) throw new Error(`Wegschrijven mislukt: ${error.message}`);
  }
}

/** Synchroniseert één maand en legt de uitkomst vast in het log. */
async function syncMaand(datumInMaand: Date): Promise<{ maand: string; queries: number; pages: number }> {
  const { maand } = maandGrenzen(datumInMaand);
  const sb = getSupabase();
  const { data: logRij } = await sb
    .from("gsc_sync_log")
    .insert({ maand, gelukt: false })
    .select("id")
    .single();

  try {
    const resultaat = await haalMaandOp(datumInMaand);
    await schrijfMaand(resultaat.maand, resultaat.queries, resultaat.pages);

    if (logRij) {
      await sb.from("gsc_sync_log").update({
        gelukt: true,
        aantal_queries: resultaat.queries.length,
        aantal_pages: resultaat.pages.length,
      }).eq("id", logRij.id);
    }
    return { maand, queries: resultaat.queries.length, pages: resultaat.pages.length };
  } catch (err) {
    const melding = err instanceof Error ? err.message : "onbekende fout";
    if (logRij) {
      await sb.from("gsc_sync_log").update({ gelukt: false, foutmelding: melding }).eq("id", logRij.id);
    }
    throw err;
  }
}

/**
 * GET — maandelijks aangeroepen door Vercel Cron (zie vercel.json).
 *
 * Standaard wordt de vorige volledige kalendermaand opgehaald. Met
 * ?maanden=16 wordt de beschikbare historie teruggevuld — handig bij de
 * eerste run, want Search Console bewaart zestien maanden.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gevraagd = Number(request.nextUrl.searchParams.get("maanden") ?? "1");
  const aantal = Number.isFinite(gevraagd) ? Math.min(Math.max(Math.trunc(gevraagd), 1), 16) : 1;

  const gedaan: { maand: string; queries: number; pages: number }[] = [];
  const nu = new Date();
  try {
    // Oudste eerst, zodat een afgebroken run een aaneengesloten reeks achterlaat.
    // i = aantal levert de oudste maand op, i = 1 de vorige volledige maand.
    for (let i = aantal; i >= 1; i--) {
      const peil = new Date(Date.UTC(nu.getUTCFullYear(), nu.getUTCMonth() - (i - 1), 1));
      gedaan.push(await syncMaand(vorigeMaand(peil)));
    }
  } catch (err) {
    if (err instanceof GscConfigError) {
      return NextResponse.json({ error: err.message, gedaan }, { status: 503 });
    }
    console.error("GSC-sync mislukt:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync mislukt", gedaan },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, gedaan });
}

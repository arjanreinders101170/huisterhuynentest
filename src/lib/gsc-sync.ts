import { getSupabase } from "@/lib/supabase";
import { haalMaandOp, maandGrenzen, vorigeMaand, type GscRow } from "@/lib/gsc";

/* ═══ Search Console-data ophalen en wegschrijven ═══
 * Gedeeld door de maandelijkse cron (/api/cron/gsc-sync) en de knop "Nu
 * ophalen" in de admin, zodat beide precies hetzelfde doen.
 */

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

/** Is deze maand al eerder met succes opgehaald? */
async function alGesynct(maand: string): Promise<boolean> {
  const { data } = await getSupabase()
    .from("gsc_sync_log")
    .select("id")
    .eq("maand", maand)
    .eq("gelukt", true)
    .limit(1)
    .maybeSingle();
  return data !== null;
}

export interface SyncResultaat { maand: string; queries: number; pages: number; overgeslagen?: true }

/** Synchroniseert één maand en legt de uitkomst vast in het log. */
async function syncMaand(datumInMaand: Date): Promise<SyncResultaat> {
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


export interface SyncOpdracht {
  /** Aantal maanden terug, geteld vanaf de vorige volledige kalendermaand. */
  aantal: number;
  /** Ook maanden opnieuw ophalen die al met succes binnen zijn. */
  force?: boolean;
}

/**
 * Haalt één of meer maanden op, oudste eerst zodat een afgebroken run een
 * aaneengesloten reeks achterlaat. Maanden die al met succes binnen zijn
 * worden overgeslagen, tenzij `force`: zo gaat een herstart na een
 * tijdslimiet verder waar de vorige run stopte.
 */
export async function syncMaanden({ aantal, force = false }: SyncOpdracht): Promise<SyncResultaat[]> {
  const gedaan: SyncResultaat[] = [];
  const nu = new Date();

  for (let i = aantal; i >= 1; i--) {
    const peil = new Date(Date.UTC(nu.getUTCFullYear(), nu.getUTCMonth() - (i - 1), 1));
    const doelMaand = vorigeMaand(peil);
    const { maand } = maandGrenzen(doelMaand);

    if (!force && await alGesynct(maand)) {
      gedaan.push({ maand, queries: 0, pages: 0, overgeslagen: true });
      continue;
    }
    gedaan.push(await syncMaand(doelMaand));
  }

  return gedaan;
}

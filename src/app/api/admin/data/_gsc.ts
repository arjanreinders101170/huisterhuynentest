import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { GscConfigError } from "@/lib/gsc";
import { syncMaanden } from "@/lib/gsc-sync";
import {
  clusterCijfers, totalen, vindKansen, forecastVoor,
  type GscRij, type ClusterCijfers,
} from "@/lib/gsc-analyse";

/** Maandanalyse van de Search Console-data voor de admin.
 *  De rekenregels staan in @/lib/gsc-analyse, gedeeld met het rapport. */

interface MetricRij { sleutel: string; klikken: number; vertoningen: number; positie: number }

async function haalMaand(maand: string, dimensie: "query" | "page"): Promise<GscRij[]> {
  const { data } = await getSupabase()
    .from("gsc_metrics")
    .select("sleutel, klikken, vertoningen, positie")
    .eq("maand", maand)
    .eq("dimensie", dimensie);
  return ((data ?? []) as MetricRij[]).map(r => ({
    sleutel: r.sleutel,
    klikken: Number(r.klikken),
    vertoningen: Number(r.vertoningen),
    positie: Number(r.positie),
  }));
}

/** Supabase levert standaard maximaal 1000 rijen per verzoek. Zestien maanden
 *  zijn er meer, dus doorbladeren tot alles binnen is. */
async function haalAlleQueries(): Promise<Map<string, GscRij[]>> {
  const perMaand = new Map<string, GscRij[]>();
  const PAGINA = 1000;

  for (let van = 0; ; van += PAGINA) {
    const { data, error } = await getSupabase()
      .from("gsc_metrics")
      .select("maand, sleutel, klikken, vertoningen, positie")
      .eq("dimensie", "query")
      .order("maand", { ascending: true })
      .range(van, van + PAGINA - 1);

    if (error || !data || data.length === 0) break;

    for (const r of data as (MetricRij & { maand: string })[]) {
      const rij: GscRij = {
        sleutel: r.sleutel,
        klikken: Number(r.klikken),
        vertoningen: Number(r.vertoningen),
        positie: Number(r.positie),
      };
      const lijst = perMaand.get(r.maand);
      if (lijst) lijst.push(rij); else perMaand.set(r.maand, [rij]);
    }

    if (data.length < PAGINA) break;
  }

  return perMaand;
}

export interface ClusterVerschil extends ClusterCijfers {
  positieVorig: number | null;
  positieVerschil: number | null;   // positief = gestegen (lager positienummer)
  vertoningenVorig: number | null;
}

/** Zet de clusters van twee maanden naast elkaar. Een cluster dat vorige maand
 *  niet bestond krijgt null in plaats van 0, anders lijkt het een daling. */
function vergelijkClusters(nu: ClusterCijfers[], vorig: ClusterCijfers[]): ClusterVerschil[] {
  const vorigMap = new Map(vorig.map(c => [c.cluster, c]));
  return nu.map(c => {
    const eerder = vorigMap.get(c.cluster);
    return {
      ...c,
      positieVorig: eerder?.positie ?? null,
      positieVerschil: eerder ? Math.round((eerder.positie - c.positie) * 10) / 10 : null,
      vertoningenVorig: eerder?.vertoningen ?? null,
    };
  });
}

/** PostgREST meldt een ontbrekende tabel via 42P01 of PGRST205. Dat betekent
 *  hier iets anders dan "nog geen data": dan is de migratie nog niet gedraaid. */
function tabelOntbreekt(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "42P01"
    || error.code === "PGRST205"
    || /does not exist|schema cache/i.test(error.message ?? "");
}

export type LegeReden = "tabellen_ontbreken" | "nog_geen_sync" | "sync_mislukt";

export async function handleGscGet(table: string): Promise<NextResponse | null> {
  if (table !== "gsc_analyse") return null;

  const sb = getSupabase();

  // Welke maanden zijn er? Uit het synclog en niet uit gsc_metrics: die tabel
  // bevat honderden rijen per maand, dus een gelimiteerde select zou de oudste
  // maanden gaandeweg buiten beeld duwen naarmate er data bijkomt.
  const { data: maandRijen, error: maandFout } = await sb
    .from("gsc_sync_log")
    .select("maand")
    .eq("gelukt", true)
    .order("maand", { ascending: false });

  if (tabelOntbreekt(maandFout)) {
    return NextResponse.json({
      data: { leeg: true, reden: "tabellen_ontbreken" as LegeReden, maanden: [], laatsteSync: null },
    });
  }

  const maanden = [...new Set((maandRijen ?? []).map(r => r.maand as string))].sort().reverse();

  const { data: laatsteSync } = await sb
    .from("gsc_sync_log")
    .select("maand, gestart_op, gelukt, aantal_queries, aantal_pages, foutmelding")
    .order("gestart_op", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maanden.length === 0) {
    return NextResponse.json({
      data: {
        leeg: true,
        // Is er wel geprobeerd? Dat scheelt "nog niets gebeurd" van "het faalt".
        reden: (laatsteSync ? "sync_mislukt" : "nog_geen_sync") as LegeReden,
        maanden: [],
        laatsteSync: laatsteSync ?? null,
      },
    });
  }

  const maand = maanden[0];
  const vorigeMaand = maanden[1] ?? null;

  const [queriesNu, queriesVorig] = await Promise.all([
    haalMaand(maand, "query"),
    vorigeMaand ? haalMaand(vorigeMaand, "query") : Promise.resolve([] as GscRij[]),
  ]);

  const nu = totalen(queriesNu);
  const doel = forecastVoor(maand);

  return NextResponse.json({
    data: {
      leeg: false,
      maand,
      vorigeMaand,
      maanden,
      laatsteSync: laatsteSync ?? null,
      totalen: nu,
      totalenVorig: vorigeMaand ? totalen(queriesVorig) : null,
      clusters: vergelijkClusters(clusterCijfers(queriesNu), clusterCijfers(queriesVorig)),
      kansen: vorigeMaand ? vindKansen(queriesNu, queriesVorig) : [],
      forecast: {
        ...doel,
        vertoningenGehaald: nu.vertoningen >= doel.vertoningen,
        ctrGehaald: nu.ctr >= doel.ctr,
        positieGehaald: nu.positie > 0 && nu.positie <= doel.positie,
      },
    },
  });
}

/** Handmatig ophalen vanuit de admin. Draait dezelfde logica als de cron, maar
 *  op de admin-sessie in plaats van CRON_SECRET — zodat de eigenaar geen
 *  terminal nodig heeft om zijn eigen cijfers binnen te halen. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleGscPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  if (action !== "sync_gsc") return null;

  const gevraagd = Number(body.maanden ?? 1);
  const aantal = Number.isFinite(gevraagd) ? Math.min(Math.max(Math.trunc(gevraagd), 1), 16) : 1;

  try {
    const gedaan = await syncMaanden({ aantal, force: body.force === true });
    const opgehaald = gedaan.filter(r => !r.overgeslagen);
    return NextResponse.json({
      success: true,
      gedaan,
      samenvatting: opgehaald.length === 0
        ? "Alle gevraagde maanden waren al binnen."
        : `${opgehaald.length} ${opgehaald.length === 1 ? "maand" : "maanden"} opgehaald.`,
    });
  } catch (err) {
    if (err instanceof GscConfigError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("Handmatige GSC-sync mislukt:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ophalen mislukt" },
      { status: 500 },
    );
  }
}

/** Maandreeks voor de grafiek: totalen plus een uitsplitsing per cluster, zodat
 *  je seizoenspatroon en trend ziet in plaats van alleen het laatste stapje. */
export async function handleGscReeksGet(table: string): Promise<NextResponse | null> {
  if (table !== "gsc_reeks") return null;

  const perMaand = await haalAlleQueries();
  const maanden = [...perMaand.keys()].sort();

  const totaal = maanden.map(maand => {
    const t = totalen(perMaand.get(maand)!);
    return {
      maand,
      vertoningen: t.vertoningen,
      klikken: t.klikken,
      nietMerkKlikken: t.nietMerkKlikken,
      positie: t.positie,
    };
  });

  // Alleen clusters die ergens in de reeks voorkomen, gesorteerd op totale vraag.
  const clusterTotalen = new Map<string, number>();
  const perCluster: Record<string, { maand: string; vertoningen: number; klikken: number; positie: number }[]> = {};

  for (const maand of maanden) {
    for (const c of clusterCijfers(perMaand.get(maand)!)) {
      clusterTotalen.set(c.cluster, (clusterTotalen.get(c.cluster) ?? 0) + c.vertoningen);
      (perCluster[c.cluster] ??= []).push({
        maand, vertoningen: c.vertoningen, klikken: c.klikken, positie: c.positie,
      });
    }
  }

  const clusters = [...clusterTotalen.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([naam]) => naam);

  return NextResponse.json({ data: { maanden, totaal, clusters, perCluster } });
}

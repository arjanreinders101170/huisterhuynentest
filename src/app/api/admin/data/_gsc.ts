import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
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

export async function handleGscGet(table: string): Promise<NextResponse | null> {
  if (table !== "gsc_analyse") return null;

  const sb = getSupabase();

  // Welke maanden zijn er? Uit het synclog en niet uit gsc_metrics: die tabel
  // bevat honderden rijen per maand, dus een gelimiteerde select zou de oudste
  // maanden gaandeweg buiten beeld duwen naarmate er data bijkomt.
  const { data: maandRijen } = await sb
    .from("gsc_sync_log")
    .select("maand")
    .eq("gelukt", true)
    .order("maand", { ascending: false });

  const maanden = [...new Set((maandRijen ?? []).map(r => r.maand as string))].sort().reverse();

  const { data: laatsteSync } = await sb
    .from("gsc_sync_log")
    .select("maand, gestart_op, gelukt, aantal_queries, aantal_pages, foutmelding")
    .order("gestart_op", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maanden.length === 0) {
    return NextResponse.json({
      data: { maanden: [], laatsteSync: laatsteSync ?? null, leeg: true },
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

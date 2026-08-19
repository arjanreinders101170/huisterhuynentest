import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { bepaalKanaal, type Kanaal } from "@/lib/attributie";

/* ═══ Voortgang naar 10.000 bezoekers ═══
 *
 * Twee vragen worden hier beantwoord:
 *   1. Hoeveel bezoekers halen we nu, en hoe verhoudt zich dat tot de mijlpaal
 *      van deze fase?
 *   2. Uit welk kanaal kwamen de aanvragen — dus: waar werkt het budget?
 *
 * Bezoekers worden voorlopig gemeten als organische klikken uit Search
 * Console. Dat is een ondergrens: het mist alle direct, social en betaald
 * verkeer. Zodra GA4 draait komt het echte sessiecijfer hier binnen; tot die
 * tijd is dit het enige harde cijfer dat we hebben, en dat is beter dan geen.
 */

interface MaandRij { maand: string; klikken: number; vertoningen: number }

/** Klikken en vertoningen per maand, opgeteld over alle zoekopdrachten. */
async function maandreeks(): Promise<MaandRij[]> {
  const perMaand = new Map<string, { klikken: number; vertoningen: number }>();
  const PAGINA = 1000;

  for (let van = 0; ; van += PAGINA) {
    const { data, error } = await getSupabase()
      .from("gsc_metrics")
      .select("maand, klikken, vertoningen")
      .eq("dimensie", "query")
      .order("maand", { ascending: true })
      .range(van, van + PAGINA - 1);

    if (error || !data || data.length === 0) break;

    for (const r of data as { maand: string; klikken: number; vertoningen: number }[]) {
      const bestaand = perMaand.get(r.maand) ?? { klikken: 0, vertoningen: 0 };
      bestaand.klikken += Number(r.klikken);
      bestaand.vertoningen += Number(r.vertoningen);
      perMaand.set(r.maand, bestaand);
    }

    if (data.length < PAGINA) break;
  }

  return [...perMaand.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([maand, t]) => ({ maand, ...t }));
}

export interface KanaalTelling {
  kanaal: Kanaal;
  aanvragen: number;
  geboekt: number;
  omzet: number;
}

const GEBOEKTE_STATUSSEN = new Set([
  "bevestigd", "aanbetaling_verstuurd", "aanbetaling_betaald",
  "restbetaling_verstuurd", "volledig_betaald",
]);

/** Aanvragen per kanaal over de laatste 12 maanden. */
async function kanaalTellingen(): Promise<{ tellingen: KanaalTelling[]; zonderHerkomst: number; totaal: number }> {
  const vanaf = new Date();
  vanaf.setMonth(vanaf.getMonth() - 12);

  const { data } = await getSupabase()
    .from("booking_requests")
    .select("kanaal, utm_source, utm_medium, referrer, status, totaal, voorgestelde_prijs")
    .gte("created_at", vanaf.toISOString())
    .neq("bron", "handmatig")
    .limit(2000);

  const rijen = (data ?? []) as {
    kanaal: string | null; utm_source: string | null; utm_medium: string | null;
    referrer: string | null; status: string; totaal: number | null; voorgestelde_prijs: number | null;
  }[];

  const perKanaal = new Map<Kanaal, KanaalTelling>();
  let zonderHerkomst = 0;

  for (const r of rijen) {
    // Aanvragen van vóór de attributie-migratie hebben geen kanaal. Die apart
    // tellen in plaats van als "direct" boeken — anders lijkt direct verkeer
    // groter dan het is.
    const heeftSignaal = r.kanaal || r.utm_source || r.utm_medium || r.referrer;
    if (!heeftSignaal) { zonderHerkomst++; continue; }

    const kanaal = (r.kanaal as Kanaal | null)
      ?? bepaalKanaal({ utm_source: r.utm_source, utm_medium: r.utm_medium, referrer: r.referrer });

    const huidig = perKanaal.get(kanaal) ?? { kanaal, aanvragen: 0, geboekt: 0, omzet: 0 };
    huidig.aanvragen += 1;
    if (GEBOEKTE_STATUSSEN.has(r.status)) {
      huidig.geboekt += 1;
      huidig.omzet += Number(r.totaal ?? r.voorgestelde_prijs ?? 0);
    }
    perKanaal.set(kanaal, huidig);
  }

  return {
    tellingen: [...perKanaal.values()].sort((a, b) => b.aanvragen - a.aanvragen),
    zonderHerkomst,
    totaal: rijen.length,
  };
}

export async function handleGroeiGet(table: string): Promise<NextResponse | null> {
  if (table !== "groei") return null;

  const [reeks, kanalen] = await Promise.all([
    maandreeks().catch(() => [] as MaandRij[]),
    kanaalTellingen().catch(() => ({ tellingen: [] as KanaalTelling[], zonderHerkomst: 0, totaal: 0 })),
  ]);

  return NextResponse.json({ data: { reeks, kanalen } });
}

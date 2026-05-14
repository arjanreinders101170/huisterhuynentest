import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

function isAuthed(request: NextRequest): boolean {
  const session = request.cookies.get("hth-admin-session");
  return session?.value === process.env.ADMIN_SECRET;
}

function toDateStr(d: string): string {
  return d.substring(0, 10);
}

// TT Assen MotoGP confirmed / estimated dates
const TT_ASSEN: Record<number, { start: string; end: string }> = {
  2025: { start: "2025-06-27", end: "2025-06-29" },
  2026: { start: "2026-06-26", end: "2026-06-28" },
  2027: { start: "2027-06-25", end: "2027-06-27" }, // estimated last weekend June
  2028: { start: "2028-06-30", end: "2028-07-02" }, // estimated
};

export interface SurchargeConfig {
  feestdag_nl: number;
  feestdag_de: number;
  vakantie_nl: number;
  vakantie_ni: number;
  vakantie_nw: number;
  tt_assen: number;
  weekend: number;
}

export interface GeneratedPeriod {
  lodge_id: string;
  label: string;
  start_date: string;
  end_date: string;
  price_per_night: number;
  category: string;
}

async function fetchNLHolidays(year: number): Promise<{ date: string; name: string }[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/NL`);
    if (!res.ok) return [];
    const data = await res.json() as Array<{ date: string; localName: string; global: boolean }>;
    return data.filter(h => h.global).map(h => ({ date: h.date, name: h.localName }));
  } catch { return []; }
}

async function fetchDEHolidays(year: number): Promise<{ date: string; name: string }[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/DE`);
    if (!res.ok) return [];
    const data = await res.json() as Array<{ date: string; localName: string; global: boolean; counties: string[] | null }>;
    return data
      .filter(h => h.global || (h.counties?.includes("DE-NI") || h.counties?.includes("DE-NW")))
      .map(h => ({ date: h.date, name: h.localName }));
  } catch { return []; }
}

async function fetchNLSchoolHolidays(year: number): Promise<{ name: string; start: string; end: string }[]> {
  const results: { name: string; start: string; end: string }[] = [];
  const schoolYears = [`${year - 1}-${year}`, `${year}-${year + 1}`];
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  for (const sy of schoolYears) {
    try {
      const res = await fetch(
        `https://opendata.rijksoverheid.nl/v1/infotypes/schoolholidays/schoolyear/${sy}?output=json`
      );
      if (!res.ok) continue;
      const raw = await res.json();
      const items: Array<{
        vacationtype?: { term?: string };
        regions?: Array<{ region: string; startdate: string; enddate: string }>;
      }> = Array.isArray(raw) ? raw : (raw.content || []);

      for (const item of items) {
        const name = item.vacationtype?.term || "Schoolvakantie";
        const regions = item.regions || [];
        if (!regions.length) continue;

        // Broadest date range across all regions (noord, midden, zuid)
        let start = regions.map(r => toDateStr(r.startdate)).sort()[0];
        let end = regions.map(r => toDateStr(r.enddate)).sort().at(-1)!;

        if (end < yearStart || start > yearEnd) continue;
        start = start < yearStart ? yearStart : start;
        end = end > yearEnd ? yearEnd : end;

        // Push each vacation period separately — do NOT merge across school years.
        // Merging by name would collapse Kerstvakantie (Jan) + Kerstvakantie (Dec)
        // into a single period spanning the entire year.
        results.push({ name, start, end });
      }
    } catch { continue; }
  }

  return results;
}

async function fetchDESchoolHolidays(year: number, state: "NI" | "NW"): Promise<{ name: string; start: string; end: string }[]> {
  try {
    const res = await fetch(`https://ferien-api.de/api/v1/holidays/${state}/${year}`);
    if (!res.ok) return [];
    const data = await res.json() as Array<{ name: string; start: string; end: string }>;
    return data.map(h => ({ name: h.name, start: toDateStr(h.start), end: toDateStr(h.end) }));
  } catch { return []; }
}

function calcPrice(base: number, pct: number): number {
  return Math.round(base * (1 + pct / 100) * 100) / 100;
}

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function generateWeekendPeriods(year: number, lodge_id: string, base_price: number, pct: number): GeneratedPeriod[] {
  const result: GeneratedPeriod[] = [];
  const d = new Date(year, 0, 1);
  while (d.getDay() !== 5) d.setDate(d.getDate() + 1);
  while (d.getFullYear() === year) {
    const friday = localDateStr(d);
    const sundayDate = new Date(d);
    sundayDate.setDate(sundayDate.getDate() + 2);
    const sunday = sundayDate.getFullYear() === year ? localDateStr(sundayDate) : `${year}-12-31`;
    result.push({ lodge_id, label: "Weekend", start_date: friday, end_date: sunday, price_per_night: calcPrice(base_price, pct), category: "weekend" });
    d.setDate(d.getDate() + 7);
  }
  return result;
}

export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const body = await request.json() as {
    year: number;
    lodge_id: string;
    base_price: number;
    surcharges: SurchargeConfig;
    preview_only?: boolean;
  };

  const { year, lodge_id, base_price, surcharges, preview_only = true } = body;

  if (!year || !lodge_id || !base_price || !surcharges) {
    return NextResponse.json({ error: "Verplichte velden ontbreken" }, { status: 400 });
  }

  const [nlHolidays, deHolidays, nlSchool, niSchool, nwSchool] = await Promise.all([
    fetchNLHolidays(year),
    fetchDEHolidays(year),
    fetchNLSchoolHolidays(year),
    fetchDESchoolHolidays(year, "NI"),
    fetchDESchoolHolidays(year, "NW"),
  ]);

  const periods: GeneratedPeriod[] = [];

  // School holidays first (longer periods, higher priority)
  for (const h of nlSchool) {
    periods.push({ lodge_id, label: `${h.name} (NL)`, start_date: h.start, end_date: h.end, price_per_night: calcPrice(base_price, surcharges.vakantie_nl), category: "vakantie_nl" });
  }
  for (const h of niSchool) {
    periods.push({ lodge_id, label: `${h.name} (DE Niedersachsen)`, start_date: h.start, end_date: h.end, price_per_night: calcPrice(base_price, surcharges.vakantie_ni), category: "vakantie_ni" });
  }
  for (const h of nwSchool) {
    periods.push({ lodge_id, label: `${h.name} (DE NRW)`, start_date: h.start, end_date: h.end, price_per_night: calcPrice(base_price, surcharges.vakantie_nw), category: "vakantie_nw" });
  }

  // TT Assen
  const tt = TT_ASSEN[year];
  if (tt) {
    periods.push({ lodge_id, label: "TT Assen / MotoGP", start_date: tt.start, end_date: tt.end, price_per_night: calcPrice(base_price, surcharges.tt_assen), category: "tt_assen" });
  }

  // Public holidays (single day)
  for (const h of nlHolidays) {
    periods.push({ lodge_id, label: `${h.name} (feestdag NL)`, start_date: h.date, end_date: h.date, price_per_night: calcPrice(base_price, surcharges.feestdag_nl), category: "feestdag_nl" });
  }
  for (const h of deHolidays) {
    periods.push({ lodge_id, label: `${h.name} (feestdag DE)`, start_date: h.date, end_date: h.date, price_per_night: calcPrice(base_price, surcharges.feestdag_de), category: "feestdag_de" });
  }

  // Weekends (vrijdag t/m zondag)
  if (surcharges.weekend > 0) {
    periods.push(...generateWeekendPeriods(year, lodge_id, base_price, surcharges.weekend));
  }

  if (preview_only) {
    return NextResponse.json({ periods, saved: false });
  }

  // Delete existing auto-generated periods for this lodge + year, then insert
  const sb = getSupabase();
  await sb.from("pricing_periods")
    .delete()
    .eq("lodge_id", lodge_id)
    .gte("start_date", `${year}-01-01`)
    .lte("start_date", `${year}-12-31`);

  if (periods.length > 0) {
    const { error } = await sb.from("pricing_periods").insert(
      periods.map(({ lodge_id: l, label, start_date, end_date, price_per_night }) => ({
        lodge_id: l, label, start_date, end_date, price_per_night,
      }))
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ periods, saved: true, count: periods.length });
}

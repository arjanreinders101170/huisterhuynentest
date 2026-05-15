import { getSupabase } from "@/lib/supabase";

type PricingPeriod = { id: string; label: string; start_date: string; end_date: string; price_per_night: number };
type AvailabilityDiscount = { days_before: number; discount_pct: number };
type PricingConfig = { base_price: number };

type FeeTemplate = {
  id: string;
  label: string;
  soort: "toeslag" | "korting" | "belasting";
  bedrag: number | null;
  percentage: number | null;
  basis: "eenmalig" | "per_nacht" | "per_persoon" | "per_persoon_per_nacht";
  actief: boolean;
  volgorde: number;
};

export type StayPriceInput = {
  lodge: string;
  checkIn: string;   // YYYY-MM-DD
  checkOut: string;  // YYYY-MM-DD (exclusive)
  personen?: number;
  huisdier?: boolean;
};

export type StayPriceResult = {
  nachten: number;
  perNacht: { datum: string; bedrag: number; label: string }[];
  verblijf: number;
  toeslagen: { label: string; bedrag: number; soort: "toeslag" | "belasting" }[];
  kortingen: { label: string; bedrag: number }[];
  totaal: number;
  voorstelLabel: string;
};

function isoRange(checkIn: string, checkOut: string): string[] {
  const out: string[] = [];
  const start = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function feeAmount(tpl: FeeTemplate, nachten: number, personen: number): number {
  const base = tpl.bedrag ?? 0;
  switch (tpl.basis) {
    case "eenmalig":               return base;
    case "per_nacht":              return base * nachten;
    case "per_persoon":            return base * personen;
    case "per_persoon_per_nacht":  return base * personen * nachten;
  }
}

/**
 * Server-side prijsberekening op basis van pricing_periods + pricing_config + fee_templates.
 * Gebruikt door admin-prefill en (toekomstig) door /api/reservering om client-side
 * totalPrice te valideren. iCal-gebaseerde availability discounts worden hier NIET
 * toegepast — die zijn een homepage-UI-incentive, geen onderdeel van de offerte.
 */
export async function computeStayPrice(input: StayPriceInput): Promise<StayPriceResult> {
  const personen = Math.max(1, input.personen ?? 2);
  const nachtenList = isoRange(input.checkIn, input.checkOut);
  const nachten = nachtenList.length;

  const sb = getSupabase();
  const [periodsRes, configRes, feesRes] = await Promise.all([
    sb.from("pricing_periods")
      .select("id, label, start_date, end_date, price_per_night")
      .eq("lodge_id", input.lodge),
    sb.from("pricing_config")
      .select("base_price")
      .eq("lodge_id", input.lodge)
      .maybeSingle(),
    sb.from("fee_templates")
      .select("id, label, soort, bedrag, percentage, basis, actief, volgorde")
      .eq("actief", true)
      .order("volgorde", { ascending: true }),
  ]);

  const periods = (periodsRes.data || []) as PricingPeriod[];
  const basePrice = (configRes.data as PricingConfig | null)?.base_price ?? 0;
  const fees = (feesRes.data || []) as FeeTemplate[];

  const perNacht: { datum: string; bedrag: number; label: string }[] = [];
  let verblijf = 0;
  for (const iso of nachtenList) {
    const matches = periods.filter(p => iso >= p.start_date && iso <= p.end_date);
    const period = matches.sort((a, b) => b.price_per_night - a.price_per_night)[0];
    const bedrag = period ? period.price_per_night : basePrice;
    const label = period ? period.label : "Standaardtarief";
    perNacht.push({ datum: iso, bedrag, label });
    verblijf += bedrag;
  }

  const toeslagen: { label: string; bedrag: number; soort: "toeslag" | "belasting" }[] = [];
  const kortingen: { label: string; bedrag: number }[] = [];

  for (const tpl of fees) {
    // Huisdier-toeslag alleen toepassen als gast huisdier meeneemt
    if (/huisdier/i.test(tpl.label) && !input.huisdier) continue;

    const amt = feeAmount(tpl, nachten, personen);
    if (amt === 0) continue;

    if (tpl.soort === "korting") {
      kortingen.push({ label: tpl.label, bedrag: amt });
    } else {
      toeslagen.push({ label: tpl.label, bedrag: amt, soort: tpl.soort });
    }
  }

  const totaalToeslagen = toeslagen.reduce((s, x) => s + x.bedrag, 0);
  const totaalKortingen = kortingen.reduce((s, x) => s + x.bedrag, 0);
  const totaal = Math.max(0, verblijf + totaalToeslagen - totaalKortingen);

  const labels = Array.from(new Set(perNacht.map(p => p.label)));
  const voorstelLabel = `${nachten} ${nachten === 1 ? "nacht" : "nachten"}${labels.length ? " · " + labels.join(" + ") : ""}`;

  return {
    nachten,
    perNacht,
    verblijf: Math.round(verblijf * 100) / 100,
    toeslagen: toeslagen.map(t => ({ ...t, bedrag: Math.round(t.bedrag * 100) / 100 })),
    kortingen: kortingen.map(k => ({ ...k, bedrag: Math.round(k.bedrag * 100) / 100 })),
    totaal: Math.round(totaal * 100) / 100,
    voorstelLabel,
  };
}

/** Helper voor dual-write — vangt fouten af zodat hoofdflow nooit breekt op nieuwe tabel. */
export async function safeInsertBookingRequest(row: Record<string, unknown>): Promise<string | null> {
  try {
    const { data, error } = await getSupabase()
      .from("booking_requests")
      .insert(row)
      .select("id")
      .single();
    if (error) {
      console.error("[booking_requests] insert failed:", error.message);
      return null;
    }
    return data?.id || null;
  } catch (e) {
    console.error("[booking_requests] insert threw:", e);
    return null;
  }
}

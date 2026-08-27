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

/* De kolommen die de aanvraag zélf zijn: wie, welke lodge, welke nachten, wat
 * de gast erbij schreef. Ze staan er sinds de tabel bestaat
 * (migrations/2026_05_15_unified_booking_requests.sql). Alles daarbuiten —
 * Meta-tracking en herkomst — is er ná die migratie bij gekomen en is
 * rapportage, geen aanvraag. Zie de terugval hieronder. */
const KERNKOLOMMEN = [
  "confirm_token", "bron", "guest_id", "gast_naam", "gast_email",
  "lodge", "check_in", "check_out", "nachten", "personen", "huisdieren",
  "bericht", "periode_tekst", "voorgestelde_prijs", "voorgestelde_prijs_label",
  "promo_code", "status", "legacy_terugkeer_id",
] as const;

function alleenKern(row: Record<string, unknown>): Record<string, unknown> {
  const uit: Record<string, unknown> = {};
  for (const k of KERNKOLOMMEN) {
    if (k in row) uit[k] = row[k];
  }
  return uit;
}

/** Helper voor dual-write — vangt fouten af zodat hoofdflow nooit breekt op nieuwe tabel. */
export async function safeInsertBookingRequest(row: Record<string, unknown>): Promise<string | null> {
  try {
    /* Elke aanvraag krijgt meteen een confirm-token, zodat de kolom nooit
     * NULL is. /api/bevestig weigert rijen zonder token, en deze regel zorgt
     * dat dat een bewuste keuze blijft in plaats van een gevolg van welk
     * insert-pad de rij toevallig aanmaakte. `send_offerte_v2` vervangt de
     * waarde zodra de host de offerte verstuurt. */
    const { randomBytes } = await import("crypto");
    const rowMetToken = { confirm_token: randomBytes(32).toString("hex"), ...row };

    const { data, error } = await getSupabase()
      .from("booking_requests")
      .insert(rowMetToken)
      .select("id")
      .single();
    if (error) {
      console.error("[booking_requests] insert failed:", JSON.stringify({
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        /* Niet de hele rij: die bevat gast_naam, gast_email en het vrije
         * berichtveld. Vercel-logs zijn breder toegankelijk dan de database
         * en gaan doorgaans naar een externe log-drain. Alleen wat nodig is
         * om te zien wat er misging. */
        row: { bron: row.bron, lodge: row.lodge, check_in: row.check_in, nachten: row.nachten },
      }));

      /* Terugval: nog één poging met alleen de kolommen die de aanvraag zelf
       * zijn. Ontbreekt er in de database een tracking- of attributiekolom —
       * bijvoorbeeld omdat een migratie niet is gedraaid — dan sneuvelde tot
       * nu toe de hele aanvraag op een veld dat alleen voor rapportage dient.
       * Een aanvraag zonder herkomst is oneindig veel beter dan geen
       * aanvraag: de gast wacht op een aanbod, de cijfers kunnen wachten. */
      const kern = alleenKern(rowMetToken);
      if (Object.keys(kern).length < Object.keys(rowMetToken).length) {
        const { data: kernData, error: kernError } = await getSupabase()
          .from("booking_requests")
          .insert(kern)
          .select("id")
          .single();
        if (!kernError) {
          console.warn(
            `[booking_requests] opgeslagen zonder tracking-kolommen: ${kernData?.id} (bron=${row.bron}). ` +
            "Controleer of alle migraties zijn gedraaid — de herkomst van deze aanvraag is niet vastgelegd."
          );
          return kernData?.id || null;
        }
        console.error("[booking_requests] ook de terugval faalde:", kernError.message);
      }

      return null;
    }
    console.log(`[booking_requests] inserted ${data?.id} (bron=${row.bron})`);
    return data?.id || null;
  } catch (e) {
    console.error("[booking_requests] insert threw:", e, "bron:", row.bron);
    return null;
  }
}

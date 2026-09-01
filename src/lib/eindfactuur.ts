/* De eindfactuur bij een boeking via een extern kanaal.
 *
 * Booking.com rekent alleen het logies met de gast af. Bedlinnen, eindschoonmaak
 * en toeristenbelasting innen wij zelf na afloop. Deze module rekent uit wat er
 * dan nog open staat, op basis van dezelfde fee_templates die een directe
 * offerte gebruikt — één plek voor de tarieven, zodat de twee kanalen niet uit
 * elkaar kunnen lopen.
 *
 * Bewust gedeeld tussen server en browser: de admin laat het bedrag live
 * meelopen terwijl je het aantal personen intikt, en de server rekent bij het
 * opslaan opnieuw. Twee implementaties zouden gegarandeerd gaan afwijken.
 */

export type FeeBasis = "eenmalig" | "per_nacht" | "per_persoon" | "per_persoon_per_nacht";

export type FeeSjabloon = {
  id: string;
  label: string;
  soort: "toeslag" | "korting" | "belasting";
  bedrag: number | string | null;
  percentage?: number | string | null;
  basis: FeeBasis;
  actief: boolean;
  volgorde: number;
};

export type FactuurRegel = {
  fee_template_id: string;
  label: string;
  soort: "toeslag" | "korting" | "belasting";
  basis: FeeBasis;
  /** Wat er per eenheid geldt, zoals het tarief op het moment van vastleggen. */
  tarief: number;
  aantal: number;
  bedrag: number;
  /** Leesbare onderbouwing, bijv. "4 personen × 3 nachten × € 1,50". */
  berekening: string;
};

export const BASIS_OMSCHRIJVING: Record<FeeBasis, string> = {
  eenmalig: "eenmalig",
  per_nacht: "per nacht",
  per_persoon: "per persoon",
  per_persoon_per_nacht: "p.p. per nacht",
};

/* Welke posten standaard op de eindfactuur horen.
 *
 * Schoonmaak, bedlinnen en toeristenbelasting gelden bij elk verblijf; die
 * staan aan. Een toeslag als "Huisdier" geldt alleen als er een hond mee is
 * geweest, en dat weet de export niet — die staat uit tot je hem aanvinkt.
 * Kortingen horen niet op een eindfactuur en blijven altijd uit. */
export function standaardAan(sjabloon: FeeSjabloon): boolean {
  if (sjabloon.soort === "korting") return false;
  if (sjabloon.soort === "belasting") return true;
  return /schoonmaak|bedlinnen|linnen|beddengoed/i.test(sjabloon.label);
}

function getal(v: number | string | null | undefined): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function aantalVoor(basis: FeeBasis, nachten: number, personen: number): number {
  switch (basis) {
    case "eenmalig": return 1;
    case "per_nacht": return nachten;
    case "per_persoon": return personen;
    case "per_persoon_per_nacht": return personen * nachten;
    default: return 0;
  }
}

function omschrijfBerekening(basis: FeeBasis, tarief: number, nachten: number, personen: number): string {
  const bedrag = `€ ${tarief.toFixed(2).replace(".", ",")}`;
  switch (basis) {
    case "eenmalig": return bedrag;
    case "per_nacht": return `${nachten} ${nachten === 1 ? "nacht" : "nachten"} × ${bedrag}`;
    case "per_persoon": return `${personen} ${personen === 1 ? "persoon" : "personen"} × ${bedrag}`;
    case "per_persoon_per_nacht":
      return `${personen} ${personen === 1 ? "persoon" : "personen"} × ${nachten} ${nachten === 1 ? "nacht" : "nachten"} × ${bedrag}`;
    default: return bedrag;
  }
}

export type Berekening = {
  regels: FactuurRegel[];
  totaal: number;
  /** Posten die niet uit te rekenen zijn; de admin ziet waarom. */
  overgeslagen: { label: string; reden: string }[];
};

/**
 * Rekent de eindfactuur uit.
 *
 * @param gekozen  fee_template_id's die meetellen. Niet meegegeven (undefined)
 *                 betekent: neem de standaardkeuze — zo levert een verse
 *                 boeking meteen een bruikbaar voorstel op.
 */
export function berekenEindfactuur(
  sjablonen: FeeSjabloon[],
  nachten: number,
  personen: number,
  gekozen?: Set<string> | string[],
): Berekening {
  const keuze = gekozen === undefined ? null : new Set(gekozen);
  const regels: FactuurRegel[] = [];
  const overgeslagen: { label: string; reden: string }[] = [];

  for (const s of [...sjablonen].sort((a, b) => a.volgorde - b.volgorde)) {
    if (!s.actief) continue;
    const meedoen = keuze ? keuze.has(s.id) : standaardAan(s);
    if (!meedoen) continue;

    const tarief = getal(s.bedrag);
    if (tarief === 0) {
      /* Een sjabloon zonder bedrag is meestal een percentage-regel, en een
       * percentage waarvan is bij een extern kanaal niet eenduidig: het logies
       * staat bij Booking.com, niet bij ons. Liever benoemen dan gokken. */
      overgeslagen.push({
        label: s.label,
        reden: getal(s.percentage) > 0 ? "percentageregel — vul een vast bedrag in" : "geen bedrag ingevuld",
      });
      continue;
    }

    const aantal = aantalVoor(s.basis, nachten, personen);
    if (aantal <= 0) {
      overgeslagen.push({ label: s.label, reden: personen <= 0 ? "aantal personen ontbreekt" : "geen nachten" });
      continue;
    }

    const bedrag = Math.round(tarief * aantal * 100) / 100;
    regels.push({
      fee_template_id: s.id,
      label: s.label,
      soort: s.soort,
      basis: s.basis,
      tarief,
      aantal,
      bedrag,
      berekening: omschrijfBerekening(s.basis, tarief, nachten, personen),
    });
  }

  const totaal = Math.round(regels.reduce((som, r) => som + r.bedrag, 0) * 100) / 100;
  return { regels, totaal, overgeslagen };
}

export type EindfactuurStatus = "open" | "verstuurd" | "voldaan" | "nvt";

export const STATUS_LABELS: Record<EindfactuurStatus, string> = {
  open: "Nog te factureren",
  verstuurd: "Factuur verstuurd",
  voldaan: "Betaald",
  nvt: "Niet van toepassing",
};

export function isGeldigeStatus(v: unknown): v is EindfactuurStatus {
  return v === "open" || v === "verstuurd" || v === "voldaan" || v === "nvt";
}

/** Nachten tussen twee ISO-datums; 0 als een van beide ontbreekt of onlogisch is. */
export function telNachten(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const n = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

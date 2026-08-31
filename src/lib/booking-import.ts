/* Inlezen en normaliseren van de maandelijkse reserveringsexport van Booking.com.
 *
 * Deze module doet alleen het denkwerk: bestand → gecontroleerde regels →
 * verschil met wat er al in de database staat. Wegschrijven gebeurt in
 * src/app/api/admin/data/_import.ts, en pas nadat de admin het voorstel heeft
 * gezien. Zo blijft de riskante stap altijd een bewuste klik.
 */

import { leesXls, isXlsBestand, XlsLeesFout } from "./xls";
import type { LodgeId } from "@/data/lodge";

/* ── Bestandsformaten ─────────────────────────────────────────────────── */

export type Formaat = "xls" | "csv";

/* Leest .xls of CSV/TSV en geeft rijen met tekstcellen terug.
 *
 * Het formaat gaat mee terug omdat het uitmaakt hoe zeker een getal is: in een
 * .xls staan bedragen als echt getal opgeslagen, in een CSV als tekst waarvan
 * het scheidingsteken soms twee lezingen toelaat. */
export function leesBestand(buf: Buffer): { rijen: string[][]; formaat: Formaat } {
  if (isXlsBestand(buf)) return { rijen: leesXls(buf), formaat: "xls" };
  if (buf.subarray(0, 2).toString("hex") === "504b") {
    // ZIP-signatuur: dit is een .xlsx, niet de export die Booking.com levert.
    throw new XlsLeesFout("Dit lijkt een .xlsx-bestand. Lever de export van Booking.com aan (.xls) of sla hem op als CSV.");
  }
  return { rijen: leesCsv(decodeerTekst(buf)), formaat: "csv" };
}

/* Booking.com levert soms UTF-16 met BOM. Zonder deze controle zie je dan bij
 * elk teken een extra nulbyte en klopt geen enkele kolomnaam meer. */
function decodeerTekst(buf: Buffer): string {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString("utf16le");
  if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
    const swapped = Buffer.from(buf.subarray(2));
    swapped.swap16();
    return swapped.toString("utf16le");
  }
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return buf.subarray(3).toString("utf8");
  return buf.toString("utf8");
}

/** Bepaalt het scheidingsteken op de eerste regel buiten aanhalingstekens. */
function bepaalScheidingsteken(tekst: string): string {
  const eersteRegel = tekst.split(/\r?\n/, 1)[0] ?? "";
  const kandidaten = [";", ",", "\t", "|"];
  let beste = ",";
  let meeste = 0;
  for (const teken of kandidaten) {
    let aantal = 0;
    let inQuote = false;
    for (const c of eersteRegel) {
      if (c === '"') inQuote = !inQuote;
      else if (c === teken && !inQuote) aantal++;
    }
    if (aantal > meeste) { meeste = aantal; beste = teken; }
  }
  return beste;
}

export function leesCsv(tekst: string): string[][] {
  const sep = bepaalScheidingsteken(tekst);
  const rijen: string[][] = [];
  let rij: string[] = [];
  let veld = "";
  let inQuote = false;

  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (inQuote) {
      if (c === '"') {
        if (tekst[i + 1] === '"') { veld += '"'; i++; }   // ontsnapt aanhalingsteken
        else inQuote = false;
      } else veld += c;
      continue;
    }
    if (c === '"') { inQuote = true; continue; }
    if (c === sep) { rij.push(veld); veld = ""; continue; }
    if (c === "\n") { rij.push(veld); rijen.push(rij); rij = []; veld = ""; continue; }
    if (c === "\r") continue;
    veld += c;
  }
  if (veld !== "" || rij.length > 0) { rij.push(veld); rijen.push(rij); }

  return rijen.filter(r => r.some(v => v.trim() !== ""));
}

/* ── Kolommen herkennen ───────────────────────────────────────────────── */

type Kolom = "accommodatie" | "locatie" | "naam" | "aankomst" | "vertrek" | "geboekt_op"
  | "status" | "bedrag" | "commissie" | "valuta" | "reserveringsnummer";

/* Booking.com wisselt de exporttaal met de taalinstelling van het extranet, en
 * hernoemt kolommen af en toe. Daarom herkennen we op meerdere varianten in
 * plaats van op een vaste kolomvolgorde. */
const KOLOM_PATRONEN: { kolom: Kolom; patronen: string[] }[] = [
  { kolom: "reserveringsnummer", patronen: ["reserveringsnummer", "boekingsnummer", "reservation number", "booking number", "book number"] },
  { kolom: "accommodatie", patronen: ["naam accommodatie", "accommodatie", "property name", "property", "room", "kamer"] },
  { kolom: "locatie", patronen: ["locatie", "location", "adres", "address"] },
  { kolom: "naam", patronen: ["naam boeker", "boeker", "guest name", "booker name", "gastnaam", "naam gast"] },
  { kolom: "aankomst", patronen: ["aankomst", "check-in", "check in", "checkin", "arrival"] },
  { kolom: "vertrek", patronen: ["vertrek", "check-out", "check out", "checkout", "departure"] },
  { kolom: "geboekt_op", patronen: ["geboekt op", "booked on", "reserveringsdatum", "booked"] },
  { kolom: "status", patronen: ["status"] },
  { kolom: "bedrag", patronen: ["totaalbedrag", "totaal", "total amount", "price", "prijs", "amount"] },
  { kolom: "commissie", patronen: ["commissie", "commission"] },
  { kolom: "valuta", patronen: ["valuta", "currency"] },
];

function normaliseerKop(s: string): string {
  return s.toLowerCase().replace(/[ ]/g, " ").replace(/\s+/g, " ").trim();
}

/** Zoekt de koprij en koppelt kolomnamen aan kolomnummers. */
export function vindKolommen(rijen: string[][]): { koprijIndex: number; kolommen: Partial<Record<Kolom, number>> } | null {
  /* De koprij staat meestal bovenaan, maar een export kan er een titelregel
   * boven zetten. We zoeken de eerste rij waarin we aankomst, vertrek én een
   * naam herkennen — minder dan dat is geen bruikbare export. */
  for (let r = 0; r < Math.min(rijen.length, 15); r++) {
    const kolommen: Partial<Record<Kolom, number>> = {};
    rijen[r].forEach((cel, i) => {
      const kop = normaliseerKop(cel);
      if (!kop) return;
      for (const { kolom, patronen } of KOLOM_PATRONEN) {
        if (kolommen[kolom] !== undefined) continue;
        if (patronen.some(p => kop === p || kop.startsWith(p))) { kolommen[kolom] = i; break; }
      }
    });
    if (kolommen.aankomst !== undefined && kolommen.vertrek !== undefined && kolommen.naam !== undefined) {
      return { koprijIndex: r, kolommen };
    }
  }
  return null;
}

/* ── Waarden omzetten ─────────────────────────────────────────────────── */

const MAANDEN: Record<string, number> = {
  januari: 1, februari: 2, maart: 3, april: 4, mei: 5, juni: 6, juli: 7,
  augustus: 8, september: 9, oktober: 10, november: 11, december: 12,
  jan: 1, feb: 2, mrt: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, may: 5, june: 6, july: 7, august: 8, october: 10,
  mar: 3, oct: 10,
};

/** Zet een datum uit de export om naar ISO (jjjj-mm-dd). Geeft null bij twijfel. */
export function parseerDatum(ruw: string): string | null {
  const s = (ruw || "").trim().toLowerCase();
  if (!s) return null;

  // "25 februari 2027" / "25 feb 2027"
  const nl = s.match(/^(\d{1,2})\s+([a-zé]+)\.?\s+(\d{4})$/);
  if (nl) {
    const maand = MAANDEN[nl[2]];
    if (maand) return maakIso(Number(nl[3]), maand, Number(nl[1]));
  }

  // "2027-02-25"
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return maakIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  /* "25-02-2027" en "25/02/2027". Bewust géén ondersteuning voor het
   * Amerikaanse mm/dd/jjjj: 03/04/2027 zou dan twee geldige lezingen hebben
   * en een stille maand-dagverwisseling is precies de fout die deze import
   * moet voorkomen. Dagen boven 12 zouden we nog kunnen redden, maar dan is
   * het gedrag afhankelijk van de datum — liever consequent weigeren. */
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) return maakIso(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]));

  return null;
}

function maakIso(jaar: number, maand: number, dag: number): string | null {
  if (maand < 1 || maand > 12 || dag < 1 || dag > 31 || jaar < 2000 || jaar > 2100) return null;
  const d = new Date(Date.UTC(jaar, maand - 1, dag));
  // Vangt 31 februari: de Date-constructor schuift die stilzwijgend door.
  if (d.getUTCMonth() !== maand - 1 || d.getUTCDate() !== dag) return null;
  return `${jaar}-${String(maand).padStart(2, "0")}-${String(dag).padStart(2, "0")}`;
}

export type BedragResultaat = { waarde: number | null; ambigu: boolean };

/* Zet een bedrag om naar een getal. Herkent zowel 1.006,60 als 1006.60.
 *
 * Eén vorm blijft principieel onbeslisbaar: staat er precies één scheidingsteken
 * met drie cijfers erachter, dan kan "1.006" duizend-en-zes zijn (Nederlandse
 * duizendtalpunt) én 1,006 (drie decimalen). Beide vormen komen in deze export
 * voor — de commissie heeft drie decimalen, het totaalbedrag loopt over de
 * duizend. We kiezen dan consequent de decimale lezing, want zo levert
 * Booking.com de getallen aan, maar melden het geval als 'ambigu' zodat de
 * regel met een waarschuwing in het voorstel belandt. Een factor duizend fout
 * in je omzet is te erg om stilzwijgend te gokken. */
export function parseerBedrag(ruw: string): BedragResultaat {
  let s = (ruw || "").replace(/[\s\u00a0]/g, "").replace(/[€$£]|eur|usd|gbp/gi, "").trim();
  if (!s) return { waarde: null, ambigu: false };

  const komma = s.lastIndexOf(",");
  const punt = s.lastIndexOf(".");
  let ambigu = false;

  if (komma > -1 && punt > -1) {
    // Het laatste van de twee is het decimaalteken, de ander scheidt duizendtallen.
    if (komma > punt) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (komma > -1 || punt > -1) {
    const teken = komma > -1 ? "," : ".";
    if (s.split(teken).length > 2) {
      // Twee keer hetzelfde teken kan alleen duizendtallen zijn: 1.234.567
      s = s.split(teken).join("");
    } else {
      if (new RegExp(`^\\d{1,3}\\${teken}\\d{3}$`).test(s)) ambigu = true;
      if (komma > -1) s = s.replace(",", ".");
    }
  }

  const n = Number(s);
  return { waarde: Number.isFinite(n) ? n : null, ambigu };
}

export type ImportStatus = "actief" | "geannuleerd" | "no_show";

export function parseerStatus(ruw: string): ImportStatus {
  const s = (ruw || "").toLowerCase().trim();
  if (!s) return "actief";
  if (s.includes("no show") || s.includes("no_show") || s.includes("noshow")) return "no_show";
  if (s.includes("annul") || s.includes("cancel")) return "geannuleerd";
  return "actief";
}

/* Lodgekoppeling. Het huisnummer in de locatiekolom is de betrouwbaarste
 * aanwijzing (6p 55 en 6p 57 zijn de twee lodges); de accommodatienaam is het
 * vangnet voor als Booking.com het adresveld anders opmaakt. */
export function bepaalLodge(accommodatie: string, locatie: string): LodgeId | null {
  const alles = `${locatie} ${accommodatie}`.toLowerCase();
  if (/\b55\b/.test(alles)) return "lodge_1";
  if (/\b57\b/.test(alles)) return "lodge_2";
  if (alles.includes("heide")) return "lodge_1";
  if (alles.includes("eik")) return "lodge_2";
  return null;
}

/* ── Regels ───────────────────────────────────────────────────────────── */

export type ImportRegel = {
  regelnummer: number;              // 1-gebaseerd, zoals de admin het in Excel ziet
  externId: string;
  gastNaam: string;
  lodge: LodgeId | null;
  checkIn: string | null;
  checkOut: string | null;
  geboektOp: string | null;
  status: ImportStatus;
  bedrag: number | null;
  commissie: number | null;
  valuta: string;
  nachten: number | null;
  fouten: string[];                 // regel is onbruikbaar
  waarschuwingen: string[];         // regel is bruikbaar, maar kijk even mee
};

export type LeesResultaat = {
  regels: ImportRegel[];
  bestandsfout: string | null;
  formaat: Formaat | null;
};

export function leesReserveringen(buf: Buffer): LeesResultaat {
  let rijen: string[][];
  let formaat: Formaat;
  try {
    ({ rijen, formaat } = leesBestand(buf));
  } catch (e) {
    const bericht = e instanceof XlsLeesFout ? e.message : "Kon het bestand niet lezen. Sla het op als CSV en probeer opnieuw.";
    return { regels: [], bestandsfout: bericht, formaat: null };
  }

  const kop = vindKolommen(rijen);
  if (!kop) {
    return { regels: [], bestandsfout: "Geen kolomkoppen herkend. Verwacht ten minste 'Aankomst', 'Vertrek' en 'Naam boeker'.", formaat };
  }

  const { koprijIndex, kolommen } = kop;
  const cel = (rij: string[], k: Kolom) => {
    const i = kolommen[k];
    return i === undefined ? "" : (rij[i] ?? "").trim();
  };

  const regels: ImportRegel[] = [];
  const gezienIds = new Map<string, number>();

  for (let r = koprijIndex + 1; r < rijen.length; r++) {
    const rij = rijen[r];
    if (rij.every(v => !v.trim())) continue;

    const fouten: string[] = [];
    const waarschuwingen: string[] = [];

    /* Het reserveringsnummer is de sleutel waarop we later herkennen of we
     * deze boeking al hebben. Zonder nummer kunnen we niet garanderen dat een
     * volgende import geen dubbele regel maakt, dus dat weigeren we. */
    const externId = cel(rij, "reserveringsnummer").replace(/[^0-9A-Za-z-]/g, "");
    if (!externId) fouten.push("Geen reserveringsnummer");
    else if (gezienIds.has(externId)) fouten.push(`Reserveringsnummer staat ook op regel ${gezienIds.get(externId)}`);
    else gezienIds.set(externId, r + 1);

    const gastNaam = cel(rij, "naam");
    if (!gastNaam) waarschuwingen.push("Geen gastnaam in de export");

    const lodge = bepaalLodge(cel(rij, "accommodatie"), cel(rij, "locatie"));
    if (!lodge) fouten.push("Kan niet bepalen om welke lodge het gaat");

    const checkIn = parseerDatum(cel(rij, "aankomst"));
    const checkOut = parseerDatum(cel(rij, "vertrek"));
    if (!checkIn) fouten.push(`Aankomstdatum onleesbaar: "${cel(rij, "aankomst")}"`);
    if (!checkOut) fouten.push(`Vertrekdatum onleesbaar: "${cel(rij, "vertrek")}"`);

    let nachten: number | null = null;
    if (checkIn && checkOut) {
      nachten = Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
      if (nachten <= 0) fouten.push("Vertrek ligt niet na aankomst");
      else if (nachten > 60) waarschuwingen.push(`Ongebruikelijk lang verblijf (${nachten} nachten)`);
    }

    const bedragUitslag = parseerBedrag(cel(rij, "bedrag"));
    const commissieUitslag = parseerBedrag(cel(rij, "commissie"));
    const bedrag = bedragUitslag.waarde;
    const commissie = commissieUitslag.waarde;
    const status = parseerStatus(cel(rij, "status"));
    if (status === "actief" && bedrag === null) waarschuwingen.push("Geen totaalbedrag — telt niet mee in de omzet");
    /* In een .xls is het getal al gedecodeerd; alleen bij CSV kan het
     * scheidingsteken twee kanten op. */
    if (bedragUitslag.ambigu && formaat === "csv") {
      waarschuwingen.push(`Totaalbedrag "${cel(rij, "bedrag")}" is dubbelzinnig — gelezen als ${bedrag?.toFixed(2)}, maar het kan ook ${((bedrag ?? 0) * 1000).toFixed(2)} zijn`);
    }
    if (commissieUitslag.ambigu && formaat === "csv") {
      waarschuwingen.push(`Commissie "${cel(rij, "commissie")}" is dubbelzinnig — gelezen als ${commissie?.toFixed(2)}`);
    }

    const valuta = (cel(rij, "valuta") || "EUR").toUpperCase().slice(0, 3);
    if (valuta !== "EUR") waarschuwingen.push(`Bedrag staat in ${valuta}, niet in euro's`);

    regels.push({
      regelnummer: r + 1,
      externId, gastNaam, lodge, checkIn, checkOut,
      geboektOp: parseerDatum(cel(rij, "geboekt_op")),
      status, bedrag, commissie, valuta, nachten,
      fouten, waarschuwingen,
    });
  }

  if (regels.length === 0) {
    return { regels: [], bestandsfout: "Geen reserveringen gevonden onder de kolomkoppen.", formaat };
  }
  return { regels, bestandsfout: null, formaat };
}

/* ── Verschil met de database ─────────────────────────────────────────── */

export type BestaandVerblijf = {
  id: string;
  lodge: string;
  check_in: string;
  check_out: string;
  status: string;
  extern_id: string | null;
  gast_naam: string | null;
  extern_bedrag: number | string | null;
  extern_commissie: number | string | null;
};

/** Bezette periode die niet van deze import komt — voor conflictdetectie. */
export type BezettePeriode = { lodge: string; check_in: string; check_out: string; wie: string; externId: string | null };

export type Soort = "nieuw" | "ongewijzigd" | "gewijzigd" | "geannuleerd" | "overgeslagen" | "fout";

export type Voorstel = {
  regel: ImportRegel;
  soort: Soort;
  bestaandId: string | null;
  wijzigingen: { veld: string; van: string; naar: string }[];
  conflicten: string[];
  toelichting: string;
};

const DATUM_VELDEN: Record<string, string> = {
  check_in: "Aankomst", check_out: "Vertrek", lodge: "Lodge",
  gast_naam: "Gastnaam", extern_bedrag: "Totaalbedrag", extern_commissie: "Commissie",
};

function alsGetal(v: number | string | null): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* Bedragen komen als numeric uit Postgres en als float uit de export; op twee
 * decimalen vergelijken voorkomt dat 772.6 en 772.60 als wijziging tellen. */
function bedragGelijk(a: number | null, b: number | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return Math.abs(a - b) < 0.005;
}

function overlapt(aIn: string, aUit: string, bIn: string, bUit: string): boolean {
  // Wisseldag: vertrek op de dag dat de volgende gast aankomt is geen overlap.
  return aIn < bUit && bIn < aUit;
}

export function maakVoorstellen(
  regels: ImportRegel[],
  bestaand: BestaandVerblijf[],
  bezet: BezettePeriode[],
): Voorstel[] {
  const perExternId = new Map<string, BestaandVerblijf>();
  for (const b of bestaand) {
    if (b.extern_id) perExternId.set(b.extern_id, b);
  }

  /* De regels uit het bestand tellen zelf ook mee als bezette periode. Zonder
   * dit zou een dubbele boeking die volledig binnen één export valt pas bij de
   * import van de vólgende maand opvallen — en juist de eerste import bevat de
   * hele historie. Regels die al in de database staan zitten al in `bezet`;
   * die filtert de vergelijking hieronder op reserveringsnummer weg. */
  const uitBestand: BezettePeriode[] = regels
    .filter(r => r.fouten.length === 0 && r.status === "actief" && r.lodge && r.checkIn && r.checkOut)
    .map(r => ({
      lodge: r.lodge as string,
      check_in: r.checkIn as string,
      check_out: r.checkOut as string,
      wie: r.gastNaam || `reservering ${r.externId}`,
      externId: r.externId,
    }));

  const alleBezet = [
    ...bezet,
    ...uitBestand.filter(u => !bezet.some(b => b.externId === u.externId)),
  ];

  return regels.map(regel => {
    if (regel.fouten.length > 0) {
      return { regel, soort: "fout" as const, bestaandId: null, wijzigingen: [], conflicten: [], toelichting: regel.fouten.join(" · ") };
    }

    const bestaandeRij = perExternId.get(regel.externId) ?? null;

    if (regel.status !== "actief") {
      if (!bestaandeRij) {
        return {
          regel, soort: "overgeslagen" as const, bestaandId: null, wijzigingen: [], conflicten: [],
          toelichting: regel.status === "no_show" ? "No-show die we niet in het overzicht hadden" : "Geannuleerd en stond nog niet in het overzicht",
        };
      }
      if (bestaandeRij.status === "geannuleerd") {
        return { regel, soort: "ongewijzigd" as const, bestaandId: bestaandeRij.id, wijzigingen: [], conflicten: [], toelichting: "Stond al als geannuleerd" };
      }
      return {
        regel, soort: "geannuleerd" as const, bestaandId: bestaandeRij.id, wijzigingen: [], conflicten: [],
        toelichting: regel.status === "no_show" ? "No-show — wordt op geannuleerd gezet" : "Wordt op geannuleerd gezet",
      };
    }

    /* Conflictcontrole: overlapt deze boeking met een periode die van iets
     * anders komt? Dat is precies het geval waarin overtypen misgaat, dus we
     * blokkeren hem niet maar zetten hem wel apart voor je. */
    const conflicten = alleBezet
      .filter(p =>
        p.lodge === regel.lodge &&
        p.externId !== regel.externId &&
        regel.checkIn && regel.checkOut &&
        overlapt(regel.checkIn, regel.checkOut, p.check_in, p.check_out))
      .map(p => `${p.wie} (${p.check_in} — ${p.check_out})`);

    if (!bestaandeRij) {
      return { regel, soort: "nieuw" as const, bestaandId: null, wijzigingen: [], conflicten, toelichting: "Nieuwe boeking" };
    }

    const wijzigingen: { veld: string; van: string; naar: string }[] = [];
    const vergelijk = (veld: string, van: string | null, naar: string | null) => {
      if ((van ?? "") !== (naar ?? "")) wijzigingen.push({ veld: DATUM_VELDEN[veld] ?? veld, van: van ?? "—", naar: naar ?? "—" });
    };
    vergelijk("check_in", bestaandeRij.check_in?.slice(0, 10) ?? null, regel.checkIn);
    vergelijk("check_out", bestaandeRij.check_out?.slice(0, 10) ?? null, regel.checkOut);
    vergelijk("lodge", bestaandeRij.lodge, regel.lodge);
    if ((bestaandeRij.gast_naam ?? "") !== regel.gastNaam && regel.gastNaam) {
      vergelijk("gast_naam", bestaandeRij.gast_naam, regel.gastNaam);
    }
    if (!bedragGelijk(alsGetal(bestaandeRij.extern_bedrag), regel.bedrag)) {
      vergelijk("extern_bedrag", formatBedrag(alsGetal(bestaandeRij.extern_bedrag)), formatBedrag(regel.bedrag));
    }
    if (!bedragGelijk(alsGetal(bestaandeRij.extern_commissie), regel.commissie)) {
      vergelijk("extern_commissie", formatBedrag(alsGetal(bestaandeRij.extern_commissie)), formatBedrag(regel.commissie));
    }

    if (wijzigingen.length === 0) {
      return { regel, soort: "ongewijzigd" as const, bestaandId: bestaandeRij.id, wijzigingen: [], conflicten, toelichting: "Al verwerkt" };
    }
    return { regel, soort: "gewijzigd" as const, bestaandId: bestaandeRij.id, wijzigingen, conflicten, toelichting: "Gewijzigd bij Booking.com" };
  });
}

function formatBedrag(n: number | null): string | null {
  return n === null ? null : n.toFixed(2);
}

export function telVoorstellen(voorstellen: Voorstel[]): Record<Soort, number> & { conflicten: number } {
  const tel = { nieuw: 0, ongewijzigd: 0, gewijzigd: 0, geannuleerd: 0, overgeslagen: 0, fout: 0, conflicten: 0 };
  for (const v of voorstellen) {
    tel[v.soort]++;
    if (v.conflicten.length > 0) tel.conflicten++;
  }
  return tel;
}

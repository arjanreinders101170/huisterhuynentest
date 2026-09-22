/* ═══ Inhoud van de lodgepagina (nieuwe opmaak) ═══
 *
 * De cijfers, voorzieningen en inventaris hieronder zijn woordelijk
 * overgenomen uit de bestaande lodgepagina's (lib/landing-seed.ts,
 * slugs lodge-de-heide en lodge-de-eik). Dit bestand is dus een andere
 * vórm van dezelfde feiten, geen tweede versie ervan: wijkt er iets af,
 * dan is de seed leidend en klopt dit bestand niet.
 *
 * Wat hier bewust níét staat: een beoordelingscijfer. Het ontwerp toonde
 * er een in de vertrouwensbalk, maar de site kent geen vastgelegd cijfer
 * (de reviews komen live uit Google) en een verzonnen waardering is een
 * feitelijke claim die je niet kunt waarmaken.
 */

import { PRICE_FROM_EUR } from "@/lib/site";

export interface LodgeFoto {
  src: string;
  alt: string;
  /** object-position; standaard "center". */
  focus?: string;
}

export interface LodgeVoorziening {
  icoon: string;
  tekst: string;
}

export interface LodgePaginaData {
  /** Sleutel in de URL van de preview: /preview/<key>. */
  key: "de-heide" | "de-eik";
  /** De echte, geïndexeerde pagina over deze lodge. */
  canoniekePagina: string;
  /** Waarde van ?lodge= waarmee het formulier op deze lodge opent. */
  lodgeParam: "heide" | "eik";
  naam: string;
  eyebrow: string;
  h1: string;
  tagline: string;
  intro: string;
  /** De drie harde cijfers op de hero-foto. */
  kerncijfers: { icoon: string; tekst: string }[];
  hero: LodgeFoto;
  /** Vier foto's in het raster naast de hero. */
  raster: LodgeFoto[];
  voorzieningen: LodgeVoorziening[];
  labels: string[];
  /** "Wat er in de lodge zit" — in twee kolommen afgebeeld. */
  inventaris: string[];
}

const HEIDE: LodgePaginaData = {
  key: "de-heide",
  canoniekePagina: "/lodge-de-heide",
  lodgeParam: "heide",
  naam: "Lodge De Heide",
  eyebrow: "Zeijen · Drenthe",
  h1: "Lodge De Heide",
  tagline: "Boutique lodge met privé-hottub en uitzicht op de heide",
  intro:
    "Van de twee lodges op het terrein is De Heide degene met het uitzicht. Vanaf het terras kijkt u over heide en bos, zonder dat er ook maar één ander gebouw in beeld staat. De hottub staat er het hele jaar warm bij, op 38 °C. Ervoor ligt de heide, en verder niets.",
  kerncijfers: [
    { icoon: "personen", tekst: "Max. 4 personen" },
    { icoon: "slaapkamer", tekst: "2 slaapkamers" },
    { icoon: "badkamer", tekst: "1 badkamer" },
  ],
  hero: {
    src: "/lodge-heide.jpg",
    alt: "Lodge De Heide met privé-hottub op het terras en panoramisch uitzicht over de Drentse heide bij Zeijen",
    focus: "center 55%",
  },
  raster: [
    { src: "/heide3.jpg", alt: "Bloeiende heide met zandpad en vliegdennen in de omgeving van Zeijen", focus: "center 60%" },
    { src: "/welness_drenthe.jpg", alt: "Kaarsen en badstenen — de wellnesssfeer rond de privé-hottub" },
    { src: "/heide1.jpg", alt: "Schaapskudde met herder op de Drentse heide vlak bij de lodge" },
    { src: "/wandel_drenthe.jpg", alt: "Wandelpad door het Drentse bos, vanaf de deur van de lodge te lopen" },
  ],
  voorzieningen: [
    { icoon: "wifi", tekst: "Gratis snel WiFi" },
    { icoon: "hottub", tekst: "Privé-hottub" },
    { icoon: "parkeren", tekst: "Gratis parkeren" },
    { icoon: "huisdier", tekst: "Hond in overleg welkom" },
    { icoon: "laadpaal", tekst: "Laadstation bij de lodge" },
    { icoon: "sleutel", tekst: "Self check-in tot middernacht" },
  ],
  labels: ["Vrij uitzicht, geen buren", "Midden in de natuur", "Ideaal voor stellen & gezinnen", "Privé-hottub"],
  inventaris: [
    "Twee slaapkamers: een 2-persoonsbed en twee 1-persoonsbedden",
    "Badkamer met douche en toilet",
    "Privé-hottub op het terras (38 °C, het hele jaar)",
    "Volledig uitgeruste keuken met oven en vaatwasser",
    "Koffieapparaat, waterkoker, koelkast en combimagnetron",
    "Woonkamer met eettafel voor vier en televisie",
    "Vrij uitzicht over heide en bos, geen ander gebouw in beeld",
    "60 m² voor maximaal vier personen",
    "Gratis parkeren op eigen terrein",
    "Digitale sloten: inchecken kan tot middernacht",
  ],
};

const EIK: LodgePaginaData = {
  key: "de-eik",
  canoniekePagina: "/lodge-de-eik",
  lodgeParam: "eik",
  naam: "Lodge De Eik",
  eyebrow: "Zeijen · Drenthe",
  h1: "Lodge De Eik",
  tagline: "Boutique lodge met eigen buitensauna, buitenkeuken en privé-hottub",
  intro:
    "De Eik is het huis waar alles buiten gebeurt. Onder de oude eiken staat een buitenkeuken met BBQ, met de tafel ernaast, de hottub op hetzelfde terras en een eigen barrelsauna in de tuin. Binnen: hoge plafonds, ruimte voor vier en niets dat aan een vakantiepark doet denken.",
  kerncijfers: [
    { icoon: "personen", tekst: "Max. 4 personen" },
    { icoon: "sauna", tekst: "Eigen buitensauna" },
    { icoon: "bbq", tekst: "Buitenkeuken met BBQ" },
  ],
  hero: {
    src: "/lodge-eik.jpg",
    alt: "Lodge De Eik in Zeijen onder oude eiken, met buitenkeuken, BBQ en privé-hottub op het terras",
    focus: "center 50%",
  },
  raster: [
    { src: "/welness_drenthe.jpg", alt: "Kaarsen en badstenen — de sfeer van de eigen barrelsauna naast het terras" },
    { src: "/borrel1.jpg", alt: "Borrel op het terras onder de eiken" },
    { src: "/heide3.jpg", alt: "Bloeiende heide met zandpad in de omgeving van Zeijen", focus: "center 60%" },
    { src: "/wandel_drenthe.jpg", alt: "Wandelpad door het Drentse bos, vanaf de deur van de lodge te lopen" },
  ],
  voorzieningen: [
    { icoon: "wifi", tekst: "Gratis snel WiFi" },
    { icoon: "sauna", tekst: "Eigen buitensauna" },
    { icoon: "hottub", tekst: "Privé-hottub" },
    { icoon: "parkeren", tekst: "Gratis parkeren" },
    { icoon: "huisdier", tekst: "Hond in overleg welkom" },
    { icoon: "laadpaal", tekst: "Laadstation bij de lodge" },
  ],
  labels: ["Ruimste van de twee", "Sauna én hottub", "Samen buiten eten", "Het hele jaar genieten"],
  inventaris: [
    "Ruimte voor maximaal vier personen, verdeeld over twee slaapplekken",
    "Hoge plafonds — ruimer dan de vierkante meters doen vermoeden",
    "Eigen barrelsauna in de tuin, zonder reservering of tijdslot",
    "Privé-hottub op het terras (38 °C, het hele jaar)",
    "Buitenkeuken met BBQ onder de eiken",
    "Volledig uitgeruste binnenkeuken met oven en vaatwasser",
    "Koffieapparaat, waterkoker, koelkast en combimagnetron",
    "Eettafel op hetzelfde terras als de buitenkeuken",
    "Gratis parkeren op eigen terrein",
    "Digitale sloten: inchecken kan tot middernacht",
  ],
};

/* ── De praktische kaart ──
 * Praktische informatie, huisregels en annuleren zijn in de seed voor
 * beide lodges woordelijk gelijk, dus staan ze hier één keer. Wijkt er
 * ooit iets af per lodge, dan verhuizen ze naar LodgePaginaData.
 *
 * "Huisdieren toegestaan (€25)" staat zo in de huisregels van de huidige
 * pagina, terwijl de veelgestelde vragen op diezelfde pagina zeggen "in
 * overleg". Hier één formulering, zodat de pagina zichzelf niet
 * tegenspreekt — en dezelfde als bij de voorzieningen hierboven.
 */
export const PRAKTISCH: { label: string; waarde: string }[] = [
  { label: "Geschikt voor", waarde: "1 – 4 personen" },
  { label: "Verhuurperiodes", waarde: "Midweek (ma – vr), weekend (vr – zo) of week (ma – zo)" },
  { label: "Inchecken", waarde: "Van 15:00 tot 21:00" },
  { label: "Uitchecken", waarde: "Uiterlijk 11:00" },
  { label: "Prijs", waarde: `Vanaf € ${PRICE_FROM_EUR},- per nacht voor de hele lodge, niet per persoon` },
  { label: "Bijkomende kosten", waarde: "Eindschoonmaak en toeristenbelasting, apart vermeld. Geen boekingskosten." },
];

export const PRAKTISCH_NOOT =
  "Later aankomen dan 21:00 kan zonder extra kosten: de lodge heeft digitale sloten die tot middernacht werken, en er is geen receptie waar u zich hoeft te melden.";

export const HUISREGELS: { icoon: string; tekst: string }[] = [
  { icoon: "nietRoken", tekst: "Niet roken binnen" },
  { icoon: "huisdier", tekst: "Hond in overleg (€ 25)" },
  { icoon: "geenFeest", tekst: "Geen feesten of evenementen" },
];

export const HUISREGELS_EXTRA: string[] = [
  "Tussen 22:00 en 08:00 uur geldt de nachtrust.",
  "Roken mag buiten, op de daarvoor bestemde plek.",
  "Alleen de directe omgeving van deze accommodatie is vuurwerkvrij.",
];

/* De staffel stond als vier zinnen met vinkjes ervoor. Een vinkje belooft
 * iets goeds, en "geen restitutie" is dat niet — als percentages onder
 * elkaar is het in één blik te overzien. */
export const ANNULEREN: { periode: string; deel: string; bij?: string; niets?: boolean }[] = [
  { periode: "Tot 60 dagen voor aankomst", deel: "100%", bij: "Op € 25 administratiekosten na" },
  { periode: "60 tot 30 dagen voor aankomst", deel: "70%" },
  { periode: "30 tot 14 dagen voor aankomst", deel: "50%" },
  { periode: "14 tot 7 dagen voor aankomst", deel: "25%" },
  { periode: "Binnen 7 dagen voor aankomst", deel: "0%", bij: "Geen restitutie", niets: true },
];

export const LODGE_PAGINAS: LodgePaginaData[] = [HEIDE, EIK];

export function lodgePagina(key: string): LodgePaginaData | undefined {
  return LODGE_PAGINAS.find((l) => l.key === key);
}

/** De ándere lodge — voor de vergelijkingslink onderaan de pagina. */
export function andereLodgePagina(key: string): LodgePaginaData {
  return key === "de-heide" ? EIK : HEIDE;
}

/* De vertrouwensbalk onderaan. Alleen dingen die aantoonbaar waar zijn:
 * geen beoordelingscijfer, geen "duizenden gasten" in een huis dat in
 * 2027 opent. */
export const VERTROUWEN: { icoon: string; tekst: string }[] = [
  { icoon: "boom", tekst: "Unieke locatie in Drenthe" },
  { icoon: "hart", tekst: "Persoonlijk contact met de eigenaar" },
  { icoon: "blad", tekst: "Natuur, privacy & ontspanning" },
  { icoon: "klok", tekst: "Binnen 24 uur een aanbod op maat" },
];

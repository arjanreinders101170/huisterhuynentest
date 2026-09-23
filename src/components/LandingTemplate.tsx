import Image from "next/image";
import Link from "next/link";
import { SITE_URL, footerLinks, paginaTypeVoorSlug, reserveerHref, lodgekeuzeVoorSlug, LODGE_OP_SLUG } from "@/lib/site";
import { beoordelingSchema } from "@/data/reviews";
import { renderTekstMetLinks } from "@/lib/tekst";
import { DirectBookingUSP } from "@/components/DirectBookingUSP";

/* ═══ Reusable SEO landing page ═══
 * Server component (no hydration). One config object drives content +
 * structured data so all commercial landing pages stay consistent.
 */

export interface LandingTable {
  /** Kolomkoppen; bepaalt meteen het aantal kolommen. */
  head: string[];
  rows: string[][];
  /** Korte toelichting onder de tabel (bron, peildatum). */
  note?: string;
}

/** Eén kaart in een kaartenraster, bijv. een ruimte in de kamerindeling. */
export interface LandingCard {
  titel: string;
  items: { icon?: string; tekst: string }[];
}

/** Label/waarde-regel, bijv. "Inchecken — van 15:00 tot 21:00". */
export interface LandingRow {
  label: string;
  waarde: string;
}

export interface LandingSection {
  id?: string;
  eyebrow?: string;
  heading: string;
  body: string[];
  bullets?: string[];
  /** Feitelijke opsomming die als tabel leesbaarder is dan als bullets —
   *  afstanden, prijzen, openingstijden. Google trekt zo'n tabel ook
   *  makkelijker als snippet uit de pagina dan een lopende alinea. */
  table?: LandingTable;
  /** Kaartenraster. Voor inhoud die per ruimte of per onderdeel uiteenvalt
   *  en waar een tabel te zwaar voor is. */
  cards?: LandingCard[];
  /** Label/waarde-regels met een dunne scheidslijn. Leest rustiger dan een
   *  tabel met een gekleurde kopregel wanneer er maar twee kolommen zijn. */
  rows?: LandingRow[];
  /** Pictogramrij: korte kernpunten naast elkaar, elk met een eigen icoon. */
  marks?: { icon: string; tekst: string }[];
  /** Zet `marks` in een witte kaart, zoals het kaartenraster erboven.
   *  Voor een opsomming die als één blok hoort te lezen (voorzieningen).
   *  Zonder deze vlag blijft de rij open staan — dat is wat de huisregels
   *  willen, waar de pictogrammen juist bij de lopende tekst horen. */
  marksKaart?: boolean;
  /** Tussenkop boven `dots`. */
  subheading?: string;
  /** Opsomming met bolletjes, naast de vinkjes van `bullets`. */
  dots?: string[];
  /** Toelichting onderaan de sectie. */
  note?: string;
}

/** Losse feiten onder de hero: het antwoord op de eerste vier vragen van de
 *  bezoeker, zonder dat hij hoeft te scrollen. */
export interface LandingKeyFact {
  label: string;
  value: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface LandingConfig {
  slug: string;
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  heroSub: string;
  heroImage: string;
  heroImageAlt: string;
  /** CSS object-position voor de hero. Het beeld wordt op elk scherm anders
   *  bijgesneden; zonder eigen brandpunt valt het onderwerp op een telefoon
   *  buiten beeld. */
  heroFocus?: string;
  priceFrom?: string;
  intro: string;
  sections: LandingSection[];
  faq: LandingFaq[];
  related: RelatedLink[];
  ctaTitle: string;
  ctaBody: string;
  locale?: "nl" | "de";
  keyFacts?: LandingKeyFact[];
  /** ISO-datum van de laatste inhoudelijke wijziging. Wordt zichtbaar getoond
   *  en als dateModified in de structured data gezet. */
  updatedAt?: string;
  /** Inhoudsopgave onder de intro. Standaard aan bij lange pagina's; op de
   *  lodgepagina's uit, omdat de bezoeker daar niet naar een deelonderwerp
   *  zoekt maar de lodge van boven naar beneden doorleest. */
  toonIndex?: boolean;
  /** Kleinere hero-kop. Op de lodgepagina's staat de naam van de lodge in de
   *  H1 en die is daardoor langer dan een themakop; op 48px liep hij over drie
   *  regels en duwde hij de subtekst, de knoppen en de prijs onder de vouw.
   *  Een kop van 34px past op twee regels en laat de rest van de hero staan. */
  heroCompact?: boolean;
  /** Waar de pagina inhoudelijk over gaat, los van de accommodatie. Levert een
   *  `about`-entiteit in de structured data (bijv. een TouristAttraction). */
  about?: { name: string; type?: string; description?: string; url?: string };
}

/* ═══ Pictogrammen ═══
 *
 * Elk item krijgt zijn eigen tekening. In het aangeleverde ontwerp kreeg
 * ieder item binnen een kaart hetzelfde icoon — een badkuip bij "Toilet",
 * een bank bij "TV", vier keer hetzelfde pannetje bij afwasmachine,
 * koelkast, combimagnetron en fornuis. Een icoon dat het verkeerde ding
 * toont, kost meer aan begrijpelijkheid dan het aan sier oplevert.
 *
 * Onbekende naam levert daarom niets op in plaats van een willekeurig
 * symbool: liever geen icoon dan het verkeerde. */
const ICOON_PADEN: Record<string, string> = {
  bed: "M2 17v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5M2 17h20M2 17v3M22 17v3M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  douche: "M4 20v-9a5 5 0 0 1 10 0M14 4a2 2 0 1 1 4 0v7M8 16v1M11 15v2M5 15v2",
  toilet: "M6 3v8a5 5 0 0 0 5 5h1l1 5M6 11h11M17 3v8",
  tafel: "M3 10h18M5 10v9M19 10v9M8 10V7h8v3",
  tv: "M3 6h18v11H3zM8 21h8M12 17v4",
  vaatwasser: "M4 3h16v18H4zM4 8h16M7 5.5h.01M10 5.5h.01M12 12a3 3 0 0 0 0 6 3 3 0 0 0 0-6z",
  koelkast: "M5 2h14v20H5zM5 10h14M8 6v2M8 13v2",
  magnetron: "M2 5h20v14H2zM15 5v14M5 8h6M5 12h6M18 9v.01M18 13v.01",
  fornuis: "M4 8h16v13H4zM4 8V5h16v3M8 12h.01M12 12h.01M16 12h.01M8 16h8",
  keuken: "M6 2v8a2 2 0 0 0 4 0V2M8 10v12M16 2c-1.5 1-2 3-2 5s.5 3 2 3 2-1 2-3-.5-4-2-5zM16 10v12",
  nietRoken: "M2 15h14v4H2zM18 15h4v4h-4M17 12c2-1 2-3 0-4M13 12c2-1 2-3 0-4M3 3l18 18",
  huisdier: "M11 18a3 3 0 0 0 3 3 3 3 0 0 0 3-3c0-2-2-3-3-5-1 2-3 3-3 5zM6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  geenFeest: "M4 20l5-12 7 7-12 5zM14 5l1-2M18 8l2-1M17 3l1 1M20 11l1 .5M3 3l18 18",
  wifi: "M2.5 8.5a16 16 0 0 1 19 0M5.5 12.5a11 11 0 0 1 13 0M8.5 16.5a6 6 0 0 1 7 0M12 20h.01",
  parkeren: "M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 17V7h4a3 3 0 0 1 0 6H9",
  koffie: "M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h15M7 2v3M11 2v3",
  waterkoker: "M6 9h10l1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM16 11l3-2M9 9V7a2 2 0 0 1 4 0v2",
  verwarming: "M4 6v13M8 6v13M12 6v13M16 6v13M3 4h14M3 21h14M20 7c-1 1.5-1 2.5 0 4s1 2.5 0 4",
};

function Icoon({ naam, kleur }: { naam?: string; kleur: string }) {
  const pad = naam ? ICOON_PADEN[naam] : undefined;
  if (!pad) return null;
  return (
    <svg
      width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={kleur}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }} aria-hidden focusable="false"
    >
      <path d={pad} />
    </svg>
  );
}

const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  text: "#2A2418",
  muted: "#5A534C",
  gold: "#B49A5E",
  // Hetzelfde goud is op een lichte achtergrond maar 2,6:1 — ruim onder de
  // 4,5:1 die WCAG AA voor kleine tekst vraagt, en juist de eyebrows en
  // vinkjes zijn klein. goldInk is dezelfde tint, donker genoeg (4,7:1) om
  // op card en white wél leesbaar te zijn. T.gold blijft voor donkere vlakken
  // en voor niet-tekstuele accenten.
  /* Was #8A6F2E. Dat haalt 4,6:1 op card en op wit, maar op T.bg — het
   * donkerder crème van de lodgekeuze — bleef het op 3,74:1 steken, en
   * juist de eyebrow dáár ("De andere lodge") is 11px. Deze tint haalt
   * 4,7:1 op T.bg, 5,8:1 op card en 6,0:1 op wit, dus overal ruim. */
  goldInk: "#786027",
  // Op de groene banden (breadcrumb, feitenbalk, slot-CTA) haalt T.gold maar
  // 3,35:1 — onder de 4,5:1 die WCAG AA voor kleine tekst vraagt, en juist
  // daar staan de kleinste labels van de pagina. goldOnGreen is dezelfde
  // tint (H 42°), alleen lichter, en komt op T.green uit op 4,9:1.
  // Kortom: goldInk op lichte vlakken, goldOnGreen op groen, T.gold voor
  // bijna-zwart en voor vullingen en lijnen die geen tekst zijn.
  goldOnGreen: "#D8BA73",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

/** Kop → anker. Zonder id's kan de inhoudsopgave nergens heen linken en heeft
 *  Google geen kapstok voor "ga naar dit deel"-sitelinks. */
export function sectionAnchor(section: LandingSection, index: number): string {
  if (section.id) return section.id;
  const slug = section.heading
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  return slug || `deel-${index + 1}`;
}

/** Toon de inhoudsopgave pas als er echt iets te navigeren valt. Bij vier
 *  secties scrollt de bezoeker sneller dan hij een lijstje leest. */
const TOC_DREMPEL = 5;

/** Builds the JSON-LD blocks (WebPage + BreadcrumbList + FAQPage) for a
 *  landing page.
 *
 *  De WebPage-node ontbrak: daardoor had Google geen enkel machineleesbaar
 *  aanknopingspunt voor de hoofdafbeelding, de wijzigingsdatum of het
 *  onderwerp van de pagina — alleen een kruimelpad en een FAQ die los in de
 *  lucht hingen. Met een expliciete WebPage hangen die twee nu aan een pagina
 *  die zelf bij de LodgingBusiness hoort. */
/* Feitenbalk → schema. "60 m²" wordt floorSize, "2" slaapkamers wordt
 * numberOfBedrooms. Alleen wat zeker te lezen is: een label dat niet herkend
 * wordt of een waarde zonder getal levert niets op, in plaats van een gok. */
function feitenNaarSchema(facts: LandingKeyFact[] | undefined): Record<string, unknown> {
  const uit: Record<string, unknown> = {};
  for (const f of facts ?? []) {
    const label = f.label.toLowerCase();
    const getal = Number((f.value.match(/\d+(?:[.,]\d+)?/) ?? [])[0]?.replace(",", "."));
    if (!Number.isFinite(getal)) continue;
    if (label.startsWith("oppervlak")) {
      uit.floorSize = { "@type": "QuantitativeValue", value: getal, unitCode: "MTK", unitText: "m²" };
    } else if (label.startsWith("slaapkamer")) {
      uit.numberOfBedrooms = getal;
    } else if (label.startsWith("badkamer")) {
      uit.numberOfBathroomsTotal = getal;
    } else if (label.startsWith("persone")) {
      uit.occupancy = { "@type": "QuantitativeValue", maxValue: getal, unitText: "personen" };
    }
  }
  return uit;
}

export function landingSchemas(config: LandingConfig): object[] {
  const url = `${SITE_URL}/${config.slug}`;
  const taal = config.locale === "de" ? "de-DE" : "nl-NL";

  const webPage: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: config.h1,
    description: config.heroSub,
    inLanguage: taal,
    isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}#website`, url: SITE_URL, name: "Huis ter Huynen" },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_URL}${config.heroImage}`,
      caption: config.heroImageAlt,
    },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    about: config.about
      ? {
          "@type": config.about.type ?? "Thing",
          name: config.about.name,
          ...(config.about.description ? { description: config.about.description } : {}),
          ...(config.about.url ? { sameAs: config.about.url } : {}),
        }
      : { "@type": "LodgingBusiness", "@id": `${SITE_URL}#lodging`, name: "Huis ter Huynen", url: SITE_URL },
  };
  if (config.updatedAt) webPage.dateModified = config.updatedAt;

  /* Gaat deze pagina over één lodge, zeg dat dan ook. Zonder mainEntity moet
   * een zoekmachine uit een containsPlace met twee lodges afleiden welke van
   * de twee deze URL beschrijft — en dat is precies het soort gok waarop een
   * pagina zijn eigen onderwerp kwijtraakt. */
  const lodge = LODGE_OP_SLUG[config.slug];
  const accommodatie = lodge
    ? {
        "@context": "https://schema.org",
        "@type": "Accommodation",
        /* Dezelfde @id als de knoop in containsPlace op de homepage: het is
         * één lodge, niet twee die toevallig hetzelfde heten. */
        "@id": `${SITE_URL}/${lodge.slug}#accommodation`,
        url: `${SITE_URL}/${lodge.slug}`,
        name: lodge.naam,
        description: config.heroSub,
        image: `${SITE_URL}${config.heroImage}`,
        ...feitenNaarSchema(config.keyFacts),
        amenityFeature: lodge.kenmerken.map((k) => ({
          "@type": "LocationFeatureSpecification",
          name: k,
          value: true,
        })),
        containedInPlace: { "@type": "LodgingBusiness", "@id": `${SITE_URL}#lodging`, name: "Huis ter Huynen", url: SITE_URL },
        ...beoordelingSchema(lodge.slug),
      }
    : null;
  if (accommodatie) webPage.mainEntity = { "@id": accommodatie["@id"] };

  const schemas: object[] = [
    webPage,
    ...(accommodatie ? [accommodatie] : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: config.breadcrumb, item: url },
      ],
    },
  ];

  if (config.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: config.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return schemas;
}

const I18N = {
  nl: {
    home: "Huis ter Huynen",
    heroCta: "Bekijk beschikbaarheid →",
    heroSub: "Schrijf je in voor de opening",
    priceLabel: "direct boekbaar, zonder tussenpersoon",
    relatedLabel: "Ontdek ook",
    faqTitle: "Veelgestelde vragen",
    ctaAvail: "Bekijk beschikbaarheid",
    ctaWa: "Stel je vraag via WhatsApp",
    opening: "Opening 1 april 2027 · al boekbaar",
    footerMore: "Meer vakanties in Drenthe",
    toc: "Op deze pagina",
    updated: "Laatst bijgewerkt",
  },
  de: {
    home: "Huis ter Huynen",
    heroCta: "Verfügbarkeit prüfen →",
    heroSub: "Für die Eröffnung anmelden",
    priceLabel: "direkt buchbar, ohne Vermittler",
    relatedLabel: "Entdecken Sie auch",
    faqTitle: "Häufig gestellte Fragen",
    ctaAvail: "Verfügbarkeit prüfen",
    ctaWa: "Frage via WhatsApp stellen",
    opening: "Eröffnung 1. April 2027 · bereits buchbar",
    footerMore: "Weitere Unterkünfte in Drenthe",
    toc: "Auf dieser Seite",
    updated: "Zuletzt aktualisiert",
  },
};

/* `sizes` per rasterindeling — de afleiding staat bij het raster hieronder. */
const KAART_SIZES_EEN =
  "(max-width: 640px) calc(100vw - 40px), (max-width: 1060px) calc(100vw - 80px), 980px";
const KAART_SIZES_TWEE =
  "(max-width: 640px) calc(100vw - 40px), (max-width: 702px) calc(100vw - 80px), (max-width: 1060px) calc((100vw - 102px) / 2), 480px";

/* ═══ Het lodgekeuzeblok ═══
 *
 * Staat bewust ná de FAQ en vóór de slot-CTA. De FAQ neemt de laatste bezwaren
 * weg; pas daarna is kiezen aan de orde, en de CTA erna vraagt om de datums.
 *
 * De volgorde is dus: overtuigen → bezwaren wegnemen → kiezen → aanvragen. In
 * de oude opbouw ontbrak die derde stap volledig: de bezoeker sprong van een
 * themapagina rechtstreeks naar een leeg formulier waarin de lodgekeuze de
 * eerste vraag was — de zwaarste plek om hem te stellen, want daar staat geen
 * foto en geen uitleg bij.
 *
 * Elke kaart heeft twee uitgangen: de lodgepagina voor wie nog twijfelt, en de
 * boekingssectie met deze lodge al voorgeselecteerd voor wie eruit is.
 */
function Lodgekeuze({ slug }: { slug: string }) {
  const lodges = lodgekeuzeVoorSlug(slug);
  if (lodges.length === 0) return null;
  const opLodgePagina = lodges.length === 1;
  const kaartSizes = opLodgePagina ? KAART_SIZES_EEN : KAART_SIZES_TWEE;

  return (
    <section className="lp-pad" style={{ background: T.bg, paddingTop: 64, paddingBottom: 64 }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.goldInk, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
            {opLodgePagina ? "De andere lodge" : "Twee lodges, één keuze"}
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 30px)", color: T.text, margin: 0, fontWeight: 700, lineHeight: 1.25 }}>
            {opLodgePagina ? `Of vergelijk met ${lodges[0].naam}` : "Welke lodge wordt het?"}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, lineHeight: 1.7, margin: "12px auto 0", maxWidth: 560 }}>
            {opLodgePagina
              ? "Dezelfde rust, hetzelfde terrein en dezelfde hottub op het terras — maar een ander huis."
              : "Beide staan vrij op het terrein, allebei met een eigen hottub op het terras. Het verschil zit in wat eromheen zit."}
          </p>
        </div>

        {/* De kaartbreedte hangt af van hóéveel kaarten er staan, en `sizes` moet
          * dat volgen: staat het verkeerd, dan haalt de browser keurig een te klein
          * bestand op en rekt de browser het uit.
          *
          * De maten volgen uit de opbouw hieronder: .lp-pad geeft 40px marge links
          * en rechts (20px onder 640px), de wrapper is maximaal 980px breed en de
          * kolommen staan 22px uit elkaar. Twee kolommen passen pas vanaf 622px
          * containerbreedte, dus vanaf een venster van 702px.
          *
          * Met één kaart — de vergelijking op een lodgepagina — is de kaart dus de
          * volle 980px, niet de 480px van een tweekaartsrij. Daar ging het mis: de
          * vergelijkingsfoto van de andere lodge werd op ruim 970px getoond terwijl
          * de browser een bestand voor 480px had opgehaald. Juist die foto moet de
          * bezoeker naar de andere lodge trekken.
          *
          * De calc()-vorm laat next/image de hele reeks breedtes in de srcset
          * zetten in plaats van alleen die vanaf 640px; de browser kiest zelf de
          * eerste kandidaat die groot genoeg is, dus de kleine maten schaden niet
          * en schelen bandbreedte op een telefoon.
          */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(300px, 100%), 1fr))`, gap: 22 }}>
          {lodges.map((lodge) => (
            <div key={lodge.slug} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", height: 190 }}>
                <Image src={lodge.afbeelding} alt={lodge.alt} fill quality={60} sizes={kaartSizes} style={{ objectFit: "cover", objectPosition: "center 45%" }} />
              </div>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.green, margin: "0 0 8px" }}>
                  {lodge.naam}
                </h3>
                <p style={{ fontFamily: T.sans, fontSize: 14.5, color: T.muted, fontWeight: 300, lineHeight: 1.7, margin: "0 0 16px" }}>
                  {lodge.onderscheid}
                </p>
                <ul style={{ margin: "0 0 22px", padding: 0, listStyle: "none" }}>
                  {lodge.kenmerken.map((k) => (
                    <li key={k} style={{ fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 300, lineHeight: 1.6, padding: "5px 0", display: "flex", gap: 9, alignItems: "baseline" }}>
                      <span style={{ color: T.goldInk, flexShrink: 0 }} aria-hidden>✓</span>
                      {k}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: "auto", display: "grid", gap: 10 }}>
                  <Link href={`/${lodge.slug}`} style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: "white", background: T.green, padding: "12px 18px", borderRadius: 10, textDecoration: "none", textAlign: "center" }}>
                    Bekijk {lodge.naam} →
                  </Link>
                  <Link href={reserveerHref(lodge.slug)} style={{ fontFamily: T.sans, fontSize: 13.5, fontWeight: 500, color: T.green, textDecoration: "underline", textUnderlineOffset: 3, textAlign: "center" }}>
                    Of direct beschikbaarheid voor {lodge.naam.replace("Lodge ", "")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingTemplate({ config }: { config: LandingConfig }) {
  const t = I18N[config.locale ?? "nl"];
  const anchors = config.sections.map((s, i) => sectionAnchor(s, i));
  const toonToc = (config.toonIndex ?? true) && config.sections.length >= TOC_DREMPEL;
  const bijgewerkt = config.updatedAt
    ? new Date(config.updatedAt).toLocaleDateString(config.locale === "de" ? "de-DE" : "nl-NL", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;
  return (
    <div style={{ background: T.bg, fontFamily: T.sans, color: T.text }}>
      {/* Breadcrumb */}
      <div className="lp-pad" style={{ background: T.green, paddingTop: 16, paddingBottom: 16 }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <li>
                <Link href="/" style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.78)", textDecoration: "none" }}>
                  {t.home}
                </Link>
              </li>
              {/* Puur een scheidingsteken: aria-hidden, zodat het niet als
                  lijstitem wordt voorgelezen en de contrasteis er niet op rust. */}
              <li aria-hidden style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>›</li>
              <li style={{ fontFamily: T.sans, fontSize: 12, color: T.goldOnGreen, fontWeight: 600 }}>{config.breadcrumb}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: 460, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "white", overflow: "hidden", background: "#141210" }}>
        <Image src={config.heroImage} alt={config.heroImageAlt} fill priority quality={55} sizes="100vw" style={{ objectFit: "cover", objectPosition: config.heroFocus || "center 45%", opacity: 0.7 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,4,.18) 0%, rgba(10,8,4,.6) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 720, padding: "72px 32px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.goldOnGreen, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>
            {config.eyebrow}
          </div>
          <h1 style={{ fontFamily: T.serif, fontSize: config.heroCompact ? "clamp(24px, 3.6vw, 34px)" : "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: "0 0 18px", lineHeight: 1.2, color: "white" }}>
            {config.h1}
          </h1>
          <p style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 300, lineHeight: 1.7, margin: "0 auto 32px", maxWidth: 580, color: "rgba(255,255,255,.88)" }}>
            {config.heroSub}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link data-hero-cta href={reserveerHref(config.slug)} style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: "#1A2E24", background: T.gold, padding: "15px 32px", borderRadius: 10, textDecoration: "none", boxShadow: "0 6px 24px rgba(180,154,94,.45)" }}>
              {t.heroCta}
            </Link>
            <Link href="/#nieuwsbrief" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: "white", border: "1px solid rgba(255,255,255,.4)", padding: "15px 28px", borderRadius: 10, textDecoration: "none" }}>
              {t.heroSub}
            </Link>
          </div>
          <DirectBookingUSP locale={config.locale ?? "nl"} tone="onDark" size={12.5} style={{ marginTop: 18 }} />
          {config.priceFrom && (
            <div style={{ marginTop: 18, fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,.85)", letterSpacing: ".3px" }}>
              {config.priceFrom} · {t.priceLabel}
            </div>
          )}
        </div>
      </section>

      {/* Feiten in één oogopslag — staat bewust bóven de intro: wie op een
          informatieve zoekopdracht binnenkomt wil eerst het antwoord zien en
          pas daarna het verhaal. */}
      {config.keyFacts && config.keyFacts.length > 0 && (
        <section className="lp-pad" style={{ background: T.green, paddingTop: 26, paddingBottom: 26 }}>
          <dl className="lp-facts" style={{ maxWidth: 980, margin: "0 auto", padding: 0 }}>
            {config.keyFacts.map((f, i) => (
              <div key={i}>
                <dt style={{ fontFamily: T.sans, fontSize: 10.5, fontWeight: 600, color: T.goldOnGreen, letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: 6 }}>
                  {f.label}
                </dt>
                <dd style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.35 }}>
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Intro lead */}
      <section className="lp-pad" style={{ background: T.card, paddingTop: 56, paddingBottom: 8 }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <p style={{ fontFamily: T.sans, fontSize: 18, color: T.text, lineHeight: 1.8, margin: 0, fontWeight: 400, borderLeft: `3px solid ${T.gold}`, paddingLeft: 20 }}>
            {renderTekstMetLinks(config.intro, "intro")}
          </p>

          {/* Inhoudsopgave: alleen bij lange pagina's. Echte ankerlinks, zodat
              de bezoeker springt én Google de deelonderwerpen ziet. */}
          {toonToc && (
            <nav aria-label={t.toc} style={{ marginTop: 28, background: "white", border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.goldInk, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>
                {t.toc}
              </div>
              <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
                {config.sections.map((sec, i) => (
                  <li key={i}>
                    <a href={`#${anchors[i]}`} className="lp-toc-link" style={{ fontFamily: T.sans, fontSize: 14.5, color: T.green, textDecoration: "none", fontWeight: 500, lineHeight: 1.5 }}>
                      {sec.heading}
                    </a>
                  </li>
                ))}
                {config.faq.length > 0 && (
                  <li>
                    <a href="#veelgestelde-vragen" className="lp-toc-link" style={{ fontFamily: T.sans, fontSize: 14.5, color: T.green, textDecoration: "none", fontWeight: 500, lineHeight: 1.5 }}>
                      {t.faqTitle}
                    </a>
                  </li>
                )}
              </ol>
            </nav>
          )}
        </div>
      </section>

      {/* Content sections */}
      <section className="lp-pad" style={{ background: T.card, paddingTop: 32, paddingBottom: 64 }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {config.sections.map((s, i) => (
            <div key={i} id={anchors[i]} className="lp-anchor" style={{ marginTop: i === 0 ? 24 : 44 }}>
              {s.eyebrow && (
                <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.goldInk, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
                  {s.eyebrow}
                </div>
              )}
              <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 30px)", color: T.text, margin: "0 0 16px", fontWeight: 700, lineHeight: 1.25 }}>
                {s.heading}
              </h2>
              {s.body.map((p, j) => (
                <p key={j} style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, lineHeight: 1.85, margin: "0 0 16px", fontWeight: 300 }}>
                  {renderTekstMetLinks(p, `${i}-${j}`)}
                </p>
              ))}
              {/* Bullets zijn lopende tekst en dragen dus ook links: op de
                  hottubpagina staan de twee lodges als opsomming, en juist daar
                  hoort de verwijzing naar hun eigen pagina. De FAQ blijft
                  bewust zonder linksyntaxis — die antwoorden gaan letterlijk
                  mee als acceptedAnswer in de structured data, waar [tekst](/pad)
                  zichtbaar zou worden in de zoekresultaten. */}
              {s.bullets && (
                <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none" }}>
                  {s.bullets.map((b, k) => (
                    <li key={k} style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, lineHeight: 1.6, padding: "8px 0", borderBottom: k < s.bullets!.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "baseline" }}>
                      <span style={{ color: T.goldInk, flexShrink: 0 }} aria-hidden>✓</span>
                      {renderTekstMetLinks(b, `b${i}-${k}`)}
                    </li>
                  ))}
                </ul>
              )}
              {/* Kaartenraster — de kamerindeling. Eén kaart per ruimte,
                  elk item met zijn eigen pictogram. */}
              {s.cards && s.cards.length > 0 && (
                <div className="lp-cards">
                  {s.cards.map((kaart, k) => (
                    <div key={k} style={{ border: `1px solid ${T.border}`, borderRadius: 12, background: "white", padding: "18px 20px" }}>
                      <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.text, marginBottom: 12 }}>
                        {kaart.titel}
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                        {kaart.items.map((it, m) => (
                          <li key={m} style={{ fontFamily: T.sans, fontSize: 14.5, color: T.muted, fontWeight: 300, display: "flex", alignItems: "center", gap: 10 }}>
                            <Icoon naam={it.icon} kleur={T.goldInk} />
                            {it.tekst}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Label/waarde-regels — praktische informatie. Bewust geen
                  tabel met gekleurde kopregel: bij twee kolommen leest een
                  rustige definitielijst beter, en op een telefoon vouwt hij
                  onder elkaar in plaats van te scrollen. */}
              {s.rows && s.rows.length > 0 && (
                <dl className="lp-rows">
                  {s.rows.map((r, k) => (
                    <div key={k} className="lp-row">
                      <dt style={{ fontFamily: T.sans, fontSize: 13.5, color: T.muted, fontWeight: 400 }}>{r.label}</dt>
                      <dd style={{ fontFamily: T.sans, fontSize: 15.5, color: T.text, fontWeight: 400, margin: 0 }}>{r.waarde}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {/* Pictogramrij — de kernhuisregels naast elkaar. */}
              {s.marks && s.marks.length > 0 && (
                <div
                  className="lp-marks"
                  style={s.marksKaart ? {
                    border: `1px solid ${T.border}`, borderRadius: 12,
                    background: "white", padding: "20px 22px", marginTop: 18,
                  } : undefined}
                >
                  {s.marks.map((m, k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: T.sans, fontSize: 14.5, color: T.text, fontWeight: 400 }}>
                      <Icoon naam={m.icon} kleur={T.goldInk} />
                      {m.tekst}
                    </div>
                  ))}
                </div>
              )}

              {s.subheading && (
                <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.text, margin: "26px 0 10px" }}>
                  {s.subheading}
                </div>
              )}

              {s.dots && s.dots.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc" }}>
                  {s.dots.map((d, k) => (
                    <li key={k} style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, lineHeight: 1.7, padding: "3px 0" }}>
                      {renderTekstMetLinks(d, `d${i}-${k}`)}
                    </li>
                  ))}
                </ul>
              )}

              {s.table && s.table.head.length > 0 && (
                <>
                  {/* De wrapper scrollt, niet de pagina: een tabel van vier
                      kolommen past niet op 360px en mag de body nooit
                      horizontaal laten schuiven. */}
                  {/* Onder 640px zet de CSS deze tabel om in losse kaartjes:
                      vier kolommen met een uitleg-kolom erbij zijn op een
                      telefoon alleen leesbaar door horizontaal te scrollen, en
                      dan staat juist de nuttigste kolom buiten beeld. De
                      role-attributen houden de tabelsemantiek overeind zodra
                      display:block de native rollen wegneemt; data-label voedt
                      het kopje boven elke waarde in de kaartweergave. */}
                  <div className="lp-table-wrap" tabIndex={0} role="region" aria-label={s.heading}>
                    <table role="table" style={{ borderCollapse: "collapse", width: "100%", minWidth: 460, fontFamily: T.sans, fontSize: 14.5 }}>
                      <thead>
                        <tr role="row">
                          {s.table.head.map((h, k) => (
                            <th key={k} role="columnheader" scope="col" style={{ textAlign: "left", padding: "10px 14px", background: T.green, color: "white", fontWeight: 600, fontSize: 13, letterSpacing: ".2px", whiteSpace: "nowrap" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((row, k) => (
                          <tr key={k} role="row" style={{ background: k % 2 ? "white" : "transparent" }}>
                            {row.map((cel, m) => (
                              <td key={m} role="cell" data-label={s.table!.head[m]} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, color: m === 0 ? T.text : T.muted, fontWeight: m === 0 ? 600 : 300, lineHeight: 1.5 }}>
                                {cel}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {s.table.note && (
                    <p style={{ fontFamily: T.sans, fontSize: 12.5, color: T.muted, fontWeight: 300, margin: "10px 0 0", lineHeight: 1.6 }}>
                      {s.table.note}
                    </p>
                  )}
                </>
              )}

              {s.note && (
                <p style={{ fontFamily: T.sans, fontSize: 12.5, color: T.muted, fontWeight: 300, margin: "14px 0 0", lineHeight: 1.6 }}>
                  {s.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — staat bewust tussen de content en de boekings-CTA: eerst de
          laatste bezwaren wegnemen, dan pas vragen om te reserveren. De
          'ontdek ook'-links staan daarom ná de CTA. */}
      {config.faq.length > 0 && (
        <section id="veelgestelde-vragen" className="lp-pad lp-anchor" style={{ background: "white", paddingTop: 64, paddingBottom: 64 }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 32px)", color: T.text, margin: 0, fontWeight: 700 }}>
                {t.faqTitle}
              </h2>
              <div style={{ height: 2, width: 40, background: T.gold, margin: "14px auto 0" }} />
            </div>
            <div>
              {config.faq.map((f, i) => (
                <div key={i} style={{ borderTop: `1px solid ${T.border}`, borderBottom: i === config.faq.length - 1 ? `1px solid ${T.border}` : "none", padding: "22px 0" }}>
                  <h3 style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.text, margin: "0 0 10px", lineHeight: 1.3 }}>
                    {f.q}
                  </h3>
                  <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, margin: 0, lineHeight: 1.7 }}>
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
            {bijgewerkt && (
              <p style={{ fontFamily: T.sans, fontSize: 12.5, color: T.muted, fontWeight: 300, margin: "28px 0 0", textAlign: "center" }}>
                {t.updated}: <time dateTime={config.updatedAt}>{bijgewerkt}</time>
              </p>
            )}
          </div>
        </section>
      )}

      {/* Lodgekeuze — de stap tussen "overtuigd" en "aanvragen" */}
      <Lodgekeuze slug={config.slug} />

      {/* Final CTA */}
      <section className="lp-pad" style={{ background: T.green, paddingTop: 72, paddingBottom: 72, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.goldOnGreen, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>
            {t.opening}
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(24px, 3.5vw, 34px)", color: "white", margin: "0 0 14px", fontWeight: 700, lineHeight: 1.2 }}>
            {config.ctaTitle}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.7)", fontWeight: 300, margin: "0 0 30px", lineHeight: 1.7 }}>
            {config.ctaBody}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={reserveerHref(config.slug)} style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: "#1A2E24", background: T.gold, padding: "14px 30px", borderRadius: 10, textDecoration: "none" }}>
              {t.ctaAvail}
            </Link>
            <a href="https://wa.me/31642568603" target="_blank" rel="noopener noreferrer" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: "white", border: "1px solid rgba(255,255,255,.35)", padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}>
              {t.ctaWa}
            </a>
          </div>
          <DirectBookingUSP locale={config.locale ?? "nl"} tone="onDark" size={12.5} style={{ marginTop: 20 }} />
        </div>
      </section>

      {/* Related internal links — bewust afgetopt op vier. Dit blok stond op
          sommige pagina's op acht links; samen met het oude footerblok van
          dertien kreeg elke pagina meer dan twintig generieke interne links.
          Vier gerichte verwijzingen wegen zwaarder dan acht willekeurige. */}
      {config.related.length > 0 && (
        <section className="lp-pad" style={{ background: T.bg, paddingTop: 56, paddingBottom: 56 }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.green, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20 }}>
              {t.relatedLabel}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {config.related.slice(0, 4).map((r, i) => (
                <Link key={i} href={r.href} style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.green, background: T.card, border: `1px solid ${T.border}`, padding: "12px 20px", borderRadius: 10, textDecoration: "none" }}>
                  {r.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="lp-pad" style={{ background: "#1A1A1A", color: "rgba(255,255,255,.6)", paddingTop: 44, paddingBottom: 32 }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          {/* Meer vakanties — interne links naar de andere landingspagina's */}
          <div style={{ paddingBottom: 28, marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,.1)" }}>
            <div style={{
              fontFamily: T.sans, fontSize: 11, fontWeight: 600,
              color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16,
            }}>
              {t.footerMore}
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "10px 28px",
            }}>
              {footerLinks(paginaTypeVoorSlug(config.slug), config.slug).map((l) => (
                <Link key={l.href} href={l.href} style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 300,
                  color: "rgba(255,255,255,.8)", textDecoration: "none",
                  padding: "4px 0", lineHeight: 1.5,
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Adres + snelle links */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>
              Huis ter Huynen · Zuiderstraat 6 p, 9491 TH Zeijen, Drenthe
            </div>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              {[
                { label: "Home", href: "/" },
                { label: "Omgeving", href: "/omgeving" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
                { label: "Reserveren", href: reserveerHref(config.slug) },
              ].map((l, i) => (
                <Link key={i} href={l.href} style={{ fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,.75)", textDecoration: "none" }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

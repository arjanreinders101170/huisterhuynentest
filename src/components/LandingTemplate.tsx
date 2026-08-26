import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { SITE_URL, footerLandingLinks, landingRol } from "@/lib/site";
import { DirectBookingUSP } from "@/components/DirectBookingUSP";
import { metInlineLinks, zonderInlineLinks } from "@/lib/inline-links";
import { matrixLinksVoor, pasMatrixToe } from "@/lib/link-matrix";

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
  /** Waar de pagina inhoudelijk over gaat, los van de accommodatie. Levert een
   *  `about`-entiteit in de structured data (bijv. een TouristAttraction). */
  about?: { name: string; type?: string; description?: string; url?: string };
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
  goldInk: "#8A6F2E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

/** Interne links midden in de lopende tekst: zichtbaar als link, maar zonder
 *  de leesbaarheid van een alinea te breken. */
const INLINE_LINK: CSSProperties = {
  color: T.green,
  fontWeight: 500,
  textDecoration: "underline",
  textDecorationThickness: 1,
  textUnderlineOffset: 2,
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

  const schemas: object[] = [
    webPage,
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
        acceptedAnswer: { "@type": "Answer", text: zonderInlineLinks(f.a) },
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
    opening: "Opening 1 januari 2027 · al boekbaar",
    footerMore: "Meer vakanties in Drenthe",
    toc: "Op deze pagina",
    updated: "Laatst bijgewerkt",
    verderLezen: "Lees verder",
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
    opening: "Eröffnung 1. Januar 2027 · bereits buchbar",
    footerMore: "Weitere Unterkünfte in Drenthe",
    toc: "Auf dieser Seite",
    updated: "Zuletzt aktualisiert",
    verderLezen: "Weiterlesen",
  },
};

export function LandingTemplate({ config }: { config: LandingConfig }) {
  const t = I18N[config.locale ?? "nl"];
  const anchors = config.sections.map((s, i) => sectionAnchor(s, i));

  /* Interne linkmatrix: de contextuele links die deze pagina hoort te geven.
     Ze worden in de bestaande alinea's gezet; wat geen plek vindt (omdat de
     tekst in de admin is herschreven) valt terug op het blok "lees verder". */
  const matrix = matrixLinksVoor(`/${config.slug}`);
  const { blokken, rest: matrixRest } = pasMatrixToe(
    config.sections.flatMap((s) => s.body),
    matrix,
  );
  let alineaOffset = 0;
  const secties = config.sections.map((s) => {
    const body = blokken.slice(alineaOffset, alineaOffset + s.body.length);
    alineaOffset += s.body.length;
    return { ...s, body };
  });

  const footerLinks = footerLandingLinks(
    config.locale === "de" ? "de" : landingRol(config.slug),
    `/${config.slug}`,
  );
  const toonToc = config.sections.length >= TOC_DREMPEL;
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
                <Link href="/" style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>
                  {t.home}
                </Link>
              </li>
              <li style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>›</li>
              <li style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 600 }}>{config.breadcrumb}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section style={{ position: "relative", minHeight: 460, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "white", overflow: "hidden", background: "#141210" }}>
        <Image src={config.heroImage} alt={config.heroImageAlt} fill priority quality={55} sizes="100vw" style={{ objectFit: "cover", objectPosition: config.heroFocus || "center 45%", opacity: 0.7 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(10,8,4,.18) 0%, rgba(10,8,4,.6) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 720, padding: "72px 32px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16 }}>
            {config.eyebrow}
          </div>
          <h1 style={{ fontFamily: T.serif, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, margin: "0 0 18px", lineHeight: 1.15, color: "white" }}>
            {config.h1}
          </h1>
          <p style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 300, lineHeight: 1.7, margin: "0 auto 32px", maxWidth: 580, color: "rgba(255,255,255,.88)" }}>
            {config.heroSub}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/#reserveren" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: "#1A2E24", background: T.gold, padding: "15px 32px", borderRadius: 10, textDecoration: "none", boxShadow: "0 6px 24px rgba(180,154,94,.45)" }}>
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
                <dt style={{ fontFamily: T.sans, fontSize: 10.5, fontWeight: 600, color: T.gold, letterSpacing: "1.6px", textTransform: "uppercase", marginBottom: 6 }}>
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
            {metInlineLinks(config.intro, INLINE_LINK)}
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
          {secties.map((s, i) => (
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
                  {metInlineLinks(p, INLINE_LINK)}
                </p>
              ))}
              {s.bullets && (
                <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none" }}>
                  {s.bullets.map((b, k) => (
                    <li key={k} style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, lineHeight: 1.6, padding: "8px 0", borderBottom: k < s.bullets!.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "baseline" }}>
                      <span style={{ color: T.goldInk, flexShrink: 0 }} aria-hidden>✓</span>
                      <span>{metInlineLinks(b, INLINE_LINK)}</span>
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
            </div>
          ))}

          {/* Links uit de matrix die geen plek in de lopende tekst vonden.
              Staat er niets in, dan rendert dit blok niet. */}
          {matrixRest.length > 0 && (
            <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, lineHeight: 1.8, margin: "36px 0 0", paddingTop: 20, borderTop: `1px solid ${T.border}` }}>
              <strong style={{ fontWeight: 600, color: T.text }}>{t.verderLezen}:</strong>{" "}
              {matrixRest.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && " · "}
                  <Link href={l.href} style={INLINE_LINK}>{l.anchor}</Link>
                </span>
              ))}
            </p>
          )}
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
                    {metInlineLinks(f.a, INLINE_LINK)}
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

      {/* Final CTA */}
      <section className="lp-pad" style={{ background: T.green, paddingTop: 72, paddingBottom: 72, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>
            {t.opening}
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(24px, 3.5vw, 34px)", color: "white", margin: "0 0 14px", fontWeight: 700, lineHeight: 1.2 }}>
            {config.ctaTitle}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.7)", fontWeight: 300, margin: "0 0 30px", lineHeight: 1.7 }}>
            {config.ctaBody}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/#reserveren" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: "#1A2E24", background: T.gold, padding: "14px 30px", borderRadius: 10, textDecoration: "none" }}>
              {t.ctaAvail}
            </Link>
            <a href="https://wa.me/31642568603" target="_blank" rel="noopener noreferrer" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: "white", border: "1px solid rgba(255,255,255,.35)", padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}>
              {t.ctaWa}
            </a>
          </div>
          <DirectBookingUSP locale={config.locale ?? "nl"} tone="onDark" size={12.5} style={{ marginTop: 20 }} />
        </div>
      </section>

      {/* Related internal links */}
      {config.related.length > 0 && (
        <section className="lp-pad" style={{ background: T.bg, paddingTop: 56, paddingBottom: 56 }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.green, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20 }}>
              {t.relatedLabel}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {config.related.map((r, i) => (
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
              {footerLinks.map((l) => (
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
                { label: "Reserveren", href: "/#reserveren" },
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

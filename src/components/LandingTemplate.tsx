import Image from "next/image";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

/* ═══ Reusable SEO landing page ═══
 * Server component (no hydration). One config object drives content +
 * structured data so all commercial landing pages stay consistent.
 */

export interface LandingSection {
  id?: string;
  eyebrow?: string;
  heading: string;
  body: string[];
  bullets?: string[];
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
  intro: string;
  sections: LandingSection[];
  faq: LandingFaq[];
  related: RelatedLink[];
  ctaTitle: string;
  ctaBody: string;
}

const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  text: "#2A2418",
  muted: "#5A534C",
  gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

/** Builds the JSON-LD blocks (BreadcrumbList + FAQPage) for a landing page. */
export function landingSchemas(config: LandingConfig): object[] {
  const url = `${SITE_URL}/${config.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: config.breadcrumb, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}

export function LandingTemplate({ config }: { config: LandingConfig }) {
  return (
    <div style={{ background: T.bg, fontFamily: T.sans, color: T.text }}>
      {/* Breadcrumb */}
      <div style={{ background: T.green, padding: "16px 40px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <li>
                <Link href="/" style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>
                  Huis ter Huynen
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
        <Image src={config.heroImage} alt={config.heroImageAlt} fill priority quality={55} sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 45%", opacity: 0.7 }} />
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
              Bekijk beschikbaarheid →
            </Link>
            <Link href="/#nieuwsbrief" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: "white", border: "1px solid rgba(255,255,255,.4)", padding: "15px 28px", borderRadius: 10, textDecoration: "none" }}>
              Schrijf je in voor de opening
            </Link>
          </div>
        </div>
      </section>

      {/* Intro lead */}
      <section style={{ background: T.card, padding: "56px 40px 8px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <p style={{ fontFamily: T.sans, fontSize: 18, color: T.text, lineHeight: 1.8, margin: 0, fontWeight: 400, borderLeft: `3px solid ${T.gold}`, paddingLeft: 20 }}>
            {config.intro}
          </p>
        </div>
      </section>

      {/* Content sections */}
      <section style={{ background: T.card, padding: "32px 40px 64px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          {config.sections.map((s, i) => (
            <div key={i} id={s.id} style={{ marginTop: i === 0 ? 24 : 44 }}>
              {s.eyebrow && (
                <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>
                  {s.eyebrow}
                </div>
              )}
              <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 30px)", color: T.text, margin: "0 0 16px", fontWeight: 700, lineHeight: 1.25 }}>
                {s.heading}
              </h2>
              {s.body.map((p, j) => (
                <p key={j} style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, lineHeight: 1.85, margin: "0 0 16px", fontWeight: 300 }}>
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none" }}>
                  {s.bullets.map((b, k) => (
                    <li key={k} style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, lineHeight: 1.6, padding: "8px 0", borderBottom: k < s.bullets!.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10, alignItems: "baseline" }}>
                      <span style={{ color: T.gold, flexShrink: 0 }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related internal links */}
      {config.related.length > 0 && (
        <section style={{ background: T.bg, padding: "56px 40px" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.green, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20 }}>
              Ontdek ook
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

      {/* FAQ */}
      {config.faq.length > 0 && (
        <section style={{ background: "white", padding: "64px 40px" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 32px)", color: T.text, margin: 0, fontWeight: 700 }}>
                Veelgestelde vragen
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
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{ background: T.green, padding: "72px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14 }}>
            Opening 1 januari 2027 · al boekbaar
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(24px, 3.5vw, 34px)", color: "white", margin: "0 0 14px", fontWeight: 700, lineHeight: 1.2 }}>
            {config.ctaTitle}
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.7)", fontWeight: 300, margin: "0 0 30px", lineHeight: 1.7 }}>
            {config.ctaBody}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/#reserveren" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 700, color: "#1A2E24", background: T.gold, padding: "14px 30px", borderRadius: 10, textDecoration: "none" }}>
              Bekijk beschikbaarheid
            </Link>
            <a href="https://wa.me/31642568603" target="_blank" rel="noopener noreferrer" style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: "white", border: "1px solid rgba(255,255,255,.35)", padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}>
              Stel je vraag via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Slim footer */}
      <footer style={{ background: "#1A1A1A", color: "rgba(255,255,255,.6)", padding: "40px 40px 32px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>
            Huis ter Huynen · Zuiderstraat 6, 9491 EC Zeijen, Drenthe
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
      </footer>
    </div>
  );
}

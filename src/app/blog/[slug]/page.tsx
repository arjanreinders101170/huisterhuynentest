import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getSupabase } from "@/lib/supabase";
import { SITE_URL, blogOgImageUrl, jsonLdScript, footerLinks } from "@/lib/site";
import { blogCta, blogCtaHalverwege, ctaPositieHalverwege } from "@/lib/blog-cta";
import { ontleedInhoud, splitsVet, type KopNiveau, type InhoudDeel } from "@/lib/blog-inhoud";
import { renderTekstMetLinks } from "@/lib/tekst";

export const revalidate = 60;

type BlogPost = {
  slug: string;
  titel: string;
  intro: string;
  inhoud: string;
  categorie: string;
  leestijd: string;
  auteur: string;
  og_image: string | null;
  gepubliceerd_op: string | null;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("gepubliceerd", true)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Niet gevonden" };
  const ogImage = blogOgImageUrl(post);
  return {
    title: post.titel,
    description: post.intro,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.titel,
      description: post.intro,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.gepubliceerd_op || undefined,
      modifiedTime: post.gepubliceerd_op || undefined,
      authors: [post.auteur],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.titel,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.titel,
      description: post.intro,
      images: [ogImage],
    },
  };
}

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  text: "#2A2418", muted: "#5A534C", gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

/** Zet **tekst** binnen een regel om in vet en [tekst](/pad) in een interne
 *  link. De artikelen gebruiken de vetmarkering al sinds de eerste seed voor de
 *  aanhef van een opsomming ("**Locatie.** Lodges in populaire
 *  natuurgebieden…"); de linksyntaxis draagt de interne linkmatrix, die alleen
 *  werkt als een link midden ín een zin kan staan. Vet wordt eerst gesplitst,
 *  zodat een link binnen een vetgezette aanhef ook een link blijft. */
function renderInline(tekst: string, sleutel: string) {
  return splitsVet(tekst).map((deel, i) =>
    deel.vet ? (
      <strong key={`${sleutel}-${i}`} style={{ fontWeight: 600 }}>
        {renderTekstMetLinks(deel.tekst, `${sleutel}-${i}`)}
      </strong>
    ) : (
      <span key={`${sleutel}-${i}`}>{renderTekstMetLinks(deel.tekst, `${sleutel}-${i}`)}</span>
    ),
  );
}

const KOP_STIJL: Record<KopNiveau, React.CSSProperties> = {
  1: { fontSize: "clamp(24px, 3vw, 32px)", margin: "56px 0 20px", fontWeight: 700, lineHeight: 1.2 },
  2: { fontSize: "clamp(20px, 2.5vw, 24px)", margin: "48px 0 16px", fontWeight: 700, lineHeight: 1.3 },
  3: { fontSize: "clamp(16px, 2vw, 18px)", margin: "32px 0 10px", fontWeight: 600, lineHeight: 1.4 },
};

/** Het smalle CTA-blok halverwege de tekst. Bewust anders van vorm dan het
 *  blok onder het artikel: één zin en een link, geen kader met een eyebrow.
 *  Twee identieke blokken in één artikel lezen als een advertentie die zichzelf
 *  herhaalt; dit leest als een terzijde. */
function InlineCta({ slug }: { slug: string }) {
  const cta = blogCtaHalverwege(slug);
  return (
    <aside style={{
      borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
      padding: "18px 0", margin: "36px 0",
    }}>
      <p style={{ fontFamily: T.sans, fontSize: 15, color: T.text, fontWeight: 300, lineHeight: 1.7, margin: "0 0 10px" }}>
        {cta.tekst}
      </p>
      <Link href={cta.href} style={{
        fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.green,
        textDecoration: "underline", textUnderlineOffset: 3,
      }}>
        {cta.knop}
      </Link>
    </aside>
  );
}

/** Artikeltekst als React-elementen. De ontleding zelf staat in
 *  @/lib/blog-inhoud, zodat de admin-preview dezelfde structuur laat zien als
 *  de bezoeker krijgt. Hier bepalen we alleen hoe het eruitziet. */
function renderInhoud(inhoud: string, slug: string) {
  const delen = ontleedInhoud(inhoud);
  const ctaBij = ctaPositieHalverwege(delen);
  return delen.map((deel, i) =>
    i === ctaBij ? (
      <div key={`blok-${i}`}>
        <InlineCta slug={slug} />
        {renderDeel(deel, i)}
      </div>
    ) : (
      renderDeel(deel, i)
    ),
  );
}

/** Eén kop of alinea. */
function renderDeel(deel: InhoudDeel, i: number) {
  if (deel.soort === "kop") {
    const Kop = `h${deel.niveau}` as "h1" | "h2" | "h3";
    return (
      <Kop key={i} style={{ fontFamily: T.serif, color: T.text, ...KOP_STIJL[deel.niveau] }}>
        {deel.tekst}
      </Kop>
    );
  }
  return (
    <p key={i} style={{
      fontFamily: T.sans, fontSize: 16, color: T.text,
      lineHeight: 1.85, margin: "0 0 20px", fontWeight: 300,
    }}>
      {deel.regels.map((line, j, arr) => (
        <span key={j}>{renderInline(line, `${i}-${j}`)}{j < arr.length - 1 && <br />}</span>
      ))}
    </p>
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ArtikelPagina(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const postOrNull = await getPost(slug);
  if (!postOrNull) notFound();
  const post = postOrNull as BlogPost;
  const cta = blogCta(post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titel,
    description: post.intro,
    author: { "@type": "Person", name: post.auteur },
    datePublished: post.gepubliceerd_op || undefined,
    dateModified: post.gepubliceerd_op || undefined,
    publisher: {
      "@type": "Organization",
      name: "Huis ter Huynen",
      url: "https://www.huisterhuynen.nl",
    },
    mainEntityOfPage: `https://www.huisterhuynen.nl/blog/${post.slug}`,
    image: blogOgImageUrl(post),
    inLanguage: "nl-NL",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.huisterhuynen.nl",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://www.huisterhuynen.nl/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.titel,
        item: `https://www.huisterhuynen.nl/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbLd) }}
      />

      {/* Hero */}
      <div style={{ background: T.green, padding: "72px 24px 56px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/blog" style={{
            fontFamily: T.sans, fontSize: 12, color: T.gold,
            textDecoration: "none", letterSpacing: 1, display: "inline-block", marginBottom: 28,
          }}>
            ← Blog & Verhalen
          </Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
            <span style={{
              fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.green,
              background: T.gold, padding: "3px 10px", borderRadius: 20,
              textTransform: "uppercase" as const, letterSpacing: 1,
            }}>
              {post.categorie}
            </span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.5)" }}>
              {fmtDate(post.gepubliceerd_op)} · {post.leestijd}
            </span>
          </div>
          <h1 style={{
            fontFamily: T.serif, fontSize: "clamp(26px, 4vw, 40px)",
            color: "white", margin: "0 0 20px", fontWeight: 700, lineHeight: 1.2,
          }}>
            {post.titel}
          </h1>
          <p style={{
            fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.6)",
            fontWeight: 300, margin: 0,
          }}>
            Door {post.auteur}
          </p>
        </div>
      </div>

      {/* Gouden accent */}
      <div style={{ height: 4, background: T.gold }} />

      {/* Artikel */}
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 40px" }}>
        <p style={{
          fontFamily: T.sans, fontSize: 18, color: T.text,
          lineHeight: 1.8, margin: "0 0 40px", fontWeight: 400,
          borderLeft: `3px solid ${T.gold}`, paddingLeft: 20,
        }}>
          {post.intro}
        </p>
        {renderInhoud(post.inhoud, post.slug)}

        {/* CTA blok */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderLeft: `4px solid ${T.gold}`,
          borderRadius: "0 12px 12px 0",
          padding: "20px 24px", margin: "40px 0",
        }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 700,
            color: T.gold, letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 6,
          }}>
            {cta.eyebrow}
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.text, margin: "0 0 14px", lineHeight: 1.6 }}>
            {cta.tekst}
          </p>
          <Link href={cta.href} style={{
            display: "inline-block", fontFamily: T.sans, fontSize: 13, fontWeight: 700,
            color: T.green, textDecoration: "none",
            border: `1px solid ${T.green}`, padding: "8px 18px", borderRadius: 8,
          }}>
            {cta.knop}
          </Link>
        </div>

        {/* Auteursbalk */}
        <div style={{
          borderTop: `1px solid ${T.border}`, paddingTop: 28, marginTop: 16,
          display: "flex", gap: 12, alignItems: "center",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: T.green, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.serif, fontSize: 16, fontWeight: 700, color: T.gold,
          }}>
            {post.auteur.charAt(0)}
          </div>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.text }}>
              {post.auteur}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>
              Eigenaar Lodge De Heide &amp; Lodge De Eik · Huis ter Huynen, Zeijen
            </div>
          </div>
        </div>
      </article>

      {/* Verblijven — de enige plek waar een blog tot nu toe niets doorgaf.
          Blogs halen de hoogste CTR van de site en linkten alleen terug naar
          het blogoverzicht en de nieuwsbrief; de commerciële pagina's kregen
          er geen enkele interne link van. */}
      <div style={{ background: T.card, borderTop: `1px solid ${T.border}`, padding: "48px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: T.gold,
            letterSpacing: 1.5, textTransform: "uppercase" as const, marginBottom: 16,
          }}>
            Overnachten in Drenthe
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {footerLinks("blog").map((l) => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.green,
                background: T.bg, border: `1px solid ${T.border}`,
                padding: "10px 18px", borderRadius: 10, textDecoration: "none",
              }}>
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Nieuwsbrief */}
      <div id="nieuwsbrief" style={{ background: T.green, padding: "64px 24px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 600,
            color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase" as const, marginBottom: 14,
          }}>
            Opening 1 januari 2027
          </div>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 30px)",
            color: "white", margin: "0 0 12px", fontWeight: 700,
          }}>
            Wees er als eerste bij
          </h2>
          <p style={{
            fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,.65)",
            fontWeight: 300, margin: "0 0 28px", lineHeight: 1.7,
          }}>
            Schrijf je in en ontvang de vroegboekkorting die alleen voor inschrijvers beschikbaar is.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}

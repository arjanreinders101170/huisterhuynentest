import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getPublicSupabase } from "@/lib/supabase";

export const revalidate = 60;

type BlogPost = {
  slug: string;
  titel: string;
  intro: string;
  inhoud: string;
  categorie: string;
  leestijd: string;
  auteur: string;
  gepubliceerd_op: string | null;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data } = await getPublicSupabase()
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
  return {
    title: post.titel,
    description: post.intro,
    alternates: { canonical: `https://huisterhuynen.nl/blog/${post.slug}` },
    openGraph: {
      title: post.titel,
      description: post.intro,
      url: `https://huisterhuynen.nl/blog/${post.slug}`,
      type: "article",
      publishedTime: post.gepubliceerd_op || undefined,
      authors: [post.auteur],
    },
  };
}

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

/** Parses plain-text blog content into React elements.
 *  ## Heading → <h2>, blank line → paragraph break */
function renderInhoud(inhoud: string) {
  const blocks = inhoud.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} style={{
          fontFamily: T.serif, fontSize: "clamp(20px, 2.5vw, 24px)",
          color: T.text, margin: "48px 0 16px", fontWeight: 700, lineHeight: 1.3,
        }}>
          {trimmed.slice(3)}
        </h2>
      );
    }
    return (
      <p key={i} style={{
        fontFamily: T.sans, fontSize: 16, color: T.text,
        lineHeight: 1.85, margin: "0 0 20px", fontWeight: 300,
      }}>
        {trimmed}
      </p>
    );
  });
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titel,
    description: post.intro,
    author: { "@type": "Person", name: post.auteur },
    datePublished: post.gepubliceerd_op || undefined,
    publisher: {
      "@type": "Organization",
      name: "Huis ter Huynen",
      url: "https://huisterhuynen.nl",
    },
    mainEntityOfPage: `https://huisterhuynen.nl/blog/${post.slug}`,
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
        {renderInhoud(post.inhoud)}

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
            Opening 1 januari 2027
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.text, margin: "0 0 14px", lineHeight: 1.6 }}>
            De lodges zijn beschikbaar vanaf 1 januari 2027. Schrijf je in voor de
            nieuwsbrief en ontvang als eerste de vroegboekkorting.
          </p>
          <Link href="/#nieuwsbrief" style={{
            display: "inline-block", fontFamily: T.sans, fontSize: 13, fontWeight: 700,
            color: T.green, textDecoration: "none",
            border: `1px solid ${T.green}`, padding: "8px 18px", borderRadius: 8,
          }}>
            Schrijf me in →
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

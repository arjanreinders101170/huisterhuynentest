import Link from "next/link";
import { Metadata } from "next";
import { NewsletterForm } from "@/components/NewsletterForm";
import { getSupabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Blog & Verhalen — Drenthe, natuur en het leven op de heide",
  description:
    "Lees over de lodges, de omgeving van Zeijen en alles wat Drenthe te bieden heeft. Reistips, verhalen en seizoensnieuws van Huis ter Huynen.",
  alternates: { canonical: "https://huisterhuynen.nl/blog" },
  openGraph: {
    title: "Blog & Verhalen — Huis ter Huynen",
    description: "Reistips, verhalen en nieuws vanuit de Drentse heide.",
    url: "https://huisterhuynen.nl/blog",
    type: "website",
  },
};

export const revalidate = 60;

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  text: "#2A2418", muted: "#5A534C", gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

type BlogPost = {
  slug: string;
  titel: string;
  intro: string;
  categorie: string;
  leestijd: string;
  gepubliceerd_op: string | null;
};

async function getPosts(): Promise<BlogPost[]> {
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("slug, titel, intro, categorie, leestijd, gepubliceerd_op")
      .eq("gepubliceerd", true)
      .order("gepubliceerd_op", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
}

export default async function BlogOverzicht() {
  const posts = await getPosts();

  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: T.green, padding: "80px 24px 64px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 600,
            color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 16,
          }}>
            Blog & Verhalen
          </div>
          <h1 style={{
            fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 42px)",
            color: "white", margin: "0 0 16px", fontWeight: 700, lineHeight: 1.2,
          }}>
            Drenthe van binnenuit
          </h1>
          <p style={{
            fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.65)",
            fontWeight: 300, margin: "0 auto", lineHeight: 1.7, maxWidth: 520,
          }}>
            Verhalen over de lodges, reistips voor de omgeving van Zeijen en
            alles wat Drenthe het hele jaar door te bieden heeft.
          </p>
        </div>
      </div>

      {/* Artikelen */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px" }}>
        {posts.length === 0 ? (
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, textAlign: "center" }}>
            Binnenkort verschijnen hier de eerste verhalen.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 24 }}>
            {posts.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: "none" }}>
                <article style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderRadius: 16, padding: "28px 32px",
                  display: "grid", gridTemplateColumns: "1fr auto",
                  gap: "0 32px", alignItems: "center", cursor: "pointer",
                }}>
                  <div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                      <span style={{
                        fontFamily: T.sans, fontSize: 10, fontWeight: 700,
                        color: T.green, background: "rgba(47,79,62,.08)",
                        padding: "3px 10px", borderRadius: 20,
                        textTransform: "uppercase" as const, letterSpacing: 1,
                      }}>
                        {a.categorie}
                      </span>
                      <span style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>
                        {fmtDate(a.gepubliceerd_op)} · {a.leestijd}
                      </span>
                    </div>
                    <h2 style={{
                      fontFamily: T.serif, fontSize: "clamp(18px, 2.5vw, 22px)",
                      color: T.text, margin: "0 0 10px", fontWeight: 700, lineHeight: 1.3,
                    }}>
                      {a.titel}
                    </h2>
                    <p style={{
                      fontFamily: T.sans, fontSize: 14, color: T.muted,
                      margin: 0, lineHeight: 1.7, fontWeight: 300,
                    }}>
                      {a.intro}
                    </p>
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 22, color: T.gold, flexShrink: 0 }}>
                    →
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Link href="/" style={{
            fontFamily: T.sans, fontSize: 13, color: T.muted,
            textDecoration: "none", borderBottom: `1px solid ${T.border}`, paddingBottom: 2,
          }}>
            ← Terug naar home
          </Link>
        </div>
      </div>

      {/* Nieuwsbrief */}
      <div style={{ background: T.green, padding: "64px 24px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 600,
            color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14,
          }}>
            Opening 1 januari 2027
          </div>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 30px)",
            color: "white", margin: "0 0 12px", fontWeight: 700,
          }}>
            Blijf op de hoogte
          </h2>
          <p style={{
            fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,.65)",
            fontWeight: 300, margin: "0 0 28px", lineHeight: 1.7,
          }}>
            Schrijf je in en ontvang als eerste de vroegboekkorting en het openingsbericht.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}

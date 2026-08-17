import { ImageResponse } from "next/og";
import { getSupabase } from "@/lib/supabase";

/**
 * Genereert per blogartikel een eigen social-share afbeelding (1200×630).
 * Wordt gebruikt als een artikel geen eigen foto in og_image heeft staan —
 * voorheen deelde elk artikel zonder foto dezelfde lodge-heide.jpg, wat
 * slecht is voor de doorklikratio op social media.
 *
 * Aanroep: /api/og/blog?slug=<blog-slug>
 */

export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

const C = {
  green: "#2F4F3E",
  gold: "#B49A5E",
  cream: "#FDFBF6",
  muted: "rgba(253, 251, 246, 0.72)",
  line: "rgba(180, 154, 94, 0.45)",
};

type OgPost = { titel: string; categorie: string; leestijd: string };

async function getPost(slug: string): Promise<OgPost | null> {
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("titel, categorie, leestijd")
      .eq("slug", slug)
      .eq("gepubliceerd", true)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

/** Grotere koppen voor korte titels, kleinere voor lange — zodat de kaart altijd gevuld is. */
function titleSize(titel: string): number {
  if (titel.length <= 38) return 70;
  if (titel.length <= 58) return 60;
  if (titel.length <= 78) return 52;
  return 44;
}

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim() || "";
  const post = slug ? await getPost(slug) : null;

  const titel = post?.titel || "Huis ter Huynen";
  const categorie = post?.categorie || "Blog";
  const leestijd = post?.leestijd || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: C.green,
          backgroundImage: `radial-gradient(circle at 88% 8%, rgba(180,154,94,0.30) 0%, rgba(47,79,62,0) 55%), radial-gradient(circle at 6% 100%, rgba(146,109,171,0.28) 0%, rgba(47,79,62,0) 52%)`,
          color: C.cream,
          fontFamily: "sans-serif",
        }}
      >
        {/* Merkbalk */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 7, color: C.gold, fontWeight: 600 }}>
            HUIS TER HUYNEN
          </div>
          <div style={{ display: "flex", fontSize: 22, color: C.muted }}>Zeijen · Drenthe</div>
        </div>

        {/* Titelblok */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 20px",
              borderRadius: 999,
              border: `1px solid ${C.line}`,
              color: C.gold,
              fontSize: 22,
              letterSpacing: 2,
              marginBottom: 28,
            }}
          >
            {categorie.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titleSize(titel),
              lineHeight: 1.18,
              fontWeight: 700,
              letterSpacing: -1,
              maxWidth: 960,
            }}
          >
            {titel}
          </div>
        </div>

        {/* Voetbalk */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 120, height: 4, background: C.gold, marginBottom: 24 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 24, color: C.muted }}>
              {leestijd ? `Leestijd ${leestijd}` : "Blog"}
            </div>
            <div style={{ display: "flex", fontSize: 24, color: C.cream }}>huisterhuynen.nl</div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

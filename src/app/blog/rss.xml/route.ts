import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
// Een uur cache: nieuwe artikelen mogen best een uur onderweg zijn, en zo
// belast een druk bezochte feedlezer de database niet.
export const revalidate = 3600;

const SITE_URL = "https://www.huisterhuynen.nl";
const TITEL = "Huis ter Huynen — Blog & verhalen";
const OMSCHRIJVING =
  "Reistips, seizoensverhalen en nieuws vanuit de Drentse heide bij Zeijen.";

type Post = {
  slug: string;
  titel: string;
  intro: string | null;
  categorie: string | null;
  auteur: string | null;
  gepubliceerd_op: string | null;
};

/** XML laat geen &, <, > of quotes los in tekst — escapen is hier niet optioneel. */
function esc(waarde: string): string {
  return waarde
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS schrijft datums voor in RFC 822. */
function rfc822(datum: string | null): string {
  const d = datum ? new Date(datum) : new Date();
  return (Number.isNaN(d.getTime()) ? new Date() : d).toUTCString();
}

/**
 * RSS-feed van de blog.
 *
 * Waarom: een feed is de goedkoopste distributie die er is. Nieuwsbrieftools,
 * Flipboard, Feedly en de meeste automatiseringen (bijvoorbeeld automatisch
 * delen op social) lezen een feed en hoeven verder niets. Zonder feed moet elk
 * kanaal handmatig gevoed worden — en dat is precies het werk dat blijft liggen.
 */
export async function GET(): Promise<Response> {
  let posts: Post[] = [];
  try {
    const { data } = await getSupabase()
      .from("blog_posts")
      .select("slug, titel, intro, categorie, auteur, gepubliceerd_op")
      .eq("gepubliceerd", true)
      .order("gepubliceerd_op", { ascending: false })
      .limit(50);
    if (data) posts = data as Post[];
  } catch {
    // Database onbereikbaar: liever een lege maar geldige feed dan een 500,
    // want feedlezers straffen fouten af met minder vaak ophalen.
  }

  const items = posts.map((post) => {
    const url = `${SITE_URL}/blog/${post.slug}`;
    return `    <item>
      <title>${esc(post.titel)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${rfc822(post.gepubliceerd_op)}</pubDate>
      <description>${esc(post.intro ?? "")}</description>${
        post.categorie ? `\n      <category>${esc(post.categorie)}</category>` : ""
      }
    </item>`;
  }).join("\n");

  const laatste = posts[0]?.gepubliceerd_op ?? null;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(TITEL)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${esc(OMSCHRIJVING)}</description>
    <language>nl-NL</language>
    <lastBuildDate>${rfc822(laatste)}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

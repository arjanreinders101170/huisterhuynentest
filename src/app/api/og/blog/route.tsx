import { getSupabase } from "@/lib/supabase";
import { ogCardResponse } from "@/lib/og-card";

/**
 * Genereert per blogartikel een eigen social-share afbeelding (1200×630).
 * Wordt gebruikt als een artikel geen eigen, unieke foto in og_image heeft —
 * voorheen deelde elk artikel zonder foto dezelfde lodge-heide.jpg, wat
 * slecht is voor de doorklikratio op social media.
 *
 * Aanroep: /api/og/blog?slug=<blog-slug>
 */

export const runtime = "nodejs";

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

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim() || "";
  const post = slug ? await getPost(slug) : null;

  // Zonder (geldige) slug: de kaart voor de blogindex zelf.
  return ogCardResponse({
    seed: slug || "blog",
    chip: post?.categorie || "Blog",
    titel: post?.titel || "Verhalen uit Drenthe",
    footer: post?.leestijd ? `Leestijd ${post.leestijd}` : "Blog & verhalen",
  });
}

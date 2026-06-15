import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";
import { SEED_LANDING_PAGES, type LandingSectionData } from "@/lib/landing-seed";

function buildLandingFields(body: Record<string, unknown>) {
  const sectionsRaw = body.sections;
  const sections: LandingSectionData[] = Array.isArray(sectionsRaw)
    ? (sectionsRaw as LandingSectionData[])
    : [];
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    slug: str(body.slug).toLowerCase().trim().replace(/\s+/g, "-"),
    breadcrumb: str(body.breadcrumb),
    eyebrow: str(body.eyebrow),
    h1: str(body.h1),
    hero_sub: str(body.hero_sub),
    hero_image: str(body.hero_image) || "/lodge-heide.jpg",
    hero_image_alt: str(body.hero_image_alt),
    price_from: str(body.price_from),
    intro: str(body.intro),
    sections,
    faq: str(body.faq),
    related: str(body.related),
    cta_title: str(body.cta_title),
    cta_body: str(body.cta_body),
    meta_title: str(body.meta_title),
    meta_description: str(body.meta_description),
    og_image: str(body.og_image),
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  };
}

function parsePlannedDate(value: unknown): string | null | "invalid" {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "invalid";
  return d.toISOString();
}

export async function handleContentGet(table: string): Promise<NextResponse | null> {
  switch (table) {
    case "blog_posts": {
      const { data, error } = await getSupabase()
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return NextResponse.json({ data: [], error: error.message });
      return NextResponse.json({ data: data || [] });
    }
    case "landing_pages": {
      const { data, error } = await getSupabase()
        .from("landing_pages")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return NextResponse.json({ data: [], error: error.message });
      return NextResponse.json({ data: data || [] });
    }
    default:
      return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleContentPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "create_blog_post": {
      const { slug, titel, intro, inhoud, categorie, leestijd, auteur, og_image, geplande_publicatie } = body;
      if (!slug || !titel || !inhoud) return NextResponse.json({ error: "Slug, titel en inhoud zijn verplicht" }, { status: 400 });
      const planned = parsePlannedDate(geplande_publicatie);
      if (planned === "invalid") return NextResponse.json({ error: "Ongeldige plan-datum" }, { status: 400 });
      const { data, error } = await getSupabase().from("blog_posts").insert({
        slug: String(slug).toLowerCase().trim().replace(/\s+/g, "-"),
        titel, intro, inhoud,
        categorie: categorie || "Verhaal",
        leestijd: leestijd || "4 minuten",
        auteur: auteur || "Arjan Reinders",
        og_image: og_image || null,
        gepubliceerd: false,
        geplande_publicatie: planned,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }
    case "update_blog_post": {
      const { id, slug, titel, intro, inhoud, categorie, leestijd, auteur, og_image, geplande_publicatie } = body;
      if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const planned = parsePlannedDate(geplande_publicatie);
      if (planned === "invalid") return NextResponse.json({ error: "Ongeldige plan-datum" }, { status: 400 });
      const { error } = await getSupabase().from("blog_posts").update({
        slug: String(slug).toLowerCase().trim().replace(/\s+/g, "-"),
        titel, intro, inhoud, categorie, leestijd, auteur,
        og_image: og_image || null,
        geplande_publicatie: planned,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    case "publish_blog_post": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const gepubliceerd = body.gepubliceerd === true || body.gepubliceerd === "true";
      await getSupabase().from("blog_posts").update({
        gepubliceerd,
        gepubliceerd_op: gepubliceerd ? new Date().toISOString().slice(0, 10) : null,
        geplande_publicatie: null,
        updated_at: new Date().toISOString(),
      }).eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "delete_blog_post": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("blog_posts").delete().eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "create_landing_page": {
      const fields = buildLandingFields(body);
      if (!fields.slug || !fields.h1) return NextResponse.json({ error: "Slug en H1 zijn verplicht" }, { status: 400 });
      const { data, error } = await getSupabase().from("landing_pages").insert({
        ...fields,
        gepubliceerd: false,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      revalidatePath(`/${fields.slug}`);
      return NextResponse.json({ success: true, data });
    }
    case "update_landing_page": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const fields = buildLandingFields(body);
      if (!fields.slug || !fields.h1) return NextResponse.json({ error: "Slug en H1 zijn verplicht" }, { status: 400 });
      const { error } = await getSupabase().from("landing_pages").update({
        ...fields,
        updated_at: new Date().toISOString(),
      }).eq("id", body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      revalidatePath(`/${fields.slug}`);
      return NextResponse.json({ success: true });
    }
    case "publish_landing_page": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const gepubliceerd = body.gepubliceerd === true || body.gepubliceerd === "true";
      const { data: existing } = await getSupabase().from("landing_pages").select("slug").eq("id", body.id).single();
      const { error } = await getSupabase().from("landing_pages").update({
        gepubliceerd,
        updated_at: new Date().toISOString(),
      }).eq("id", body.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (existing?.slug) revalidatePath(`/${existing.slug}`);
      return NextResponse.json({ success: true });
    }
    case "delete_landing_page": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("landing_pages").delete().eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "import_landing_seed": {
      const sb = getSupabase();
      const toUpsert = SEED_LANDING_PAGES.map((p) => ({
        slug: p.slug,
        breadcrumb: p.breadcrumb,
        eyebrow: p.eyebrow,
        h1: p.h1,
        hero_sub: p.hero_sub,
        hero_image: p.hero_image,
        hero_image_alt: p.hero_image_alt,
        price_from: p.price_from,
        intro: p.intro,
        sections: p.sections,
        faq: p.faq,
        related: p.related,
        cta_title: p.cta_title,
        cta_body: p.cta_body,
        meta_title: p.meta_title,
        meta_description: p.meta_description,
        og_image: p.og_image,
        gepubliceerd: true,
        sort_order: p.sort_order ?? 0,
      }));
      const { error } = await sb.from("landing_pages").upsert(toUpsert, { onConflict: "slug" });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      revalidatePath("/", "layout");
      return NextResponse.json({ success: true, imported: toUpsert.length });
    }
    default:
      return null;
  }
}

/* Landing page data access — database-first with bundled seed fallback.
 * Mirrors the blog pattern (service-role client, like blog/[slug] + sitemap).
 * Until a slug exists in `landing_pages`, the seed in landing-seed.ts is served
 * so pages never 404. Once a row exists, the database row wins; an unpublished
 * row yields a 404 (notFound) rather than falling back to the seed.
 */

import { getSupabase } from "@/lib/supabase";
import { SEED_LANDING_PAGES, SEED_BY_SLUG, type LandingPageRecord } from "@/lib/landing-seed";
import type { LandingConfig, LandingFaq, RelatedLink } from "@/components/LandingTemplate";

/** "Vraag :: Antwoord" per regel → [{ q, a }]. */
export function parseFaq(text: string | null | undefined): LandingFaq[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("::");
      if (idx === -1) return null;
      const q = line.slice(0, idx).trim();
      const a = line.slice(idx + 2).trim();
      if (!q || !a) return null;
      return { q, a };
    })
    .filter((x): x is LandingFaq => x !== null);
}

/** "Label :: /pad" per regel → [{ label, href }]. */
export function parseRelated(text: string | null | undefined): RelatedLink[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("::");
      if (idx === -1) return null;
      const label = line.slice(0, idx).trim();
      const href = line.slice(idx + 2).trim();
      if (!label || !href) return null;
      return { label, href };
    })
    .filter((x): x is RelatedLink => x !== null);
}

/** Database row / seed record → renderable LandingConfig. */
export function recordToConfig(rec: LandingPageRecord, locale?: "nl" | "de"): LandingConfig {
  return {
    slug: rec.slug,
    breadcrumb: rec.breadcrumb,
    eyebrow: rec.eyebrow,
    h1: rec.h1,
    heroSub: rec.hero_sub,
    heroImage: rec.hero_image || "/lodge-heide.jpg",
    heroImageAlt: rec.hero_image_alt,
    priceFrom: rec.price_from || undefined,
    intro: rec.intro,
    sections: Array.isArray(rec.sections) ? rec.sections : [],
    faq: parseFaq(rec.faq),
    related: parseRelated(rec.related),
    ctaTitle: rec.cta_title,
    ctaBody: rec.cta_body,
    locale: locale ?? (rec.slug.startsWith("de/") ? "de" : "nl"),
  };
}

/** Returns the record to render, or null (→ 404).
 * Published DB row wins; unpublished DB row → null; no row → seed fallback. */
export async function getLandingPage(slug: string): Promise<LandingPageRecord | null> {
  try {
    const { data } = await getSupabase()
      .from("landing_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (data) return data.gepubliceerd ? (data as LandingPageRecord) : null;
  } catch {
    /* DB unavailable — fall through to seed */
  }
  return SEED_BY_SLUG[slug] ?? null;
}

/** Slugs that should be served/indexed: published DB rows + seed pages that
 * have no DB row yet. Used by the dynamic route and the sitemap. */
export async function getServedLandingSlugs(): Promise<string[]> {
  const served = new Set<string>();
  try {
    const { data } = await getSupabase()
      .from("landing_pages")
      .select("slug, gepubliceerd");
    const rows = (data ?? []) as { slug: string; gepubliceerd: boolean }[];
    const dbSlugs = new Set(rows.map((r) => r.slug));
    rows.filter((r) => r.gepubliceerd).forEach((r) => served.add(r.slug));
    SEED_LANDING_PAGES.forEach((p) => {
      if (!dbSlugs.has(p.slug)) served.add(p.slug);
    });
  } catch {
    SEED_LANDING_PAGES.forEach((p) => served.add(p.slug));
  }
  return [...served];
}

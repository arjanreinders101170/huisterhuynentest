/* Landing page data access — database-first with bundled seed fallback.
 * Mirrors the blog pattern (service-role client, like blog/[slug] + sitemap).
 * Until a slug exists in `landing_pages`, the seed in landing-seed.ts is served
 * so pages never 404. Once a row exists, the database row wins; an unpublished
 * row yields a 404 (notFound) rather than falling back to the seed.
 */

import { getSupabase } from "@/lib/supabase";
import { SEED_LANDING_PAGES, SEED_BY_SLUG, type LandingPageRecord } from "@/lib/landing-seed";
import { REDIRECTED_LANDING_SLUGS } from "@/lib/redirects";
import type { LandingConfig, LandingFaq, LandingKeyFact, RelatedLink } from "@/components/LandingTemplate";

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

/** "Label :: Waarde" per regel → [{ label, value }]. */
export function parseKeyFacts(text: string | null | undefined): LandingKeyFact[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("::");
      if (idx === -1) return null;
      const label = line.slice(0, idx).trim();
      const value = line.slice(idx + 2).trim();
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((x): x is LandingKeyFact => x !== null);
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
    heroFocus: rec.hero_focus || undefined,
    priceFrom: rec.price_from || undefined,
    intro: rec.intro,
    sections: Array.isArray(rec.sections) ? rec.sections : [],
    faq: parseFaq(rec.faq),
    related: parseRelated(rec.related),
    ctaTitle: rec.cta_title,
    ctaBody: rec.cta_body,
    locale: locale ?? (rec.slug.startsWith("de/") ? "de" : "nl"),
    keyFacts: parseKeyFacts(rec.key_facts),
    about: rec.about ?? undefined,
    updatedAt: rec.updated_at ?? undefined,
  };
}

/** Returns the record to render, or null (→ 404).
 * Published DB row wins; unpublished DB row → null; no row → seed fallback. */
export async function getLandingPage(slug: string): Promise<LandingPageRecord | null> {
  // 301'd naar een andere pagina: nooit renderen, ook niet vanuit de seed.
  if (REDIRECTED_LANDING_SLUGS.has(slug)) return null;
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
  return (await getServedLandingPages()).map((p) => p.slug);
}

/** Zelfde selectie als getServedLandingSlugs(), maar mét de datum van de
 *  laatste wijziging. De sitemap zette voor elke landingspagina `new Date()`
 *  als lastmod neer: bij elke crawl beweerde de site dat álle pagina’s zojuist
 *  gewijzigd waren. Een lastmod die altijd "nu" zegt, zegt niets, en Google
 *  negeert het signaal dan voor de hele sitemap — juist voor een pagina die
 *  wél inhoudelijk is herschreven is dat zonde. */
export async function getServedLandingPages(): Promise<{ slug: string; updatedAt?: string }[]> {
  const served = new Map<string, string | undefined>();
  const seedDatum = (slug: string) => SEED_BY_SLUG[slug]?.updated_at;
  try {
    const { data } = await getSupabase()
      .from("landing_pages")
      .select("slug, gepubliceerd, updated_at");
    const rows = (data ?? []) as { slug: string; gepubliceerd: boolean; updated_at?: string }[];
    const dbSlugs = new Set(rows.map((r) => r.slug));
    rows.filter((r) => r.gepubliceerd).forEach((r) => served.set(r.slug, r.updated_at ?? seedDatum(r.slug)));
    SEED_LANDING_PAGES.forEach((p) => {
      if (!dbSlugs.has(p.slug)) served.set(p.slug, p.updated_at);
    });
  } catch {
    SEED_LANDING_PAGES.forEach((p) => served.set(p.slug, p.updated_at));
  }
  REDIRECTED_LANDING_SLUGS.forEach((slug) => served.delete(slug));
  return [...served].map(([slug, updatedAt]) => ({ slug, updatedAt }));
}

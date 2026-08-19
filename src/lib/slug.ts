/* Slugs voor blogartikelen en landingspagina's.
 *
 * Gedeeld tussen de admin (client) en de API-route (server), zodat er maar één
 * definitie is van wat een geldige slug is. De lengtegrens komt uit de
 * SEO-analyse: één blog-URL was uitgegroeid tot een volledige alinea van 250+
 * tekens, werd afgekapt in de zoekresultaten en oogde als spam.
 */

/** Maximale sluglengte. Google toont in de praktijk zo'n 60–75 tekens pad. */
export const MAX_SLUG_LENGTH = 70;

/** Vrije tekst → slug: kleine letters, geen accenten, koppeltekens. */
export function slugify(s: string): string {
  return s.toLowerCase().trim()
    .replace(/[àáâãä]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

/** Kort een te lange slug in op een woordgrens. */
export function kortSlugIn(slug: string, max: number = MAX_SLUG_LENGTH): string {
  if (slug.length <= max) return slug;
  const geknipt = slug.slice(0, max);
  const grens = geknipt.lastIndexOf("-");
  return (grens > max / 2 ? geknipt.slice(0, grens) : geknipt).replace(/-+$/, "");
}

/** Foutmelding als de slug te lang is, anders null. Bevat een voorstel,
 *  zodat de redactie niet zelf hoeft te tellen. */
export function slugLengteFout(slug: string, max: number = MAX_SLUG_LENGTH): string | null {
  if (slug.length <= max) return null;
  return `Slug is ${slug.length} tekens, maximaal ${max}. Voorstel: ${kortSlugIn(slug, max)}`;
}

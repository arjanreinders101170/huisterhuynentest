import { getLandingPage } from "@/lib/landing";
import { ogCardResponse } from "@/lib/og-card";

/**
 * Genereert per landingspagina een eigen social-share afbeelding (1200×630).
 * Wordt gebruikt als een pagina geen eigen, unieke foto in og_image heeft —
 * met slechts een handvol foto's voor twintig pagina's deelden anders vijf
 * landingspagina's dezelfde lodge-heide.jpg als preview.
 *
 * Aanroep: /api/og/landing?slug=<slug>  (Duitse pagina's: slug = "de/<slug>")
 */

export const runtime = "nodejs";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim() || "";
  const rec = slug ? await getLandingPage(slug) : null;
  const duits = slug.startsWith("de/");

  return ogCardResponse({
    seed: slug || "landing",
    chip: rec?.eyebrow || (duits ? "Boutique Lodges" : "Boutique lodges"),
    titel: rec?.h1 || "Huis ter Huynen",
    footer: rec?.price_from || (duits ? "Ab €165 pro Nacht" : "Vanaf €165 per nacht"),
  });
}

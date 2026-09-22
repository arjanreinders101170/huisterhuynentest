import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LODGE_PAGINAS, lodgePagina } from "@/data/lodge-paginas";
import { LodgePaginaNieuw } from "@/components/LodgePaginaNieuw";

/* ═══ Voorvertoning van de nieuwe lodge-opmaak ═══
 *
 * Bewust een eigen pad en niet /lodge-de-heide: die pagina's staan in de
 * index en dragen de commerciële content. Zolang hier over de opmaak
 * wordt besloten, hoort er geen tweede URL met dezelfde tekst in de
 * zoekresultaten te verschijnen — vandaar noindex én een canonical die
 * naar de echte pagina wijst.
 *
 * Gaat de opmaak live, dan verhuist <LodgePaginaNieuw> naar de bovenkant
 * van de lodgepagina's en kan deze map weg.
 */

export function generateStaticParams(): { lodge: string }[] {
  return LODGE_PAGINAS.map((l) => ({ lodge: l.key }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ lodge: string }> },
): Promise<Metadata> {
  const { lodge } = await params;
  const data = lodgePagina(lodge);
  if (!data) return { title: "Niet gevonden", robots: { index: false, follow: false } };
  return {
    title: { absolute: `Voorvertoning — ${data.naam}` },
    description: data.tagline,
    robots: { index: false, follow: false },
  };
}

export default async function LodgePreviewPage(
  { params }: { params: Promise<{ lodge: string }> },
) {
  const { lodge } = await params;
  const data = lodgePagina(lodge);
  if (!data) notFound();
  return <LodgePaginaNieuw data={data} />;
}

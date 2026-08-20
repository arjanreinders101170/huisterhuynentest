import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, landingOgImageUrl, jsonLdScript } from "@/lib/site";
import { getLandingPage, getServedLandingSlugs, recordToConfig } from "@/lib/landing";
import { LandingTemplate, landingSchemas } from "@/components/LandingTemplate";

export const revalidate = 60;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getServedLandingSlugs();
  return slugs
    .filter((s) => s.startsWith("de/"))
    .map((s) => ({ slug: s.slice(3) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const rec = await getLandingPage(`de/${slug}`);
  if (!rec) return { title: "Nicht gefunden" };
  const url = `${SITE_URL}/de/${slug}`;
  const ogImage = landingOgImageUrl(rec);
  return {
    // Absolute titel: het root-layout heeft template "%s – Huis ter Huynen",
    // en dat plakte er ongevraagd 18 tekens achter. Een zorgvuldig op 60
    // tekens geschreven meta_title werd daardoor in de SERP afgekapt — de
    // hunebeddenpagina eindigde op "... in Ze...". De merknaam staat toch al
    // in het getoonde domein.
    title: { absolute: rec.meta_title || rec.h1 },
    description: rec.meta_description,
    alternates: { canonical: url },
    openGraph: {
      title: rec.meta_title || rec.h1,
      description: rec.meta_description,
      url,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: rec.hero_image_alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: rec.meta_title || rec.h1,
      description: rec.meta_description,
      images: [ogImage],
    },
  };
}

export default async function DeLandingPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const rec = await getLandingPage(`de/${slug}`);
  if (!rec) notFound();

  const config = recordToConfig(rec);
  const schemas = landingSchemas(config);

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(schema) }} />
      ))}
      <LandingTemplate config={config} />
    </>
  );
}

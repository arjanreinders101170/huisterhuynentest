import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/lib/site";
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
  const ogImage = rec.og_image || rec.hero_image || "/lodge-heide.jpg";
  return {
    title: rec.meta_title || rec.h1,
    description: rec.meta_description,
    alternates: { canonical: url },
    openGraph: {
      title: rec.meta_title || rec.h1,
      description: rec.meta_description,
      url,
      type: "website",
      images: [{ url: `${SITE_URL}${ogImage}`, width: 1200, height: 630, alt: rec.hero_image_alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: rec.meta_title || rec.h1,
      description: rec.meta_description,
      images: [`${SITE_URL}${ogImage}`],
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
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <LandingTemplate config={config} />
    </>
  );
}

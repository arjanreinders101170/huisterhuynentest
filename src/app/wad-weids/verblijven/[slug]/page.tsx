import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/wadweids/SiteHeader";
import { SiteFooter } from "@/components/wadweids/SiteFooter";
import { PropertyDetail } from "@/components/wadweids/PropertyDetail";
import { PropertyGrid } from "@/components/wadweids/PropertyCard";
import { SectionHead } from "@/components/wadweids/Sections";
import { PROPERTIES } from "@/lib/wadweids/content";
import { myTourist } from "@/lib/wadweids/mytourist";

/* Elke woning krijgt deze pagina. Er is er precies één van, voor alle
   woningen samen: de inhoud komt uit het record, de beschikbaarheid en de
   prijs uit MyTourist. Woning nummer vijftig ziet er dus even goed uit als
   de eerste, zonder extra ontwerpwerk. */
export async function generateStaticParams() {
  return PROPERTIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await myTourist.getProperty(slug);
  return property
    ? { title: `${property.name} — ${property.place} | Wad & Weids`, description: property.tagline }
    : { title: "Verblijf niet gevonden — Wad & Weids" };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await myTourist.getProperty(slug);
  if (!property) notFound();

  const alle = await myTourist.listProperties();
  const vergelijkbaar = alle
    .filter((p) => p.id !== property.id && (p.destination === property.destination || p.guests >= property.guests))
    .slice(0, 3);

  return (
    <>
      <SiteHeader />
      <PropertyDetail property={property} />

      <section className="ww-section ww-section--sand">
        <div className="ww-wrap">
          <SectionHead
            eyebrow="Ook mooi"
            title="Vergelijkbare verblijven"
            action={{ label: "Alle verblijven", href: "/wad-weids/verblijven" }}
          />
          <PropertyGrid properties={vergelijkbaar} />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

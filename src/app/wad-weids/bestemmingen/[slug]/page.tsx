import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/wadweids/SiteHeader";
import { SiteFooter } from "@/components/wadweids/SiteFooter";
import { SearchBar } from "@/components/wadweids/SearchBar";
import { PropertyGrid } from "@/components/wadweids/PropertyCard";
import { DestinationTile, SectionHead } from "@/components/wadweids/Sections";
import { DESTINATIONS } from "@/lib/wadweids/content";
import { myTourist } from "@/lib/wadweids/mytourist";

/* Eén sjabloon voor alle bestemmingen. Dezelfde kaarten, dezelfde
   zoekmodule; alleen de inhoud verschilt. */
export async function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = DESTINATIONS.find((x) => x.slug === slug);
  return { title: d ? `${d.name} — Wad & Weids` : "Bestemming niet gevonden" };
}

export default async function BestemmingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = DESTINATIONS.find((d) => d.slug === slug);
  if (!destination) notFound();

  const properties = await myTourist.listProperties(destination.slug);
  const andere = DESTINATIONS.filter((d) => d.slug !== destination.slug).slice(0, 3);

  return (
    <>
      <SiteHeader variant="over" />

      <section className="ww-hero">
        <div className="ww-hero__media" style={{ height: "62vh", minHeight: 420 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={destination.image} alt={destination.name} />
          <div className="ww-hero__scrim" />
          <div className="ww-hero__content" style={{ paddingBottom: 96 }}>
            <div className="ww-wrap">
              <span className="ww-eyebrow ww-eyebrow--light ww-hero__eyebrow">{destination.region}</span>
              <h1 className="ww-display" style={{ fontSize: "clamp(2.4rem, 4.4cqw, 4rem)" }}>{destination.name}</h1>
              <p className="ww-hero__sub">{destination.intro}</p>
            </div>
          </div>
        </div>
        <div className="ww-wrap">
          <SearchBar initial={{ destination: destination.slug }} />
        </div>
      </section>

      <section className="ww-section">
        <div className="ww-wrap">
          <div className="ww-wrap ww-wrap--narrow" style={{ padding: 0, marginBottom: 56 }}>
            <p className="ww-lead">{destination.description}</p>
          </div>
          <SectionHead
            eyebrow="De collectie"
            title={`${properties.length} ${properties.length === 1 ? "verblijf" : "verblijven"} in ${destination.name}`}
            action={{ label: "Alle verblijven", href: "/wad-weids/verblijven" }}
          />
          {properties.length ? (
            <PropertyGrid properties={properties} />
          ) : (
            <div className="ww-empty">
              <h3 className="ww-h3">Hier openen we binnenkort</h3>
              <p className="ww-body ww-mt-s" style={{ margin: "12px auto 0" }}>
                We zijn in deze regio in gesprek over twee huizen. Laat je e-mailadres achter en je hoort het als eerste.
              </p>
              <Link href="/wad-weids#contact" className="ww-btn ww-btn--ghost ww-mt-m">Houd me op de hoogte</Link>
            </div>
          )}
        </div>
      </section>

      <section className="ww-section ww-section--sand">
        <div className="ww-wrap">
          <SectionHead eyebrow="Verder kijken" title="Andere bestemmingen" />
          <div className="ww-tiles">
            {andere.map((d) => <DestinationTile key={d.slug} destination={d} />)}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

import { SiteHeader } from "@/components/wadweids/SiteHeader";
import { SiteFooter } from "@/components/wadweids/SiteFooter";
import { DestinationTile, LifestyleBand } from "@/components/wadweids/Sections";
import { DESTINATIONS } from "@/lib/wadweids/content";

/* De bestemmingenpagina is een tegelgrid over dezelfde bron als de rest
   van de site. Een regio toevoegen is één record; de grid vult zich. */
export const metadata = { title: "Bestemmingen — Wad & Weids" };

export default function BestemmingenPage() {
  return (
    <>
      <SiteHeader />
      <div className="ww-pagehead ww-pagehead--onsand">
        <div className="ww-wrap">
          <span className="ww-eyebrow">Bestemmingen</span>
          <h1 className="ww-h2 ww-mt-s">Waar wil je naartoe?</h1>
          <p className="ww-lead ww-mt-s">
            Wij kiezen plekken op wat je er ziet als je naar buiten stapt. Dat levert een kaart op met veel kust,
            veel horizon en weinig drukte.
          </p>
        </div>
      </div>

      <section className="ww-section ww-section--tight">
        <div className="ww-wrap">
          <div className="ww-tiles">
            {DESTINATIONS.map((d) => <DestinationTile key={d.slug} destination={d} />)}
          </div>
        </div>
      </section>

      <LifestyleBand
        image="/wad-weids/band-ochtend.svg"
        alt="Ochtendmist boven het landschap"
        eyebrow="Nieuw in de collectie"
        title="De kaart groeit."
        text="We kopen elk jaar een aantal huizen bij, altijd op plekken waar het landschap het werk doet. Meld je aan en je hoort het als eerste."
        cta={{ label: "Bekijk onze verblijven", href: "/wad-weids/verblijven" }}
      />

      <SiteFooter />
    </>
  );
}

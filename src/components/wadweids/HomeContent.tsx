import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { PropertyGrid } from "./PropertyCard";
import { DestinationTile, LifestyleBand, SectionHead, ValueProps } from "./Sections";
import { IconArrow } from "./Icons";
import { DESTINATIONS } from "@/lib/wadweids/content";
import type { Property } from "@/lib/wadweids/types";

/* De inhoud van de homepage als component. Zo staat de pagina één keer
   beschreven en kan hetzelfde scherm ook in het telefoonframe op
   /wad-weids/mobiel worden getoond — geen tweede mobiele opmaak. */
export function HomeContent({ properties }: { properties: Property[] }) {
  return (
    <>
    <section className="ww-hero">
      <div className="ww-hero__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lodge-heide.jpg" alt="Vakantiehuis in het avondlicht aan de rand van de heide" />
        <div className="ww-hero__scrim" />
        <div className="ww-hero__content">
          <div className="ww-wrap">
            <span className="ww-eyebrow ww-eyebrow--light ww-hero__eyebrow">Wad &amp; Weids</span>
            <h1 className="ww-display">Ruimte om te ademen.</h1>
            <p className="ww-hero__sub">Bijzondere vakantiehuizen op bijzondere plekken.</p>
          </div>
        </div>
      </div>
      <div className="ww-wrap">
        <SearchBar />
      </div>
    </section>

    <section className="ww-section" id="verblijven">
      <div className="ww-wrap">
        <SectionHead
          eyebrow="Onze verblijven"
          title="Met zorg gekozen, één voor één"
          text="Vakantiehuizen op plekken waar natuur en comfort samenkomen. Allemaal vrijstaand, allemaal met eigen buitenruimte, allemaal direct bij ons te boeken."
          action={{ label: "Alle verblijven", href: "/wad-weids/verblijven" }}
        />
        <PropertyGrid properties={properties.slice(0, 6)} />
        <div className="ww-loadmore">
          <Link href="/wad-weids/verblijven" className="ww-btn ww-btn--ghost ww-btn--lg">
            Bekijk alle {properties.length} verblijven <IconArrow size={14} />
          </Link>
        </div>
      </div>
    </section>

    <section className="ww-section ww-section--sand" id="bestemmingen">
      <div className="ww-wrap">
        <SectionHead
          eyebrow="Bestemmingen"
          title="Ontdek onze bestemmingen"
          text="Van de Waddenkust tot de Drentse heide. Elke regio heeft zijn eigen licht, zijn eigen stilte en zijn eigen seizoen."
          action={{ label: "Alle bestemmingen", href: "/wad-weids/bestemmingen" }}
        />
        <div className="ww-tiles">
          {DESTINATIONS.map((d) => (
            <DestinationTile key={d.slug} destination={d} />
          ))}
        </div>
      </div>
    </section>

    <section className="ww-section" id="waarom">
      <div className="ww-wrap">
        <SectionHead eyebrow="Waarom Wad &amp; Weids" title="Vier dingen die we niet inleveren" />
        <ValueProps />
      </div>
    </section>

    <LifestyleBand
      image="/wad-weids/band-avond.svg"
      alt="Avondlicht boven de kust"
      eyebrow="De laatste uren van de dag"
      title="Even helemaal weg."
      text="Geen receptie, geen slagboom, geen buren op twee meter. Alleen jij, het huis en het landschap eromheen."
      cta={{ label: "Ontdek onze verblijven", href: "/wad-weids/verblijven" }}
    />

    <section className="ww-section" id="inspiratie">
      <div className="ww-wrap">
        <SectionHead
          eyebrow="Inspiratie"
          title="Verhalen van de kust"
          text="Wat je hier doet als het regent, waar de beste koffie staat en wanneer het wad op zijn mooist is."
        />
        <div className="ww-grid">
          {[
            { img: "/wad-weids/wad-3.svg", tag: "Wandelen", title: "Het wad op met de gids", text: "Waarom je een wadlooptocht het beste in mei of september plant." },
            { img: "/wad-weids/kwelder-2.svg", tag: "Seizoen", title: "November aan de kust", text: "Laag licht, lege stranden en huizen waar de kachel al aan staat." },
            { img: "/wad-weids/mist-1.svg", tag: "Onderweg", title: "Zes dorpen, één dag", text: "Een route langs de terpdorpen die je op de kaart nooit zou vinden." },
          ].map((item) => (
            <article className="ww-card" key={item.title}>
              <div className="ww-card__media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt="" loading="lazy" />
              </div>
              <div className="ww-card__body">
                <span className="ww-card__loc">{item.tag}</span>
                <h3 className="ww-card__title">{item.title}</h3>
                <p className="ww-card__desc">{item.text}</p>
                <div className="ww-card__foot">
                  <span className="ww-card__cta">Lezen <IconArrow size={14} /></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}

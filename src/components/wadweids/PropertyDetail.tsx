import Link from "next/link";
import { BookingWidget } from "./BookingWidget";
import { IconArea, IconBath, IconBed, IconCheck, IconGuests, IconPin } from "./Icons";
import { AMENITY_GROUPS, AMENITIES, DESTINATIONS } from "@/lib/wadweids/content";
import { euro } from "@/lib/wadweids/format";
import type { Property } from "@/lib/wadweids/types";

/* De accommodatiepagina als component: galerij, beschrijving, faciliteiten
   en de boekingsmodule. De route eromheen levert alleen de woning aan, en
   het telefoonframe op /wad-weids/mobiel gebruikt precies dezelfde code. */
export function PropertyDetail({ property }: { property: Property }) {
  const destination = DESTINATIONS.find((d) => d.slug === property.destination);
  const groepen = AMENITY_GROUPS
    .map((g) => ({ ...g, items: AMENITIES.filter((a) => a.group === g.key && property.amenities.includes(a.key)) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <div className="ww-pagehead">
        <div className="ww-wrap">
          <nav className="ww-crumbs">
            <Link href="/wad-weids">Home</Link> ·
            <Link href="/wad-weids/verblijven">Verblijven</Link> ·
            {destination && <><Link href={`/wad-weids/bestemmingen/${destination.slug}`}>{destination.name}</Link> ·</>}
            <span>{property.name}</span>
          </nav>
          <div className="ww-detail__head ww-mt-m">
            <div>
              <h1 className="ww-h2">{property.name}</h1>
              <p className="ww-card__loc ww-mt-s"><IconPin /> {property.place} · {destination?.region}</p>
            </div>
            <div className="ww-row">
              <span className="ww-price">{euro(property.priceFrom)} <small>vanaf per nacht</small></span>
            </div>
          </div>
        </div>
      </div>

      <div className="ww-wrap">
        <div className="ww-gallery">
          {property.images.slice(0, 5).map((img, i) => (
            <figure key={img.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.alt} loading={i === 0 ? "eager" : "lazy"} />
              {i === 4 && <span className="ww-gallery__more">Alle {property.images.length} foto&apos;s</span>}
            </figure>
          ))}
        </div>
      </div>

      <section className="ww-section ww-section--tight">
        <div className="ww-wrap">
          <div className="ww-detail">
            <div>
              <div className="ww-facts">
                <span className="ww-fact"><IconGuests /> <strong>{property.guests}</strong> gasten</span>
                <span className="ww-fact"><IconBed /> <strong>{property.bedrooms}</strong> slaapkamers</span>
                <span className="ww-fact"><IconBath /> <strong>{property.bathrooms}</strong> badkamers</span>
                <span className="ww-fact"><IconArea /> <strong>{property.size}</strong> m²</span>
                <span className="ww-fact">Minimaal <strong>{property.minNights}</strong> nachten</span>
              </div>

              <div className="ww-block" style={{ paddingTop: 0 }}>
                <h2 className="ww-h3">{property.tagline}</h2>
                <div className="ww-mt-m">
                  {property.description.map((alinea) => (
                    <p className="ww-body" key={alinea.slice(0, 24)}>{alinea}</p>
                  ))}
                </div>
              </div>

              <div className="ww-block">
                <h3 className="ww-h3">Wat dit huis bijzonder maakt</h3>
                <ul className="ww-highlights">
                  {property.highlights.map((h) => (
                    <li key={h}><IconCheck size={16} /> <span>{h}</span></li>
                  ))}
                </ul>
              </div>

              <div className="ww-block">
                <h3 className="ww-h3">Faciliteiten</h3>
                <div className="ww-amenities">
                  {groepen.map((groep) => (
                    <div key={groep.key}>
                      <h4>{groep.label}</h4>
                      <ul>
                        {groep.items.map((item) => (
                          <li key={item.key}><IconCheck size={15} /> {item.label}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {destination && (
                <div className="ww-block">
                  <h3 className="ww-h3">De omgeving</h3>
                  <p className="ww-body ww-mt-s">{destination.description}</p>
                  <Link href={`/wad-weids/bestemmingen/${destination.slug}`} className="ww-link ww-mt-m">
                    Meer over {destination.name}
                  </Link>
                </div>
              )}

              <div className="ww-block" style={{ borderBottom: 0 }}>
                <h3 className="ww-h3">Beschikbaarheid &amp; boeken</h3>
                <p className="ww-body ww-mt-s">
                  Kalender en tarieven van {property.name} komen rechtstreeks uit ons reserveringssysteem MyTourist en
                  zijn dus altijd actueel. Je boekt direct bij ons — geen tussenpartij, geen servicekosten.
                  Een optie vervalt automatisch als de aanbetaling van 30% uitblijft.
                </p>
                <ul className="ww-mt-m" style={{ display: "grid", gap: 10, color: "var(--ink-soft)", fontSize: ".94rem" }}>
                  <li style={{ display: "flex", gap: 11 }}><IconCheck size={15} /> Aanbetaling 30%, restant 30 dagen voor aankomst</li>
                  <li style={{ display: "flex", gap: 11 }}><IconCheck size={15} /> Gratis annuleren tot 60 dagen voor aankomst</li>
                  <li style={{ display: "flex", gap: 11 }}><IconCheck size={15} /> Eindschoonmaak {euro(property.cleaningFee)} · toeristenbelasting {euro(property.touristTaxPerPersonPerNight, true)} p.p.p.n.</li>
                </ul>
              </div>
            </div>

            <aside>
              <BookingWidget property={property} />
            </aside>
          </div>
        </div>
      </section>
      <div className="ww-mobilebar">
        <span className="ww-price">{euro(property.priceFrom)} <small>per nacht</small></span>
        <a href="#bk-arr" className="ww-btn ww-btn--primary">Bekijk beschikbaarheid</a>
      </div>
    </>
  );
}

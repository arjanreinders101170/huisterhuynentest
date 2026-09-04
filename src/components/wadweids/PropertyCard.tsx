import Link from "next/link";
import type { Property } from "@/lib/wadweids/types";
import { euro, plural } from "@/lib/wadweids/format";
import { FavoriteButton } from "./FavoriteButton";
import { IconArrow, IconBed, IconGuests, IconPin } from "./Icons";

/* ── De kaart ────────────────────────────────────────────────────────
   Deze component is de kern van het platform: homepage, zoekresultaten,
   bestemmingspagina en "vergelijkbaar" gebruiken hem allemaal. Een woning
   toevoegen betekent daarom nooit een nieuw ontwerp — alleen een record. */
export function PropertyCard({ property, priority = false }: { property: Property; priority?: boolean }) {
  const href = `/wad-weids/verblijven/${property.slug}`;
  return (
    <article className="ww-card">
      <div className="ww-card__media">
        {property.badge && <span className="ww-card__badge">{property.badge}</span>}
        <FavoriteButton id={property.id} name={property.name} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.images[0].src}
          alt={property.images[0].alt}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
      <div className="ww-card__body">
        <span className="ww-card__loc"><IconPin /> {property.place}</span>
        <h3 className="ww-card__title">{property.name}</h3>
        <div className="ww-card__facts">
          <span><IconGuests /> {plural(property.guests, "gast", "gasten")}</span>
          <span><IconBed /> {plural(property.bedrooms, "slaapkamer", "slaapkamers")}</span>
          <span>{property.size} m²</span>
        </div>
        <p className="ww-card__desc">{property.tagline}</p>
        <div className="ww-card__foot">
          <span className="ww-price">
            {euro(property.priceFrom)} <small>per nacht</small>
          </span>
          <span className="ww-card__cta">Bekijken <IconArrow size={14} /></span>
        </div>
      </div>
      <Link href={href} className="ww-card__stretch" aria-label={`${property.name} in ${property.place} bekijken`} />
    </article>
  );
}

/* Grid eromheen — zodat elke pagina dezelfde ritmiek houdt. */
export function PropertyGrid({ properties, columns = 3 }: { properties: Property[]; columns?: 2 | 3 }) {
  return (
    <div className={`ww-grid${columns === 2 ? " ww-grid--2" : ""}`}>
      {properties.map((p, i) => (
        <PropertyCard key={p.id} property={p} priority={i < 3} />
      ))}
    </div>
  );
}

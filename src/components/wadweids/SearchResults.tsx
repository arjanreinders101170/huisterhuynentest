"use client";
import { useMemo, useState } from "react";
import { DESTINATIONS, FILTER_AMENITIES, PROPERTIES } from "@/lib/wadweids/content";
import { countFilters, searchProperties } from "@/lib/wadweids/mytourist";
import type { AmenityKey, SearchFilters } from "@/lib/wadweids/types";
import { addDays, euro, iso } from "@/lib/wadweids/format";
import { PropertyCard } from "./PropertyCard";
import { IconChevron, IconClose, IconSliders } from "./Icons";

/* ── Zoekresultaten ──────────────────────────────────────────────────
   Filteren gebeurt hier tegen dezelfde functie die de PMS-adapter
   gebruikt (searchProperties), zodat de resultaten straks identiek zijn
   wanneer MyTourist het filteren overneemt. Op mobiel schuift hetzelfde
   filterpaneel omhoog als sheet — één component, twee verschijningen. */
const PRIJS_MAX = 600;

export function SearchResults({ initial }: { initial: SearchFilters }) {
  const [filters, setFilters] = useState<SearchFilters>({ sort: "aanbevolen", ...initial });
  const [sheet, setSheet] = useState(false);
  const [zichtbaar, setZichtbaar] = useState(9);

  const set = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const toggleAmenity = (key: AmenityKey) =>
    setFilters((f) => {
      const list = f.amenities ?? [];
      return { ...f, amenities: list.includes(key) ? list.filter((k) => k !== key) : [...list, key] };
    });

  const resultaten = useMemo(() => searchProperties(PROPERTIES, filters), [filters]);
  const actief = countFilters(filters);
  const today = iso(new Date());

  const paneel = (
    <div className="ww-filters">
      <div className="ww-filters__group">
        <h4>Bestemming</h4>
        <select className="ww-input" value={filters.destination ?? ""} onChange={(e) => set("destination", e.target.value || undefined)}>
          <option value="">Alle bestemmingen</option>
          {DESTINATIONS.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </div>

      <div className="ww-filters__group">
        <h4>Periode</h4>
        <div className="ww-inputrow">
          <input
            className="ww-input" type="date" min={today} aria-label="Aankomst"
            value={filters.arrival ?? ""}
            onChange={(e) => {
              const arrival = e.target.value || undefined;
              setFilters((f) => ({
                ...f, arrival,
                departure: arrival && f.departure && f.departure <= arrival ? addDays(arrival, 3) : f.departure,
              }));
            }}
          />
          <input
            className="ww-input" type="date" aria-label="Vertrek"
            min={filters.arrival ? addDays(filters.arrival, 1) : today}
            value={filters.departure ?? ""}
            onChange={(e) => set("departure", e.target.value || undefined)}
          />
        </div>
        <p className="ww-meta">Beschikbaarheid komt live uit MyTourist.</p>
      </div>

      <div className="ww-filters__group">
        <h4>Gezelschap</h4>
        <div className="ww-inputrow">
          <select className="ww-input" aria-label="Aantal gasten" value={filters.guests ?? ""} onChange={(e) => set("guests", e.target.value ? +e.target.value : undefined)}>
            <option value="">Gasten</option>
            {[2, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n}+ gasten</option>)}
          </select>
          <select className="ww-input" aria-label="Aantal slaapkamers" value={filters.bedrooms ?? ""} onChange={(e) => set("bedrooms", e.target.value ? +e.target.value : undefined)}>
            <option value="">Slaapkamers</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+ slaapkamers</option>)}
          </select>
        </div>
      </div>

      <div className="ww-filters__group">
        <h4>Prijs per nacht</h4>
        <input
          className="ww-range" type="range" min={200} max={PRIJS_MAX} step={5}
          value={filters.maxPrice ?? PRIJS_MAX}
          onChange={(e) => set("maxPrice", +e.target.value >= PRIJS_MAX ? undefined : +e.target.value)}
          aria-label="Maximumprijs per nacht"
        />
        <div className="ww-row" style={{ justifyContent: "space-between" }}>
          <span className="ww-meta">Tot {euro(filters.maxPrice ?? PRIJS_MAX)}</span>
          <span className="ww-meta">{filters.maxPrice ? "" : "geen maximum"}</span>
        </div>
      </div>

      <div className="ww-filters__group">
        <h4>Voorzieningen</h4>
        <div className="ww-chips">
          {FILTER_AMENITIES.map((a) => (
            <button
              key={a.key} type="button" className="ww-chip"
              aria-pressed={filters.amenities?.includes(a.key) ?? false}
              onClick={() => toggleAmenity(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {actief > 0 && (
        <button type="button" className="ww-chip ww-chip--clear" onClick={() => setFilters({ sort: filters.sort })}>
          <IconClose size={13} /> Wis alle filters ({actief})
        </button>
      )}
    </div>
  );

  return (
    <div className="ww-results">
      <aside>{paneel}</aside>

      <div>
        <div className="ww-toolbar">
          <p className="ww-toolbar__count">
            <strong>{resultaten.length}</strong> van {PROPERTIES.length} verblijven
            {filters.arrival && filters.departure ? " beschikbaar in deze periode" : ""}
          </p>
          <div className="ww-row">
            <button type="button" className="ww-btn ww-btn--ghost ww-filterbtn" onClick={() => setSheet(true)}>
              <IconSliders size={15} /> Filters{actief ? ` (${actief})` : ""}
            </button>
            <div className="ww-sort">
              <label htmlFor="ww-sort">Sorteer</label>
              <select id="ww-sort" value={filters.sort} onChange={(e) => set("sort", e.target.value as SearchFilters["sort"])}>
                <option value="aanbevolen">Aanbevolen</option>
                <option value="prijs-op">Prijs — laag naar hoog</option>
                <option value="prijs-af">Prijs — hoog naar laag</option>
                <option value="personen">Aantal personen</option>
              </select>
              <IconChevron size={12} />
            </div>
          </div>
        </div>

        {resultaten.length === 0 ? (
          <div className="ww-empty">
            <h3 className="ww-h3">Niets gevonden in deze periode</h3>
            <p className="ww-body ww-mt-s" style={{ margin: "12px auto 0" }}>
              Probeer een andere week of laat een filter los. Onze collectie groeit; wat er vandaag niet is, staat er volgend seizoen misschien wel.
            </p>
            <button type="button" className="ww-btn ww-btn--ghost ww-mt-m" onClick={() => setFilters({ sort: filters.sort })}>
              Wis alle filters
            </button>
          </div>
        ) : (
          <>
            <div className="ww-grid ww-grid--2">
              {resultaten.slice(0, zichtbaar).map((p, i) => (
                <PropertyCard key={p.id} property={p} priority={i < 2} />
              ))}
            </div>
            {resultaten.length > zichtbaar && (
              <div className="ww-loadmore">
                <button type="button" className="ww-btn ww-btn--ghost ww-btn--lg" onClick={() => setZichtbaar((n) => n + 9)}>
                  Meer verblijven laden
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {sheet && (
        <div className="ww-sheet" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="ww-sheet__scrim" onClick={() => setSheet(false)} />
          <div className="ww-sheet__panel">
            <div className="ww-sheet__head">
              <h3 className="ww-h4">Filters</h3>
              <button onClick={() => setSheet(false)} aria-label="Filters sluiten"><IconClose /></button>
            </div>
            <div className="ww-sheet__body">{paneel}</div>
            <div className="ww-sheet__foot">
              <button type="button" className="ww-btn ww-btn--ghost" onClick={() => setFilters({ sort: filters.sort })}>Wissen</button>
              <button type="button" className="ww-btn ww-btn--primary" onClick={() => setSheet(false)}>
                Toon {resultaten.length} verblijven
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

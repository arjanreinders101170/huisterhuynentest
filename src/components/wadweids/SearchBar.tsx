"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DESTINATIONS } from "@/lib/wadweids/content";
import { addDays, iso } from "@/lib/wadweids/format";
import { IconChevron, IconSearch } from "./Icons";

/* De zoekmodule. Staat op de homepage over de hero en bovenaan de
   zoekresultaten; beide keren dezelfde component, dezelfde velden.
   De ingevulde waarden gaan als querystring naar /verblijven, zodat een
   zoekopdracht deelbaar en bookmarkbaar is — en straks rechtstreeks als
   filter naar MyTourist kan. */
export function SearchBar({ variant = "hero", initial }: {
  variant?: "hero" | "flat";
  initial?: { destination?: string; arrival?: string; departure?: string; guests?: number };
}) {
  const router = useRouter();
  const today = iso(new Date());
  const [destination, setDestination] = useState(initial?.destination ?? "");
  const [arrival, setArrival] = useState(initial?.arrival ?? "");
  const [departure, setDeparture] = useState(initial?.departure ?? "");
  const [guests, setGuests] = useState(String(initial?.guests ?? ""));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("bestemming", destination);
    if (arrival) params.set("aankomst", arrival);
    if (departure) params.set("vertrek", departure);
    if (guests) params.set("gasten", guests);
    router.push(`/wad-weids/verblijven${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <form className={`ww-search${variant === "flat" ? " ww-search--flat" : ""}`} onSubmit={submit}>
      <div className="ww-field">
        <label htmlFor="ww-dest">Waar wil je naartoe?</label>
        <select id="ww-dest" value={destination} onChange={(e) => setDestination(e.target.value)}>
          <option value="">Alle bestemmingen</option>
          {DESTINATIONS.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
        <span className="ww-field__caret"><IconChevron /></span>
      </div>

      <div className="ww-field">
        <label htmlFor="ww-arr">Aankomst</label>
        <input
          id="ww-arr" type="date" min={today} value={arrival}
          onChange={(e) => {
            setArrival(e.target.value);
            if (departure && departure <= e.target.value) setDeparture(addDays(e.target.value, 3));
          }}
        />
      </div>

      <div className="ww-field">
        <label htmlFor="ww-dep">Vertrek</label>
        <input
          id="ww-dep" type="date" min={arrival ? addDays(arrival, 1) : today}
          value={departure} onChange={(e) => setDeparture(e.target.value)}
        />
      </div>

      <div className="ww-field">
        <label htmlFor="ww-guests">Aantal gasten</label>
        <select id="ww-guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
          <option value="">Maakt niet uit</option>
          {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? "gast" : "gasten"}</option>
          ))}
        </select>
        <span className="ww-field__caret"><IconChevron /></span>
      </div>

      <div className="ww-search__submit">
        <button type="submit" className="ww-btn ww-btn--primary">
          <IconSearch size={16} /> Zoeken
        </button>
      </div>
    </form>
  );
}

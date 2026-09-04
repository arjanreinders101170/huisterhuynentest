import { SiteHeader } from "@/components/wadweids/SiteHeader";
import { SiteFooter } from "@/components/wadweids/SiteFooter";
import { SearchBar } from "@/components/wadweids/SearchBar";
import { SearchResults } from "@/components/wadweids/SearchResults";
import type { SearchFilters } from "@/lib/wadweids/types";

/* Zoekresultaten. De querystring is de bron van waarheid, zodat een
   zoekopdracht te delen is en straks één op één als filterset naar
   MyTourist kan. */
export const metadata = { title: "Vind jouw ideale verblijf — Wad & Weids" };

export default async function VerblijvenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const q = await searchParams;
  const one = (key: string) => (Array.isArray(q[key]) ? q[key][0] : q[key]) as string | undefined;

  const initial: SearchFilters = {
    destination: one("bestemming"),
    arrival: one("aankomst"),
    departure: one("vertrek"),
    guests: one("gasten") ? Number(one("gasten")) : undefined,
  };

  return (
    <>
      <SiteHeader />
      <div className="ww-pagehead ww-pagehead--onsand">
        <div className="ww-wrap">
          <span className="ww-eyebrow">Zoeken</span>
          <h1 className="ww-h2 ww-mt-s">Vind jouw ideale verblijf</h1>
          <p className="ww-lead ww-mt-s">
            Acht huizen vandaag, meer elk seizoen. Filter op periode, gezelschap en wat je buiten wilt hebben.
          </p>
          <div className="ww-mt-m">
            <SearchBar variant="flat" initial={initial} />
          </div>
        </div>
      </div>

      <section className="ww-section ww-section--tight">
        <div className="ww-wrap">
          <SearchResults initial={initial} />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

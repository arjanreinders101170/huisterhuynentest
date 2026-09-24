/* ═══ Gastenbeoordelingen ═══
 *
 * Nog leeg: de eerste gasten komen vanaf 1 april 2027. Dit bestand staat er
 * nu al zodat de structured data straks klaarstaat op het moment dat de
 * eerste beoordeling binnenkomt — dan is het een regel data erbij en geen
 * codewijziging meer.
 *
 * De harde regel eronder: zonder échte beoordelingen komt er GEEN
 * aggregateRating in de schema-output. Een verzonnen of lege rating is geen
 * klein kwaad maar een overtreding van het beoordelingsbeleid van Google, met
 * handmatige maatregelen als gevolg — en het is bovendien gewoon liegen tegen
 * een gast die nog moet boeken. De functies hieronder geven daarom een leeg
 * object terug zolang REVIEWS leeg is.
 *
 * Alleen beoordelingen opnemen die een gast zelf heeft gegeven en die u kunt
 * aantonen. Overgenomen van een platform? Neem dan de bron op in `bron`.
 */

export interface Gastbeoordeling {
  /** Naam zoals de gast hem zelf gebruikt. Geen achternaam nodig. */
  auteur: string;
  /** ISO-datum van de beoordeling (niet van het verblijf). */
  datum: string;
  /** Hele of halve sterren, 1 tot en met 5. */
  score: number;
  tekst: string;
  /** Slug van de lodge waar het over gaat. Weggelaten = geldt voor beide. */
  lodge?: "lodge-de-heide" | "lodge-de-eik";
  /** Waar de beoordeling vandaan komt, als het niet rechtstreeks was. */
  bron?: string;
}

export const REVIEWS: Gastbeoordeling[] = [];

/** De beoordelingen die bij één lodge horen, plus de beoordelingen die over
 *  het geheel gaan. Zonder slug: alles. */
export function beoordelingenVoor(lodgeSlug?: string): Gastbeoordeling[] {
  if (!lodgeSlug) return REVIEWS;
  return REVIEWS.filter((r) => !r.lodge || r.lodge === lodgeSlug);
}

/** Schema.org-fragment met aggregateRating en review, of een leeg object.
 *
 *  Leeg zolang er niets is: `{}` spreidt met de spread-operator uit tot niets,
 *  zodat de aanroepende kant geen `if` nodig heeft en er nooit per ongeluk een
 *  `ratingValue: 0` of `reviewCount: 0` in de output belandt. Google keurt
 *  beide af, en terecht. */
export function beoordelingSchema(lodgeSlug?: string): Record<string, unknown> {
  const lijst = beoordelingenVoor(lodgeSlug).filter(
    (r) => Number.isFinite(r.score) && r.score >= 1 && r.score <= 5,
  );
  if (lijst.length === 0) return {};

  const som = lijst.reduce((t, r) => t + r.score, 0);
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number((som / lijst.length).toFixed(1)),
      reviewCount: lijst.length,
      bestRating: 5,
      worstRating: 1,
    },
    /* Maximaal een handvol losse beoordelingen meesturen. Meer maakt de pagina
     * zwaarder zonder dat een zoekmachine er iets extra's mee doet. */
    review: lijst
      .slice()
      .sort((a, b) => b.datum.localeCompare(a.datum))
      .slice(0, 5)
      .map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.auteur },
        datePublished: r.datum,
        reviewBody: r.tekst,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.score,
          bestRating: 5,
          worstRating: 1,
        },
        ...(r.bron ? { publisher: { "@type": "Organization", name: r.bron } } : {}),
      })),
  };
}

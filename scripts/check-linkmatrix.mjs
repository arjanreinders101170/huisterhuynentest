#!/usr/bin/env node
/**
 * Controleert de interne linkmatrix (src/lib/link-matrix.ts).
 *
 *   node --experimental-strip-types scripts/check-linkmatrix.mjs
 *
 * Waarom dit script bestaat: elke matrixlink wordt bij het renderen achter de
 * alinea gezet die het `na`-fragment bevat. Wordt zo'n alinea in de admin
 * herschreven, dan verschuift de link stilzwijgend naar het "lees verder"-blok
 * onderaan — nog steeds een link, maar niet meer contextueel. Dit script laat
 * per link zien waar hij landt, gemeten tegen de seedteksten in deze repo.
 *
 * Let op: blogs die niet in de seed staan (de oudere artikelen leven alleen in
 * de database) kunnen hier niet gecontroleerd worden. Die staan apart vermeld.
 */

import { LINK_MATRIX, pasMatrixToe } from "../src/lib/link-matrix.ts";
import { SEED_LANDING_PAGES } from "../src/lib/landing-seed.ts";
import { SEED_BLOG_POSTS } from "../src/lib/blog-seed.ts";

const landing = new Map(
  SEED_LANDING_PAGES.map((p) => [`/${p.slug}`, p.sections.flatMap((s) => s.body)]),
);
const blogs = new Map(SEED_BLOG_POSTS.map((p) => [`/blog/${p.slug}`, p.inhoud.split(/\n\n+/)]));

let inDeTekst = 0;
let terugval = 0;
let buitenDeSeed = 0;
let fouten = 0;

for (const [bron, links] of Object.entries(LINK_MATRIX)) {
  if (links.length > 2) {
    console.error(`FOUT  ${bron}: ${links.length} uitgaande links (maximaal twee)`);
    fouten++;
  }
  const blokken = landing.get(bron) ?? blogs.get(bron);
  if (!blokken) {
    buitenDeSeed += links.length;
    for (const l of links) console.log(`?     ${bron} → ${l.href} (bron staat niet in de seed)`);
    continue;
  }
  const { blokken: metLinks } = pasMatrixToe(blokken, links);
  for (const l of links) {
    if (l.href === bron) {
      console.error(`FOUT  ${bron} linkt naar zichzelf`);
      fouten++;
    }
    if (metLinks.some((b) => b.includes(`](${l.href})`))) {
      inDeTekst++;
      console.log(`ok    ${bron} → ${l.href}`);
    } else {
      terugval++;
      console.log(`let op ${bron} → ${l.href}: fragment niet gevonden, valt terug op "lees verder"`);
    }
  }
}

console.log(
  `\n${inDeTekst} link(s) in de lopende tekst, ${terugval} in het lees-verder-blok, ` +
    `${buitenDeSeed} niet te controleren vanuit de seed.`,
);
process.exit(fouten > 0 ? 1 : 0);

import Link from "next/link";

/* ═══ Interne links in lopende tekst ═══
 *
 * De bodytekst van landingspagina's en blogs werd tot nu toe als kale string
 * in een <p> gezet. Daardoor was er geen enkele manier om een link ín een zin
 * te zetten — en juist die telt: een link die contextueel in de tekst staat
 * geeft autoriteit door, een link die op elke pagina in de footer staat
 * nauwelijks. De hele interne linkmatrix uit het SEO-plan hing hierop vast.
 *
 * Syntaxis is die van Markdown: [ankertekst](/pad).
 *
 * Bewust alléén interne paden. De tekst komt uit de database en wordt in de
 * admin bewerkt; een href die met http of javascript: mag beginnen maakt van
 * een contentveld een injectiepunt. Wat niet aan de vorm voldoet, blijft
 * gewoon als letterlijke tekst staan — zichtbaar fout is beter dan stil weg.
 */

/** [tekst](/pad) — één paar haken, daarna direct een pad dat met / begint. */
const LINK_PATROON = /\[([^\]\n]+)\]\((\/[^)\s]*)\)/g;

export function renderTekstMetLinks(tekst: string, key?: string | number): React.ReactNode {
  LINK_PATROON.lastIndex = 0;
  if (!LINK_PATROON.test(tekst)) return tekst;

  LINK_PATROON.lastIndex = 0;
  const delen: React.ReactNode[] = [];
  let laatste = 0;
  let m: RegExpExecArray | null;

  while ((m = LINK_PATROON.exec(tekst)) !== null) {
    if (m.index > laatste) delen.push(tekst.slice(laatste, m.index));
    delen.push(
      <Link
        key={`${key ?? "l"}-${m.index}`}
        href={m[2]}
        style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}
      >
        {m[1]}
      </Link>,
    );
    laatste = m.index + m[0].length;
  }
  if (laatste < tekst.length) delen.push(tekst.slice(laatste));
  return delen;
}

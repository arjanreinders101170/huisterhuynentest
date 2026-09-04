/* Ontleding van blogtekst — één bron voor de artikelpagina en de admin-preview.
 *
 * De opmaaktaal is bewust klein: # / ## / ### voor koppen, **vet** binnen een
 * regel, een lege regel begint een nieuwe alinea. Meer heeft de redactie niet
 * nodig, en alles wat er niet in zit kan ook niet stukgaan.
 *
 * Deze module ontleedt alleen; hoe een kop of alinea eruitziet bepaalt de
 * pagina zelf. De artikelpagina en de admin-preview stylen dus verschillend,
 * maar zien dezelfde structuur — anders belooft de preview iets anders dan de
 * bezoeker krijgt.
 */

export type KopNiveau = 1 | 2 | 3;

export type InhoudDeel =
  | { soort: "kop"; niveau: KopNiveau; tekst: string }
  | { soort: "alinea"; regels: string[] };

/** Is deze regel een kop, en zo ja welke? Het hekje moet door een spatie
 *  gevolgd worden, zodat "#hashtag" gewoon tekst blijft. */
function kopNiveau(regel: string): KopNiveau | null {
  if (regel.startsWith("### ")) return 3;
  if (regel.startsWith("## ")) return 2;
  if (regel.startsWith("# ")) return 1;
  return null;
}

/**
 * Splits artikeltekst in koppen en alinea's.
 *
 * Werkt per regel in plaats van per blok. Dat was eerst andersom: de tekst
 * werd op lege regels in blokken geknipt en alleen het begin van een blok kon
 * een kop zijn. Dat brak op twee manieren die in de praktijk voorkomen.
 *
 * Regeleindes. Tekst die via de SQL-editor of een plakactie binnenkomt kan
 * \r\n gebruiken. Dan bestaat er geen enkele lege regel in de zin van \n\n,
 * viel het hele artikel in één blok en stonden alle hekjes letterlijk in beeld.
 * De tekst wordt daarom eerst genormaliseerd.
 *
 * Koppen zonder lege regel ervoor. Wie in de admin een kop direct onder een
 * alinea typt, kreeg diezelfde alinea met de hekjes erin. Nu is elke regel die
 * met een hekje plus spatie begint een kop, ongeacht wat eromheen staat.
 */
export function ontleedInhoud(inhoud: string): InhoudDeel[] {
  const regels = inhoud.replace(/\r\n?/g, "\n").split("\n");

  const delen: InhoudDeel[] = [];
  let alinea: string[] = [];
  const sluitAlinea = () => {
    if (alinea.length > 0) delen.push({ soort: "alinea", regels: alinea });
    alinea = [];
  };

  for (const ruweRegel of regels) {
    const regel = ruweRegel.trim();
    if (!regel) { sluitAlinea(); continue; }
    const niveau = kopNiveau(regel);
    if (niveau) {
      sluitAlinea();
      delen.push({ soort: "kop", niveau, tekst: regel.slice(niveau + 1) });
    } else {
      alinea.push(regel);
    }
  }
  sluitAlinea();

  return delen;
}

/** Splits een regel in gewone stukken en **vet** gemarkeerde stukken. */
export function splitsVet(regel: string): { vet: boolean; tekst: string }[] {
  return regel
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((deel) => deel !== "")
    .map((deel) =>
      deel.startsWith("**") && deel.endsWith("**") && deel.length > 4
        ? { vet: true, tekst: deel.slice(2, -2) }
        : { vet: false, tekst: deel },
    );
}

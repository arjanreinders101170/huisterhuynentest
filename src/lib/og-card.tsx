import { ImageResponse } from "next/og";

/**
 * Gedeelde social-share kaart (1200×630) voor blogartikelen en landingspagina's.
 *
 * Elke pagina zonder eigen, unieke foto krijgt hiermee een eigen preview met de
 * eigen titel — voorheen deelden alle blogs en de helft van de landingspagina's
 * dezelfde lodge-heide.jpg, wat de doorklikratio op social media drukt.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const C = {
  green: "#2F4F3E",
  gold: "#B49A5E",
  cream: "#FDFBF6",
  muted: "rgba(253, 251, 246, 0.72)",
  line: "rgba(180, 154, 94, 0.45)",
};

/** Tweede gloed op de kaart. Per slug een vaste kleur, zodat twee kaarten naast
 *  elkaar in een tijdlijn niet identiek ogen. Allemaal binnen het merkpalet. */
const ACCENTS = [
  "rgba(146, 109, 171, 0.28)", // heidepaars
  "rgba(180, 154, 94, 0.30)",  // goud
  "rgba(122, 148, 116, 0.30)", // mosgroen
  "rgba(196, 132, 92, 0.26)",  // herfstoker
  "rgba(108, 137, 163, 0.28)", // schemerblauw
];

function accentFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

/** Grotere koppen voor korte titels, kleinere voor lange — zodat de kaart altijd gevuld is. */
function titleSize(titel: string): number {
  if (titel.length <= 38) return 70;
  if (titel.length <= 58) return 60;
  if (titel.length <= 78) return 52;
  return 44;
}

export interface OgCardProps {
  /** Bepaalt de accentkleur; gebruik de slug zodat een pagina altijd dezelfde kaart houdt. */
  seed: string;
  /** Label in het pilletje boven de titel, bijv. de categorie of de eyebrow. */
  chip: string;
  titel: string;
  /** Regel linksonder, bijv. "Leestijd 6 minuten" of "Vanaf €165 per nacht". */
  footer: string;
  /** Regel rechtsboven; standaard de locatie. */
  locatie?: string;
}

export function ogCardResponse({ seed, chip, titel, footer, locatie = "Zeijen · Drenthe" }: OgCardProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: C.green,
          backgroundImage: `radial-gradient(circle at 88% 8%, rgba(180,154,94,0.30) 0%, rgba(47,79,62,0) 55%), radial-gradient(circle at 6% 100%, ${accentFor(seed)} 0%, rgba(47,79,62,0) 52%)`,
          color: C.cream,
          fontFamily: "sans-serif",
        }}
      >
        {/* Merkbalk */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 7, color: C.gold, fontWeight: 600 }}>
            HUIS TER HUYNEN
          </div>
          <div style={{ display: "flex", fontSize: 22, color: C.muted }}>{locatie}</div>
        </div>

        {/* Titelblok */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 20px",
              borderRadius: 999,
              border: `1px solid ${C.line}`,
              color: C.gold,
              fontSize: 22,
              letterSpacing: 2,
              marginBottom: 28,
            }}
          >
            {chip.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titleSize(titel),
              lineHeight: 1.18,
              fontWeight: 700,
              letterSpacing: -1,
              maxWidth: 960,
            }}
          >
            {titel}
          </div>
        </div>

        {/* Voetbalk */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: 120, height: 4, background: C.gold, marginBottom: 24 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 24, color: C.muted }}>{footer}</div>
            <div style={{ display: "flex", fontSize: 24, color: C.cream }}>huisterhuynen.nl</div>
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}

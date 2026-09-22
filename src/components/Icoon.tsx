/* ═══ Lijniconen ═══
 *
 * Stonden als ICOON_PADEN binnen in LandingTemplate. Zodra een tweede
 * paginatype dezelfde voorzieningen moest tonen (wifi, hottub, parkeren)
 * lag de keuze tussen de lijst kopiëren of hem hierheen halen. Gekopieerd
 * zouden twee bestanden hetzelfde pictogram tekenen en na de eerste
 * correctie niet meer hetzelfde.
 *
 * Eén vlak van 24×24, alleen lijnen (fill="none"), zodat elk pictogram
 * dezelfde optische zwaarte houdt op elke maat.
 *
 * Elk item krijgt zijn eigen tekening. In het aangeleverde ontwerp kreeg
 * ieder item binnen een kaart hetzelfde icoon — een badkuip bij "Toilet",
 * een bank bij "TV", vier keer hetzelfde pannetje bij afwasmachine,
 * koelkast, combimagnetron en fornuis. Een icoon dat het verkeerde ding
 * toont, kost meer aan begrijpelijkheid dan het aan sier oplevert.
 *
 * Onbekende naam levert daarom niets op in plaats van een willekeurig
 * symbool: liever geen icoon dan het verkeerde.
 */
export const ICOON_PADEN: Record<string, string> = {
  bed: "M2 17v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5M2 17h20M2 17v3M22 17v3M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",
  douche: "M4 20v-9a5 5 0 0 1 10 0M14 4a2 2 0 1 1 4 0v7M8 16v1M11 15v2M5 15v2",
  toilet: "M6 3v8a5 5 0 0 0 5 5h1l1 5M6 11h11M17 3v8",
  tafel: "M3 10h18M5 10v9M19 10v9M8 10V7h8v3",
  tv: "M3 6h18v11H3zM8 21h8M12 17v4",
  vaatwasser: "M4 3h16v18H4zM4 8h16M7 5.5h.01M10 5.5h.01M12 12a3 3 0 0 0 0 6 3 3 0 0 0 0-6z",
  koelkast: "M5 2h14v20H5zM5 10h14M8 6v2M8 13v2",
  magnetron: "M2 5h20v14H2zM15 5v14M5 8h6M5 12h6M18 9v.01M18 13v.01",
  fornuis: "M4 8h16v13H4zM4 8V5h16v3M8 12h.01M12 12h.01M16 12h.01M8 16h8",
  keuken: "M6 2v8a2 2 0 0 0 4 0V2M8 10v12M16 2c-1.5 1-2 3-2 5s.5 3 2 3 2-1 2-3-.5-4-2-5zM16 10v12",
  nietRoken: "M2 15h14v4H2zM18 15h4v4h-4M17 12c2-1 2-3 0-4M13 12c2-1 2-3 0-4M3 3l18 18",
  huisdier: "M11 18a3 3 0 0 0 3 3 3 3 0 0 0 3-3c0-2-2-3-3-5-1 2-3 3-3 5zM6 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  geenFeest: "M4 20l5-12 7 7-12 5zM14 5l1-2M18 8l2-1M17 3l1 1M20 11l1 .5M3 3l18 18",
  wifi: "M2.5 8.5a16 16 0 0 1 19 0M5.5 12.5a11 11 0 0 1 13 0M8.5 16.5a6 6 0 0 1 7 0M12 20h.01",
  parkeren: "M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 17V7h4a3 3 0 0 1 0 6H9",
  koffie: "M4 9h13v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M3 21h15M7 2v3M11 2v3",
  waterkoker: "M6 9h10l1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM16 11l3-2M9 9V7a2 2 0 0 1 4 0v2",
  verwarming: "M4 6v13M8 6v13M12 6v13M16 6v13M3 4h14M3 21h14M20 7c-1 1.5-1 2.5 0 4s1 2.5 0 4",

  /* ── Voor de lodgepagina ────────────────────────────────────────── */
  /* De hottub: een kuip met dampslierten erboven. Zelfde vorm als de
   * sauna, maar rond in plaats van een ton op zijn kant. */
  hottub: "M3 11h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM5 19l-1 2M19 19l1 2M8 8c0-1.5 1.5-1.5 1.5-3S8 2 8 2M12 8c0-1.5 1.5-1.5 1.5-3S12 2 12 2M16 8c0-1.5 1.5-1.5 1.5-3S16 2 16 2",
  sauna: "M3 8h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 13h18M7 4c0-1 1-1 1-2M12 4c0-1 1-1 1-2M17 4c0-1 1-1 1-2",
  personen: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1M17 4.5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 4 5v1",
  slaapkamer: "M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 18h18M3 18v2M21 18v2M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2",
  badkamer: "M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 20l-1 2M18 20l1 2M7 12V5a2 2 0 0 1 4 0v1",
  bbq: "M5 3h14l-2 8H7zM7 11l-2 10M17 11l2 10M8 21h8M10 6h.01M14 6h.01",
  laadpaal: "M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M4 21h11M8 8l2.5-3-1 3H12l-2.5 3 1-3zM17 10h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 1-3 0v-3h-1",
  boom: "M12 22v-6M12 16l-4-3h8l-4 3zM12 2l5 7H7zM9.5 9l-2.5 4h10l-2.5-4",
  hart: "M12 20s-7-4.5-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.5 12 20 12 20z",
  blad: "M4 20c0-8 5-13 16-14 0 11-5 15-12 15H4zM8 16c2-4 5-6 8-7",
  ster: "M12 3l2.6 5.5 5.9.8-4.3 4.3 1 6.1-5.2-2.9-5.2 2.9 1-6.1L3.5 9.3l5.9-.8z",
  klok: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  sleutel: "M15 3a6 6 0 0 0-5.6 8.2L3 17.6V21h3.4l1-1v-2h2v-2h2l1.4-1.4A6 6 0 1 0 15 3zM16.5 7.5h.01",
};

export function Icoon({ naam, kleur, maat = 17 }: { naam?: string; kleur: string; maat?: number }) {
  const pad = naam ? ICOON_PADEN[naam] : undefined;
  if (!pad) return null;
  return (
    <svg
      width={maat} height={maat} viewBox="0 0 24 24" fill="none" stroke={kleur}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }} aria-hidden focusable="false"
    >
      <path d={pad} />
    </svg>
  );
}

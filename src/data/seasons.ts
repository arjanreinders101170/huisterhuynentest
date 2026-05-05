/**
 * Seizoenslogica — automatisch andere content per seizoen.
 * Gebruikt door Home.tsx voor weertips en populair item.
 */

type Season = {
  id: string;
  naam: string;
  tip: string;
  tipLink: string;
  populairItem: string;
  populairSub: string;
  populairCategory: string;
};

const SEASONS: Record<string, Season> = {
  winter: {
    id: "winter",
    naam: "Winter",
    tip: "Winterwandeling door de Zeijerstrubben — daarna opwarmen bij de open haard",
    tipLink: "natuur",
    populairItem: "Drents Museum",
    populairSub: "Cultuur & geschiedenis in Assen",
    populairCategory: "cultuur",
  },
  lente: {
    id: "lente",
    naam: "Lente",
    tip: "De lammetjes zijn er! Wandel langs de schaapskudde op het Balloërveld",
    tipLink: "natuur",
    populairItem: "Veentjesroute",
    populairSub: "Wandelen door het veen vanuit Zeijen",
    populairCategory: "natuur",
  },
  zomer: {
    id: "zomer",
    naam: "Zomer",
    tip: "De heide bloeit paars — pak de fiets naar het Dwingelderveld",
    tipLink: "actief",
    populairItem: "Kano op de Hunze",
    populairSub: "Varen door prachtige natuur",
    populairCategory: "actief",
  },
  herfst: {
    id: "herfst",
    naam: "Herfst",
    tip: "Paddenstoelentijd! De bossen rond Zeijen kleuren prachtig",
    tipLink: "natuur",
    populairItem: "LOFF Wellness",
    populairSub: "Opwarmen in de Finse sauna",
    populairCategory: "wellness",
  },
};

export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return SEASONS.lente;    // mrt-mei
  if (month >= 5 && month <= 7) return SEASONS.zomer;    // jun-aug
  if (month >= 8 && month <= 10) return SEASONS.herfst;  // sep-nov
  return SEASONS.winter;                                  // dec-feb
}

export type { Season };

import type { GuestProfile } from "./tokens";

type ProfileConfig = {
  label: string;
  emoji: string;
  sub: string;
  welkom: string;
  tileOrder: string[];
  popularItem: { naam: string; sub: string; category: string };
  upsellOrder: string[];
  chatContext: string;
};

export const PROFILES: Record<Exclude<GuestProfile, null>, ProfileConfig> = {
  stel: {
    label: "Als stel",
    emoji: "👫",
    sub: "Romantiek, lekker eten & quality time",
    welkom: "Geniet van jullie tijd samen",
    tileOrder: ["eten", "ontspanning", "natuur", "cultuur", "actief", "kinderen"],
    popularItem: {
      naam: "De Jufferen Lunsingh",
      sub: "Fine dining · eigen moestuin · Gault&Millau",
      category: "eten",
    },
    upsellOrder: ["welkomst", "latecheck", "fiets", "boodschappen"],
    chatContext: "Dit is een stel dat romantiek en quality time zoekt. Adviseer restaurants, wellness en rustige wandelingen.",
  },
  gezin: {
    label: "Met kinderen",
    emoji: "👨‍👩‍👧‍👦",
    sub: "Avontuur, speelplezier & samen genieten",
    welkom: "Welkom met het hele gezin!",
    tileOrder: ["kinderen", "actief", "natuur", "eten", "cultuur", "ontspanning"],
    popularItem: {
      naam: "Speelpark Sprookjeshof",
      sub: "Dagvullend uitje · avontuur · tot 10 jaar",
      category: "kinderen",
    },
    upsellOrder: ["fiets", "boodschappen", "welkomst", "latecheck"],
    chatContext: "Dit is een gezin met kinderen. Adviseer kindvriendelijke uitjes, speeltuinen en restaurants met kindermenu.",
  },
  actief: {
    label: "Actief & sportief",
    emoji: "🚴",
    sub: "Fietsen, wandelen & buitenleven",
    welkom: "Klaar voor avontuur?",
    tileOrder: ["actief", "natuur", "eten", "cultuur", "ontspanning", "kinderen"],
    popularItem: {
      naam: "Kano Zwerftocht Hunze",
      sub: "2-3 uur · door natuurgebieden · uniek",
      category: "actief",
    },
    upsellOrder: ["fiets", "boodschappen", "welkomst", "latecheck"],
    chatContext: "Dit is een sportieve gast die van buitenactiviteiten houdt. Adviseer fietsroutes, wandelingen en wateractiviteiten.",
  },
  rust: {
    label: "Rust & ontspanning",
    emoji: "💆",
    sub: "Wellness, stilte & tot rust komen",
    welkom: "Tijd om helemaal tot rust te komen",
    tileOrder: ["ontspanning", "eten", "natuur", "cultuur", "actief", "kinderen"],
    popularItem: {
      naam: "LOFF Boutique Wellness",
      sub: "Kleinschalige sauna · sneeuwdouche · Assen",
      category: "ontspanning",
    },
    upsellOrder: ["welkomst", "latecheck", "boodschappen", "fiets"],
    chatContext: "Dit is een gast die rust en ontspanning zoekt. Adviseer wellness, rustige wandelingen en fine dining.",
  },
};

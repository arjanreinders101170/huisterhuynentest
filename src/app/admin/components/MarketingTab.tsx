"use client";
import { useState, useEffect, useCallback } from "react";

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  green: "#2F4F3E", gold: "#B49A5E",
};

type Priority = "kritiek" | "hoog" | "midden" | "laag";
type Category = "LP" | "Blog" | "Lokaal" | "CRO" | "Email" | "Analytics" | "Social" | "Betaald";

interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  keyword?: string;
  note?: string;
}

interface Month {
  id: string;
  label: string;
  sublabel: string;
  phase: string;
  tasks: Task[];
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  kritiek: { label: "Kritiek", color: "#991B1B", bg: "#FEE2E2", dot: "#EF4444" },
  hoog:    { label: "Hoog",    color: "#92400E", bg: "#FEF3C7", dot: "#F59E0B" },
  midden:  { label: "Midden",  color: "#1E3A5F", bg: "#DBEAFE", dot: "#3B82F6" },
  laag:    { label: "Laag",    color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" },
};

/** Koppelt taken aan een live e-mailtemplate-preview (admin → /api/admin/email-preview). */
const EMAIL_PREVIEWS: Record<string, { template: string; label: string }> = {
  j18: { template: "newsletter-welcome", label: "Welkomstmail nieuwsbrief" },
};

const CAT_CONFIG: Record<Category, { label: string; color: string; bg: string }> = {
  LP:        { label: "Landingspagina", color: "#5B21B6", bg: "#EDE9FE" },
  Blog:      { label: "Blog",           color: "#065F46", bg: "#D1FAE5" },
  Lokaal:    { label: "Lokale SEO",     color: "#1E3A5F", bg: "#DBEAFE" },
  CRO:       { label: "CRO",            color: "#92400E", bg: "#FEF3C7" },
  Email:     { label: "Email",          color: "#831843", bg: "#FCE7F3" },
  Analytics: { label: "Analytics",      color: "#374151", bg: "#F3F4F6" },
  Social:    { label: "Social",         color: "#155E75", bg: "#CFFAFE" },
  Betaald:   { label: "Betaald",        color: "#7C2D12", bg: "#FFEDD5" },
};

const MONTHS: Month[] = [
  {
    id: "jun-2026",
    label: "Juni 2026",
    sublabel: "Start pre-opening",
    phase: "Pre-Opening — Fundament & Zichtbaarheid",
    tasks: [
      { id: "j1",  title: "Google Business Profile aanmaken (openingsdatum, foto's, NAP)", category: "Lokaal", priority: "kritiek", note: "Snelste gratis bron van lokale zichtbaarheid" },
      { id: "j2",  title: "Google Search Console Domain Property verifiëren + sitemap indienen", category: "Analytics", priority: "kritiek" },
      { id: "j3",  title: "GA4 sleutelgebeurtenissen markeren: generate_lead, begin_checkout, newsletter_subscribe, purchase", category: "Analytics", priority: "kritiek" },
      { id: "j4",  title: "LP #1 bouwen: /vakantiehuis-met-hottub-drenthe", category: "LP", priority: "kritiek", keyword: "vakantiehuis met hottub drenthe" },
      { id: "j5",  title: "LP #2 bouwen: /luxe-lodge-drenthe", category: "LP", priority: "kritiek", keyword: "luxe lodge drenthe" },
      { id: "j6",  title: "LP #3 bouwen: /romantisch-weekend-weg-drenthe", category: "LP", priority: "kritiek", keyword: "romantisch weekendje weg drenthe" },
      { id: "j7",  title: "LP #4 bouwen (DE): /de/ferienhaus-mit-whirlpool-drenthe", category: "LP", priority: "kritiek", keyword: "ferienhaus mit whirlpool drenthe" },
      { id: "j8",  title: "Blog 1: Vakantiehuis met privé hottub in Drenthe", category: "Blog", priority: "kritiek", keyword: "vakantiehuis met hottub drenthe" },
      { id: "j9",  title: "Blog 2: Waarom een privé hottub je weekendje weg compleet maakt", category: "Blog", priority: "kritiek", keyword: "privé hottub vakantiehuis" },
      { id: "j10", title: "Blog 3: De 10 mooiste fietspaden in Drenthe (vanuit Zeijen)", category: "Blog", priority: "hoog", keyword: "fietspaden drenthe" },
      { id: "j11", title: "Blog 4: Luxe overnachten in Drenthe — wat maakt een lodge écht luxe?", category: "Blog", priority: "hoog", keyword: "luxe lodge drenthe" },
      { id: "j12", title: "Blog 5: Romantisch weekendje weg in Drenthe — 7 ideeën", category: "Blog", priority: "kritiek", keyword: "romantisch weekend weg drenthe" },
      { id: "j13", title: "Blog 6: Wandelen vanuit je voordeur: de Veentjesroute Zeijen", category: "Blog", priority: "hoog", keyword: "wandelroute zeijen" },
      { id: "j14", title: "Blog 7: Drenthe of de Veluwe? Zo kies je het juiste natuurweekend", category: "Blog", priority: "hoog", keyword: "weekend weg drenthe" },
      { id: "j15", title: "Blog 8: Een digitale detox plannen in de Drentse natuur", category: "Blog", priority: "hoog", keyword: "digitale detox nederland" },
      { id: "j16", title: "Sticky mobiele CTA-balk implementeren ('Bekijk beschikbaarheid' + WhatsApp)", category: "CRO", priority: "kritiek", note: "Nu verdwijnt de hero-CTA bij scrollen op mobiel" },
      { id: "j17", title: "Vanaf-prijs toevoegen op lodge-kaarten op homepage", category: "CRO", priority: "kritiek", note: "Bezoekers gaan anders naar Booking.com voor de prijs" },
      { id: "j18", title: "Nieuwsbrief welkomst-email opmaken voor nieuwe aanmeldingen", category: "Email", priority: "hoog" },
    ],
  },
  {
    id: "jul-2026",
    label: "Juli 2026",
    sublabel: "Zomer, privé & romantiek",
    phase: "Pre-Opening — Zomerseizoen content",
    tasks: [
      { id: "ju1",  title: "LP #5 bouwen: /lodge-de-heide", category: "LP", priority: "kritiek", keyword: "lodge de heide drenthe" },
      { id: "ju2",  title: "LP #6 bouwen: /lodge-de-eik", category: "LP", priority: "kritiek", keyword: "lodge de eik drenthe" },
      { id: "ju3",  title: "LP #7 bouwen: /wellness-vakantie-drenthe", category: "LP", priority: "hoog", keyword: "wellness vakantie drenthe" },
      { id: "ju4",  title: "Blog 9: Fietsvakantie Drenthe — complete gids", category: "Blog", priority: "hoog", keyword: "fietsvakantie drenthe" },
      { id: "ju5",  title: "Blog 10: De Drentsche Aa — mooiste beekdallandschap van Nederland", category: "Blog", priority: "hoog", keyword: "drentsche aa" },
      { id: "ju6",  title: "Blog 11: Wellness in Drenthe — sauna's, dagspas en natuur-retreats", category: "Blog", priority: "kritiek", keyword: "wellness drenthe" },
      { id: "ju7",  title: "Blog 12: Privé lodge boeken in Nederland — wat kost het?", category: "Blog", priority: "kritiek", keyword: "privé lodge nederland" },
      { id: "ju8",  title: "Blog 13: Vakantie met hond in Drenthe", category: "Blog", priority: "hoog", keyword: "vakantiehuis drenthe hond" },
      { id: "ju9",  title: "Blog 14: Kanovaren op de Drentsche Aa", category: "Blog", priority: "midden", keyword: "kanovaren drentsche aa" },
      { id: "ju10", title: "Blog 15: E-bike huren in Drenthe — adressen en prijzen", category: "Blog", priority: "midden", keyword: "e-bike huren drenthe" },
      { id: "ju11", title: "Blog 16: Een dag in Norg — brinkdorp, bos en terrasjes", category: "Blog", priority: "hoog", keyword: "wat te doen in norg" },
      { id: "ju12", title: "Interieurphotografie lodge-Eik en lodge-Heide laten maken", category: "CRO", priority: "kritiek", note: "#1 conversie-blocker — luxe-boekers beslissen op foto's" },
      { id: "ju13", title: "VVV Drenthe aanmelden + Visit Drenthe listing aanmaken", category: "Lokaal", priority: "hoog" },
      { id: "ju14", title: "WhatsApp drijvende knop toevoegen (desktop + mobiel)", category: "CRO", priority: "hoog" },
      { id: "ju15", title: "Email 2 (nieuwsbrief serie): artikel + lodge-teaser sturen", category: "Email", priority: "hoog" },
    ],
  },
  {
    id: "aug-2026",
    label: "Augustus 2026",
    sublabel: "⚠️ Heide-seizoen — live vóór 1 aug!",
    phase: "Pre-Opening — Heide-piek (kritieke maand)",
    tasks: [
      { id: "au1",  title: "LP #8 bouwen: /heide-drenthe (LIVE VÓÓR 1 AUG)", category: "LP", priority: "kritiek", keyword: "paarse heide drenthe", note: "Zoekpiek half augustus — te laat is te laat" },
      { id: "au2",  title: "LP #9 bouwen: /vakantiehuis-assen", category: "LP", priority: "hoog", keyword: "vakantiehuis assen omgeving" },
      { id: "au3",  title: "Blog 17: Bloeiende heide Drenthe 2026 (LIVE VÓÓR 1 AUG)", category: "Blog", priority: "kritiek", keyword: "paarse heide drenthe" },
      { id: "au4",  title: "Blog 18: Het Ballooërveld — heideveld met schaapskudde bij Assen", category: "Blog", priority: "hoog", keyword: "ballooerveld" },
      { id: "au5",  title: "Blog 19: De Zeijerstrubben — het mysterieuze strubbenbos bij Zeijen", category: "Blog", priority: "hoog", keyword: "zeijerstrubben" },
      { id: "au6",  title: "Blog 20: Heide fotograferen — 7 concrete tips", category: "Blog", priority: "hoog", keyword: "heide fotograferen" },
      { id: "au7",  title: "Blog 21: Dwingelderveld — grootste natte heide van West-Europa", category: "Blog", priority: "midden", keyword: "dwingelderveld" },
      { id: "au8",  title: "Blog 22: Wandelroutes door de paarse heide (alle niveaus)", category: "Blog", priority: "hoog", keyword: "wandelen heide drenthe" },
      { id: "au9",  title: "Blog 23: Overnachten naast de heide — zo dichtbij kun je slapen", category: "Blog", priority: "hoog", keyword: "overnachten in de natuur" },
      { id: "au10", title: "Blog 24: Zomeravonden in de privé hottub onder de Drentse sterren", category: "Blog", priority: "hoog", keyword: "hottub onder de sterren" },
      { id: "au11", title: "GBP post plaatsen: 'Heide bloeit! Wij openen 1 jan 2027'", category: "Lokaal", priority: "hoog" },
      { id: "au12", title: "Tripadvisor listing aanmaken", category: "Lokaal", priority: "midden" },
      { id: "au13", title: "OG-images per blog individualiseren (nu allemaal lodge-heide.jpg)", category: "CRO", priority: "hoog", note: "Slechte social media CTR door generieke preview" },
      { id: "au14", title: "Looker Studio dashboard bouwen (GA4 + GSC koppelen)", category: "Analytics", priority: "midden" },
      { id: "au15", title: "Email 3 (nieuwsbrief): 'Heide staat in bloei — wij bijna ook' + achter-de-schermen", category: "Email", priority: "hoog" },
    ],
  },
  {
    id: "sep-2026",
    label: "September 2026",
    sublabel: "Herfst & cultuur",
    phase: "Pre-Opening — Herfstseizoen opbouw",
    tasks: [
      { id: "se1",  title: "LP #10 bouwen: /vakantiehuis-norg", category: "LP", priority: "hoog", keyword: "vakantiehuis norg" },
      { id: "se2",  title: "LP #11 bouwen: /overnachten-veenhuizen", category: "LP", priority: "hoog", keyword: "overnachten veenhuizen" },
      { id: "se3",  title: "Blog 25: Herfst in Drenthe — sept en okt zijn de mooiste maanden", category: "Blog", priority: "hoog", keyword: "herfst drenthe" },
      { id: "se4",  title: "Blog 26: Veenhuizen — van strafkolonie tot UNESCO-werelderfgoed", category: "Blog", priority: "hoog", keyword: "overnachten veenhuizen" },
      { id: "se5",  title: "Blog 27: De 52 hunebedden van Drenthe — route en geschiedenis", category: "Blog", priority: "midden", keyword: "hunebedden drenthe" },
      { id: "se6",  title: "Blog 28: Paddenstoelen spotten in de Drentse bossen", category: "Blog", priority: "midden", keyword: "paddenstoelen drenthe" },
      { id: "se7",  title: "Blog 29: Drents Museum Assen — wat moet je gezien hebben?", category: "Blog", priority: "midden", keyword: "drents museum assen" },
      { id: "se8",  title: "Blog 30: Herfstwandelingen rond Zeijen en Norg", category: "Blog", priority: "hoog", keyword: "herfstwandeling drenthe" },
      { id: "se9",  title: "Blog 31: Wellnessweekend in de herfst", category: "Blog", priority: "hoog", keyword: "wellness weekend drenthe" },
      { id: "se10", title: "Blog 32: Wat kost een luxe vakantiehuis in Drenthe? (eerlijk overzicht)", category: "Blog", priority: "hoog", keyword: "luxe vakantiehuis drenthe prijs" },
      { id: "se11", title: "ANWB listing aanmaken", category: "Lokaal", priority: "hoog" },
      { id: "se12", title: "Gastheer-foto + persoonlijke intro toevoegen op website", category: "CRO", priority: "hoog", note: "Luxe verblijven worden gekocht op persoonlijk vertrouwen" },
      { id: "se13", title: "Review-automatisering bouwen (email 14d na vertrek + Google Review link)", category: "Email", priority: "hoog", note: "Klaar voor dag 1 na opening" },
      { id: "se14", title: "Email 4 (nieuwsbrief): herfst-teaser + 'opening nadert'", category: "Email", priority: "hoog" },
      { id: "se15", title: "Eerste maandelijkse SEO-check: GSC posities + GA4 top-pagina's", category: "Analytics", priority: "hoog" },
      { id: "se16", title: "Resterende NL LP's vertalen naar DE (/vakantiehuis-assen, /vakantiehuis-norg, /overnachten-veenhuizen, /vakantiehuis-drenthe-met-hond, /bijzonder-overnachten-drenthe, /hunebedden-drenthe)", category: "LP", priority: "midden", note: "Eerst evalueren of de eerste 4 DE-pagina's (whirlpool, luxus lodge, wellness, romantisches wochenende) verkeer opleveren; /heide-drenthe (lila Heide) heeft prioriteit boven deze 6" },
    ],
  },
  {
    id: "okt-2026",
    label: "Oktober 2026",
    sublabel: "Beslissing & vergelijking",
    phase: "Pre-Opening — Vergelijkingscontent + boekingsdrempel verlagen",
    tasks: [
      { id: "ok1",  title: "LP #12 bouwen: /fietsen-in-drenthe (verkeersmagneet)", category: "LP", priority: "hoog", keyword: "fietsen in drenthe" },
      { id: "ok2",  title: "LP #13 bouwen: /wandelroutes-drenthe (verkeersmagneet)", category: "LP", priority: "hoog", keyword: "wandelroutes drenthe" },
      { id: "ok3",  title: "LP #14 bouwen: /bijzonder-overnachten-drenthe", category: "LP", priority: "hoog", keyword: "bijzonder overnachten drenthe" },
      { id: "ok4",  title: "LP #15 bouwen: /weekend-weg-drenthe", category: "LP", priority: "hoog", keyword: "weekend weg drenthe" },
      { id: "ok5",  title: "Blog 33: Bijzonder overnachten in Drenthe — 8 verblijven vergeleken", category: "Blog", priority: "kritiek", keyword: "bijzonder overnachten drenthe" },
      { id: "ok6",  title: "Blog 34: Direct boeken of via Booking.com? Dit scheelt het echt", category: "Blog", priority: "hoog", keyword: "direct boeken vakantiehuis" },
      { id: "ok7",  title: "Blog 35: Stilteregio Drenthe — de stilste plekken van Nederland", category: "Blog", priority: "hoog", keyword: "stilte nederland vakantie" },
      { id: "ok8",  title: "Blog 36: Weekend weg met vriendinnen in Drenthe", category: "Blog", priority: "midden", keyword: "weekend weg vriendinnen" },
      { id: "ok9",  title: "Blog 37: UNESCO Geopark de Hondsrug", category: "Blog", priority: "midden", keyword: "geopark hondsrug" },
      { id: "ok10", title: "Blog 38: Kamp Westerbork bezoeken — praktische gids", category: "Blog", priority: "midden", keyword: "kamp westerbork bezoeken" },
      { id: "ok11", title: "Blog 39: Mountainbiken in Drenthe — de beste MTB-routes", category: "Blog", priority: "midden", keyword: "mtb routes drenthe" },
      { id: "ok12", title: "Blog 40: Lodge de Eik vs. Lodge de Heide — welke past bij jou?", category: "Blog", priority: "hoog", keyword: "lodge drenthe boeken vergelijken" },
      { id: "ok13", title: "Reisblogger-outreach starten (uitnodiging gratis verblijf voor artikel)", category: "Lokaal", priority: "midden", note: "Doel: 1 DA30+ backlink vóór opening" },
      { id: "ok14", title: "Persericht schrijven voor RTV Drenthe / regionale media", category: "Lokaal", priority: "hoog", note: "Opening 1 jan 2027 als haak" },
      { id: "ok15", title: "Direct boeken USP zichtbaar maken bij elke CTA", category: "CRO", priority: "hoog", note: "'Geen commissie. Beste prijs. Persoonlijk bevestigd.'" },
      { id: "ok16", title: "FAQ-blok verplaatsen dichter bij boekingsformulier", category: "CRO", priority: "midden" },
      { id: "ok17", title: "Email 5 (nieuwsbrief): 'Opening over 3 maanden' + vroegboekvoordeel aankondiging", category: "Email", priority: "kritiek" },
    ],
  },
  {
    id: "nov-2026",
    label: "November 2026",
    sublabel: "Voorpret opening",
    phase: "Pre-Opening — Laatste maand voor lancering",
    tasks: [
      { id: "no1",  title: "LP #16 bouwen: /zeijerstrubben (KD=1, jij kunt #1 worden)", category: "LP", priority: "hoog", keyword: "zeijerstrubben wandelen" },
      { id: "no2",  title: "LP #17 bouwen: /ballooerveld", category: "LP", priority: "hoog", keyword: "ballooerveld schaapskudde" },
      { id: "no3",  title: "LP #18 bouwen: /vakantiehuis-drenthe-met-hond", category: "LP", priority: "midden", keyword: "vakantiehuis drenthe hond" },
      { id: "no4",  title: "Blog 41: Winter in Drenthe — overnachten in de natuur als het vriest", category: "Blog", priority: "hoog", keyword: "winter drenthe" },
      { id: "no5",  title: "Blog 42: Kerst vieren in een lodge in Drenthe", category: "Blog", priority: "hoog", keyword: "kerst weekend drenthe" },
      { id: "no6",  title: "Blog 43: Oud & nieuw weg in Drenthe — rust in plaats van vuurwerk", category: "Blog", priority: "midden", keyword: "oud en nieuw weg nederland" },
      { id: "no7",  title: "Blog 44: Sterren kijken in Drenthe — minste lichtvervuiling NL", category: "Blog", priority: "hoog", keyword: "sterrenhemel drenthe" },
      { id: "no8",  title: "Blog 45: De perfecte winterdag vanuit je lodge (uur-voor-uur)", category: "Blog", priority: "hoog", keyword: "winterweekend drenthe" },
      { id: "no9",  title: "Blog 46: Cadeau-idee: verblijf weggeven (cadeaubon)", category: "Blog", priority: "hoog", keyword: "overnachting cadeau drenthe" },
      { id: "no10", title: "Blog 47: Inpaklijst voor een winterweekend in de natuur", category: "Blog", priority: "midden", keyword: "inpaklijst weekend weg" },
      { id: "no11", title: "Blog 48: Romantisch winterweekend met privé hottub in de sneeuw", category: "Blog", priority: "kritiek", keyword: "romantisch winterweekend hottub" },
      { id: "no12", title: "Instagram + Facebook profiel volledig inrichten (12 startfoto's)", category: "Social", priority: "hoog", note: "Lodge + natuur + sfeer + eigenaar" },
      { id: "no13", title: "Zoover + Vakantiebeoordeling listing aanmaken", category: "Lokaal", priority: "midden" },
      { id: "no14", title: "Email 6: 'Opening over 6 weken' + vroegboekvoordeel activeren voor lijst", category: "Email", priority: "kritiek" },
      { id: "no15", title: "Bron-images comprimeren: lodge-eik.jpg en lodge-heide.jpg naar <400 KB", category: "CRO", priority: "hoog", note: "Nu 3,3–3,5 MB — vertraagt laadtijd op mobiel" },
      { id: "no16", title: "Persericht sturen naar RTV Drenthe, regionale kranten, reisbloggers", category: "Lokaal", priority: "hoog" },
      { id: "no17", title: "aggregateRating in schema klaarzetten (activeer zodra 5+ echte reviews)", category: "Analytics", priority: "midden" },
    ],
  },
  {
    id: "dec-2026",
    label: "December 2026",
    sublabel: "🎉 Opening 1 januari 2027",
    phase: "Opening — Lancering & eerste gasten",
    tasks: [
      { id: "de1",  title: "Opening-blog live: 'Huis ter Huynen opent — dit kun je verwachten'", category: "Blog", priority: "kritiek", keyword: "boutique lodge drenthe" },
      { id: "de2",  title: "Blog 50: Een kijkje in Lodge de Heide", category: "Blog", priority: "kritiek", keyword: "lodge de heide drenthe" },
      { id: "de3",  title: "Blog 51: Een kijkje in Lodge de Eik", category: "Blog", priority: "kritiek", keyword: "lodge de eik drenthe" },
      { id: "de4",  title: "Blog 52: Zo werkt direct boeken bij Huis ter Huynen", category: "Blog", priority: "hoog", keyword: "direct boeken zonder booking.com" },
      { id: "de5",  title: "Blog 53: Onze 5 favoriete plekken in de omgeving van Zeijen", category: "Blog", priority: "hoog", keyword: "omgeving zeijen" },
      { id: "de6",  title: "Blog 54: Duurzaam op vakantie — EV-laden en natuur bij de lodge", category: "Blog", priority: "midden", keyword: "duurzaam vakantiehuis drenthe" },
      { id: "de7",  title: "Blog 55: Vroegboekvoordeel 2027 — wat het je oplevert", category: "Blog", priority: "hoog", keyword: "vroegboekkorting drenthe" },
      { id: "de8",  title: "Blog 56: Veelgestelde vragen over je verblijf — eerlijk beantwoord", category: "Blog", priority: "hoog", keyword: "vakantiehuis drenthe faq" },
      { id: "de9",  title: "LP #19 bouwen: /directe-boeking (geen-OTA USP-pagina)", category: "LP", priority: "hoog", keyword: "direct boeken voordeel" },
      { id: "de10", title: "GBP: openingstijden activeren, eerste foto's + openingsbericht", category: "Lokaal", priority: "kritiek" },
      { id: "de11", title: "Email opening: 'We zijn open!' sturen naar volledige aanmeldlijst", category: "Email", priority: "kritiek" },
      { id: "de12", title: "Eerste gasten vragen om review (dag 3 van verblijf of bij checkout)", category: "Lokaal", priority: "kritiek" },
      { id: "de13", title: "Review-automatisering activeren (email 14d na vertrek)", category: "Email", priority: "kritiek" },
      { id: "de14", title: "Sitemap bijwerken met alle live landingspagina's", category: "Analytics", priority: "hoog" },
      { id: "de15", title: "Instagram: dagelijkse Stories week 1 (opening-countdown en eerste gasten)", category: "Social", priority: "hoog" },
    ],
  },
  {
    id: "jan-2027",
    label: "Januari 2027",
    sublabel: "Laagseizoen vullen + retentie",
    phase: "Post-Opening — Consolidatie",
    tasks: [
      { id: "ja1",  title: "LP #20 bouwen (DE): /de/luxus-lodge-drenthe", category: "LP", priority: "hoog", keyword: "luxus lodge drenthe" },
      { id: "ja2",  title: "Blog 57: Januari in Drenthe — waarom de stilte nu het mooist is", category: "Blog", priority: "hoog", keyword: "januari weekend weg" },
      { id: "ja3",  title: "Blog 58: Nieuwjaarsvoornemen: vaker de natuur in", category: "Blog", priority: "midden", keyword: "natuur weekend nederland" },
      { id: "ja4",  title: "Blog 59: De beste winterwandelingen rond de Drentsche Aa", category: "Blog", priority: "hoog", keyword: "winterwandeling drentsche aa" },
      { id: "ja5",  title: "Blog 60: Wat eet en drink je lokaal in Drenthe — streekproducten", category: "Blog", priority: "midden", keyword: "streekproducten drenthe" },
      { id: "ja6",  title: "Blog 61: Workation in Drenthe — werken vanuit een lodge", category: "Blog", priority: "midden", keyword: "workation nederland" },
      { id: "ja7",  title: "Blog 62: Hoe wij de privé hottub het hele jaar warm houden", category: "Blog", priority: "hoog", keyword: "privé hottub" },
      { id: "ja8",  title: "Blog 63: Verjaardag vieren in een vakantiehuis met privé hottub", category: "Blog", priority: "hoog", keyword: "verjaardag weekend weg" },
      { id: "ja9",  title: "Blog 64: De geschiedenis van Zeijen als brinkdorp", category: "Blog", priority: "midden", keyword: "zeijen" },
      { id: "ja10", title: "Retentie-email sturen naar eerste gasten (herboek-aanbieding)", category: "Email", priority: "hoog" },
      { id: "ja11", title: "Eerste SEO-audit: welke LP's ranken? Top-3 verdiepen.", category: "Analytics", priority: "kritiek", note: "6 weken na live = eerste data zichtbaar in GSC" },
      { id: "ja12", title: "Google Ads A/B test starten (klein budget €5–10/dag op hottub-keyword)", category: "Betaald", priority: "midden", note: "Alleen starten als organisch bewijs beschikbaar is" },
      { id: "ja13", title: "Eerste kwartaalbrief versturen (lente-aankondiging)", category: "Email", priority: "hoog" },
      { id: "ja14", title: "Zoover + Tripadvisor: reageer op alle reviews (ook als er 0 zijn)", category: "Lokaal", priority: "hoog" },
    ],
  },
  {
    id: "feb-2027",
    label: "Februari 2027",
    sublabel: "Valentijn + voorjaar",
    phase: "Post-Opening — Seizoenspieken benutten",
    tasks: [
      { id: "fe1",  title: "Blog 65: Valentijn in Drenthe — romantisch weekend met privé hottub (LIVE VÓÓR 1 FEB)", category: "Blog", priority: "kritiek", keyword: "valentijn weekend weg", note: "Zoekpiek is eind januari — te laat is te laat" },
      { id: "fe2",  title: "Blog 66: Het ultieme romantische arrangement zelf samenstellen", category: "Blog", priority: "hoog", keyword: "romantisch arrangement drenthe" },
      { id: "fe3",  title: "Blog 67: Voorjaar in Drenthe — wanneer ontwaakt de natuur?", category: "Blog", priority: "hoog", keyword: "voorjaar drenthe" },
      { id: "fe4",  title: "Blog 68: Vogels spotten langs de Drentsche Aa", category: "Blog", priority: "midden", keyword: "vogels kijken drenthe" },
      { id: "fe5",  title: "Blog 69: Wellnessarrangement — sauna + hottub + massage in de buurt", category: "Blog", priority: "hoog", keyword: "wellnessarrangement drenthe" },
      { id: "fe6",  title: "Blog 70: Een weekend zonder telefoon — zo doe je het echt", category: "Blog", priority: "hoog", keyword: "digitale detox weekend" },
      { id: "fe7",  title: "Blog 71: Vakantiehuis voor 2 personen in Drenthe", category: "Blog", priority: "hoog", keyword: "vakantiehuis 2 personen drenthe" },
      { id: "fe8",  title: "Blog 72: De mooiste zonsondergangen op de Drentse heide", category: "Blog", priority: "midden", keyword: "zonsondergang heide drenthe" },
      { id: "fe9",  title: "Email Valentijn-campagne: aanbod voor lopende nieuwsbrieflijst", category: "Email", priority: "kritiek" },
      { id: "fe10", title: "aggregateRating in schema activeren (als 5+ echte reviews beschikbaar)", category: "Analytics", priority: "hoog" },
      { id: "fe11", title: "LP (DE) #21: /de/wellness-urlaub-drenthe", category: "LP", priority: "midden", keyword: "wellnessurlaub drenthe niederlande" },
    ],
  },
  {
    id: "mrt-2027",
    label: "Maart 2027",
    sublabel: "Fiets- & wandelseizoen",
    phase: "Post-Opening — Lente aanloop",
    tasks: [
      { id: "mr1",  title: "Blog 73: Fietsen in Drenthe — complete knooppuntengids 2027", category: "Blog", priority: "kritiek", keyword: "fietsen in drenthe" },
      { id: "mr2",  title: "Blog 74: Wandelroutes Drenthe — 15 routes vergeleken", category: "Blog", priority: "kritiek", keyword: "wandelroutes drenthe" },
      { id: "mr3",  title: "Blog 75: Met kinderen op pad in Drenthe — 8 leuke tochten", category: "Blog", priority: "hoog", keyword: "kinderen drenthe activiteiten" },
      { id: "mr4",  title: "Blog 76: Hondsrug fietsroute — 45 km over de stuwwal", category: "Blog", priority: "hoog", keyword: "hondsrug fietsroute" },
      { id: "mr5",  title: "Blog 77: Lente op de heide — van kaal naar eerste kleur", category: "Blog", priority: "hoog", keyword: "heide drenthe lente" },
      { id: "mr6",  title: "Blog 78: Picknickplekken in de Drentse natuur (met GPS-pins)", category: "Blog", priority: "midden", keyword: "picknick drenthe" },
      { id: "mr7",  title: "Blog 79: Vakantiehuis met sauna in Drenthe", category: "Blog", priority: "hoog", keyword: "vakantiehuis met sauna drenthe" },
      { id: "mr8",  title: "Blog 80: Een lang weekend Drenthe — 3-dagenroute", category: "Blog", priority: "hoog", keyword: "lang weekend drenthe" },
      { id: "mr9",  title: "Instagram Reels: heide-omgeving in voorjaar (3 Reels)", category: "Social", priority: "midden" },
      { id: "mr10", title: "Lente kwartaalbrief sturen: zomerboekingen activeren", category: "Email", priority: "hoog" },
      { id: "mr11", title: "SEO-check: welke artikelen converteren? Optimaliseer top-3 CTA's", category: "Analytics", priority: "hoog" },
      { id: "mr12", title: "Google Ads review: CPA en ROAS in orde? Budget aanpassen", category: "Betaald", priority: "midden" },
    ],
  },
  {
    id: "apr-2027",
    label: "April 2027",
    sublabel: "Pasen, meivakantie & TT",
    phase: "Post-Opening — Druk voorseizoen",
    tasks: [
      { id: "ap1",  title: "Blog 81: Paasweekend in Drenthe — 5 originele ideeën (LIVE VÓÓR PASEN)", category: "Blog", priority: "hoog", keyword: "paasweekend drenthe" },
      { id: "ap2",  title: "Blog 82: Meivakantie in Drenthe met het gezin", category: "Blog", priority: "hoog", keyword: "meivakantie drenthe" },
      { id: "ap3",  title: "Blog 83: TT Assen 2027 — overnachten tijdens het MotoGP-weekend", category: "Blog", priority: "hoog", keyword: "overnachten tt assen" },
      { id: "ap4",  title: "Blog 84: Bloesem en lammetjes — lente-activiteiten in Drenthe", category: "Blog", priority: "midden", keyword: "lente drenthe activiteiten" },
      { id: "ap5",  title: "Blog 85: De mooiste terrassen rond Zeijen en Norg", category: "Blog", priority: "midden", keyword: "terras drenthe" },
      { id: "ap6",  title: "Blog 86: Fietsen langs de hunebedden — Hunebedenroute compleet", category: "Blog", priority: "midden", keyword: "hunebedenroute fietsen" },
      { id: "ap7",  title: "Blog 87: Vakantiehuis Assen — waarom Zeijen de slimste keuze is", category: "Blog", priority: "hoog", keyword: "vakantiehuis assen" },
      { id: "ap8",  title: "Blog 88: Een midweek weg in Drenthe — rustiger én voordeliger", category: "Blog", priority: "midden", keyword: "midweek drenthe" },
      { id: "ap9",  title: "Zomer-email campagne: 'Heide bloeit al snel — boek je zomerweekend'", category: "Email", priority: "hoog" },
      { id: "ap10", title: "Capaciteitscheck: zijn de zomermaanden voldoende gevuld?", category: "Analytics", priority: "hoog" },
    ],
  },
  {
    id: "mei-2027",
    label: "Mei 2027",
    sublabel: "Evergreen update + zomeraanloop",
    phase: "Post-Opening — Zomerpiek en SEO-consolidatie",
    tasks: [
      { id: "me1",  title: "Evergreen update: 'Bloeiende heide Drenthe 2027' (jaarlijkse herziening)", category: "Blog", priority: "kritiek", keyword: "paarse heide drenthe", note: "Datum + info bijwerken vóór aug piek" },
      { id: "me2",  title: "Blog 82: Zomervakantie in Drenthe 2027 — complete planningsgids", category: "Blog", priority: "hoog", keyword: "zomervakantie drenthe" },
      { id: "me3",  title: "Blog 83: Drenthe bij slecht weer — 10 leuke uitjes", category: "Blog", priority: "midden", keyword: "drenthe slecht weer" },
      { id: "me4",  title: "Blog 84: Wandelen in het Dwingelderveld", category: "Blog", priority: "midden", keyword: "wandelen dwingelderveld" },
      { id: "me5",  title: "Blog 85: Vakantiehuis Norg — natuur, bos en rust", category: "Blog", priority: "hoog", keyword: "vakantiehuis norg" },
      { id: "me6",  title: "Blog 86: Romantisch verblijf plannen — checklist voor koppels", category: "Blog", priority: "hoog", keyword: "romantisch weekend checklist" },
      { id: "me7",  title: "6-maanden SEO-audit: top-10 rankende artikelen analyseren en verdiepen", category: "Analytics", priority: "kritiek", note: "Meest impactvolle maandelijkse taak na 6 maanden live" },
      { id: "me8",  title: "Top-3 converterende LP's: CTA + copy optimaliseren op basis van data", category: "CRO", priority: "kritiek" },
      { id: "me9",  title: "Zomer kwartaalbrief: heidebloei preview + resterende beschikbaarheid", category: "Email", priority: "hoog" },
      { id: "me10", title: "Betaalde campagne evalueren: ROAS ≥ 3? Doorrijden. Minder? Pauzeren.", category: "Betaald", priority: "hoog" },
    ],
  },
];

const STORAGE_KEY = "hth_marketing_done_v1";

function loadDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveDone(done: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
  } catch {}
}

export function MarketingTab() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<Category | "alle">("alle");
  const [filterPrio, setFilterPrio] = useState<Priority | "alle">("alle");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [previewTask, setPreviewTask] = useState<string | null>(null);

  useEffect(() => {
    setDone(loadDone());
    // Open de huidige kalendermaand standaard
    const now = new Date();
    const monthMap: Record<string, string> = {
      "2026-6": "jun-2026", "2026-7": "jul-2026", "2026-8": "aug-2026",
      "2026-9": "sep-2026", "2026-10": "okt-2026", "2026-11": "nov-2026",
      "2026-12": "dec-2026", "2027-1": "jan-2027", "2027-2": "feb-2027",
      "2027-3": "mrt-2027", "2027-4": "apr-2027", "2027-5": "mei-2027",
    };
    const key = `${now.getFullYear()}-${now.getMonth() + 1}`;
    setActiveMonth(monthMap[key] ?? "jun-2026");
  }, []);

  const toggle = useCallback((id: string) => {
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      saveDone(next);
      return next;
    });
  }, []);

  const totalTasks = MONTHS.reduce((s, m) => s + m.tasks.length, 0);
  const doneTasks = MONTHS.reduce((s, m) => s + m.tasks.filter(t => done.has(t.id)).length, 0);
  const pct = Math.round((doneTasks / totalTasks) * 100);

  const activeM = MONTHS.find(m => m.id === activeMonth);

  const filteredTasks = (activeM?.tasks ?? []).filter(t => {
    if (filterCat !== "alle" && t.category !== filterCat) return false;
    if (filterPrio !== "alle" && t.priority !== filterPrio) return false;
    if (showOnlyOpen && done.has(t.id)) return false;
    return true;
  });

  const monthDone = (m: Month) => m.tasks.filter(t => done.has(t.id)).length;
  const monthPct = (m: Month) => Math.round((monthDone(m) / m.tasks.length) * 100);

  const btn: React.CSSProperties = {
    padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
    fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all 0.1s",
    fontFamily: "inherit",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Marketing Dashboard
        </h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
          SEO · Content · CRO · Lokale SEO · Email — juni 2026 t/m mei 2027
        </p>

        {/* Totale voortgang */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Totale voortgang</span>
            <span style={{ fontSize: 13, color: C.muted }}>{doneTasks} / {totalTasks} taken afgerond</span>
          </div>
          <div style={{ height: 10, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: 99,
              background: pct >= 80 ? "#2F4F3E" : pct >= 40 ? "#B49A5E" : "#3B82F6",
              transition: "width 0.4s ease",
            }} />
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{pct}% compleet</div>
        </div>
      </div>

      {/* Maand-navigator */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Selecteer maand
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MONTHS.map(m => {
            const mp = monthPct(m);
            const isActive = m.id === activeMonth;
            const md = monthDone(m);
            return (
              <button
                key={m.id}
                onClick={() => setActiveMonth(m.id)}
                style={{
                  ...btn,
                  background: isActive ? C.green : C.card,
                  color: isActive ? "#fff" : C.text,
                  border: isActive ? `1px solid ${C.green}` : `1px solid ${C.border}`,
                  position: "relative",
                  paddingBottom: 18,
                  minWidth: 110,
                  textAlign: "left",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 12 }}>{m.label}</div>
                <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{md}/{m.tasks.length} klaar</div>
                {/* Mini progress bar */}
                <div style={{
                  position: "absolute", bottom: 6, left: 8, right: 8,
                  height: 3, background: isActive ? "rgba(255,255,255,0.3)" : "#E5E7EB", borderRadius: 99,
                }}>
                  <div style={{
                    height: "100%", width: `${mp}%`, borderRadius: 99,
                    background: isActive ? "#fff" : (mp >= 80 ? "#2F4F3E" : mp >= 40 ? "#B49A5E" : "#3B82F6"),
                  }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Maand-detail */}
      {activeM && (
        <div>
          {/* Maand-header */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.text }}>{activeM.label}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{activeM.phase}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{monthPct(activeM)}%</div>
                <div style={{ fontSize: 11, color: C.muted }}>{monthDone(activeM)} / {activeM.tasks.length} klaar</div>
              </div>
            </div>
            <div style={{ marginTop: 10, height: 6, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${monthPct(activeM)}%`, borderRadius: 99,
                background: monthPct(activeM) >= 80 ? C.green : monthPct(activeM) >= 40 ? C.gold : "#3B82F6",
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Filter:</span>

            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value as Category | "alle")}
              style={{ ...btn, padding: "5px 10px", background: C.card, color: C.text }}
            >
              <option value="alle">Alle categorieën</option>
              {(Object.keys(CAT_CONFIG) as Category[]).map(c => (
                <option key={c} value={c}>{CAT_CONFIG[c].label}</option>
              ))}
            </select>

            <select
              value={filterPrio}
              onChange={e => setFilterPrio(e.target.value as Priority | "alle")}
              style={{ ...btn, padding: "5px 10px", background: C.card, color: C.text }}
            >
              <option value="alle">Alle prioriteiten</option>
              {(["kritiek", "hoog", "midden", "laag"] as Priority[]).map(p => (
                <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowOnlyOpen(v => !v)}
              style={{ ...btn, background: showOnlyOpen ? C.green : C.card, color: showOnlyOpen ? "#fff" : C.text }}
            >
              {showOnlyOpen ? "✓ Alleen open" : "Alleen open"}
            </button>

            <span style={{ fontSize: 11, color: C.muted, marginLeft: "auto" }}>
              {filteredTasks.length} {filteredTasks.length === 1 ? "taak" : "taken"} zichtbaar
            </span>
          </div>

          {/* Taaklijst */}
          {filteredTasks.length === 0 ? (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Alle taken afgevinkt!</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                {showOnlyOpen ? "Geen openstaande taken meer voor deze filter." : "Geen taken gevonden met huidige filters."}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredTasks.map(task => {
                const isDone = done.has(task.id);
                const pConf = PRIORITY_CONFIG[task.priority];
                const cConf = CAT_CONFIG[task.category];
                return (
                  <div
                    key={task.id}
                    onClick={() => toggle(task.id)}
                    style={{
                      background: isDone ? "#F9FAFB" : C.card,
                      border: `1px solid ${isDone ? "#E5E7EB" : C.border}`,
                      borderRadius: 10,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                      opacity: isDone ? 0.6 : 1,
                      transition: "all 0.15s",
                      userSelect: "none",
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: isDone ? "none" : `2px solid ${C.border}`,
                      background: isDone ? C.green : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: 1,
                      transition: "all 0.15s",
                    }}>
                      {isDone && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: isDone ? 400 : 600, color: isDone ? C.muted : C.text,
                        textDecoration: isDone ? "line-through" : "none", lineHeight: 1.4,
                        marginBottom: 4,
                      }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                        {/* Categorie badge */}
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5,
                          background: cConf.bg, color: cConf.color,
                        }}>
                          {cConf.label}
                        </span>
                        {/* Prioriteit dot + label */}
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: pConf.dot, display: "inline-block" }} />
                          <span style={{ fontSize: 10, color: C.muted }}>{pConf.label}</span>
                        </span>
                        {/* Keyword */}
                        {task.keyword && (
                          <span style={{ fontSize: 10, color: C.light, fontStyle: "italic" }}>
                            🔑 {task.keyword}
                          </span>
                        )}
                      </div>
                      {/* Note */}
                      {task.note && (
                        <div style={{
                          fontSize: 11, color: C.muted, marginTop: 5, paddingLeft: 8,
                          borderLeft: `2px solid ${C.border}`, lineHeight: 1.4,
                        }}>
                          {task.note}
                        </div>
                      )}
                      {/* E-mailtemplate preview */}
                      {EMAIL_PREVIEWS[task.id] && (
                        <div style={{ marginTop: 8 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTask(prev => prev === task.id ? null : task.id);
                            }}
                            style={{
                              fontSize: 11, fontWeight: 600, color: C.green,
                              background: "#fff", border: `1px solid ${C.border}`,
                              borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            {previewTask === task.id ? "Verberg template" : `Bekijk template: ${EMAIL_PREVIEWS[task.id].label}`}
                          </button>
                          {previewTask === task.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{ marginTop: 10, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", background: "#EAE3D2" }}
                            >
                              <iframe
                                src={`/api/admin/email-preview?template=${EMAIL_PREVIEWS[task.id].template}`}
                                title={EMAIL_PREVIEWS[task.id].label}
                                style={{ width: "100%", height: 640, border: "none", display: "block" }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bulk-acties */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={() => {
                const next = new Set(done);
                filteredTasks.forEach(t => next.add(t.id));
                setDone(next); saveDone(next);
              }}
              style={{ ...btn, background: C.card, color: C.text, fontSize: 12 }}
            >
              Alles afvinken (zichtbaar)
            </button>
            <button
              onClick={() => {
                const next = new Set(done);
                filteredTasks.forEach(t => next.delete(t.id));
                setDone(next); saveDone(next);
              }}
              style={{ ...btn, background: C.card, color: C.muted, fontSize: 12 }}
            >
              Selectie herstellen
            </button>
          </div>
        </div>
      )}

      {/* Legenda */}
      <div style={{
        marginTop: 32, padding: "16px 20px", background: C.card,
        border: `1px solid ${C.border}`, borderRadius: 12,
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          Legenda
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Prioriteit</div>
            {(["kritiek", "hoog", "midden", "laag"] as Priority[]).map(p => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_CONFIG[p].dot, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: C.text }}>{PRIORITY_CONFIG[p].label}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Categorie</div>
            {(Object.keys(CAT_CONFIG) as Category[]).map(c => (
              <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, padding: "1px 6px", borderRadius: 4,
                  background: CAT_CONFIG[c].bg, color: CAT_CONFIG[c].color, fontWeight: 600,
                }}>
                  {CAT_CONFIG[c].label}
                </span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Tips</div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
              • Klik op een taak om hem af te vinken<br />
              • Status wordt lokaal opgeslagen (blijft staan na vernieuwen)<br />
              • Filter op categorie of prioriteit voor focus<br />
              • "Alleen open" toont uitsluitend niet-afgevinkte taken<br />
              • Voortgangsbalk per maand en totaal is realtime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

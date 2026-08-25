"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  green: "#2F4F3E", gold: "#B49A5E",
};

type Priority = "kritiek" | "hoog" | "midden" | "laag";
type Category = "LP" | "Blog" | "Lokaal" | "CRO" | "Email" | "Analytics" | "Social" | "Betaald" | "Techniek" | "Revenue";

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
  Techniek:  { label: "Techniek",       color: "#3730A3", bg: "#E0E7FF" },
  Revenue:   { label: "Revenue",        color: "#134E4A", bg: "#CCFBF1" },
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
      { id: "ju12", title: "Fotograaf selecteren en shootbrief opstellen (shoot zelf: februari 2027)", category: "CRO", priority: "hoog", note: "De shoot is verplaatst naar Q1 2027: vóór de oplevering valt er geen interieur te fotograferen. Dit is het voorwerk — fotograaf vastleggen, shotlist en stylingbudget bepalen, zodat februari alleen nog uitvoeren is." },
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
    sublabel: "Fundament: meten, repareren, herbouwen",
    phase: "Pre-opening",
    tasks: [
      { id: "s26-1",  title: "Google Business Profile verifiëren of aanmaken", category: "Lokaal", priority: "kritiek", note: "Hoogste ROI-actie van het hele plan als er nog geen geverifieerd profiel is. De merkcluster staat op gemiddeld positie 15,3 — Google heeft 'Huis ter Huynen' nog niet als entiteit vastgelegd." },
      { id: "s26-2",  title: "GSC opnieuw exporteren mét zichtbaar datumbereik", category: "Analytics", priority: "kritiek", note: "De meetperiode van de huidige export is onbekend. Zonder die periode klopt de forecast met een factor 3 niet." },
      { id: "s26-3",  title: "GA4 verifiëren of installeren + sleutelgebeurtenissen markeren", category: "Analytics", priority: "kritiek", note: "De volledige CRO-kolom van het dashboard is nu onmeetbaar: geen zicht op sessies, CTA-kliks of formulierstarts." },
      { id: "s26-4",  title: "Sticky mobiele CTA: 'Claim uw datum' → 'Bekijk beschikbaarheid'", category: "CRO", priority: "kritiek", note: "Op mobiel is dit de eerste CTA die de bezoeker ziet, vaak vóór enige uitleg. Een zware CTA vóór een zware volgende stap (aanvraag zonder prijs) is een dubbele drempel." },
      { id: "s26-6",  title: "301: blog privé-hottub → /vakantiehuis-met-hottub-drenthe", category: "Techniek", priority: "kritiek", note: "Kannibalisatie: blog 53 vertoningen op positie 60,9 tegen landingspagina 914 op 49,1. Zelfde intentie, zelfde zoekwoord. Beste alinea's eerst overzetten." },
      { id: "s26-7",  title: "301: /blog/wellness-in-drenthe → /wellness-vakantie-drenthe", category: "Techniek", priority: "kritiek", note: "Kannibalisatie: 7 vertoningen op positie 63,7 tegen 1.526 op 62,6." },
      { id: "s26-8",  title: "301: /wandelen-drentsche-aa → /wandelroutes-drenthe", category: "Techniek", priority: "hoog", note: "Twee landingspagina's voor één intentie. Drentsche Aa-inhoud als eigen H2 meenemen." },
      { id: "s26-9",  title: "301: fietsslug van 250+ tekens → /blog/fietsen-in-drenthe", category: "Techniek", priority: "hoog", note: "De huidige URL is een volledige alinea. Wordt afgekapt in de SERP en oogt als spam. 28 vertoningen, positie 30,1." },
      { id: "s26-10", title: "'Jacuzzi' toevoegen aan title, H1, intro en FAQ van /vakantiehuis-met-hottub-drenthe", category: "LP", priority: "kritiek", keyword: "huisje met jacuzzi drenthe", note: "Jacuzzi-zoekopdrachten: 754 vertoningen. Hottub: 249. De site zegt overal 'hottub'. URL laten staan — die 914 vertoningen aan history zijn meer waard dan een keyword in het pad." },
      { id: "s26-11", title: "Homepage-title en meta description vervangen", category: "LP", priority: "kritiek", keyword: "huis ter huynen", note: "Nu: 'Lodge Drenthe | Vakantiewoning met Hottub bij Assen'. 'Lodge' heeft 27 vertoningen in de hele dataset. Nieuw: merknaam voorop plus 'twee lodges' als differentiator." },
      { id: "s26-12", title: "/wellness-vakantie-drenthe herbouwen, retarget naar 'wellness huisje'", category: "LP", priority: "kritiek", keyword: "wellness huisje drenthe", note: "1.526 vertoningen, positie 62,6, nul klikken. Grootste pagina van de site, slechtste positie. 'Wellness huisje' (128 vertoningen) komt in de huidige title niet voor." },
      { id: "s26-13", title: "/romantisch-weekend-weg-drenthe herbouwen en focus verscherpen", category: "LP", priority: "kritiek", keyword: "romantisch weekendje weg drenthe", note: "Hoofdterm staat op 26,4 — de enige commerciële term met volume binnen bereik van pagina 1. Pagina staat gemiddeld op 50,1: te breed, rankt op tientallen irrelevante termen." },
      { id: "s26-14", title: "Offer-schema met vanafprijs €165 toevoegen aan LodgingBusiness", category: "Techniek", priority: "hoog", note: "Nu staat er alleen priceRange '€€€'. De echte prijs staat wel in de tekst maar niet machineleesbaar — blokkeert prijs-rich-results." },
      { id: "s26-15", title: "noindex op /impressum, /datenschutz, /agb, /privacy, /terms, /welkom", category: "Techniek", priority: "midden", note: "Rechtspagina's worden geïndexeerd en staan in de sitemap. /welkom is een gastpagina met priority 0,4." },
      { id: "s26-16", title: "Blog: 'Wat kost een privé-lodge met jacuzzi in Nederland?' uitbreiden", category: "Blog", priority: "hoog", keyword: "privé lodge nederland kosten", note: "Staat al op positie 6,4 op een prijszoekopdracht — late funnel, sterkste conversiesignaal van de site. Verdient de sterkste CTA van alle blogs." },
      { id: "s26-17", title: "Blog: 'Wellnessweekend in Drenthe — hoe ziet zo'n weekend eruit?'", category: "Blog", priority: "hoog", keyword: "wellness weekend drenthe" },
      { id: "s26-18", title: "Blog: 'Herfst op de Drentse heide — de mooiste wandelingen in oktober'", category: "Blog", priority: "midden", keyword: "wandelen drenthe herfst" },
    ],
  },
  {
    id: "okt-2026",
    label: "Oktober 2026",
    sublabel: "Interne autoriteit & lodgepagina's",
    phase: "Pre-opening",
    tasks: [
      { id: "o26-1",  title: "Interne linkmatrix doorvoeren: 11 links vanuit de best rankende pagina's", category: "Techniek", priority: "kritiek", note: "/hunebedden-drenthe (568 vertoningen, positie 13), /heide-drenthe (261, positie 9,7) en de blogs op positie 8–10 zijn de enige pagina's die Google waardeert. Ze geven die autoriteit nu alleen generiek door." },
      { id: "o26-2",  title: "Footerblok terugbrengen van 13 naar 6 links, per paginatype verschillend", category: "Techniek", priority: "hoog", note: "Elke pagina linkt nu naar bijna elke andere. Daardoor springt geen enkele pagina eruit — dat verklaart mede de gelijkmatige positie-49-verdeling." },
      { id: "o26-3",  title: "Contextuele CTA-parameters: /#reserveren?van=wellness&lodge=heide", category: "CRO", priority: "kritiek", note: "Elke landingspagina-CTA springt nu naar een generieke homepage-sectie. De bezoeker verliest zijn context én de complete opbouw van de pagina." },
      { id: "o26-4",  title: "Blogs: inline CTA halverwege + sticky CTA toevoegen", category: "CRO", priority: "hoog", note: "Blogs halen CTR 3,31% tegen 0,25% voor de commerciële pagina's. Ze zijn het best presterende kanaal en linken nu nauwelijks door." },
      { id: "o26-5",  title: "/lodge-de-heide bouwen", category: "LP", priority: "kritiek", keyword: "huisje met sauna en jacuzzi drenthe", note: "Er is nu geen enkele stap waarin de bezoeker een lodge kiest — terwijl kiezen precies de stap is die twijfel omzet in commitment. Onderscheid: sauna en panoramisch uitzicht." },
      { id: "o26-6",  title: "/lodge-de-eik bouwen", category: "LP", priority: "kritiek", keyword: "vakantiehuisje jacuzzi zeijen", note: "Écht anders schrijven dan De Heide: buitenkeuken en BBQ zijn hier het onderscheid. Twee bijna identieke lodgepagina's zijn precies het kannibalisatieprobleem dat de site al heeft." },
      { id: "o26-7",  title: "Lodgekeuzeblok na de FAQ op de drie P0-landingspagina's", category: "CRO", priority: "hoog" },
      { id: "o26-8",  title: "Boekingsflow: lodge voorselecteren via parameter", category: "CRO", priority: "hoog" },
      { id: "o26-9",  title: "Blog: 'Jacuzzi in de winter — waarom december de mooiste maand is'", category: "Blog", priority: "hoog", keyword: "hottub winter" },
      { id: "o26-10", title: "Blog: 'Romantisch weekendje weg — 8 plekken in Drenthe voor stellen'", category: "Blog", priority: "hoog", keyword: "romantisch overnachten drenthe" },
      { id: "o26-11", title: "/luxe-lodge-drenthe retargeten naar 'luxe vakantiehuis'", category: "LP", priority: "midden", keyword: "luxe vakantiehuis drenthe met jacuzzi", note: "593 vertoningen op positie 49,2. Let op de val: de twee grootste termen in deze cluster bevatten 'hotel' — daar niet op optimaliseren, Huis ter Huynen is geen hotel." },
      { id: "o26-12", title: "Maandrapportage inrichten: GSC + GA4 in één overzicht", category: "Analytics", priority: "midden" },
    ],
  },
  {
    id: "nov-2026",
    label: "November 2026",
    sublabel: "Prijstransparantie & lokale zichtbaarheid",
    phase: "Pre-opening",
    tasks: [
      { id: "n26-1",  title: "Indicatieve totaalprijs tonen zodra data en lodge gekozen zijn", category: "CRO", priority: "kritiek", note: "'Op aanvraag' is waarschijnlijk het duurste woord op de website. Het aanvraagmodel mag blijven — de prijs mag alleen niet meer achter het formulier verstopt zitten." },
      { id: "n26-2",  title: "Reactietijd naar < 2 uur en dat ook communiceren", category: "CRO", priority: "kritiek", note: "Nu 'binnen 24 uur'. Een aanvrager die 24 uur wacht, heeft vaak al elders geboekt. Geen websitewijziging, wel vermoedelijk de hoogste omzetimpact per bestede euro." },
      { id: "n26-3",  title: "CTR-titles voor de drie échte CTR-problemen", category: "LP", priority: "hoog", note: "/blog/kanovaren-drentsche-aa (93 vertoningen, positie 9,8, nul klikken), /blog/een-dag-in-norg (41, 9,4, nul) en /de/ferienhaus-mit-whirlpool-drenthe (15, 9,5, nul). Dit zijn de enige pagina's waar de snippet het probleem is en niet de positie." },
      { id: "n26-4",  title: "/vakantiehuis-assen versterken + TT-week toevoegen", category: "LP", priority: "hoog", keyword: "vakantiehuis assen", note: "Beste commerciële positie van de site (23,4) en hoogste winbaarheid (0,80). Wat ontbreekt is interne autoriteit, niet tekst. De TT-week is de grootste vraagpiek van de regio en staat nergens op de site." },
      { id: "n26-5",  title: "/overnachten-veenhuizen toespitsen op overnachten, niet op hotels", category: "LP", priority: "hoog", keyword: "overnachten in veenhuizen", note: "De enige echte quick win: query staat op 15,2, pagina gemiddeld op 33,3. De pagina wordt ook getoond op 65 vertoningen hotelintentie die nooit gewonnen worden." },
      { id: "n26-6",  title: "Aanmelden bij de listicles die de SERP's bezetten", category: "Lokaal", priority: "kritiek", note: "origineelovernachten.nl, bijzonderplekje.nl, naturescanner.nl, luxevakantieplekjes.nl, drenthe.nl. Vijf van de zes commerciële SERP's bestaan voor 60–100% uit portals — die win je door erin te staan, niet ertegen. 'Nieuwe lodges, opening januari 2027' is precies hun verhaal, en dat venster sluit." },
      { id: "n26-7",  title: "GBP volledig invullen: foto's, faciliteiten, openingsdatum, Q&A", category: "Lokaal", priority: "hoog" },
      { id: "n26-8",  title: "Blog: 'Kerst en oud & nieuw in Drenthe — waar overnacht je?'", category: "Blog", priority: "hoog", keyword: "kerst drenthe overnachten" },
      { id: "n26-9",  title: "Blog: 'Sauna of jacuzzi — wat kiest u?'", category: "Blog", priority: "hoog", keyword: "huisje met sauna en jacuzzi drenthe" },
      { id: "n26-10", title: "Eerste maanddashboard opleveren", category: "Analytics", priority: "hoog", note: "Beoordeel op positieverbetering, niet op verkeer. De quick-win-laag bestaat hier niet: bijna alles commercieels staat op positie 40+, dus klikgroei komt pas in maand 3–6." },
      { id: "n26-11", title: "Besluit hondcluster: echte propositie of loslaten", category: "CRO", priority: "midden", note: "Cluster staat op positie 72,9, de slechtste van de site, met 74 vertoningen. 'Honden in overleg welkom' wint geen SERP van concurrenten die omheinde tuinen adverteren. Advies: loslaten tenzij de omheinde tuin er echt komt." },
      { id: "n26-12", title: "hreflang op paginaniveau toevoegen (nu alleen in de sitemap)", category: "Techniek", priority: "midden" },
    ],
  },
  {
    id: "dec-2026",
    label: "December 2026",
    sublabel: "🎉 Opening 1 januari 2027",
    phase: "Opening",
    tasks: [
      { id: "d26-1", title: "Blog: Valentijn-artikel publiceren", category: "Blog", priority: "kritiek", keyword: "romantisch weekendje weg drenthe", note: "Drie maanden vóór de piek live. Google heeft 8–12 weken nodig om te indexeren en te positioneren." },
      { id: "d26-2", title: "Blog: 'De eerste gasten — hoe De Heide en De Eik zijn geworden'", category: "Blog", priority: "hoog" },
      { id: "d26-3", title: "Nieuwsbrief: opening en eerste beschikbaarheid", category: "Email", priority: "kritiek" },
      { id: "d26-4", title: "Prijsstrategie kerst en oud & nieuw vaststellen", category: "Revenue", priority: "kritiek", note: "Piektarief, minimaal 3–4 nachten." },
      { id: "d26-5", title: "Boekingsflow eindtest vóór 1 januari", category: "CRO", priority: "kritiek" },
      { id: "d26-6", title: "GBP-status op 'geopend' zetten", category: "Lokaal", priority: "hoog" },
      { id: "d26-7", title: "Nulmeting vastleggen vóór opening", category: "Analytics", priority: "hoog", note: "Vertoningen, CTR, gewogen positie en het aantal niet-merkgebonden klikken (staat nu op nul)." },
      { id: "d26-8", title: "Valentijn-tarief instellen voor 12–16 februari", category: "Revenue", priority: "hoog" },
    ],
  },
  {
    id: "jan-2027",
    label: "Januari 2027",
    sublabel: "Wellness, winterstilte, eerste gasten",
    phase: "Groei 2027",
    tasks: [
      { id: "j27-1", title: "Eerste bezettingsrapportage: nachten, ADR, bron per boeking", category: "Revenue", priority: "kritiek" },
      { id: "j27-2", title: "Reviewverzoek automatiseren: 14 dagen na vertrek", category: "CRO", priority: "kritiek", note: "Reviews zijn geen bijzaak voor lokale accommodatiezoekopdrachten. Zonder reviews schuift de hele groeicurve 3–6 maanden op." },
      { id: "j27-3", title: "Eerste Google-reviews naar het GBP leiden", category: "Lokaal", priority: "kritiek" },
      { id: "j27-4", title: "Blog: 'Wellness in januari — waarom de stilste maand de beste is'", category: "Blog", priority: "hoog", keyword: "wellness huisje drenthe" },
      { id: "j27-5", title: "Blog: 'Wandelen in de winter rond de Drentsche Aa'", category: "Blog", priority: "midden" },
      { id: "j27-6", title: "Funnel meten nu er echte sessies zijn: sessie → CTA → aanvraag → boeking", category: "Analytics", priority: "hoog", note: "Vervang de aannames uit het rapport door eigen cijfers. Doel samengesteld: 1,5% sessie → boeking." },
      { id: "j27-7", title: "Tarieven maart en april vaststellen", category: "Revenue", priority: "hoog" },
      { id: "j27-8", title: "Fotoshoot voorbereiden: shotlist, styling en datum vastleggen", category: "CRO", priority: "kritiek", note: "Per lodge: woonkamer, hottub bij avondlicht, badkamer, slaapkamer, ontbijttafel, buitenaanzicht in twee lichtcondities. Plan een dag zonder gasten en reserveer stylingbudget voor linnen, bloemen en tafeldekking — een lege lodge fotografeert leeg." },
      { id: "j27-9", title: "Videobrief opstellen voor de impressie in maart", category: "CRO", priority: "midden", note: "Zelfde fotograaf, aansluitend op de fotoshoot: dat scheelt een tweede styling- en reisdag. Vijf korte clips, verticaal gefilmd voor Pinterest, Reels en de hero van de landingspagina's." },
    ],
  },
  {
    id: "feb-2027",
    label: "Februari 2027",
    sublabel: "Valentijn — hoogste ADR-kans van Q1",
    phase: "Groei 2027",
    tasks: [
      { id: "f27-1", title: "Valentijn-piektarief actief, minimaal 2 nachten", category: "Revenue", priority: "kritiek" },
      { id: "f27-2", title: "aggregateRating-schema toevoegen zodra er ≥5 echte reviews zijn", category: "Techniek", priority: "hoog", note: "Sterren in de SERP zijn de sterkste CTR-hefboom die er is. Nooit eerder toevoegen, nooit verzinnen." },
      { id: "f27-3", title: "'Wanneer bloeit de heide in Drenthe' actualiseren", category: "Blog", priority: "hoog", keyword: "wanneer bloeit de heide in drenthe", note: "Staat op positie 10,9. Met een jaarlijkse update met actuele bloeiverwachting naar de top 3 te brengen." },
      { id: "f27-4", title: "Blog: Pasen en meivakantie in Drenthe", category: "Blog", priority: "hoog", note: "Drie maanden vóór de piek." },
      { id: "f27-5", title: "Drie fietsartikelen samenvoegen tot één sterke gids", category: "Blog", priority: "midden" },
      { id: "f27-6", title: "180-dagen evaluatie tegen de forecast", category: "Analytics", priority: "hoog", note: "Doel op dit punt: 8.000–12.000 vertoningen per maand, CTR 2,8%, commerciële positie 22–28." },
      { id: "f27-7", title: "Interieur- & sfeerfotografie beide lodges (± € 900)", category: "CRO", priority: "kritiek", note: "De grootste conversieblokker die er is: luxe-boekers beslissen op beeld. Alles wat hierna komt — Pinterest, Meta, de landingspagina's, Natuurhuisje en Airbnb — hangt aan deze dag. Plan hem vroeg in de maand, dan is er ruimte om over te doen." },
      { id: "f27-8", title: "Nieuwe foto's doorvoeren op homepage, lodgepagina's en GBP", category: "CRO", priority: "kritiek", note: "Binnen twee weken na de shoot. Comprimeer de bronbestanden onder 400 KB — de huidige originelen zijn ~3 MB en kosten Core Web Vitals." },
    ],
  },
  {
    id: "mrt-2027",
    label: "Maart 2027",
    sublabel: "Voorjaar & voorbereiding TT",
    phase: "Groei 2027",
    tasks: [
      { id: "m27-1", title: "Blog: TT Assen — waar overnacht je tijdens de TT-week?", category: "Blog", priority: "hoog", keyword: "overnachten tt assen", note: "Grootste vraagpiek van de regio, drie maanden vooruit gepubliceerd." },
      { id: "m27-2", title: "TT-week tarief instellen", category: "Revenue", priority: "kritiek", note: "Accommodaties binnen 25 km van het circuit rekenen die week aanzienlijk meer." },
      { id: "m27-3", title: "VVV Drenthe en Marketing Drenthe actualiseren", category: "Lokaal", priority: "hoog" },
      { id: "m27-4", title: "Blog: voorjaarswandelingen vanuit Zeijen", category: "Blog", priority: "midden" },
      { id: "m27-5", title: "A/B-test op de primaire CTA", category: "CRO", priority: "hoog", note: "Toets 'Bekijk beschikbaarheid' tegen 'Bekijk vrije weekenden' op de romantiekpagina." },
      { id: "m27-6", title: "Maanddashboard", category: "Analytics", priority: "midden" },
      { id: "m27-7", title: "Video-impressie opnemen (± € 600)", category: "CRO", priority: "hoog", note: "Vijf clips. Pinterest en Meta belonen video met aanzienlijk meer bereik dan stilstaand beeld, en een lodge met een hottub verkoopt zich in beweging beter dan op een foto." },
      { id: "m27-8", title: "Pinterest vullen met het nieuwe beeld", category: "Social", priority: "hoog", note: "Boards per thema: heide, wandelroutes, de lodges, wellness, Drenthe met hond. Pins hebben maanden nodig om te rijpen — hoe eerder ze staan, hoe eerder ze verkeer leveren." },
      { id: "m27-9", title: "Natuurhuisje-profiel aanmaken en live zetten", category: "Betaald", priority: "hoog", keyword: "natuurhuisje drenthe", note: "Exacte doelgroep (natuur, rust), ± 15% commissie. Zet erop wat u zelf niet gevuld krijgt — laagseizoen, doordeweekse nachten, last-minutes — en blokkeer de weken waar u zelf al vraag voor heeft. Elke gast gaat daarna in de nieuwsbrief met een reden om de volgende keer rechtstreeks te boeken." },
    ],
  },
  {
    id: "apr-2027",
    label: "April 2027",
    sublabel: "Pasen & voorjaarsbloei",
    phase: "Groei 2027",
    tasks: [
      { id: "a27-1", title: "Paastarief en minimumverblijf instellen", category: "Revenue", priority: "kritiek" },
      { id: "a27-2", title: "Heide-content actualiseren voor het seizoen", category: "Blog", priority: "hoog", note: "Vier maanden vóór de augustuspiek. /heide-drenthe staat al op positie 9,7 — dit is uw enige piek met een top-10-positie." },
      { id: "a27-3", title: "Seizoensbrief voorjaar naar de nieuwsbrieflijst", category: "Email", priority: "hoog" },
      { id: "a27-4", title: "Lokale samenwerkingen: fietsverhuur, restaurants, wellness in de buurt", category: "Lokaal", priority: "midden" },
      { id: "a27-5", title: "Maanddashboard", category: "Analytics", priority: "midden" },
      { id: "a27-6", title: "Airbnb-profiel aanmaken en live zetten", category: "Betaald", priority: "hoog", note: "Een maand ná Natuurhuisje, zodat de lessen uit die listing — welke foto's werken, welke tekst, welke prijsopzet — er meteen in zitten. Internationaal bereik, vooral koppels en gezinnen." },
      { id: "a27-7", title: "Kanaalvergelijking: eigen site versus Natuurhuisje versus Airbnb", category: "Analytics", priority: "hoog", note: "Netto per nacht ná commissie naast elkaar, plus het aandeel gasten dat later rechtstreeks terugboekt. Bepaalt hoeveel capaciteit er volgend seizoen naar de boekingssites gaat." },
    ],
  },
  {
    id: "mei-2027",
    label: "Mei 2027",
    sublabel: "Hemelvaart & Pinksteren — voorjaarspiek",
    phase: "Groei 2027",
    tasks: [
      { id: "my27-1", title: "Piektarief mei, minimaal 3 nachten", category: "Revenue", priority: "kritiek" },
      { id: "my27-2", title: "Zomer- en fietscontent live zetten", category: "Blog", priority: "hoog" },
      { id: "my27-3", title: "Halfjaarevaluatie: bezetting, ADR, aandeel organische boekingen", category: "Analytics", priority: "hoog", note: "Leidende KPI's: organisch toegeschreven nachten, aanvraag→boeking-ratio, ADR." },
      { id: "my27-4", title: "Herhaalgasten-actie voor het najaar", category: "Email", priority: "midden" },
    ],
  },
  {
    id: "jun-2027",
    label: "Juni 2027",
    sublabel: "Zomer, fietsen & TT-week",
    phase: "Groei 2027",
    tasks: [
      { id: "jn27-1", title: "TT-week piektarief actief", category: "Revenue", priority: "kritiek" },
      { id: "jn27-2", title: "Heide-artikel live vóór 1 juli, met actuele bloeiverwachting", category: "Blog", priority: "kritiek", keyword: "wanneer bloeit de heide in drenthe" },
      { id: "jn27-3", title: "Seizoensbrief zomer", category: "Email", priority: "hoog" },
      { id: "jn27-4", title: "Maanddashboard", category: "Analytics", priority: "midden" },
    ],
  },
  {
    id: "jul-2027",
    label: "Juli 2027",
    sublabel: "Hoogseizoen",
    phase: "Groei 2027",
    tasks: [
      { id: "jl27-1", title: "Hoogseizoentarief, sturen op weekverblijven", category: "Revenue", priority: "hoog" },
      { id: "jl27-2", title: "Nazomer- en septembercontent vooruit publiceren", category: "Blog", priority: "hoog" },
      { id: "jl27-3", title: "Reviewverzoeken opvoeren nu de bezetting piekt", category: "CRO", priority: "midden" },
      { id: "jl27-4", title: "Maanddashboard", category: "Analytics", priority: "midden" },
    ],
  },
  {
    id: "aug-2027",
    label: "Augustus 2027",
    sublabel: "Heidebloei — sterkste natuurlijke piek",
    phase: "Groei 2027",
    tasks: [
      { id: "au27-1", title: "Heidebloei-piektarief actief", category: "Revenue", priority: "kritiek" },
      { id: "au27-2", title: "Heide-content wekelijks actueel houden tijdens de bloei", category: "Blog", priority: "kritiek" },
      { id: "au27-3", title: "Heide-PR richting regionale media en reisredacties", category: "Lokaal", priority: "hoog" },
      { id: "au27-4", title: "Maanddashboard", category: "Analytics", priority: "midden" },
    ],
  },
  {
    id: "sep-2027",
    label: "September 2027",
    sublabel: "Nazomer — beste marge/bezetting-verhouding",
    phase: "Groei 2027",
    tasks: [
      { id: "s27-1", title: "Nazomertarief: midden-hoog vasthouden", category: "Revenue", priority: "hoog" },
      { id: "s27-2", title: "Herfst- en wellnesscontent live", category: "Blog", priority: "hoog" },
      { id: "s27-3", title: "Twaalfmaands evaluatie tegen de forecast", category: "Analytics", priority: "hoog", note: "Doel eind 2027: 18.000–25.000 vertoningen per maand, CTR 3,5%, commerciële positie 12–18." },
      { id: "s27-4", title: "Seizoensbrief najaar", category: "Email", priority: "hoog" },
    ],
  },
  {
    id: "okt-2027",
    label: "Oktober 2027",
    sublabel: "Herfst & wellness",
    phase: "Groei 2027",
    tasks: [
      { id: "o27-1", title: "Kerst- en oud & nieuw-content live", category: "Blog", priority: "hoog", note: "Drie maanden vóór de piek." },
      { id: "o27-2", title: "Kersttarief instellen, minimaal 3–4 nachten", category: "Revenue", priority: "kritiek" },
      { id: "o27-3", title: "Conversie-optimalisatie op basis van negen maanden echte funneldata", category: "CRO", priority: "hoog" },
      { id: "o27-4", title: "Maanddashboard", category: "Analytics", priority: "midden" },
    ],
  },
  {
    id: "nov-2027",
    label: "November 2027",
    sublabel: "Laagseizoen — sturen op verblijfsduur",
    phase: "Groei 2027",
    tasks: [
      { id: "n27-1", title: "Laagseizoen: actief sturen op 2- en 3-nachtenpakketten", category: "Revenue", priority: "hoog" },
      { id: "n27-2", title: "Wellness- en wintercontent live", category: "Blog", priority: "hoog" },
      { id: "n27-3", title: "Citaties en NAP-consistentie controleren", category: "Lokaal", priority: "midden" },
      { id: "n27-4", title: "Jaarplan 2028 voorbereiden", category: "Analytics", priority: "hoog" },
    ],
  },
  {
    id: "dec-2027",
    label: "December 2027",
    sublabel: "Kerst, winter & jaarevaluatie",
    phase: "Groei 2027",
    tasks: [
      { id: "d27-1", title: "Kerst- en oud & nieuw-piektarief actief", category: "Revenue", priority: "kritiek" },
      { id: "d27-2", title: "Jaarevaluatie 2027: bezetting, ADR, omzet per organische bezoeker", category: "Analytics", priority: "kritiek", note: "Targetscenario: 62% bezetting, 453 nachten, ADR €210, €95.100 omzet, 45% organisch/direct." },
      { id: "d27-3", title: "Valentijn 2028 vooruit publiceren", category: "Blog", priority: "hoog" },
      { id: "d27-4", title: "Doelen 2028 vaststellen", category: "Revenue", priority: "hoog" },
    ],
  },
];

/** Oude opslagplek. De voortgang staat nu in de database (marketing_task_status),
 *  zodat afvinken niet meer per browser is. Deze sleutel wordt bij de eerste keer
 *  laden nog één keer uitgelezen om bestaande vinkjes over te zetten. */
const LEGACY_STORAGE_KEY = "hth_marketing_done_v1";

function readLegacyDone(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch { return []; }
}

async function postAction(payload: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return res.ok && !data.error;
  } catch { return false; }
}

export function MarketingTab() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [activeMonth, setActiveMonth] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<Category | "alle">("alle");
  const [filterPrio, setFilterPrio] = useState<Priority | "alle">("alle");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [previewTask, setPreviewTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Spiegelt `done` zodat bulkToggle bij een fout exact kan terugdraaien
  // zonder van `done` af te hangen (en dus zonder telkens nieuw te zijn).
  const doneRef = useRef(done);
  useEffect(() => { doneRef.current = done; }, [done]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let ids: string[] = [];
      try {
        const res = await fetch("/api/admin/data?table=marketing_tasks");
        const data = await res.json();
        if (Array.isArray(data.data)) ids = data.data;
      } catch {
        // Netwerkfout: val terug op wat er lokaal nog staat, zodat het scherm
        // niet ten onrechte alles als open toont.
        ids = readLegacyDone();
      }

      // Eenmalige overzet: vinkjes die alleen nog in deze browser staan.
      const legacy = readLegacyDone().filter(id => !ids.includes(id));
      if (legacy.length > 0 && await postAction({ action: "bulk_marketing_tasks", ids: legacy, done: true })) {
        ids = [...ids, ...legacy];
      }

      if (cancelled) return;
      setDone(new Set(ids));
      setLoading(false);
    })();

    // Open de huidige kalendermaand standaard
    const now = new Date();
    const monthMap: Record<string, string> = {
      "2026-6": "jun-2026",  "2026-7": "jul-2026",  "2026-8": "aug-2026",
      "2026-9": "sep-2026",  "2026-10": "okt-2026", "2026-11": "nov-2026",
      "2026-12": "dec-2026", "2027-1": "jan-2027",  "2027-2": "feb-2027",
      "2027-3": "mrt-2027",  "2027-4": "apr-2027",  "2027-5": "mei-2027",
      "2027-6": "jun-2027",  "2027-7": "jul-2027",  "2027-8": "aug-2027",
      "2027-9": "sep-2027",  "2027-10": "okt-2027", "2027-11": "nov-2027",
      "2027-12": "dec-2027",
    };
    const key = `${now.getFullYear()}-${now.getMonth() + 1}`;
    setActiveMonth(monthMap[key] ?? MONTHS[0].id);

    return () => { cancelled = true; };
  }, []);

  const toggle = useCallback(async (id: string) => {
    let markAsDone = false;
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else { next.add(id); markAsDone = true; }
      return next;
    });
    setSaveError(null);

    const ok = await postAction({ action: "toggle_marketing_task", id, done: markAsDone });
    if (!ok) {
      // Opslaan mislukt: zet het vinkje terug, anders toont het scherm iets
      // anders dan er in de database staat.
      setDone(prev => {
        const next = new Set(prev);
        if (markAsDone) next.delete(id); else next.add(id);
        return next;
      });
      setSaveError("Opslaan mislukt — controleer je verbinding en probeer opnieuw.");
    }
  }, []);

  const bulkToggle = useCallback(async (ids: string[], markAsDone: boolean) => {
    if (ids.length === 0) return;
    const before = doneRef.current;
    setDone(prev => {
      const next = new Set(prev);
      ids.forEach(id => { if (markAsDone) next.add(id); else next.delete(id); });
      return next;
    });
    setSaveError(null);

    if (!(await postAction({ action: "bulk_marketing_tasks", ids, done: markAsDone }))) {
      setDone(before);
      setSaveError("Opslaan mislukt — controleer je verbinding en probeer opnieuw.");
    }
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
          SEO · Content · CRO · Lokale SEO · Revenue — juni 2026 t/m december 2027
        </p>

        {/* Waar dit plan op gebaseerd is — de vier cijfers die de prioriteiten bepalen.
            De volledige analyse staat in seo-cro-revenue-plan-2027.md in de repo. */}
        <div style={{
          background: "#FFF9ED", border: `1px solid ${C.gold}44`, borderLeft: `3px solid ${C.gold}`,
          borderRadius: 10, padding: "14px 18px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>
            Waarom deze volgorde — Search Console, augustus 2026
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {[
              { v: "92,3%", l: "van de vertoningen staat op positie 31 of lager" },
              { v: "0", l: "niet-merkgebonden klikken — alle 8 zijn merknaam" },
              { v: "754 / 249", l: "vertoningen op 'jacuzzi' tegen 'hottub'" },
              { v: "0,25%", l: "CTR commerciële pagina's, tegen 3,31% voor de blogs" },
            ].map((k, i) => (
              <div key={i}>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.green, lineHeight: 1.2 }}>{k.v}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.45, marginTop: 2 }}>{k.l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.55 }}>
            Dit is een ranking-probleem, geen CTR-probleem: bij positie 50 verandert een betere title niets.
            Daarom eerst consolideren en interne autoriteit bundelen, en pas daarna titels fijnslijpen.
            De volledige analyse — keyword-opportunity-map, concurrentiebenchmark, omzetscenario's — staat in{" "}
            <code style={{ background: "#00000008", padding: "1px 5px", borderRadius: 4, fontSize: 10.5 }}>
              seo-cro-revenue-plan-2027.md
            </code>{" "}
            in de repository.
          </div>
        </div>

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
          <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
            {loading ? "Voortgang laden…" : `${pct}% compleet`}
          </div>
          {saveError && (
            <div role="alert" style={{
              marginTop: 10, fontSize: 12, color: "#991B1B", background: "#FEE2E2",
              border: "1px solid #FCA5A5", borderRadius: 8, padding: "8px 12px",
            }}>
              {saveError}
            </div>
          )}
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
              onClick={() => bulkToggle(filteredTasks.map(t => t.id), true)}
              style={{ ...btn, background: C.card, color: C.text, fontSize: 12 }}
            >
              Alles afvinken (zichtbaar)
            </button>
            <button
              onClick={() => bulkToggle(filteredTasks.map(t => t.id), false)}
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
              • Voortgang staat in de database — ook zichtbaar op een andere computer<br />
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

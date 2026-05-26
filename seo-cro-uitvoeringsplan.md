# Huis ter Huynen — SEO & CRO Uitvoeringsplan (6–12 maanden)

**Opgesteld:** mei 2026 · **Context:** pre-opening (lodges boekbaar, opening 1 jan 2027)
**Doel:** dé best vindbare luxe lodge met hottub in Drenthe worden en structureel directe boekingen genereren — onafhankelijk van Booking.com.

> **Belangrijke nuance vooraf.** Deze audit is gebaseerd op de werkelijke broncode van de site (Next.js 15 App Router), niet op aannames. De technische SEO-basis is **veel sterker dan een gemiddelde accommodatiesite**: er staat al een nette `LodgingBusiness` schema, hreflang (nl/de), een dynamische sitemap, een Meta Pixel + Conversions API-stack met Consent Mode v2, security headers en AVIF/WebP-beeldoptimalisatie. Het echte probleem is **niet de techniek maar de architectuur**: de site is in feite één landingspagina (`/`) + `/omgeving` + `/blog` + `/faq` + Duitse variant + juridische pagina's. Er zijn **geen aparte commerciële landingspagina's** voor zoektermen met koopintentie. Dáár ligt 80% van de groeikans.
>
> **Over zoekvolumes:** ik heb in deze omgeving geen live keyword-tool (Ahrefs/Semrush/Keyword Planner). Alle "geschat potentieel"-waarden zijn relatieve inschattingen op basis van markt­kennis en moeten vóór uitvoering met een keyword-tool worden gevalideerd. Waar ik een hard getal niet kan onderbouwen, staat een bandbreedte of een ✱-markering.

> ## ✅ Implementatie-update (quick wins doorgevoerd)
> **Correctie op de eerste audit:** `/omgeving` en `/faq` blijken **al** volledige eigen `metadata` (title/description/canonical/OG) én structured data te hebben in hun `layout.tsx` — `/faq` heeft `FAQPage`-schema, `/omgeving` heeft `FAQPage` + `BreadcrumbList` + `ItemList`. De oorspronkelijke audit las alleen de `page.tsx`-bestanden en miste dit. Quick wins Q3 en Q4 waren dus al gedaan.
>
> **Wel doorgevoerd in deze ronde (branch `claude/sharp-wozniak-VyXIP`):**
> - **Q2** Homepage-`<h1>` is nu keyword-rijk: *"Luxe lodge met privé-hottub op de Drentse heide bij Assen"* (merknaam "Huis ter Huynen" blijft als visueel display + in title). Duitse `/de`-H1 was al keyword-rijk.
> - **Q5** www/non-www-canonical geconsolideerd: `/blog` (canonical + OG) en blog-`jsonLd` (`publisher.url`, `mainEntityOfPage`) staan nu allemaal op `www.`.
> - **Q7** Nep-reviews verwijderd: de gefabriceerde testimonials ("Sarah & Mark", "Petra", "Jan") op NL- én DE-homepage zijn weg; bij 0 echte Google-reviews toont de sectie nu een eerlijke pre-opening-boodschap. De verzonnen gast-quote ("Sarah & Mark · gasten van De Heide") is herschreven naar merk-copy. Zelf-toegekende `starRating: 5` verwijderd uit `LodgingBusiness` (NL + DE) — komt terug als echte `aggregateRating` zodra er reviews zijn.
> - **Q9** Ongebruikt duplicaat `public/rent-a-bike.jpg` verwijderd.
>
> Gevalideerd met `tsc --noEmit` (groen). Nog te doen quick wins: **Q1/Q10** (GBP + directories, extern), **Q6** (GTM→GA4-laag), **Q8** (sticky mobiele CTA + vanaf-prijs — vereist prijsdata), **Q11** (eerste blogs).

---

## FASE 1 — SEO Audit

Per onderdeel: huidige situatie · risico's · verbeterpotentieel · prioriteit.

### 1.1 URL-structuur
| | |
|---|---|
| **Huidig** | Schone, korte URL's: `/`, `/omgeving`, `/blog`, `/blog/[slug]`, `/faq`, `/de`, juridisch. `/landing` → `/` (301). Geen trailing-slash chaos, geen parameters. |
| **Risico** | Te weinig URL's = te weinig "deuren" naar de site. Alle commerciële intentie moet via één homepage. Je kunt niet ranken op `vakantiehuis met hottub drenthe` zonder URL die daarover gaat. |
| **Potentieel** | 20+ nieuwe keyword-gerichte URL's (zie Fase 3). Dit is de grootste hefboom. |
| **Prioriteit** | **Hoog** |

### 1.2 Paginatitels (title tags)
| | |
|---|---|
| **Huidig** | Homepage-title sterk en keyword-rijk: *"Lodge Drenthe \| Vakantiewoning met Hottub bij Assen – Huis ter Huynen"*. Title-template `%s – Huis ter Huynen` actief. Blog-overzicht en blogposts hebben eigen titels. |
| **Risico** | ~~`/omgeving` en `/faq` missen eigen title~~ → **gecorrigeerd: beide hebben eigen, geoptimaliseerde titles via `layout.tsx`.** Resterend risico: nieuwe landingspagina's moeten elk een unieke, exact-match title krijgen. |
| **Potentieel** | Unieke title per pagina; landingspagina's krijgen titels rond exact-match keywords. |
| **Prioriteit** | **Midden** (bestaande pagina's op orde; geldt voor nieuwe pagina's) |

### 1.3 Meta descriptions
| | |
|---|---|
| **Huidig** | Homepage-description goed geschreven, met USP's + CTA. Blogposts gebruiken `intro` als description. |
| **Risico** | ~~`/omgeving`, `/faq` missen description~~ → **gecorrigeerd: beide hebben eigen descriptions via `layout.tsx`.** Geldt nog voor nieuwe landingspagina's. |
| **Potentieel** | CTR-winst van 5–15% met geoptimaliseerde, intentie-gerichte descriptions per (nieuwe) pagina. |
| **Prioriteit** | **Laag/Midden** (bestaand op orde) |

### 1.4 Koppenstructuur (H1/H2/H3)
| | |
|---|---|
| **Huidig** | `/omgeving`, `/faq`, `/blog`, blogposts: precies één H1, logische H2/H3. |
| **Risico** | **Homepage-H1 = "Huis ter Huynen" (alleen merknaam).** Bij een merk dat nog niemand zoekt (pre-opening) verspilt dat de belangrijkste on-page rankingfactor. De keyword-context zit in de eyebrow en lopende tekst, niet in de H1. |
| **Potentieel** | H1 naar bv. *"Luxe lodge met privé-hottub op de Drentse heide"* (merknaam blijft in eyebrow/title). Directe relevantiewinst op kern-keywords. |
| **Prioriteit** | **Hoog** |

### 1.5 Interne linkstructuur
| | |
|---|---|
| **Huidig** | Homepage → `/omgeving`, `/blog`, `/faq`, ankers. `/omgeving` → `/`, `/faq`. Blogposts linken alleen naar `/#nieuwsbrief`. |
| **Risico** | Geen topical clustering, geen contextuele links van blog → relevante landingspagina. Linkkracht ("link equity") stroomt niet naar pagina's die moeten converteren/ranken. Blogposts zijn doodlopend richting boeking. |
| **Potentieel** | Hub-and-spoke: landingspagina's = hubs, blogs = spokes die ernaar linken. Elke blog 2–4 contextuele links naar landing + boeking. |
| **Prioriteit** | **Hoog** |

### 1.6 Structured Data (schema)
| | |
|---|---|
| **Huidig** | `LodgingBusiness` op homepage (adres, geo, telefoon, amenities, 2 `Accommodation`-objecten, check-in/out, prijsrange, starRating). Blogposts: `BlogPosting` + `BreadcrumbList`. Sterk fundament. |
| **Risico** | ~~(1) FAQPage ontbreekt; (4) geen BreadcrumbList op /omgeving~~ → **gecorrigeerd: `/faq` heeft `FAQPage`, `/omgeving` heeft `FAQPage` + `BreadcrumbList` + `ItemList`.** Resterend: (2) nog geen `aggregateRating`/`Review` in schema; (3) `starRating: 5` was zelf-toegekend → **inmiddels verwijderd** (NL + DE). |
| **Potentieel** | (Echte) `aggregateRating` zodra er reviews zijn = sterren in SERP. `Product`/`Offer`-schema op lodge-landingspagina's voor prijs-snippets. |
| **Prioriteit** | **Midden** |

### 1.7 Sitemap
| | |
|---|---|
| **Huidig** | Dynamische `sitemap.ts`: statische pagina's + alle gepubliceerde blogposts uit Supabase, met `lastModified`, `changeFrequency`, `priority` en hreflang-alternates op `/` en `/de`. Netjes. |
| **Risico** | Nieuwe landingspagina's moeten handmatig worden toegevoegd. `priority`-waarden zijn deels arbitrair (Google negeert ze grotendeels). |
| **Potentieel** | Sitemap uitbreiden zodra landingspagina's live gaan; eventueel een aparte image-sitemap. |
| **Prioriteit** | **Laag** (werkt; alleen meegroeien) |

### 1.8 Robots.txt
| | |
|---|---|
| **Huidig** | Correct: `Allow: /`, blokkeert `/admin`, `/api/`, `/betaald`, `/bevestig`, `/offerte`, `/concierge`; sitemap gelinkt. |
| **Risico** | Geen. Klein punt: bij staging/preview-omgevingen moet noindex gewaarborgd zijn (anders duplicate met productie). |
| **Potentieel** | Niets urgents. |
| **Prioriteit** | **Laag** |

### 1.9 Canonicals
| | |
|---|---|
| **Huidig** | Homepage canonical → `https://www.huisterhuynen.nl`. Blogposts canonical met **www**. |
| **Risico** | **Inconsistentie www vs non-www.** `/blog` (overzicht) canonical = `https://huisterhuynen.nl/blog` (zónder www); blog-`jsonLd` gebruikt `huisterhuynen.nl` (non-www) voor `publisher.url` en `mainEntityOfPage`, terwijl de canonical-tag wél www gebruikt. Gemengde signalen over de voorkeursdomein-variant. |
| **Potentieel** | Eén bron-van-waarheid (`SITE_URL` constante) overal afdwingen → consolideert linkwaarde op één host. |
| **Prioriteit** | **Midden** |

### 1.10 Afbeeldingsoptimalisatie
| | |
|---|---|
| **Huidig** | `next/image` met AVIF/WebP, `sizes`, `quality` (hero q=45), `priority` + preload op LCP-hero. Alt-teksten zijn beschrijvend én keyword-bewust. Goed gedaan op runtime-niveau. |
| **Risico** | **Bron-bestanden zijn enorm:** `lodge-eik.jpg` 3,5 MB en `lodge-heide.jpg` 3,3 MB. Next optimaliseert bij serven, maar de eerste optimalisatie is traag/zwaar en de repo draagt onnodig gewicht. **`rent-a-bike.jpg` en `rent_a_bike.jpg` zijn identieke duplicaten** (260 KB elk). |
| **Potentieel** | Bron-JPG's pre-comprimeren (<400 KB), duplicaat verwijderen, expliciete `width/height` waar `fill` niet nodig is. |
| **Prioriteit** | **Midden** |

### 1.11 Core Web Vitals
| | |
|---|---|
| **Huidig** | Goede randvoorwaarden: `next/font` met `display:swap` (geen FOIT), preconnect naar GTM/Facebook, LCP-hero preload, GTM `afterInteractive`, BookingCalendar lazy (`ssr:false`). |
| **Risico** | (1) **Bijna de hele homepage is één `"use client"`-component** met veel inline-styles → grotere JS-hydration bundle dan nodig. (2) Reviews worden client-side gefetcht ná load → mogelijke layout shift in de reviews-sectie (CLS) als de fallback andere hoogte heeft dan de echte data. (3) Zware bron-images (zie 1.10). |
| **Potentieel** | Statische secties naar Server Components, reviews server-side ophalen of vaste min-hoogte reserveren, CWV meten met echte veldscores (CrUX/PageSpeed). |
| **Prioriteit** | **Midden** |

### 1.12 Mobiele bruikbaarheid
| | |
|---|---|
| **Huidig** | Responsive grids (`auto-fit minmax`), `clamp()`-typografie, viewport-meta correct, PWA-manifest + apple-touch. |
| **Risico** | Geen sticky/altijd-zichtbare CTA op mobiel; primaire CTA verdwijnt bij scrollen. Telefoonnummer niet als `tel:`-knop in beeld (alleen WhatsApp/mail in footer). |
| **Potentieel** | Sticky mobiele boekbalk ("Bekijk data / WhatsApp") → directe conversiewinst. |
| **Prioriteit** | **Midden** (raakt vooral conversie, zie Fase 7) |

### 1.13 Lokale SEO
| | |
|---|---|
| **Huidig** | Sterk: geo-meta (`geo.region NL-DR`, coördinaten, ICBM), volledig adres in `LodgingBusiness`, `hasMap`. KvK in footer. |
| **Risico** | **Google Business Profile (GBP) is de grootste ontbrekende factor** (staat als todo #58). Zonder GBP geen Maps/local-pack-zichtbaarheid, geen Google-reviews-vliegwiel. Ook nog niet aangemeld bij VVV/Visit Drenthe/Tripadvisor (todo #59–61). NAP-consistentie over directories nog niet opgebouwd. |
| **Potentieel** | GBP = snelste, gratis bron van lokale zichtbaarheid en reviews. Citaties (VVV, Visit Drenthe, ANWB, Natuurhuisje) bouwen lokale autoriteit + backlinks. |
| **Prioriteit** | **Hoog** |

### 1.14 Content­diepgang
| | |
|---|---|
| **Huidig** | `/omgeving` is verrassend goed (fiets-/wandelroutes met afstand/niveau, FAQ, activiteiten). Homepage rijk aan secties. Blog-infrastructuur klaar (CMS via Supabase), maar er staan nog **0 gepubliceerde artikelen** (overzicht toont "binnenkort"). |
| **Risico** | Zonder gepubliceerde content geen long-tail-instroom, geen autoriteit. Concurrenten (Natuurhuisje, andere lodges, VVV) domineren de informationele zoektermen. |
| **Potentieel** | Het volledige contentplan (Fase 4) + landingspagina's (Fase 3). Dit is naast de architectuur de tweede grote hefboom. |
| **Prioriteit** | **Hoog** |

### 1.15 Zoekwoorddekking
| | |
|---|---|
| **Huidig** | Gedekt op homepage/omgeving: *lodge Drenthe, hottub, wandelen/fietsen Drenthe, Zeijen, Drentsche Aa, heide, Assen-omgeving*. |
| **Risico** | **Niet of nauwelijks gedekt:** `vakantiehuis met hottub drenthe`, `luxe vakantiehuis drenthe`, `romantisch weekend weg drenthe`, `wellness vakantie drenthe`, `vakantiehuis assen/norg`, `overnachten veenhuizen`, `zeijerstrubben`, `ballooerveld`, `paarse heide drenthe`. Geen dedicated pagina = geen ranking. |
| **Potentieel** | Zie Fase 2 (gap) + Fase 3 (pagina's). |
| **Prioriteit** | **Hoog** |

### 1.16 Tracking & meetbaarheid (extra bevinding)
| | |
|---|---|
| **Huidig** | Geavanceerd: Meta Pixel + CAPI met deduplicatie op `event_id`, Consent Mode v2 default-deny, 11 events, GTM-loader. |
| **Risico** | De dataLayer-events zijn **Meta-genoemd** (`Lead`, `InitiateCheckout`, `Contact`, `BookingComRedirect`…). Voor GA4 moeten daar nog GTM→GA4-event-tags op zitten (snake_case). Onduidelijk of de GA4-config-tag en die event-tags bestaan in de GTM-container. |
| **Potentieel** | Volledige GA4-conversiemeting (zie Fase 5). |
| **Prioriteit** | **Hoog** |

### Audit-scorebord (samenvatting)
| Onderdeel | Status | Prioriteit |
|---|---|---|
| URL-structuur | 🟠 te plat | Hoog |
| Titles | 🟢/🟠 (2 pagina's missen) | Hoog |
| Descriptions | 🟠 | Midden |
| H1/H2/H3 | 🟠 (homepage-H1) | Hoog |
| Interne links | 🔴 zwak | Hoog |
| Structured data | 🟢/🟠 (FAQPage mist) | Hoog/Midden |
| Sitemap | 🟢 | Laag |
| Robots.txt | 🟢 | Laag |
| Canonicals | 🟠 www-inconsistentie | Midden |
| Afbeeldingen | 🟠 zware bronnen | Midden |
| Core Web Vitals | 🟠 | Midden |
| Mobiel | 🟢/🟠 (geen sticky CTA) | Midden |
| Lokale SEO | 🔴 GBP ontbreekt | Hoog |
| Contentdiepgang | 🔴 0 blogs live | Hoog |
| Zoekwoorddekking | 🔴 gaten | Hoog |
| Tracking/GA4 | 🟠 GA4-laag onzeker | Hoog |

---

## FASE 2 — Keyword Gap Analyse

Legenda — **Intentie:** Info(rmationeel) / Commercieel onderzoekend / Transactioneel. **Potentieel/Concurrentie/Conversiekans:** L/M/H (relatieve inschatting, valideren met tool). Maandvolumes zijn ✱grove✱ NL-schattingen.

### 2.1 Accommodatie-gerichte zoekwoorden (kern = hoogste prioriteit)
| Zoekwoord | Intentie | Geschat volume✱ | Potentieel | Concurrentie | Conversiekans |
|---|---|---|---|---|---|
| vakantiehuis met hottub drenthe | Transactioneel | 200–500/mnd | **H** | M | **H** |
| luxe lodge drenthe | Commercieel | 50–150 | H | L–M | **H** |
| lodge drenthe | Commercieel | 200–400 | H | M | H |
| luxe vakantiehuis drenthe | Commercieel | 150–300 | H | M | H |
| vakantiehuis drenthe | Transactioneel | 1.500–3.000 | M (breed/competitief) | **H** | M |
| wellness vakantie drenthe | Commercieel | 100–250 | M | M | H |
| romantisch weekend weg drenthe | Commercieel | 150–400 | **H** | M | **H** |
| overnachten in de natuur | Info/Commercieel | 300–600 (NL-breed) | M | M | M |
| vakantiehuis hottub privé | Transactioneel | 100–300 | H | M | **H** |
| bijzonder overnachten drenthe | Commercieel | 200–400 | H | M | H |

**Inzicht:** richt je op de *long-tail met hottub/luxe/romantisch* — daar is de concurrentie lager en de koopintentie het hoogst. Vermijd het breken op kale `vakantiehuis drenthe` (Booking, Natuurhuisje, Belvilla domineren); win de niche.

### 2.2 Locatie-gerichte zoekwoorden
| Zoekwoord | Intentie | Geschat volume✱ | Potentieel | Concurrentie | Conversiekans |
|---|---|---|---|---|---|
| vakantiehuis assen | Transactioneel | 200–500 | H | M | H |
| vakantiehuis norg | Transactioneel | 100–250 | H | L–M | H |
| overnachten veenhuizen | Commercieel | 50–150 | M | L | M |
| zeijen | Info | 100–300 | L (navigationeel) | L | L |
| assen (toerisme) | Info | hoog/breed | L (te breed) | H | L |
| norg | Info | M | L | L | L |
| veenhuizen | Info | M–H | M | M | M |
| drentsche aa | Info | 500–1.000 | M | M | M |
| zeijerstrubben | Info | 50–150 | M (niche, eigen "achtertuin") | **L** | M |
| ballooerveld | Info | 200–500 | M | L | M |

**Inzicht:** lokale niche-termen (`zeijerstrubben`, `ballooerveld`, `norg`) hebben **lage concurrentie** en jij bent fysiek hét antwoord. Hier kun je #1 worden en die pagina's linken door naar de boeking.

### 2.3 Activiteit-gerichte zoekwoorden
| Zoekwoord | Intentie | Geschat volume✱ | Potentieel | Concurrentie | Conversiekans |
|---|---|---|---|---|---|
| fietsen in drenthe | Info | 800–1.500 | **H** (seizoenspiek mei–jul) | M | M |
| wandelroutes drenthe | Info | 1.000–2.000 | **H** | M–H | M |
| heide drenthe | Info | 500–1.000 | M | M | M |
| paarse heide drenthe | Info | 300–800 (piek aug–sep) | **H** (jaarlijks evergreen) | M | M |
| weekend weg drenthe | Commercieel | 500–1.000 | H | M | H |
| vakantie in drenthe | Info/Commercieel | 1.000–2.500 | M (breed) | H | M |
| fietsroutes drenthe | Info | 600–1.200 | H | M | M |
| wandelen drentsche aa | Info | 100–300 | H | L–M | M |
| dwingelderveld | Info | 1.000–2.000 | M | M | M |
| hunebedden drenthe | Info | 1.000–2.000 | M | M | L–M |

**Inzicht:** activiteits-termen leveren **volume + autoriteit** (top-of-funnel). Ze converteren niet direct maar voeden via interne links de commerciële pagina's en bouwen E-E-A-T (lokale expertise). `paarse heide drenthe` is dé jaarlijks terugkerende verkeerspiek — verplicht evergreen-artikel.

### 2.4 Strategische clusters (zo groeperen we de gap)
1. **Hottub/luxe-cluster** (transactioneel, hoogste prioriteit) → eigen landingspagina's.
2. **Romantiek/wellness-cluster** (commercieel) → landingspagina's + blogs.
3. **Plaats-cluster** (Assen/Norg/Veenhuizen/Zeijen) → "vakantiehuis [plaats]"-landingspagina's.
4. **Natuur/activiteit-cluster** (informationeel, autoriteit) → blogs die naar 1–3 linken.
5. **Seizoen-cluster** (heide, herfst, winter) → evergreen blogs met jaarlijkse pieken.

---

## FASE 3 — Nieuwe Landingspagina-architectuur (20+ pagina's)

**Conventies:** alle pagina's krijgen eigen `metadata` (title/description/canonical), één keyword-rijke H1, FAQ-blok met `FAQPage`-schema, en minimaal 2 contextuele interne links naar `#reserveren`/relevante landing. **Conversiedoel** is voor pre-opening primair `Lead`/`Subscribe`; na opening `booking_click`/`Lead`.

> Map-structuur in Next.js: maak per pagina `src/app/<slug>/page.tsx` met server-side `metadata`. Voeg toe aan `sitemap.ts`.

### A) Commerciële kern-landingspagina's (HOOG)
| # | URL | Primaire term | Secundaire termen | Intentie | Woorden | Interne links | Conversiedoel |
|---|---|---|---|---|---|---|---|
| 1 | `/vakantiehuis-met-hottub-drenthe` | vakantiehuis met hottub drenthe | privé hottub, lodge hottub, jacuzzi vakantiehuis | Transactioneel | 1.000–1.400 | → reserveren, /luxe-lodge-drenthe, /romantisch-weekend-weg-drenthe | Lead/booking |
| 2 | `/luxe-lodge-drenthe` | luxe lodge drenthe | boutique lodge, luxe overnachten drenthe | Commercieel | 900–1.300 | → reserveren, lodge-detailpagina's | Lead/booking |
| 3 | `/romantisch-weekend-weg-drenthe` | romantisch weekend weg drenthe | romantisch overnachten, weekendje weg koppel | Commercieel | 1.000–1.400 | → hottub-pagina, wellness-pagina, reserveren | Lead/booking |
| 4 | `/wellness-vakantie-drenthe` | wellness vakantie drenthe | sauna, hottub, retreat, digitale detox | Commercieel | 900–1.300 | → hottub-pagina, /heide-drenthe | Lead/booking |
| 5 | `/lodge-de-heide` | lodge de heide drenthe | 4 personen, sauna, heide-uitzicht | Transactioneel | 700–1.000 | → reserveren, /lodge-de-eik | booking |
| 6 | `/lodge-de-eik` | lodge de eik drenthe | 4 personen, buitenkeuken, BBQ | Transactioneel | 700–1.000 | → reserveren, /lodge-de-heide | booking |

### B) Plaats-landingspagina's (HOOG/MIDDEN)
| # | URL | Primaire term | Secundaire termen | Intentie | Woorden | Interne links | Conversiedoel |
|---|---|---|---|---|---|---|---|
| 7 | `/vakantiehuis-assen` | vakantiehuis assen | overnachten assen, TT Assen verblijf | Transactioneel | 900–1.200 | → reserveren, /omgeving | Lead/booking |
| 8 | `/vakantiehuis-norg` | vakantiehuis norg | overnachten norg, lodge norg | Transactioneel | 800–1.100 | → reserveren, /fietsen-in-drenthe | Lead/booking |
| 9 | `/overnachten-veenhuizen` | overnachten veenhuizen | gevangenismuseum, UNESCO Veenhuizen | Commercieel | 800–1.100 | → reserveren, /omgeving | Lead/booking |
| 10 | `/vakantie-zeijen` | vakantiehuis zeijen | overnachten zeijen, brinkdorp | Commercieel | 700–1.000 | → reserveren, /zeijerstrubben | Lead/booking |

### C) Activiteit-/natuur-landingspagina's (MIDDEN — autoriteit + instroom)
| # | URL | Primaire term | Secundaire termen | Intentie | Woorden | Interne links | Conversiedoel |
|---|---|---|---|---|---|---|---|
| 11 | `/fietsen-in-drenthe` | fietsen in drenthe | fietsroutes, knooppunten, e-bike | Info | 1.500–2.000 | → reserveren, /vakantiehuis-norg | Subscribe/Lead |
| 12 | `/wandelroutes-drenthe` | wandelroutes drenthe | wandelen drenthe, routes vanuit zeijen | Info | 1.500–2.000 | → reserveren, /wandelen-drentsche-aa | Subscribe/Lead |
| 13 | `/wandelen-drentsche-aa` | wandelen drentsche aa | beekdal, nationaal landschap | Info | 1.000–1.400 | → /wandelroutes-drenthe, reserveren | Subscribe |
| 14 | `/heide-drenthe` | paarse heide drenthe | heide bloei, wanneer bloeit heide | Info (seizoenspiek) | 1.200–1.600 | → /zeijerstrubben, /ballooerveld, reserveren | Subscribe |
| 15 | `/zeijerstrubben` | zeijerstrubben | strubbenbos, wandelen zeijen | Info (niche) | 700–1.000 | → /heide-drenthe, reserveren | Subscribe |
| 16 | `/ballooerveld` | ballooerveld | heideveld, schaapskudde, balloo | Info | 700–1.000 | → /heide-drenthe, reserveren | Subscribe |
| 17 | `/dwingelderveld` | dwingelderveld | grootste heide, nationaal park | Info | 900–1.300 | → /heide-drenthe, reserveren | Subscribe |
| 18 | `/hunebedden-drenthe` | hunebedden drenthe | hunebed route, prehistorie | Info | 900–1.300 | → /fietsen-in-drenthe, reserveren | Subscribe |

### D) Beslissings-/vergelijkingspagina's (MIDDEN)
| # | URL | Primaire term | Secundaire termen | Intentie | Woorden | Interne links | Conversiedoel |
|---|---|---|---|---|---|---|---|
| 19 | `/weekend-weg-drenthe` | weekend weg drenthe | weekendje weg, korte vakantie | Commercieel | 1.000–1.400 | → romantisch/wellness/hottub-pagina's | Lead/booking |
| 20 | `/bijzonder-overnachten-drenthe` | bijzonder overnachten drenthe | uniek overnachten, lodge boeken | Commercieel | 1.100–1.500 | → /luxe-lodge-drenthe, reserveren | Lead/booking |
| 21 | `/vakantiehuis-drenthe-met-hond` | vakantiehuis drenthe met hond | hondvriendelijk, huisdier welkom | Transactioneel | 800–1.100 | → reserveren, /wandelroutes-drenthe | Lead/booking |
| 22 | `/directe-boeking` (geen-OTA USP) | direct boeken zonder booking.com | beste prijs garantie, voordeel direct | Transactioneel | 500–800 | → reserveren | booking |

### E) Duits (uitbreiden bestaande `/de`) (MIDDEN — tweede markt)
| # | URL | Primaire term | Intentie | Conversiedoel |
|---|---|---|---|---|
| 23 | `/de/ferienhaus-mit-whirlpool-drenthe` | ferienhaus mit whirlpool drenthe / niederlande | Transactioneel | Lead/booking |
| 24 | `/de/luxus-lodge-drenthe` | luxus lodge drenthe | Commercieel | Lead/booking |
| 25 | `/de/wellness-urlaub-drenthe` | wellnessurlaub drenthe niederlande | Commercieel | Lead/booking |

### Prioriteitenlijst landingspagina's (hoog → laag)
1. `/vakantiehuis-met-hottub-drenthe` (#1) — hoogste intentie + USP-match.
2. `/luxe-lodge-drenthe` (#2)
3. `/romantisch-weekend-weg-drenthe` (#3)
4. `/lodge-de-heide` + `/lodge-de-eik` (#5, #6) — productpagina's met `Offer`-schema.
5. `/wellness-vakantie-drenthe` (#4)
6. `/vakantiehuis-assen` + `/vakantiehuis-norg` (#7, #8)
7. `/fietsen-in-drenthe` + `/wandelroutes-drenthe` (#11, #12) — verkeersmotoren.
8. `/heide-drenthe` (#14) — seizoens-evergreen vóór augustus live.
9. `/weekend-weg-drenthe` + `/bijzonder-overnachten-drenthe` (#19, #20)
10. Niche-natuur (#13, #15–18), met-hond (#21), directe-boeking-USP (#22).
11. Duitse pagina's (#23–25).

---

## FASE 4 — Contentplan (12 maanden, 2 blogs/week = 104 onderwerpen)

**Strategie:** elke blog heeft één primaire keyword + 2–3 LSI-termen, eindigt met een CTA (pre-opening: nieuwsbrief/vroegboek; post-opening: directe boeking), en linkt contextueel naar 1–2 landingspagina's uit Fase 3. **Interne linkstrategie:** blogs (spokes) → landing (hub) → reserveren. **CTA-strategie:** zacht in de tekst, hard in een vast CTA-blok onderaan + 1 mid-content CTA bij artikelen >1.200 woorden.

> Publiceer Di + Do. Reserveer seizoens-evergreens (heide, herfst, winter) ruim vóór hun zoekpiek zodat ze geïndexeerd zijn.

### Maand 1 — Fundament & hottub/luxe (juni)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 1 | Vakantiehuis met hottub in Drenthe: dit zijn je opties | vakantiehuis met hottub drenthe | Hottub |
| 2 | Waarom een privé hottub je weekendje weg compleet maakt | privé hottub vakantiehuis | Hottub |
| 3 | De 10 mooiste fietspaden in Drenthe (vanuit Zeijen) | fietspaden drenthe | Fietsen |
| 4 | Luxe overnachten in Drenthe: wat maakt een lodge écht luxe? | luxe lodge drenthe | Luxe |
| 5 | Romantisch weekendje weg in Drenthe: 7 ideeën | romantisch weekend weg drenthe | Romantiek |
| 6 | Wandelen vanuit je voordeur: de Veentjesroute Zeijen | wandelroute zeijen | Wandelen |
| 7 | Drenthe vs. Veluwe: waar boek je je natuurweekend? | weekend weg drenthe | Beslissing |
| 8 | Zo plan je een digitale detox in de Drentse natuur | digitale detox nederland | Wellness |

### Maand 2 — Zomer & activiteiten (juli)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 9 | Fietsvakantie Drenthe: complete gids voor beginners | fietsvakantie drenthe | Fietsen |
| 10 | De Drentsche Aa: het mooiste beekdal van Nederland | drentsche aa | Natuur |
| 11 | Wellness in Drenthe: sauna's, spa's en natuur-retreats | wellness drenthe | Wellness |
| 12 | Wat te doen in Assen: 12 tips voor je verblijf | wat te doen in assen | Plaats |
| 13 | Vakantie met hond in Drenthe: hondvriendelijk overnachten | vakantiehuis drenthe met hond | Hond |
| 14 | Kanovaren op de Drentsche Aa: route en tips | kanovaren drentsche aa | Activiteit |
| 15 | E-bike huren in Drenthe: waar en wat kost het? | e-bike huren drenthe | Fietsen |
| 16 | Een dag in Norg: brinkdorp, bos en terrasjes | wat te doen in norg | Plaats |

### Maand 3 — Heide-seizoen (augustus, kritieke piek)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 17 | Bloeiende heide Drenthe: wanneer, waar en de mooiste plekken | paarse heide drenthe | Heide ⭐ |
| 18 | Het Ballooërveld: heideveld met schaapskudde bij Assen | ballooerveld | Heide |
| 19 | De Zeijerstrubben: het mysterieuze strubbenbos van Zeijen | zeijerstrubben | Natuur |
| 20 | Heide fotograferen: 7 tips voor de perfecte foto | heide fotograferen | Heide |
| 21 | Dwingelderveld: grootste natte heide van West-Europa | dwingelderveld | Heide |
| 22 | Wandelroutes door de paarse heide (alle niveaus) | wandelen heide drenthe | Wandelen |
| 23 | Overnachten naast de heide: zo dichtbij kun je slapen | overnachten in de natuur | Luxe |
| 24 | Zomeravonden in de hottub onder de Drentse sterren | hottub onder de sterren | Hottub |

### Maand 4 — Herfst & cultuur (september)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 25 | Herfst in Drenthe: waarom sept–okt de mooiste maanden zijn | herfst drenthe | Seizoen |
| 26 | Veenhuizen: van strafkolonie tot UNESCO-werelderfgoed | overnachten veenhuizen | Plaats/Cultuur |
| 27 | De 52 hunebedden van Drenthe: route en geschiedenis | hunebedden drenthe | Cultuur |
| 28 | Paddenstoelen spotten in de Drentse bossen | paddenstoelen drenthe | Natuur |
| 29 | Drents Museum Assen: wat moet je gezien hebben? | drents museum | Cultuur |
| 30 | Herfstwandelingen rond Zeijen en Norg | herfstwandeling drenthe | Wandelen |
| 31 | Wellnessweekend in de herfst: opwarmen na de wandeling | wellness weekend drenthe | Wellness |
| 32 | Wat kost een luxe vakantiehuis in Drenthe? | luxe vakantiehuis drenthe | Luxe |

### Maand 5 — Beslissing & vergelijking (oktober)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 33 | Bijzonder overnachten in Drenthe: 8 unieke verblijven | bijzonder overnachten drenthe | Beslissing |
| 34 | Direct boeken of via Booking.com? Dit scheelt het je | direct boeken vakantiehuis | Direct |
| 35 | Stilteregio Drenthe: de stilste plekken van Nederland | stilte nederland vakantie | Wellness |
| 36 | Weekend weg met vriendinnen in Drenthe | weekend weg vriendinnen | Romantiek/Groep |
| 37 | UNESCO Geopark de Hondsrug: wat is het en wat zie je? | geopark hondsrug | Natuur |
| 38 | Kamp Westerbork bezoeken: praktische gids | kamp westerbork bezoeken | Cultuur |
| 39 | Mountainbiken in Drenthe: de beste MTB-routes | mtb routes drenthe | Fietsen |
| 40 | Lodge de Eik vs. de Heide: welke past bij jou? | lodge drenthe boeken | Luxe |

### Maand 6 — Winter & feestdagen (november)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 41 | Winter in Drenthe: een verblijf in de natuur in de kou | winter drenthe | Seizoen |
| 42 | Kerst vieren in een lodge in Drenthe | kerst weekend drenthe | Seizoen |
| 43 | Oud & nieuw weg in Drenthe: rust in plaats van vuurwerk | oud en nieuw weg | Seizoen |
| 44 | Sterren kijken in Drenthe: minste lichtvervuiling van NL | sterrenhemel drenthe | Natuur |
| 45 | De perfecte winterdag vanuit je lodge (tijdlijn) | winterweekend drenthe | Luxe |
| 46 | Cadeau-idee: een verblijf weggeven (cadeaubon) | overnachting cadeau | Direct/Conversie |
| 47 | Wat neem je mee voor een winterweekend in de natuur? | inpaklijst weekend weg | Praktisch |
| 48 | Romantisch winterweekend met hottub in de sneeuw | romantisch winterweekend | Romantiek |

### Maand 7 — Opening & merk (december)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 49 | Huis ter Huynen opent: dit kun je verwachten | boutique lodge drenthe | Merk ⭐ |
| 50 | Een kijkje binnen: zo ziet Lodge de Heide eruit | lodge de heide | Luxe |
| 51 | Een kijkje binnen: zo ziet Lodge de Eik eruit | lodge de eik | Luxe |
| 52 | Zo werkt direct boeken bij Huis ter Huynen | direct boeken zonder booking.com | Direct |
| 53 | Onze 5 favoriete plekken in de omgeving van Zeijen | omgeving zeijen | Plaats |
| 54 | Duurzaam op vakantie: EV-laden en natuur bij de lodge | duurzaam vakantiehuis | USP |
| 55 | Vroegboekvoordeel 2027: wat het je oplevert | vroegboekkorting drenthe | Conversie |
| 56 | Veelgestelde vragen over je verblijf beantwoord | vakantiehuis drenthe faq | Praktisch |

### Maand 8 — Laagseizoen & retentie (januari)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 57 | Januari in Drenthe: waarom de stilte nu het mooist is | januari weekend weg | Seizoen |
| 58 | Nieuwjaarsvoornemen: vaker de natuur in | natuur weekend nederland | Wellness |
| 59 | De beste winterwandelingen rond de Drentsche Aa | winterwandeling drentsche aa | Wandelen |
| 60 | Wat eet en drink je lokaal in Drenthe? | streekproducten drenthe | Lokaal |
| 61 | Werken vanuit een lodge: workation in Drenthe | workation nederland | Niche |
| 62 | Hoe wij de hottub het hele jaar warm houden | privé hottub | Hottub |
| 63 | Verjaardag vieren in een vakantiehuis met hottub | verjaardag weekend weg | Romantiek |
| 64 | De geschiedenis van Zeijen als brinkdorp | zeijen | Plaats |

### Maand 9 — Valentijn & voorjaar (februari)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 65 | Valentijn in Drenthe: romantisch weekend met hottub | valentijn weekend weg | Romantiek ⭐ |
| 66 | Het ultieme romantische arrangement samenstellen | romantisch arrangement drenthe | Romantiek |
| 67 | Voorjaar in Drenthe: wanneer ontwaakt de natuur? | voorjaar drenthe | Seizoen |
| 68 | Vogels spotten langs de Drentsche Aa (ijsvogel!) | vogels kijken drenthe | Natuur |
| 69 | Wellnessarrangement: sauna + hottub + massage in de buurt | wellnessarrangement drenthe | Wellness |
| 70 | Een weekend zonder telefoon: zo doe je dat | digitale detox weekend | Wellness |
| 71 | Vakantiehuis voor 2 personen in Drenthe | vakantiehuis 2 personen drenthe | Luxe |
| 72 | De mooiste zonsondergangen op de heide | zonsondergang heide | Natuur |

### Maand 10 — Fiets-/wandelpiek (maart)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 73 | Fietsen in Drenthe: de complete knooppuntengids | fietsen in drenthe | Fietsen ⭐ |
| 74 | Wandelroutes Drenthe: 15 routes op een rij | wandelroutes drenthe | Wandelen ⭐ |
| 75 | Met kinderen op pad in Drenthe: 8 leuke tochten | kinderen drenthe activiteiten | Gezin |
| 76 | Hondsrug fietsroute: 45 km over de stuwwal | hondsrug fietsroute | Fietsen |
| 77 | Lente op de heide: van groen naar eerste kleur | heide drenthe | Heide |
| 78 | Picknickplekken in de Drentse natuur | picknick drenthe | Activiteit |
| 79 | Vakantiehuis met sauna in Drenthe | vakantiehuis met sauna drenthe | Wellness |
| 80 | Een lang weekend Drenthe: 3-dagen-routebeschrijving | lang weekend drenthe | Beslissing |

### Maand 11 — Pasen & meivakantie (april)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 81 | Paasweekend in Drenthe: 5 ideeën | paasweekend drenthe | Seizoen |
| 82 | Meivakantie in Drenthe met het gezin | meivakantie drenthe | Gezin |
| 83 | TT Assen 2027: overnachten tijdens het MotoGP-weekend | overnachten tt assen | Plaats/Event |
| 84 | Bloesem en jonge lammetjes: lente-activiteiten Drenthe | lente drenthe activiteiten | Seizoen |
| 85 | De mooiste terrassen in en rond Zeijen | terras drenthe | Lokaal |
| 86 | Fietsen langs de hunebedden: de Hunebedenroute | hunebedenroute fietsen | Fietsen |
| 87 | Vakantiehuis Assen: waarom Zeijen de slimste keuze is | vakantiehuis assen | Plaats |
| 88 | Een midweek weg in Drenthe: rustiger en voordeliger | midweek drenthe | Beslissing |

### Maand 12 — Zomeraanloop & evergreen-update (mei)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 89 | Zomervakantie in Drenthe: complete planningsgids | zomervakantie drenthe | Seizoen |
| 90 | De 10 leukste uitjes in Drenthe bij slecht weer | drenthe slecht weer | Activiteit |
| 91 | Wandelen in het Dwingelderveld: routes en hoogtepunten | wandelen dwingelderveld | Wandelen |
| 92 | Vakantiehuis Norg: natuur, rust en bos | vakantiehuis norg | Plaats |
| 93 | Wat maakt Drenthe de groene long van Nederland? | natuur drenthe | Natuur |
| 94 | Zwemmen in Drenthe: de mooiste natuurwateren | zwemmen drenthe | Activiteit |
| 95 | Een romantisch verblijf plannen: checklist | romantisch weekend weg drenthe | Romantiek |
| 96 | Veelgestelde vragen over fietsen & wandelen vanuit de lodge | fietsen wandelen zeijen | Praktisch |

### Bonus-blok — evergreen & seizoens-herhalingen (verspreid invoegen)
| # | Titel | Primair keyword | Cluster |
|---|---|---|---|
| 97 | Update: bloeiende heide Drenthe (jaarlijkse herziening) | paarse heide drenthe | Heide ⭐ |
| 98 | De beste rustige plekken in Drenthe (zonder toeristen) | rustige plekken drenthe | Natuur |
| 99 | Glamping vs. lodge: wat past bij jou? | glamping drenthe | Beslissing |
| 100 | Reviews uitgelicht: wat gasten écht zeggen | ervaringen huis ter huynen | Trust |
| 101 | Drenthe met de auto: bereikbaarheid & EV-laden onderweg | drenthe bereikbaarheid | Praktisch |
| 102 | Cadeaubon voor een natuurweekend: hoe werkt het? | overnachting cadeaubon | Conversie |
| 103 | Najaarsvakantie/herfstvakantie in Drenthe met kinderen | herfstvakantie drenthe | Gezin/Seizoen |
| 104 | Het jaar rond de lodge: 12 maanden Drentse natuur | seizoenen drenthe | Evergreen |

**Productie-aanpak:** batch-schrijven (4–8 artikelen per sessie), publiceer 2×/week via het bestaande Supabase-CMS. Voeg per blog toe: uniek `og:image` (nu gebruiken álle blogs `lodge-heide.jpg`), 2–4 interne links, en `BlogPosting`-schema (al aanwezig). Meet na 90 dagen welke 10 blogs ranken en verdiep/herschrijf die ("content refresh").

---

## FASE 5 — Analytics & Datameetplan

### 5.1 Google Analytics 4
**Huidige situatie:** GTM laadt met Consent Mode v2 default-deny. De client pusht een rijke dataLayer, maar de event-namen zijn **Meta-conventie** (`Lead`, `InitiateCheckout`, `Contact`, `BookingComRedirect`, `Subscribe`, `ViewContent`, `Purchase`). Of er een **GA4-config-tag** én GA4-event-tags in de container staan, is in code niet zichtbaar — dit moet in de GTM-container geverifieerd worden.

| GA4-event | Status | Actie |
|---|---|---|
| `page_view` | Auto (Enhanced Measurement) **mits GA4-config-tag bestaat** | Verifiëren dat GA4-config-tag op alle pagina's vuurt; SPA-routewissels meten (de site pusht al PageView op routewissel). |
| `session_start` | Auto | Verifiëren. |
| `scroll` | Auto (Enhanced Measurement: 90%) | Inschakelen in GA4 data stream; eventueel custom 25/50/75% scroll-trigger in GTM voor blogs. |
| `engaged_session` / engagement | Auto (`user_engagement`) | Geen actie; controleer drempel (10s/2 pageviews/conversie). |
| `outbound_click` | Auto (Enhanced Measurement) **+** custom | Enhanced Measurement vangt generieke outbound. **Extra:** map `BookingComRedirect` + `Contact` (WhatsApp/tel/mail) naar een expliciet `outbound_click`-event met label, zodat OTA-weglek meetbaar is. |
| `generate_lead` | **Ontbreekt in GA4-naamgeving** | GTM-trigger op dataLayer `event = "Lead"` → GA4-event `generate_lead` (params: form, value). Markeer als **sleutelgebeurtenis (conversie)**. |
| `booking_click` | **Ontbreekt** | Nieuw event: vuur bij klik op "Bekijk beschikbare data"/"Reserveer" en bij `InitiateCheckout`. GTM → GA4 `booking_click`. Markeer als conversie. |

**Aanvullend aan te maken GA4 sleutelgebeurtenissen (conversies):**
- `generate_lead` (reserverings-/offerteaanvraag) ← uit `Lead`
- `booking_click` (start boekingsintentie) ← uit `InitiateCheckout`
- `sign_up` / `newsletter_subscribe` ← uit `Subscribe` (pre-opening dé hoofd-KPI)
- `purchase` (met value + currency + transaction_id) ← uit Mollie `Purchase` (server-side via Measurement Protocol of GTM)
- `contact` (whatsapp/phone/email) ← uit `Contact`
- `outbound_ota` (booking.com-weglek, negatieve KPI) ← uit `BookingComRedirect`

**Kernpunt:** er moet een **vertaallaag in GTM** komen die de Meta-genoemde dataLayer-events omzet naar snake_case GA4-events. Zonder die laag meet GA4 alleen de automatische events en mis je elke conversie-KPI.

### 5.2 Google Search Console
**Huidige situatie:** sitemap aanwezig en gelinkt; geen bewijs van property-verificatie of CTR-monitoring.

| Te meten | Actie |
|---|---|
| Impressies | Property (Domain-property: dekt www + non-www) verifiëren; sitemap indienen. |
| CTR | Per query/pagina monitoren; titels/descriptions met lage CTR herschrijven. |
| Gemiddelde positie | Per keyword-cluster volgen (Fase 2); landingspagina's na livegang submitten via URL-inspectie. |
| Indexering | "Pagina's"-rapport: controleer dat landingspagina's geïndexeerd raken; los "Gecrawld – niet geïndexeerd" op met meer/uniekere content + interne links. |

**Direct doen:** Domain-property aanmaken (lost meteen de www/non-www-ambiguïteit in monitoring op), sitemap indienen, koppelen aan GA4 én aan Looker Studio.

### 5.3 Meta Event Manager
**Huidige situatie:** zeer compleet (Pixel + CAPI, dedup, 11 events). Mapping naar de gevraagde standaard-events:

| Gevraagd Meta-event | Status | Bron |
|---|---|---|
| `ViewContent` | ✅ aanwezig | lodge-selectie (BookingCalendar) |
| `Lead` | ✅ aanwezig | reservering succes |
| `Contact` | ✅ aanwezig | WhatsApp/tel/mail klik |
| `InitiateCheckout` | ✅ aanwezig | "Reserveer" submit |
| `Purchase` | ✅ aanwezig | Mollie webhook `paid` (server, niet consent-gated → legitiem) |

**Wat ontbreekt/te verbeteren:**
- **Match Quality verhogen** (doel Purchase ≥8/10, Lead ≥7/10): telefoonnummer-veld toevoegen aan boekingsform, IP/UA meesturen bij Purchase, city/postal afleiden — staat al benoemd in `META_TRACKING.md`.
- **`Schedule`/`Subscribe`** als custom: nieuwsbrief-inschrijving is pre-opening dé conversie; nu `Subscribe` (custom) — overweeg dit als primaire optimalisatie-event voor campagnes.
- **Audiences** pas opbouwen vanaf ~50 Purchase-events (plan staat klaar).

### 5.4 Server-side robuustheid
Aanbevolen: server-side GTM (sGTM) is al voorbereid (`NEXT_PUBLIC_SGTM_URL`). Activeer dit later voor cookieloze/ad-blocker-bestendige meting van GA4 én Meta vanaf één endpoint.

---

## FASE 6 — Managementdashboard (Looker Studio)

**Doel:** één maandrapport dat de eigenaar in 2 minuten laat zien of de strategie werkt: meer organisch verkeer → meer directe boekingen → minder OTA-afhankelijkheid.

### 6.1 KPI's en bronnen
| KPI | Bron | Visualisatie |
|---|---|---|
| Organisch verkeer (sessies/gebruikers) | GA4 (channel = Organic Search) | Tijdlijn + MoM% |
| Directe boekingen (aantal + omzet) | GA4 `purchase` / Supabase `bookings` | Scorecard + tabel |
| Bron van boekingen (direct vs. OTA vs. ads) | GA4 channel + `outbound_ota` | Donut/staaf |
| Top landingspagina's | GA4 (landing page × organic) | Tabel met sessies + conversies |
| Top zoekwoorden | Search Console | Tabel (query, klikken, impressies, CTR, positie) |
| Conversieratio | GA4 (`generate_lead`/`booking_click`/`purchase` ÷ sessies) | Scorecard |
| Kosten per boeking (CPA) | Meta Ads + Google Ads ÷ boekingen | Scorecard (na ads-start) |
| Omzet per kanaal | GA4 + Supabase | Staafdiagram |

### 6.2 Bouwwijze
1. **Connectoren koppelen:** GA4-connector, Search Console-connector (URL-impression + Site-impression), en — voor harde boekingsdata — Supabase via BigQuery of een Google Sheet-export (Looker leest Sheets native). Optioneel Meta/Google Ads-connectoren.
2. **Eén databron als basis + blends:** blend GA4 (gedrag) met Search Console (vindbaarheid) op datum; blend GA4 met de boekingsbron (Sheet/BigQuery) voor omzet/CPA.
3. **Paginastructuur (4 pagina's):**
   - *Overzicht:* scorecards (organisch verkeer, leads, boekingen, omzet, % direct vs OTA) + MoM-trend.
   - *SEO:* Search Console-tabellen (queries, pagina's, CTR, positie) + indexeringsstatus.
   - *Conversie:* funnel sessie → `booking_click` → `generate_lead` → `purchase`, per landingspagina.
   - *Kanalen & kosten:* omzet per kanaal, CPA, ROAS (na ads).
4. **Filters:** datumbereik (default: deze maand vs vorige), apparaat, taal (nl/de), land (NL/DE).
5. **Automatisering:** maandelijkse PDF-mail via Looker Studio schedule naar de eigenaar; data-versheid op 12u.
6. **Doelregels (annotaties):** markeer livegang landingspagina's en campagnes, zodat pieken verklaarbaar zijn.

> Quick start: begin met GA4 + Search Console (beide gratis, direct te koppelen). Voeg boekings-/omzetdata toe zodra de directe-boekingsstroom draait. Eén goede template > vijf half-afgemaakte rapporten.

---

## FASE 7 — Conversieoptimalisatie (CRO) — 25+ voorstellen

Geanalyseerd: CTA's, boekingsknoppen, contactmomenten, mobiele ervaring, vertrouwen, reviews, fotografie, USP's (op basis van `page.tsx`, `omgeving`, `faq`, `blog`).

### CTA's & boekingsknoppen
1. **Plak een sticky mobiele CTA-balk** onderaan ("Bekijk data" + WhatsApp-icoon) die meescrollt — nu verdwijnt de hero-CTA volledig bij scrollen.
2. **Voeg een telefoon-/WhatsApp-knop toe in een vaste header.** Er is nu géén persistente navigatie/CTA bovenaan; contact zit alleen in de footer.
3. **Maak de booking-anchor-CTA's specifieker:** "Bekijk beschikbare data" → "Check beschikbaarheid & prijs" (prijs-transparantie verhoogt klikintentie).
4. **Toon vanaf-prijs bij de lodgekaarten** ("vanaf €x per nacht"). Nu staat er nergens een prijs → bezoekers haken af of gaan naar OTA's om prijs te checken.
5. **Reduceer keuzestress:** de twee lodges hebben identieke CTA's; voeg een "Welke lodge past bij mij?"-hulp toe (link naar vergelijkpagina #40/landing).
6. **Eén primair conversiedoel per scherm:** pre-opening is dat nieuwsbrief; maak de nieuwsbrief-CTA visueel dominanter dan secundaire links.
7. **Voeg urgentie/scarcity eerlijk toe bij de kalender** ("nog 2 weekenden vrij in augustus") op basis van echte beschikbaarheid — niet nep.

### Contactmomenten
8. **WhatsApp als primair laagdrempelig kanaal** prominenter (drijvende knop), want de doelgroep boekt graag persoonlijk; sluit aan op "wij bevestigen binnen 24u persoonlijk".
9. **Voeg een terugbel-/vraag-formulier toe** bij twijfelaars ("Vraag vrijblijvend de beschikbaarheid op").
10. **Exit-intent of scroll-trigger nieuwsbrief-prompt** op blogs en landingspagina's (pre-opening lead-capture).

### Mobiele ervaring
11. **Verklein de mobiele hero** (min-height 680px is veel) zodat de eerste USP's/CTA sneller in beeld komen "above the fold".
12. **Reserveer vaste hoogte voor de reviews-sectie** (client-fetch) om layout shift op mobiel te voorkomen.
13. **Vergroot tikdoelen** van secundaire tekstlinks (onderstreepte links zijn klein op mobiel).

### Vertrouwen (trust)
14. **Vervang/markeer de nep-fallbackreviews.** `FALLBACK_REVIEWS` ("Sarah & Mark", "Petra", "Jan") tonen als er nog geen Google-reviews zijn = misleidend en risicovol (en ondergraaft vertrouwen als het uitkomt). Toon liever "binnenkort de eerste ervaringen" of echte pre-opening-quotes met toestemming.
15. **Onderbouw `starRating: 5` in schema** of verwijder het — een zelf-toegekende 5-sterren zonder bron kan als spam/onbetrouwbaar gelden.
16. **Voeg vertrouwenssignalen toe:** KvK (✓ aanwezig), maar ook: veilig betalen (Mollie/iDEAL-logo), annuleringsvoorwaarden-link bij de boeking, "persoonlijk beheerd door de eigenaar".
17. **Toon een gezicht + naam van de gastheer** (Arjan) met korte intro — persoonlijk vertrouwen verkoopt luxe verblijven.
18. **"Direct boeken = beste prijs"-belofte** expliciet maken (geen OTA-toeslag) → stuurt boekers weg van Booking.com.
19. **Voeg echte beschikbaarheids-/bevestigingsbelofte toe** ("antwoord binnen 24u", al aanwezig) consequent bij élke CTA.

### Reviews
20. **Activeer Google Business Profile + reviewverzameling** (zie Fase 1.13) en toon `aggregateRating` zodra er ≥5 echte reviews zijn — sociale bewijskracht + sterren in SERP.
21. **Automatiseer review-verzoek** 2 weken na vertrek (follow-up-mail bestaat al, todo #56/23) met directe Google-reviewlink.
22. **Toon reviews dichter bij de boekingsknop** (nu staan reviews ruim boven de kalender) — bewijs op het beslismoment.

### Fotografie
23. **Voeg interieurfoto's toe.** Er zijn alleen exterieur/sfeerbeelden; luxe-boekers willen het interieur, de hottub, de badkamer en het bed zien. (Todo's bevestigen dat foto's nog ontbreken.) Dit is waarschijnlijk de #1 conversieblokker voor een luxe-positionering.
24. **Geef elke landingspagina en blog een eigen, relevant beeld** (nu delen alle blogs `lodge-heide.jpg` als OG-image → zwakke social CTR).
25. **Comprimeer en standaardiseer beeld** (zie 1.10) — snellere laadtijd = hogere conversie, vooral mobiel.

### USP's
26. **Maak USP's concreet en meetbaar:** "0 min wandelen vanuit de deur", "privé hottub 24/7 op 38°C", "EV-laden gratis" — de cijferstrip doet dit goed; trek die taal door naar de CTA-omgeving.
27. **Voeg een vergelijkingsblok "lodge vs. hotel vs. OTA" toe** dat de directe-boeking-USP visueel maakt (privacy, prijs, persoonlijk contact).
28. **Highlight het "voor wie / niet voor wie"** (eerlijk verwachtingsmanagement) — verhoogt kwaliteit van leads en vermindert annuleringen.

---

## EINDRESULTAAT — Uitvoerbaar stappenplan (12 maanden)

Gerangschikt en gescoord. **V** = impact op verkeer, **B** = impact op directe boekingen, **I** = inspanning (laag = makkelijk). Schaal 1–5.

### 🟢 Quick wins (0–30 dagen)
| # | Actie | V | B | I | Prioriteit |
|---|---|---|---|---|---|
| Q1 | **Google Business Profile** aanmaken (openingsdatum, foto's, NAP) | 4 | 5 | 1 | **#1** |
| Q2 ✅ | Homepage-**H1** keyword-rijk gemaakt (NL); DE-H1 was al goed | 4 | 2 | 1 | **Gedaan** |
| Q3 ✅ | Eigen `metadata` /omgeving + /faq | 3 | 1 | 1 | **Al aanwezig** |
| Q4 ✅ | **FAQPage-schema** /faq + /omgeving | 3 | 2 | 1 | **Al aanwezig** |
| Q5 ✅ | **www/non-www-canonical** geconsolideerd in blog-bestanden (GSC Domain-property nog extern) | 3 | 1 | 1 | **Code gedaan** |
| Q6 ⏳ | **GTM→GA4-vertaallaag**: `generate_lead`, `booking_click`, `outbound_ota`, `newsletter_subscribe` als conversies | 2 | 4 | 2 | Hoog |
| Q7 ✅ | **Nep-reviews** verwijderd (NL+DE) + `starRating` verwijderd | 1 | 3 | 1 | **Gedaan** |
| Q8 ⏳ | **Sticky mobiele CTA** + WhatsApp-knop + vanaf-prijs op lodgekaarten (vereist prijsdata) | 2 | 4 | 2 | Hoog |
| Q9 🟡 | Duplicaat-image verwijderd ✅; bron-images comprimeren nog te doen | 2 | 1 | 1 | Deels |
| Q10 | Aanmelden VVV Drenthe, Visit Drenthe, Tripadvisor, ANWB (citaties/backlinks) | 3 | 3 | 2 | Hoog |
| Q11 | **Eerste 8 blogs** publiceren (hottub/luxe/romantisch + heide-evergreen) | 4 | 2 | 3 | Hoog |

### 🟠 Middellange termijn (30–90 dagen)
| # | Actie | V | B | I | Prioriteit |
|---|---|---|---|---|---|
| M1 | **Top-6 commerciële landingspagina's** bouwen (#1–6 Fase 3) | 5 | 5 | 4 | **#1** |
| M2 | **Plaats-landingspagina's** Assen + Norg + Veenhuizen (#7–9) | 4 | 4 | 3 | Hoog |
| M3 | **Activiteit-hubs** /fietsen-in-drenthe + /wandelroutes-drenthe (#11–12) | 5 | 2 | 3 | Hoog |
| M4 | **Interne-link-architectuur**: blogs → landings → reserveren (hub-and-spoke) | 4 | 3 | 2 | Hoog |
| M5 | **Looker Studio-dashboard** (GA4 + Search Console) live | 1 | 2 | 2 | Hoog |
| M6 | **Contentritme 2 blogs/week** doorzetten (week 5–13) | 4 | 2 | 3 | Hoog |
| M7 | **Interieurfotografie** laten maken + per pagina eigen beeld/OG | 2 | 5 | 3 | Hoog |
| M8 | Meta **Match Quality** verbeteren (telefoonveld, IP/UA bij Purchase) | 1 | 3 | 2 | Midden |
| M9 | Lodge-detailpagina's met **Offer-schema** + prijsindicatie | 3 | 4 | 3 | Hoog |
| M10 | CWV verbeteren: statische secties → Server Components, reviews SSR | 3 | 2 | 4 | Midden |

### 🔵 Lange termijn (3–12 maanden)
| # | Actie | V | B | I | Prioriteit |
|---|---|---|---|---|---|
| L1 | Resterende landingspagina's (#13–22) + Duitse set (#23–25) | 4 | 4 | 4 | Hoog |
| L2 | **104-blogplan** volledig uitrollen + 90-dagen content-refresh van toppers | 5 | 3 | 5 | Hoog |
| L3 | **Reviewvliegwiel**: automatische verzoeken, `aggregateRating` live | 2 | 4 | 2 | Hoog |
| L4 | **Backlink-/PR-strategie**: reisbloggers, RTV Drenthe, wandel-/fietssites, Natuurhuisje-listing | 4 | 3 | 4 | Hoog |
| L5 | **sGTM** activeren (cookieloze, ad-block-bestendige meting) | 1 | 2 | 4 | Midden |
| L6 | **Betaald verkeer gericht inzetten** (Meta/Google) op bewezen converterende keywords, met CPA/ROAS in dashboard | 3 | 4 | 3 | Midden |
| L7 | **Duitse markt** verdiepen (content + GBP-categorieën + DE-campagnes) | 3 | 3 | 4 | Midden |
| L8 | Kwartaal-SEO-audit + herprioritering op basis van Search Console-data | 3 | 3 | 2 | Hoog |

### Verwachte uitkomst na 12 maanden
- **Verkeer:** van vrijwel uitsluitend merk-/direct-verkeer naar een gestage organische stroom via 20+ landingspagina's en 50–100 geïndexeerde blogs; eerste-pagina-posities op long-tail hottub/luxe/plaats-termen en op niche-natuurtermen (zeijerstrubben, ballooerveld, norg).
- **Boekingen:** directe boekingen als grootste kanaal, gevoed door GBP + organisch + nieuwsbrief; meetbare daling van OTA-afhankelijkheid via de `outbound_ota`-KPI.
- **Meetbaarheid:** volledige GA4-conversiemeting + maandelijks Looker Studio-rapport → continue optimalisatie op data i.p.v. gevoel.

---

### Bijlage — Belangrijkste code-niveau bevindingen (voor de developer)
| Bestand | Bevinding | Fix |
|---|---|---|
| `src/app/page.tsx` | H1 = alleen "Huis ter Huynen"; nep `FALLBACK_REVIEWS`; client-fetch reviews → CLS-risico; geen sticky/headerCTA; geen prijs | H1 herschrijven; fallback vervangen; reviews SSR + min-hoogte; sticky CTA; vanaf-prijs |
| `src/app/omgeving/page.tsx` | Goede content maar FAQ zonder `FAQPage`-schema; geen `BreadcrumbList`-JSON-LD; geen eigen `metadata` | Schema + metadata toevoegen |
| `src/app/faq/page.tsx` | 10 sterke Q&A's zonder `FAQPage`-schema; geen eigen `metadata` | FAQPage-schema + metadata |
| `src/app/layout.tsx` | `starRating:5` zelf-toegekend; geen `aggregateRating` | Onderbouwen/verwijderen; aggregateRating na echte reviews |
| `src/app/blog/page.tsx` + `blog/[slug]/page.tsx` | Canonical/JSON-LD wisselen www ↔ non-www; alle blogs delen `lodge-heide.jpg` als OG | Eén `SITE_URL`; per-post OG-image-veld |
| `public/` | `lodge-eik.jpg` 3,5MB / `lodge-heide.jpg` 3,3MB; `rent-a-bike.jpg` == `rent_a_bike.jpg` | Comprimeren <400KB; duplicaat verwijderen |
| GTM-container (extern) | dataLayer is Meta-genoemd; GA4-conversie-tags onbekend | GA4-config + event-mapping (snake_case) |
| `src/app/sitemap.ts` | Mist toekomstige landingspagina's | Toevoegen bij livegang |

> **Wil je dat ik de quick wins (Q2–Q5, Q7) direct in code doorvoer?** Dat zijn kleine, veilige aanpassingen (H1, metadata op /omgeving + /faq, FAQPage-schema, canonical-consolidatie, fallbackreviews). Geef het aan, dan implementeer ik ze op deze branch met aparte commits.

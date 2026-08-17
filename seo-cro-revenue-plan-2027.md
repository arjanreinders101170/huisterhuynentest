# Huis ter Huynen — SEO, CRO & Revenue Plan 2027

**Doel:** twee lodges (De Heide, De Eik) structureel hoog bezetten in 2027, tegen een winstgevende gemiddelde nachtprijs, met een groeiend aandeel directe organische boekingen.

**Opgesteld:** augustus 2026
**Databronnen:** Google Search Console export "Zoekopdrachten" (221 queries) + "Pagina's" (35 URL's), de codebase van huisterhuynen.nl (bron voor alle feitelijke accommodatie-eigenschappen), en live Google-SERP's (augustus 2026).

---

## Bronverantwoording & databeperkingen

Lees dit eerst. Het bepaalt hoe hard elke conclusie hieronder is.

| Label | Betekenis | Waar gebruikt |
|---|---|---|
| **[GSC]** | First-party Google Search Console data uit de twee aangeleverde exports. Hard. | Alle impressie-, klik-, CTR- en positiecijfers |
| **[CODE]** | Afgeleid uit de repository van de website zelf (`src/`). Hard — dit ís de site. | Alle uitspraken over titles, H1's, CTA's, schema, funnel |
| **[SERP]** | Live Google-resultaten, opgehaald augustus 2026 via zoekopdrachten. Momentopname. | Concurrentiebenchmark |
| **[ANALYSE]** | Mijn eigen berekening op basis van [GSC]. Reproduceerbaar. | Clustering, opportunity score, positiebuckets |
| **[AANNAME]** | Schatting of branchebenchmark. Expliciet gemarkeerd, altijd met bandbreedte. | Funnelconversies, revenuemodel, forecast |

**Vier beperkingen die u moet kennen:**

1. **De meetperiode van de GSC-export is onbekend.** Er staat geen datumbereik in de bestanden. Alle "per maand"-cijfers in dit rapport gaan uit van een **periode van 3 maanden** en zijn daarom gemarkeerd als [AANNAME]. *Benodigde input: exporteer opnieuw met zichtbaar datumbereik.* Dit verandert de forecast met een factor 3 als het 1 maand blijkt te zijn.
2. **De twee datasets sluiten niet op elkaar aan.** Queries: 3.861 impressies / 8 klikken. Pagina's: 7.288 impressies / 85 klikken. Dat is normaal — Google anonimiseert zeldzame zoekopdrachten weg uit de query-export — maar het betekent dat de query-lijst **ongeveer de helft** van uw werkelijke vertoningen dekt. Conclusies over totalen komen daarom uit de pagina-export, conclusies over zoekgedrag uit de query-export.
3. **Geen externe zoekvolumes.** Ik heb geen betrouwbare Ahrefs/Semrush-data. Er staat **geen enkel verzonnen zoekvolume** in dit rapport. Waar ik "vraag" zeg, bedoel ik GSC-impressies als first-party proxy.
4. **De concurrentiebenchmark is SERP-gebaseerd, niet on-page.** De omgeving waarin dit rapport is gemaakt blokkeert het ophalen van externe pagina's. Ik kan dus wel hard vaststellen *wie* rankt, met welke URL, welk paginatype en welke positionering — maar ik heb de concurrentpagina's niet regel voor regel kunnen uitmeten (exacte woordaantallen, H2-structuur, aantal foto's). Waar ik daarover iets zeg, staat het als hypothese. Ik heb dat niet ingevuld met plausibel klinkende verzinsels.

---

# Executive Summary

**Wat er aan de hand is.**

Huis ter Huynen heeft in de gemeten periode 7.288 vertoningen en 85 klikken opgehaald [GSC]. Van de 8 klikken in de query-dataset komen er **8 uit merknaam-zoekopdrachten** — "huis ter huynen", "huis ter zeijen", "huynen" [ANALYSE]. Dat betekent: **nul niet-merkgebonden klikken.** De site trekt op dit moment geen enkele nieuwe gast aan via Google.

De oorzaak is niet subtiel. **92,3% van alle vertoningen valt op positie 31 of lager** [ANALYSE]. Slechts 2,3% van de vertoningen zit in de top 10. De gemiddelde gewogen positie is 49,5. Google kent de site, toont hem regelmatig — op pagina 4, 5 en 6, waar niemand kijkt.

Dit is de belangrijkste conclusie van het hele rapport, en hij spreekt de opdracht op één punt tegen: **u heeft geen CTR-probleem. U heeft een ranking-probleem.** Van de 35 pagina's zijn er precies drie waar een lage CTR echt aan de snippet ligt. Bij alle andere is de CTR laag omdat de positie te laag is om überhaupt geklikt te worden. Titeloptimalisatie is in dit rapport daarom bewust naar achteren geschoven — het is werk voor stap twee, niet stap één.

**Waar de grootste kans ligt.**

Drie observaties, alle drie direct te verzilveren:

1. **Uw commerciële pagina's presteren 13× slechter dan uw blogs.** De commerciële landingspagina's halen 5.111 vertoningen en 13 klikken (CTR 0,25%). De blogs en informatiepagina's halen 2.177 vertoningen en 72 klikken (CTR 3,31%) [ANALYSE]. Uw geldpagina's krijgen 70% van de zichtbaarheid en leveren 15% van het verkeer. Ze staan te laag en ze onderscheiden zich niet.

2. **U schrijft "hottub", uw markt zoekt "jacuzzi".** Zoekopdrachten met "jacuzzi": 754 vertoningen. Met "hottub": 249 [ANALYSE]. Uw URL, uw title, uw H1, uw navigatielabel en uw complete paginatekst zeggen consequent "hottub" [CODE]. U mist daarmee de grootste commerciële cluster die u heeft (26% van alle vertoningen). Hetzelfde patroon bij "huisje" (643 vertoningen) versus uw eigen woord "vakantiehuis" (549) — geen enkele pagina target "huisje".

3. **Eén zoekterm staat al binnen bereik.** "romantisch weekendje weg drenthe": 95 vertoningen, positie 26,4 [GSC]. Dat is de enige commerciële term met echt volume die dicht genoeg bij pagina 1 staat om er dit jaar te komen. De bijbehorende pagina heeft 1.305 vertoningen en nul klikken. Dit is de hoogste prioriteit op de hele lijst.

**Wat we onmiddellijk moeten doen.**

De vier P0-acties, uit te voeren in de komende twee weken:

1. **Herbouw `/wellness-vakantie-drenthe`** — 1.526 vertoningen, positie 62,6, nul klikken. Grootste pagina van de site, slechtste positie. Retarget naar "wellness huisje drenthe".
2. **Voeg "jacuzzi" toe** aan title, H1, intro en FAQ van `/vakantiehuis-met-hottub-drenthe` (URL laten staan). Kost een uur, raakt 754 vertoningen aan vraag.
3. **Duw `/romantisch-weekend-weg-drenthe` van 26 naar de top 10** — de enige realistische pagina-1-kans binnen 6 maanden.
4. **Repareer de conversiepaden.** Elke landingspagina-CTA springt nu naar `/#reserveren` op de homepage [CODE] — de bezoeker verliest zijn context (wellness, romantiek, hottub) én belandt in een *aanvraag*formulier zonder prijszekerheid. Dat is de duurste lek in de funnel en het staat volledig los van SEO.

**Eén verwachting die bijgesteld moet worden.** Het doel van 30.000 vertoningen per maand is haalbaar, maar het is 3 à 4× méér dan u nodig heeft om twee lodges vol te krijgen. De rekensom staat in deel 10. Sturen op 30.000 vertoningen leidt u naar informatieve content die geen boekingen oplevert. Het juiste doel is ~8.000–10.000 *commerciële* vertoningen per maand bij een CTR van 3,5%. Zie deel 10 voor de onderbouwing en een beter KPI-voorstel.

---

# 1. SEO Audit

## 1.1 Techniek

Het technische fundament is beter dan gemiddeld voor een accommodatiesite. Er is een dynamische sitemap met hreflang-koppelingen, correcte canonicals, LodgingBusiness-schema met `containsPlace` per lodge, FAQPage- en BreadcrumbList-schema op alle landingspagina's, en per-pagina OG-images [CODE]. Dat is geen doorsnee-implementatie; die complimenten zijn verdiend.

De problemen zitten elders.

| # | Bevinding | Bewijs | Impact | Actie |
|---|---|---|---|---|
| T1 | **Geen `Offer`/prijsdata in schema.** `LodgingBusiness` heeft alleen `priceRange: "€€€"`. De echte vanafprijs (€165) staat wél in de paginatekst, maar niet machineleesbaar. | [CODE] `layout.tsx`, `PRICE_FROM_EUR` | Hoog — blokkeert prijs-rich-results en Google's hotel/vakantiehuis-surfaces | Voeg `makesOffer` met `priceSpecification` (€165, EUR, per nacht) toe aan de LodgingBusiness, en een `Offer` per `Accommodation` |
| T2 | **Geen `aggregateRating` / `Review`-schema.** | [CODE] | Hoog — sterren in de SERP zijn de sterkste CTR-hefboom die er is | Zodra er ≥5 echte reviews zijn: `aggregateRating` toevoegen. Nooit eerder, nooit verzonnen |
| T3 | **Eén blog-URL is een volledige alinea.** `/blog/fietsen-in-drenthe-is-misschien-wel-de-mooiste-manier-om-de-provincie-echt-te-beleven-uitgestrekte-heidevelden-eeuwenoude-bossen-kronkelende-beekdalen-karakteristieke-brinkdorpen-en-kilometers-autoluwe-fietspaden-maken-drenthe-tot-een-waar-paradijs-voor-fietsers` — 28 vertoningen, positie 30,1 | [GSC] | Middel — onklikbaar in de SERP, wordt afgekapt, oogt als spam | 301 naar `/blog/fietsen-in-drenthe`; slug-lengte begrenzen bij het aanmaken |
| T4 | **`/de` staat op positie 32,6 met 192 vertoningen en de Duitse rechtspagina's worden geïndexeerd** (`/impressum` 28 vertoningen, `/datenschutz` 21, `/agb` 14) | [GSC] | Laag-middel — rechtspagina's kannibaliseren geen omzet maar verdunnen wel de crawl | `/impressum`, `/datenschutz`, `/agb`, `/privacy`, `/terms` op `noindex, follow`. Ze staan nu wel in `robots.txt`-vrije ruimte en in de sitemap |
| T5 | **`/welkom` staat in de sitemap met priority 0,4** — 13 vertoningen, positie 4,6, 1 klik. Dit is een interne/gast-pagina | [GSC] [CODE] `sitemap.ts` | Laag | Uit de sitemap, `noindex` |
| T6 | **Geen `hreflang` op paginaniveau, alleen in de sitemap.** De 4 NL↔DE-paren zijn wel gekoppeld in `sitemap.ts`, maar de landingspagina's zelf hebben geen `alternates.languages` in hun metadata | [CODE] `[slug]/page.tsx` vs `sitemap.ts` | Middel voor de DE-markt | `alternates.languages` toevoegen in `generateMetadata` van `[slug]` en `de/[slug]` |
| T7 | **`revalidate = 60` op alle landingspagina's** — elke minuut hervalidatie voor content die maandelijks wijzigt | [CODE] | Laag (kosten, niet SEO) | Naar 3600 |

**Wat ik níét als probleem zie**, ondanks dat het vaak geadviseerd wordt: de pagina's zijn server-rendered zonder hydratie [CODE], de afbeeldingen gaan door `next/image` met `priority` op de hero, en er is geen JS-afhankelijke content. Core Web Vitals zijn hier vrijwel zeker niet uw bottleneck. Besteed daar geen budget aan tot de rankings bewegen.

## 1.2 Content

**Data:** 18 landingspagina's + 12 blogs voor 2 verhuureenheden [CODE] [GSC].
**Observatie:** de site heeft negen keer zoveel commerciële pagina's als producten. Alle landingspagina's delen dezelfde template, dezelfde vier-tot-vijf sectiestructuur, dezelfde FAQ-opzet, dezelfde twee CTA's en grotendeels dezelfde feiten (twee lodges, vier personen, hottub, 20 minuten van Assen) [CODE].
**Hypothese:** Google ziet een set pagina's die elkaar in intentie en inhoud sterk overlappen, en kan geen enkele daarvan als *de* autoriteit aanwijzen. Dat verklaart waarom vrijwel alle commerciële pagina's rond positie 49–62 blijven hangen in plaats van dat er één doorbreekt.
**Actie:** consolideren, niet uitbreiden. Zie deel 4 en 11.
**KPI:** één pagina per intentiecluster binnen de top 20 binnen 6 maanden, in plaats van vijf pagina's op positie 50.

Dit is mijn belangrijkste inhoudelijke tegenspraak bij de opdracht: **het probleem is niet dat er landingspagina's ontbreken. Het probleem is dat er te veel zijn voor de hoeveelheid autoriteit die de site heeft.** De opdracht vraagt om maximaal 8 nieuwe of te optimaliseren pagina's; mijn advies is 8 pagina's te *verbeteren of samen te voegen* en er netto slechts **twee** bij te bouwen (de twee lodgepagina's).

## 1.3 Keywords

Volledig uitgewerkt in deel 2. De kern in drie regels:

- **Vraagverdeling** [ANALYSE]: Hottub/Jacuzzi 26,0% · Weekendje weg 18,6% · Wellness/Sauna 14,3% · Luxe/Lodge 9,4% · Romantiek 6,9% · Locatie 5,1%.
- **Woordkeuze-mismatch**: jacuzzi (754) ≫ hottub (249); huisje (643) > vakantiehuis (549).
- **Ruis**: 475 vertoningen komen van "hotel"-zoekopdrachten (25 queries) [ANALYSE]. Huis ter Huynen is geen hotel. Deze vertoningen zijn grotendeels onwinbaar én zouden bij een klik slecht converteren. Niet op sturen.

## 1.4 Interne links

**Data:** elke landingspagina toont in de footer een blok met 13 andere landingspagina's, plus een "Ontdek ook"-blok met 4 handmatig gekozen links [CODE] `LandingTemplate.tsx`, `LANDING_NAV`.
**Observatie:** de interne linkstructuur is **plat**. Elke pagina linkt naar bijna elke andere pagina, met een generiek label als ankertekst ("Luxe lodge Drenthe"). Er is geen hiërarchie: `/hunebedden-drenthe` — een informatieve pagina — geeft evenveel interne link-equity door als de commerciële hottub-pagina, en krijgt er evenveel terug.
**Hypothese:** door alles gelijk te behandelen, concentreert de site geen autoriteit op de pagina's die geld moeten opleveren. Dit is een tweede, onafhankelijke verklaring voor de gelijkmatige positie-49-verdeling.
**Actie:** hub-and-spoke invoeren met asymmetrische links — zie deel 9 voor de concrete matrix.
**KPI:** de drie geldpagina's ontvangen elk ≥8 contextuele inkomende links met beschrijvende ankertekst binnen 60 dagen.

De grootste gemiste kans zit hier: **de best presterende pagina's van de site zijn informatief en linken niet gericht door.** `/hunebedden-drenthe` (568 vertoningen, positie 13,0), `/heide-drenthe` (261 vertoningen, positie 9,7) en de blogs rond kanovaren en fietsen (positie 8–10) zijn de enige pagina's met echte zichtbaarheid [GSC]. Die autoriteit lekt nu weg via een generiek footerblok in plaats van via een gerichte contextuele link naar de wellness- en jacuzzipagina.

## 1.5 Local SEO

**Data:** "overnachten in veenhuizen" staat op positie 15,2 met 40 vertoningen; "veenhuizen overnachten" op 24,1; "natuurhuisje zeijen" op 12,0; "vakantiehuis assen" op 43,5; de pagina `/vakantiehuis-assen` op 23,4 met 333 vertoningen en 6 klikken (CTR 1,8% — de op één na beste commerciële pagina) [GSC].
**Observatie:** de locatiecluster heeft de **hoogste winbaarheid van alle clusters** (0,8 in mijn model) en presteert nu al relatief het best, ondanks de laagste aandacht. Er zijn simpelweg weinig accommodaties in Zeijen, Norg en rond Veenhuizen die om deze termen vechten.
**Hypothese:** dit is de enige cluster waar Huis ter Huynen op korte termijn structureel top-5 kan staan, omdat het geen concurrentie is tegen portals maar tegen een handvol lokale aanbieders.
**Actie:** zie deel 7 — Google Business Profile is hier de hefboom, niet de website.
**KPI:** top-5 op "vakantiehuis assen", "overnachten veenhuizen" en "natuurhuisje zeijen" binnen 90 dagen.

**Google Business Profile:** ik kan vanuit deze omgeving niet verifiëren of er een GBP bestaat en hoe die is ingericht. *Benodigde input.* Als er geen geverifieerd profiel is, is dat op dit moment waarschijnlijk de **hoogste ROI-actie van het hele rapport** — hoger dan welke pagina-optimalisatie ook. Zie 7.1.

## 1.6 CRO

Uitgebreid in deel 8. De twee structurele bevindingen:

**CRO-1 — De landingspagina-CTA gooit de bezoeker uit zijn context.**
Alle CTA's op alle landingspagina's linken naar `/#reserveren` [CODE] `LandingTemplate.tsx`. Iemand die binnenkomt op "romantisch weekendje weg drenthe" landt na één klik op een generieke homepage-sectie zonder enige verwijzing naar romantiek, zonder voorgeselecteerde lodge en zonder voorgeselecteerde data. Elke wissel van pagina in een boekingsfunnel kost bezoekers; deze wissel kost bovendien de complete emotionele opbouw van de landingspagina.

**CRO-2 — De site boekt niet, hij vraagt aan.**
De funnel eindigt in "Geef uw gewenste data door, dan reserveren wij die persoonlijk voor u. U ontvangt binnen 24 uur een aanbod op maat" en "De definitieve prijs wordt door ons bevestigd na je aanvraag" [CODE] `page.tsx`, `BookingCalendar.tsx`. De bezoeker verlaat de site **zonder prijs en zonder bevestiging**, met een wachttijd van 24 uur.

Dat is een bewuste keuze met een echte opbrengst (persoonlijk contact, hogere marge, geen OTA-commissie) en ik adviseer niet om hem zomaar overboord te gooien. Maar het is wel de duurste stap in uw funnel: iedere concurrent in de SERP-benchmark biedt directe bevestiging. Zie 8.4 voor hoe u het persoonlijke karakter behoudt en tóch de drempel verlaagt.

---

# 2. Keyword Opportunity Map

## 2.1 Totaalbeeld

| Metric | Waarde | Bron |
|---|---|---|
| Zoekopdrachten | 221 | [GSC] |
| Vertoningen (query-export) | 3.861 | [GSC] |
| Klikken (query-export) | 8 | [GSC] |
| CTR | 0,21% | [ANALYSE] |
| Gewogen gemiddelde positie | 49,5 | [ANALYSE] |
| Niet-merkgebonden klikken | **0** | [ANALYSE] |

## 2.2 Positieverdeling — de kernbevinding

| Positie | Queries | Vertoningen | Aandeel | Klikken |
|---|---|---|---|---|
| 1–10 | 16 | 90 | 2,3% | 8 |
| 11–20 | 15 | 82 | 2,1% | 0 |
| 21–30 | 9 | 127 | 3,3% | 0 |
| 31–50 | 63 | 1.343 | 34,8% | 0 |
| **50+** | **118** | **2.219** | **57,5%** | **0** |

[ANALYSE]

Lees deze tabel goed. **57,5% van uw zichtbaarheid staat voorbij positie 50.** Nog eens 34,8% staat tussen 31 en 50. Alle acht klikken komen uit de top 10, en die top 10 is bijna volledig merknaam.

Dit is waarom ik de opdracht op het punt van CTR-optimalisatie tegenspreek: bij positie 50 is de verwachte CTR 0,0–0,1%. Een perfecte title verandert daar niets aan, omdat niemand pagina 5 bekijkt. Titelwerk levert pas rendement op vanaf ongeveer positie 15.

## 2.3 Clusters

| Cluster | Queries | Vertoningen | Aandeel | Gew. positie | Boekingsintentie | Winbaarheid |
|---|---|---|---|---|---|---|
| Hottub / Jacuzzi | 21 | 1.003 | 26,0% | 51,8 | 5/5 | 0,45 |
| Weekendje weg | 7 | 718 | 18,6% | 49,7 | 3/5 | **0,15** |
| Wellness / Sauna | 37 | 554 | 14,3% | 51,0 | 4/5 | 0,45 |
| Luxe / Lodge / Boutique | 10 | 364 | 9,4% | 52,2 | 4/5 | 0,40 |
| Romantiek / Koppels | 7 | 266 | 6,9% | **41,9** | 5/5 | 0,50 |
| Locatie (Assen/Norg/Veenhuizen/Zeijen) | 25 | 198 | 5,1% | 44,6 | 4/5 | **0,80** |
| Bijzonder overnachten | 7 | 180 | 4,7% | 62,1 | 4/5 | 0,30 |
| Natuur & activiteiten | 21 | 136 | 3,5% | 48,0 | 1/5 | 0,65 |
| Concurrent / navigational | 34 | 134 | 3,5% | 45,0 | 2/5 | 0,10 |
| Hunebedden | 15 | 88 | 2,3% | 33,6 | 1/5 | 0,60 |
| Hond | 14 | 74 | 1,9% | 72,9 | 4/5 | 0,50 |
| Merk | 10 | 69 | 1,8% | **15,3** | 5/5 | 1,00 |
| Duitsland (DE) | 5 | 50 | 1,3% | 51,1 | 4/5 | 0,75 |
| Heide | 7 | 26 | 0,7% | **20,1** | 2/5 | 0,70 |

[ANALYSE] — winbaarheid geschat op basis van de SERP-check in deel 3, schaal 0–1.

**Drie dingen die opvallen en tegen de intuïtie ingaan:**

- **Weekendje weg is de op één na grootste cluster (18,6%) en de slechtst winbare (0,15).** Zie deel 3: deze SERP is volledig eigendom van OTA's en portals. Ik adviseer nadrukkelijk om hier *geen* hoofdlandingspagina op te bouwen. Meer daarover in 2.6.
- **De merkcluster staat op gemiddeld positie 15,3.** Voor uw eigen naam. "huis ter huynen" staat weliswaar op 3,9, maar "huynen" op 19,6 en "landgoed de huynen" op 61,2. Dat is een merk dat Google nog niet als entiteit heeft vastgelegd — een probleem dat u met GBP en citaties oplost, niet met content.
- **De hondcluster staat op positie 72,9**, de slechtste van alle clusters, terwijl er wel 14 queries en 74 vertoningen zijn. En uw eigen propositie is "honden zijn in overleg welkom" [CODE]. Dat is geen propositie waarmee u een SERP wint. Beslis: óf u wordt echt hondvriendelijk (omheinde tuin — er wordt letterlijk op "huisje huren met omheinde tuin drenthe" gezocht), óf u laat deze cluster los. Zie deel 4, `/vakantiehuis-drenthe-met-hond`.

## 2.4 Woordkeuze: waar u de markt misloopt

| Uw woord [CODE] | Vertoningen | Woord van de markt | Vertoningen | Verschil |
|---|---|---|---|---|
| hottub | 249 | **jacuzzi** | **754** | 3,0× |
| vakantiehuis | 549 | **huisje** | **643** | 1,2× |
| lodge | 27 | (huisje / vakantiehuis) | 1.192 | 44× |

[ANALYSE]

**Data:** "lodge" komt voor in 8 zoekopdrachten met samen 27 vertoningen. "Huisje" en "vakantiehuis" samen: 1.192 vertoningen.
**Observatie:** het woord waarmee u uw product benoemt — lodge — is vrijwel geen zoekwoord. Uw homepage-title begint ermee: "Lodge Drenthe | Vakantiewoning met Hottub bij Assen" [CODE].
**Hypothese:** "lodge" is uw merktaal, geen markttaal. Het mag in de merkbeleving blijven, maar het hoort niet vooraan in de title van de belangrijkste pagina van de site.
**Actie:** homepage-title herschrijven (zie deel 7), "jacuzzi" en "huisje" opnemen in H1/intro/FAQ van de commerciële pagina's.
**KPI:** vertoningen op jacuzzi-queries +100% binnen 90 dagen; eerste niet-merkgebonden klikken binnen 60 dagen.

Let op de nuance: dit is **geen** advies om "lodge" overal te vervangen. Google begrijpt jacuzzi/hottub als vrijwel synoniem, dus u wint hier geen ranking door woordvervanging alleen — u wint doordat de snippet het woord toont dat de zoeker net heeft ingetypt, en doordat de pagina aantoonbaar over hun onderwerp gaat. Het is een ondersteunende actie, geen wondermiddel.

## 2.5 Het Opportunity Score-model

Score van 0–100, opgebouwd uit vijf componenten. Volledig reproduceerbaar; het script staat in de bijlage-omschrijving onderaan.

| Component | Max | Berekening | Waarom |
|---|---|---|---|
| **Vraag** | 25 | `25 × ln(1+impressies) / ln(1+310)` | Logaritmisch, want het verschil tussen 10 en 100 vertoningen telt zwaarder dan tussen 200 en 300. 310 = hoogste waarde in de dataset |
| **Positie-upside** | 20 | pos ≤3 → 4 · 4–10 → 20 · 11–20 → 18 · 21–30 → 14 · 31–50 → 8 · 50+ → 4 | Niet "hoe laag sta ik", maar "hoeveel valt hier realistisch te winnen". Positie 60 krijgt bewust een lage score: daar is geen quick win, daar is herbouw nodig |
| **Commerciële intentie** | 30 | `30 × (boekingsnabijheid − 1) / 4` | Zwaarst wegend. Boekingsnabijheid 1–5 per query bepaald (zie 2.6) |
| **Relevantie** | 15 | `15 × relevantiefactor (0–1)` | Past de zoekopdracht bij 2 lodges voor max 4 personen met privé-jacuzzi? "hotel veenhuizen" scoort 0,25 |
| **Winbaarheid** | 10 | `10 × winbaarheidsfactor (0–1)` | Uit de SERP-benchmark. Portal-gedomineerde SERP's scoren laag |

De weging is bewust: **intentie (30) weegt zwaarder dan vraag (25)**, omdat het doel omzet is en niet verkeer. En positie-upside (20) weegt zwaarder dan winbaarheid (10), omdat winbaarheid een inschatting is en positie een meting.

## 2.6 Zoekintentie & boekingsnabijheid

Classificatie per cluster, met de boekingsnabijheid op een schaal van 1 (ver van een boeking) tot 5 (direct voor een boeking).

| Cluster | Zoekintentie | Boekingsnabijheid | Toelichting |
|---|---|---|---|
| Hottub / Jacuzzi | Transactional | **5/5** | "huisje met jacuzzi drenthe" is een productzoekopdracht. De zoeker weet wat hij wil en zoekt waar |
| Romantiek / Koppels | Transactional | **5/5** | Gelegenheidsgedreven, korte beslistijd, lage prijsgevoeligheid |
| Merk | Navigational | 5/5 | Al overtuigd |
| Wellness / Sauna | Commercial investigation | 4/5 | Vergelijkt nog; "wellness huisje drenthe" is wel transactioneel (5/5), "dagje wellness drenthe" juist niet (1/5 — dat zijn saunabezoekers, geen overnachters) |
| Luxe / Boutique | Commercial investigation | 4/5 | Vaak nog aan het oriënteren op type accommodatie |
| Locatie | Local intent | 4/5 | Bestemming staat vast, accommodatie nog niet |
| Bijzonder overnachten | Commercial investigation | 4/5 | Inspiratiefase, maar met boekingsbedoeling |
| Duitsland (DE) | Commercial investigation | 4/5 | |
| Hond | Transactional | 4/5 | Harde filtereis |
| Weekendje weg | Commercial investigation | **3/5** | Bestemming én accommodatietype nog open. Veel breder dan het lijkt |
| Heide | Informational | 2/5 | Seizoensgebonden inspiratie |
| Concurrent | Navigational | 2/5 | Zoekt iemand anders |
| Hunebedden / Natuur | Informational | **1/5** | Dagjesmensen en schoolopdrachten |

**Tegenspraak bij de opdracht.** De briefing noemt "weekendje weg Drenthe" als kandidaat-hoofdlandingspagina en geeft "romantisch weekendje weg Drenthe" een 5/5. Dat tweede klopt. Het eerste niet: **"weekendje weg drenthe" is een 3/5, geen 5/5**, omdat de zoeker in die fase nog niet weet of hij een hotel, een camping, een bungalowpark of een huisje wil. Gecombineerd met een winbaarheid van 0,15 is dit de slechtste investering op de hele lijst — hoge kosten, laag rendement, en de klikken die u wél binnenhaalt, converteren slecht.

## 2.7 Top 15 op Opportunity Score

| # | Zoekopdracht | Score | Vert. | Positie | Cluster | Intentie |
|---|---|---|---|---|---|---|
| 1 | huis ter huynen | 90,1 | 31 | 3,9 | Merk | 5/5 |
| 2 | huis ter zeijen | 86,2 | 12 | 3,7 | Merk | 5/5 |
| 3 | **romantisch weekendje weg drenthe** | **83,9** | 95 | 26,4 | Romantiek | 5/5 |
| 4 | huynen | 80,8 | 5 | 19,6 | Merk | 5/5 |
| 5 | **hottub drenthe** | 78,5 | 122 | 39,6 | Hottub | 5/5 |
| 6 | **huisje met hottub drenthe** | 78,2 | 116 | 41,5 | Hottub | 5/5 |
| 7 | **romantisch overnachten drenthe** | 78,1 | 100 | 46,5 | Romantiek | 5/5 |
| 8 | overnachten in veenhuizen | 77,4 | 40 | 15,2 | Locatie | 4/5 |
| 9 | **weekendje drenthe met privé jacuzzi** | 77,1 | 89 | 41,4 | Hottub | 5/5 |
| 10 | drentse hottub | 75,5 | 3 | 5,7 | Hottub | 5/5 |
| 11 | **wellness huis drenthe** | 75,2 | 82 | 43,1 | Wellness | 5/5 |
| 12 | **wellness weekend drenthe** | 75,2 | 82 | 45,2 | Wellness | 5/5 |
| 13 | particulier vakantiehuis met jacuzzi drenthe | 75,0 | 55 | 49,7 | Hottub | 5/5 |
| 14 | locatie vriendinnenweekend drenthe | 74,0 | 9 | 20,7 | Romantiek | 5/5 |
| 15 | **wellness huisje drenthe** | 73,2 | 128 | 55,4 | Wellness | 5/5 |

[ANALYSE] — vetgedrukt = niet-merkgebonden, met ≥80 vertoningen.

## 2.8 Quick wins — en waarom het er bijna geen zijn

De opdracht vraagt naar zoekwoorden op positie 8–20 met voldoende vertoningen en commerciële intentie. Dat is de juiste vraag. Het antwoord is alleen ontnuchterend:

| Zoekopdracht | Vert. | Positie | Cluster | Bruikbaar? |
|---|---|---|---|---|
| overnachten in veenhuizen | 40 | 15,2 | Locatie | **Ja** |
| huynen | 5 | 19,6 | Merk | Ja (merk) |
| arjan reinders | 4 | 19,2 | Merk | Nee (persoonsnaam) |
| natuurhuisje zeijen | 3 | 12,0 | Locatie | Marginaal |
| privates ferienhaus | 1 | 10,0 | DE | Nee |
| drenthe spa | 1 | 12,0 | Wellness | Nee |
| sauna drente | 1 | 13,0 | Wellness | Nee (typefout) |
| lodge nederland | 1 | 15,0 | Luxe | Nee |

[ANALYSE] — filter: positie 8–20, boekingsnabijheid ≥3.

**Er is precies één echte quick win: "overnachten in veenhuizen" (40 vertoningen, positie 15,2).** De rest heeft 1 tot 5 vertoningen — statistisch ruis.

Dit is belangrijk om vooraf te weten, want het bepaalt de verwachting voor de eerste maanden. **De standaard-SEO-speelbal "pak de quick wins op positie 11–20" bestaat hier niet.** Bijna alles wat commercieel interessant is, staat op positie 40+. Dat betekent: geen snelle winst in maand 1 en 2, maar herbouwwerk waarvan het rendement in maand 3 tot 6 zichtbaar wordt. Wie in oktober 2026 al klikken verwacht, wordt teleurgesteld — en zou dan ten onrechte kunnen concluderen dat het plan niet werkt.

## 2.9 Striking distance (positie 11–30)

| Zoekopdracht | Vert. | Positie | Actie |
|---|---|---|---|
| **romantisch weekendje weg drenthe** | 95 | 26,4 | Prio 1 — zie deel 5 |
| overnachten in veenhuizen | 40 | 15,2 | Prio 2 — `/overnachten-veenhuizen` versterken |
| slapen in een hunebed | 28 | 7,9 | Negeren — informatief, 1/5, wij hebben geen hunebed |
| veenhuizen overnachten | 8 | 24,1 | Meelift met prio 2 |
| wanneer bloeit de heide in drenthe | 14 | 10,9 | Behouden — seizoensverkeer, zie deel 6 |
| huis ter zeijen | 12 | 3,7 | Merk, al goed |
| locatie vriendinnenweekend drenthe | 9 | 20,7 | Kans — nieuwe H2 op romantiekpagina, niet een eigen pagina |
| veentjesroute zeijen | 5 | 22,4 | Meelift met wandelcontent |

[ANALYSE]

De striking-distance-lijst is dun: **9 queries met samen 127 vertoningen.** Ook dit onderstreept dat de site nog niet in de fase van fijnslijpen zit.

## 2.10 Hoge vertoningen, geen klikken — CTR-probleem of ranking-probleem?

De opdracht vraagt hier expliciet om onderscheid. Dat onderscheid is scherp te maken.

**Ranking-probleem (positie > 30) — 24 van de 25 grootste gevallen:**

| Zoekopdracht | Vert. | Positie | Diagnose |
|---|---|---|---|
| weekendje weg drenthe | 310 | 53,4 | Ranking. Bovendien onwinbaar (zie deel 3) |
| weekend weg drenthe | 282 | 46,6 | Ranking + onwinbaar |
| luxe hotel drenthe | 168 | 55,1 | Ranking + **verkeerde intentie** (hotel) |
| boutique hotel drenthe | 161 | 51,3 | Ranking + verkeerde intentie (hotel) |
| wellness huisje drenthe | 128 | 55,4 | Ranking — landingspagina bestaat, staat te laag |
| hottub drenthe | 122 | 39,6 | Ranking |
| huisje met hottub drenthe | 116 | 41,5 | Ranking |
| romantisch overnachten drenthe | 100 | 46,5 | Ranking |
| weekendje drenthe met privé jacuzzi | 89 | 41,4 | Ranking |
| wellness drenthe | 88 | 51,1 | Ranking + brede intentie |

**Echt CTR-probleem (goede positie, nul klikken) — slechts drie gevallen, alle op paginaniveau:**

| URL | Vert. | Positie | Klikken | Diagnose |
|---|---|---|---|---|
| `/blog/kanovaren-drentsche-aa` | 93 | 9,8 | **0** | **Echt CTR-probleem.** Positie 10, 93 vertoningen, nul klikken. Verwacht bij deze positie: 2–4 klikken |
| `/blog/een-dag-in-norg` | 41 | 9,4 | **0** | **Echt CTR-probleem** |
| `/de/ferienhaus-mit-whirlpool-drenthe` | 15 | 9,5 | **0** | CTR-probleem, klein volume |

[GSC] [ANALYSE]

**Conclusie:** van de 3.861 vertoningen in de query-export is naar schatting **minder dan 5% toe te schrijven aan een CTR-probleem.** De overige 95% is ranking. Daarom staat het CTR-plan (deel 7) in dit rapport bewust bij P1/P2 en niet bij P0 — met één uitzondering: de homepage en de drie pagina's hierboven, waar het wél nu al loont.

---

# 3. Competitor Benchmark

**Methode-verantwoording:** live Google-resultaten opgehaald in augustus 2026 [SERP]. Ik heb de concurrentpagina's *niet* on-page kunnen uitmeten (netwerkbeperking, zie bronverantwoording). Wat hieronder staat over paginatype, positionering en URL-structuur is waarneming. Wat er staat over *waarom* zij hoger staan, is beargumenteerde hypothese en als zodanig gelabeld.

## 3.1 De belangrijkste bevinding: u concurreert niet met accommodaties

| Zoekopdracht | Wie domineert de top 10 | Type |
|---|---|---|
| huisje met hottub drenthe | uniekevakantieplekjes.nl, vakantiehuis-met-bubbelbad.com, liefsuithetnoorden.nl, drentsgenieten.nl, huisje-met-hottub.com, vakantiehuis-met-sauna.com | **Portals & affiliate-listings** |
| wellness huisje drenthe | luxevakantieplekjes.nl, drentsgenieten.nl, galekkeropvakantie.nl, vakantiehuis-met-sauna.com, hetgrotezand.nl + wellnesshuisdrenthe.nl | Portals + 2 losse accommodaties |
| weekendje weg drenthe | hotelspecials.nl, weekendjeweg.nl, heerlijkehuisjes.com, kidsvakantiegids.nl + parken (Norgerberg, Timmerholt, Wildryck) | **OTA's & grote parken** |
| romantisch weekendje weg drenthe | hotelspecials.nl, drenthe.nl, leukekleinehotels.nl, vogue.nl, wandergreen.nl + westerburcht.nl | Portals + 1 hotel |
| luxe lodge drenthe | glampings.nl, reisroutes.nl, checkoutsam.nl + berenkuil.nl, landclubruinen.nl, **deviereiken.nl** | Listicles + glampings |
| bijzonder overnachten drenthe | origineelovernachten.nl, hotelspecials.nl, drenthe.nl, bijzonderplekje.nl, naturescanner.nl, supertrips.nl, bijzondere-accommodaties.nl | **Bijna 100% listicles** |

[SERP]

**Data:** in vijf van de zes onderzochte SERP's bestaat de top 10 voor 60–100% uit portals, OTA's, affiliate-listings en redactionele listicles.
**Observatie:** Google interpreteert deze zoekopdrachten als **"toon mij een keuzelijst"**, niet als "toon mij één accommodatie". Dat is een intentie-oordeel van Google, geen kwestie van pagina-kwaliteit.
**Hypothese:** een site met twee verhuureenheden kan een lijstintentie per definitie niet beter bedienen dan een portal met tweehonderd. Dat is de fundamentele reden dat `/vakantiehuis-met-hottub-drenthe` op positie 49 staat — niet gebrek aan woorden of interne links.
**Actie:** twee sporen. (a) Voor lijst-SERP's: zorg dat u *in* die lijsten staat in plaats van ertegen te vechten (zie 7.2 van dit deel en deel 7 van het rapport). (b) Voor uw eigen pagina's: richt op de long tail en de locatietermen waar de intentie wél "één accommodatie" is.
**KPI:** vermelding in ≥6 relevante portals/listicles binnen 120 dagen; top-10 op ≥4 locatie- en long-tail-termen binnen 90 dagen.

**Dit is de belangrijkste strategische correctie op de opdracht.** De briefing gaat ervan uit dat we de top 10 van "huisje met hottub Drenthe" kunnen veroveren met een betere pagina. Op basis van de SERP-structuur acht ik dat voor het hoofdzoekwoord onwaarschijnlijk binnen de planningshorizon — en voor "weekendje weg drenthe" en "bijzonder overnachten drenthe" vrijwel uitgesloten. Wat wél kan: posities 8–15 pakken op de long tail (`weekendje drenthe met privé jacuzzi`, `particulier vakantiehuis met jacuzzi drenthe`, `huisje met sauna en jacuzzi drenthe`) en de locatiecluster domineren.

## 3.2 De relevante directe concurrent: De Vier Eiken

Van alle gevonden partijen is **deviereiken.nl** het beste vergelijkingsmateriaal: een echte accommodatie (geen portal) die met eigen lodges mét privé-sauna en hottub in meerdere commerciële SERP's staat [SERP].

**Wat zij aantoonbaar anders doen** [SERP]:

Zij hebben een **URL-silo per zoekintentie**, allemaal op accommodatieniveau:
`/nl/natuurlodge` · `/nl/natuurhuisje` · `/nl/vakantiehuisje-in-de-natuur` · `/nl/huisje-huren` · `/nl/11-lodges` · `/nl/natuurlodge/vakantiehuis-8-personen` · `/natuurlodge/natuurlodge-wellness` · `/nl/vakantiehuis-met-korting`

Drie dingen vallen op, en alle drie zijn overdraagbaar:

1. **Zij gebruiken de markttaal, niet hun merktaal.** "natuurhuisje", "huisje huren", "vakantiehuisje" — precies de woorden die volgens uw eigen GSC-data 643 vertoningen genereren en die op uw site nergens voorkomen.
2. **Zij hebben een pagina per lodge én per lodgetype.** `/nl/natuurlodge/vakantiehuis-8-personen`, `/natuurlodge/natuurlodge-wellness`. Huis ter Huynen heeft géén enkele URL per lodge [CODE] — De Heide en De Eik bestaan alleen als secties op de homepage. Dat is een gat in zowel SEO (long tail) als CRO (keuze maken is een conversiestap).
3. **Zij ranken met een titel die de accommodatie én de plaats noemt** ("Bijzonder overnachten in Drenthe | De Vier Eiken"), terwijl uw titels de plaats Zeijen noemen — een dorp dat vrijwel niemand kent en waar volgens uw GSC-data 1 vertoning op binnenkomt [GSC].

**Waarom staan zij hoger dan Huis ter Huynen?** [hypothese, niet geverifieerd]
Vermoedelijk een combinatie van: (a) domeinleeftijd en backlinkprofiel — zij bestaan al jaren en worden genoemd op drents-friesewold.nl en vergelijkbare regiosites; (b) meer verhuureenheden, waardoor hun pagina's dichter bij de lijstintentie komen; (c) een breder URL-portfolio dat meer long tail afvangt; (d) echte reviews en boekingshistorie. Punt (a) en (d) zijn een kwestie van tijd en uitvoering; (b) is een gegeven dat u niet verandert; (c) is direct kopieerbaar.

## 3.3 Wat Huis ter Huynen aantoonbaar beter kan

Eerlijk, en beperkt tot wat uit de eigen bronnen blijkt [CODE]:

| Voordeel | Bewijs | Hoe te verzilveren |
|---|---|---|
| **Privé-jacuzzi bij élke lodge, 24/7, 38 °C** | [CODE] | De meeste portalvermeldingen betreffen parken met gedeelde of gereserveerde wellness. "U deelt hem met niemand" is een echt onderscheid — nu begraven in bodytekst, moet in de title |
| **Slechts twee lodges = totale privacy** | [CODE] | Concurrenten met 11 lodges kunnen dit niet claimen. Dit is uw sterkste differentiator en hij staat nergens in een title of meta description |
| **Directe boeking zonder tussenpersoon** | [CODE] | Voor prijsbewuste vergelijkers een reden om úw site te kiezen boven de portal die hen doorstuurt |
| **Sauna in De Heide** | [CODE] | 197 vertoningen op sauna-termen, geen enkele pagina die het als kernpropositie voert |
| **EV-laadpaal** | [CODE] | Nauwelijks concurrentie op; groeiende filtereis bij luxesegment |
| **Nieuwbouw / opening 2027** | [CODE] | "Nieuw" is een verhaal dat portals en pers oppikken — zie deel 7, dit is uw beste backlinkhaak en hij is tijdelijk |

**Wat u niet beter kunt** — en waar u dus niet op moet inzetten: prijs (u bent premium), schaal, groepsaccommodatie (max 4 personen [CODE]), gezinsvakanties met kinderfaciliteiten, en reviewvolume (u heeft nog geen gasten gehad).

---

# 4. Bestaande pagina's — actie per URL

Alle 35 pagina's uit de export, gerangschikt op vertoningen. Categorieën: **KEEP** · **OPTIMIZE** · **MERGE** · **REDIRECT** · **NOINDEX**.

## 4.1 Commerciële landingspagina's

| URL | Vert. | Klik | CTR | Pos. | Doelzoekwoord | Actie | Waarom |
|---|---|---|---|---|---|---|---|
| `/wellness-vakantie-drenthe` | 1.526 | 0 | 0% | 62,6 | wellness huisje drenthe (128) | **OPTIMIZE — P0** | Grootste pagina, slechtste positie, nul klikken. Retarget van "wellness vakantie" (geen vraag) naar "wellness huisje/huis" (210 vert.) |
| `/romantisch-weekend-weg-drenthe` | 1.305 | 0 | 0% | 50,1 | romantisch weekendje weg drenthe (95) | **OPTIMIZE — P0** | Hoofdterm staat op 26,4 terwijl de pagina gemiddeld op 50 staat: de pagina rankt dus vooral op irrelevante brede termen. Focus verscherpen |
| `/vakantiehuis-met-hottub-drenthe` | 914 | 2 | 0,22% | 49,1 | huisje met jacuzzi drenthe (754 cluster) | **OPTIMIZE — P0** | "Jacuzzi" volledig afwezig in title/H1/URL. Grootste cluster van de site |
| `/luxe-lodge-drenthe` | 593 | 2 | 0,34% | 49,2 | luxe vakantiehuis drenthe | **OPTIMIZE — P1** | "Lodge" heeft 27 vertoningen. Retarget naar "luxe vakantiehuis/huisje" |
| `/vakantiehuis-assen` | 333 | 6 | 1,8% | 23,4 | vakantiehuis assen (27) | **OPTIMIZE — P1** | Beste commerciële positie van de site. Hoogste winbaarheid. Verdient meer interne links, niet meer tekst |
| `/overnachten-veenhuizen` | 185 | 0 | 0% | 33,3 | overnachten in veenhuizen (40, pos 15,2!) | **OPTIMIZE — P1** | Query staat op 15,2 maar de pagina gemiddeld op 33,3 — mismatch. De pagina rankt op te veel bijzaken |
| `/vakantiehuis-drenthe-met-hond` | 112 | 0 | 0% | 52,9 | hond-cluster (74) | **BESLISSEN — P2** | Zie 4.4. Propositie is "in overleg" — te zwak om mee te winnen |
| `/vakantiehuis-norg` | 86 | 2 | 2,33% | 18,5 | vakantiehuis norg | **KEEP** | Goede positie, goede CTR, klein volume. Niet aankomen |
| `/wandelen-drentsche-aa` | 37 | 0 | 0% | 42,2 | wandelen drentsche aa | **MERGE — P1** | Overlapt met `/wandelroutes-drenthe` [CODE]. Zie 4.3 |
| `/bijzonder-overnachten-drenthe` | — | — | — | — | bijzonder overnachten (180) | **HEROVERWEGEN — P2** | Staat in de code [CODE] maar haalt geen enkele vertoning. SERP is 100% listicles (winbaarheid 0,30). Zie 4.4 |

## 4.2 Informatie- & natuurpagina's — uw sterkste bezit

| URL | Vert. | Klik | CTR | Pos. | Actie | Waarom |
|---|---|---|---|---|---|---|
| `/hunebedden-drenthe` | 568 | 8 | 1,41% | **13,0** | **KEEP + LINK — P0** | Op één na grootste pagina, beste niet-merkpositie van de site. Boekingsintentie 1/5, dús: gebruik hem als link-donor, niet als conversiepagina |
| `/heide-drenthe` | 261 | 6 | 2,3% | **9,7** | **KEEP + LINK — P0** | Enige pagina in de top 10 met volume. Sterk seizoenspatroon (aug/sep) |
| `/omgeving` | 187 | 2 | 1,07% | 30,1 | OPTIMIZE — P2 | Hub-pagina, verdient betere interne linkrol |
| `/blog/kanovaren-drentsche-aa` | 93 | 0 | 0% | 9,8 | **OPTIMIZE (CTR) — P1** | Een van de drie echte CTR-problemen. Positie 10, nul klikken |
| `/blog/een-dag-in-norg` | 41 | 0 | 0% | 9,4 | **OPTIMIZE (CTR) — P1** | Idem |
| `/blog/e-bike-huren-in-drenthe` | 51 | 1 | 1,96% | 12,7 | KEEP | |
| `/blog/wilde-dieren-spotten-in-het-drents-friese-wold` | 27 | 3 | **11,11%** | 8,4 | KEEP | Hoogste CTR van de site. Bewijs dat content op positie 8 wél klikt |
| `/blog/mooie-fietsroutes-rondom-zeijen…` | 25 | 2 | 8% | 7,8 | KEEP | Idem |
| `/blog/drentsche-aa-beekdallandschap` | 19 | 1 | 5,26% | 12,6 | KEEP | |
| `/blog/fietsvakantie-in-drenthe…` | 16 | 0 | 0% | 11,9 | MERGE — P2 | Overlapt met de twee andere fietsartikelen |
| `/blog/fietsen-in-drenthe-is-misschien-wel…` | 28 | 1 | 3,57% | 30,1 | **REDIRECT — P1** | Slug van 250+ tekens. 301 naar `/blog/fietsen-in-drenthe` |
| `/blog/vakantie-met-hond-in-drenthe` | 27 | 0 | 0% | 15,1 | KEEP | Volgt de beslissing bij 4.4 |
| `/blog/waarom-zeijen` | 2 | 0 | 0% | 8,5 | KEEP | Merkverhaal |
| `/blog/prive-lodge-boeken-nederland-kosten` | 10 | 0 | 0% | 6,4 | **KEEP + CTA — P1** | Positie 6,4 op een prijs-/kostenzoekopdracht = late funnel. Verdient de sterkste CTA van alle blogs |

## 4.3 Kannibalisatie

Drie echte gevallen, alle drie op te lossen door samen te voegen.

**Geval 1 — Hottub: blog vs landingspagina**
`/blog/vakantiehuis-met-prive-hottub-in-drenthe-pure-luxe-rust-en-beleving` (53 vert., pos 60,9) versus `/vakantiehuis-met-hottub-drenthe` (914 vert., pos 49,1) [GSC].
Zelfde intentie (transactional), zelfde zoekwoord, twee URL's. De blog voegt geen informatie toe die de landingspagina mist.
→ **301 van de blog naar de landingspagina.** De beste alinea's uit de blog eerst overzetten als extra H2.

**Geval 2 — Wellness: blog vs landingspagina**
`/blog/wellness-in-drenthe` (7 vert., pos 63,7) versus `/wellness-vakantie-drenthe` (1.526 vert., pos 62,6) [GSC].
→ **301 van de blog naar de landingspagina.**

**Geval 3 — Wandelen: twee landingspagina's**
`/wandelen-drentsche-aa` (37 vert., pos 42,2) versus `/wandelroutes-drenthe` [CODE, staat in `LANDING_NAV`].
Twee pagina's, één intentie ("waar wandel ik in Drenthe").
→ **301 van `/wandelen-drentsche-aa` naar `/wandelroutes-drenthe`**, met de Drentsche Aa-inhoud als eigen H2-sectie daarin.

**Geen kannibalisatie, ondanks de schijn** — belangrijk om níét op te lossen:
- `/vakantiehuis-assen`, `/vakantiehuis-norg`, `/overnachten-veenhuizen`: verschillende plaatsnamen, verschillende lokale intentie, alle drie met eigen vertoningen. **Laten staan.**
- `/vakantiehuis-met-hottub-drenthe` en `/wellness-vakantie-drenthe`: overlappen in faciliteit, maar de intentie verschilt echt (product-zoekopdracht versus ervaring-zoekopdracht) en beide clusters zijn groot genoeg. **Twee pagina's houden**, mits de wellnesspagina scherp op "huisje/huis" gaat targeten en de andere op "jacuzzi".
- De vier `/de/`-pagina's: andere taal, geen kannibalisatie.

## 4.4 Twee pagina's waar u een besluit moet nemen

**`/vakantiehuis-drenthe-met-hond`** — 112 vertoningen, positie 52,9, nul klikken. Cluster: 14 queries, 74 vertoningen, gewogen positie 72,9 (slechtste van de site) [GSC].
Uw propositie is "honden zijn in overleg welkom" [CODE]. In een SERP waar concurrenten omheinde tuinen adverteren — er wordt letterlijk gezocht op "huisje huren met omheinde tuin drenthe" (6 vert.) en "vakantie met hond omheinde tuin drenthe" (3 vert.) — wint "in overleg" niet.
→ **Kies:** óf u maakt er een echte propositie van (omheinde tuin bij minimaal één lodge, hondenpakket, expliciet beleid) en dan verdient de pagina P2-investering; óf u laat de cluster los en zet de pagina op `noindex` met een korte hondenparagraaf op de lodgepagina's. **Mijn advies: het tweede**, tenzij u de omheinde tuin daadwerkelijk aanlegt. 74 vertoningen rechtvaardigen geen aparte pagina.

**`/bijzonder-overnachten-drenthe`** — staat in de codebase [CODE] maar komt in de hele pagina-export niet voor: **nul vertoningen.** De cluster heeft 180 vertoningen op gewogen positie 62,1, en de SERP bestaat vrijwel volledig uit listicles (origineelovernachten.nl, bijzonderplekje.nl, naturescanner.nl, supertrips.nl) [SERP].
→ **Niet verder investeren in de pagina.** De juiste manier om deze 180 vertoningen te winnen is *in die listicles komen te staan* (deel 7.3), niet ertegen concurreren. Pagina laten staan als landingsbestemming vanuit die vermeldingen, maar geen contentbudget aan besteden.

## 4.5 De Duitse pagina's — een eerlijke tussenstand

| URL | Vert. | Klik | Pos. |
|---|---|---|---|
| `/de` | 192 | 5 | 32,6 |
| `/de/romantisches-wochenende-drenthe` | 19 | 0 | 71,8 |
| `/de/ferienhaus-mit-whirlpool-drenthe` | 15 | 0 | **9,5** |
| `/de/wellness-urlaub-drenthe` | 14 | 1 | 12,0 |
| `/de/luxus-lodge-drenthe` | 9 | 0 | 13,6 |

[GSC] — samen 249 vertoningen, 6 klikken.

**Data:** zoekopdrachten in het Duits leveren 64 vertoningen op queryniveau (13 queries, breed geteld op zoektaal) en 249 op paginaniveau, tegenover 3.861 respectievelijk 7.288 totaal.
**Observatie:** drie van de vier DE-landingspagina's staan al in de top 15 — betere posities dan élke Nederlandse commerciële pagina. Maar het volume is minimaal.
**Hypothese:** de Duitse SERP's zijn veel minder verzadigd (winbaarheid 0,75), maar Google toont de pagina's nog nauwelijks omdat het domein geen Duitse autoriteitssignalen heeft (geen `.de`-links, geen paginaniveau-hreflang [CODE, T6]).
**Actie:** géén nieuwe Duitse content in de eerste 90 dagen. Wel de goedkope technische fix: `alternates.languages` op paginaniveau (T6). Herbeoordelen in maand 4 — als de posities dan houden en het volume groeit, is Duitsland een serieuze tweede markt voor 2027, want de Duitse gast boekt langer en verder vooruit.
**KPI:** DE-vertoningen ≥600/maand in maand 6; anders parkeren.

---

# 5. De 8 prioritaire landingspagina's

Gerangschikt op verwachte omzetbijdrage, niet op zoekvolume. Twee zijn nieuw, zes zijn bestaand.

---

## LP1 — Wellness huisje (P0, hoogste prioriteit)

| | |
|---|---|
| **Huidige URL** | `/wellness-vakantie-drenthe` — 1.526 vert., 0 klikken, positie 62,6 [GSC] |
| **Aanbevolen URL** | **Ongewijzigd laten.** Zie toelichting |
| **Primaire zoekterm** | wellness huisje drenthe (128 vert.) |
| **Secundair** | wellness huis drenthe (82) · wellness weekend drenthe (82) · wellness drenthe (88) · privé wellness drenthe (6) · prive sauna drenthe (13) · sauna met overnachting drenthe (82) |
| **Zoekintentie** | Commercial investigation → transactional · boekingsnabijheid 5/5 |
| **Conversiedoel** | Beschikbaarheid bekijken voor een 2- of 3-nachtenverblijf |

**Waarom de URL niet wijzigen:** "wellness-vakantie" is niet de sterkste term, maar de pagina heeft 1.526 vertoningen aan history. Een 301 kost 4–8 weken herindexering en levert hooguit een marginale keywordwinst in de URL op — URL-keywords zijn een zwak signaal. **Het rendement zit in de inhoud, niet in het pad.** Wel: "huisje" en "huis" prominent in H1, title, intro en FAQ.

**Aanbevolen H1:** `Wellness huisje in Drenthe met privé-sauna en jacuzzi`

**SEO title (winnaar, zie deel 7 voor de varianten):**
`Wellness Huisje Drenthe | Privé Sauna & Jacuzzi, Geen Gedeelde Spa`

**Meta description:**
`Een wellness huisje in Drenthe waar de sauna en jacuzzi alleen van u zijn. Twee vrijstaande lodges op de heide bij Zeijen, 24/7 op temperatuur. Vanaf €165 p.n.`

**Contentstructuur (H2's):**
1. `Privé wellness: geen openingstijden, geen onbekenden` — het kernonderscheid, direct onder de intro
2. `Wat er in het huisje zit: sauna, jacuzzi en een terras dat niemand inkijkt` — concrete faciliteiten per lodge, met het eerlijke onderscheid dat de sauna in De Heide zit [CODE]
3. `Een wellnessweekend in Drenthe: hoe zo'n dag eruitziet` — 8 uur wandelen → 17 uur sauna → 21 uur jacuzzi onder de sterren. Dit vangt "wellness weekend drenthe" (82 vert.)
4. `Wellness in de winter: waarom januari en februari het mooist zijn` — seizoensanker, ondersteunt deel 11
5. `Wat u in de buurt vindt` — 4 interne links, contextueel geplaatst

**FAQ's (FAQPage-schema, bestaat al [CODE]):**
- Is de sauna privé of gedeeld? *(vangt "privé wellness drenthe", "prive sauna drenthe")*
- Kan ik een wellnesshuisje boeken voor één nacht?
- Is de jacuzzi ook in de winter in gebruik?
- Wat is het verschil tussen De Heide en De Eik qua wellness?
- Kan ik hier met twee stellen terecht? *(vangt "locatie vriendinnenweekend drenthe", pos 20,7)*

**USP's boven de fold:** privé-sauna · jacuzzi 24/7 op 38 °C · slechts 2 lodges op het terrein · geen gedeelde faciliteiten · direct boeken zonder tussenpersoon

**CTA:** primair `Bekijk beschikbaarheid →` · secundair `Plan uw wellnessweekend →` na H2-3

**Interne links IN:** `/heide-drenthe` · `/hunebedden-drenthe` · `/blog/prive-lodge-boeken-nederland-kosten` · `/blog/wellness-in-drenthe` (na 301) · homepage · `/lodge-de-heide`
**Interne links UIT:** `/vakantiehuis-met-hottub-drenthe` · `/lodge-de-heide` · `/romantisch-weekend-weg-drenthe` · `/wandelroutes-drenthe`

**KPI:** positie < 25 binnen 90 dagen, < 15 binnen 180 dagen · eerste klikken binnen 60 dagen · CTR > 1,5% bij positie < 20

---

## LP2 — Romantisch weekend (P0)

| | |
|---|---|
| **Huidige URL** | `/romantisch-weekend-weg-drenthe` — 1.305 vert., 0 klikken, positie 50,1 [GSC] |
| **Aanbevolen URL** | Ongewijzigd |
| **Primaire zoekterm** | romantisch weekendje weg drenthe (95 vert., **positie 26,4**) |
| **Secundair** | romantisch overnachten drenthe (100) · romantisch huisje met jacuzzi drenthe (15) · weekendje twee personen drenthe (51) · weekendje drenthe met privé jacuzzi (89) · locatie vriendinnenweekend drenthe (9) |
| **Zoekintentie** | Transactional · 5/5 |
| **Conversiedoel** | Weekendboeking (2 nachten), hoogste ADR van het jaar |

**Waarom dit ondanks minder vertoningen boven LP1 had gekund:** de hoofdterm staat op **26,4** — de enige commerciële term met volume die binnen bereik van pagina 1 ligt. Ik zet hem toch op gelijke hoogte met LP1 omdat LP1 driemaal zoveel vertoningen heeft. Beide zijn P0; als u er maar één kunt doen, doe deze.

**Kernprobleem:** de pagina staat gemiddeld op 50,1 terwijl de hoofdterm op 26,4 staat. Dat betekent dat de pagina op tientallen brede, irrelevante termen wordt getoond en daar het gemiddelde mee omlaag trekt. **De focus is te breed.**

**Aanbevolen H1:** `Romantisch weekendje weg in Drenthe — met z'n tweeën, privé jacuzzi`

**SEO title:** `Romantisch Weekendje Weg Drenthe | Privé Jacuzzi voor Twee`

**Meta description:**
`Met z'n tweeën weg in Drenthe: een vrijstaande lodge met eigen jacuzzi en sauna, geen buren, geen receptie. Op de heide bij Zeijen. Vanaf €165 per nacht.`

**H2's:**
1. `Met z'n tweeën, en verder niemand` — privacy als romantisch argument
2. `De jacuzzi 's avonds: het moment waar het weekend om draait` — het beeld dat converteert
3. `Twee dagen Drenthe voor stellen: een voorstel` — vrijdagavond t/m zondag, concreet, met echte plaatsnamen [CODE]
4. `Ook voor een vriendinnenweekend of met twee stellen` — vangt de 9 vertoningen op "locatie vriendinnenweekend drenthe" (pos 20,7) zonder een aparte pagina te bouwen
5. `Valentijn, verjaardag of jubileum in Drenthe` — gelegenheidsanker, seizoensrelevant (zie deel 11)

**FAQ's:** Is de jacuzzi echt privé? · Kunnen we laat inchecken? · Is er een romantisch arrangement? · Kunnen we bloemen/champagne laten klaarzetten? · Hoe ver is het rijden vanuit de Randstad?

**CTA:** primair `Plan jullie weekend →` · sticky mobiel `Bekijk vrije weekenden →`

**Interne links IN:** homepage · `/heide-drenthe` · `/wellness-vakantie-drenthe` · `/lodge-de-heide` · `/blog/prive-lodge-boeken-nederland-kosten`
**Interne links UIT:** `/vakantiehuis-met-hottub-drenthe` · `/lodge-de-heide` · `/wandelroutes-drenthe`

**KPI:** hoofdterm positie < 15 binnen 90 dagen, **top 10 binnen 180 dagen** · eerste 10 organische klikken binnen 60 dagen

---

## LP3 — Vakantiehuis met jacuzzi (P0)

| | |
|---|---|
| **Huidige URL** | `/vakantiehuis-met-hottub-drenthe` — 914 vert., 2 klikken, positie 49,1 [GSC] |
| **Aanbevolen URL** | **Ongewijzigd.** Zie toelichting |
| **Primaire zoekterm** | huisje met jacuzzi drenthe (83) + hele jacuzzi-cluster (754) |
| **Secundair** | hottub drenthe (122) · huisje met hottub drenthe (116) · weekendje drenthe met privé jacuzzi (89) · vakantiehuis met jacuzzi drenthe (84) · vakantiehuisje met jacuzzi drenthe (82) · huisje met sauna en jacuzzi drenthe (76) · particulier vakantiehuis met jacuzzi drenthe (55) |
| **Zoekintentie** | Transactional · 5/5 |

**Waarom niet naar `/vakantiehuis-met-jacuzzi-drenthe` verhuizen** — dit is een reële afweging en ik kies bewust: de URL bevat het minder gezochte woord, maar 914 vertoningen aan history opgeven voor een zwak rankingsignaal is een slechte ruil. Google behandelt jacuzzi/hottub als vrijwel synoniem. **De winst zit in de zichtbare tekst — title, H1, intro, FAQ — want dáár beslist de zoeker of hij klikt.** Als u over 12 maanden een domeinmigratie of herstructurering doet, neem de URL dan mee.

**Aanbevolen H1:** `Vakantiehuis met privé-jacuzzi in Drenthe`

**SEO title:** `Vakantiehuis met Jacuzzi Drenthe | Privé Hottub bij Elke Lodge`
*(beide woorden in één title — vangt beide zoekvarianten in de snippet)*

**Meta description:**
`Twee vrijstaande vakantiehuisjes in Drenthe, elk met een eigen jacuzzi op het terras. Geen gedeelde wellness, 24/7 op 38 °C. Op de heide bij Zeijen. Vanaf €165.`

**H2's:**
1. `Jacuzzi of hottub? Bij ons is het allebei privé` — vangt beide woorden natuurlijk, zonder stuffing
2. `Twee huisjes, twee jacuzzi's, nul gedeelde faciliteiten`
3. `Ook een sauna: het verschil tussen De Heide en De Eik` — vangt "huisje met sauna en jacuzzi drenthe" (76 vert.)
4. `Particulier verhuurd, direct geboekt` — vangt "particulier vakantiehuis met jacuzzi drenthe" (55 vert.), een term met opvallend hoge intentie
5. `De jacuzzi in de winter`

**FAQ's:** Is de jacuzzi privé? · Wat is het verschil tussen een jacuzzi en een hottub? · Is de jacuzzi het hele jaar warm? · Zit er ook een sauna bij? · Boek ik rechtstreeks bij de eigenaar?

**Interne links IN:** homepage · `/wellness-vakantie-drenthe` · `/romantisch-weekend-weg-drenthe` · `/blog/vakantiehuis-met-prive-hottub…` (na 301) · beide lodgepagina's
**Interne links UIT:** `/lodge-de-heide` · `/lodge-de-eik` · `/wellness-vakantie-drenthe`

**KPI:** jacuzzi-cluster vertoningen +100% binnen 90 dagen · positie < 25 binnen 120 dagen

---

## LP4 — Lodge De Heide (NIEUW, P1)

| | |
|---|---|
| **Aanbevolen URL** | `/lodge-de-heide` |
| **Primaire zoekterm** | long tail: huisje met sauna en jacuzzi drenthe (76) · natuurhuisje zeijen (3, pos 12,0) |
| **Zoekintentie** | Transactional · 5/5 |
| **Conversiedoel** | Lodgekeuze → beschikbaarheid → aanvraag |

**Waarom deze pagina moet bestaan** — twee onafhankelijke redenen:
**SEO:** De Vier Eiken heeft een URL per lodge en per lodgetype [SERP]; Huis ter Huynen heeft er nul [CODE]. Per-unit-pagina's vangen long tail ("huisje met sauna", "lodge voor 2 personen", "natuurhuisje zeijen") die de overzichtspagina's niet kunnen bedienen.
**CRO:** dit is de belangrijkste reden. In de huidige funnel moet de bezoeker vanaf een themapagina rechtstreeks naar een aanvraagformulier springen [CODE]. **Er is geen stap waarin hij een lodge kiest.** Keuze maken is precies de stap die twijfel omzet in commitment. Nu ontbreekt hij volledig.

**H1:** `Lodge De Heide — met eigen sauna en jacuzzi op de heide`
**SEO title:** `Lodge De Heide | Vakantiehuisje met Sauna & Jacuzzi in Zeijen`
**H2's:** `Wat er in de lodge zit` (volledige inventaris) · `De sauna en de jacuzzi` · `Voor wie deze lodge is` (2 personen, of 2+2) · `Het uitzicht en het terras` · `Prijzen en beschikbaarheid` · `De Heide of De Eik?` (vergelijking, met link naar de andere)
**CTA:** `Bekijk beschikbaarheid voor De Heide →` — mét voorgeselecteerde lodge in de boekingsflow (zie deel 8)
**Interne links IN:** alle commerciële pagina's, homepage
**Interne links UIT:** `/lodge-de-eik`, `/wellness-vakantie-drenthe`

**KPI:** ≥15% van alle landingspagina-sessies eindigt op een lodgepagina · aanvraagconversie op lodgepagina's ≥2× die van themapagina's

---

## LP5 — Lodge De Eik (NIEUW, P1)

Identiek van opzet aan LP4. **URL:** `/lodge-de-eik` · **H1:** `Lodge De Eik — onder de eiken, met buitenkeuken en jacuzzi` · **SEO title:** `Lodge De Eik | Vakantiehuisje met Jacuzzi en Buitenkeuken, Zeijen`
Onderscheidende H2: `De buitenkeuken en de BBQ` [CODE — dit is het echte verschil met De Heide].
**Belangrijk:** schrijf deze twee pagina's écht verschillend. Twee bijna identieke lodgepagina's zijn precies het kannibalisatieprobleem dat de site al heeft. Het verschil is concreet: De Heide heeft de sauna en het panoramisch uitzicht, De Eik heeft de buitenkeuken en de BBQ [CODE].

---

## LP6 — Luxe vakantiehuis (P1)

| | |
|---|---|
| **Huidige URL** | `/luxe-lodge-drenthe` — 593 vert., 2 klikken, positie 49,2 [GSC] |
| **Aanbevolen URL** | Ongewijzigd |
| **Primaire zoekterm** | luxe vakantiehuis drenthe met jacuzzi (43) |
| **Secundair** | luxe hotel drenthe (168)* · boutique hotel drenthe (161)* · luxe lodge (14) · hotel drenthe luxe (9) |
| **Zoekintentie** | Commercial investigation · 4/5 |

**\* Let op de val:** de twee grootste termen in deze cluster ("luxe hotel drenthe" 168, "boutique hotel drenthe" 161) bevatten het woord **hotel**. Huis ter Huynen is geen hotel [CODE]. In totaal is 475 vertoningen aan hotelverkeer in de dataset aanwezig. **Ik adviseer nadrukkelijk om hier niet op te optimaliseren:** u zou moeten claimen iets te zijn wat u niet bent, de SERP is hotelgedomineerd, en de klikker die tóch komt zoekt roomservice en een receptie.
Wat wél kan: één eerlijke H2 — `Geen hotel, maar een eigen huis` — die het onderscheid uitlegt. Dat trekt de vergelijkende zoeker die bewust een alternatief voor een hotel zoekt, zonder dat u doet alsof.

**H1:** `Luxe vakantiehuis in Drenthe` · **SEO title:** `Luxe Vakantiehuis Drenthe | Privé Jacuzzi, Sauna & Geen Buren`
**KPI:** positie < 30 binnen 120 dagen

---

## LP7 — Vakantiehuis bij Assen (P1)

| | |
|---|---|
| **Huidige URL** | `/vakantiehuis-assen` — 333 vert., 6 klikken, CTR 1,8%, **positie 23,4** [GSC] |
| **Primaire zoekterm** | vakantiehuis assen (27) · huisje huren assen (12) · vakantiehuisje assen (11) · ferienhaus assen (46) |
| **Winbaarheid** | **0,80 — hoogste van alle clusters** |

**Waarom deze pagina onderschat wordt:** beste commerciële positie van de site, tweede CTR van de site, hoogste winbaarheid, en lokale intentie (4/5). Dit is de pagina met de kortste weg naar pagina 1.
**Wat er moet gebeuren is vooral géén nieuwe tekst.** De pagina is inhoudelijk in orde; wat ontbreekt is interne autoriteit. **Actie: 6 contextuele interne links erheen** (zie deel 9) plus twee toevoegingen: een H2 `Hoe ver is het naar Assen?` met concrete reistijd en een H2 die het TT-circuit en de TT-week noemt — dat is de grootste vraagpiek van de regio en hij staat nu nergens op de site.
Opvallend: "ferienhaus assen" heeft met 46 vertoningen méér volume dan de Nederlandse variant. Overweeg een DE-versie in maand 4 (zie 4.5).

**KPI:** top 10 op "vakantiehuis assen" binnen 90 dagen

---

## LP8 — Overnachten bij Veenhuizen (P1)

| | |
|---|---|
| **Huidige URL** | `/overnachten-veenhuizen` — 185 vert., 0 klikken, positie 33,3 [GSC] |
| **Primaire zoekterm** | overnachten in veenhuizen (40, **positie 15,2**) |
| **Secundair** | veenhuizen overnachten (8, pos 24,1) · overnachten veenhuizen (4) |

**De enige echte quick win uit deel 2.8.** De query staat op 15,2 maar de pagina gemiddeld op 33,3 — de pagina wordt dus ook getoond op veel bredere Veenhuizen-termen waar hij niet thuishoort ("hotel veenhuizen" 54 vert., "hotels veenhuizen" 6, "veenhuizen hotels" 5 — samen 65 vertoningen hotelintentie die u nooit wint).
**Actie:** de pagina toespitsen op *overnachten in de omgeving van Veenhuizen* met eerlijke afstandsvermelding, en een sterke sectie over het Gevangenismuseum en het Unesco-verhaal. Niet proberen "hotel veenhuizen" te winnen.
**KPI:** top 10 op "overnachten in veenhuizen" binnen 60 dagen — dit is de snelste meetbare winst van het hele plan.

---

## Wat ik bewust NIET adviseer te bouwen

| Voorgestelde pagina | Waarom niet |
|---|---|
| `/weekendje-weg-drenthe` | 718 vertoningen, maar winbaarheid 0,15: de SERP is van hotelspecials.nl, weekendjeweg.nl en heerlijkehuisjes.com [SERP]. Boekingsnabijheid slechts 3/5. Hoogste kosten, laagste rendement van alle opties |
| Aparte `/huisje-met-sauna-drenthe` | 197 vertoningen sauna-cluster, maar dit kannibaliseert LP1 direct. Onderbrengen als H2 + FAQ in LP1 |
| Aparte `/prive-wellness-drenthe` | 6 vertoningen. Te weinig voor een eigen URL |
| Aparte `/vriendinnenweekend-drenthe` | 9 vertoningen. Onderbrengen als H2 in LP2 |
| Nieuwe DE-pagina's | Zie 4.5 — eerst de technische hreflang-fix, dan meten |
| `/bijzonder-overnachten-drenthe` uitbreiden | Zie 4.4 — winbaarheid 0,30, dit win je via listicles |

---

# 6. Contentplan — 6 maanden

**Uitgangspunt:** maximaal 2–3 artikelen per maand. Elk artikel ondersteunt één cluster, linkt naar minimaal één commerciële pagina met beschrijvende ankertekst, en bevat minimaal één CTA.

**Het belangrijkste principe voor deze site:** uw blogs presteren aantoonbaar beter dan uw commerciële pagina's (CTR 3,31% versus 0,25%) [ANALYSE]. Content is hier geen bijzaak — het is uw enige bewezen kanaal naar de top 10. Maar dan moet elk artikel wél doorlinken, en dat gebeurt nu niet.

**Timing-principe:** content moet 8–12 weken vóór de vraagpiek live staan. Google heeft die tijd nodig om te indexeren en te positioneren. Een heideartikel dat in augustus verschijnt, is een jaar te laat.

| Maand | Artikel | Cluster | Ondersteunt | Interne link naar |
|---|---|---|---|---|
| **Sep 2026** | Wat kost een privé-lodge met jacuzzi in Nederland? *(uitbreiding van de bestaande post op pos 6,4)* | Hottub | LP3 | `/vakantiehuis-met-hottub-drenthe` |
| | Wellnessweekend in Drenthe: hoe ziet zo'n weekend eruit? | Wellness | LP1 | `/wellness-vakantie-drenthe` |
| | Herfst op de Drentse heide: de mooiste wandelingen in oktober | Natuur | LP1, LP2 | `/wandelroutes-drenthe`, `/wellness-vakantie-drenthe` |
| **Okt 2026** | Jacuzzi in de winter: waarom december de mooiste maand is | Hottub | LP3 | `/vakantiehuis-met-hottub-drenthe` |
| | Romantisch weekendje weg: 8 plekken in Drenthe voor stellen | Romantiek | LP2 | `/romantisch-weekend-weg-drenthe` |
| **Nov 2026** | Kerst en oud & nieuw in Drenthe: waar overnacht je? | Seizoen | LP2, LP3 | beide |
| | Sauna of jacuzzi — wat kiest u? *(vangt "huisje met sauna en jacuzzi")* | Wellness | LP1, LP3 | beide |
| **Dec 2026** | Valentijn in Drenthe: een weekend met z'n tweeën *(3 maanden vooruit gepubliceerd)* | Romantiek | LP2 | `/romantisch-weekend-weg-drenthe` |
| | De eerste gasten: hoe De Heide en De Eik eruit zijn geworden | Merk | LP4, LP5 | lodgepagina's |
| **Jan 2027** | Wellness in januari: waarom de stilste maand de beste is | Wellness | LP1 | `/wellness-vakantie-drenthe` |
| | Wandelen in de winter rond de Drentsche Aa | Natuur | LP1 | `/wandelroutes-drenthe` |
| **Feb 2027** | Wanneer bloeit de heide in Drenthe? *(actualiseren, staat al op pos 10,9)* | Heide | LP1, LP2 | beide |
| | Pasen en de meivakantie in Drenthe: wat is er te doen? | Seizoen | LP7 | `/vakantiehuis-assen` |
| | Fietsen in Drenthe vanuit Zeijen *(samenvoeging van 3 bestaande fietsartikelen)* | Natuur | LP7 | `/fietsen-in-drenthe` |

**Wat ik níét in dit plan zet, en waarom:** geen artikelen over hunebedden (informational 1/5 — u heeft er al één die op positie 13 staat, dat volstaat), geen "10 dingen om te doen in Drenthe"-content (dat is portalterrein), en geen artikelen die alleen bestaan om een zoekwoord af te vangen. Bij twee lodges is uw contentcapaciteit beperkt; elk artikel dat geen commerciële pagina versterkt, is verloren budget.

---

# 7. CTR-plan

**Positionering vooraf:** dit hoofdstuk is P1, niet P0 — zie 2.10. Bij 92% van de vertoningen op positie 31+ verandert een betere title vrijwel niets. Er zijn vier plekken waar het nú wél loont, en die staan bovenaan.

## 7.1 Homepage (positie 8,49 — hier loont het direct)

**Huidig** [CODE]: `Lodge Drenthe | Vakantiewoning met Hottub bij Assen – Huis ter Huynen`
**Probleem:** begint met "Lodge Drenthe" (27 vertoningen in de hele dataset) en gebruikt "hottub" (249) in plaats van "jacuzzi" (754). De sterkste differentiator — twee lodges, dus totale privacy — ontbreekt.

| Variant | Title | Beoordeling |
|---|---|---|
| A | `Vakantiehuis met Jacuzzi in Drenthe \| Huis ter Huynen` | Sterke term, maar concurreert direct met LP3 — kannibalisatierisico |
| B | `Huis ter Huynen \| Twee Lodges met Privé Jacuzzi op de Drentse Heide` | Merk voorop (goed voor entiteitsherkenning, zie 2.3), "twee lodges" als differentiator, "privé jacuzzi" als hook |
| C | `Privé Jacuzzi & Sauna in Drenthe \| Slechts 2 Lodges, Geen Buren` | Sterkste emotionele hook, maar geen merknaam — slecht voor merkopbouw |

**Winnaar: B.** Reden: de merkcluster staat op gemiddeld positie 15,3 [ANALYSE] — Google heeft "Huis ter Huynen" nog niet als entiteit vastgelegd. De homepage is de plek om dat te repareren, dus daar hoort de merknaam vooraan. Bovendien vermijdt B kannibalisatie met LP3, die de jacuzzi-term moet krijgen. De differentiator "twee lodges" doet het werk dat "Lodge Drenthe" nu niet doet.

**Meta description (nieuw):**
`Twee vrijstaande lodges op de Drentse heide bij Zeijen, elk met privé jacuzzi en terras. Geen receptie, geen buren, geen gedeelde wellness. Vanaf €165 per nacht.`
*Reden voor "geen receptie, geen buren, geen gedeelde wellness": in een SERP vol parken en hotels is de negatie het sterkste onderscheid. Het beantwoordt precies de twijfel van iemand die net zes portalresultaten heeft gezien.*

## 7.2 De drie echte CTR-problemen

**`/blog/kanovaren-drentsche-aa`** — 93 vert., positie 9,8, **0 klikken** [GSC]
Bij positie 10 is 0% CTR uitzonderlijk laag; verwacht is 2–4%. Hypothese: de title is beschrijvend maar niet nieuwsgierig-makend, en de zoeker wil praktische informatie (waar huur ik, wat kost het, mag het overal).
→ **Nieuwe title:** `Kanoën op de Drentsche Aa: waar je start, wat het kost en wat je ziet`
→ **Meta:** `De Drentsche Aa is het mooiste beekdal van Nederland — en je vaart er zo doorheen. Startpunten, verhuuradressen, prijzen en de route die wij zelf het mooist vinden.`

**`/blog/een-dag-in-norg`** — 41 vert., positie 9,4, **0 klikken** [GSC]
→ **Nieuwe title:** `Een dag in Norg: wat te doen, waar te eten en wat je niet moet missen`

**`/de/ferienhaus-mit-whirlpool-drenthe`** — 15 vert., positie 9,5, **0 klikken** [GSC]
→ Duitse zoekers reageren sterk op concreetheid. **Nieuwe title:** `Ferienhaus mit Whirlpool in Drenthe | Nur 2 Lodges, ab €165/Nacht`

## 7.3 Titles voor de P0-landingspagina's (voorbereidend werk)

Deze wijzigingen leveren pas rendement op zodra de posities stijgen — maar ze moeten er staan vóórdat dat gebeurt, niet erna.

**LP2 — Romantisch weekend**

| Variant | Title |
|---|---|
| A | `Romantisch Weekendje Weg in Drenthe \| Huis ter Huynen` |
| B | `Romantisch Weekend Drenthe – Luxe Lodge met Privé Jacuzzi` |
| C | `Romantisch Weekendje Weg Drenthe \| Privé Jacuzzi voor Twee` |

**Winnaar: C.** Reden: bevat de exacte zoekopdracht (95 vert., "romantisch weekendje weg drenthe" — inclusief het verkleinwoord "weekendje" dat A en B missen), plus "voor twee", wat de belangrijkste onuitgesproken vraag beantwoordt in een SERP vol gezinsparken en hotels. Variant B verspilt ruimte aan "luxe lodge" (27 vert.).

**LP1 — Wellness**

| Variant | Title |
|---|---|
| A | `Wellness Vakantie Drenthe \| Lodge met Hottub & Sauna` *(huidig)* |
| B | `Wellness Huisje Drenthe \| Privé Sauna & Jacuzzi, Geen Gedeelde Spa` |
| C | `Wellness in Drenthe \| Eigen Sauna en Jacuzzi, Alleen voor U` |

**Winnaar: B.** Reden: "wellness huisje" is de grootste term in de cluster (128 vert.) en staat in A helemaal niet. "Geen gedeelde spa" is de directe tegenzet tegen de bungalowparken en wellnesshotels die deze SERP vullen — het beantwoordt de twijfel die de zoeker op dat moment heeft.

**LP3 — Jacuzzi**

**Winnaar:** `Vakantiehuis met Jacuzzi Drenthe | Privé Hottub bij Elke Lodge`
Reden: dit is de enige title die **beide** zoekvarianten bevat. Wie "hottub" typt ziet zijn woord, wie "jacuzzi" typt ook. "Bij elke lodge" communiceert impliciet dat er geen gedeelde voorziening is.

## 7.4 Meta descriptions — het principe

Er zit één patroon in alle winnende varianten hierboven, en dat is bewust: **elke meta description bevat een negatie.** "Geen gedeelde spa", "geen buren", "geen receptie", "geen tussenpersoon".

De reden is de SERP zelf. Een zoeker die op "wellness huisje drenthe" zoekt, ziet zes portalresultaten met tientallen accommodaties in bungalowparken. Zijn onuitgesproken twijfel is: *"is die wellness echt van mij, of deel ik hem met vijftig anderen?"* Het resultaat dat die twijfel als eerste wegneemt, wint de klik — ook vanaf een lagere positie. Dat is de enige manier waarop een aanbieder met twee eenheden het wint van een portal met tweehonderd.

---

# 8. CTA- & CRO-plan

## 8.1 De funnel en waar hij lekt

```
Google  →  Landingspagina  →  USP  →  Lodgekeuze  →  Beschikbaarheid  →  Prijs  →  Aanvraag  →  24u wachten  →  Boeking
   ①            ②             ③          ④               ⑤             ⑥         ⑦          ⑧            ⑨
```

| Lek | Waar | Bewijs | Ernst |
|---|---|---|---|
| **L1** | ①→② | 92% van de vertoningen op positie 31+ | [GSC] | **Kritiek** — behandeld in deel 2–5 |
| **L2** | ②→④ | **Stap ④ bestaat niet.** Er is geen pagina per lodge; de bezoeker springt van thema rechtstreeks naar een formulier | [CODE] | **Hoog** |
| **L3** | ②→⑤ | Elke CTA linkt naar `/#reserveren` op de homepage — contextverlies, geen voorselectie van thema, lodge of datum | [CODE] `LandingTemplate.tsx` | **Hoog** |
| **L4** | ⑥ | Geen prijs vóór de aanvraag: "De definitieve prijs wordt door ons bevestigd na je aanvraag", "Op aanvraag" | [CODE] | **Hoog** |
| **L5** | ⑦→⑨ | Aanvraagmodel met 24 uur wachttijd in plaats van directe bevestiging | [CODE] | **Middel-hoog** |
| **L6** | alle | CTA-teksten zijn inconsistent: hero `Bekijk beschikbaarheid →`, sticky mobiel `Claim uw datum →`, eind-CTA `Bekijk beschikbaarheid`, formulier `Reserveringsaanvraag versturen →` | [CODE] | **Middel** |

## 8.2 De primaire CTA — getoetst

De opdracht vermoedt "Bekijk beschikbaarheid". Dat vermoeden klopt, maar niet om de reden die u misschien denkt.

| Kandidaat | Belofte | Oordeel |
|---|---|---|
| **Bekijk beschikbaarheid** | Vrijblijvend kijken, geen commitment | **Winnaar** |
| Reserveer uw lodge | Verplichting | Te zwaar voor een eerste klik vanuit Google |
| Plan uw verblijf | Vaag | Onduidelijk wat er gebeurt na de klik |
| Bekijk vrije data | Idem aan winnaar | Iets minder gangbaar in NL |
| Claim uw datum | Urgentie + bezit | **Alleen geschikt in de sticky bar**, waar de bezoeker al scrollde |
| Bekijk beschikbare weekenden | Specifiek | Goed als *secundaire* CTA op LP2 |

**Winnaar: `Bekijk beschikbaarheid →`.** De doorslaggevende reden is uw eigen funnel: omdat er géén directe boeking is en er een aanvraag met 24 uur wachttijd volgt [CODE], moet de eerste CTA juist **zo licht mogelijk** zijn. Een zware CTA ("Reserveer") gecombineerd met een zware volgende stap (aanvraag zonder prijs) is een dubbele drempel. Eerst laten kijken, dan pas vragen.

**Belangrijke correctie op de huidige site:** `Claim uw datum →` staat nu in de sticky mobiele balk [CODE] — de plek waar de bezoeker hem als **eerste** ziet op mobiel, vaak vóór enige uitleg. Dat is precies omgekeerd. Zet daar `Bekijk beschikbaarheid →` en bewaar "Claim uw datum" voor het moment ná de lodgekeuze.

## 8.3 CTA's per zoekintentie

| Intentie / pagina | Primaire CTA | Secundair |
|---|---|---|
| Wellness (LP1) | `Bekijk beschikbaarheid →` | `Plan uw wellnessweekend →` |
| Romantiek (LP2) | `Bekijk vrije weekenden →` | `Plan jullie weekend →` |
| Jacuzzi (LP3) | `Bekijk beschikbaarheid →` | `Bekijk beide lodges →` |
| Lodgepagina's (LP4/5) | `Bekijk beschikbaarheid voor De Heide →` | `Vergelijk met De Eik →` |
| Locatie (LP7/8) | `Bekijk beschikbaarheid →` | `Bekijk de omgeving →` |
| Twijfelende bezoeker | `Welke lodge past bij u?` | — |
| Blog / informatief | `Slaap hier: bekijk de lodges →` | Nieuwsbrief |
| Contact | `Stel uw vraag via WhatsApp` | — |

**Eén opmerking over de aanspreekvorm:** de site wisselt nu tussen "u" en "je" — `LandingTemplate` gebruikt "Stel je vraag via WhatsApp" terwijl de eind-CTA "Boek uw vakantiehuis" zegt, en het boekingsformulier zegt "na je aanvraag" [CODE]. Kies er één. Voor een premium boutique-propositie met een gemiddelde nachtprijs van €165+ adviseer ik consequent **"u"**.

## 8.4 De vier CRO-ingrepen met de grootste omzetimpact

**CRO-A — Contextuele CTA-links (P0, halve dag werk)**
*Data:* alle CTA's linken naar `/#reserveren` [CODE]. *Hypothese:* bezoekers verliezen bij de paginawissel hun context en een deel haakt af. *Actie:* geef de CTA een parameter mee (`/#reserveren?van=wellness&lodge=heide`) en toon in de boekingssectie een regel die de context bevestigt: *"U bekijkt beschikbaarheid voor een wellnessverblijf in Lodge De Heide."* *KPI:* CTA-klik → formulierstart ≥60%.

**CRO-B — Prijsindicatie vóór de aanvraag (P0)**
*Data:* "Op aanvraag" en "De definitieve prijs wordt door ons bevestigd na je aanvraag" [CODE]. *Observatie:* de bezoeker moet zijn gegevens afstaan om te weten wat het kost. *Hypothese:* dit is het grootste conversielek in de funnel; prijsonzekerheid is in accommodatieboekingen de belangrijkste reden om af te haken. *Actie:* toon een indicatieve totaalprijs zodra data en lodge gekozen zijn, met de eerlijke toevoeging "definitieve prijs bevestigen wij binnen 24 uur". U hoeft het aanvraagmodel niet op te geven — u moet alleen de prijs niet meer achter het formulier verstoppen. *KPI:* formulierstart → verzonden aanvraag ≥55%.

**CRO-C — De lodgekeuzestap (P1)**
Zie LP4/LP5. *KPI:* ≥15% van de landingspagina-sessies raakt een lodgepagina.

**CRO-D — Reactietijd verkorten (P1, operationeel)**
*Data:* "U ontvangt binnen 24 uur een aanbod op maat" [CODE]. *Hypothese:* in de vakantiehuizenmarkt boekt een aanvrager binnen 24 uur vaak elders — zeker als hij bij drie aanbieders tegelijk aanvraagt. *Actie:* streef naar reactie binnen 2 uur tijdens kantooruren en communiceer dat ook ("meestal binnen 2 uur"). Dit is geen websitewijziging maar heeft waarschijnlijk meer omzetimpact dan enige SEO-actie in dit rapport. *KPI:* aanvraag → boeking ≥55%; mediane reactietijd < 2 uur.

## 8.5 CTA-plaatsing per paginatype

**Landingspagina (LP1–LP3, LP6–LP8)**
1. Boven de fold — primaire CTA + prijs vanaf *(bestaat al [CODE])*
2. Direct onder de intro — USP-balk: privé jacuzzi · slechts 2 lodges · geen gedeelde wellness · direct boeken
3. Na H2-2 — **nieuw**: inline CTA met contextuele tekst
4. Na de FAQ — **nieuw**: lodgekeuzeblok (twee kaarten, De Heide / De Eik) → dit vult lek L2
5. Eind-CTA — primair + WhatsApp *(bestaat al)*
6. Sticky mobiel — `Bekijk beschikbaarheid →` *(tekst wijzigen)*

**Lodgepagina (LP4/LP5)**
Boven de fold `Bekijk beschikbaarheid voor deze lodge →` · na de inventaris een prijstabel per seizoen · onderaan een vergelijkingsblok met de andere lodge · sticky mobiel.

**Blogartikel** — dit is nu het grootste gemiste rendement, want de blogs zijn uw best presterende pagina's [ANALYSE]:
1. Na de intro — één zin met contextuele link naar de relevante commerciële pagina
2. Halverwege — inline blok: *"Slapen op de heide? Wij hebben twee lodges met privé jacuzzi. → Bekijk beschikbaarheid"*
3. Onderaan — volledige CTA-sectie, dezelfde als op de landingspagina's
4. Sticky mobiel — ook op blogs

**Homepage** — hero-CTA · USP-blok · lodgekeuze · beschikbaarheidskalender · nieuwsbrief (voor wie nog niet boekt).

---

# 9. Interne linkmatrix

**Principe:** hub-and-spoke in plaats van iedereen-linkt-naar-iedereen. Informatieve pagina's met goede posities zijn **donoren**; commerciële pagina's zijn **ontvangers**. Beschrijvende ankertekst, geen generieke labels.

## 9.1 De donoren (uw autoriteitsbron)

| Bronpagina | Pos. | Vert. | → Doelpagina | Ankertekst | Reden |
|---|---|---|---|---|---|
| `/hunebedden-drenthe` | 13,0 | 568 | `/wellness-vakantie-drenthe` | "een wellness huisje op de heide" | Grootste zichtbaarheid van de site, geeft nu niets door |
| `/hunebedden-drenthe` | 13,0 | 568 | `/lodge-de-heide` | "Lodge De Heide, op 15 minuten" | Nabijheid = natuurlijke aanleiding |
| `/heide-drenthe` | 9,7 | 261 | `/romantisch-weekend-weg-drenthe` | "een romantisch weekend tijdens de heidebloei" | Beste positie van de site + seizoensintentie |
| `/heide-drenthe` | 9,7 | 261 | `/vakantiehuis-met-hottub-drenthe` | "vakantiehuis met privé-jacuzzi aan de heide" | |
| `/blog/kanovaren-drentsche-aa` | 9,8 | 93 | `/wellness-vakantie-drenthe` | "de sauna in na een dag op het water" | Natuurlijke thematische brug |
| `/blog/een-dag-in-norg` | 9,4 | 41 | `/vakantiehuis-norg` | "overnachten vlak bij Norg" | Lokale relevantie |
| `/blog/wilde-dieren-spotten…` | 8,4 | 27 | `/wandelroutes-drenthe` | "wandelroutes waar u ze ziet" | Hoogste CTR van de site |
| `/blog/mooie-fietsroutes-rondom-zeijen` | 7,8 | 25 | `/vakantiehuis-assen` | "een vakantiehuis bij Assen als uitvalsbasis" | Versterkt de best winbare pagina |
| `/blog/prive-lodge-boeken-nederland-kosten` | 6,4 | 10 | `/vakantiehuis-met-hottub-drenthe` | "wat een lodge met jacuzzi bij ons kost" | Positie 6,4 op een prijszoekopdracht = late funnel, sterkste conversiesignaal van de site |
| `/blog/drentsche-aa-beekdallandschap` | 12,6 | 19 | `/wandelroutes-drenthe` | "wandelen langs de Drentsche Aa" | |
| `/blog/e-bike-huren-in-drenthe` | 12,7 | 51 | `/fietsen-in-drenthe` | "fietsroutes vanuit Zeijen" | |

## 9.2 Tussen commerciële pagina's

| Bron | → Doel | Ankertekst |
|---|---|---|
| `/wellness-vakantie-drenthe` | `/vakantiehuis-met-hottub-drenthe` | "vakantiehuis met privé-jacuzzi" |
| `/wellness-vakantie-drenthe` | `/lodge-de-heide` | "Lodge De Heide, met eigen sauna" |
| `/romantisch-weekend-weg-drenthe` | `/vakantiehuis-met-hottub-drenthe` | "de jacuzzi op het terras" |
| `/vakantiehuis-met-hottub-drenthe` | `/lodge-de-heide` + `/lodge-de-eik` | "De Heide" / "De Eik" |
| `/vakantiehuis-assen` | `/lodge-de-eik` | "onze ruimste lodge" |
| `/lodge-de-heide` | `/lodge-de-eik` | "vergelijk met De Eik" |
| Homepage | alle drie de P0-pagina's | thematisch |

## 9.3 Wat er weg moet

Het generieke footerblok met 13 landingspaginalinks op élke pagina [CODE] `LANDING_NAV`: **terugbrengen naar maximaal 6 links**, en die 6 per paginatype laten verschillen. Nu ontvangt elke pagina evenveel interne links, waardoor geen enkele pagina eruit springt — precies de gelijkmatige positie-49-verdeling die we in 1.4 zagen. Een link die overal staat, telt nauwelijks; een link die contextueel in de tekst staat, telt wél.

---

# 10. 2027 Bezettings- & omzetstrategie

## 10.1 Het model

**Capaciteit 2027:** 2 lodges × 365 nachten = **730 lodge-nachten** [CODE].
**Vanafprijs:** €165 per nacht [CODE].

Alle conversiepercentages hieronder zijn **[AANNAME]** — branchebandbreedtes voor kleinschalige, direct boekende accommodatiesites. Ze zijn expliciet als bandbreedte gegeven omdat u nog geen eigen funneldata heeft; zodra GA4 draait, moeten ze door uw eigen cijfers vervangen worden.

| Funnelstap | Realistische bandbreedte | Gebruikt in model |
|---|---|---|
| Vertoning → klik (CTR) | 2,0 – 5,0% | 3,5% |
| Klik → sessie | 90 – 100% | 95% |
| Sessie → CTA-klik | 25 – 40% | 30% |
| CTA-klik → beschikbaarheid bekeken | 60 – 80% | 70% |
| Beschikbaarheid → aanvraag gestart | 25 – 40% | 30% |
| Gestart → aanvraag verzonden | 50 – 70% | 60% |
| Aanvraag → bevestigde boeking | 45 – 65% | 55% |
| **Sessie → boeking (samengesteld)** | **1,0 – 3,0%** | **2,1%** |

## 10.2 Drie scenario's voor 2027

| | Conservatief | **Target** | Stretch |
|---|---|---|---|
| Bezetting | 50% | **62%** | 72% |
| Verhuurde nachten (van 730) | 365 | **453** | 526 |
| Gemiddelde nachtprijs (ADR) | €185 | **€210** | €235 |
| **Omzet 2027** | **€67.500** | **€95.100** | **€123.600** |
| Gem. verblijfsduur [AANNAME] | 3,0 nachten | 3,0 | 3,0 |
| Aantal boekingen | 122 | 151 | 175 |
| Aandeel organisch/direct | 30% | **45%** | 55% |
| **Boekingen uit organisch** | **37** | **68** | **96** |
| Benodigde organische sessies/jaar | 2.470 | **3.240** | 3.840 |
| Sessies per maand | 206 | **270** | 320 |
| Klikken per maand | 217 | **284** | 337 |
| **Benodigde vertoningen/maand** | **6.200** | **8.100** | **9.600** |

*(Vertoningen bij CTR 3,5%; bij het conservatieve scenario is gerekend met 2,5% CTR.)*

## 10.3 Het 30.000-impressiesdoel — eerlijk antwoord

**Data:** het target-scenario vraagt ~8.100 relevante vertoningen per maand. Uw huidige niveau is ~2.400 per maand [ANALYSE, op basis van 7.288 vertoningen / 3 maanden — meetperiode niet bevestigd].

**Oordeel: 30.000 vertoningen per maand is haalbaar, maar het is het verkeerde doel.**

Twee redenen.

**Ten eerste is het 3,7× meer dan u nodig heeft.** Bij 30.000 vertoningen en 3,5% CTR komen er 1.050 klikken per maand binnen. Bij 2,1% conversie zijn dat 22 boekingen per maand — 264 per jaar, terwijl uw hele capaciteit 151 boekingen is. U zou meer dan 100 boekingen per jaar moeten weigeren. Dat is geen luxeprobleem maar verkeerd besteed budget: elke euro die naar vertoning 10.000-en-verder gaat, had naar ADR-verhoging of conversie kunnen gaan.

**Ten tweede stuurt het doel u de verkeerde kant op.** De goedkoopste weg naar 30.000 vertoningen loopt via informatieve content — hunebedden, wandelroutes, "wat te doen in Drenthe". Die cluster heeft boekingsnabijheid 1/5 [ANALYSE]. U zou het cijfer halen en er geen nacht extra mee verkopen.

**Beter doel:** **8.000–12.000 *commerciële* vertoningen per maand** (clusters jacuzzi, wellness, romantiek, locatie) bij een CTR van ≥3,5%, met als bovenliggende KPI **organisch toegeschreven nachten**. Dat is meetbaar, het is genoeg, en het stuurt op omzet in plaats van op zichtbaarheid.

Als u een totaalcijfer wilt om aan te refereren: 20.000–25.000 vertoningen per maand eind 2027 is een realistisch neveneffect van dit plan, waarvan dan ongeveer de helft commercieel. Maar stuur er niet op.

## 10.4 Forecast

| Moment | Vertoningen/mnd | CTR | Klikken/mnd | Positie (commercieel) | Boekingen/mnd |
|---|---|---|---|---|---|
| **Nu (aug 2026)** | ~2.400 | 1,2% | ~28 | 49,5 | 0 (nog niet open) |
| **90 dagen (nov 2026)** | 4.000 – 6.000 | 1,8% | 70 – 110 | 35 – 40 | 0 · doel: eerste 2027-aanvragen |
| **180 dagen (feb 2027)** | 8.000 – 12.000 | 2,8% | 220 – 340 | 22 – 28 | 3 – 6 |
| **Eind 2027** | 18.000 – 25.000 | 3,5% | 630 – 875 | 12 – 18 | 10 – 15 |

**Aannames:** (a) de meetperiode van de export is 3 maanden — *moet bevestigd worden*; (b) de P0-acties worden binnen 30 dagen uitgevoerd; (c) er komen 2–3 artikelen per maand bij; (d) GBP wordt geverifieerd en actief onderhouden; (e) er komen vanaf januari 2027 echte reviews binnen. **Valt (d) of (e) weg, dan schuift de hele curve 3–6 maanden op** — reviews en GBP zijn voor lokale accommodatiezoekopdrachten geen bijzaak.

**Belangrijke waarschuwing bij de eerste twee kolommen:** verwacht in de eerste 60–90 dagen géén klikgroei. Zoals in 2.8 uitgelegd bestaat de quick-win-laag hier niet; de eerste maanden zijn herbouw, en de beweging wordt zichtbaar in de positie-metriek voordat hij zichtbaar wordt in klikken. Beoordeel het plan in november 2026 dus op **positieverbetering**, niet op verkeer.

## 10.5 Welke input ik nog nodig heb

Zonder deze gegevens blijft een deel van het model schatting:

1. **Meetperiode van de GSC-export** — verandert de hele forecast met een factor 3
2. **Google Analytics / GA4-toegang** — nu is er geen enkel zicht op sessies, CTA-kliks of formulierstarts. De hele CRO-kolom van het dashboard is nu onmeetbaar
3. **Bestaat er een geverifieerd Google Business Profile?** — zie 1.5
4. **Werkelijke prijsstructuur per seizoen** — het model gebruikt één ADR; in de praktijk verschilt december van maart aanzienlijk
5. **Kostenstructuur per nacht** — nodig om op winst te sturen in plaats van op omzet
6. **Verwachte OTA-strategie** — gaat u op Natuurhuisje/Booking? Dat bepaalt of het 45%-organische-aandeel realistisch is
7. **Aantal beschikbare nachten in 2027** — het model rekent met 365 dagen per lodge; eigen gebruik of onderhoud verlaagt dat

---

# 11. Seizoenskalender 2027

**Principe:** content moet 8–12 weken vóór de vraagpiek live staan.

| Maand | Vraagthema | Content live vanaf | Prijsstrategie |
|---|---|---|---|
| Januari | Wellness, winterstilte, nieuwjaar | **november 2026** | Laag seizoen — lange verblijven stimuleren (3+ nachten) |
| Februari | **Valentijn** — hoogste ADR-kans van het eerste kwartaal | **december 2026** | Piektarief voor 12–16 feb, minimaal 2 nachten |
| Maart | Voorjaar, wandelen, krokusvakantie | januari 2027 | Midden |
| April | Pasen, voorjaarsbloei | februari 2027 | Piek in de paasweek |
| Mei | Hemelvaart, Pinksteren, meivakantie | maart 2027 | **Hoogste piek van het voorjaar** — minimaal 3 nachten |
| Juni | Zomer, fietsen, TT Assen (eind juni) | april 2027 | Piek in de TT-week — dit is de grootste lokale vraagpiek en staat nu nergens op de site |
| Juli | Zomervakantie | mei 2027 | Hoogseizoen, weekverblijven |
| Augustus | **Heidebloei** — uw sterkste natuurlijke piek | **juni 2027** | Hoogseizoen. `/heide-drenthe` staat al op positie 9,7 |
| September | Nazomer, heide, rust, wellness | juli 2027 | Midden-hoog — beste marge/bezetting-verhouding |
| Oktober | Herfst, wellness, herfstvakantie | augustus 2027 | Midden |
| November | Wellness, donkere dagen, weekendjes | september 2027 | Laag — actief sturen op 2- en 3-nachtenpakketten |
| December | Kerst, oud & nieuw, romantiek | **oktober 2027** | Piektarief kerst/oud&nieuw, minimaal 3–4 nachten |

**Twee opmerkingen bij deze kalender:**

De heidebloei (augustus) is uw enige piek waar u nu al een top-10-positie heeft [GSC]. Behandel `/heide-drenthe` daarom als seizoensasset: actualiseer hem elk jaar in juni, met een actuele bloeiverwachting. "wanneer bloeit de heide in drenthe" staat op positie 10,9 — dat is met een jaarlijkse update naar de top 3 te brengen.

De TT-week in Assen (eind juni) is de grootste vraagpiek in uw directe omgeving en komt op de hele site niet voor [CODE]. Dat is een gemiste kans op zowel bezetting als ADR — accommodaties binnen 25 km van het circuit rekenen die week aanzienlijk meer. Voeg het toe aan `/vakantiehuis-assen` (LP7).

---

# 12. 90-dagenplan

## Week 1 — Meten en repareren
- [ ] GSC opnieuw exporteren mét datumbereik; GA4 verifiëren of installeren
- [ ] Controleren of er een geverifieerd Google Business Profile is; zo niet: aanmaken en verifiëren *(hoogste ROI-actie van het hele plan als hij ontbreekt)*
- [ ] Sticky mobiele CTA: `Claim uw datum` → `Bekijk beschikbaarheid`
- [ ] Aanspreekvorm uniformeren naar "u"
- [ ] `noindex` op `/impressum`, `/datenschutz`, `/agb`, `/privacy`, `/terms`, `/welkom`; uit de sitemap

## Week 2 — De drie 301's en de jacuzzi-correctie
- [ ] 301: `/blog/vakantiehuis-met-prive-hottub…` → `/vakantiehuis-met-hottub-drenthe` (beste alinea's eerst overzetten)
- [ ] 301: `/blog/wellness-in-drenthe` → `/wellness-vakantie-drenthe`
- [ ] 301: `/wandelen-drentsche-aa` → `/wandelroutes-drenthe`
- [ ] 301: de 250-tekens-fietsslug → `/blog/fietsen-in-drenthe`
- [ ] "Jacuzzi" toevoegen aan title, H1, intro en FAQ van LP3
- [ ] Homepage-title en meta description vervangen (variant B, 7.1)

## Week 3–4 — LP1 en LP2 herbouwen
- [ ] `/wellness-vakantie-drenthe` volledig herschrijven volgens LP1
- [ ] `/romantisch-weekend-weg-drenthe` volledig herschrijven volgens LP2
- [ ] Titles/meta's van beide vervangen
- [ ] `Offer`-schema met €165 toevoegen aan LodgingBusiness

## Week 5–6 — Interne links en CRO-A
- [ ] Volledige linkmatrix uit deel 9 doorvoeren (11 donorlinks + 7 commerciële)
- [ ] Footerblok terugbrengen van 13 naar 6 links, per paginatype verschillend
- [ ] Contextuele CTA-parameters (CRO-A)
- [ ] Blogs voorzien van inline CTA-blok halverwege + sticky CTA

## Week 7–8 — Lodgepagina's
- [ ] `/lodge-de-heide` en `/lodge-de-eik` bouwen en publiceren
- [ ] Lodgekeuzeblok toevoegen na de FAQ op LP1, LP2, LP3
- [ ] Boekingsflow: lodge-voorselectie via parameter

## Week 9–10 — Prijstransparantie (CRO-B)
- [ ] Indicatieve totaalprijs tonen zodra data + lodge gekozen zijn
- [ ] Reactietijd-belofte herzien naar "meestal binnen 2 uur" (CRO-D)
- [ ] CTR-titles voor de drie echte CTR-problemen (7.2)

## Week 11–12 — Local & meten
- [ ] GBP volledig invullen: foto's, faciliteiten, openingsdatum, Q&A
- [ ] Aanmelden bij drenthe.nl, marketingdrenthe, VVV Zeijen/Norg, origineelovernachten.nl, bijzonderplekje.nl, naturescanner.nl *(zie 7.3 — dit is hoe u de listicle-SERP's wint)*
- [ ] Eerste maanddashboard opleveren (deel 13)
- [ ] LP6, LP7, LP8 optimaliseren

---

# 13. KPI-dashboard

**Leidende KPI's** (hierop stuurt u): **organisch toegeschreven nachten** · **aanvraag→boeking-ratio** · **ADR**.
**Volgende KPI's** (deze verklaren de leidende): alle andere.

| Categorie | KPI | Nulmeting | Doel 90 dgn | Doel 2027 |
|---|---|---|---|---|
| **SEO** | Vertoningen/maand | ~2.400 | 4.000–6.000 | 18.000–25.000 |
| | Commerciële vertoningen/maand | ~1.700 | 3.000 | 8.000–12.000 |
| | Klikken/maand | ~28 | 70–110 | 630–875 |
| | CTR | 1,2% | 1,8% | 3,5% |
| | Gew. gem. positie (commercieel) | 49,5 | 35–40 | 12–18 |
| | Keywords in top 10 | 16 (waarvan 8 merk) | 25 | 60 |
| | Keywords in top 20 | 31 | 45 | 100 |
| | **Niet-merkgebonden klikken** | **0** | **>40/mnd** | **>500/mnd** |
| **CRO** | Landingspagina → CTA-klik | onbekend | 30% | 35% |
| | CTA-klik → beschikbaarheid | onbekend | 70% | 75% |
| | Beschikbaarheid → aanvraagstart | onbekend | 30% | 35% |
| | Aanvraag verzonden | onbekend | 55% | 60% |
| | **Sessie → boeking** | onbekend | 1,5% | 2,1% |
| **Revenue** | Boekingen/maand (organisch) | 0 | — | 5–8 |
| | Nachten/maand | 0 | — | 38 |
| | Bezetting | — | — | 62% |
| | ADR | — | — | €210 |
| | Omzet 2027 | — | — | €95.100 |
| | **Omzet per organische bezoeker** | — | — | €29 |

De regel **"niet-merkgebonden klikken"** is de eerlijkste enkele graadmeter die u heeft. Hij staat nu op nul. Zolang hij op nul staat, werkt geen enkel ander cijfer in dit dashboard.

---

# 14. Backlog

| Prio | Actie | URL | Impact | Effort | SEO-effect | Conversie-effect |
|---|---|---|---|---|---|---|
| **P0** | GBP verifiëren/aanmaken | — | 5 | 2 | Hoog (lokaal) | Hoog |
| **P0** | LP1 herbouwen | `/wellness-vakantie-drenthe` | 5 | 4 | Hoog | Middel |
| **P0** | LP2 herbouwen | `/romantisch-weekend-weg-drenthe` | 5 | 4 | Hoog | Hoog |
| **P0** | Jacuzzi-correctie | `/vakantiehuis-met-hottub-drenthe` | 4 | 1 | Middel | Middel |
| **P0** | Homepage title/meta | `/` | 4 | 1 | Middel | Middel |
| **P0** | 4× 301-redirect | zie week 2 | 3 | 1 | Middel | — |
| **P0** | Contextuele CTA's (CRO-A) | alle LP's | 4 | 2 | — | Hoog |
| **P0** | Sticky CTA-tekst | alle | 2 | 0,5 | — | Middel |
| **P1** | Interne linkmatrix | 18 pagina's | 5 | 3 | Hoog | Laag |
| **P1** | Lodgepagina's bouwen | `/lodge-de-heide`, `/lodge-de-eik` | 4 | 4 | Middel | Hoog |
| **P1** | Prijsindicatie (CRO-B) | boekingsflow | 5 | 3 | — | Hoog |
| **P1** | Reactietijd < 2 uur (CRO-D) | operationeel | 5 | 2 | — | Hoog |
| **P1** | `Offer`-schema | alle | 3 | 1 | Middel | — |
| **P1** | CTR-titles 3 pagina's | zie 7.2 | 3 | 1 | Middel | — |
| **P1** | LP7 + LP8 optimaliseren | Assen, Veenhuizen | 4 | 2 | Hoog | Middel |
| **P1** | Blog-CTA's | 12 blogs | 4 | 2 | — | Hoog |
| **P2** | LP6 optimaliseren | `/luxe-lodge-drenthe` | 3 | 2 | Middel | Laag |
| **P2** | Portal-/listicle-vermeldingen | extern | 4 | 3 | Hoog | Middel |
| **P2** | Contentplan uitvoeren | blog | 4 | doorlopend | Hoog | Middel |
| **P2** | Hond-cluster: besluit | `/vakantiehuis-drenthe-met-hond` | 2 | 1 | Laag | Laag |
| **P2** | `noindex` rechtspagina's | 6 URL's | 2 | 0,5 | Laag | — |
| **P3** | DE-markt herbeoordelen | `/de/*` | 3 | 3 | Middel | Middel |
| **P3** | `aggregateRating` (na 5 reviews) | alle | 4 | 1 | Hoog | Hoog |
| **P3** | `revalidate` naar 3600 | technisch | 1 | 0,5 | — | — |

*Impact en effort op een schaal van 1–5.*

---

# 15. De 10 acties die ik als eerste zou uitvoeren

> *"Als ik morgen verantwoordelijk zou zijn voor de bezetting van Huis ter Huynen in 2027, wat zijn dan de 10 acties die ik als eerste zou uitvoeren?"*

1. **Controleer of er een geverifieerd Google Business Profile is — en zo niet, maak hem vandaag aan.** Voor een accommodatie met een fysiek adres is dit het zwaarstwegende lokale rankingsignaal dat bestaat, en het verklaart mede waarom zelfs uw eigen merknaam gemiddeld op positie 15,3 staat. Kosten: nul. Doorlooptijd: een uur plus verificatie.

2. **Herbouw `/wellness-vakantie-drenthe` en richt hem op "wellness huisje".** 1.526 vertoningen, positie 62,6, nul klikken — de grootste pagina van de site presteert het slechtst, en het woord waarop de markt zoekt staat er niet in.

3. **Duw `/romantisch-weekend-weg-drenthe` naar pagina 1.** De hoofdterm staat op 26,4 en dat is de enige commerciële term met volume die binnen bereik ligt. Dit is uw eerste realistische niet-merkgebonden klik.

4. **Zet "jacuzzi" in de title, H1 en FAQ van de hottubpagina.** Een uur werk voor de grootste vraagcluster die u heeft (754 versus 249 vertoningen). Laat de URL staan.

5. **Repareer de CTA-paden.** Elke landingspagina schiet de bezoeker nu naar een generieke homepage-sectie, waarmee de complete opbouw van de pagina verloren gaat. Geef context mee en bevestig die zichtbaar in de boekingssectie.

6. **Toon een prijs vóór het formulier.** "Op aanvraag" is op dit moment waarschijnlijk het duurste woord op de website. U mag het aanvraagmodel houden; u moet alleen de prijs niet meer verbergen.

7. **Verkort de reactietijd van 24 uur naar 2 uur en zeg dat ook.** Geen SEO-actie, wel vermoedelijk de hoogste omzetimpact per bestede euro in dit hele rapport. Een aanvrager die 24 uur wacht, heeft vaak al ergens anders geboekt.

8. **Laat uw drie best rankende pagina's hun autoriteit doorgeven.** `/hunebedden-drenthe` (568 vertoningen, positie 13), `/heide-drenthe` (261, positie 9,7) en de blogs op positie 8–10 zijn de enige pagina's die Google echt waardeert. Ze linken nu alleen generiek. Elf contextuele links, één middag werk.

9. **Bouw `/lodge-de-heide` en `/lodge-de-eik`.** Er is nu geen enkele stap waarin de bezoeker een lodge kiest — terwijl kiezen precies de stap is die twijfel omzet in een boeking. Bovendien vangt het long tail die uw themapagina's niet kunnen bedienen.

10. **Kom in de listicles in plaats van ertegen te vechten.** origineelovernachten.nl, bijzonderplekje.nl, naturescanner.nl, luxevakantieplekjes.nl, drenthe.nl: samen bezetten zij de top 10 van "bijzonder overnachten Drenthe", "wellness huisje Drenthe" en "huisje met hottub Drenthe". Die SERP's wint u niet met een betere pagina — die wint u door erin te staan. En "nieuwe boutique lodges, opening januari 2027" is precies het verhaal waar zij nu naar op zoek zijn. Dat venster sluit zodra u niet meer nieuw bent.

---

## Bijlage — Reproduceerbaarheid

De clustering, intentieclassificatie, positiebuckets en opportunity scores in dit rapport zijn berekend met een Python-script over de twee aangeleverde CSV-exports. De scorelogica staat volledig beschreven in 2.5; de clusterregels, intentietoewijzingen en relevantie-/winbaarheidsfactoren zijn expliciet en navolgbaar. Elk cijfer in dit rapport is herleidbaar tot [GSC], [CODE] of een expliciet gemarkeerde [AANNAME].

**Waar dit rapport bewust géén antwoord op geeft**, omdat de data het niet toelaat: externe zoekvolumes, backlinkprofielen (van u of van concurrenten), on-page-metingen van concurrentpagina's, en werkelijke conversiepercentages. Voor alle vier geldt: liever een gemarkeerd gat dan een plausibel klinkend getal.

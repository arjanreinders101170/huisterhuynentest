# SEO + AI Search Audit — Huis ter Huynen

**Opgesteld:** 21 september 2026 · **Scope:** https://www.huisterhuynen.nl · **Status:** nulmeting, geen wijzigingen doorgevoerd

---

## 0. Wat is wel en niet onderzocht

Dit bepaalt de waarde van elke conclusie hieronder, dus het staat vooraan.

### Wel beschikbaar

| Bron | Wat het oplevert |
|---|---|
| **Volledige broncode** van de productiesite (Next.js App Router) | Exacte metadata, JSON-LD, canonicals, sitemapgeneratie, redirects, headers, middleware. Betrouwbaarder dan het scrapen van HTML, omdat de bron zichtbaar is inclusief de voorwaarden waaronder iets wél of niet wordt uitgeserveerd. |
| **Websearch** | Externe vermeldingen, entiteitssignalen, indexatiebewijs, en welke accommodaties er in de commerciële SERP's staan. |
| **Productiebuild** | De volledige routelijst en het rendertype per route (statisch / SSG / dynamisch). |

### Niet beschikbaar — expliciet vermeld

| Ontbrekend | Gevolg voor dit rapport |
|---|---|
| **Toegang tot de live site** | De netwerkproxy blokkeert `www.huisterhuynen.nl` (403 op CONNECT, vastgelegd in het prox­ylog om 10:12:37Z). Ik kon geen enkele pagina, HTTP-header of `robots.txt` live ophalen. **Alles over de gedeployde staat is afgeleid uit de broncode, niet geverifieerd op productie.** Waar dat verschil uitmaakt, staat het erbij. |
| **Google Search Console** | Geen vertoningen, posities, CTR, dekkingsrapport of sitemapstatus. De GSC-cijfers die in dit rapport voorkomen, komen uit codecommentaar in de repo (een eerdere export) en zijn gemarkeerd als zodanig. |
| **Bing Webmaster Tools** | Geen indexatiestatus voor Bing. Niet verifieerbaar met de beschikbare toegang. |
| **Supabase** | Geen databasegegevens. De blogartikelen en landingspagina's staan in de database; ik zie de seed-versies in de repo, niet noodzakelijk wat er live staat. |
| **Directe AI-zoekopdrachten** in ChatGPT Search, Perplexity, Gemini, Claude | Ik kan deze systemen niet bevragen. Wat ik wél deed: dezelfde vragen via websearch stellen en vastleggen welke bronnen en accommodaties naar boven komen. Dat is een indicatie van de onderliggende bronnenlaag, **geen** meting van wat een specifiek AI-systeem antwoordt. |
| **Lighthouse / CrUX / veldmetingen** | Geen LCP, INP, CLS of TTFB. De performance-sectie is een codeanalyse, geen meting. |

> **ASSUMPTION** (expliciet): ik ga ervan uit dat de code in deze repo overeenkomt met wat er op productie draait. De `main`-branch is recent gemerged en gedeployed via Vercel, maar ik kon dat niet verifiëren.

---

# Executive Summary

**De technische SEO van deze site is goed tot zeer goed.** Canonicals, hreflang-paren, een sitemap met echte `lastmod`-waarden, een 301-map die tegelijk de sitemap en de interne links filtert, `noindex` op de juiste pagina's, CSP en HSTS, FAQPage-schema, per-artikel gegenereerde OG-afbeeldingen. Dit is niet het werk van een standaardthema. Op de checklist van sectie 2 zijn er nauwelijks fouten te vinden.

**Het probleem zit niet in de techniek. Het zit in de entiteit.**

De naam "Huis ter Huynen" is niet van deze accommodatie alleen. Uit publieke bronnen blijkt dat **Resort Huis ter Huynen een vastgoedontwikkeling is van Kleen Resorts: 70 recreatiewoningen op koopkavels in Zeijen**, verkocht als tweede woning of belegging, op hetzelfde adres (Zuiderstraat 6-P…) als dat in de JSON-LD van deze site staat. Op Booking.com staat de eigen lodge als *"Lodge Huis ter Huynen 57 — De Eik met Hottub"* onder de URL `resort-huis-ter-huynen-57`.

De site declareert intussen een `LodgingBusiness` met de kale naam "Huis ter Huynen" op dat adres, **zonder één enkele `sameAs`-verwijzing**. Voor Google en voor elk AI-systeem is er daardoor geen enkel anker dat zegt: *dit bedrijf is de verhuur van twee specifieke lodges binnen dat park, en niet het park zelf, en niet de makelaardij.* Het codecommentaar in `layout.tsx` meldt dat de merkcluster gemiddeld op positie **15,3** staat — een merknaam die niet op 1 staat, is vrijwel altijd een entiteitsprobleem, geen contentprobleem.

**Tweede bevinding: de site is afwezig in de commerciële SERP.** Op de kernvraag *"bijzonder overnachten Drenthe luxe vakantiehuis hottub sauna"* wordt Huis ter Huynen niet genoemd. Het antwoord bestaat volledig uit portals (origineelovernachten.nl, bijzonderplekje.nl, drenthe.nl, galekkeropvakantie.nl) plus één directe concurrent met een eigen sterke site (deviereiken.nl). Dat bevestigt de eerdere analyse in de repo.

**Derde bevinding: externe bronnen dragen nog de oude openingsdatum.** Meerdere partijen melden "beschikbaar vanaf 1 januari 2027". Die datum is deze week op de eigen site gewijzigd naar 1 april 2027, maar externe bronnen volgen niet vanzelf.

De tien belangrijkste acties staan in sectie 28. De drie die er het meest toe doen: **`sameAs` toevoegen, de entiteit expliciet afbakenen tegenover het gelijknamige park, en in de portals komen in plaats van ertegen te vechten.**

---

# 1. Huidige situatie

## 1.1 Routes en paginatypes

**FACT** — uit de productiebuild:

| URL | Type | Render | Primaire intentie | AI-intentie |
|---|---|---|---|---|
| `/` | Homepage | Statisch | Merk + "lodge Drenthe" | Wat is Huis ter Huynen? |
| `/de` | Homepage DE | Statisch | Merk + "Lodge Drenthe" (DE) | Was ist Huis ter Huynen? |
| `/omgeving` | Hub omgeving | Statisch | "wat te doen in Drenthe" | Wat kun je rond Zeijen doen? |
| `/blog` | Blogindex | ISR 1m | Navigatie | — |
| `/blog/[slug]` | Artikel | Dynamisch | Informationeel long-tail | Bronmateriaal |
| `/faq` | FAQ | Statisch | Bezwaren wegnemen | Directe antwoordbron |
| `/[slug]` × 16 | Landingspagina's | SSG, ISR 1m | Commercieel | Aanbevelingsbron |
| `/de/[slug]` × 4 | Landingspagina's DE | SSG, ISR 1m | Commercieel (DE) | Aanbevelingsbron |
| `/agb`, `/impressum`, `/privacy`, `/terms`, `/datenschutz` | Juridisch | Statisch | — | Vertrouwenssignaal |
| `/welkom`, `/betaald`, `/bevestig`, `/concierge` | Gastenflow | Afgeschermd | — | — |
| `/admin/*`, `/offerte/*` | Beheer | Afgeschermd | — | — |

De zestien NL-landingspagina's: `vakantiehuis-met-hottub-drenthe`, `luxe-lodge-drenthe`, `romantisch-weekend-weg-drenthe`, `wellness-vakantie-drenthe`, `vakantiehuis-assen`, `vakantiehuis-norg`, `bijzonder-overnachten-drenthe`, `vakantiehuis-drenthe-met-hond`, `hunebedden-drenthe`, `overnachten-veenhuizen`, `heide-drenthe`, `wandelroutes-drenthe`, `fochteloerveen-drenthe`, `fietsen-in-drenthe`, `lodge-de-heide`, `lodge-de-eik`.

**OBSERVATION** — er is **geen contactpagina**. Adres en e-mail staan in de footer van de homepage (`page.tsx:1282`, `:1293`). Er is geen URL die je aan iemand kunt geven, en geen pagina die een AI-systeem als "contactinformatie van deze organisatie" herkent.

## 1.2 Kan een AI-systeem binnen enkele seconden begrijpen wat dit is?

**Deels.** De homepage-title is uitstekend voor dit doel:

> `Huis ter Huynen | Twee Lodges met Privé Hottub op de Drentse Heide`

Type, aantal, faciliteit en regio staan in één regel. De meta description voegt plaats, prijs en drie negatieve differentiators toe ("geen receptie, geen buren, geen gedeelde wellness"). Dat is beter dan wat de meeste accommodaties doen.

**Wat een AI-systeem níét betrouwbaar kan afleiden:**

1. Dat dit **niet** het 70-woningen-park is dat dezelfde naam draagt (sectie 6).
2. Dat de accommodatie **nog niet open is** — de `Offer` in de JSON-LD staat op `availability: InStock` terwijl de opening 1 april 2027 is.
3. Wie de eigenaar is. Er is een auteursnaam op blogartikelen ("Arjan Reinders") maar geen `Person`-entiteit, geen over-ons-pagina, geen koppeling tussen auteur en organisatie.
4. Hoe de accommodatie zich verhoudt tot externe vermeldingen: er is geen `sameAs`.

---

# 2. Technical SEO

## 2.1 Crawling & indexatie

| Onderdeel | Status | Bewijs |
|---|---|---|
| `robots.txt` | **Goed** | `public/robots.txt`: `Allow: /` met gerichte `Disallow` op `/admin`, `/api/`, `/betaald`, `/bevestig`, `/offerte`, `/concierge`. Sitemap-verwijzing aanwezig en absoluut. |
| XML-sitemap | **Goed** | `src/app/sitemap.ts` genereert dynamisch, inclusief blogartikelen en landingspagina's uit de database. |
| `lastmod` | **Goed** | Gebruikt de nieuwste van `updated_at` en `gepubliceerd_op`; laat het veld weg als de datum onbekend is. Het commentaar legt uit waarom: *"een ontbrekende lastmod is neutraal, een onjuiste niet."* Dat is correct. |
| Canonicals | **Goed** | `alternates.canonical` op layout, landingspagina's (`[slug]/page.tsx:32`), blogartikelen (`blog/[slug]/page.tsx:49`) en `/faq`. Altijd absoluut, altijd de `www`-host via één constante (`lib/site.ts`). |
| `noindex` | **Goed** | Juridische pagina's, `/welkom`, `/betaald`, `/bevestig`, `/concierge/locked`, `/admin`. |
| Redirects | **Goed** | `src/lib/redirects.ts` is één bron van waarheid; `next.config.ts` maakt er expliciete **301**'s van (niet 308). Dezelfde lijst filtert de sitemap én het blogoverzicht — dat voorkomt de klassieke fout van een 301'd pad dat in de sitemap blijft staan. |
| Sitemap-index | **N.v.t.** | Eén sitemap volstaat bij dit volume (~40 URL's). |
| HTTPS / HSTS | **Goed** | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` in `next.config.ts`, bewust daar en niet in `vercel.json`. |
| `X-Robots-Tag` | **Niet verifieerbaar** | Wordt niet in de code gezet. Of Vercel er zelf een toevoegt, kan ik zonder live toegang niet vaststellen. |
| www/non-www | **Niet verifieerbaar** | De code gebruikt consequent `https://www.huisterhuynen.nl`. Of `huisterhuynen.nl` (zonder www) 301't naar www, is een DNS/Vercel-instelling die ik niet kan zien. **Controleer dit handmatig.** |
| Trailing slash | **Niet verifieerbaar** | Geen `trailingSlash`-instelling in `next.config.ts`, dus Next.js' standaard (geen trailing slash, met redirect). |
| Soft 404's | **Aandachtspunt** | `/_not-found` bestaat. Of een niet-bestaande landingsslug een echte 404 geeft of een lege pagina, kon ik niet live testen. |

**RECOMMENDATION** — drie dingen handmatig verifiëren zodra iemand bij de live site kan:

```
curl -sSI https://huisterhuynen.nl/            # verwacht: 301 → https://www.huisterhuynen.nl/
curl -sSI https://www.huisterhuynen.nl/bestaat-niet   # verwacht: 404
curl -sS  https://www.huisterhuynen.nl/sitemap.xml | head -40
```

## 2.2 Orphan pages

**OBSERVATION** — `/faq` staat in de sitemap en heeft FAQPage-schema, maar wordt vanuit de footer-sets maar beperkt gelinkt. De twee lodgepagina's (`lodge-de-heide`, `lodge-de-eik`) worden gelinkt vanuit het lodgekeuzeblok op de landingspagina's — dat is goed opgezet.

---

# 3. On-page SEO

## 3.1 Homepage

**FACT** — huidige waarden uit `src/app/layout.tsx`:

| Element | Huidig |
|---|---|
| Title | `Huis ter Huynen \| Twee Lodges met Privé Hottub op de Drentse Heide` (66 tekens) |
| Description | `Twee vrijstaande lodges op de Drentse heide bij Zeijen, elk met privé hottub en terras. Geen receptie, geen buren, geen gedeelde wellness. Vanaf €165 per nacht.` (159 tekens) |
| Robots | `index, follow` + `max-image-preview:large`, `max-snippet:-1`, `max-video-preview:-1` |
| OG | Compleet: type, locale, url, siteName, title, description, image 1200×630 met alt |
| Twitter | `summary_large_image`, compleet |
| hreflang | `nl`, `de`, `x-default` |
| RSS | `application/rss+xml` in `<head>` |

**Dit is goed.** De `max-image-preview:large` en `max-snippet:-1` zijn precies wat je wilt voor zowel Discover als AI Overviews — een grotere snippet is een grotere kans om geciteerd te worden.

**OBSERVATION** — de `keywords`-metatag wordt gevuld met veertien termen. Google negeert dit veld sinds 2009. Het is niet schadelijk, maar het is ook geen signaal. Geen prioriteit.

## 3.2 Terminologie: "hottub" versus "jacuzzi"

**FACT** — de site gebruikt bewust overal "hottub", vastgelegd in `migrations/2026_09_04_hottub_als_enige_term.sql`. Het codecommentaar noemt de zoekvolumes: hottub 249, jacuzzi 754.

**OBSERVATION** — de keuze voor één term is verdedigbaar voor merkconsistentie, maar het sluit een driemaal groter zoekvolume uit. Voor **AI-systemen** is dit relevanter dan voor Google: een LLM dat een vraag over "jacuzzi" beantwoordt, matcht op semantiek en niet op exacte term, maar het heeft wél een expliciete koppeling nodig om te weten dat het om hetzelfde gaat.

**RECOMMENDATION** — laat "hottub" de primaire term, maar voeg één expliciete gelijkstelling toe op de FAQ en in de `amenityFeature`:

```
Huidig:   { "@type": "LocationFeatureSpecification", "name": "Privé hottub", "value": true }
Gewenst:  { "@type": "LocationFeatureSpecification",
            "name": "Privé hottub (jacuzzi / whirlpool)",
            "alternateName": ["Jacuzzi", "Whirlpool", "Bubbelbad"],
            "value": true }
```

Plus een FAQ-vraag: *"Is de hottub hetzelfde als een jacuzzi?"* → *"Ja. Wij noemen het een hottub; jacuzzi, whirlpool en bubbelbad verwijzen naar dezelfde voorziening op het terras van beide lodges."* Dat is één zin die de term-kloof dicht voor zowel Google als een LLM.

## 3.3 Zoektermen uit de opdracht — dekking

| Term | Gedekt? | Waar |
|---|---|---|
| luxe vakantiehuis Drenthe | Deels | `/luxe-lodge-drenthe` gebruikt "lodge", niet "vakantiehuis" |
| luxe vakantiehuis Zeijen | **Nee** | Zeijen komt voor, maar geen pagina op deze combinatie |
| boutique verblijf Drenthe | Deels | "boutique" in meta keywords en losse teksten |
| vakantiehuis met sauna Drenthe | **Zwak** | Sauna zit alleen in De Heide en wordt nergens als pagina-onderwerp gevoerd |
| vakantiehuis met jacuzzi Drenthe | **Nee** | Bewuste keuze, zie 3.2 |
| luxe accommodatie Drenthe | Deels | `/luxe-lodge-drenthe` |
| romantisch verblijf Drenthe | **Ja** | `/romantisch-weekend-weg-drenthe` |
| weekendje weg Drenthe | **Ja** | idem |
| natuurhuisje Drenthe | **Nee** | Term komt niet voor |
| vakantiehuis nabij Assen | **Ja** | `/vakantiehuis-assen` |
| vakantiehuis nabij Groningen | **Nee** | Groningen komt nauwelijks voor |

**OBSERVATION** — het grootste onbenutte gat is **sauna**. Er ís een sauna (in De Heide), het is een van de twee echte differentiators tussen de lodges, en "vakantiehuis met sauna Drenthe" is een commerciële zoekterm met duidelijke intentie. Er is geen pagina voor.

**OBSERVATION** — **Groningen** is genegeerd. Zeijen ligt op circa 25 minuten van de stad Groningen — een aanzienlijk grotere herkomstmarkt dan Assen. De hele geografische positionering is op Assen gericht.

---

# 4. Local SEO

## 4.1 NAP-consistentie

**FACT** — de gegevens zoals ze in de JSON-LD staan (`layout.tsx`):

```
Naam:      Huis ter Huynen
Adres:     Zuiderstraat 6 p, 9491 TH Zeijen, Drenthe, NL
Telefoon:  +31642568603
E-mail:    lodge@huisterhuynen.nl
Geo:       53.050119, 6.517024
```

**PROBLEEM** — het telefoonnummer staat in de JSON-LD maar **nergens zichtbaar op de site**. De footer toont alleen adres en e-mailadres. Een NAP waarvan de P alleen in machineleesbare vorm bestaat, is voor lokale SEO een halve NAP: citaties en gebruikers kunnen hem niet overnemen, en Google kan hem niet tegen andere bronnen valideren.

**RECOMMENDATION** — zet het telefoonnummer zichtbaar in de footer naast het e-mailadres, als `tel:`-link.

## 4.2 De geografische keten

De opdracht vraagt of Google en AI de relatie begrijpen tussen **Huis ter Huynen → Zeijen → Drenthe → omgeving Assen → Noord-Drenthe**.

**Wat er goed gaat:** `geo.region: NL-DR`, `geo.placename: Zeijen, Drenthe`, `geo.position`, `ICBM`, een `PostalAddress` met `addressRegion: Drenthe`, coördinaten, `hasMap` naar een Google Maps place-URL met `place_id`. De omgevingspagina en zes `TouristAttraction`-entiteiten op landingspagina's verankeren de plaats aan echte bezienswaardigheden (Ballooërveld, Drentsche Aa, Fochteloërveen, hunebedden).

**Dat is een sterke lokale basis.** De koppeling Zeijen → Drenthe → Assen is expliciet en herhaald.

**Wat ontbreekt:** "Noord-Drenthe" als term komt nauwelijks voor, en Groningen ontbreekt (4.1 hierboven).

## 4.3 Verwarringsrisico — **dit is de kritieke bevinding**

**FACT**, uit publieke bronnen:

1. **Resort Huis ter Huynen** is een vastgoedontwikkeling van **Kleen Resorts**: 70 recreatiewoningen op koopkavels van 250 m² of groter, circa 58 m² woonoppervlak, twee slaapkamers, vier personen, gasloos. Verkocht als eigen gebruik of belegging. Bronnen: [kleenresortsverkoop.nl](https://www.kleenresortsverkoop.nl/huis-ter-huinen), [chaletvisie.nl](https://chaletvisie.nl/huis-ter-huynen/), [Instagram](https://www.instagram.com/p/DIl5f8DB9tV/).
2. De woningen staan te koop op **Funda** onder `Zuiderstraat 6-P1`, `Zuiderstraat 6-P3` ([P3](https://www.funda.nl/detail/recreatie/zeijen/huis-zuiderstraat-6-p3/89348536/), [P1](https://www.funda.nl/detail/koop/zeijen/huis-zuiderstraat-6-p1/43984997/)) — **hetzelfde adres** als dat in de JSON-LD van deze site.
3. Op Booking.com staat de eigen lodge als **"Lodge Huis ter Huynen 57 - De Eik met Hottub"**, onder de URL-slug `resort-huis-ter-huynen-57` ([link](https://www.booking.com/hotel/nl/resort-huis-ter-huynen-57.sv.html)).
4. In hetzelfde dorp bestaat **"Huis te Zeijen"**, een B&B met een eigen site ([huistezeijen.nl](https://huistezeijen.nl/)) én een Booking-vermelding.
5. **"Huis ter Heide, Drenthe"** is een andere plaats in Drenthe, met een eigen Wikipedia-pagina ([en.wikipedia.org](https://en.wikipedia.org/wiki/Huis_ter_Heide,_Drenthe)) — en dus een gevestigde entiteit met een sterker bestaand kennisprofiel dan deze accommodatie.

**Gevolg.** De naam "Huis ter Huynen" verwijst op dit moment tegelijk naar een vastgoedproject, losse te koop staande recreatiewoningen, een Booking-vermelding met een nummer erin, en deze verhuuronderneming van twee lodges. De site claimt met `LodgingBusiness { name: "Huis ter Huynen" }` de kale naam, zonder enig onderscheidend signaal.

**Dit verklaart waarschijnlijk de merkpositie van 15,3.** Een merknaam op positie 15 betekent bijna altijd dat de zoekmachine niet weet welke entiteit hij moet tonen.

**RECOMMENDATION** — zie sectie 6.3 voor de concrete schema-implementatie. De kern: geef de verhuuronderneming een eigen, onderscheidende `name` of op zijn minst een `alternateName` en een `disambiguatingDescription`, en verbind hem via `sameAs` met de Booking-vermelding en het Google-bedrijfsprofiel.

---

# 5. Structured Data

## 5.1 Wat er nu staat

**FACT** — inventarisatie over de hele codebase:

| Type | Aantal | Waar |
|---|---|---|
| `LodgingBusiness` | 4 plaatsen | root layout, landingstemplate, DE-variant, `seller` in Offer |
| `Accommodation` | 4 | `containsPlace` (De Heide, De Eik) NL + DE |
| `FAQPage` / `Question` / `Answer` | 3 / 16 / 15 | `/faq`, landingspagina's |
| `BreadcrumbList` / `ListItem` | 3 / 9 | landingspagina's, blog |
| `TouristAttraction` | 6 | landingspagina's (`about`) |
| `BlogPosting` | 1 | `blog/[slug]` |
| `Offer` + `UnitPriceSpecification` | 2 + 2 | root layout, landingstemplate |
| `LocationFeatureSpecification` | 14 | amenities NL + DE |
| `WebSite`, `WebPage`, `Organization`, `ImageObject`, `Person`, `ItemList` | elk 1 | verspreid |

**Dit is een bovengemiddeld rijke implementatie.** De `Offer` met `UnitPriceSpecification`, `referenceQuantity` en `eligibleQuantity` (minimaal twee nachten) is zorgvuldiger dan wat de meeste accommodatiesites doen.

## 5.2 Concrete fouten

**PROBLEEM 1 — `availability: InStock` terwijl de accommodatie nog niet open is.**

```
Huidig:    "availability": "https://schema.org/InStock"
Gewenst:   "availability": "https://schema.org/PreOrder",
           "availabilityStarts": "2027-04-01",
           "validFrom": "2026-01-01"
```
De accommodatie opent 1 april 2027. `InStock` zegt "nu beschikbaar" en dat klopt niet. `PreOrder` met `availabilityStarts` is precies wat hier bedoeld wordt en is voor een AI-systeem een véél informatiever signaal: het weet dan dat dit een pre-opening boeking is.

**PROBLEEM 2 — `dateModified` gelijk aan `datePublished`.**

```
blog/[slug]/page.tsx:192-193
  datePublished: post.gepubliceerd_op || undefined,
  dateModified:  post.gepubliceerd_op || undefined,   ← fout
```
De sitemap gebruikt wél correct `nieuwsteDatum(updated_at, gepubliceerd_op)`. Het schema doet dat niet. Een herschreven artikel meldt in de sitemap "gewijzigd" en in het schema "onveranderd sinds publicatie" — twee tegenstrijdige signalen over dezelfde URL. Voor AI-citatie is versheid een selectiecriterium.

```
Gewenst:   dateModified: nieuwsteDatum(post.updated_at, post.gepubliceerd_op)?.toISOString()
```

**PROBLEEM 3 — geen `sameAs`, nergens op de hoofdentiteit.**

De enige `sameAs` in de hele codebase staat op `TouristAttraction.about` in de landingstemplate (`LandingTemplate.tsx:147`). De `LodgingBusiness` heeft er geen. Dit is het grootste gemis in de hele audit — zie 6.2.

**PROBLEEM 4 — losse schema-eilanden zonder `@id`-graaf.**

`LodgingBusiness`, `WebSite` en `Organization` bestaan alle drie, maar staan in verschillende bestanden en verwijzen niet naar elkaar. `Organization` bestaat alleen als `publisher` binnen `BlogPosting`. Er is geen enkele node die zegt: de uitgever van dit artikel is dezelfde organisatie als de accommodatie.

**PROBLEEM 5 — `openingHoursSpecification` 00:00–23:59, zeven dagen.**

Voor een accommodatie zonder receptie is dit verdedigbaar, maar het botst met de `checkInTime: T15:00` / `checkOutTime: T11:00` erboven. Laag risico, lage prioriteit.

**OBSERVATION — geen `AggregateRating` of `Review`.** Dit is *correct*: er zijn nog geen gasten geweest. Recensieschema verzinnen zou een handmatige Google-actie riskeren. De code doet dit bewust goed (`page.tsx` toont "de eerste beoordelingen verschijnen hier zodra onze eerste gasten hebben verbleven"). **Niet aanpassen tot er echte reviews zijn.**

## 5.3 Voorgestelde entity graph

Eén samenhangende graaf in de root layout, met `@id`'s die de nodes verbinden:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.huisterhuynen.nl/#organization",
      "name": "Huis ter Huynen",
      "url": "https://www.huisterhuynen.nl",
      "email": "lodge@huisterhuynen.nl",
      "telephone": "+31642568603",
      "logo": { "@type": "ImageObject", "url": "https://www.huisterhuynen.nl/icon-512.png" },
      "founder": { "@id": "https://www.huisterhuynen.nl/#owner" },
      "sameAs": [
        "https://www.booking.com/hotel/nl/resort-huis-ter-huynen-57.html",
        "<Google Maps place-URL>",
        "<Instagram-profiel>",
        "<Facebook-pagina>"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://www.huisterhuynen.nl/#owner",
      "name": "Arjan Reinders",
      "jobTitle": "Eigenaar",
      "worksFor": { "@id": "https://www.huisterhuynen.nl/#organization" }
    },
    {
      "@type": "LodgingBusiness",
      "@id": "https://www.huisterhuynen.nl/#lodging",
      "name": "Huis ter Huynen — Lodge De Heide & Lodge De Eik",
      "alternateName": ["Huis ter Huynen Lodges", "Lodge De Heide", "Lodge De Eik"],
      "disambiguatingDescription": "Particuliere verhuur van twee vrijstaande boutique lodges met privé hottub op het terrein Huis ter Huynen in Zeijen. Niet te verwarren met de verkoop van recreatiewoningen op hetzelfde terrein.",
      "parentOrganization": { "@id": "https://www.huisterhuynen.nl/#organization" },
      "numberOfRooms": 2,
      "petsAllowed": true,
      "availableLanguage": ["nl", "de", "en"],
      "isAccessibleForFree": false,
      "sameAs": [ "<zelfde lijst als Organization>" ],
      "containedInPlace": {
        "@type": "Place",
        "name": "Resort Huis ter Huynen",
        "address": { "@type": "PostalAddress", "addressLocality": "Zeijen", "addressRegion": "Drenthe", "addressCountry": "NL" }
      }
      /* … bestaande address, geo, amenityFeature, containsPlace, makesOffer … */
    },
    {
      "@type": "WebSite",
      "@id": "https://www.huisterhuynen.nl/#website",
      "url": "https://www.huisterhuynen.nl",
      "name": "Huis ter Huynen",
      "publisher": { "@id": "https://www.huisterhuynen.nl/#organization" },
      "inLanguage": "nl-NL"
    }
  ]
}
```

De twee sleutelvelden zijn **`disambiguatingDescription`** (schema.org heeft dit veld precies voor dit probleem) en **`containedInPlace`** — die zegt expliciet: dit bedrijf ligt *binnen* het terrein Huis ter Huynen, en is dat terrein niet.

---

# 6. Entity SEO

## 6.1 Wat een AI-systeem nu betrouwbaar kan afleiden

| Attribuut | Afleidbaar? | Bron |
|---|---|---|
| Naam | Ja, maar **ambigu** | Title, schema — maar gedeeld met het park |
| Locatie | **Ja, sterk** | PostalAddress, GeoCoordinates, geo-metatags, hasMap |
| Type accommodatie | Ja | `LodgingBusiness` + `containsPlace` × 2 `Accommodation` |
| Faciliteiten | **Ja, sterk** | 14 `LocationFeatureSpecification`, per lodge gesplitst |
| Capaciteit | Ja | `occupancy.maxValue: 4` per lodge |
| Prijsniveau | **Ja, sterk** | `Offer` met `price`, `UnitPriceSpecification`, minimaal 2 nachten |
| Doelgroep | Impliciet | Alleen uit lopende tekst af te leiden |
| Eigenaar | **Nee** | Alleen een auteursnaam op blogartikelen |
| Beoordelingen | Nee | Terecht — nog geen gasten |
| Externe vermeldingen | **Nee** | Geen `sameAs` |
| Open vanaf | **Onjuist** | `InStock` suggereert nu beschikbaar |

## 6.2 `sameAs` — de grootste enkele tekortkoming

Een entiteit zonder `sameAs` is voor een kennisgraaf een eiland. Google koppelt entiteiten aan de hand van overlappende identifiers; AI-systemen doen iets vergelijkbaars via co-occurrence van naam, adres en URL over meerdere bronnen.

Huis ter Huynen **heeft** externe vermeldingen — Booking.com, een Google-bedrijfsprofiel (het `place_id` zit al in de code), vermoedelijk social media — maar de site verwijst naar geen enkele ervan. Het gevolg is dat de kennisgraaf de losse vermeldingen niet aan elkaar kan knopen, en dat juist in een situatie waarin de naam dubbelzinnig is.

**RECOMMENDATION** — dit is de goedkoopste hoog-impactactie in het hele rapport. Eén array, tien regels code.

## 6.3 Entiteitsafbakening

Zie 5.3. Aanvullend, buiten de code: overweeg of de publiek gevoerde naam **"Huis ter Huynen Lodges"** moet worden in plaats van "Huis ter Huynen". Dat is een merkbeslissing, geen technische — maar het is wel de meest directe oplossing voor een probleem dat met schema alleen niet volledig weg te nemen is.

---

# 7. Content & Topical Authority

## 7.1 Huidige dekking

De site heeft zestien NL-landingspagina's en een groeiend blog. De thematische dekking rond **Drenthe / natuur / heide / fietsen / wandelen / hunebedden** is goed en met echte, lokale kennis geschreven — de teksten in `landing-seed.ts` en `blog-seed.ts` bevatten details die alleen iemand ter plaatse kan weten (het Zeijerveld in april versus augustus, welke route na regen). **Dat is echte Experience in E-E-A-T-zin en het is zeldzaam.**

## 7.2 Content gap

| Onderwerp | Zoekintentie | Voorgestelde pagina | Prioriteit |
|---|---|---|---|
| Vakantiehuis met sauna Drenthe | Commercieel | `/vakantiehuis-met-sauna-drenthe` | **P1** |
| Vakantiehuis bij Groningen | Commercieel | `/vakantiehuis-bij-groningen` | **P1** |
| Over ons / de eigenaren | Vertrouwen | `/over-ons` | **P1** (E-E-A-T) |
| Contact | Navigatie + vertrouwen | `/contact` | **P1** |
| Natuurhuisje Drenthe | Commercieel | Term opnemen in bestaande pagina's | P2 |
| Jacuzzi-terminologie | Commercieel | FAQ-vraag + `alternateName` | P2 |
| Hoeveel kost een weekend Drenthe | Prijsonderzoek | Bestaand blogartikel uitbreiden | P2 |
| Restaurants rond Zeijen / Norg | Informationeel, AI-vriendelijk | `/eten-drinken-drenthe` | P2 |
| Drenthe met kinderen | Commercieel | `/vakantiehuis-drenthe-kinderen` | P3 |
| Duurzaam / gasloos verblijven | Nichewaarde | Sectie op bestaande pagina | P3 |

**OBSERVATION** — een **`/over-ons`-pagina ontbreekt volledig**, terwijl de blogartikelen in de ik-vorm geschreven zijn door een met naam genoemde auteur. Dat is verspilde E-E-A-T: het verhaal is er, er is alleen geen pagina die het aan de organisatie koppelt.

---

# 8. AI Search / GEO / AEO

## 8.1 Wat een AI-systeem kan beantwoorden

Ik heb per vraag beoordeeld of de site voldoende expliciete informatie bevat.

| Vraag | Beantwoordbaar? | Waarom |
|---|---|---|
| Wat is Huis ter Huynen? | **Deels** | Title en description zijn sterk, maar de naam is ambigu (sectie 4.3) |
| Waar ligt het? | **Ja** | Adres, coördinaten, geo-tags, afstand tot Assen |
| Wat voor accommodatie? | **Ja** | `LodgingBusiness` + twee `Accommodation` |
| Geschikt voor een romantisch weekend? | **Ja** | Eigen landingspagina met FAQ-schema |
| Wat maakt het bijzonder? | **Ja** | "geen receptie, geen buren, geen gedeelde wellness" is een expliciete, citeerbare formulering |
| Welke accommodaties in Drenthe hebben een sauna? | **Zwak** | Sauna zit in `amenityFeature` maar heeft geen eigen pagina |
| Is het open? | **Nee, misleidend** | `InStock` terwijl opening 1 april 2027 is |
| Wie zit erachter? | **Nee** | Geen `Person`-entiteit, geen over-ons |
| Wat kost het? | **Ja, sterk** | Vanafprijs machineleesbaar in de `Offer` |

## 8.2 Nulmeting — externe zichtbaarheid

**FACT** — zoekopdracht *"bijzonder overnachten Drenthe luxe vakantiehuis hottub sauna"*:

Huis ter Huynen wordt **niet genoemd**. De genoemde accommodaties zijn Drents Keienhuis, De Vier Eiken (Natuurlodge Wellness Special), Bij de Vossen (Ellertshaar) en een natuurhuis in Wapserveen. De gebruikte bronnen:

| Bron | Type |
|---|---|
| origineelovernachten.nl | Portal |
| bijzonderplekje.nl | Portal |
| drenthe.nl | Regionale VVV |
| galekkeropvakantie.nl | Portal |
| vakantiehuis-sauna.nl | Nicheportal |
| vakantiehuis-met-sauna.com | Nicheportal |
| bijzondere-overnachtingen.eu | Portal |
| vipio.com | Portal |
| **deviereiken.nl** | **Eigen site van een concurrent** |

**OBSERVATION** — acht van de negen bronnen zijn portals. De enige accommodatie die op eigen kracht in het antwoord komt, is De Vier Eiken. Dit bevestigt wat de eerdere analyse in de repo al stelde. **De conclusie is onaangenaam maar helder: deze SERP win je niet met een betere eigen pagina, je wint hem door in die portals te staan.**

**FACT** — merkzoekopdracht *"Huis ter Huynen Zeijen Drenthe lodge"*: het blogartikel `/blog/wilde-dieren-spotten-in-het-drents-friese-wold` komt naar boven. **De site is dus geïndexeerd en het blog wordt opgepikt.** Maar de samenvatting die uit de bronnen wordt opgebouwd, beschrijft *het park van 70 woningen*, niet de twee lodges — inclusief de zin "The lodges are available from January 1, 2027".

> Dat is precies waar dit rapport over gaat: bij een merkzoekopdracht op de eigen naam wint de vastgoedbeschrijving het van de accommodatiebeschrijving, en de genoemde openingsdatum is inmiddels onjuist.

## 8.3 Wat ontbreekt voor AI-citatie

1. **Externe verankering** (`sameAs`) — zonder dit kan geen enkel systeem de vermeldingen aan elkaar knopen.
2. **Entiteitsafbakening** tegenover het gelijknamige park.
3. **Een correcte beschikbaarheidsstatus.**
4. **Aanwezigheid in de portals** die de antwoorden feitelijk voeden.
5. **Een auteur/eigenaar-entiteit.**

---

# 9. AI Crawlability

**FACT** — `public/robots.txt` bevat geen enkele directive voor AI-crawlers: geen `GPTBot`, geen `ClaudeBot`, geen `PerplexityBot`, geen `CCBot`, geen `Google-Extended`, geen `OAI-SearchBot`.

**Dit is gunstig.** Onder `User-agent: *` met `Allow: /` zijn al die crawlers toegestaan. Er is geen blokkade.

**OBSERVATION** — er is geen `llms.txt`. Dat is een opkomende, nog niet door alle partijen ondersteunde conventie; de kosten zijn bijna nul en het risico is nul.

**RECOMMENDATION** — twee lichte toevoegingen:

1. Expliciete `Allow`-blokken voor de belangrijkste AI-crawlers. Functioneel verandert er niets, maar het maakt de intentie expliciet en voorkomt dat een latere wijziging aan `User-agent: *` ze per ongeluk uitsluit.
2. Een `/llms.txt` met de kern van de AI Knowledge Pack uit sectie 16.

```
# public/robots.txt — toevoeging
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
```

---

# 10. Performance

**Dit is een codeanalyse, geen meting.** Zonder live toegang zijn LCP, INP, CLS en TTFB niet verifieerbaar.

## Wat er goed is

| Maatregel | Bewijs |
|---|---|
| AVIF + WebP | `next.config.ts`: `images.formats: ["image/avif", "image/webp"]` |
| LCP-preload | `<link rel="preload" as="image" href="/_next/image?url=%2Flodge-heide.jpg&w=828&q=45">` in de `<head>` |
| `font-display: swap` | Beide `next/font/google`-aanroepen |
| Zelf-gehoste fonts | `next/font` elimineert de externe request naar fonts.googleapis.com |
| Preconnect | facebook.net, googletagmanager.com, googleadservices.com |
| Statische rendering | Homepage, `/de`, `/omgeving`, `/faq` zijn statisch; landingspagina's SSG met ISR |
| Bundelgrootte | Gedeelde JS 103 kB, homepage 132 kB first load — netjes voor deze functionaliteit |

## Aandachtspunten

**OBSERVATION 1 — de tracking-stack is zwaar.** In de root layout staan GTM, GA4, Meta Pixel, Google Ads (gtag.js), RouteChangePixel, TrackingListeners, ConsentBootstrap en ConsentBanner. Dat is vier externe tagsystemen op elke pagina. Consent Mode v2 staat correct op default-deny, wat betekent dat er vóór toestemming geen cookies vallen — maar de **scripts worden wel geladen**. Op mobiel is dit de meest waarschijnlijke oorzaak van een zwakke INP.

**OBSERVATION 2 — bronafbeeldingen zijn groot.** `lodge-heide.jpg` 400 kB, `wandel_drenthe.jpg` 429 kB, `lodge-eik.jpg` 377 kB, `heide1.jpg` 253 kB. Next/image converteert en schaalt bij het uitserveren, dus dit raakt de bezoeker niet direct — maar het raakt wel de buildtijd en het geheugengebruik van de optimalisatiefunctie.

**RECOMMENDATION** — meet eerst. Draai PageSpeed Insights op `/`, `/wellness-vakantie-drenthe` en een blogartikel, op mobiel. Pas daarna iets aan. Als INP tegenvalt, is het uitstellen van Meta Pixel en Google Ads tot na interactie de eerste ingreep — niet het comprimeren van afbeeldingen.

---

# 11. Mobile

**FACT** — `viewport` correct gezet (`width=device-width, initialScale=1`). Er is een `StickyMobileCTA` met bewuste tekstkeuze ("Bekijk beschikbaarheid" in plaats van "Claim uw datum" — het codecommentaar legt uit waarom: een zware CTA vóór een zware volgende stap is een dubbele drempel). De CSS bevat mobiele breakpoints voor de lodgekaarten en het formulier.

**OBSERVATION** — de `ConsentBanner` en de `StickyMobileCTA` staan beide onderaan het scherm. Of ze elkaar op kleine schermen overlappen, is zonder live weergave niet vast te stellen. **Handmatig controleren op een telefoon van 360 px breed.**

**Content parity:** dezelfde React-componenten renderen op alle breedtes; er is geen aparte mobiele content. Geen risico.

---

# 12. Images & Visual Search

| Onderdeel | Status |
|---|---|
| Alt-teksten | **Goed** — alle drie de `<Image>`-componenten op de homepage hebben een alt |
| Formaten | **Goed** — AVIF/WebP automatisch |
| Lazy loading | **Goed** — Next.js standaard, met `priority` op de hero |
| OG-afbeeldingen | **Zeer goed** — per blogartikel en per landingspagina dynamisch gegenereerd (`/api/og/blog`, `/api/og/landing`) in plaats van overal dezelfde |
| **Bestandsnamen** | **Aandachtspunt** | `welness_drenthe.jpg` (spelfout), `borrel1.jpg`, `heide1.jpg`, `heide2.jpg`, `heide3.jpg`, `late_check_out.jpg` |
| **Image sitemap** | **Ontbreekt** |

**RECOMMENDATION** — beschrijvende bestandsnamen zijn een van de weinige overgebleven signalen voor Google Afbeeldingen en voor visuele AI-zoekopdrachten. `heide1.jpg` → `paarse-heide-zeijen-drenthe.jpg`. Dit vereist een migratie van de verwijzingen in `PUBLIC_IMAGES` en in de database; plan het als één ingreep, niet stuk voor stuk.

---

# 13. Externe autoriteit & concurrentie

## 13.1 Bestaande vermeldingen

| Bron | Status | Consistentie |
|---|---|---|
| Booking.com | **Aanwezig** — "Lodge Huis ter Huynen 57 - De Eik met Hottub" | Naam wijkt af van de site |
| Google Bedrijfsprofiel | **Aanwezig** (`place_id` in de code) | Niet verifieerbaar |
| Kleen Resorts / Chaletvisie | Aanwezig, maar beschrijft **het park**, niet de verhuur | Conflicterend |
| Funda | Aanwezig — te koop staande woningen op hetzelfde adres | Conflicterend |
| Instagram (Kleen Resorts) | Aanwezig | Van de ontwikkelaar, niet van de verhuur |
| Natuurhuisje | **Niet aangetroffen** | — |
| Tripadvisor | **Niet aangetroffen** | — |
| drenthe.nl (VVV) | **Niet aangetroffen** | — |
| origineelovernachten.nl | **Niet aangetroffen** | — |
| bijzonderplekje.nl | **Niet aangetroffen** | — |

**Dit is de scherpste bevinding van sectie 13:** precies de portals die de commerciële SERP's bezetten en die de AI-antwoorden voeden, bevatten géén vermelding van Huis ter Huynen.

## 13.2 Concurrenten — waar het gat zit

Uit de SERP-analyse komt één accommodatie op eigen kracht naar boven: **De Vier Eiken** (`deviereiken.nl`). De overige genoemde accommodaties (Drents Keienhuis, Bij de Vossen, natuurhuis Wapserveen) verschijnen uitsluitend via portals.

**Het patroon:** wie in Drenthe zichtbaar wil zijn in wellness-accommodatiezoekopdrachten, komt er óf via een eigen site met voldoende autoriteit (De Vier Eiken), óf via meervoudige portalvermeldingen (de rest). Huis ter Huynen doet op dit moment geen van beide — de eigen site is technisch prima maar jong en zonder reviews, en de portalvermeldingen ontbreken.

---

# 14. Scorecard

| Onderdeel | Status | Impact | Bewijs | Actie |
|---|---|---|---|---|
| Technical SEO | **Goed** | — | Canonicals, 301-map, HSTS, CSP, sitemap met echte lastmod | Alleen www-redirect verifiëren |
| Indexability | **Goed** | — | robots.txt correct; blogartikel aangetroffen in zoekresultaten | — |
| On-page SEO | **Goed** | Midden | Title/description homepage sterk; sauna en Groningen ongedekt | Twee nieuwe pagina's |
| Local SEO | **Aandachtspunt** | Hoog | Geo-signalen sterk, maar telefoon niet zichtbaar; naamverwarring | NAP compleet maken |
| Structured Data | **Aandachtspunt** | Hoog | Rijk, maar `InStock` onjuist en `dateModified` fout | 5.2 + 5.3 |
| Entity SEO | **Kritiek** | **Zeer hoog** | Geen `sameAs`; naam gedeeld met 70-woningenpark; merkpositie 15,3 | 5.3 + 6.3 |
| Content | **Goed** | Midden | Echte lokale kennis; gaten bij sauna, Groningen, over-ons | Sectie 7.2 |
| Internal Linking | **Goed** | Laag | Lodgekeuzeblok, contextuele CTA's met herkomstparameter | — |
| E-E-A-T | **Probleem** | Hoog | Geen over-ons, geen eigenaar-entiteit, geen reviews, telefoon onzichtbaar | `/over-ons`, `/contact` |
| AI Search | **Probleem** | **Zeer hoog** | Niet genoemd in het antwoord op de kernvraag | Sectie 8.3 |
| GEO/AEO | **Aandachtspunt** | Hoog | FAQ-schema goed; beschikbaarheidsstatus misleidend | `PreOrder` + `llms.txt` |
| Performance | **Niet verifieerbaar** | Onbekend | Codepatronen goed; vier tagsystemen in de root layout | Eerst meten |
| Mobile | **Goed** | Laag | Viewport, sticky CTA, breakpoints aanwezig | Overlap banner/CTA checken |
| External Authority | **Kritiek** | **Zeer hoog** | Afwezig in alle relevante portals | Sectie 13.1 |

---

# 15. Roadmap

## P0 — Kritiek

**1. `sameAs` toevoegen aan de hoofdentiteit**
*Probleem:* de entiteit heeft geen enkele externe verankering.
*Waarom:* zonder `sameAs` kan geen enkele kennisgraaf de Booking-vermelding, het Google-profiel en de site als één entiteit herkennen — juist kritiek nu de naam ambigu is.
*Implementatie:* array toevoegen aan de `LodgingBusiness` in `src/app/layout.tsx`, met de Booking-URL, de Google Maps place-URL (`GOOGLE_MAPS_PLACE_URL` bestaat al in de code) en eventuele social profielen.
*Verwachte impact:* hoog, en de goedkoopste actie in dit rapport.

**2. Entiteit afbakenen tegenover het gelijknamige park**
*Probleem:* "Huis ter Huynen" verwijst ook naar 70 te koop staande recreatiewoningen op hetzelfde adres.
*Waarom:* merkpositie 15,3; de merkzoekopdracht levert een vastgoedbeschrijving op in plaats van een accommodatiebeschrijving.
*Implementatie:* `disambiguatingDescription`, `alternateName` en `containedInPlace` zoals in 5.3.
*Verwachte impact:* zeer hoog, en niets anders lost dit op.

**3. `availability` corrigeren naar `PreOrder`**
*Probleem:* `InStock` terwijl de accommodatie 1 april 2027 opent.
*Waarom:* onjuiste feitelijke informatie in machineleesbare vorm is erger dan geen informatie — dit is precies het soort veld waarop een AI-systeem een antwoord baseert.
*Implementatie:* `layout.tsx` en `LandingTemplate.tsx`, `availability` + `availabilityStarts: "2027-04-01"`.

## P1 — Hoge impact

**4. In de portals komen.** origineelovernachten.nl, bijzonderplekje.nl, natuurhuisje.nl, drenthe.nl, luxevakantieplekjes.nl. Dit is geen ontwikkelwerk maar aanmeldwerk, en het is volgens de SERP-meting de grootste enkele hefboom. Het venster van "nieuw" sluit bij de opening.

**5. `/over-ons` en `/contact`.** E-E-A-T mist nu de basis. Het verhaal en de lokale kennis zijn er al in de blogteksten; ze hebben alleen geen eigen pagina en geen `Person`-entiteit.

**6. Telefoonnummer zichtbaar maken.** Staat in de JSON-LD maar nergens op de site.

**7. `dateModified` repareren** in `blog/[slug]/page.tsx` — de sitemap en het schema spreken elkaar nu tegen.

**8. Externe bronnen de nieuwe openingsdatum laten volgen.** Booking.com, het Google-bedrijfsprofiel en Kleen Resorts dragen nog "1 januari 2027".

## P2 — Middelhoge impact

9. `/vakantiehuis-met-sauna-drenthe` — bestaande faciliteit, onbenutte commerciële term.
10. `/vakantiehuis-bij-groningen` — grotere herkomstmarkt dan Assen, nu genegeerd.
11. Jacuzzi/whirlpool als `alternateName` en FAQ-vraag.
12. `@graph` met `@id`-koppelingen (5.3).
13. `llms.txt` + expliciete AI-crawler-allows.

## P3 — Optimalisatie

14. Beschrijvende bestandsnamen voor afbeeldingen.
15. Image sitemap.
16. `keywords`-metatag verwijderen.
17. `openingHoursSpecification` afstemmen op check-in/check-out.

---

# 16. AI Knowledge Pack

> Uitsluitend gecontroleerde informatie uit de codebase. Velden die ik niet kon verifiëren, staan als zodanig gemarkeerd.

**Entity:** Huis ter Huynen — Lodge De Heide & Lodge De Eik
**Type:** LodgingBusiness (particuliere verhuur van twee vrijstaande vakantielodges)
**Location:** Zuiderstraat 6 p, 9491 TH Zeijen, gemeente Tynaarlo, Drenthe, Nederland
**Region:** Noord-Drenthe; circa 10–20 minuten van Assen, circa 25 minuten van Groningen
**Coordinates:** 53.050119, 6.517024
**Accommodation type:** Twee vrijstaande boutique lodges, elk voor maximaal 4 personen
**Target audience:** Stellen (primair), vriendinnenweekenden, twee stellen samen, gasten met hond
**Key facilities:** Privé hottub per lodge (24/7 op 38 °C) · sauna (alleen De Heide) · buitenkeuken met bbq (alleen De Eik) · volledig uitgeruste keuken · privé terras · gratis wifi · EV-laadpaal · digitale sloten, check-in tot middernacht · huisdieren toegestaan
**Unique selling points:** Volledige privacy — geen receptie, geen gedeelde wellness, geen zicht op andere huisjes · rechtstreeks boeken zonder tussenpersoon · direct vanuit de deur de heide op
**Nearby attractions:** Zeijerstrubben · Zeijerveld · Ballooërveld (schaapskudde, 12 min) · Nationaal Park Drentsche Aa (15 min) · Fochteloërveen · Dwingelderveld · hunebedden · Norg · Assen met het Drents Museum
**Booking:** Rechtstreeks via huisterhuynen.nl; aanvraag met persoonlijk voorstel binnen 24 uur. Ook op Booking.com als "Lodge Huis ter Huynen 57 — De Eik met Hottub"
**Rental forms:** Midweek (ma–vr, 4 nachten) · weekend (vr–zo, 2 nachten) · week (ma–zo, 6 nachten). Losse nachten worden niet verhuurd; wisseldagen zijn maandag en vrijdag
**Pricing:** Vanaf € 165 per nacht voor de hele lodge, minimaal 2 nachten. Exclusief schoonmaakkosten en toeristenbelasting gemeente Tynaarlo. Geen boekingskosten
**Check-in / check-out:** 15:00 / 11:00
**Opening date:** 1 april 2027
**Languages:** Nederlands, Duits
**Official website:** https://www.huisterhuynen.nl
**Contact:** lodge@huisterhuynen.nl · +31 6 42568603
**Social profiles:** *Niet verifieerbaar met de beschikbare toegang*
**Important disambiguation:** Niet te verwarren met (a) Resort Huis ter Huynen / Landgoed De Huynen, de vastgoedontwikkeling van Kleen Resorts met 70 te koop staande recreatiewoningen op hetzelfde terrein; (b) Huis te Zeijen, een B&B in hetzelfde dorp; (c) Huis ter Heide, een andere plaats in Drenthe

---

# 17. Slotanalyse

### 1. Kan Google begrijpen wat Huis ter Huynen is?

**Grotendeels ja, met één belangrijke uitzondering.** De technische signalen zijn compleet: canonicals, schema, geo-data, een correcte sitemap. Wat Google níét betrouwbaar kan vaststellen, is welke van de betekenissen van de naam bij deze URL hoort. De merkpositie van 15,3 uit de eigen GSC-export is daar het symptoom van.

### 2. Kan een AI-systeem begrijpen wat het is?

**Gedeeltelijk.** Type, locatie, faciliteiten, capaciteit en prijs zijn expliciet en machineleesbaar — beter dan bij de meeste concurrenten. Maar het systeem heeft geen externe verankering (`sameAs`), krijgt een onjuist beschikbaarheidssignaal (`InStock`) en vindt bij de merknaam voornamelijk vastgoedcontent.

### 3. Kan het de accommodatie betrouwbaar koppelen aan locatie, faciliteiten en doelgroep?

**Locatie: ja, sterk.** **Faciliteiten: ja, sterk** — per lodge gesplitst, wat zeldzaam goed is. **Doelgroep: zwak** — die blijkt alleen uit lopende tekst, niet uit gestructureerde data.

### 4. Zijn er blokkades?

**Geen technische blokkades.** Geen AI-crawler wordt geweerd, alles is publiek toegankelijk, de content staat in de HTML. De blokkades zijn inhoudelijk: naamambiguïteit, ontbrekende `sameAs`, geen reviews, en afwezigheid in de bronnen waaruit de antwoorden worden opgebouwd.

### 5. De tien belangrijkste acties

1. **`sameAs` toevoegen** aan de `LodgingBusiness` — Booking.com, Google-bedrijfsprofiel, social. *Grootste effect per regel code.*
2. **De entiteit afbakenen** met `disambiguatingDescription`, `alternateName` en `containedInPlace`, tegenover het 70-woningenpark met dezelfde naam op hetzelfde adres.
3. **`availability` naar `PreOrder`** met `availabilityStarts: 2027-04-01`. De site zegt nu dat je er vandaag terecht kunt.
4. **Aanmelden bij origineelovernachten.nl, bijzonderplekje.nl, natuurhuisje.nl en drenthe.nl.** Acht van de negen bronnen in het AI-antwoord op de kernvraag zijn portals; geen daarvan kent Huis ter Huynen.
5. **`/over-ons` met een `Person`-entiteit** voor de eigenaar. De Experience is er al in de blogteksten, alleen niet gekoppeld.
6. **`/contact` maken en het telefoonnummer zichtbaar zetten.** Nu bestaat de P van NAP alleen in JSON-LD.
7. **`dateModified` repareren** in het BlogPosting-schema — sitemap en schema spreken elkaar nu tegen over dezelfde URL.
8. **De nieuwe openingsdatum doorvoeren bij externe partijen.** Booking.com, Google-bedrijfsprofiel en Kleen Resorts dragen nog 1 januari 2027.
9. **`/vakantiehuis-met-sauna-drenthe` bouwen.** De faciliteit bestaat, de zoekterm is commercieel, de pagina ontbreekt.
10. **Groningen opnemen in de geografische positionering.** 25 minuten rijden, grotere markt dan Assen, komt nu nergens voor.

---

*Opgesteld op basis van de volledige broncode van de productiesite, de productiebuild en publiek beschikbare zoekresultaten. Search Console, Bing Webmaster Tools, de live site en de database waren niet toegankelijk; alle conclusies die daarvan afhingen, zijn als niet-verifieerbaar gemarkeerd.*

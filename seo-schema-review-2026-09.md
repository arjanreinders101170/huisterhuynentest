# Schema.org-review — Huis ter Huynen

**Opgesteld:** 21 september 2026 · **Aanleiding:** beoordeling van een door Gemini voorgestelde JSON-LD · **Status:** compleet

---

## 0. Kernoordeel

Het voorstel bevat drie goede ideeën en **twee fouten die schade aanrichten als ze live gaan**. Het belangrijkste bezwaar staat los van beide: het voorstel is **een achteruitgang ten opzichte van wat er nu al op de site staat**.

| Bevinding | Ernst |
|---|---|
| **GPS-coördinaten wijken 2.082 meter af** van wat in de codebase staat | **Kritiek** |
| **`logo.png` bestaat niet** — de URL geeft een 404 | **Kritiek** |
| `telephone: ""` — lege string | Hoog |
| `url` op beide lodges is een hash-fragment, terwijl er echte pagina's bestaan | Hoog |
| **De volledige `Offer` met prijsinformatie ontbreekt** — die staat er nu wél | **Hoog** |
| Geen `sameAs`, geen disambiguatie — het hoofdprobleem uit de audit blijft onopgelost | Hoog |

Het voorstel één-op-één overnemen zou de sterkste bestaande troef wissen: de machineleesbare vanafprijs.

---

# De twintig controlevragen

## 1. Is `LodgingBusiness` het juiste hoofdtype?

**Ja, voor de onderneming.** `LodgingBusiness` is een subtype van `LocalBusiness` en dekt precies wat hier wordt aangeboden: een bedrijf dat overnachtingen verkoopt.

**Er is een preciezer alternatief, met een addertje.** Schema.org kent sinds 2021 `VacationRental`, een subtype van `LodgingBusiness`, en dat past strikt genomen beter bij twee zelfstandige, in hun geheel verhuurde lodges. Maar: de bijbehorende *rich results* van Google lopen via het Vacation Rentals-partnerprogramma en zijn niet vrij beschikbaar. Je wint er dus geen zichtbaarheid mee, alleen semantische precisie.

**Advies:** houd `LodgingBusiness` als hoofdtype en voeg `additionalType: "https://schema.org/VacationRental"` toe. Je krijgt de precisie zonder afhankelijk te worden van een programma waar je niet in zit.

## 2. Is `Accommodation` voor De Heide en De Eik correct en nuttig?

**Correct: ja.** `Accommodation` is een subtype van `Place`, en `containsPlace` verwacht een `Place`. De typering klopt.

**Nuttig: ja, en meer dan het lijkt.** Dit is de enige plek waar machineleesbaar staat dat de sauna bij De Heide hoort en de buitenkeuken bij De Eik. Zonder die splitsing kan geen enkel systeem de vraag "heeft De Eik een sauna?" beantwoorden — dan lijkt het alsof beide lodges alles hebben.

**Wat er mis is met de huidige implementatie:** de twee `Accommodation`-nodes hebben geen `@id` en geen `url`, terwijl er wél eigen pagina's bestaan (`/lodge-de-heide`, `/lodge-de-eik`). Ze zijn daardoor niet adresseerbaar en niet te koppelen aan de pagina die erover gaat. Zie vraag 11.

## 3. Past een ander type of een combinatie beter?

Voor de **units** kent schema.org geen "Lodge". De subtypes van `Accommodation` zijn onder meer `House`, `Apartment`, `Room`, `Suite` en `CampingPitch`. Een vrijstaande lodge die in zijn geheel wordt verhuurd, is het dichtst bij `House`.

**Advies:** `"@type": ["Accommodation", "House"]` voor beide lodges. Multi-typing is geldig JSON-LD en geeft je de generieke koppeling (via `containsPlace`) én de specifieke betekenis.

Niet doen: `Hotel`. Dat impliceert receptie, gedeelde faciliteiten en kamerverhuur — precies wat deze accommodatie uitdrukkelijk níét is, en het is ook nog eens de kern van de eigen positionering.

## 4. Worden `containsPlace` en `containedInPlace` semantisch correct gebruikt?

**`containsPlace`** — "de basale bevattingsrelatie tussen een plaats en een andere die hij bevat". LodgingBusiness → de twee lodges is correct gebruik.

**`containedInPlace`** — de inverse. Die inzetten om te zeggen dat de onderneming zich *binnen* het terrein Resort Huis ter Huynen bevindt, is semantisch precies goed, en het is het enige schema-middel dat het naamconflict uit de audit direct adresseert.

**Twee valkuilen:**

1. Gebruik niet beide richtingen tussen hetzelfde paar. Dat is niet fout, maar wel ruis.
2. `containedInPlace` moet naar een `Place` wijzen, niet naar een `Organization`. Het resort is als locatie een `Place`; Kleen Resorts als verkopende partij is een `Organization`. Die twee niet door elkaar halen — anders zeg je dat je bedrijf zich binnen een bedrijf bevindt.

## 5. Wordt `occupancy` correct toegepast?

**Bijna.** `occupancy` hoort op `Accommodation` en verwacht een `QuantitativeValue`. Dat klopt.

Wat ontbreekt is de **eenheid**. De documentatie van schema.org gebruikt bij `occupancy` `unitCode: "C62"` — de UN/CEFACT-code voor "stuks". Zonder eenheid staat er een getal 4 zonder dat vaststaat waarvan.

```json
"occupancy": {
  "@type": "QuantitativeValue",
  "minValue": 1,
  "maxValue": 4,
  "unitCode": "C62",
  "unitText": "personen"
}
```

## 6. Wordt `amenityFeature` correct toegepast?

**Ja.** `LocationFeatureSpecification` met `name` en `value` is de juiste vorm, en het is correct dat de voorzieningen zowel op bedrijfsniveau als per lodge staan.

**Eén verbetering die meer oplevert dan hij kost:** zet voorzieningen die een lodge *niet* heeft er expliciet bij met `value: false`.

```json
{ "@type": "LocationFeatureSpecification", "name": "Sauna", "value": false }
```

Op De Eik is dat geen negatief signaal maar een antwoord. Een systeem dat moet kiezen welke lodge het aanbeveelt bij "met sauna", kan dat nu niet uit de data afleiden — het ziet alleen dat De Heide er een heeft, en weet niet of De Eik er ook een heeft die alleen niet vermeld is.

## 7. Voldoet de JSON-LD aan de actuele specificatie?

**Het voorstel van Gemini: formeel ja, inhoudelijk nee.** Er staat geen enkel niet-bestaand type of onjuist geplaatste property in — het zou door de Schema Markup Validator komen. De problemen zitten in de *waarden*: een lege string, een niet-bestaande afbeelding en coördinaten die er 2 kilometer naast liggen. Een validator controleert de vorm, niet de waarheid.

Dat is het belangrijkste dat je over validatie moet weten: **groen in de validator betekent niet dat de gegevens kloppen.**

De controlelijst die ik aanhoud:

- Elk `@type` bestaat in de huidige woordenlijst (let op: `VacationRental` en `LocationFeatureSpecification` bestaan; "Lodge" en "HolidayHome" niet).
- Elke property hoort bij het type waarop hij staat, of bij een supertype. Veelgemaakte fout: `occupancy` op `LodgingBusiness` in plaats van op `Accommodation`.
- Datums in ISO 8601. `checkinTime` en `checkoutTime` mogen als `Time` (`"15:00:00"`) of als `DateTime`; de huidige `"T15:00:00"`-notatie is ongebruikelijk maar wordt geaccepteerd.
- Prijzen als getal of als string zonder valutateken, met `priceCurrency` apart.
- Geen lege strings, geen `null`.

Valideer met **beide**: de [Schema Markup Validator](https://validator.schema.org/) voor spec-conformiteit en de [Rich Results Test](https://search.google.com/test/rich-results) voor wat Google er feitelijk mee doet. Die twee geven verschillende antwoorden en je hebt ze allebei nodig.

## 8. Kan Google de markup verwerken?

**Verwerken: ja. Er een rich result van maken: grotendeels nee — en dat is de verwachting die bijgesteld moet worden.**

Google leest `LodgingBusiness` als `LocalBusiness`-variant en gebruikt het voor entiteitsbegrip en mogelijk voor een kennispaneel. Maar de *hotel- en accommodatie-rich-results* lopen via Google Hotel Center en het Vacation Rentals-partnerprogramma. Die krijg je niet met markup alleen.

**Wat deze markup wél doet:** het helpt Google vaststellen wélke entiteit dit is, waar hij ligt en waar hij bij hoort. Bij een naam die met een vastgoedproject wordt gedeeld, is dat precies het probleem dat opgelost moet worden. Verwacht entiteitsverheldering, geen sterretjes in de SERP.

## 9. Ondersteunt de markup AI Search en GEO daadwerkelijk?

**Op één laag zeer sterk, op de andere lagen nauwelijks.** Zie de uitgebreide behandeling in sectie H. Kort: structured data werkt op *entity recognition*. Het werkt niet op crawling, indexing, retrieval, autoriteit of aanbeveling.

## 10. Kan de `@id`-structuur beter?

**Ja, en dit is het grootste structurele gemis.** De huidige schema's zijn losse eilanden: `LodgingBusiness` in de root layout, `Organization` alleen als `publisher` binnen `BlogPosting`, `WebSite` op één plek. Niets verwijst naar iets anders.

De conventie: absolute URL van de canonieke pagina, plus een fragment als identificatie.

```
https://www.huisterhuynen.nl/#organization
https://www.huisterhuynen.nl/#lodging
https://www.huisterhuynen.nl/#website
https://www.huisterhuynen.nl/lodge-de-heide#accommodation
https://www.huisterhuynen.nl/lodge-de-eik#accommodation
```

Zodra die er zijn, verwijs je ernaar in plaats van nodes te dupliceren. Nu staat `seller` in de `Offer` als een volledig herhaalde `LodgingBusiness`-node; dat wordt `{ "@id": "https://www.huisterhuynen.nl/#lodging" }`.

## 11. Moet elke accommodatie een eigen permanente URL krijgen?

**Ja — en die bestaan al.** `/lodge-de-heide` en `/lodge-de-eik` zijn volwaardige landingspagina's met een eigen H1, eigen inhoud en een eigen canonical.

Dat ze niet aan de `Accommodation`-nodes gekoppeld zijn, is verspilling: je hebt de pagina's gebouwd maar vertelt geen enkel systeem dat ze over die entiteiten gaan. Voeg `@id` en `url` toe, en zet op elke lodgepagina de bijbehorende `Accommodation`-node met `mainEntityOfPage`.

## 12. Moet `sameAs` worden toegevoegd?

**Ja. Dit is de belangrijkste enkele toevoeging in het hele document.**

Uit de audit: er staat op dit moment geen enkele `sameAs` op de hoofdentiteit. Een entiteit zonder externe verankering is voor een kennisgraaf een eiland — en juist bij een naam die met een vastgoedproject van 70 woningen wordt gedeeld, is dat het verschil tussen herkend en verward worden.

Minimaal: de Booking.com-vermelding en het Google-bedrijfsprofiel. De `place_id` zit al in de code (`GOOGLE_MAPS_PLACE_URL` in `lib/google-reviews.ts`).

## 13. Moeten `WebSite`, `WebPage`, `BreadcrumbList`, `Organization` of andere entiteiten erbij?

| Type | Advies |
|---|---|
| `Organization` | **Ja** — als aparte node met `@id`, niet alleen als `publisher` in een blogartikel. Dit is de juridische/uitgevende entiteit; `LodgingBusiness` is de operationele. |
| `WebSite` | **Ja** — met `publisher` → `Organization`. |
| `WebPage` | **Optioneel.** Voegt weinig toe boven de bestaande metadata, behalve op pagina's met een `mainEntity`. |
| `BreadcrumbList` | **Staat er al**, op landingspagina's en blog. Correct. |
| `Person` | **Ja** — voor de eigenaar. Nu staat er alleen een auteursnaam als string op blogartikelen. Een `Person`-node met `worksFor` koppelt de aantoonbare lokale kennis in die artikelen aan de organisatie. Dat is E-E-A-T die nu ongebruikt blijft liggen. |
| `FAQPage` | **Staat er al.** Correct. |

**Eén ding uitdrukkelijk níét doen:** `potentialAction: SearchAction` op de `WebSite`. Dat is de sitelinks-searchbox, en die vereist een werkende zoekfunctie op de site. Die is er niet. Markup voor functionaliteit die niet bestaat, is een onjuiste bewering.

## 14. Kunnen reviews en ratings correct en toegestaan worden gemodelleerd?

**Nu niet. Later wel, en dan volgens strikte regels.**

Er zijn nog geen gasten geweest — de opening is 1 april 2027. Een `aggregateRating` toevoegen zou een verzonnen feit zijn in machineleesbare vorm.

De regels die straks gelden:

1. `aggregateRating` moet overeenkomen met recensies die **zichtbaar op diezelfde pagina** staan. Niet met een totaal dat alleen op Google staat.
2. Zelf verzamelde recensies over het eigen bedrijf op een `LocalBusiness`-type vallen onder Google's beperkingen op self-serving reviews. Recensies die je zelf plaatst over jezelf, worden genegeerd of bestraft.
3. `reviewCount` en `ratingValue` moeten kloppen en meebewegen.

De huidige code doet dit **goed**: de homepage toont "de eerste beoordelingen verschijnen hier zodra onze eerste gasten hebben verbleven" en er is geen ratingschema. Niet aankomen tot er echte, getoonde recensies zijn.

## 15. Zijn `Offer`, prijsinformatie en boekingsinformatie relevant?

**Ja, en dit is al het sterkste deel van de huidige implementatie.** De `Offer` met `UnitPriceSpecification`, `referenceQuantity` (één nacht) en `eligibleQuantity` (minimaal twee nachten) is zorgvuldiger dan wat de meeste accommodatiesites hebben.

Drie verbeteringen:

- `availability` stond op `InStock` terwijl de opening 1 april 2027 is. **Inmiddels gerepareerd** naar `PreOrder` met `availabilityStarts`.
- `priceValidUntil` toevoegen, zodat duidelijk is tot wanneer de vanafprijs geldt.
- `seller` als `@id`-verwijzing in plaats van een gedupliceerde node.

## 16. Moeten afbeeldingen via `ImageObject` worden gekoppeld?

**Ja, voor de hoofdafbeeldingen.** `image` accepteert een kale URL-string, maar dan is er geen manier om afmetingen, bijschrift of onderwerp mee te geven.

```json
"image": {
  "@type": "ImageObject",
  "@id": "https://www.huisterhuynen.nl/#hero-image",
  "url": "https://www.huisterhuynen.nl/lodge-heide.jpg",
  "width": 1200,
  "height": 630,
  "caption": "Lodge De Heide met privé hottub op het terras, Zeijen, Drenthe"
}
```

Niet voor elke foto op de site — dat is ruis. Wel voor de hero en voor de hoofdafbeelding van elke lodge.

## 17. Moeten locatiegegevens aan de accommodatie-entiteit worden gekoppeld?

**Op bedrijfsniveau: ja, staat er al.** `address` en `geo` op de `LodgingBusiness` zijn correct.

**Per lodge: nee.** Beide lodges staan op hetzelfde perceel. Adres en coördinaten per unit dupliceren levert niets op en introduceert een bron van afwijking zodra er één wordt aangepast. Koppel de units in plaats daarvan met `containedInPlace` aan de `@id` van de onderneming; dan erven ze de locatie via de relatie.

## 18. Moeten de GPS-coördinaten en het adres gecontroleerd worden?

**Ja, en hier is een concrete reden tot zorg.**

De coördinaten in de code zijn `53.050119, 6.517024`. Ik kon ze niet verifiëren: de netwerkproxy blokkeert externe kaartdiensten vanuit deze omgeving.

Het adres luidt `Zuiderstraat 6 p`. Uit de audit bleek dat op Funda woningen op hetzelfde terrein staan als `Zuiderstraat 6-P1` en `Zuiderstraat 6-P3`. De aanduiding achter het huisnummer onderscheidt de kavels — en het is onduidelijk of "6 p" een kavelaanduiding is, een typefout, of de aanduiding van het hele terrein.

**Dit moet kloppen voordat er iets live gaat.** Een adres dat afwijkt van het Google-bedrijfsprofiel of van de KvK-inschrijving werkt averechts: het maakt het entiteitsprobleem groter in plaats van kleiner. Zie G.

## 19. Moeten lege properties zoals `telephone: ""` verwijderd worden?

**Ja, zonder uitzondering.**

Een lege string is geen ontbrekende waarde — het is de bewering dat de waarde leeg ís. Dat is slechter dan de property weglaten. Validators markeren het, en een consument die het serieus neemt, concludeert dat het bedrijf geen telefoonnummer heeft.

Hetzelfde geldt voor `null`, voor `"n.v.t."` en voor placeholders als `"+31 6 XXXXXXXX"`.

**Regel:** weet je de waarde niet, laat de property weg. Een ontbrekende property is neutraal, een onjuiste niet. (Dezelfde redenering die in `sitemap.ts` al over `lastmod` gaat.)

## 20. Moeten alle URL's canonieke pagina-URL's zijn in plaats van hash-fragmenten?

**Hier moeten twee dingen uit elkaar gehouden worden, en dat gaat vaak mis.**

| Veld | Hash-fragment | Toelichting |
|---|---|---|
| `@id` | **Ja, juist wél** | Een `@id` is een identificatie, geen adres. `https://www.huisterhuynen.nl/#lodging` is de aanbevolen conventie en hoort geen echte pagina te zijn. |
| `url` | **Nee** | Moet een echte, canonieke, opvraagbare pagina zijn. |
| `mainEntityOfPage` | **Nee** | Idem. |
| `sameAs` | **Nee** | Externe, volledige URL's. |

**Concreet punt in de huidige code:** de `Offer` heeft `url: "https://www.huisterhuynen.nl/#reserveren"`. Dat is een fragment in een `url`-veld. Het is verdedigbaar — het boekingsformulier ís een sectie op de homepage — maar een echte boekingspagina zou beter zijn. Laag prioriteit.

Als het voorstel van Gemini fragmenten gebruikt voor `url` of `sameAs`: verwijderen. Gebruikt het ze voor `@id`: laten staan, dat is correct.

---

# De claim: "hiermee beveelt ChatGPT je aan"

Deze claim is **technisch onjuist zoals hij gesteld is**, en het is belangrijk om te zien wáár hij precies misgaat. Negen lagen, van onder naar boven.

| Laag | Wat het is | Effect van JSON-LD |
|---|---|---|
| **Crawling** | Haalt een bot de URL op? | **Geen.** Bepaald door `robots.txt`, serverrespons, linkstructuur. |
| **Indexing** | Komt de opgehaalde pagina in een index? | **Vrijwel geen.** Bepaald door canonicals, kwaliteit, duplicatie. |
| **Retrieval** | Wordt de pagina geselecteerd als kandidaat voor déze vraag? | **Indirect en zwak.** Bepaald door relevantie, autoriteit, versheid. |
| **Entity recognition** | Snapt het systeem wélke entiteit dit is? | **Sterk. Dit is de laag waar structured data voor gemaakt is.** `@id`, `sameAs`, `disambiguatingDescription` werken hier. |
| **Source authority** | Vertrouwt het systeem je genoeg om je te noemen? | **Geen directe invloed.** Bepaald door externe vermeldingen, links, recensies, corroboratie. |
| **AI citation** | Word je genoemd of gelinkt in een antwoord? | **Indirect**, via duidelijkere entiteit — maar retrieval en autoriteit moeten er eerst zijn. |
| **AI recommendation** | Word je actief aánbevolen? | **Geen directe invloed.** Vereist vergelijkende onderbouwing: recensies, onafhankelijke bronnen. |
| **Structured data** | Machineleesbare herhaling van wat op de pagina staat | Voegt geen feiten toe, geen autoriteit, geen ranking. |
| **GEO / AEO** | De praktijk van optimaliseren voor al het bovenstaande | Structured data is één onderdeel, niet het geheel. |

## Wat wél klopt

- Structured data helpt aantoonbaar bij **entity recognition en disambiguatie**. Bij Huis ter Huynen, met een naam die gedeeld wordt met een vastgoedproject op hetzelfde adres, is dat geen detail maar hét knelpunt.
- Het maakt feiten (prijs, capaciteit, voorzieningen, locatie) **extraheerbaar zonder interpretatie**, wat de kans op een verkeerde weergave verkleint.
- Het is **goedkoop** en heeft geen nadeel, mits het klopt.

## Wat te stellig is

- **"Dan beveelt ChatGPT je aan."** Aanbeveling zit drie lagen boven waar structured data werkt. Er is geen aanbieder die schema.org-markup documenteert als aanbevelingssignaal.
- **"AI-systemen lezen je JSON-LD en nemen het over."** Aannemelijk voor extractie, maar niet gedocumenteerd als weegfactor. Wie dit als zekerheid presenteert, gaat verder dan wat bekend is.
- **"Meer schema is beter."** Nee. Markup voor iets dat niet op de pagina staat, is een onjuiste bewering — en bij recensies een reden voor een handmatige maatregel.

## Het empirische tegenargument

Uit de nulmeting in de audit: op de vraag *"bijzonder overnachten Drenthe luxe vakantiehuis hottub sauna"* werd het antwoord opgebouwd uit **acht portals en één concurrentensite**. Niet uit de JSON-LD van welke accommodatie dan ook.

De enige accommodatie die op eigen kracht in dat antwoord kwam, De Vier Eiken, kwam er niet in door beter schema maar door een sterkere site en meer externe verankering.

**Geen enkele hoeveelheid JSON-LD had Huis ter Huynen in dat antwoord gekregen.** Wat dat wel zou doen, staat in H.

---

# A. Gemini's voorstel: wat is goed?

Drie dingen, en het derde is er een die de huidige productiecode níét goed doet.

**1. De `@graph`-opzet met `@id`-verwijzingen.** Het voorstel bundelt alles in één graaf en laat de lodges naar de onderneming verwijzen in plaats van de nodes te dupliceren. Dat is precies de structuur die de huidige site mist, waar `LodgingBusiness`, `Organization` en `WebSite` als losse eilanden in verschillende bestanden staan. **Dit idee overnemen.**

**2. `containsPlace` en `containedInPlace` in beide richtingen.** Technisch redundant — de ene relatie impliceert de andere — maar het is expliciet en ondubbelzinnig, en het kost niets. Geen bezwaar.

**3. `unitCode: "C62"` op `occupancy`.** Hier is het voorstel **beter dan wat er nu live staat**. De huidige code heeft `{ "@type": "QuantitativeValue", "maxValue": 4 }` zonder eenheid: een getal 4 zonder dat vaststaat waarvan. `C62` is de UN/CEFACT-code voor "stuks" en is precies wat de documentatie van schema.org bij `occupancy` voorschrijft. **Dit overnemen.**

Verder is de typering correct: `LodgingBusiness` voor de onderneming, `Accommodation` voor de units, `LocationFeatureSpecification` voor de voorzieningen. Geen verzonnen types, geen properties op het verkeerde type.

---

# B. Gemini's voorstel: wat moet worden aangepast?

## B1. De GPS-coördinaten — kritiek

| Bron | Coördinaten |
|---|---|
| Codebase (`src/data/lodge.ts`) | `53.050119, 6.517024` |
| Voorstel van Gemini | `53.0489, 6.5481` |

**Afstand: 2.082 meter.** Berekend met de haversineformule.

Deze twee kunnen niet allebei goed zijn. De coördinaten in de codebase zijn nauwkeuriger opgegeven (zes decimalen tegen vier) en worden al gebruikt voor de routebeschrijving naar de oprit en voor de `geo`-metatags. De waarden van Gemini zijn afgerond en komen nergens anders in het project voor.

**Ik kan niet vaststellen welke juist is** — de netwerkproxy blokkeert externe kaartdiensten vanuit deze omgeving. Maar dit is geen detail: onjuiste `geo`-coördinaten in `LocalBusiness`-markup zijn actief schadelijk voor lokale vindbaarheid. Ze geven een kaartdienst een tegenstrijdig signaal over waar je bent.

**Actie:** controleer beide paren tegen het Google-bedrijfsprofiel en de werkelijke oprit voordat er iets live gaat. Neem de geverifieerde waarde over en verander de constante in `lodge.ts` als die fout blijkt.

## B2. `logo.png` bestaat niet — kritiek

```json
"logo": "https://www.huisterhuynen.nl/logo.png"
```

Er is geen `logo.png`. In `public/` staan `icon-192.png` en `icon-512.png`, en verder alleen foto's. Deze URL geeft een **404**.

Een `logo` dat naar een niet-bestaand bestand wijst, is erger dan geen logo: het is een kapotte bewering, en Google gebruikt `logo` onder meer voor kennispanelen.

**Aanpassen naar** `https://www.huisterhuynen.nl/icon-512.png`, óf een echt logobestand toevoegen aan `public/`. De tweede optie is beter — een 512×512 app-icoon is geen merklogo — maar dan moet dat bestand er wel eerst zijn.

## B3. `url` op de lodges gebruikt hash-fragmenten

```json
"url": "https://www.huisterhuynen.nl/#lodge-de-heide"
```

Dit is precies de fout uit controlevraag 20. Een `url` moet een echte, opvraagbare, canonieke pagina zijn. Een fragment is geen pagina.

En het pijnlijke: **die pagina's bestaan al.** `/lodge-de-heide` en `/lodge-de-eik` zijn volwaardige landingspagina's met een eigen H1, eigen inhoud en een eigen canonical.

| Veld | Gemini | Moet worden |
|---|---|---|
| `@id` De Heide | `.../#lodge-de-heide` | `.../lodge-de-heide#accommodation` |
| `url` De Heide | `.../#lodge-de-heide` | `.../lodge-de-heide` |
| `@id` De Eik | `.../#lodge-de-eik` | `.../lodge-de-eik#accommodation` |
| `url` De Eik | `.../#lodge-de-eik` | `.../lodge-de-eik` |

Let op het onderscheid: in de `@id` is een fragment **correct** — dat is een identificatie. In de `url` is het fout.

## B4. Het `@id` van de hoofdnode heet `#organization` maar is een `LodgingBusiness`

```json
{ "@type": "LodgingBusiness", "@id": "https://www.huisterhuynen.nl/#organization" }
```

Een `@id` is formeel ondoorzichtig, dus dit is geen fout. Maar het is misleidend, en het blokkeert de volgende stap: zodra je een echte `Organization`-node toevoegt (aanbevolen, zie D), botst die met deze naam.

**Aanpassen naar** `#lodging`, en `#organization` reserveren voor de organisatie.

## B5. Voorzieningen die geen voorzieningen zijn

```json
{ "name": "Panoramisch heide- en bosuitzicht", "value": true }
{ "name": "Hoge plafonds & authentieke details", "value": true }
```

`amenityFeature` is bedoeld voor faciliteiten die je objectief kunt afvinken. Een uitzicht en een plafondhoogte zijn kwaliteiten, geen voorzieningen. Het is geen spec-overtreding, maar het verdunt de lijst: een systeem dat voorzieningen vergelijkt, krijgt hier ruis tussen de signalen.

Die kwaliteiten horen in `description`, waar ze trouwens al staan.

## B6. "Huisdieren toegestaan (in overleg)"

Twee problemen in één regel.

Ten eerste hoort het voorbehoud niet in een `name`-veld. Ten tweede — en dat weegt zwaarder — **spreekt het de site tegen**: de huidige JSON-LD zegt `petsAllowed: true` zonder voorbehoud, en de landingspagina over vakantie met hond doet dat ook.

Gebruik de getypeerde property `petsAllowed: true` en houd het verhaal gelijk aan de rest van de site. Is "in overleg" de werkelijke regel, pas dan de site aan, niet alleen het schema.

## B7. `description` van de hoofdnode mist de disambiguatie

De beschrijving is correct maar onvolledig voor het probleem dat hier speelt. Er is geen `disambiguatingDescription`, geen `alternateName`, geen `containedInPlace` naar het resort. Zie C3 en D.

---

# C. Gemini's voorstel: wat moet worden verwijderd?

## C1. `telephone: ""` — direct verwijderen

```json
"telephone": ""
```

Een lege string is niet "onbekend", het is de bewering dat de waarde leeg ís. Dat is slechter dan de property weglaten.

Twee opties, allebei beter dan dit: vul het echte nummer in (`+31642568603`, dat inmiddels als `LODGE_PHONE_E164` in `data/lodge.ts` staat), of laat de property weg. **Nooit leeg laten staan.**

## C2. Het voorstel als geheel — als vervanging van wat er nu staat

Dit is het zwaarste bezwaar en het staat los van alle losse fouten.

**Wat er nu live staat en in het voorstel ontbreekt:**

| Ontbreekt in het voorstel | Wat je verliest |
|---|---|
| `makesOffer` met `Offer` | **De volledige prijsinformatie.** `UnitPriceSpecification`, `referenceQuantity` (één nacht), `eligibleQuantity` (minimaal twee nachten), `valueAddedTaxIncluded` |
| `availability` + `availabilityStarts` | Dat de accommodatie op 1 april 2027 opent — deze week nog gerepareerd |
| `priceRange`, `currenciesAccepted` | Prijsindicatie en valuta |
| `checkInTime` / `checkOutTime` | 15:00 / 11:00 |
| `image` | De hero-afbeelding |
| `hasMap` | De koppeling naar het Google-bedrijfsprofiel |
| `petsAllowed` (getypeerd) | Vervangen door een tekstregel met voorbehoud |
| `telephone` (gevuld) | Vervangen door een lege string |

De `Offer` is volgens de audit het **sterkste onderdeel** van de huidige implementatie: de vanafprijs machineleesbaar, met eenheid en minimumverblijf. Dat is zeldzaam goed gedaan en precies het soort feit waar een AI-systeem een antwoord op baseert.

**Het voorstel één-op-één overnemen is daarom een achteruitgang, niet een verbetering.** Neem de drie goede ideeën over (A1, A2, A3) en voeg ze toe aan wat er staat.

## C3. Wat er níét in staat en er ook niet in hoort — maar wel toegevoegd moet worden

Geen verwijdering, wel de kern: het voorstel **doet niets aan het probleem waarvoor deze hele exercitie bedoeld is.**

Uit de audit: "Huis ter Huynen" is ook de naam van een vastgoedontwikkeling van 70 recreatiewoningen op hetzelfde adres. Het voorstel bevat geen `sameAs`, geen `disambiguatingDescription`, geen `alternateName`, geen `containedInPlace` naar het resort en geen `Organization`- of `Person`-node.

Een graaf die keurig beschrijft wat de accommodatie is, maar niet zegt wíé hij is en waar hij níét mee verward moet worden, lost het enige echte entiteitsprobleem niet op.

---

# D. Welke schema's ontbreken?

| Ontbrekend | Waarom het uitmaakt | Prioriteit |
|---|---|---|
| **`sameAs` op de hoofdentiteit** | Geen externe verankering; de kennisgraaf kan Booking, Google-profiel en site niet als één entiteit herkennen | **P0** |
| **`disambiguatingDescription` + `containedInPlace`** | Niets onderscheidt de verhuur van het gelijknamige park van 70 woningen | **P0** |
| **`@id`-graaf** | Losse eilanden; `Organization` bestaat alleen als publisher in een blogartikel | **P1** |
| **`Person` voor de eigenaar** | De aantoonbare lokale kennis in de blogartikelen is nergens aan de organisatie gekoppeld | **P1** |
| **`url` en `@id` op de twee `Accommodation`-nodes** | De lodgepagina's bestaan al maar zijn niet gekoppeld | **P1** |
| **`ImageObject` voor hero en lodgefoto's** | Kale URL-strings dragen geen context | P2 |
| **`amenityFeature` met `value: false`** | "Heeft De Eik een sauna?" is nu niet te beantwoorden | P2 |
| **`unitCode` op `occupancy`** | Een getal zonder eenheid | P2 |
| **`priceValidUntil` op de `Offer`** | Geen geldigheidstermijn bij de vanafprijs | P3 |
| **`AggregateRating` / `Review`** | **Bewust afwezig, niet toevoegen** tot er echte, getoonde recensies zijn | — |

---

# E. De ideale entity graph

```
Organization (#organization)
│  de uitgevende en juridische entiteit
│  sameAs → Booking.com, Google-profiel, social
│
├── founder / employee → Person (#owner)
│                        Arjan Reinders, auteur van de blogartikelen
│
├── publisher van → WebSite (#website)
│                   └── over → alle WebPages
│
└── parentOrganization van → LodgingBusiness (#lodging)
    │  de operationele accommodatie
    │  additionalType: VacationRental
    │  address, geo, checkin/checkout, priceRange
    │  disambiguatingDescription ← lost het naamconflict op
    │
    ├── containedInPlace → Place "Resort Huis ter Huynen"
    │                      ← zegt: wij liggen erbinnen, wij zíjn het niet
    │
    ├── makesOffer → Offer
    │                seller → @id #lodging (geen duplicaat)
    │                availability: PreOrder + availabilityStarts
    │
    ├── containsPlace → Accommodation+House (#accommodation op /lodge-de-heide)
    │                   occupancy, amenityFeature (sauna: true)
    │                   url → /lodge-de-heide
    │
    └── containsPlace → Accommodation+House (#accommodation op /lodge-de-eik)
                        occupancy, amenityFeature (sauna: false, bbq: true)
                        url → /lodge-de-eik
```

Het principe: **één graaf, elke node één keer gedefinieerd, de rest verwijst met `@id`.**

---

# F. Implementeerbare JSON-LD

> **Niet live zetten voordat sectie G is afgewerkt.** De gemarkeerde waarden zijn onbevestigd.

Plaatsing: in `src/app/layout.tsx`, ter vervanging van de huidige losse `jsonLd`-constante. De `PRICE_FROM_EUR`, `LODGE_LAT`, `LODGE_LON`, `BOOKINGS_OPEN_FROM` en `LODGE_PHONE_E164` komen uit de bestaande constanten — niet opnieuw hardcoderen.

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
      "logo": {
        "@type": "ImageObject",
        "@id": "https://www.huisterhuynen.nl/#logo",
        "url": "https://www.huisterhuynen.nl/icon-512.png",
        "width": 512,
        "height": 512
      },
      "founder": { "@id": "https://www.huisterhuynen.nl/#owner" },
      "sameAs": [
        "TE CONTROLEREN — canonieke Booking.com-URL",
        "TE CONTROLEREN — Google-bedrijfsprofiel-URL",
        "TE CONTROLEREN — Instagram, alleen als het profiel van de verhuur is",
        "TE CONTROLEREN — Facebook"
      ]
    },

    {
      "@type": "Person",
      "@id": "https://www.huisterhuynen.nl/#owner",
      "name": "Arjan Reinders",
      "jobTitle": "Eigenaar",
      "worksFor": { "@id": "https://www.huisterhuynen.nl/#organization" },
      "knowsAbout": ["Drenthe", "Zeijen", "Drentsche Aa", "Wandelen in Drenthe", "Wellness"]
    },

    {
      "@type": "WebSite",
      "@id": "https://www.huisterhuynen.nl/#website",
      "url": "https://www.huisterhuynen.nl",
      "name": "Huis ter Huynen",
      "publisher": { "@id": "https://www.huisterhuynen.nl/#organization" },
      "inLanguage": ["nl-NL", "de-DE"]
    },

    {
      "@type": "LodgingBusiness",
      "additionalType": "https://schema.org/VacationRental",
      "@id": "https://www.huisterhuynen.nl/#lodging",
      "name": "Huis ter Huynen — Lodge De Heide & Lodge De Eik",
      "alternateName": ["Huis ter Huynen Lodges", "Lodge De Heide", "Lodge De Eik"],
      "description": "Twee vrijstaande boutique lodges op de Drentse heide bij Zeijen, elk met privé hottub en terras. Geen receptie, geen gedeelde wellness.",
      "disambiguatingDescription": "Particuliere verhuur van twee vrijstaande lodges met privé hottub op het terrein Huis ter Huynen in Zeijen. Niet te verwarren met Resort Huis ter Huynen / Landgoed De Huynen, de verkoop van recreatiewoningen op datzelfde terrein.",
      "url": "https://www.huisterhuynen.nl",
      "parentOrganization": { "@id": "https://www.huisterhuynen.nl/#organization" },
      "telephone": "+31642568603",
      "email": "lodge@huisterhuynen.nl",
      "numberOfRooms": 2,
      "petsAllowed": true,
      "availableLanguage": ["nl", "de", "en"],
      "priceRange": "€€€",
      "currenciesAccepted": "EUR",
      "checkinTime": "15:00:00",
      "checkoutTime": "11:00:00",

      "address": {
        "@type": "PostalAddress",
        "streetAddress": "TE CONTROLEREN — zie sectie G",
        "postalCode": "9491 TH",
        "addressLocality": "Zeijen",
        "addressRegion": "Drenthe",
        "addressCountry": "NL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 53.050119,
        "longitude": 6.517024
      },
      "hasMap": "TE CONTROLEREN — Google Maps place-URL",

      "containedInPlace": {
        "@type": "Place",
        "name": "Resort Huis ter Huynen",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Zeijen",
          "addressRegion": "Drenthe",
          "addressCountry": "NL"
        }
      },

      "image": {
        "@type": "ImageObject",
        "@id": "https://www.huisterhuynen.nl/#hero-image",
        "url": "https://www.huisterhuynen.nl/lodge-heide.jpg",
        "width": 1200,
        "height": 630,
        "caption": "Lodge De Heide met privé hottub op het terras, Zeijen, Drenthe"
      },

      "sameAs": [
        "TE CONTROLEREN — dezelfde lijst als bij Organization"
      ],

      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Privé hottub", "alternateName": ["Jacuzzi", "Whirlpool", "Bubbelbad"], "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Sauna", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Gratis wifi", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "EV-laadpaal", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Privé terras", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Volledig uitgeruste keuken", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Gratis parkeren op eigen terrein", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Receptie", "value": false },
        { "@type": "LocationFeatureSpecification", "name": "Gedeelde wellnessruimte", "value": false }
      ],

      "makesOffer": {
        "@type": "Offer",
        "name": "Overnachting in een privé lodge met hottub",
        "description": "Vanafprijs per nacht voor een van beide lodges, bij een verblijf van minimaal twee nachten.",
        "price": 165,
        "priceCurrency": "EUR",
        "availability": "https://schema.org/PreOrder",
        "availabilityStarts": "2027-04-01",
        "priceValidUntil": "TE CONTROLEREN — tot wanneer geldt € 165?",
        "url": "https://www.huisterhuynen.nl/#reserveren",
        "seller": { "@id": "https://www.huisterhuynen.nl/#lodging" },
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": 165,
          "priceCurrency": "EUR",
          "minPrice": 165,
          "unitCode": "DAY",
          "unitText": "nacht",
          "referenceQuantity": {
            "@type": "QuantitativeValue",
            "value": 1,
            "unitCode": "DAY",
            "unitText": "nacht"
          },
          "valueAddedTaxIncluded": true
        },
        "eligibleQuantity": {
          "@type": "QuantitativeValue",
          "minValue": 2,
          "unitCode": "DAY",
          "unitText": "nachten"
        }
      },

      "containsPlace": [
        { "@id": "https://www.huisterhuynen.nl/lodge-de-heide#accommodation" },
        { "@id": "https://www.huisterhuynen.nl/lodge-de-eik#accommodation" }
      ]
    },

    {
      "@type": ["Accommodation", "House"],
      "@id": "https://www.huisterhuynen.nl/lodge-de-heide#accommodation",
      "name": "Lodge De Heide",
      "description": "Vrijstaande lodge voor vier personen met eigen sauna, privé hottub en uitzicht over heide en bos.",
      "url": "https://www.huisterhuynen.nl/lodge-de-heide",
      "containedInPlace": { "@id": "https://www.huisterhuynen.nl/#lodging" },
      "occupancy": {
        "@type": "QuantitativeValue",
        "minValue": 1,
        "maxValue": 4,
        "unitCode": "C62",
        "unitText": "personen"
      },
      "numberOfBedrooms": "TE CONTROLEREN",
      "numberOfBathroomsTotal": "TE CONTROLEREN",
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": "TE CONTROLEREN",
        "unitCode": "MTK"
      },
      "petsAllowed": true,
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Privé hottub", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Sauna", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Buitenkeuken & bbq", "value": false }
      ]
    },

    {
      "@type": ["Accommodation", "House"],
      "@id": "https://www.huisterhuynen.nl/lodge-de-eik#accommodation",
      "name": "Lodge De Eik",
      "description": "Vrijstaande lodge voor vier personen met privé hottub en buitenkeuken met bbq onder de eiken.",
      "url": "https://www.huisterhuynen.nl/lodge-de-eik",
      "containedInPlace": { "@id": "https://www.huisterhuynen.nl/#lodging" },
      "occupancy": {
        "@type": "QuantitativeValue",
        "minValue": 1,
        "maxValue": 4,
        "unitCode": "C62",
        "unitText": "personen"
      },
      "numberOfBedrooms": "TE CONTROLEREN",
      "numberOfBathroomsTotal": "TE CONTROLEREN",
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": "TE CONTROLEREN",
        "unitCode": "MTK"
      },
      "petsAllowed": true,
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Privé hottub", "value": true },
        { "@type": "LocationFeatureSpecification", "name": "Sauna", "value": false },
        { "@type": "LocationFeatureSpecification", "name": "Buitenkeuken & bbq", "value": true }
      ]
    }
  ]
}
```

**Bewust weggelaten:** `aggregateRating`, `review`, `potentialAction: SearchAction`, `openingHoursSpecification`. De eerste twee omdat er geen recensies zijn, de derde omdat er geen zoekfunctie is, de vierde omdat 00:00–23:59 zeven dagen per week botst met de check-in- en check-outtijden erboven en niets toevoegt voor een accommodatie zonder receptie.

---

# G. Te controleren vóór livegang

| # | Gegeven | Waarom | Waar te controleren |
|---|---|---|---|
| 1 | **Straatnaam + huisnummer** | De code zegt `Zuiderstraat 6 p`; op Funda staan kavels als `Zuiderstraat 6-P1` en `6-P3`. Onduidelijk of "6 p" een kavel of het terrein aanduidt | KvK-inschrijving, Google-bedrijfsprofiel, BAG |
| 2 | **GPS-coördinaten** | `53.050119, 6.517024` niet verifieerbaar vanuit deze omgeving | Google Maps: wijzen ze naar de oprit van de lodges? |
| 3 | **Canonieke Booking.com-URL** | De gevonden URL is een taalvariant (`.sv.html`) | Booking-extranet, de `.nl.html`- of taalloze variant |
| 4 | **Google-bedrijfsprofiel-URL** | `place_id` staat in de code maar is niet geverifieerd | Google Business Profile |
| 5 | **Eigenaarsnaam en rol** | "Arjan Reinders" komt uit blogauteurschap, niet uit een bedrijfsbron | KvK |
| 6 | **Social profielen** | Alleen een Instagram van Kleen Resorts gevonden — dat is de ontwikkelaar, niet de verhuur | Eigen accounts |
| 7 | **Woonoppervlak per lodge** | Kleen Resorts noemt ~58 m² voor de te koop staande woningen; onbekend of dat voor deze twee geldt | Eigen opgave |
| 8 | **Aantal slaapkamers en badkamers** | Nergens in de code vastgelegd | Eigen opgave |
| 9 | **`priceValidUntil`** | Tot wanneer geldt € 165? | Eigen tariefbeleid |
| 10 | **Telefoonnummer op alle kanalen gelijk** | Stond op zestien plekken in twee schrijfwijzen | Site, Booking, Google-profiel, KvK |
| 11 | **Naamsvoering** | Is de publieke naam "Huis ter Huynen" of "Huis ter Huynen Lodges"? Een merkbeslissing die de `name` bepaalt | Eigenaar |
| 12 | **Relatie met het resort** | Mag je je positioneren als *binnen* Resort Huis ter Huynen? | Afspraken met Kleen Resorts |

Punt 12 is geen technische vraag maar wel een blokkerende: `containedInPlace` doet een uitspraak over de verhouding tot een derde partij.

---

# H. Wat structured data oplost — en wat níét

## Wel

| Probleem | Hoe |
|---|---|
| "Welke entiteit is dit?" | `@id`, `sameAs`, `disambiguatingDescription` |
| "Is dit het park of de verhuur?" | `containedInPlace`, `alternateName`, `parentOrganization` |
| "Wat kost het, voor hoeveel personen, wanneer open?" | `Offer`, `occupancy`, `availabilityStarts` |
| "Welke lodge heeft de sauna?" | `containsPlace` met eigen `amenityFeature` per unit |
| "Wie zit erachter?" | `Person` + `worksFor` |
| Verkeerde weergave van feiten | Machineleesbaar in plaats van uit lopende tekst afgeleid |

## Niet

| Probleem | Wat er wél voor nodig is |
|---|---|
| **Niet genoemd worden in het antwoord op de kernvraag** | Aanwezigheid in de bronnen die dat antwoord voeden: origineelovernachten.nl, bijzonderplekje.nl, natuurhuisje.nl, drenthe.nl. Acht van de negen bronnen in de gemeten nulmeting waren portals |
| **Geen autoriteit** | Externe vermeldingen, links, pers. Regionale media rond de opening |
| **Geen recensies** | Echte gasten vanaf 1 april 2027, en een proces om ze te vragen |
| **Merkpositie 15,3** | Entiteitsverheldering *plus* externe verankering. Schema alleen doet de helft |
| **Portaaldominantie** | Erin gaan staan. Dit is aanmeldwerk, geen ontwikkelwerk |
| **Aanbevolen worden** | Vergelijkende onderbouwing: recensies, onafhankelijke beschrijvingen, consistente feiten over meerdere bronnen |

## De verhouding

Structured data is **noodzakelijk maar bij lange na niet voldoende**. Voor Huis ter Huynen specifiek is de verdeling ongeveer:

- **Schema lost op:** de verwarring met het gelijknamige park, en de extraheerbaarheid van prijs, capaciteit en voorzieningen. Dat is echt werk en het moet gebeuren.
- **Schema lost niet op:** dat de accommodatie in geen enkele portal staat, geen recensies heeft en geen externe verankering. Dat is waar de zichtbaarheid feitelijk op vastloopt.

Wie de JSON-LD perfect maakt en de rest laat liggen, heeft een onberispelijk beschreven entiteit die niemand tegenkomt.

---

*Beoordeling op basis van de broncode van de productiesite en de bevindingen uit `seo-ai-search-audit-2026-09.md`. Afstandsberekening tussen de coördinatenparen met de haversineformule; het ontbreken van `logo.png` geverifieerd tegen `public/`. De coördinaten zelf zijn niet tegen een kaart gecontroleerd — de netwerkproxy blokkeert externe kaartdiensten vanuit deze omgeving.*

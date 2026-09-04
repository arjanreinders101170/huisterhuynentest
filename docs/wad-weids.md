# Wad & Weids — merkplatform en mock-up

Een interactieve mock-up van het nieuwe verhuurplatform, gebouwd als
component-based prototype in de bestaande Next.js-stack. Niet als plaatje:
alles wat je ziet is werkende code, met een datalaag die al de vorm heeft
van de MyTourist-koppeling.

**Bekijken:** `npm run dev` → <http://localhost:3000/wad-weids>

**Delen zonder server:** `node scripts/prototype/build.mjs <map>` maakt één
html-bestand met het stylesheet en alle beelden erin — handig om rond te
sturen. Dat bestand is een momentopname om te tonen; de site zelf blijft
`src/app/wad-weids`.

| Scherm | Route |
| --- | --- |
| Homepage | `/wad-weids` |
| Zoekresultaten met filters | `/wad-weids/verblijven` |
| Accommodatiepagina + boekingsmodule | `/wad-weids/verblijven/[slug]` |
| Bestemmingen | `/wad-weids/bestemmingen` |
| Eén bestemming | `/wad-weids/bestemmingen/[slug]` |
| Mobiele weergave (drie telefoonframes) | `/wad-weids/mobiel` |
| Merk, designsysteem en architectuur | `/wad-weids/merk` |

De mock-up staat volledig los van Huis ter Huynen: eigen kleuren, eigen
typografie, eigen navigatie, `noindex`, en geen cookiebanner of stickybalk
van de bestaande site. Verhuizen naar een eigen domein of repository is
een kwestie van de map meenemen.

---

## 1. Het uitgangspunt

Wad & Weids is de voorkant richting de gast; MyTourist is de motor
erachter. De website is dus geen boekingsformulier met een merklaagje,
maar een merkplatform dat toevallig ook boekt.

```
Wad & Weids (Next.js)
   │
   │  MyTouristClient   ← src/lib/wadweids/mytourist.ts
   │      listProperties()   getProperty()
   │      getAvailability()  quote()
   │      search()           createBooking()
   ▼
MyTourist PMS
   beschikbaarheid · dynamische tarieven · reserveringen · gasten
```

Wat waar hoort:

| Gegeven | Bron | Verversing |
| --- | --- | --- |
| Beschikbaarheid, tarieven | MyTourist | live, niet cachen (max 60 s) |
| Naam, capaciteit, vaste kosten, minimumverblijf | MyTourist | nachtelijke sync |
| Reserveringen, opties, aanbetaling | MyTourist | schrijven via `createBooking()` |
| Teksten, fotografie, bestemmingen, inspiratie | Wad & Weids zelf | redactie |

Content hoort bewust *niet* in het PMS. Dat is het merk, en dat is precies
het deel dat Wad & Weids onderscheidt van een boekingsportaal.

---

## 2. Mappen

```
src/app/wad-weids/            de zeven schermen + wadweids.css (designsysteem)
src/components/wadweids/      alle UI-componenten
src/lib/wadweids/types.ts     het datamodel — het contract met het PMS
src/lib/wadweids/content.ts   collectie, bestemmingen, voorzieningen
src/lib/wadweids/mytourist.ts de PMS-adapter (mock + echte client)
scripts/wadweids-images.mjs   generator voor de sfeerbeelden
scripts/prototype/            bouwt de deelbare één-bestandsversie
public/wad-weids/             de gegenereerde beelden
```

### Componenten

| Component | Waar in gebruik |
| --- | --- |
| `SiteHeader` / `SiteFooter` | alle schermen |
| `Logo` / `LogoMark` | header, footer, merkpagina |
| `SearchBar` | homepage, zoekpagina, bestemmingspagina |
| `PropertyCard` / `PropertyGrid` | homepage, zoekresultaten, bestemming, "vergelijkbaar" |
| `SearchResults` | zoekpagina (filters, sorteren, sheet op mobiel) |
| `PropertyDetail` | accommodatiepagina en het telefoonframe |
| `BookingWidget` | accommodatiepagina |
| `DestinationTile` | homepage, bestemmingen, bestemmingspagina |
| `ValueProps`, `LifestyleBand`, `SectionHead` | homepage, bestemmingen |
| `FavoriteButton`, `Icons` | overal |

Pagina's stellen alleen componenten samen. Er staat nergens een woning
hardgecodeerd in een pagina — daarom kost woning nummer vijftig evenveel
ontwerpwerk als woning nummer negen: geen.

---

## 3. Een woning toevoegen

1. Record toevoegen aan `PROPERTIES` in `src/lib/wadweids/content.ts`
   (live: dit komt uit de nachtelijke sync met MyTourist).
2. `id` is het MyTourist-property-id — de sleutel voor beschikbaarheid,
   prijzen en reserveringen.
3. `slug` bepaalt de url van de detailpagina; die wordt automatisch
   gegenereerd (`generateStaticParams`).
4. Beelden in `images[]` zetten. Meer niet.

De woning verschijnt daarna vanzelf op de homepage, in de zoekresultaten,
op de bestemmingspagina, in de filters en in de footerstatistieken.

Een bestemming toevoegen werkt hetzelfde via `DESTINATIONS`; een nieuwe
voorziening is één regel in `AMENITIES` (met `filter: true` als hij ook een
filterknop moet worden).

---

## 4. Live gaan met MyTourist

In `src/lib/wadweids/mytourist.ts` staan twee implementaties van hetzelfde
contract:

* `mockMyTourist` — deterministische mock: seizoens- en weekendtarieven,
  minimumverblijf, aankomstdagen in het hoogseizoen, bezette nachten.
* `httpMyTourist({ baseUrl, apiKey })` — de echte client, met de endpoints
  al uitgeschreven.

Omschakelen is één regel onderaan het bestand:

```ts
export const myTourist: MyTouristClient = httpMyTourist({
  baseUrl: process.env.MYTOURIST_API_URL!,
  apiKey: process.env.MYTOURIST_API_KEY!,
});
```

Aandachtspunten voor die stap:

* beschikbaarheid en prijzen niet cachen (of maximaal 60 seconden);
* woningkenmerken 's nachts synchroniseren naar de eigen database, zodat
  de site blijft werken als het PMS er even uit ligt;
* webhook van MyTourist gebruiken om een net gemaakte boeking direct te
  verversen;
* bij een storing: laatst bekende prijzen tonen en boeken uitzetten in
  plaats van een lege pagina.

De boekingsmodule verandert daarbij niet: hij toont wat `quote()` teruggeeft.

---

## 5. Ontwerp

* **Kleur** — gebroken wit `#FAF8F4`, zand `#EFE7D9`, zand diep `#E2D6C2`,
  klei `#C9B79C`, diep groen `#23392F`, zeeblauw `#1D3B4A`, oker `#A8834C`,
  inkt `#1A201E`. Meer heeft het merk niet nodig.
* **Typografie** — Cormorant Garamond (display) en Jost (interface).
* **Logo** — woordmerk in kapitalen met ruime letterafstand; beeldmerk is
  een horizon met één wadpaal die de lijn doorbreekt.
* **Responsive** — container queries in plaats van media queries. Daardoor
  toont `/wad-weids/mobiel` de échte pagina's in een frame van 390 pixels,
  in plaats van losse mobiele schermafbeeldingen die uit de pas gaan lopen.

Alle klassen staan in één stylesheet: `src/app/wad-weids/wadweids.css`.

---

## 6. Fotografie

Fotografie draagt dit merk. In de mock-up staat wat er nu is:

* **Echte foto's** bij de Drentse woning en in de hero — de bestaande
  lodgefotografie.
* **Gegenereerde sfeerbeelden** voor de kust- en waddenscènes, gemaakt met
  `scripts/wadweids-images.mjs`: gelaagde horizonnen, mist en tegenlicht in
  het merkpalet. Ze houden de mock-up heel zonder goedkope stockfoto's,
  maar ze zijn nadrukkelijk een plaatshouder.

Vervangen is één regel per beeld in `content.ts` (`images[].src`). Voor de
echte site is een fotoshoot per woning het belangrijkste investeringspunt:
brede landschappen, ochtendmist, gouden avondlicht, interieurdetails,
buitenleven — en per woning minstens vijf beelden voor de galerij.

---

## 7. Wat er nog niet in zit

Bewust buiten deze mock-up gelaten, maar wel voorzien in het model:

* gastaccount en "mijn boeking" (favorieten staan nu in de browser);
* betaalflow na `createBooking()` — Mollie of de betaallink van MyTourist;
* inspiratie- en blogartikelen als echte pagina's;
* meertaligheid (DE/EN) — de teksten staan al gescheiden van de opmaak;
* kaartweergave bij de zoekresultaten;
* e-mails en documenten in de huisstijl.

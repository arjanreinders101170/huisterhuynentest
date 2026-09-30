# TASK — Beschikbaarheid en prijs uit MyTourist, doorsturen naar de Booking Engine

Status: DRAFT — wacht op de open vragen onderaan en op stap 1 (MyTourist gecontroleerd).
Opsteller: Claude, op verzoek van Arjan. Uitvoering: aparte branch `claude/<korte-beschrijving>`, één PR.

## Doel

Een bezoeker die op de site datums kiest, ziet per lodge of die nachten vrij zijn
en wat het verblijf kost, met beide gegevens rechtstreeks uit MyTourist. Is de
lodge vrij, dan gaat hij met één klik naar de MyTourist Booking Engine, met de
datums en de lodge al ingevuld. Het huidige aanvraagformulier blijft staan als
terugval.

Dit is stap 2 van 4 in de overstap naar MyTourist. Stap 3 (eigen boekingsflow
uitzetten) en stap 4 (concierge/Nuki) horen **niet** bij deze taak.

## Huidige situatie (gecontroleerd in de code)

| Onderdeel | Waar | Wat het nu doet |
| --- | --- | --- |
| Beschikbaarheid in het formulier | `src/components/RequestForm.tsx` (r. ~96), `RequestFormDE.tsx` (r. ~59) | `fetch('/api/beschikbaarheid?checkIn&checkOut')` en toont vrij/bezet per lodge, inclusief de suggestie "de andere lodge is wel vrij". |
| Route | `src/app/api/beschikbaarheid/route.ts` | `vrijeLodges()` uit `src/lib/availability.ts`: Booking.com-iCal (`ICAL_LODGE_1/2`) + bevestigde reserveringen uit Supabase (`booking_requests`). |
| Prijs op de lodgepagina | `src/components/LodgePagina.tsx` (r. ~305) | Vaste tekst "Vanaf € `PRICE_FROM_EUR`" uit `src/lib/site.ts`. |
| Prijs elders | `src/lib/pricing.ts`, `/api/pricing` | Eigen tarieven uit Supabase (`pricing_periods`, `fee_templates`). |
| Kalender op de homepage | `src/components/BookingCalendar.tsx` | `/api/ical` + `/api/pricing`, eigen boeking via Mollie. |
| Datumregels | `src/lib/stay-dates.ts` | Minimaal 2 nachten (`MIN_NIGHTS`), aankomst op maandag of vrijdag (`isAankomstdag`). |
| Versturen | `/api/reservering` | Maakt een aanvraag in Supabase; offerte/Mollie-flow daarna. |

## Scope

1. **Servermodule `src/lib/mytourist.ts`**
   - Leest `MYTOURIST_API_TOKEN` (alleen server-side, nooit `NEXT_PUBLIC_`, nooit loggen).
   - Koppeling lodge → MyTourist-roomtype: `lodge_1` (De Heide) en `lodge_2` (De Eik).
     Via env-vars `MYTOURIST_ROOMTYPE_LODGE_1/2` of als constante, afhankelijk van vraag 2.
   - Functie `mytouristAanbod({ checkIn, checkOut, personen? })` die voor beide
     lodges teruggeeft: `vrij: boolean`, `totaal: number | null` (EUR),
     `nachten: number`. Plus `ok: boolean` voor de hele bevraging.
   - Timeout ca. 5 s. Bij een fout, timeout of ontbrekend token: `ok: false`,
     nooit "vrij" gokken. Dezelfde houding als `fetchIcalPeriods`.

2. **Nieuwe route `src/app/api/aanbod/route.ts`** (`runtime = "nodejs"`)
   - `GET ?checkIn&checkOut[&personen]`, gevalideerd met `checkStayDates`.
   - Antwoord: `{ lodges: { lodge_1: { vrij, totaal, bookingUrl }, lodge_2: {…} }, bron: "mytourist", volledig }`.
   - **Vrij = vrij in MyTourist én geen conflict in `confirmedPeriods()`**, zolang
     de eigen flow nog aanvragen bevestigt die niet in MyTourist staan (zie vraag 5).
   - Cache: `s-maxage=60, stale-while-revalidate=300` als `volledig`, anders `no-store`.
   - Bij een fout: status 503. Het formulier valt dan terug op het huidige gedrag.
   - `/api/beschikbaarheid`, `/api/ical` en `/api/pricing` blijven **ongewijzigd**.

3. **Blok onder de datumkeuze in `RequestForm.tsx` en `RequestFormDE.tsx`**
   - Zodra de datums geldig zijn, `/api/aanbod` bevragen (dezelfde afbreeklogica
     als de bestaande `useEffect`).
   - Gekozen lodge vrij: toon "Vrij · € {totaal} voor {n} nachten" en een
     primaire knop **"Direct boeken"** / **"Direkt buchen"**. Dat is een gewone
     `<a href={bookingUrl}>`, geen `<form>`: de CSP heeft `form-action 'self'`.
   - Het bestaande aanvraagformulier blijft eronder staan als secundaire route
     ("Liever eerst een vraag stellen? Stuur een aanvraag").
   - Gekozen lodge bezet en de andere vrij: dezelfde suggestie als nu, met de prijs
     van de andere lodge erbij.
   - Faalt `/api/aanbod` of is `volledig` false: het formulier gedraagt zich
     precies zoals nu (`/api/beschikbaarheid`, geen prijs, geen knop).

4. **Aan/uit-schakelaar** `NEXT_PUBLIC_MYTOURIST_AANBOD=1`. Staat hij uit, dan
   verandert er voor de bezoeker niets. Zo kan het in de Preview getest worden
   voordat het op productie aangaat.

5. **Documentatie**: de nieuwe env-vars in `.env.local.example`, met uitleg en
   zonder waarden.

## Buiten de scope

- Mollie, offertes, `/api/reservering`, iCal-koppeling of Supabase-tabellen
  verwijderen of aanpassen (dat is stap 3).
- `BookingCalendar.tsx` op de homepage en `/api/pricing`.
- De "Vanaf € …"-tekst op de lodgepagina (`PRICE_FROM_EUR`).
- De MyTourist-widget in de pagina laden, en daarmee ook elke CSP-wijziging in `next.config.ts`.
- Concierge, Nuki en `/api/stay` (stap 4).
- Nieuwe dependencies. Gebruik `fetch`.
- Env-vars in Vercel zetten: dat doet Arjan.

## Acceptance criteria (ja/nee)

1. Met de schakelaar uit is de site aantoonbaar gelijk aan `main`: dezelfde
   requests en dezelfde weergave van het formulier.
2. Met de schakelaar aan en geldige datums toont het formulier voor een vrije
   lodge het totaalbedrag uit MyTourist en een knop "Direct boeken".
3. De knop opent de Booking Engine met de juiste lodge en datums al ingevuld,
   of zonder datums als MyTourist geen deeplink ondersteunt (zie vraag 3).
4. Nachten die in MyTourist bezet zijn, of als bevestigd in Supabase staan,
   worden nooit als vrij getoond.
5. Zonder token, bij een MyTourist-fout of een timeout valt het formulier terug
   op het huidige gedrag, zonder foutmelding voor de bezoeker.
6. Het token staat niet in de clientbundel. Te controleren met
   `grep -r MYTOURIST .next/static` (geen treffer op de tokenwaarde).
7. NL en DE werken allebei.
8. `npx tsc --noEmit` en `npm run build` zijn groen.

## Verificatie

- `npx tsc --noEmit`, `npm run build`, `npm run lint`. Er is geen testsuite.
- Op de Vercel Preview, met het token alleen in de **Preview**-omgeving:
  drie scenario's (vrij, bezet, andere lodge vrij), plus één scenario met een
  ongeldig token (terugval).
- Het getoonde totaal vergelijken met wat de Booking Engine voor dezelfde datums laat zien.

## Open vragen voor Arjan (eerst beantwoorden, dan READY)

1. **API-documentatie.** Die staat achter de login in MyTourist, en
   mytourist.cloud is vanuit de ontwikkelomgeving niet bereikbaar. Nodig: de
   base-URL, de manier van authenticeren (welke header), en de endpoints voor
   *Availability* en *Prices* met een voorbeeldantwoord. Plak dit in de taak of
   voeg een export toe.
2. **Roomtype-ID's** van De Heide en De Eik in MyTourist.
3. **Booking Engine-URL.** Wat is de URL, en kun je er datums, roomtype en
   personen als parameters aan meegeven?
4. **Is de MyTourist-prijs het eindbedrag?** Zitten schoonmaak,
   toeristenbelasting en huisdiertoeslag erin? Zo nee: tonen we "vanaf" of
   rekenen we de toeslagen er zelf bij met `fee_templates`?
5. **Staan bevestigde eigen aanvragen ook in MyTourist?** Zo ja, dan kan
   `confirmedPeriods()` uit de check. Zo nee, dan blijft hij erin, zoals
   hierboven beschreven.
6. **Datumregels.** Hanteert MyTourist dezelfde regels (aankomst ma/vr,
   minimaal 2 nachten)? Zo nee, dan bepalen we welke leidend is.
7. **Tracking.** Moet een klik op "Direct boeken" een eigen event krijgen,
   naar het voorbeeld van `BookingComRedirect` in `TrackingListeners.tsx`?
   Dat vraagt ook een conversie-inrichting in GA4 en Google Ads.

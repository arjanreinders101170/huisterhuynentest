# GA4 + Search Console aanzetten — bouwrecept

Stap-voor-stap recept om de meting live te krijgen. Dit is de voorwaarde voor
het Looker Studio-dashboard (Fase 6 uit `seo-cro-uitvoeringsplan.md`): Looker
verzamelt zelf niets, het toont alleen wat GA4 en Search Console al hebben.

Voor de Meta Pixel/CAPI-kant: zie `META_TRACKING.md`. Dezelfde stack, andere
bestemming — beide lopen door dezelfde `pushEvent()` in de code.

**Tijdsinschatting:** blok A ~10 min · blok B ~30 min · blok C ~20 min.

---

## Wat de code al doet (niets aan te passen)

| Onderdeel | Waar | Status |
|---|---|---|
| GA4-events versturen | `src/lib/tracking/ga4.ts` | Klaar — laadt `gtag.js` zelf, geen GTM-tag nodig |
| Event-mapping naar GA4-namen | `GA4_EVENT_MAP` in `ga4.ts` | Klaar |
| Consent Mode v2 default-deny | `src/lib/tracking/consent.ts` | Klaar |
| CSP-uitzonderingen voor GA4 | `next.config.ts` | Toegevoegd in PR #178 |
| Google Ads-basistag (`AW-18397549973`) | `src/components/tracking/GoogleAds.tsx` | Klaar — laadt `gtag.js`, consent-gated via Consent Mode v2 |
| Google Ads-conversies | `src/lib/tracking/googleAds.ts` | Code klaar — vuurt zodra er een conversielabel in `NEXT_PUBLIC_GOOGLE_ADS_LABEL_*` staat |
| Sitemap | `src/app/sitemap.ts` → `/sitemap.xml` | Klaar, inclusief hreflang nl/de |
| `robots.txt` | `public/robots.txt` | Klaar, verwijst naar de sitemap |

De enige schakelaar is de environment variable `NEXT_PUBLIC_GA4_ID`. Zonder
waarde is de hele GA4-laag een stille no-op.

---

## Blok A — Search Console (doe dit eerst)

Search Console verzamelt **pas vanaf het moment van verificatie** en kent geen
terugwerkende kracht. Elke week uitstel is een week zoekdata die je nooit meer
krijgt — daarom staat dit blok vóór GA4, ook al is het kleiner.

1. **Domain-property aanmaken.** [search.google.com/search-console](https://search.google.com/search-console)
   → Property toevoegen → **Domein** (niet "URL-voorvoegsel"). Vul in:
   `huisterhuynen.nl`.
   Een domain-property dekt `www` + non-`www` + http + https in één property.
   Dat lost meteen de www/non-www-ambiguïteit in de rapportage op.

2. **Verifiëren via DNS.** Google geeft een TXT-record
   (`google-site-verification=…`). Zet die bij je DNS-provider op het
   hoofddomein (`@`), TTL standaard. Verificatie lukt meestal binnen enkele
   minuten, soms duurt propagatie een uur.
   *Geen code nodig — de HTML-tag-methode kan niet bij een domain-property.*

3. **Sitemap indienen.** Sitemaps → nieuwe sitemap toevoegen:
   `https://www.huisterhuynen.nl/sitemap.xml`
   De sitemap is dynamisch: nieuwe landingspagina's en gepubliceerde blogs
   verschijnen er automatisch in, dus dit is eenmalig.

4. **Controleren:** URL-inspectie op `https://www.huisterhuynen.nl/heide-drenthe`.
   Verwacht "URL staat op Google" of "URL is niet op Google — indexering
   aangevraagd". Bruikbare zoekdata (queries, posities) verschijnt na 2–3 dagen.

> `robots.txt` blokkeert `/api/`, `/admin`, `/betaald`, `/bevestig`, `/offerte`
> en `/concierge`. Dat is bedoeld — negeer de "geblokkeerd door robots.txt"
> meldingen voor die paden in de dekkingsrapportage.

---

## Blok B — GA4 aanzetten

### B1. Property en datastream

1. [analytics.google.com](https://analytics.google.com) → Beheer → Property
   maken. Naam: `Huis ter Huynen`. Tijdzone **Nederland**, valuta **EUR**.
   *De valuta moet kloppen vóór de eerste `purchase`, anders rekent GA4 later
   met de verkeerde koers.*
2. Datastream → **Web** → `https://www.huisterhuynen.nl`, stream-naam
   `Website`. Laat **Enhanced Measurement aan** — de code stuurt bewust géén
   eigen `page_view`, die komt van Enhanced Measurement (ook bij SPA-navigatie
   via history-events).
3. Noteer de **Measurement ID** (`G-XXXXXXXXXX`).

### B2. Kiezen: direct óf via GTM (niet allebei)

Controleer in Vercel of `NEXT_PUBLIC_GTM_ID` gevuld is.

| Situatie | Doen |
|---|---|
| Geen GTM-container in gebruik | **Directe route** (aanbevolen): vul `NEXT_PUBLIC_GA4_ID` |
| GTM in gebruik, mét GA4-configuratietag | Laat `NEXT_PUBLIC_GA4_ID` **leeg** |
| GTM in gebruik, zónder GA4-tag | Directe route is prima; voeg dan geen GA4-tag toe in GTM |

Allebei tegelijk telt elke `page_view` dubbel. `src/lib/tracking/ga4.ts`
waarschuwt hier ook voor in de header-comment.

### B3. Environment variable zetten

Vercel → Settings → Environment Variables:

| Variabele | Waarde | Environments |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | `G-XXXXXXXXXX` | **Alleen Production** |

Alleen Production, zodat preview-deploys en lokaal werk je cijfers niet
vervuilen. Wil je op een preview testen, zet hem daar tijdelijk bij en haal
hem daarna weg.

> **Let op:** `NEXT_PUBLIC_*` variabelen worden tijdens de **build** in de
> bundle gebakken. De variabele opslaan doet niets tot je opnieuw deployt —
> Deployments → laatste deployment → Redeploy, **zonder build cache**.

### B4. Property-instellingen die je nu moet zetten

Deze werken **niet** met terugwerkende kracht, dus doe ze vóór de eerste
bezoekers, niet als het dashboard er al staat.

1. **Bewaartermijn.** Beheer → Databewaring → **14 maanden** (standaard is 2).
   Bepaalt hoe ver je in Verkennen/Looker kunt terugkijken.
2. **Ongewenste verwijzingen.** Datastream → Tag-instellingen configureren →
   Lijst met ongewenste verwijzingen → voeg toe: `mollie.com`.
   **Belangrijk:** de betaalflow stuurt de gast naar Mollie en daarna terug
   naar `/betaald`. Zonder deze regel schrijft GA4 elke betaalde boeking toe
   aan "referral / mollie.com" in plaats van aan de bron die de gast bracht —
   precies het cijfer waar het dashboard om draait.
3. **Intern verkeer.** Datastream → Tag-instellingen → Intern verkeer
   definiëren → jouw vaste IP. Daarna Databewerkingsfilters → filter
   `Internal Traffic` van "testen" naar **Actief** zetten.
4. **Sleutelgebeurtenissen markeren.** Beheer → Sleutelgebeurtenissen. Deze
   vier (verschijnen pas in de lijst nadat het event één keer is binnengekomen —
   zie blok C):

   | Event | Betekenis |
   |---|---|
   | `generate_lead` | Aanvraagformulier verstuurd (NL + DE) |
   | `begin_checkout` | Boeking gestart in de kalender |
   | `newsletter_subscribe` | Nieuwsbriefinschrijving |
   | `purchase` | Betaling afgerond |

   Markeer `outbound_ota` **niet** als sleutelgebeurtenis — dat is een klik weg
   naar Booking.com, een signaal dat je juist omlaag wilt hebben.
5. **Search Console koppelen.** Beheer → Productkoppelingen → Search
   Console-koppelingen → koppel de zojuist geverifieerde domain-property.
   Zonder deze koppeling blijven de GSC-rapporten in GA4 leeg.

---

## Blok C — Controleren dat er echt data binnenkomt

De cookiebanner staat op default-deny (`analytics_storage: denied`). **Zonder
"statistieken" te accepteren zie je niets** — dat is geen storing.

1. Open de site in een incognitovenster en **accepteer statistieken** in de
   banner.
2. DevTools → Network → filter op `collect`. Verwacht verzoeken naar
   `region1.google-analytics.com/g/collect` met status **204**.
   Zie je in plaats daarvan een CSP-fout in de console (*"Refused to
   connect…"*), dan draait er nog een oude deploy zonder de CSP-aanpassing
   uit PR #178.
3. GA4 → Rapporten → **Realtime**. Je eigen bezoek verschijnt binnen ~30
   seconden. (DebugView vereist de Chrome-extensie *Google Analytics
   Debugger*; de code zet zelf geen `debug_mode`.)
4. Loop deze acties af en vink af in Realtime → Gebeurtenissen:

   | Actie op de site | Canoniek event | GA4-event |
   |---|---|---|
   | Pagina openen | `PageView` | `page_view` (via Enhanced Measurement) |
   | Lodge-detail bekijken | `ViewContent` | `view_item` |
   | Lodge kiezen | `LodgeView` | `select_item` |
   | Datums checken in de kalender | `AvailabilityCheck` | `availability_check` |
   | Boeking starten | `InitiateCheckout` | `begin_checkout` |
   | Aanvraagformulier versturen | `Lead` | `generate_lead` |
   | Nieuwsbrief-inschrijving | `Subscribe` | `newsletter_subscribe` |
   | Mail-/telefoon-/WhatsApp-klik | `Contact` | `contact` |
   | Klik naar Booking.com | `BookingComRedirect` | `outbound_ota` |
   | Betaling afgerond (`/betaald`) | `Purchase` | `purchase` |

   De mapping staat in `GA4_EVENT_MAP` (`src/lib/tracking/ga4.ts`); de
   afvuurmomenten in `BookingCalendar.tsx`, `RequestForm(DE).tsx`,
   `NewsletterForm.tsx`, `TrackingListeners.tsx` en `app/betaald/page.tsx`.
5. Ga terug naar blok B4.4 en markeer de vier sleutelgebeurtenissen — nu staan
   ze in de lijst.

---

## Bekende aandachtspunten

- **GA4 en GSC tellen verschillend.** GA4 ziet alleen bezoekers die
  statistieken accepteren, GSC telt alle zoekverkeer. Een structureel gat
  tussen die twee is normaal en geen meetfout.
- **`page_location` op custom events** krijgt in `fireGa4Event()` het *pad*
  mee (`/heide-drenthe`), niet de volledige URL. Voor `page_view` klopt het
  wel — die vult gtag.js zelf. Alleen relevant als je in Looker op
  `page_location` van een custom event filtert; gebruik daar liever de
  standaard pagina-dimensies.
- **Google Ads staat sinds augustus 2026 live.** De basistag
  (`AW-18397549973`) zit in `src/components/tracking/GoogleAds.tsx` en de CSP
  in `next.config.ts` laat nu `*.doubleclick.net`, `googleadservices.com` en
  de Google-landdomeinen door. De conversiekant loopt sinds deze wijziging via
  `src/lib/tracking/googleAds.ts`: elk event uit `pushEvent()` wordt naar een
  conversielabel gekeken, en zonder label gebeurt er niets. Wat er dus nog
  moet: **de conversieacties aanmaken in Google Ads** (Doelen → Conversies →
  "tag zelf installeren"), het stuk ná de schuine streep uit `send_to`
  kopiëren en in Vercel zetten:

  | Env-variabele | Vuurt bij | Waarde |
  |---|---|---|
  | `NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD` | aanvraag verzonden (`Lead`) | verblijfsprijs |
  | `NEXT_PUBLIC_GOOGLE_ADS_LABEL_PURCHASE` | betaling afgerond (`Purchase`) | betaald bedrag |
  | `NEXT_PUBLIC_GOOGLE_ADS_LABEL_CHECKOUT` | formulier gestart (`InitiateCheckout`) | verblijfsprijs |
  | `NEXT_PUBLIC_GOOGLE_ADS_LABEL_CONTACT` | telefoon/WhatsApp/e-mail (`Contact`) | — |

  Zet alleen `Lead` (en later `Purchase`) op **primair**; `InitiateCheckout` en
  `Contact` horen op *secundair*, anders telt Google dezelfde aanvraag dubbel
  en gaat de biedstrategie op de verkeerde stap sturen. `transaction_id` gaat
  als `event_id` mee, dus een herlaadde bedanktpagina telt niet twee keer.
  Zolang er geen label staat meet Google Ads alleen pageviews en remarketing —
  en heeft een biedstrategie als *Conversiewaarde maximaliseren* niets om op
  te sturen.
- **Conversiedata blijft voorlopig leeg.** `purchase` en `begin_checkout`
  vullen zich pas als de boekingsstroom draait. Bouw het Looker-dashboard
  daarom eerst op verkeer + Search Console.

---

## Daarna: Looker Studio

Zodra blok A en B staan en blok C groen is, kan het dashboard uit **Fase 6**
van `seo-cro-uitvoeringsplan.md` gebouwd worden. Begin met twee pagina's
(verkeer + zoekwoorden) op de gratis GA4- en GSC-connectoren; de conversie- en
kostenpagina's pas als er boekingen doorheen lopen.

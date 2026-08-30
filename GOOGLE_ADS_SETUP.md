# Google Ads-conversies aanzetten — bouwrecept

Klik-voor-klik recept om Google Ads te laten zien wélke klik een aanvraag of
boeking opleverde. Zonder dit meet Ads alleen klikken en optimaliseert het
biedalgoritme blind — dan zeggen de cijfers onder *Zoekwoorden* niets over
rendement.

Voor GA4 en Search Console: zie `ANALYTICS_SETUP.md`. Voor Meta: `META_TRACKING.md`.

**Tijdsinschatting:** stap 1 t/m 4 ~15 min · stap 5 (Vercel) ~5 min · stap 6
(controle) ~10 min, plus wachttijd.

---

## Wat de code al doet (niets aan te passen)

| Onderdeel | Waar | Status |
|---|---|---|
| Google Ads-basistag (`AW-18397549973`) | `src/components/tracking/GoogleAds.tsx` | Klaar — remarketing loopt |
| Consent Mode v2 default-deny | `src/components/tracking/ConsentBootstrap.tsx` | Klaar |
| Conversie-aanroep (`gtag('event','conversion',…)`) | `src/lib/tracking/googleAds.ts` | Klaar — wacht alleen op een label |
| Koppeling aan de events | `pushEvent()` in `src/lib/tracking/dataLayer.ts` | Klaar |

De schakelaars zijn environment variables met een conversielabel. Zolang ze leeg
zijn, gebeurt er niets: de basistag blijft remarketing meten, er wordt alleen
geen conversie geteld.

| Variabele | Vuurt bij | Waar in de code |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | Aanvraagformulier verstuurd (`Lead`) | `src/components/RequestForm.tsx:99`, `RequestFormDE.tsx:69`, `BookingCalendar.tsx:460` |
| `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` | Betaling gelukt, gast landt op `/betaald` (`Purchase`) | `src/app/betaald/page.tsx:22` |
| `NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL` | Nieuwsbriefinschrijving (`Subscribe`) | `src/components/NewsletterForm.tsx:36` |
| `NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_LABEL` | Boeking gestart in de kalender (`InitiateCheckout`) | `src/components/BookingCalendar.tsx:411` |
| `NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL` | Klik op telefoon / WhatsApp / e-mail (`Contact`) | `src/components/tracking/TrackingListeners.tsx:26` |

> Begin met de eerste. De aanvraag is nu het hoofddoel; de rest kun je er later
> bij zetten zonder codewijziging. Zet in Google Ads alleen `Lead` (en later
> `Purchase`) op **primair**. `InitiateCheckout`, `Contact` en `Subscribe` horen
> op *secundair*: het zijn stappen náár dezelfde aanvraag toe, en als primaire
> conversie laten ze de biedstrategie op de verkeerde stap sturen.

### Waarde 0 gaat bewust niet mee

`RequestForm` en `RequestFormDE` vuren `Lead` met `value: 0` ("op aanvraag") —
alleen de kalender op de homepage kent de verblijfsprijs. Een conversie van € 0
vertelt *Conversiewaarde maximaliseren* dat die aanvraag niets waard is, dus
`googleAds.ts` laat het waardeveld dan weg en Google Ads gebruikt de
**standaardwaarde van de conversieactie**. Zet die in Ads (stap 2) op een
realistische gemiddelde boekingswaarde, anders telt zo'n aanvraag alsnog als nul.

### Verbeterde conversies (optioneel, `NEXT_PUBLIC_GOOGLE_ADS_ENHANCED=1`)

Staat deze variabele op `1`, dan stuurt de conversie het e-mailadres van de gast
mee als SHA-256-hash (`sha256_email_address`), gehasht in de browser met Web
Crypto. Dat koppelt aanvragen die anders wegvallen doordat Safari/iOS of een
adblocker het conversiecookie blokkeert. Het adres verlaat de browser nooit in
leesbare vorm, en gaat alleen mee bij toestemming voor marketing.

Zet hem pas aan als beide dingen geregeld zijn:

1. Google Ads → Doelen → Instellingen → **Verbeterde conversies** aan, methode
   *Google-tag*, voorwaarden geaccepteerd.
2. De privacytekst noemt het delen van een gehasht e-mailadres met Google — die
   alinea staat in `/privacy` (§4) en `/datenschutz` (§4.4).

Zonder `crypto.subtle` (geen secure context) vuurt de conversie gewoon zónder
e-mailadres: liever een conversie zonder match dan platte PII.

---

## Stap 1 — De wizard "Kies gegevensbronnen"

Google Ads → **Doelen → Conversies → Overzicht**. Is het account nieuw, dan
opent vanzelf het scherm *"Kies gegevensbronnen om conversies te meten"*.

1. **Conversies op een website** aangevinkt laten. Eronder hoort
   `www.huisterhuynen.nl` **via Google-tag** te staan — dat is onze basistag.
   Staat er niets, ga dan eerst naar stap 1b.
2. **Conversies via telefoongesprekken uitvinken.** De optie *"Gesprekken via
   websitebezoeken"* vervangt het telefoonnummer op de site door een
   doorschakelnummer van Google. Dat vraagt een extra snippet én het nummer
   staat op meerdere plekken hard in de code (`src/components/Begroeting.tsx:176`,
   `src/app/welkom/page.tsx:224`, `src/app/bevestig/page.tsx:178`, impressum en
   agb). Klikken op die `tel:`-links meten we al zelf
   (`src/components/tracking/TrackingListeners.tsx:31`). Later alsnog aanzetten
   kan altijd.
3. **Conversies in een app** en **Conversies offline** uit laten.
4. **Opslaan en doorgaan**.

**Stap 1b — ziet Google de tag niet?** Dan is de site nog niet bezocht sinds de
tag live ging, of de meting is geblokkeerd. Open zelf `www.huisterhuynen.nl` in
een normaal venster (geen incognito, geen adblocker), accepteer in de
cookiebanner **wél de marketingcategorie**, en ververs daarna het Ads-scherm.
De tag laadt pas cookies ná die toestemming — dat is Consent Mode v2, geen fout.

---

## Stap 2 — De conversieactie maken

Na *Opslaan en doorgaan* kom je op het scherm om een conversieactie toe te voegen.

1. Kies **Handmatig een conversieactie maken**.
   *Niet* "Google Analytics importeren" en *niet* de automatisch voorgestelde
   paginadoelen: die tellen een paginaweergave, en `/bevestig` kan ook zonder
   nieuwe aanvraag opnieuw geopend worden.
2. **Doelcategorie:** `Lead` → **Formulier ingediend**.
3. **Conversienaam:** `Aanvraag formulier` (vrije tekst, dit is alleen een label
   in de rapportage).
4. **Waarde:** kies *"Gebruik niet dezelfde waarde voor elke conversie"* → laat
   de standaardwaarde leeg, of vul een vaste indicatieve waarde in als je die
   wilt zien in de rapportage. De code stuurt bij een aanvraag `value: 0` mee
   (`src/components/RequestForm.tsx:102`), dus een eigen waarde hier is puur
   voor jouw overzicht.
5. **Telling:** **Eén** (één aanvraag per klik telt als één conversie; "Elke"
   hoort bij webshops met herhaalaankopen).
6. **Klikconversievenster:** 30 dagen is prima. Voor een vakantiehuis met een
   lange oriëntatie mag het langer (tot 90 dagen) — dat vangt gasten die eerst
   nog een week rondkijken.
7. **Primaire actie voor biedstrategieën:** aan laten staan.
8. **Maken en doorgaan**.

---

## Stap 3 — Het label ophalen

Nu bestaat het label pas. Je komt automatisch op *"Tag instellen"*; kom je er
later op terug, dan is het pad: **Doelen → Conversies → Overzicht** → klik de
conversieactie aan → tabblad **Tag instellen**.

1. Kies **De tag zelf installeren** (niet Google Tag Manager — wij laden gtag
   rechtstreeks).
2. Google toont twee blokken:
   - **Google-tag / globale sitetag** — negeren, die staat al in de code.
   - **Gebeurtenis-snippet** — daar gaat het om:

```js
gtag('event', 'conversion', {'send_to': 'AW-18397549973/AbC-D_efGhIjKl'});
                                         └─ ID ──────┘ └── label ────┘
```

3. Het stuk **ná de schuine streep** is de waarde die je nodig hebt. In het
   voorbeeld hierboven: `AbC-D_efGhIjKl` — die van jou is anders, meestal
   11–22 tekens met letters, cijfers en soms `-` of `_`.

> Het maakt niet uit of je alleen het label of de hele `send_to`-string
> overneemt: `normalizeLabel()` in `src/lib/tracking/googleAds.ts` knipt het
> label er zelf uit.

---

## Stap 4 — Consentinstellingen bevestigen

Google Ads vraagt (soms in dezelfde flow, soms als melding op het
conversieoverzicht) of je Consent Mode gebruikt.

- **Antwoord: ja, via de website-tag.** `ConsentBootstrap` zet
  `ad_storage`, `ad_user_data` en `ad_personalization` standaard op `denied` en
  stuurt na een klik in de cookiebanner een consent-update.
- **Verbeterde conversies** kun je aan laten staan; de code stuurt op dit moment
  geen gehashte e-mail mee naar Google (wel naar Meta via CAPI). Dat is een
  losse uitbreiding, geen blokkade.

---

## Stap 5 — De variabele in Vercel zetten

Vercel → project → **Settings → Environment Variables**:

| Variabele | Waarde | Environments |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | het label uit stap 3 | **Alleen Production** |

Voor elke volgende conversieactie herhaal je stap 2 en 3 en zet je het label in
de bijbehorende variabele uit de tabel bovenaan.

Alleen Production, zodat preview-deploys en lokaal testwerk je conversiecijfers
niet vervuilen.

> **Let op:** `NEXT_PUBLIC_*` wordt tijdens de **build** in de bundle gebakken.
> Opslaan doet niets tot je opnieuw deployt — Deployments → laatste deployment →
> **Redeploy, zonder build cache**.

---

## Stap 6 — Controleren dat het telt

1. Open na de redeploy de site, **accepteer marketingcookies**, en verstuur een
   testaanvraag.
2. **Direct te zien:** open de DevTools-console → tabblad Network → filter op
   `google` → er hoort een verzoek naar `googleads.g.doubleclick.net/pagead/…`
   of `google.com/pagead/…` te staan met jouw label in de parameters.
   Zie je niets, controleer dan eerst of je de cookiebanner echt op marketing
   hebt geaccepteerd.
3. **In Google Ads:** Doelen → Conversies. De kolom **Status** gaat van
   *"Geen recente conversies"* naar **"Actief"**. Reken op enkele uren
   vertraging — Ads rapporteert conversies niet in realtime.
4. **Blijft de status "Inactief"?** Dan is bijna altijd één van deze drie aan de
   hand: de redeploy zonder build cache is niet gedaan, de variabele staat niet
   op Production, of je testte met marketingcookies geweigerd.

---

## Bekende aandachtspunten

- **Dubbeltellen bij herladen.** De code stuurt een `transaction_id` mee
  (`src/lib/tracking/googleAds.ts`), dus een gast die `/betaald` ververst telt
  één keer. Verwijder die parameter niet.
- **Eigen bezoeken.** Je eigen aanvragen tellen ook mee. Doe je testaanvragen
  liever met één herkenbare naam, zodat je ze in de admin terugvindt.
- **GA4-conversies naast deze.** Je kunt dezelfde conversie óók vanuit GA4
  importeren. Doe dat niet: dan staat elke aanvraag er twee keer in. Kies deze
  directe route óf de GA4-import.
- **Het AW-ID staat als default in de code** (`AW-18397549973`). Wisselt het
  Ads-account, zet dan `NEXT_PUBLIC_GOOGLE_ADS_ID` in Vercel en vraag nieuwe
  labels aan — labels van het ene account werken niet in het andere.

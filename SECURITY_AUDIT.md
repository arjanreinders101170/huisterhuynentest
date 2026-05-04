# Security & Architecture Audit — Huis ter Huynen App

> **Audit datum:** 2026-05-04
> **Branch:** main (commit op moment van audit: `d99a3aa`)
> **Auditor:** automated review (senior security engineer / secure code reviewer / software architect persona)
> **Status:** advisory only — geen codewijzigingen aangebracht

---

## TL;DR — voor Arjan

Hé Arjan 👋 — eerst de goede dingen, dan de aandachtspunten. Het rapport eronder is grondig (21 bevindingen, ~500 regels) en is geschreven voor de volgende ontwikkelaar of AI-assistent die ermee aan de slag gaat. Deze samenvatting helpt jou als opdrachtgever beslissen waar de tijd van je ontwikkelaar in gaat zitten. Ik probeer technische termen tussen haakjes uit te leggen.

### Wat al goed staat
- **App-structuur is netjes**: het project is opgebouwd met Next.js (een populair framework om websites en apps in te bouwen) en TypeScript (JavaScript met extra controles op fouten). Bestanden zijn overzichtelijk verdeeld, geen één enorm onleesbaar bestand. Voor een solo-project van deze omvang is dit een prima basis.
- **Geen sleutels gelekt naar de browser**: alle API-keys (lange wachtwoord-achtige codes waarmee je app praat met externe diensten zoals OpenAI, Mollie, Nuki) staan correct alléén op de server, niet zichtbaar in de browser. Dit is een fout die ik héél vaak zie in dit soort projecten — bij jou klopt het.
- **Geen onveilige stukjes in de UI-code**: er staan geen patronen in de code waarmee een aanvaller via een tekstveld scripts in de browser van een andere gebruiker kan injecteren (technisch heet dat "XSS"). Dat is een fijne baseline.
- **E-mail templates zien er premium uit** en de gebruikersflow (terugkomen-aanvraag → offerte versturen → reservering bevestigen) is goed doordacht. Het stukje dat ontbreekt, is alleen het inloggedeelte eromheen.
- **Geen wachtwoorden in de code**: het bestand `.env.local.example` (een voorbeeldbestand voor instellingen) bevat geen echte waarden, en je `.gitignore` (lijst van bestanden die níét in de versiebeheer-geschiedenis horen) is redelijk op orde.
- Slimme demo-modi: chat, deur en betaling werken ook zonder echte sleutels — dat maakt ontwikkelen en demo's geven een stuk makkelijker.

### Wat het belangrijkst is om aan te pakken
Drie dingen die écht moeten gebeuren voordat dit live gaat met echte gasten:

1. **Inlog-systeem toevoegen ("auth-laag" — een laag in de app die controleert wie iemand is voordat 'ie iets mag doen)** — die is er nog niet. Concreet: de pagina `/offerte` (waar jij prijzen invult voor een gast die wil terugkomen) staat nu open op het internet, iedereen kan 'm bezoeken. Hetzelfde geldt voor de deur openen en reserveringen bevestigen. Zonder inlog kan letterlijk iedereen die de URL kent dingen doen die alleen jij of een echte gast zouden moeten kunnen. Dit is dé hoeksteen — als dit gefixt wordt, lossen 5+ andere bevindingen meteen mee op.

2. **Betaling goed afhandelen via Mollie** — nu vertelt de browser aan de server hoeveel iets kost. Dat moet andersom: de server bepaalt de prijs (gast kan dan niet "0,01" invullen) en Mollie laat via een terugmelding (een "webhook" — een berichtje van Mollie naar jouw server zodra een betaling lukt of mislukt) weten of er werkelijk betaald is. Op dit moment denkt de app dat een boeking succesvol is voordat de gast überhaupt heeft betaald. Dit is geen klein bugje, dit stuk van de betaal-afhandeling moet nog goed gebouwd worden.

3. **CORS dichttrekken** — CORS is een browser-regel die bepaalt welke andere websites jouw API mogen aanroepen. Nu staat in `vercel.json` ingesteld dat *iedere* website dat mag (`*` = alles). Eén regeltje verandering naar alleen je eigen domein heeft enorme impact: het verkleint de schade van zo'n beetje álle andere bevindingen.

Daarna komen de "vakmatige hygiëne"-dingen: limieten op hoe vaak iemand een API mag aanroepen ("rate-limiting"), tekst veilig in e-mails zetten ("HTML-escaping" — voorkomen dat klikbare links uit gastinput in mails komen), extra beveiligings-instellingen op je hosting, en wat verouderde dependencies updaten. Belangrijk, maar minder urgent dan die drie hierboven.

### Wat je niet hoeft te lezen (nu)
De meeste detail-bevindingen (F-11 t/m F-21) zijn afvinklijst-werk voor later. Begin niet daar. Begin bij de inlog-laag — dat is het fundament waar veel andere dingen aan vasthangen.

### Eén verzoek
Onderaan dit document staat een sectie **"Open vragen voor Arjan"** met 7 keuzes waar de architectuur (de fundamentele structuur van de app) op zit te wachten. Bijvoorbeeld: "hoe weet de app dat een bepaalde gast nu écht in de lodge zit en de deur mag openen?" — dat soort fundamentele keuzes. **Beantwoord die voordat er gebouwd wordt** — anders maakt de ontwikkelaar straks iets dat je later weer kan laten omgooien omdat je een andere richting in wilt.

Verder: leuk project, mooi gemaakt, en deze audit is geen "het is slecht" — het is "het is af voor een demo, nog niet voor productie, en hier is de lijst om dat verschil te dichten." 🌿

---

## Voor de volgende AI / engineer die dit oppakt

**Lees dit eerst.**

### Context
Dit is een **Next.js 15 App Router** project (geen Laravel/PHP — `valet link` werkt niet, gebruik `valet proxy huynen http://localhost:3000` als je via `huynen.test` wil). Tech stack: React 19, TypeScript 5.7, Supabase (DB), Resend (mail), Mollie (betaling), Nuki (smart lock), OpenAI (chat), Picnic (boodschappen). Hosting: Vercel.

### Belangrijk: dit is een app-in-ontwikkeling
**Niet alles in deze codebase is bedoeld om al echt te werken.** Volgens de huidige ontwikkelaar (Danny) zijn de volgende integraties **bewust als nep/demo** gebouwd en moeten ze nog verder ingevuld worden:

- **Nuki smart lock** (`/api/nuki/unlock`) — draait nu in demo-modus
- **Mollie betalingen** (`/api/checkout`) — UX-flow staat, échte payment-verificatie ontbreekt
- **OpenAI chat** (`/api/chat`) — fallback met hardcoded antwoorden bij ontbrekende key
- mogelijk meer — **vraag de ontwikkelaar (Danny) actief uit** voordat je iets als "echte feature" of "echte bug" behandelt; over scope/feature-keuzes (gaat Picnic blijven? wat moet Mollie kunnen?) beslist **Arjan** als opdrachtgever/lodge-eigenaar

Dit verandert de **prioriteit**, niet de **inhoud** van findings. Een ongeauthenticeerde Nuki-endpoint is in demo-modus geen acuut risico, maar **zodra echte Nuki-keys in productie gezet worden, is F-01 acuut Critical**. Behandel deze audit dus als een lijst van zaken die **vóór go-live opgelost moeten zijn**, niet als een lijst die op `main` vandaag al brandt.

### Hoe te gebruiken
1. Lees §1 (Executive summary) en §10 (Prioriteitenplan).
2. **Verifieer per finding bij Danny** of de betreffende feature al "echt" of nog "nep" is. Concreet: F-01 (Nuki), F-04 (Mollie), F-10 (Picnic), F-16 (deurcode/wifi) — daar wachten we op antwoord.
3. F-02, F-03, F-05, F-06, F-07, F-08, F-09 zijn **niet** demo-afhankelijk: die routes raken Supabase/Resend met echte credentials zodra de env-vars gezet zijn — die zijn dus al echt.
4. Voor scope-vragen (welke features blijven, hoe streng wordt auth, etc.): **vraag Arjan**. Voor implementatie-keuzes binnen de gekozen scope: bespreek met Danny.
5. Maak geen fix zonder de architectuur-richting eerst te checken — een halve fix is gevaarlijker dan geen fix.

### Wat is NIET geverifieerd
- De 4 `.zip` bestanden in repo-root (`bevestig-fix.zip`, `bevestig-flow.zip`, `email-templates.zip`, `lodge-control.zip`) — niet uitgepakt; mogelijk oude code/secrets.
- Supabase RLS-policies en schema (geen DB-toegang).
- Mollie dashboard config (mogelijk staat er een webhook-URL geconfigureerd buiten de code om).
- Vercel project-instellingen / WAF.
- Resend domain-verificatie (SPF/DKIM/DMARC).

---

## 1. Executive summary

- **Algemene risicobeoordeling:** 18/100 (zeer hoog risico bij een echte productie-deploy, **gegeven** dat alle integraties live gaan)
- **Productieklaarheid:** **NEE** — pas na fixes van Critical en High findings
- **Top 5 risico's:**
  1. **Onbeveiligde Nuki-deur API** (F-01) — `POST /api/nuki/unlock` heeft geen auth en CORS staat `*`. *Demo-modus nu, acuut Critical bij echte keys.*
  2. **Open e-mail-relay** (F-02) — `/offerte` (page) + `POST /api/offerte` zijn publiek; willekeurige aanvallers versturen vanaf `lodge@huisterhuynen.nl` HTML-mails met door hen bepaalde inhoud. *Echt actief zodra `RESEND_API_KEY` gezet is.*
  3. **Free-stay attack via aanvraag-keten** (F-03) — `GET /api/bevestig?id=X` lekt PII, `POST /api/offerte` overschrijft `offerte_bedrag`, `POST /api/bevestig` bevestigt. Eind-tot-eind zonder auth.
  4. **Mollie checkout zonder webhook & zonder server-side prijsvalidatie** (F-04) — `amount` komt uit de client, geen webhook, booking als success vóór betaling. *Demo-relevant: juist hier eerst echte flow ontwerpen.*
  5. **Supabase service-role key** in alle routes (F-05) — bypass't volledig RLS; combineer met geen-auth = volledige DB CRUD voor anonymous.
- **Grootste structurele valkuil:** ontbreken van een auth-laag. Geen middleware, geen sessies, geen onderscheid host vs gast vs anoniem. Het hele backend-oppervlak vertrouwt impliciet op "alleen mijn gasten kennen de URL".
- **Grootste directe security concern (zodra live):** de fysieke deur (F-01).

---

## 2. Scope en aannames

**Geanalyseerd**
- Alle bronbestanden in `src/`
- Configuratie: `next.config.ts`, `vercel.json`, `package.json`, `.env.local.example`, `.gitignore`, `tsconfig.json`
- `README.md`, dependencies via `npm audit`
- Live verificatie tegen lokale dev-server (`localhost:3000`)

**Niet-geanalyseerd (zie ook "Wat is NIET geverifieerd" hierboven)**
- Supabase project (RLS, schema, RPC `upsert_guest`)
- Vercel project-instellingen
- DNS/TLS van `app.huisterhuynen.nl`
- Inhoud `.zip` bestanden
- Mollie/Resend dashboards

**Aannames**
- Productiedeploy doel: `app.huisterhuynen.nl` op Vercel
- `SUPABASE_SERVICE_ROLE_KEY` wordt op productie gezet
- IDs in `terugkeer_aanvragen` zijn UUIDs (Supabase default)
- Bij echte deploy: Nuki/Mollie/OpenAI keys worden geactiveerd → demo-paden vervallen

---

## 3. Systeemoverzicht

**Stack**
- Next.js 15.5.15 (App Router, Turbopack), React 19, TypeScript 5.7
- Hosting: Vercel
- DB: Supabase (`@supabase/supabase-js` 2.105.1) — service-role key
- E-mail: Resend 6.12.2
- Betaling: Mollie (REST direct)
- AI: OpenAI `gpt-4o-mini`
- Smart lock: Nuki Web API
- Boodschappen: `picnic-api` 4.3.0 (**unofficial** wrapper)
- Weather: OpenWeatherMap

**Frontend/backend boundaries**
- Frontend: client components + 1 server component (`/welkom`)
- Backend: 9 route handlers onder `src/app/api/*` — allemaal `runtime = "nodejs"`
- **Geen `middleware.ts`** — geen auth-laag, geen rate-limit, geen request-validatie centraal

**Auth-flow** — geen. Profielselectie zit in `localStorage` (`hth-profile`).

**Dataflow**
1. Gast → `/api/terugkomen` → Supabase + 2× Resend
2. Host klikt link → `/offerte?id=...` → `POST /api/offerte` → Supabase update + Resend
3. Gast klikt → `/bevestig?id=...` → `GET /api/bevestig` (lees), `POST /api/bevestig` (status `geboekt`) + 2× Resend
4. Gast extra → `/api/checkout` → Mollie → `/betaald` (geen verificatie)
5. Chat → `/api/chat` → OpenAI of fallback
6. Deur → `/api/nuki/unlock` → Nuki of demo
7. Reviews → `/api/reviews` → Supabase

**Trust boundaries**
- Internet ↔ Vercel functions: enige boundary, ongedekt
- Functions ↔ Supabase: service-role key bypass't RLS
- `vercel.json` `Access-Control-Allow-Origin: *` op alle `/api/*`

---

## 4. Findings tabel

| ID | Severity | Score | Titel | Bestand(en) | Demo-afhankelijk? | Confidence |
|---|---|---|---|---|---|---|
| **F-01** | Critical | 20 | Unauth Nuki-deur API + lekkende fallback-code | `api/nuki/unlock/route.ts` | **Ja** (demo nu) | High |
| **F-02** | Critical | 19 | Open e-mail relay via `/api/offerte` | `api/offerte/route.ts`, `app/offerte/page.tsx` | Nee (Resend = echt) | High |
| **F-03** | Critical | 19 | IDOR + auth bypass: gratis verblijf via aanvraag-keten | `api/bevestig/route.ts`, `api/offerte/route.ts` | Nee | High |
| **F-04** | Critical | 18 | Mollie: client-side prijs, geen webhook, vroege success | `api/checkout/route.ts`, `app/betaald/page.tsx` | **Ja** (Mollie nog op te bouwen) | High |
| **F-05** | High | 16 | Supabase service-role key in alle routes (RLS bypass) | `lib/supabase.ts` | Nee | High |
| **F-06** | High | 15 | CORS `*` op alle `/api/*` | `vercel.json` | Nee | High |
| **F-07** | High | 14 | Geen rate limiting op enige API | alle `app/api/**/*.ts` | Nee | High |
| **F-08** | High | 13 | E-mail HTML/header injection in Resend-templates | 4× routes | Nee | High |
| **F-09** | High | 13 | `/api/booking` accepteert willekeurige `prijs`/`product` | `api/booking/route.ts` | Nee | High |
| **F-10** | High | 13 | Picnic gebruikt persoonlijke account credentials (unofficial API) | `api/picnic/route.ts` | **Mogelijk** (vraag Arjan) | High |
| **F-11** | Medium | 9 | PII in server logs | `api/booking/route.ts:260` + 4 andere | Nee | High |
| **F-12** | Medium | 9 | Ontbreken security headers (CSP, HSTS, X-Frame-Options) | `vercel.json`, `next.config.ts` | Nee | High |
| **F-13** | Medium | 8 | npm audit: 5 moderate (postcss XSS, uuid bounds) | `package-lock.json` | Nee | High |
| **F-14** | Medium | 8 | `/api/reviews` POST: ongemodereerd, geen rate-limit | `api/reviews/route.ts` | Nee | High |
| **F-15** | Medium | 8 | `/api/bevestig` race condition / niet-idempotent | `api/bevestig/route.ts` | Nee | Medium |
| **F-16** | Medium | 8 | Wifi-wachtwoord en deurcode hardcoded in client/email/SSR | `app/welkom/page.tsx`, `components/Verblijf.tsx` | **Ja** (demo) | High |
| **F-17** | Low | 5 | `.gitignore` dekt alleen `.env*.local`, niet plain `.env` | `.gitignore` | Nee | High |
| **F-18** | Low | 5 | Hardcoded `OWNER_EMAIL` op meerdere plekken | 3× routes | Nee | High |
| **F-19** | Low | 5 | `.zip` bundles in repo-root | repo-root | Nee | High |
| **F-20** | Low | 4 | Open-redirect potentieel `window.location = d.checkoutUrl` | `components/Reserveren.tsx:92` | Nee | Medium |
| **F-21** | Info | 0 | Geen tests, geen CI, geen lint-config zichtbaar | — | Nee | High |

**Score = severity-weight (Critical 10 / High 7 / Medium 4 / Low 2 / Info 0) + likelihood (1-5) + impact (1-5).**
**Confidence:** High = direct bewijs in code · Medium = sterke aanwijzing · Low = nader onderzoek nodig.

---

## 5. Gedetailleerde findings

### F-01 · Critical · Unauth Nuki-deur API + lekkende fallback-code
- **Severity:** Critical · **Score:** 20 · **Confidence:** High · **Demo-afhankelijk:** Ja
- **Bestand:** `src/app/api/nuki/unlock/route.ts`
- **Probleem:** De endpoint accepteert iedere ongeauthenticeerde POST en geeft een Nuki-unlock door. In het error-pad (line 39–45) wordt `fallbackCode: "4821"` in de response teruggegeven. CORS `*` (zie F-06).
- **Misbruik (lokaal bewezen):** `curl -X POST http://localhost:3000/api/nuki/unlock` → `{"success":true,"message":"Deur geopend (demo modus)"}`. **In productie met Nuki-keys gezet → fysieke deur opent.**
- **Impact:** Volledige fysieke compromise van de lodge.
- **Aanbeveling:**
  - Bind unlock aan een single-use, tijdsgebonden per-verblijf token.
  - Server-side: valideer token tegen `terugkeer_aanvragen` row met `status='geboekt'` en check-in/check-out window.
  - Verwijder `fallbackCode` uit responses.
  - CORS strikt naar `https://app.huisterhuynen.nl`.
  - Rate limit (3/min/IP, 30/dag/token).
- **Test:** unit-test `POST` zonder header → 401; verlopen token → 403.
- **Voor de volgende AI:** vraag Arjan: *"Hoe willen we dat een gast de deur opent — een unieke code per verblijf via WhatsApp/SMS, een knop in de app na inchecken, of iets anders?"* Bouw niet vooruit op een design dat niet bevestigd is.

### F-02 · Critical · Open e-mail relay via `/api/offerte`
- **Severity:** Critical · **Score:** 19 · **Confidence:** High · **Demo-afhankelijk:** Nee
- **Bestand:** `src/app/api/offerte/route.ts`, `src/app/offerte/page.tsx`
- **Probleem:** Iedereen kan een opgemaakte HTML-mail vanaf `lodge@huisterhuynen.nl` versturen met door hem bepaalde inhoud naar elk adres. `bericht` wordt rauw in HTML geïnjecteerd.
- **Misbruik:** `POST /api/offerte` met `gastEmail: "slachtoffer@…"`, `bericht: "<a href='https://phishing/'>klik</a>"`. Resend stuurt vanaf het geverifieerde lodge-domein → SPF/DKIM PASS → effectieve phishing.
- **Impact:** Reputatie- en deliverability-schade voor het hele lodge-domein. Resend account suspension. Schadeclaim van phishing-slachtoffers.
- **Aanbeveling:** Plaats `/offerte` page én `POST /api/offerte` achter een **host-only auth** (NextAuth e-mail magic link, of voorlopig HTTP basic via Vercel + Supabase RLS).
- **Minimale patch:** voeg `middleware.ts` toe die voor `/offerte` en `/api/offerte` een sessie-cookie eist gekoppeld aan `admins`-tabel.

### F-03 · Critical · IDOR + auth bypass: gratis verblijf
- **Severity:** Critical · **Score:** 19 · **Confidence:** High · **Demo-afhankelijk:** Nee
- **Bestand:** `src/app/api/bevestig/route.ts` (GET+POST), `src/app/api/offerte/route.ts:155-164`
- **Probleem:** Drie state-modificerende routes voor reservering zijn allemaal ongauthenticeerd:
  - `GET /api/bevestig?id=X` lekt `van/tot/personen/status/offerte_bedrag/gastNaam/gastEmail`
  - `POST /api/offerte` overschrijft `offerte_bedrag` van elke `aanvraagId`
  - `POST /api/bevestig` zet status op `geboekt` en stuurt mails
- **Misbruik:**
  1. Aanvaller doet eigen aanvraag → krijgt eigen UUID.
  2. `POST /api/offerte` met `aanvraagId=<eigen ID>`, `prijsVerblijf=0.01` → DB update naar €0,01.
  3. `POST /api/bevestig {id}` → status `geboekt`, host krijgt mail.
  4. Variant: aanvaller heeft via mail-leak/Referer een vreemd UUID → zelfde aanval op andermans aanvraag.
- **Impact:** Financiële fraude, PII-exfiltratie, DB-corruptie.
- **Aanbeveling:**
  - Host-login achter `/offerte` + `POST /api/offerte` (zie F-02).
  - Voeg per-aanvraag single-use HMAC `confirm_token` toe aan de bevestig-link.
  - `GET /api/bevestig` ook tokenized.
- **Patch-richting:**
  ```ts
  const confirmToken = crypto.randomBytes(32).toString("hex");
  // sla op in DB, voeg toe aan link: /bevestig?id=...&t=<token>
  ```

### F-04 · Critical · Mollie checkout zonder webhook of prijsvalidatie
- **Severity:** Critical · **Score:** 18 · **Confidence:** High · **Demo-afhankelijk:** Ja
- **Bestand:** `src/app/api/checkout/route.ts`, `src/app/betaald/page.tsx`
- **Probleem:**
  1. `amount` komt rauw uit body — geen server-side product/prijs lookup.
  2. **Geen `webhookUrl`** in de Mollie-payload, **geen** `/api/mollie/webhook` route.
  3. `/api/booking` wordt **vóór de redirect** aangeroepen → boeking is "success" ongeacht betaling.
  4. `/betaald` toont "ontvangen" obv URL-param, geen verificatie.
- **Misbruik:** `POST /api/checkout {amount: "0.01", product: "Welkomstpakket Drenthe"}` → €0,01 link, niet eens betalen — booking is al geregistreerd.
- **Aanbeveling (Mollie-native flow):**
  - Server-side product catalog (hardcoded prijzen). Verwerp client `amount`. Gebruik `productId`.
  - Configureer `webhookUrl: "${appUrl}/api/mollie/webhook"`.
  - Verplaats `/api/booking` aanroep **naar de webhook**, idempotent op `paymentId`.
  - Op `/betaald`: server-side fetch Mollie payment status met `id` query-param, verifieer `paid`.
- **Voor de volgende AI:** dit is een feature die nog moet worden uitgebouwd — vraag Arjan welke producten écht via Mollie afgerekend gaan worden, en welke "op aanvraag" blijven (nu lijkt alles op aanvraag te kunnen, terwijl de checkout-pagina suggereert dat er direct betaald wordt).

### F-05 · High · Supabase service-role key bypass't RLS in alle routes
- **Severity:** High · **Score:** 16 · **Confidence:** High
- **Bestand:** `src/lib/supabase.ts:1-13` + alle route handlers
- **Probleem:** `createClient(url, SUPABASE_SERVICE_ROLE_KEY)` slaat alle RLS-policies over. Combineer met F-02/F-03 (geen auth) → volledige DB CRUD voor anonymous.
- **Aanbeveling:**
  - Splits `getServiceSupabase()` (admin, achter auth) en `getSupabase(req)` (user-scoped, anon-key + RLS).
  - Per route die service-role nodig heeft: guard met `requireHostSession()`.
- **Test:** review elke `getSupabase()` call; documenteer "waarom service-role hier nodig is".

### F-06 · High · CORS `*` op alle `/api/*`
- **Severity:** High · **Score:** 15 · **Confidence:** High
- **Bestand:** `vercel.json:4-14`, ook in `api/chat/route.ts:11`
- **Probleem:** Iedere website kan `fetch('https://app.huisterhuynen.nl/api/...')` doen vanuit een slachtoffer's browser zonder CORS-blok.
- **Misbruik:** evil-page met `fetch('/api/nuki/unlock', {method:'POST'})` → unlock vanuit slachtoffer-browser. Vergroot blast radius van alle andere findings.
- **Patch:**
  ```json
  { "key": "Access-Control-Allow-Origin", "value": "https://app.huisterhuynen.nl" }
  ```

### F-07 · High · Geen rate limiting / abuse protection
- **Severity:** High · **Score:** 14 · **Confidence:** High
- **Bestand:** alle `src/app/api/**/*.ts`
- **Probleem:** Geen rate-limit, captcha, of abuse-detectie:
  - `/api/chat` → OpenAI cost abuse (€300/dag bij 1M req voor `gpt-4o-mini`)
  - booking/terugkomen/offerte/bevestig → Resend quota op
  - `/api/reviews` → review spam
  - `/api/nuki/unlock` → DoS / lockout
  - `/api/picnic` add-to-cart → vult cart oneindig
- **Aanbeveling:** Vercel Edge Middleware met `@upstash/ratelimit`, of Vercel WAF rules. Per route: chat 20/min/IP, booking 5/uur/IP+email, nuki 3/min/token.

### F-08 · High · E-mail HTML/header injection
- **Severity:** High · **Score:** 13 · **Confidence:** High
- **Bestand:** `api/booking/route.ts:63-189`, `api/bevestig/route.ts:140-189`, `api/offerte/route.ts:44-134`, `api/terugkomen/route.ts:50-107`
- **Probleem:** Alle e-mail-templates interpoleren user-input rauw in HTML zonder escapen (`gastNaam`, `gastEmail`, `product`, `bericht`, `prijs`, `datum`). Subject lines bevatten user-input zonder newline-strip.
- **Misbruik:** `gastNaam = "<a href='https://evil/'>Klik hier</a>"` → eigenaar krijgt phishing-link in eigen inbox vanaf eigen domein.
- **Patch:**
  ```ts
  const esc = (s: string) =>
    String(s).replace(/[&<>"']/g, c =>
      ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
  // overal: ${esc(gastNaam)}
  ```

### F-09 · High · `/api/booking` accepteert willekeurige `prijs`/`product`
- **Severity:** High · **Score:** 13 · **Confidence:** High
- **Bestand:** `src/app/api/booking/route.ts:192-229`
- **Probleem:** Geen schema-validatie. `product` is willekeurige string in DB+mails. `prijs` niet tegen catalog gevalideerd. `metadata` ge-spread → mass-assignment risico.
- **Patch:** zod-schema:
  ```ts
  const Schema = z.object({
    product: z.enum(["Welkomstpakket", "Boodschappenpakket", "Fietsverhuur", "Late checkout"]),
    prijs: z.string().regex(/^€?\s?\d+([.,]\d{1,2})?$/).optional(),
    gastNaam: z.string().min(1).max(100),
    gastEmail: z.string().email(),
    metadata: z.object({...}).strict().optional(),
  });
  ```

### F-10 · High · Picnic met persoonlijk account in env (unofficial wrapper)
- **Severity:** High · **Score:** 13 · **Confidence:** High
- **Bestand:** `src/app/api/picnic/route.ts:48-76`
- **Probleem:** `PICNIC_EMAIL` + `PICNIC_PASSWORD` zijn de plain-text credentials van een persoonlijk Picnic-account. Picnic levert geen API; de wrapper reverse-engineert de mobiele-app-API. Risico's: (1) account suspension door Picnic, (2) plaintext password in cloud env, (3) eindgebruikers kunnen via `add-to-cart` action in het account van de eigenaar items toevoegen, (4) module-scoped sessie cache onbetrouwbaar in serverless.
- **Aanbeveling:** Verwijder feature totdat Picnic een officiële API levert; of host-only achter auth.
- **Voor de volgende AI:** vraag Arjan of de Picnic-integratie nog gewenst is. Zo ja: of het Arjan z'n persoonlijke Picnic-account is, en of hij comfortabel is met dat dat account in een serverless app draait.

### F-11 · Medium · PII in server logs
- **Severity:** Medium · **Score:** 9 · **Confidence:** High
- **Bestand:** `api/booking/route.ts:260` (`console.log("[BOOKING] ${product} | ${gastNaam} | ${gastEmail} | ${bookingPrijs}")`) en error-logs in `api/bevestig`, `api/terugkomen`, `api/offerte`
- **Impact:** AVG/GDPR — PII in Vercel logs zonder rechtsgrond/retention.
- **Aanbeveling:** log alleen IDs of hashed e-mail. Centrale logger met PII-redactie.

### F-12 · Medium · Ontbreken security headers
- **Severity:** Medium · **Score:** 9 · **Confidence:** High
- **Bestand:** `vercel.json`, `next.config.ts`
- **Ontbreekt:** CSP, HSTS, X-Frame-Options/`frame-ancestors`, Referrer-Policy, Permissions-Policy. `nosniff` zit alleen op `/api/*`.
- **Patch:** voeg headers toe in `next.config.ts` of `vercel.json` op alle paths. CSP minimaal:
  ```
  default-src 'self';
  img-src 'self' https://api.qrserver.com data:;
  font-src https://fonts.gstatic.com;
  frame-ancestors 'none';
  ```
  HSTS `max-age=63072000; includeSubDomains; preload`. `Referrer-Policy: strict-origin-when-cross-origin`.

### F-13 · Medium · npm audit (5 moderate)
- **Severity:** Medium · **Score:** 8 · **Confidence:** High
- **CVEs:** `postcss <8.5.10` GHSA-qx2v-qp2m-jg93 (XSS in CSS-stringify, transitive via `next`), `uuid <14.0.0` GHSA-w5hq-g745-h8pq (transitive via `svix`/`resend`).
- **Patch:** **NIET** `npm audit fix --force` (wil naar `next@9.3.3` downgraden). Wacht op upstream patches in `next` 15.5.x en `resend` 6.x.x.

### F-14 · Medium · `/api/reviews` POST volledig open
- **Severity:** Medium · **Score:** 8 · **Confidence:** High
- **Bestand:** `src/app/api/reviews/route.ts:35-78`
- **Probleem:** Iedereen kan reviews posten zonder verificatie. `naam` willekeurig (impersonation), geen captcha. `zichtbaar` wordt niet expliciet false gezet — afhankelijk van DB-default verschijnt review direct.
- **Aanbeveling:** rate-limit + captcha (Turnstile/Hcaptcha) + admin-moderatie (`zichtbaar` default false) + e-mail koppelen aan echte boeking.

### F-15 · Medium · `/api/bevestig` race condition
- **Severity:** Medium · **Score:** 8 · **Confidence:** Medium
- **Bestand:** `src/app/api/bevestig/route.ts:85-109`
- **Probleem:** SELECT → check → UPDATE niet atomair. Parallelle POSTs kunnen beide door de check raken → dubbele mails.
- **Patch:** atomair `UPDATE ... WHERE status != 'geboekt'` + check `affectedRows`.

### F-16 · Medium · Wifi-wachtwoord en deurcode hardcoded
- **Severity:** Medium · **Score:** 8 · **Confidence:** High · **Demo-afhankelijk:** Ja
- **Bestand:** `src/app/welkom/page.tsx:91,151`, `src/components/Verblijf.tsx:119,128,169,181,184`
- **Probleem:** "4821" en "HuynenGast2024" staan in publieke client + in API-error-response. Permanente toegang voor iedereen die ooit de pagina laadt.
- **Aanbeveling (zodra echt):** unieke pincode + wifi-passphrase per verblijf, vervang bij check-out.
- **Voor de volgende AI:** vraag Arjan: *"Wordt de PIN per verblijf geroteerd of is dit een vaste backup-code? En de Wi-Fi: hebben we een aparte gasten-Wi-Fi waar we het wachtwoord van kunnen wijzigen?"*

### F-17 · Low · `.gitignore` dekt alleen `.env*.local`
- **Bestand:** `.gitignore`
- **Probleem:** `.env*.local` matcht niet platte `.env` of `.env.production`.
- **Patch:** voeg toe: `.env`, `.env.*`, `!.env.local.example`, `!.env.example`.

### F-18 · Low · Hardcoded `OWNER_EMAIL`
- **Bestand:** `api/booking/route.ts:6`, `api/bevestig/route.ts:6`, `api/terugkomen/route.ts:6`
- **Patch:** `process.env.OWNER_EMAIL`.

### F-19 · Low · `.zip` bundles in repo-root
- **Bestand:** `bevestig-fix.zip`, `bevestig-flow.zip`, `email-templates.zip`, `lodge-control.zip`
- **Verifieer manueel:** unzip, scan op secrets. Verwijder uit history (`git filter-repo`).
- **Patch:** voeg `*.zip` toe aan `.gitignore`.

### F-20 · Low · Open-redirect potentieel
- **Bestand:** `src/components/Reserveren.tsx:92`
- **Probleem:** `window.location.href = d.checkoutUrl` — value komt nu uit Mollie-response (vertrouwd), maar geen URL-validatie als guardrail.
- **Patch:** valideer dat URL begint met `https://www.mollie.com/`.

### F-21 · Info · Geen tests, geen CI, geen lint-config zichtbaar
- Geen `*.test.ts`, geen `.github/workflows`, geen ESLint/TS strict-config commit. Voor productie: geen regressie-vangnet.

---

## 6. Secrets & env exposure matrix

| Variabele | Locatie | Server-only? | Risico | Actie |
|---|---|---|---|---|
| `OPENAI_API_KEY` | `api/chat/route.ts:38` | ✅ Server | Cost abuse (F-07) | Rate-limit |
| `NUKI_API_KEY` | `api/nuki/unlock/route.ts:6` | ✅ Server | F-01 | Auth |
| `NUKI_SMARTLOCK_ID` | `api/nuki/unlock/route.ts:7` | ✅ Server | F-01 | Auth |
| `MOLLIE_API_KEY` | `api/checkout/route.ts:20` | ✅ Server | F-04 | Webhook + prijs lock |
| `RESEND_API_KEY` | 4× routes | ✅ Server | F-02, F-09 | Auth + rate-limit |
| `OPENWEATHER_API_KEY` | `api/weather/route.ts:77` | ✅ Server | Quota | Cache (al aanwezig) |
| `PICNIC_EMAIL` | `api/picnic/route.ts:52` | ✅ Server | F-10 | Verwijder feature |
| `PICNIC_PASSWORD` | `api/picnic/route.ts:53` | ✅ Server | F-10 | Verwijder feature |
| `SUPABASE_URL` | `lib/supabase.ts:7` | ✅ Server | — | OK |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase.ts:8` | ✅ Server | F-05 | Achter auth |
| `NEXT_PUBLIC_APP_URL` | meerdere | ⚠️ Client (by design) | Geen secret | OK |
| Toegangscode `4821` | `welkom/page.tsx:91`, `Verblijf.tsx:119`, `nuki/unlock:42` | ⚠️ Client + API | F-16 | Roteer per verblijf |
| Wifi `HuynenGast2024` | meerdere | ⚠️ Client | F-16 | Roteer / guest-net |

**Geen `NEXT_PUBLIC_` secrets gevonden. Alle externe API-keys correct server-only.**

---

## 7. Auth/authz matrix

| Route | Auth nodig? | Authz nodig? | Aanwezig? | Risico-finding |
|---|---|---|---|---|
| `POST /api/chat` | Nee | Nee | — | F-07 |
| `POST /api/nuki/unlock` | **Ja** | **Ja** (huidig verblijf) | **Geen** | **F-01** |
| `POST /api/booking` | **Ja** (gast) | n.v.t. | Geen | F-09 |
| `POST /api/terugkomen` | Nee | n.v.t. | — | F-07 |
| `POST /api/checkout` | **Ja** (gast) | **Ja** (product/prijs) | **Geen** | **F-04** |
| `POST /api/bevestig` | **Ja** (token) | **Ja** | **Geen** | **F-03** |
| `GET /api/bevestig` | **Ja** (token) | **Ja** | **Geen** (alleen `id`) | **F-03** |
| `POST /api/offerte` | **Ja** (host) | **Ja** | **Geen** | **F-02, F-03** |
| `POST /api/reviews` | Nee (kan publiek) | Moderation | **Geen** | F-14 |
| `GET /api/reviews` | Nee | n.v.t. | — | OK |
| `GET /api/weather` | Nee | n.v.t. | — | OK |
| `POST /api/picnic` | **Ja** (host) | **Ja** | **Geen** | **F-10** |
| Page `/offerte` | **Ja** (host) | **Ja** | **Geen** | **F-02** |
| Page `/bevestig` | Tokenized link | Tokenized | Alleen `id` | F-03 |
| Page `/welkom` | Per verblijf | Per verblijf | Geen | Low |

---

## 8. Misbruikscenario's (top 5)

### 8.1 Fysieke deur openen — anoniem (zodra Nuki echt is)
- **Voorwaarden:** publieke deploy + Nuki-keys gezet
- **Stappen:** `curl -X POST https://app.huisterhuynen.nl/api/nuki/unlock`
- **Gevolg:** lodge geopend
- **Mitigatie:** F-01

### 8.2 Gratis verblijf via aanvraag-keten
- **Voorwaarden:** geldige `aanvraag.id`
- **Stappen:** eigen `/api/terugkomen` → `POST /api/offerte {prijsVerblijf:"0.01"}` → `POST /api/bevestig {id}`
- **Gevolg:** boeking als €0,01 bevestigd
- **Mitigatie:** F-02 + F-03

### 8.3 Spear-phishing vanuit lodge-domein
- **Voorwaarden:** `RESEND_API_KEY` actief
- **Stappen:** `POST /api/offerte {gastEmail:"target", bericht:"<a href='evil'>klik</a>"}`
- **Gevolg:** phishing-mail vanaf `lodge@huisterhuynen.nl` met DKIM-pass
- **Mitigatie:** F-02, F-08

### 8.4 OpenAI quota leegtrekken
- **Voorwaarden:** `OPENAI_API_KEY` actief
- **Stappen:** loop op `POST /api/chat`
- **Gevolg:** ~€300/dag bij 1M req
- **Mitigatie:** F-07 + spending-cap bij OpenAI

### 8.5 Cross-site unlock via geïnfecteerde site
- **Voorwaarden:** slachtoffer bezoekt evil-page
- **Stappen:** `fetch('/api/nuki/unlock', {method:'POST'})` cross-origin
- **Gevolg:** unlock vanuit slachtoffer-browser
- **Mitigatie:** F-01 + F-06

---

## 9. False positives / gecontroleerd maar oké

- **`dangerouslySetInnerHTML` / `eval()`**: 0 hits in `src/`. Geen XSS-vector via React.
- **`NEXT_PUBLIC_*` secrets**: alleen `NEXT_PUBLIC_APP_URL`, geen secret.
- **`localStorage`**: alleen `hth-profile`, `hth-install-dismissed`. Geen tokens/PII.
- **OpenAI prompt injection**: `messages.slice(-10)` + max-tokens 300 + system prompt is robust genoeg; risico beperkt tot reputational.
- **`navigator.clipboard.writeText`**: niet exploitable zonder user-gesture.
- **`fetch(${appUrl}/api/booking)` in checkout**: `appUrl` uit env, niet uit user-input → geen SSRF.
- **TypeScript strict-mode**: niet code-zichtbaar; geen Critical-issue.

**Te verifiëren** (niet code-zichtbaar): `.zip` inhoud, Supabase RLS, Mollie/Resend dashboards, Vercel project-headers, DMARC-policy.

---

## 10. Prioriteitenplan

### Binnen 24 uur (BLOCKERS — niet deployen zonder)
1. **F-01** — auth op `/api/nuki/unlock` *(zodra Nuki echt wordt — vraag Arjan eerst hoe gasten de deur moeten openen)*
2. **F-02** — auth op `/offerte` page + `POST /api/offerte`
3. **F-03** — per-aanvraag confirm-token op bevestig-flow
4. **F-04** — server-side prijs whitelist + Mollie webhook *(zodra Mollie echt wordt)*
5. **F-06** — CORS `*` vervangen door specifieke origin

### Binnen 7 dagen (Hoog)
6. **F-05** — splits service-role en anon Supabase clients
7. **F-07** — rate-limiting via Vercel Edge / Upstash
8. **F-08** — HTML-escaping in alle e-mail-templates
9. **F-09** — zod-schema's op alle API-route bodies
10. **F-19** — `.zip` bestanden uit repo + history

### Binnen 30 dagen (Medium)
11. **F-10** — Picnic-feature: behouden of schrappen?
12. **F-11** — PII-redactie in logs
13. **F-12** — security headers
14. **F-13** — npm audit fixen (let op: niet `--force`)
15. **F-14** — review-moderatie + captcha
16. **F-15** — atomair update in `/api/bevestig`
17. **F-17** — `.gitignore` aanscherpen
18. **F-21** — basic CI: `next lint` + `tsc --noEmit` + npm audit

### Later / hardening
19. **F-16** — Wifi/PIN per verblijf roteren
20. **F-18** — `OWNER_EMAIL` naar env
21. **F-20** — Mollie URL-validatie
22. Tests, observability (Sentry), responsible-disclosure policy.

---

## 11. Eindoordeel

| Aspect | Cijfer | Onderbouwing |
|---|---|---|
| **Security** | **2/10** | 4 Critical + 6 High direct exploitable bij echte deploy. Geen auth-laag, CORS `*`, service-role key zonder guard. Wel: `dangerouslySetInnerHTML` ontbreekt, geen `NEXT_PUBLIC_*` secret-leaks, env-vars correct server-side. |
| **Architecture** | **3/10** | Geen middleware, geen auth-laag, geen domeinmodel-isolatie host vs gast. Veel duplicatie in e-mail-templates (~70 regels HTML × 4 routes). State half client, half DB. Mollie zonder webhook is structureel mis. |
| **Maintainability** | **5/10** | Leesbare code, TypeScript actief, route-bestanden beheersbaar groot (200–266 regels). Maar: geen tests, geen CI, code-duplicatie e-mails, magic-string product/prijs, geen schema-validatie. |
| **Production readiness** | **1/10** | Niet productieklaar. Acuut risico bij echte deploy voor (a) fysieke veiligheid lodge, (b) financiën, (c) e-mail-reputatie domein, (d) AVG. "Binnen 24 uur"-fixes zijn minimum-voorwaarde. |

---

## Gebruikte zoekpatronen

- `grep -rn "process.env\|import.meta.env" src/` — env-gebruik
- `grep -rn "dangerouslySetInnerHTML\|eval(\|Function(\|exec(\|spawn(" src/` — XSS/RCE
- `grep -rn "localStorage\|sessionStorage" src/` — client-storage
- `grep -rn "console\.(log|error|warn)" src/` — log/PII
- `grep -rn "rateLimit\|throttle" src/` — rate-limit (0 hits)
- `grep -rn "webhook" src/` — webhook routes (0 hits)
- `grep -n "fetch(" src/app/api/` — third-party calls
- `npm audit --json` — CVEs
- `git ls-files | xargs grep -l "sk-\|api_key\|secret\|password\|token\|Bearer"` — committed credentials
- `curl -X POST localhost:3000/api/nuki/unlock` — live-verificatie
- Handmatige read van alle API routes, pages, components, configs

---

## Open vragen voor Arjan (lodge-eigenaar / opdrachtgever)

Dit zijn product- en scope-keuzes die Arjan moet beslissen. De volgende ontwikkelaar of AI-assistent **stelt deze vragen voordat er iets gebouwd wordt** — zonder antwoord wordt er straks iets gemaakt dat later weer omgegooid moet worden. Technische invulling van het gekozen pad gaat daarna met Danny (of zijn opvolger).

1. **Nuki / deur openen** — hoe willen we dat gasten de deur openen? Een unieke code per verblijf die ze via WhatsApp of SMS krijgen, een knop in de app na inchecken, of een Nuki-uitnodiging op hun eigen telefoon? Dit bepaalt het hele auth-mechanisme.
2. **Mollie / betalen** — welke producten worden écht via Mollie afgerekend (welkomstpakket, fietsverhuur, late checkout)? En welke blijven "op aanvraag, factureren we later"? De huidige UI wekt de indruk dat alles direct betaald wordt, maar de implementatie staat half af.
3. **Host-login** — er is nog geen inlog-pagina voor jou (Arjan) om offertes te versturen. Wat wil je: inloggen met een Google-account, een magiclink (klik op een link in een mail om in te loggen, geen wachtwoord), of een eenvoudige gebruikersnaam-wachtwoord?
4. **Picnic-boodschappen** — blijft deze feature bestaan? Het werkt nu via je persoonlijke Picnic-account; daar zitten risico's aan (Picnic kan je account schorsen). Alternatief: gasten zelf via een link laten bestellen.
5. **Wi-Fi + deurcode rotatie** — wordt de deurcode per verblijf geroteerd of is "4821" een vaste backup-code? En de Wi-Fi: hebben we een aparte gasten-Wi-Fi waar we het wachtwoord per gast kunnen wijzigen, of staat iedereen op één netwerk?
6. **`.zip` bestanden in de repo** — er staan vier zip-bestanden in de hoofdmap (oude versies van features). Mogen die weg of zit er nog iets nuttigs in?
7. **AI-chat ambitie** — blijft de chatbot een eenvoudige tekst-Q&A op basis van GPT-4o-mini, of moet 'ie groeien naar bv. spraak / realtime-conversatie? Heeft impact op architectuur en kosten.

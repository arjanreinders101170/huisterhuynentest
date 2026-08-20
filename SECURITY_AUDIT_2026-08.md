# Security Audit — Huis ter Huynen (augustus 2026)

> ## Status: 22 van de 27 bevindingen opgelost
>
> Dit document is de **audit-momentopname** van 19 augustus op commit `da19066`.
> De bevindingen zijn inmiddels grotendeels hersteld in PR #192 (zes commits).
> Het bijgewerkte rapport, met per bevinding wat er precies is veranderd, staat
> als Artifact — zie de PR-omschrijving.
>
> | | |
> |---|---|
> | **Opgelost** | 22 — waaronder de Critical en alle vier de blokkerende High-bevindingen |
> | **Deels** | F-17 (headers geconsolideerd; `'unsafe-inline'` blijft) |
> | **Open** | F-07 productkeuze · F-20 UX · F-23 organisatie · F-25 geparkeerd |
> | **Dependencies** | van 8 naar 3 — rest vraagt Next 16 (major) |
> | **Score** | 62 → **88 / 100** |
>
> **Nog handmatig te doen — de code kan dit niet voor je:**
>
> 1. Wifi-wachtwoord roteren en de Vercel-variabele hernoemen naar `WIFI_PASSWORD`
> 2. Beide Booking.com iCal-export-URL's roteren → `ICAL_LODGE_1` / `ICAL_LODGE_2`
> 3. Lockout-instelling van het Nuki-codeslot nakijken
>
> De databasemigraties zijn inmiddels uitgevoerd en geverifieerd — zie hieronder.
>
> Zonder de eerste twee is de code opgeschoond maar blijven de gelekte waarden geldig.
>
> **Drie bevindingen kwamen er later bij.** F-26 (**Critical**) en F-27 kwamen
> boven toen de eigenaar de `pg_policies`-uitvoer van de productiedatabase
> aanleverde — de blinde vlek die in dit rapport als *Database 55%* stond. Een
> policy genaamd "Service role full access" stond op `roles = {public}` in plaats
> van `{service_role}`, en gaf daarmee iedereen volledige lees- en schrijftoegang
> tot negen tabellen, waaronder `stays` (stay-tokens en deurcodes).
>
> Beide zijn opgelost en geverifieerd: alle 23 tabellen staan nu op RLS aan met
> nul policies, met één uitzondering (`reviews`, `anon:SELECT` voor de homepage),
> en nul schrijfrechten voor `anon`. Controleer opnieuw met `scripts/check-rls.sql`.
>
> **De derde:** F-25 (wifi-wachtwoord en stay-token in de
> URL naar `api.qrserver.com`) is gevonden tijdens het herstellen, niet tijdens de
> audit. Geparkeerd op verzoek; de CSP blokkeert die requests op dit moment al.

> **Datum:** 2026-08-19
> **Commit:** `da19066` · branch `claude/security-audit-full-pgpdwk`
> **Scope:** 237 bestanden · 32.673 regels TS/TSX · 31 API-routes · 22 migraties · 125 commits historie
> **Methode:** whitebox source review. **Geen live testing** — geen requests naar productie, geen DB-toegang.
> **Leesbare versie:** gepubliceerd als Artifact (zie PR-omschrijving)
>
> Dit rapport vervangt `SECURITY_AUDIT.md` (mei 2026) niet, maar volgt erop.
> Alle vier de toenmalige Critical-bevindingen zijn geverifieerd opgelost.

---

## Samenvatting

| | |
|---|---|
| **Security score** | **62 / 100** — niet productieklaar |
| **Critical** | 0 |
| **High** | 4 |
| **Medium** | 10 |
| **Low** | 8 |
| **Informational** | 2 |

Dit is een merkbaar volwassener codebase dan de vorige audit beschreef. Er is echte
magic-link-authenticatie met server-side sessieverificatie, de Mollie-webhook haalt de
betaalstatus zelf op bij Mollie én controleert het bedrag, RLS staat aan op zestien
tabellen, CORS is teruggebracht tot één origin, en er is rate limiting.

**Elke adminroute die is gelezen doet zijn eigen server-side autorisatiecheck.** De
middleware is daar aanvulling, geen enige verdediging. Er is **geen enkel pad gevonden
waarmee een anonieme bezoeker of een gast admin wordt** — geen authenticatiebypass, geen
privilege escalation, geen SQL-injectie, geen SSRF, geen open redirect, en geen secrets in
de git-historie.

Wat overblijft zit in de randen, en daar zit wel echt werk. Vier zaken blokkeren go-live:

1. Het **wifi-wachtwoord staat publiek op internet** (`NEXT_PUBLIC_` + open `/welkom`).
2. Een autorisatiecheck in `/api/bevestig` is **fail-open**.
3. De fietsverhuur is voor **één cent** af te rekenen.
4. **Next.js heeft actieve middleware-bypass-CVE's**, terwijl juist middleware de pagina's afschermt.

Geen daarvan is een architectuurprobleem. Het zijn vier gerichte reparaties, samen ruwweg
een dag werk. Met alleen Fase 1 opgelost komt de applicatie op ~80/100 — verantwoord voor
publiek productiegebruik met dit risicoprofiel.

### Onderbouwing van de score

Vertrekpunt 100. `−28` voor vier High-bevindingen (publiek gelekt toegangscredential,
fail-open autorisatiecheck, betaalbedrag-manipulatie, kwetsbaar framework op een
security-kritiek pad). `−20` voor tien Medium-bevindingen, geconcentreerd rond ontbrekende
rate limiting, enumeratie en invoervalidatie. `−8` voor acht Low-bevindingen. `+18` terug
voor bewezen sterke punten: consequente server-side autorisatie op élke adminroute,
correcte webhook-verificatie mét bedragcontrole, RLS-baseline, schone secrets-hygiëne,
expliciete veld-allowlisting (geen mass assignment), en cryptografisch degelijke tokens.

---

## De vier hoofdvragen

### 1. Kan een kwaadwillende gebruiker binnenkomen waar hij niet hoort te komen?

**Gedeeltelijk — ja, maar niet in de admin.**

- **Adminomgeving: nee.** Alle adminroutes roepen `verifyAdminSession()` aan, die de
  cookie-HMAC verifieert én de sessie tegen de database checkt op intrekking en verloop
  (`src/lib/admin-auth.ts:21-38`). Geen adminfunctie leunt alleen op de frontend of de middleware.
- **Gast-app `/app` en `/concierge`: de poort is cosmetisch.** De middleware laat iedereen
  door die wíllekeurig welke `?s=`-parameter meestuurt (`src/middleware.ts:88`). Je krijgt
  alleen de lege UI-schil; echte gegevens komen uit `/api/stay`, dat het token wél
  valideert. → **F-09**
- **De deur: nee.** `/api/nuki/unlock` vereist een geldig stay-token, controleert de
  check-in-tijd en check-out-datum, en logt elke poging.
- **Het wifi-netwerk: ja.** → **F-01**

### 2. Kan een gebruiker data van andere gebruikers bekijken of wijzigen?

**Ja, in drie gevallen — beperkt in omvang, maar reëel.**

- **Bekijken én wijzigen via `/api/bevestig`** — fail-open tokencheck. → **F-02**
- **Gastenumeratie via `/api/guest-check`** — onbeveiligd, ongelimiteerd, geeft de voornaam terug. → **F-07**
- **De volledige Booking.com-agenda** ligt open voor iedereen met repositorytoegang. → **F-08**

Wat een gebruiker *niet* kan: er is geen enkele publieke route die een lijst met gasten,
boekingen, facturen of aanvragen teruggeeft. Die staan allemaal achter `verifyAdminSession()`.

### 3. Kan iemand privileges verhogen?

**Nee — geen enkel pad gevonden.**

De adminrol is binair en wordt volledig bepaald door `ADMIN_EMAILS`. Er is geen enkele API
die rollen of adminlidmaatschap kan schrijven, en geen impersonation-functie. Magic-link-tokens
zijn 256-bits, worden als SHA-256-hash opgeslagen, en worden atomisch geconsumeerd met een
`UPDATE … WHERE used_at IS NULL AND expires_at > now()` — race-condition-vrij. De
sessiecookie is HMAC-ondertekend, `HttpOnly`, `Secure`, `SameSite=Strict`, met timing-safe
vergelijking.

Eén indirecte route verdient aandacht: de Next.js middleware-bypass-CVE's geven geen
adminrechten — de API's blijven beschermd — maar halen wél de paginapoort weg. → **F-05**

### 4. Is dit technisch verantwoord om publiek in productie te gebruiken?

**Nu nog niet. Na Fase 1 wel.**

Ik zou deze applicatie vandaag niet live zetten met echte gasten, om één reden die zwaarder
weegt dan de rest: een toegangscredential staat publiek op internet, en dat is een fout in
de bouwwijze, niet in één regel. Daarnaast is de fail-open tokencheck precies het soort
autorisatiefout waar een externe pentestpartij binnen een uur op stuit.

Maar dat zijn vier gerichte reparaties, geen herbouw. De autorisatie-architectuur is gezond,
de betaalflow verifieert bij de bron, secrets zijn schoon, en de invoervalidatie gebruikt
overal Zod-schema's met expliciete veld-allowlisting.

---

## Top 10 risico's

| # | Probleem | Component | Sev | CVSS | Exploiteerbaarheid | Prio |
|---|---|---|---|---|---|---|
| 1 | Wifi-wachtwoord publiek via `NEXT_PUBLIC_` en open `/welkom` | Frontend / config | High | 7.5 | Triviaal — één GET | P0 |
| 2 | Fail-open autorisatie in `/api/bevestig`: IDOR + ongeautoriseerd bevestigen | API | High | 7.4 | Vereist aanvraag-UUID | P0 |
| 3 | Prijsmanipulatie fietsverhuur — `dagen: 0.01` → €0,01 | Betaalflow | High | 7.5 | Triviaal — één POST | P0 |
| 4 | Next.js 15.5.15 met middleware-/proxy-bypass-CVE's | Framework | High | 7.5 | Publieke advisories | P0 |
| 5 | LIKE-wildcard-injectie in `.ilike()` — kortingscodes uitlezen | API / DB | Medium | 6.4 | Triviaal, binaire zoektocht | P1 |
| 6 | Rate limiting ontbreekt op vier publieke routes | Middleware | Medium | 5.3 | Triviaal | P1 |
| 7 | HTML-injectie in uitgaande e-mail — phishing vanaf eigen domein | E-mail | Medium | 6.1 | Triviaal | P1 |
| 8 | Booking.com iCal-tokens hardcoded in broncode | Integratie | Medium | 6.5 | Repositorytoegang | P1 |
| 9 | Gastenumeratie + PII via `/api/guest-check` | API | Medium | 5.3 | Triviaal | P1 |
| 10 | Geen RLS op `admin_sessions` / `admin_magic_tokens` | Database | Medium | 5.3 | Vereist gelekte anon-key | P2 |

---

## Findings

Confidence-labels: **Confirmed** = volgt dwingend uit gelezen code · **Highly likely** =
één aanname niet verifieerbaar zonder runtime · **Potential** = afhankelijk van een
randvoorwaarde die niet gecontroleerd kon worden.

---

### F-01 · High · Wifi-wachtwoord staat publiek op internet

**CVSS 3.1** 7.5 `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N` · **Confidence** Confirmed · **OWASP** A02, A05

**Betrokken code**

- `src/data/lodge.ts:6` — `export const WIFI_PASSWORD = process.env.NEXT_PUBLIC_WIFI_PASSWORD ?? ""`
- `src/app/welkom/page.tsx:160` — rendert het wachtwoord in server-side HTML
- `src/components/Verblijf.tsx:126,179` en `src/app/concierge/page.tsx:6` — beide `"use client"`
- `src/data/host-knowledge.ts:48,56` — wachtwoord in de systeemprompt van de chatbot
- `src/app/api/chat/route.ts:142,158` — fallback-antwoorden geven het aan iedere beller

**Probleem.** De prefix `NEXT_PUBLIC_` betekent in Next.js letterlijk: bak deze waarde
tijdens de build in de JavaScript die naar elke browser gaat. Er is geen manier om die
keuze later terug te draaien met een check of een cookie.

Daarbovenop komt `/welkom`. Die pagina staat niet in de `matcher` van de middleware
(`src/middleware.ts:108-119`) en doet zelf geen tokenvalidatie — de `?s=`-parameter wordt
alleen gebruikt om een QR-code te bouwen. De pagina rendert het wachtwoord onvoorwaardelijk.

**Attack scenario**

```bash
# Geen authenticatie, geen token, geen rate limit:
curl -s https://www.huisterhuynen.nl/welkom | grep -i wachtwoord

# En als tweede bron, uit de client-bundle:
curl -s https://www.huisterhuynen.nl/_next/static/chunks/*.js | grep -o 'HuynenGast[^"]*'
```

**Impact.** Ongeautoriseerde netwerktoegang tot het gastnetwerk van beide lodges. Het
wachtwoord kan niet per gast worden ingetrokken.

**Oplossing**

```diff
  // src/data/lodge.ts
- export const WIFI_PASSWORD = process.env.NEXT_PUBLIC_WIFI_PASSWORD ?? "";
+ // Server-only. Nooit NEXT_PUBLIC_ — dat bakt de waarde in de client-bundle.
+ export const WIFI_PASSWORD = process.env.WIFI_PASSWORD ?? "";
```

Daarna, in volgorde:

1. `Verblijf.tsx` en `concierge/page.tsx` lezen het wachtwoord uit het antwoord van
   `/api/stay` (veld `wifi_password` zit er al in), niet uit `@/data/lodge`.
2. `/welkom` valideert `?s=` tegen de `stays`-tabel, of laat het wachtwoord eruit.
3. In `/api/chat` gaat het wifi-blok alleen in de prompt en de fallbacks wanneer `stayInfo !== null`.
4. **Roteer het wifi-wachtwoord** na deploy. Zolang de oude waarde in gearchiveerde builds
   en caches staat, is hij gecompromitteerd.

> **Let op.** Ook ná deze fix blijft het wachtwoord in de systeemprompt van een LLM staan
> voor geldige gasten. Dat is acceptabel, maar een gast kan met prompt-injectie de rest van
> de kennisbank uitlezen. Zet er niets in wat een gast niet mag weten.

---

### F-02 · High · Fail-open tokencheck in `/api/bevestig` — IDOR op gastgegevens

**CVSS 3.1** 7.4 `AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:N` · **Confidence** Confirmed · **OWASP** A01, API1 BOLA

**Betrokken code.** `src/app/api/bevestig/route.ts:100` en `:138` — identieke check in beide laadfuncties:

```ts
if (data.confirm_token && data.confirm_token !== token) return null;
```

**Probleem.** De check beschermt alleen wanneer `confirm_token` een waarde heeft. Is hij
`NULL`, dan is de linkerkant van de `&&` falsy en wordt de hele voorwaarde overgeslagen.

En `confirm_token` is standaard `NULL`. De kolom is `text` zonder default
(`migrations/2026_05_15_unified_booking_requests.sql:43`) en wordt op precies één plek
gezet: in de adminactie `send_offerte_v2` (`_booking-requests.ts:152-165`). De publieke
formulieren — `/api/reservering`, `/api/terugkomen`, `/api/booking` — schrijven hun rij weg
via `safeInsertBookingRequest()` zonder token.

**Elke aanvraag in status `nieuw` is dus volledig onbeschermd.**

**Attack scenario**

```bash
# Uitlezen: naam, e-mailadres, datums, aantal personen, offertebedrag
curl "https://www.huisterhuynen.nl/api/bevestig?id=<uuid>"

# Wijzigen: zet de aanvraag van een ander op 'bevestigd'
curl -X POST https://www.huisterhuynen.nl/api/bevestig \
  -H 'Content-Type: application/json' -d '{"id":"<uuid>"}'
```

De tweede call zet `status = "bevestigd"`. Omdat `findConflict()` en
`openOffersOverlapping()` bevestigde aanvragen als bezet behandelen, blokkeert dat de
agenda en verstuurt het bevestigingsmails naar gast en host.

**Wat de exploiteerbaarheid beperkt.** Het ID is een `gen_random_uuid()` (122 bits) en
`/api/bevestig` is gelimiteerd op 10 requests per uur per IP. Een aanvaller heeft het UUID
nodig uit een doorgestuurde e-mail, een `Referer`-header, de `/betaald?booking=`-URL in
browsergeschiedenis, of serverlogs. Geen massa-exploit — maar wel een autorisatiecheck die
niet doet wat hij belooft.

**Oplossing**

```diff
  // src/app/api/bevestig/route.ts — in loadFromBookingRequests én loadFromLegacy
- if (data.confirm_token && data.confirm_token !== token) return null;
+ // Fail-closed: geen token in de rij betekent dat er nog geen offerte is
+ // verstuurd — die aanvraag hoort niet opvraagbaar of bevestigbaar te zijn.
+ if (!data.confirm_token || !token) return null;
+ const a = Buffer.from(String(data.confirm_token));
+ const b = Buffer.from(String(token));
+ if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
```

Zet daarnaast een token bij *aanmaak* van elke aanvraag in `safeInsertBookingRequest()`, en
overweeg de kolom `NOT NULL DEFAULT encode(gen_random_bytes(32),'hex')` te maken zodat geen
enkel toekomstig insert-pad dit opnieuw kan introduceren.

---

### F-03 · High · Fietsverhuur af te rekenen voor één cent

**CVSS 3.1** 7.5 `AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N` · **Confidence** Confirmed · **OWASP** A04, Business Logic

**Betrokken code.** `src/app/api/checkout/route.ts:67-78` en `src/lib/products.ts:40-59`.

```ts
const fietsen = metadata?.fietsen as Record<string, number> | undefined;
const dagen   = metadata?.dagen   as number | undefined;   // ← alleen een cast
if (!fietsen || !dagen) return … 400;
amount = await calcFietsTotal(fietsen, dagen);
if (amount <= 0) return … 400;
```

**Probleem.** De rest van deze route is voorbeeldig: de prijs van vaste producten komt uit
de database, nooit van de client. Maar voor fietsverhuur komen `fietsen` en `dagen` uit
`metadata`, gedefinieerd als `z.record(z.string(), z.unknown())` — Zod valideert daar niets
binnenin. De TypeScript-cast `as number` is puur compile-time.

In `calcFietsTotal` wordt `dagen` rechtstreeks vermenigvuldigd:
`total += dagPrijs * dagen * qty`. Geen controle op geheel getal, minimum of bovengrens. De
enige poortwachter is `amount <= 0`, en een fractie is groter dan nul.

**Attack scenario**

```bash
curl -X POST https://www.huisterhuynen.nl/api/checkout \
 -H 'Content-Type: application/json' -d '{
   "productId":"fiets","gastNaam":"Test","gastEmail":"a@b.nl",
   "metadata":{"fietsen":{"<fiets-id>":1},"dagen":0.01}
 }'
# dagPrijs 25 × 0.01 × 1 = 0.25 → Mollie-betaallink van € 0,25
# dagen: 0.0004 → € 0,01
```

De webhook-bedragcontrole (`mollie/webhook/route.ts:84-93`) vangt dit **niet**: die
vergelijkt tegen `bookings.prijs`, en die is bij het aanmaken al op datzelfde gemanipuleerde
bedrag gezet. De controle verifieert dat Mollie het verwachte bedrag heeft geïnd — niet dat
dat verwachte bedrag zelf correct was.

**Oplossing**

```diff
  // src/lib/schemas.ts
+ export const fietsMetadataSchema = z.object({
+   fietsen: z.record(z.string().max(50), z.number().int().min(0).max(10)),
+   dagen:   z.number().int().min(1).max(30),
+ });
```

```diff
  // src/app/api/checkout/route.ts
  if (productId === "fiets") {
-   const fietsen = metadata?.fietsen as Record<string, number> | undefined;
-   const dagen   = metadata?.dagen   as number | undefined;
-   if (!fietsen || !dagen) return NextResponse.json({ error: … }, { status: 400 });
+   const fiets = fietsMetadataSchema.safeParse(metadata);
+   if (!fiets.success) {
+     return NextResponse.json({ error: "Ongeldige fietskeuze" }, { status: 400 });
+   }
+   const { fietsen, dagen } = fiets.data;
    amount = await calcFietsTotal(fietsen, dagen);
```

Tweede verdedigingslinie in `calcFietsTotal` zelf, plus een absolute ondergrens vlak vóór
de Mollie-aanroep:

```diff
  // src/lib/products.ts
  export async function calcFietsTotal(fietsen, dagen) {
+   if (!Number.isInteger(dagen) || dagen < 1 || dagen > 30) return 0;
    …
    for (const [id, qty] of Object.entries(fietsen)) {
-     if (qty <= 0) continue;
+     if (!Number.isInteger(qty) || qty <= 0 || qty > 10) continue;
```

```diff
+ if (amount < 1) {
+   return NextResponse.json({ error: "Ongeldig bedrag" }, { status: 400 });
+ }
```

---

### F-04 · Medium · LIKE-wildcard-injectie in `.ilike()` — kortingscodes uitlezen

**CVSS 3.1** 6.4 `AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:L/A:N` · **Confidence** Confirmed · **OWASP** A03

**Betrokken code**

- `src/app/api/discount/validate/route.ts:39` — `.ilike("code", rawCode)`
- `src/app/api/reservering/route.ts:42` — `.ilike("code", code)`
- `src/app/api/guest-check/route.ts:16` — `.ilike("email", email)`

**Probleem.** Dit is géén SQL-injectie — PostgREST parametriseert netjes. Maar `ILIKE` is
een *patroon*-operator, en `%` en `_` zijn daarin metatekens. Door gebruikersinvoer
ongefilterd als patroon te gebruiken, verandert een exacte-match-lookup in een zoekopdracht
die de aanvaller stuurt.

De `.single()`-aanroep lijkt te beschermen omdat hij faalt bij meer dan één rij — maar dat
maakt hem juist tot een perfect orakel: elke query geeft één bit informatie terug.

**Attack scenario — een kortingscode extraheren zonder hem te kennen**

```
POST /api/discount/validate  {"code":"%"}      → 0 of meerdere codes bestaan
{"code":"A%"} → niet gevonden
{"code":"L%"} → VALID {"waarde":15,"type":"percentage","id":"…"}
{"code":"L_____"} → VALID   ⇒ de code is 6 tekens lang
# teken voor teken uitlezen: L + A%, L + E%, …
# volledige extractie in enkele honderden requests. Geen rate limit.
```

Zodra de code bekend is, wordt hij toegepast in `/api/reservering:99-110`. Dezelfde techniek
werkt op `/api/guest-check` om e-mailadressen in de gastendatabase te bepalen.

**Oplossing**

```diff
  // src/app/api/discount/validate/route.ts
  const rawCode = String(body.code || "").trim().toUpperCase();
+ // Alleen tekens die in een echte kortingscode voorkomen. Dit sluit
+ // meteen de LIKE-metatekens % en _ uit.
+ if (!/^[A-Z0-9-]{1,50}$/.test(rawCode)) {
+   return NextResponse.json({ valid: false, error: "Ongeldige code" });
+ }

  const { data, error } = await getSupabase()
    .from("discount_codes").select("*")
-   .ilike("code", rawCode)
+   .eq("code", rawCode)   // codes worden hoofdletters opgeslagen
    .single<DiscountCode>();
```

Pas dezelfde wijziging toe in `reservering/route.ts:42`. Zijn codes in wisselende
schrijfwijzen opgeslagen, gebruik dan een functionele index in plaats van terug te vallen op
`ilike`: `CREATE UNIQUE INDEX ON discount_codes (upper(code));`

---

### F-05 · High · Next.js 15.5.15 met actieve middleware-bypass-CVE's

**CVSS 3.1** tot 7.5 (advisory) · **Confidence** Confirmed · **OWASP** A06

`package.json` pint `"next": "^15.1.0"`, geïnstalleerd is `15.5.15`. De architectuur maakt
dit erger dan een gewone dependency-melding: `src/middleware.ts` is de *enige* bescherming
van de adminpagina's, `/offerte` en de gast-app.

| Advisory | Wat het doet |
|---|---|
| `GHSA-267c-6grr-h53f` | Middleware-bypass in App Router via segment-prefetch-routes |
| `GHSA-26hh-7cqf-hhc6` | Idem — onvolledige fix van de eerste, opnieuw omzeilbaar |
| `GHSA-492v-c6pp-mqqv` | Middleware-bypass via injectie in dynamische route-parameters |
| `GHSA-3g8h-86w9-wvmq` | Middleware-redirects zijn cache-poisonable |
| `GHSA-955p-x3mx-jcvp` | Ongeauthenticeerde disclosure van interne Server Function-endpoints |

**Impact op déze applicatie.** Een geslaagde bypass geeft de server-gerenderde
adminpagina's. Dat is beperkt: het dashboard haalt zijn data via `/api/admin/data`, en die
route verifieert onafhankelijk de sessie — de aanvaller krijgt een leeg dashboard. Dat de
schade beperkt blijft komt volledig doordat de API-laag zijn eigen autorisatie doet; een
goede reden om daar nooit van af te stappen. De redirect-cache-poisoning is de vervelendste
van de vijf.

**Oplossing**

```bash
npm install next@15.5.23   # minimale sprong, blijft in de 15.5-lijn (aanbevolen)
# of: npm install next@16.3.1   (major — testen)
```

```diff
- "next": "^15.1.0"
+ "next": "15.5.23"
```

`sharp`, `postcss`, `ws` en `nanoid` lossen mee op met deze upgrade.

---

### F-06 · Medium · Rate limiting ontbreekt op de belangrijkste publieke routes

**CVSS 3.1** 5.3 · **Confidence** Confirmed · **OWASP** API4

`src/middleware.ts:8-20` — de `LIMITS`-tabel dekt elf routes. Deze staan er **niet** in:

| Route | Wat een aanvaller ermee kan |
|---|---|
| `/api/reservering` | **Het hoofdboekingsformulier.** Ongelimiteerd nepaanvragen, elk met twee uitgaande e-mails. |
| `/api/newsletter` | Ongelimiteerd welkomstmails naar willekeurige adressen (zie F-11). |
| `/api/discount/validate` | Ongelimiteerd brute-forcen van kortingscodes (zie F-04). |
| `/api/guest-check` | Ongelimiteerde gastenumeratie (zie F-07). |
| `/api/pricing` | Uitlezen van de volledige prijsstructuur. |
| `/api/meta/capi` | Vervuiling van conversiedata met verzonnen events. |

**Een tweede, structureler probleem.** De limiter is een `Map` in het procesgeheugen
(`middleware.ts:6`). Op Vercel draait middleware op meerdere edge-instanties tegelijk, elk
met een eigen lege `Map`. De feitelijke limiet is dus "N per uur *per instantie*", en een
aanvaller die parallel stuurt krijgt vanzelf verschillende instanties. Bovendien overleeft
de telling geen cold start. Dat betekent dat óók de limieten die er wél staan — inclusief
die op `/api/nuki/unlock` en `/api/admin/request-link` — zwakker zijn dan de code suggereert.

**Oplossing (korte termijn)**

```diff
  const LIMITS: Record<string, { max: number; window: number }> = {
    …
+   "/api/reservering":      { max: 5,   window: 3600000 },  // 5/uur
+   "/api/newsletter":       { max: 3,   window: 3600000 },  // 3/uur
+   "/api/discount/validate":{ max: 10,  window: 600000  },  // 10/10min
+   "/api/guest-check":      { max: 5,   window: 600000  },  // 5/10min
+   "/api/pricing":          { max: 60,  window: 60000   },  // 60/min
+   "/api/meta/capi":        { max: 120, window: 60000   },  // 120/min
  };
```

**Middellange termijn.** Verplaats de telling naar gedeelde opslag (Vercel KV, Upstash, of
een `rate_limits`-tabel met atomaire `INSERT … ON CONFLICT DO UPDATE`). Overweeg voor de
formulieren daarnaast Cloudflare Turnstile — die stopt geautomatiseerd misbruik effectiever
dan een IP-limiet, want IP's zijn goedkoop.

---

### F-07 · Medium · Gastenumeratie en naamlekkage via `/api/guest-check`

**CVSS 3.1** 5.3 · **Confidence** Confirmed · **OWASP** A01, API3, AVG

`src/app/api/guest-check/route.ts` — de hele route, 26 regels, geen authenticatie.

```
GET /api/guest-check?email=iemand@voorbeeld.nl
→ {"known":true,"naam":"Marieke"}     // adres bestaat, plus de voornaam
→ {"known":false}                     // adres bestaat niet
```

**Probleem.** Het endpoint maakt de gastendatabase doorzoekbaar voor iedereen. Onder de AVG
is de bevestiging "dit adres is klant bij deze accommodatie" zelf al een persoonsgegeven —
het onthult een verblijfsrelatie. De voornaam erbij maakt het bruikbaar voor gerichte
phishing. En zonder rate limit (F-06) kan iemand een hele adressenlijst erdoorheen halen.

**Oplossing** — drie opties, van sterk naar pragmatisch:

1. **Verwijder de route.** Personaliseer pas ná het versturen van het formulier, in de
   e-mail — daar weet je zeker dat je met de eigenaar van het adres praat.
2. **Koppel aan een bestaande sessie.** Herken terugkomers via de stay-cookie of een
   ondertekende link uit een eerdere e-mail.
3. **Minimaal:** geen naam terugsturen en streng limiteren.

```diff
- const voornaam = (data.naam || "").split(" ")[0] || data.naam || "";
- return NextResponse.json({ known: true, naam: voornaam });
+ // Geen naam teruggeven: die maakt het antwoord bruikbaar voor phishing.
+ return NextResponse.json({ known: true });
```

---

### F-08 · Medium · Booking.com iCal-tokens hardcoded in de broncode

**CVSS 3.1** 6.5 · **Confidence** Confirmed · **OWASP** A02, A05

`src/lib/availability.ts:22-25`:

```ts
const ICAL_URLS: Record<string, string> = {
  lodge_1: process.env.ICAL_LODGE_1 || "https://ical.booking.com/v1/export?t=4ba3994f-…",
  lodge_2: process.env.ICAL_LODGE_2 || "https://ical.booking.com/v1/export?t=aef0f4b7-…",
};
```

**Probleem.** Dit zijn *capability-URL's*: het token ín de URL is het enige bewijs van
toegang. Wie de URL heeft, heeft de agenda — geen login, geen tweede factor. Een
Booking.com-iCal-export bevat de geboekte periodes en, afhankelijk van de exportinstellingen,
gastnamen en reserveringsnummers in de `SUMMARY`-velden.

Ze staan in versiebeheerde broncode: zichtbaar voor iedereen met repositorytoegang, aanwezig
in de volledige git-historie, meegekopieerd in elke fork, clone, CI-log en backup. De
fallback maakt het bovendien stil — de app werkt door als iemand vergeet `ICAL_LODGE_1` te
zetten, dus niemand merkt dat het hardcoded pad in gebruik is.

> **Positief.** Dit is de enige plek in de hele codebase met een echt credential in de
> broncode. De volledige git-historie (125 commits) is gescand op API-keys, private keys,
> JWT's en cloud-credentials — niets gevonden. De secrets-hygiëne is verder goed op orde.

**Oplossing**

1. **Roteer beide tokens in Booking.com.** De oude blijven anders geldig, ook na verwijdering uit de code.
2. Zet de nieuwe waarden alleen in Vercel, en haal de fallback weg zodat een ontbrekende
   variabele zichtbaar faalt.

```diff
- const ICAL_URLS: Record<string, string> = {
-   lodge_1: process.env.ICAL_LODGE_1 || "https://ical.booking.com/v1/export?t=…",
-   lodge_2: process.env.ICAL_LODGE_2 || "https://ical.booking.com/v1/export?t=…",
- };
+ // Capability-URL's: het token ís de toegang. Nooit in versiebeheer.
+ const ICAL_URLS: Record<string, string | undefined> = {
+   lodge_1: process.env.ICAL_LODGE_1,
+   lodge_2: process.env.ICAL_LODGE_2,
+ };
```

`hasIcalUrl()` en `fetchIcalPeriods()` gaan hier al correct mee om, en `/api/ical` valt
netjes terug op eigen bevestigde reserveringen met `Cache-Control: no-store`. Voeg
secret-scanning toe aan CI (GitHub secret scanning of `gitleaks`) zodat dit niet opnieuw kan.

---

### F-09 · Low · Gast-app-poort is cosmetisch: elke `?s=`-waarde opent hem

**CVSS 3.1** 3.7 · **Confidence** Confirmed · **OWASP** A01

`src/middleware.ts:88` — `const hasToken = Boolean(request.nextUrl.searchParams.get("s"))`.
De middleware controleert of de parameter *aanwezig* is, niet of hij *klopt*. `/app?s=x`
passeert de poort.

**Waarom Low:** je krijgt uitsluitend de lege UI-schil. Alle echte gegevens komen via
`/api/stay`, dat het token tegen de `stays`-tabel valideert, en `/api/nuki/unlock` valideert
onafhankelijk opnieuw. De architectuur vangt dit op — maar de poort geeft een valse indruk
van bescherming, en de client-bundle die je zo binnenhaalt bevat vandaag nog het
wifi-wachtwoord (F-01).

**Oplossing.** Valideer de HMAC in de middleware (het edge-veilige apparaat staat al in
`src/lib/stay-auth-edge.ts`), of laat de poort weg en documenteer dat de API-laag de enige
echte verdediging is. De huidige tussenvorm is het slechtste van twee werelden.

---

### F-10 · Medium · Geen RLS op `admin_sessions` en `admin_magic_tokens`

**CVSS 3.1** 5.3 · **Confidence** Confirmed · **OWASP** A05, A01

`migrations/2026_05_28_rls_baseline.sql` zet RLS aan op zestien tabellen. De twee tabellen
uit `migrations/2026_05_13_admin_magic_link.sql` staan er niet tussen, en die migratie zet
zelf ook geen RLS aan.

**Wat dit niet is:** geen authenticatiebypass. De sessiecookie moet HMAC-ondertekend zijn
met `ADMIN_SESSION_SECRET`, en dat staat niet in de database. Tokens staan als SHA-256-hash
opgeslagen.

**Wat het wel is:** met de anon-key zijn e-mailadressen, IP-adressen en user agents van alle
admin-inlogsessies uit te lezen, en zijn sessies te verwijderen (DoS op admintoegang). Precies
het scenario waar de baseline blijkens zijn eigen commentaar — *"tweede verdedigingslinie als
de anon key lekt"* — voor bedoeld is.

```sql
ALTER TABLE admin_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_magic_tokens  ENABLE ROW LEVEL SECURITY;
-- Geen policies = geen toegang voor anon/authenticated.
-- De service-role client omzeilt RLS, dus de app blijft ongewijzigd werken.
REVOKE ALL ON admin_sessions, admin_magic_tokens FROM anon, authenticated;
```

Controleer bij deze gelegenheid ook de tabellen die buiten deze repo zijn aangemaakt en dus
in geen enkele migratie staan: `reviews`, `guests`, `stays`, `bookings`, `invoices`,
`products`, `pricing_*`.

---

### F-11 · Medium · HTML-injectie in uitgaande e-mail — phishing vanaf je eigen domein

**CVSS 3.1** 6.1 · **Confidence** Confirmed · **OWASP** A03

- `src/lib/email.ts:197` — `lodgeEmail()` plaatst de titel ongeëscaped: `<h1 …>${opts.title}</h1>`
- `src/lib/email.ts:382` — `newsletterWelcomeEmail()`: ``title: `Welkom${opts.firstName ? `, ${opts.firstName}` : ""}` ``
- `src/app/api/newsletter/route.ts:72-76` — `firstName` is het onbewerkte `naam`-veld,
  `z.string().min(1).max(100)`: honderd tekens vrije tekst, zonder `esc()`

**Probleem.** De rest van de e-mailcode is consequent: `esc()` wordt overal toegepast op
`intro`, detailblokken en gastnamen. Deze ene route ontsnapt eraan — en het is net de route
die naar een *door de aanvaller gekozen adres* stuurt. De aanvaller bepaalt zowel `naam` als
`email`. Het resultaat is een e-mail die technisch legitiem is: verstuurd door Resend, vanaf
`lodge@huisterhuynen.nl`, met geldige SPF en DKIM, in de echte huisstijl — met een stuk HTML
dat de aanvaller heeft geschreven.

**Attack scenario**

```bash
curl -X POST https://www.huisterhuynen.nl/api/newsletter \
 -H 'Content-Type: application/json' -d '{
   "naam":"</h1><p>Je reservering vereist bevestiging.
          <a href=\"https://phishing.example/betaal\">Bevestig hier</a></p><h1>",
   "email":"slachtoffer@voorbeeld.nl"
 }'
```

Zonder rate limit (F-06) schaalt dit naar een hele lijst. De schade valt niet alleen bij het
slachtoffer: klachten en spamrapportages beschadigen de bezorgbaarheid van je domein, en dat
raakt daarna élke boekingsbevestiging.

**Oplossing.** Escape de titel in de gedeelde helper — dat repareert deze route én elke
toekomstige aanroeper in één keer.

```diff
  // src/lib/email.ts — in lodgeEmail()
- <h1 style="…">${opts.title}</h1>
+ <h1 style="…">${esc(opts.title)}</h1>
```

> **Controleer bij deze wijziging:** sommige aanroepers geven bewust HTML-entiteiten mee in
> `title` (bijvoorbeeld `&mdash;`). Die worden door `esc()` letterlijk zichtbaar. Loop de
> aanroepen na en vervang zulke entiteiten door het echte teken, of splits de parameter in
> `title` (geëscaped) en `titleHtml` (vertrouwd, alleen server-side samengesteld).

Beperk daarnaast het `naam`-veld — verdediging in de diepte, geen vervanging van de escape:

```diff
- naam: z.string().min(1).max(100),
+ naam: z.string().min(1).max(60).regex(/^[\p{L}\p{M}\s'.-]+$/u, "Ongeldige naam"),
```

---

### F-12 · Medium · Deurcode is vier cijfers

**CVSS 3.1** 5.3 · **Confidence** Confirmed · **OWASP** A02, A07

`src/app/api/admin/data/_stays.ts:53` — `const door_code = String(randomInt(1000, 9999))`.
Dat is 8.999 mogelijkheden (de bovengrens is exclusief, dus 9999 komt nooit voor), en codes
beginnend met 0 evenmin.

De code wordt niet via de API geverifieerd — de Nuki-ontgrendeling gebruikt het stay-token —
dus dit is een *fysieke* credential voor het codeslot. Of dat brute-forcebaar is, hangt af
van de lockout-instellingen van het slot, en die waren hier niet in te zien.

```diff
- const door_code = String(randomInt(1000, 9999));
+ const door_code = String(randomInt(0, 1_000_000)).padStart(6, "0");
```

Controleer daarnaast in de Nuki-configuratie dat er een lockout na mislukte pogingen actief
is, en overweeg de code na check-out automatisch in te trekken.

---

### F-13 · Medium · Client bepaalt de prijs die de host in de offerte voorgeschoteld krijgt

**CVSS 3.1** 4.3 · **Confidence** Confirmed · **OWASP** A04

`src/app/api/reservering/route.ts:95` — `let totalNum = parseFloat(totalPrice) || 0`, waarbij
`totalPrice` een `z.string().max(20)` uit het formulier is. Die waarde belandt als
`voorgestelde_prijs` in de database, en wordt in `_booking-requests.ts:46` gebruikt als
*voorgevulde waarde* in het offerteformulier van de admin.

Geen directe betaalfraude — er komt een mens tussen, en het uiteindelijke offertebedrag komt
uit `prijsVerblijf` zoals de admin dat indient, met een `verblijf <= 0`-controle. Maar het is
wél een aanvaller die de standaardwaarde bepaalt in een formulier dat routinematig wordt
doorgeklikt.

```diff
- let totalNum = parseFloat(totalPrice) || 0;
+ // Prijs server-side bepalen; wat de browser stuurde is niet gezaghebbend.
+ const berekend = await computeStayPrice({ lodge, checkIn, checkOut, nachten: nightsNum });
+ let totalNum = berekend?.totaal ?? 0;
+ const getoondePrijs = parseFloat(totalPrice) || 0;
+ if (Math.abs(getoondePrijs - totalNum) > 1) {
+   console.warn(`[reservering] prijsafwijking: getoond ${getoondePrijs}, berekend ${totalNum}`);
+ }
```

`computeStayPrice()` bestaat al in `src/lib/pricing.ts` en wordt in `/api/terugkomen` ook
echt gebruikt.

---

### F-14 · Medium · `/api/booking` stuurt merkmail naar elk opgegeven adres

**CVSS 3.1** 5.3 · **Confidence** Confirmed · **OWASP** A04, API4

`src/app/api/booking/route.ts` — ongeauthenticeerd, accepteert een vrij te kiezen `product`
(100 tekens), `prijs` (20 tekens) en `gastEmail`. Er gaan twee mails uit: één naar de
eigenaar en één naar het opgegeven adres.

Anders dan bij F-11 wordt hier wél consequent `esc()` toegepast (`booking/route.ts:250,259`),
dus geen HTML-injectie. Wat resteert is een e-mailrelay met vrij te kiezen tekst in onderwerp
en body, plus een boekingsrij met een verzonnen prijs. De limiet van 5/uur/IP dempt dit, maar
per-instantie-telling (F-06) maakt die zwakker dan hij oogt.

**Oplossing.** Valideer `product` tegen de productentabel in plaats van vrije tekst, en leid
`prijs` daaruit af — zoals `/api/checkout` het al doet met `getProduct()`. Voeg een
honeypot-veld toe zoals `/api/newsletter` heeft (`_pot`).

---

### F-15 · Medium · `/api/reviews` POST is open — zichtbaarheidsdefault niet verifieerbaar

**CVSS 3.1** 5.3 · **Confidence** *Potential* · **OWASP** A04, A01

`src/app/api/reviews/route.ts:36-70` accepteert ongeauthenticeerd reviews en laat de kolom
`zichtbaar` ongemoeid — de databasedefault bepaalt dus of een review direct publiek wordt.

**Dit kon niet worden vastgesteld.** De tabel `reviews` wordt in geen enkele migratie in deze
repo aangemaakt. Is de default `true`, dan kan iedereen zonder moderatie tekst op de homepage
publiceren (content-injectie met SEO- en reputatieschade). Is de default `false`, dan is dit
alleen een spamprobleem in het adminpaneel en zakt het naar Low.

**Wat nodig is om dit af te ronden:**
`SELECT column_default FROM information_schema.columns WHERE table_name='reviews' AND column_name='zichtbaar';`

**Oplossing, ongeacht de uitkomst** — zet de waarde expliciet, vertrouw niet op de default:

```diff
  .insert({
      guest_id: guestId,
      naam: String(naam).slice(0, 50),
      sterren: Number(sterren),
      tekst: String(tekst).slice(0, 500),
+     zichtbaar: false,  // moderatie verplicht — nooit op de DB-default vertrouwen
    })
```

---

### F-16 · Medium · `.env.local.example` beschrijft variabelen die de code niet meer gebruikt

**Confidence** Confirmed · **OWASP** A05

Het voorbeeldbestand noemt `ADMIN_SECRET` als "verplicht voor /admin" en `SUPABASE_ANON_KEY`,
maar de huidige code gebruikt `ADMIN_SESSION_SECRET` (`admin-auth-edge.ts:59`) en
`ADMIN_EMAILS` (`admin-auth-edge.ts:48`) — en **geen van beide staat in het voorbeeldbestand**.
Ook `ICAL_LODGE_1/2` en `WIFI_PASSWORD` ontbreken of kloppen niet meer.

**Waarom dit meetelt.** Wie de applicatie opnieuw uitrolt met dit bestand krijgt een omgeving
waarin niemand kan inloggen. Het goede nieuws is dat het *fail-closed* is: zonder
`ADMIN_SESSION_SECRET` gooit `sessionSecret()` een fout, die in `parseSessionCookie()` wordt
gevangen → toegang geweigerd. Zonder `ADMIN_EMAILS` geeft `isAllowedAdminEmail()` altijd
`false`. Dat is de goede faalrichting en duidelijk bewust zo gebouwd. Maar de verleiding bij
zo'n stille storing is om te gaan sleutelen tot het werkt, en daar ontstaan onveilige
workarounds. Werk het bestand bij, met een minimale lengte-eis van 32 tekens.

---

### F-17 · Low · CSP staat `'unsafe-inline'` toe voor scripts

**CVSS 3.1** 3.7 · **Confidence** Confirmed · **OWASP** A05

`next.config.ts:9` — `script-src 'self' 'unsafe-inline' …`. Daarmee is de CSP geen effectieve
XSS-verdediging meer.

De overige richtlijnen zijn juist goed gekozen: `object-src 'none'`, `frame-ancestors 'none'`,
`base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`, en `connect-src` is
netjes tot de gebruikte hosts beperkt.

**Twee kanttekeningen bij de headers als geheel:**

- **De configuratie staat op twee plaatsen.** `next.config.ts` levert CSP, `vercel.json`
  levert HSTS — met overlap op X-Frame-Options, nosniff, Referrer-Policy en Permissions-Policy.
  `Strict-Transport-Security` staat **alleen** in `vercel.json`, dus bij een deploy buiten
  Vercel verdwijnt HSTS stilzwijgend. Breng alles samen in `next.config.ts`.
- **De loginpagina laadt een stylesheet die de CSP blokkeert.** `admin/login/page.tsx:52`
  haalt Inter van `fonts.googleapis.com`, terwijl `style-src` die host niet toestaat.
  Cosmetisch, maar een teken dat de CSP niet in de browser is nagelopen.

**Oplossing.** Stap over op een nonce-gebaseerde CSP. Let op dat je dan minimaal Next 15.5.23
draait — `GHSA-ffhc-5mcf-pf4q` beschrijft een XSS in juist die nonce-implementatie (F-05).

---

### F-18 · Low · Volledige aanvraagrij met persoonsgegevens in de serverlogs

**CVSS 3.1** 3.7 · **Confidence** Confirmed · **OWASP** A09, AVG

`src/lib/pricing.ts:141-154` — bij een mislukte insert wordt de volledige `row` gelogd,
inclusief `gast_naam`, `gast_email`, `bericht` en attributiegegevens. Ook de `catch`-tak doet
`JSON.stringify(row)`.

Opvallend, want de rest van de logging is zorgvuldig: `reservering/route.ts:145` en
`booking/route.ts:263` maskeren het adres actief tot `***@domein.nl`.

```diff
-       row,
+       // Geen persoonsgegevens in logs: alleen wat nodig is om te debuggen.
+       row: { bron: row.bron, lodge: row.lodge, check_in: row.check_in, nachten: row.nachten },
      }));
```

---

### F-19 · Low · JSON-LD wordt met `JSON.stringify` in een `<script>` geplaatst

**CVSS 3.1** 3.5 · **Confidence** Confirmed · **OWASP** A03

Acht plekken, waaronder `src/app/blog/[slug]/page.tsx:191,195` en `src/app/[slug]/page.tsx:57`.
`JSON.stringify` escapet `<` niet, dus een waarde met `</script>` breekt uit het scriptblok.

**Waarom Low:** de invoer is blogtitels en landingspagina-velden, alleen door een ingelogde
admin te schrijven. Geen exploiteerbare XSS vandaag — wel een sink die op scherp staat voor
de dag dat er gebruikersinvoer in een schema belandt (denk aan reviews in een `aggregateRating`).

```diff
+ // src/lib/site.ts
+ export function jsonLdScript(data: unknown): string {
+   return JSON.stringify(data)
+     .replace(/</g,       "\\u003c")   // breekt </script> open
+     .replace(/\u2028/g, "\\u2028")   // ongeldige JS line terminators
+     .replace(/\u2029/g, "\\u2029");
+ }

- dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
+ dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
```

---

### F-20 · Low · Magic-link-token staat in de URL

**CVSS 3.1** 3.7 · **Confidence** Confirmed · **OWASP** A07

`src/app/api/admin/request-link/route.ts:54` bouwt `…/api/admin/verify?token=<plain>`. Tokens
in query-parameters lekken langs meer wegen dan cookies: browsergeschiedenis,
`Referer`-headers, proxy- en CDN-logs, en platform-accesslogs.

De mitigaties zijn sterk — 15 minuten, eenmalig, atomisch geconsumeerd — dus het praktische
risico is klein. Eén neveneffect verdient wel aandacht: **e-mailbeveiligingsscanners
(Microsoft Safe Links, antivirus-gateways) volgen links automatisch** en consumeren het
eenmalige token vóórdat de gebruiker klikt. Gevolg: een inlog die "willekeurig" niet werkt.

**Oplossing.** Maak van `/api/admin/verify` een pagina met een bevestigingsknop die het token
via POST inlevert. Dat lost de scannerproblematiek op én haalt het token uit de `Referer`.
Voeg `Referrer-Policy: no-referrer` toe op die route.

---

### F-21 · Low · Diagnose-endpoint schrijft testrijen naar de productiedatabase

**CVSS 3.1** 2.7 · **Confidence** Confirmed · **OWASP** A05

`src/app/api/admin/diagnose-booking-requests/route.ts` voert een echte `INSERT` uit in
`booking_requests` (`DIAGNOSE-TEST`), verwijdert die daarna, en geeft ruwe Supabase-foutdetails
terug — `message`, `code`, `details` én `hint`, wat schema-informatie prijsgeeft. Het geeft
ook de laatste vijf echte aanvragen terug, met naam en e-mailadres.

De route is correct achter `verifyAdminSession()` geplaatst, dus geen toegangsprobleem. Maar
als de opruimactie faalt blijft er een spookrij in de productiedata staan, en de `hint`-velden
zijn precies wat je niet wilt teruggeven mocht de autorisatie ooit falen.

**Oplossing.** Verwijder de route, of zet hem achter een omgevingsvariabele die alleen in
preview aanstaat.

---

### F-22 · Low · `/api/chat` beantwoordt preflight met `Access-Control-Allow-Origin: *`

**CVSS 3.1** 3.1 · **Confidence** Confirmed · **OWASP** A05

De `OPTIONS`-handler in `src/app/api/chat/route.ts` zet een wildcard, terwijl `vercel.json`
voor alle `/api/*`-routes juist `https://www.huisterhuynen.nl` instelt.

**Waarom de impact klein is:** er staat geen `Access-Control-Allow-Credentials: true` bij, dus
er gaan geen cookies mee, en de browser controleert de origin ook op het échte antwoord — waar
de strakke waarde uit `vercel.json` geldt. Chat is inhoudelijk een publiek endpoint. Wat
resteert is kostenmisbruik van het OpenAI-budget, en dat is een rate-limitprobleem.

**Oplossing.** Maak de `OPTIONS`-handler consistent, of haal hem weg — `vercel.json` handelt
CORS al af.

---

### F-23 · Informational · Geen MFA, één rolniveau, en geen security-monitoring

**Confidence** Confirmed · **OWASP** A07, A09

Drie observaties die alle drie *passend* zijn voor twee beheerders — maar die je bewust moet
hebben besloten, niet per ongeluk hebben overgehouden:

- **De e-mailbox ís de tweede factor.** Wie het adres in `ADMIN_EMAILS` overneemt, is admin.
  Verdedigbaar als op die mailbox zelf MFA staat — controleer dat, en leg het vast.
- **Eén rol.** Elke admin kan alles: prijzen wijzigen, gasten verwijderen, betaallinks
  versturen, exporteren. Voor twee mensen prima; bij een derde wil je scheiding.
- **Geen alerting.** Er wordt netjes gelogd bij `admin_session_created` en
  `admin_magic_link_sent`, en `nuki_unlock_log` registreert elke deurpoging met IP — meer dan
  de meeste projecten van deze omvang hebben. Maar mislukte tokenpogingen worden niet gelogd,
  en er is nergens een alert. Niemand merkt het als iemand een uur lang aanvraag-ID's probeert.

**Voorstel.** Log geweigerde `consumeMagicToken`-pogingen, 401's op adminroutes en 429's uit
de rate limiter als gestructureerde events, en zet één alert op een drempelwaarde. Een halve
dag werk, en het verschil tussen "we zijn gehackt" en "we zagen het gebeuren".

---

### F-24 · Informational · Build-artefacten in versiebeheer

**Confidence** Confirmed

`src/app/admin/.next/cache/config.json` en `src/app/admin/.next/trace` staan in git. Ze
bevatten een Next.js-telemetrie-ID en een build-trace — geen credentials. De oorzaak is dat
`.gitignore` `/.next/` met een leidende slash uitsluit, wat alleen de root treft.

```diff
  # .gitignore
- /.next/
+ .next/
```

```bash
git rm -r --cached src/app/admin/.next
```

---

## API-inventarisatie

Alle 31 routes in `src/app/api/` zijn gelezen. De auth-kolom geeft de **server-side** controle
weer, niet wat de middleware doet.

| Method | Endpoint | Auth | Rate limit | Invoervalidatie | Risico |
|---|---|---|---|---|---|
| GET/POST | `/api/admin/data` | Sessie+DB | geen (bewust) | Veld-allowlist per actie | Laag |
| POST | `/api/admin/sync-pricing` | Sessie+DB | geen | Aanwezigheidscheck; `year` ongetypeerd | Laag |
| GET | `/api/admin/email-preview` | Sessie+DB | geen | Enum via switch | Laag |
| GET | `/api/admin/diagnose-booking-requests` | Sessie+DB | geen | n.v.t. | F-21 |
| POST | `/api/followup` | Sessie+DB | geen | Ja | Laag |
| POST | `/api/admin/request-link` | Allowlist e-mail | 5/u IP + 5/u e-mail | Typecheck + `@` | Laag |
| GET | `/api/admin/verify` | Eenmalig token | 10/u | Tokenlookup op hash | F-20 |
| POST | `/api/admin/logout` | Cookie-HMAC | geen | n.v.t. | Laag |
| GET | `/api/cron/emails` | CRON_SECRET | geen | Query-enum | Laag |
| GET | `/api/cron/gsc-sync` | CRON_SECRET | geen | Geclamped 1–16 | Laag |
| GET | `/api/cron/publish-posts` | CRON_SECRET | geen | n.v.t. | Laag |
| POST | `/api/mollie/webhook` | Callback-verificatie bij Mollie | 30/u | Form-body, ID uitgelezen | Laag |
| GET | `/api/stay` | Stay-token (DB) | 30/min | Tokenlookup | Laag |
| POST | `/api/nuki/unlock` | Stay-token + tijdvenster | 3/min | Tokenlookup | Laag |
| GET/POST | `/api/bevestig` | **Fail-open token** | 10/u | ID + token | **F-02** |
| POST | `/api/checkout` | geen | 10/u | Zod; `metadata` ongevalideerd | **F-03** |
| POST | `/api/reservering` | geen | **geen** | Zod + datumcontrole server-side | F-06, F-13 |
| POST | `/api/terugkomen` | geen | 5/u | Zod + datumcontrole | Laag |
| POST | `/api/booking` | geen | 5/u | Zod; product vrije tekst | F-14 |
| POST | `/api/discount/validate` | geen | **geen** | Lengtecheck; geen tekenfilter | F-04 |
| GET | `/api/guest-check` | geen | **geen** | Alleen `@`-check | F-07 |
| POST | `/api/newsletter` | geen | **geen** | Zod + honeypot | F-11 |
| GET/POST | `/api/reviews` | geen | 10/min | Zod | F-15 |
| OPTIONS/POST | `/api/chat` | optioneel stay-token | 10/min + 30/dag per verblijf | Geen schema op `messages` | F-22 |
| POST | `/api/meta/capi` | geen | **geen** | Zod, strikt | Laag |
| GET | `/api/pricing` | geen | **geen** | Aanwezigheidscheck | Laag |
| GET | `/api/ical` | geen | geen | Allowlist via `hasIcalUrl` | Laag |
| GET | `/api/weather` | geen | geen | n.v.t. — vaste coördinaten | Laag |
| GET | `/api/google-reviews` | geen | geen | n.v.t. — vast Place ID | Laag |
| GET | `/api/og/blog` | geen | geen | Slug-lookup, alleen gepubliceerd | Laag |
| GET | `/api/og/landing` | geen | geen | Slug-lookup | Laag |

### Wat expliciet níét kwetsbaar bleek

Deze conclusies zijn net zo belangrijk als de bevindingen, want ze bakenen af waar je *niet*
hoeft te zoeken:

- **Geen SQL- of NoSQL-injectie.** Alle databasetoegang loopt via de PostgREST-client met
  geparametriseerde filters. Geen raw query, geen `.rpc()` met samengestelde SQL, geen
  string-concatenatie in een filter.
- **Geen SSRF.** Elke uitgaande `fetch()` gaat naar een vaste host: Mollie, OpenAI, Resend,
  Nuki, `date.nager.at`, `ferien-api.de`, Booking.com, Google. Nergens komt een hostnaam uit
  gebruikersinvoer.
- **Geen open redirect.** De drie `NextResponse.redirect()`-aanroepen staan alle in
  `admin/verify` en gebruiken vaste paden.
- **Geen mass assignment.** Elke schrijfactie somt zijn kolommen expliciet op. Geen enkele
  `insert(body)` of `update({...body})` aangetroffen.
- **Geen command injection, deserialisatie of path traversal.** Geen `eval`, geen
  `new Function`, geen `child_process`. Er zijn geen file uploads in de applicatie.
- **CSRF is afgedekt door `SameSite=Strict`** op de admincookie. De routes die een token in de
  body verwachten (`/api/nuki/unlock`, `/api/bevestig`) zijn structureel niet CSRF-gevoelig.
- **De Mollie-webhook is correct gebouwd.** Hij vertrouwt de binnenkomende payload niet, maar
  haalt de betaling zelf op bij Mollie met de eigen API-key — het patroon dat Mollie
  voorschrijft, inclusief idempotency-check, statusmapping en bedragcontrole.

---

## Dependencies

`npm audit --omit=dev` tegen `package-lock.json` op `da19066`. **Nul Critical.**

| Package | Geïnstalleerd | Severity | Aard van het risico | Naar versie |
|---|---|---|---|---|
| `next` | 15.5.15 | High | Middleware-/proxy-bypass, cache poisoning, SSRF, XSS via nonce, DoS — F-05 | 15.5.23 · 16.3.1 |
| `sharp` | 0.34.5 | High | Transitief via `next`; beeldverwerking op onvertrouwde invoer | ≥ 0.35.0 |
| `postcss` | 8.5.13 | High | Transitief via `next`; parserprobleem | > 8.5.22 |
| `ws` | — | High | Transitief; DoS via header-afhandeling | > 8.20.1 |
| `nanoid` | 3.3.12 | High | Oneindige lus bij negatieve of nul-grootte | > 3.3.17 |
| `resend` | 6.12.2 | Moderate | Direct dependency; e-mailverzending | > 6.12.2 |
| `svix` | — | Moderate | Transitief via `resend`; webhook-handtekeningen | > 1.91.1 |
| `uuid` | — | Moderate | Transitief | ≥ 11.1.1 |

`npm audit fix` lost zeven van de acht op; alleen `next` vraagt een bewuste keuze tussen
15.5.23 (patch, laag risico) en 16.3.1 (major, testen).

**Toeleveringsketen.** Negen productie-dependencies is een gezond klein oppervlak, allemaal
actief onderhouden pakketten van bekende leveranciers — geen verweesde of obscure packages,
geen typosquat-risico's, geen intern registry (dus geen dependency-confusion-vector). De
`package-lock.json` staat in versiebeheer. Wat ontbreekt is automatisering: zet Dependabot of
Renovate aan, en voeg `npm audit --audit-level=high` toe aan CI.

---

## Externe koppelingen

| Dienst | Data die uitgaat | Credential | TLS | Bij uitval | Risico |
|---|---|---|---|---|---|
| Mollie | Bedrag, omschrijving, gastnaam + e-mail in metadata | `MOLLIE_API_KEY` | Ja | Valt terug op e-mailboeking | F-03 |
| Supabase | Alle applicatiedata | `SERVICE_ROLE_KEY` | Ja | Route geeft 500 | F-10 |
| Resend | Gastnamen, e-mailadressen, boekingsdetails, factuur-PDF | `RESEND_API_KEY` | Ja | Stille no-op, gelogd | F-11 |
| OpenAI | Chatberichten, voornaam gast, lodge, wifi-wachtwoord in de prompt | `OPENAI_API_KEY` | Ja | Keyword-fallback, 15s timeout | F-01 |
| Nuki | Alleen het smartlock-ID | `NUKI_API_KEY` | Ja | **Demo-modus simuleert succes** | zie noot |
| Booking.com | Niets — alleen inkomende iCal | Token in de URL | Ja | Eigen reserveringen, `no-store` | F-08 |
| e-Boekhouden | Gastnaam, e-mail, factuurregels | `EBOEKHOUDEN_API_TOKEN` | Ja | Fout gelogd, boeking blijft | Laag |
| Meta CAPI | SHA-256-gehashte e-mail, naam, land + `fbp`/`fbc` | `META_CAPI_ACCESS_TOKEN` | Ja | Stille no-op | zie noot |
| Google Search Console | Alleen queries | `GSC_PRIVATE_KEY` | Ja | 503 met duidelijke fout | Laag |
| Google Places / Weather | Vast Place ID, vaste coördinaten | `*_API_KEY` | Ja | Cache, dan seizoensschatting | Laag |
| GTM / Meta Pixel / GA4 | Client-side gedrag, consent-gated | Publieke ID's | Ja | Script laadt niet | Laag |

**Nuki — de demo-modus verdient aandacht.** Ontbreekt `NUKI_API_KEY` of het smartlock-ID, dan
wacht `/api/nuki/unlock` twee seconden en antwoordt `{"success":true,"demo":true}`. Prima voor
ontwikkeling, maar een productieomgeving waar de variabelen per ongeluk niet zijn gezet, meldt
aan de gast dat de deur open is terwijl er niets gebeurd is. Dat is het omgekeerde van
fail-closed. Koppel de demo-modus expliciet aan `NODE_ENV !== "production"`.

**Meta CAPI — de hashing is correct.** `src/lib/tracking/hash.ts` normaliseert en hasht
e-mailadressen en namen met SHA-256 voordat ze naar Meta gaan. Ruwe e-mailadressen gaan niet
de deur uit. Wel gaat er onversleutelde metadata mee (IP, user agent) — inherent aan CAPI,
maar het hoort in je AVG-verwerkingsregister, en de consent-gating moet daadwerkelijk worden
gerespecteerd vóór verzending.

**Webhooks.** Er is precies één inkomende webhook: `/api/mollie/webhook`. Hij verifieert geen
handtekening, maar dat hoeft ook niet — hij gebruikt het *callback*-patroon en haalt de
betaalstatus zelf op bij Mollie. Een aanvaller die een willekeurig payment-ID post, krijgt van
Mollie een 404 of een betaling die niet bij een bekende `bookingId` hoort, en de route stopt.
Idempotency via statusvergelijking én een unique constraint op `invoices.booking_id`.
Replay-bescherming is inherent aan het patroon. Dit is goed gebouwd.

---

## Herstelplan

### Fase 1 — Vóór go-live (blokkerend)

| # | Issue | Actie | Effect | Effort |
|---|---|---|---|---|
| 1 | F-01 Wifi publiek | `NEXT_PUBLIC_` weghalen, `/welkom` afschermen, wachtwoord roteren | Sluit ongeautoriseerde netwerktoegang | 2–3 u |
| 2 | F-02 Fail-open token | Check omkeren naar fail-closed + token bij insert zetten | Sluit IDOR op gastgegevens | 1 u |
| 3 | F-03 Prijsmanipulatie | Zod-schema op fietsmetadata + ondergrens op het bedrag | Sluit betaalfraude | 1 u |
| 4 | F-05 Next.js CVE's | `npm install next@15.5.23` + regressietest | Sluit middleware-bypass | 1–2 u |
| 5 | F-08 iCal-tokens | Roteren bij Booking.com, fallback uit de code | Sluit agenda-exposure | 30 min |

### Fase 2 — Binnen twee weken

| # | Issue | Actie | Effect | Effort |
|---|---|---|---|---|
| 6 | F-04 Wildcard-injectie | `.ilike()` → `.eq()` + tekenfilter op codes | Sluit kortingscode-orakel | 1 u |
| 7 | F-06 Rate limiting | Ontbrekende routes toevoegen aan `LIMITS` | Dempt misbruik en enumeratie | 30 min |
| 8 | F-11 E-mail-injectie | `esc()` op `title` in `lodgeEmail()` | Sluit phishing vanaf eigen domein | 1 u |
| 9 | F-07 Gastenumeratie | Route verwijderen of naam uit het antwoord halen | Sluit PII-lek | 1 u |
| 10 | F-10 RLS-gat | Migratie voor de twee admin-tabellen | Herstelt tweede verdedigingslinie | 30 min |
| 11 | F-15 Reviews | Default verifiëren + `zichtbaar: false` expliciet | Voorkomt ongemodereerde content | 30 min |
| 12 | F-16 Env-drift | `.env.local.example` bijwerken | Voorkomt onveilige workarounds | 20 min |
| 13 | Dependencies | `npm audit fix` voor de overige zeven | Nul bekende High-CVE's | 30 min |

### Fase 3 — Hardening

| # | Issue | Actie | Effect | Effort |
|---|---|---|---|---|
| 14 | F-06 Gedeelde limiter | Telling naar Vercel KV of een Supabase-tabel | Limieten worden écht globaal | 3–4 u |
| 15 | F-13 Prijs server-side | `computeStayPrice()` ook in `/api/reservering` | Client bepaalt niets over prijs | 2 u |
| 16 | F-12 Deurcode | Zes cijfers + lockout in Nuki controleren | Zoekruimte ×110 | 1 u |
| 17 | F-09 Gast-poort | HMAC valideren in de middleware | Poort doet wat hij belooft | 1 u |
| 18 | F-17 CSP + headers | Nonce-CSP, headers samenvoegen, HSTS naar `next.config.ts` | XSS-verdediging wordt echt | 3 u |
| 19 | F-14 Booking-relay | Product tegen de tabel valideren + honeypot | Sluit e-mailrelay | 1 u |
| 20 | F-18/19/20/21/22/24 | PII uit logs, JSON-LD-helper, POST-verify, diagnose weg, CORS, gitignore | Opruimwerk | 3 u |

### Fase 4 — Security maturity

| # | Onderwerp | Actie | Effect | Effort |
|---|---|---|---|---|
| 21 | Monitoring | Mislukte tokenpogingen, 401's en 429's als gestructureerde events + één alert | Je ziet een aanval terwijl hij loopt | 4 u |
| 22 | CI-security | `npm audit --audit-level=high` + Dependabot + `gitleaks` | Regressies falen de build | 3 u |
| 23 | Bot-bescherming | Turnstile op de publieke formulieren | Effectiever dan IP-limieten | 3 u |
| 24 | Toegangsbeheer | MFA op de admin-mailboxen aantoonbaar maken; rolscheiding bij een derde beheerder | Beperkt gevolgen van één gekaapte mailbox | 2 u |
| 25 | Databasehygiëne | Alle tabellen in migraties zetten; RLS-dekking volledig verifiëren | Geen blinde vlekken in het schema | 4 u |
| 26 | Extern onderzoek | Pentest ná Fase 1–3, plus backup-/hersteltest | Onafhankelijke bevestiging | — |

---

## Production-readiness checklist

`✓` voldoet · `~` gedeeltelijk · `✕` voldoet niet

- [x] **Authenticatie veilig** — magic link, 256-bits tokens, hash-opslag, atomische consumptie, HMAC-cookie met timing-safe vergelijking
- [x] **Autorisatie server-side** — elke adminroute verifieert onafhankelijk sessie én DB-status
- [x] **Admin beveiligd** — geen pad naar privilege escalation gevonden
- [ ] `~` **API's beveiligd** — één fail-open autorisatiecheck (F-02), één ontbrekende invoervalidatie (F-03)
- [x] **Database beveiligd** — geen injectie mogelijk, RLS-baseline aanwezig, geen mass assignment
- [ ] `~` **Secrets veilig** — historie schoon, maar iCal-tokens hardcoded (F-08) en wifi via `NEXT_PUBLIC_` (F-01)
- [ ] `✕` **Dependencies gecontroleerd** — 5 High, 3 Moderate; framework op security-kritiek pad
- [ ] `~` **Security headers** — sterke set, maar `'unsafe-inline'` in `script-src` en HSTS op één plaats
- [x] **CORS correct** — één origin, geen credentials; alleen de chat-preflight wijkt af
- [ ] `~` **Rate limiting** — aanwezig maar onvolledig, en per-instantie in plaats van globaal
- [ ] `~` **Logging** — sessies en deurpogingen gelogd; mislukte auth niet, en PII lekt op één plek
- [ ] `✕` **Monitoring** — geen alerting op security-events
- [ ] `✕` **Backup security** — niet verifieerbaar vanuit de repository
- [x] **Webhook security** — callback-patroon, idempotency, bedragcontrole
- [x] **File upload security** — niet van toepassing, er zijn geen uploads
- [x] **Error handling** — generieke berichten naar de client, details alleen in de logs
- [ ] `~` **Privacy / data exposure** — gastenumeratie (F-07) en IDOR (F-02) exposeren persoonsgegevens
- [ ] `✕` **CI/CD security** — geen pipeline-configuratie in de repository aangetroffen
- [ ] `✕` **Productie/staging-scheiding** — niet verifieerbaar
- [ ] `✕` **Geen bekende Critical/High** — 4 High in de applicatie, 5 High in dependencies

---

## Audit coverage

| Onderdeel | Dekking |
|---|---|
| API | 100% |
| Authenticatie | 100% |
| Autorisatie | 100% |
| Dependencies | 100% |
| Codebase | 95% |
| Admin | 90% |
| Integraties | 85% |
| Frontend | 80% |
| Database | 55% |
| Infrastructuur | 30% |

**Volledig gelezen:** alle 31 API-routes; `src/middleware.ts`; de vier auth-bibliotheken
(`admin-auth.ts`, `admin-auth-edge.ts`, `stay-auth-edge.ts`, `supabase.ts`); `schemas.ts`,
`pricing.ts`, `products.ts`, `availability.ts`, `email.ts`; alle negen admin-datahandlers;
alle 22 migraties; `next.config.ts`, `vercel.json`, `package.json`, `.gitignore`,
`.env.local.example`; de volledige git-historie (125 commits) gescand op secrets.

**Gericht doorzocht:** alle 169 bestanden onder `src/` op injectiesinks (`eval`,
`new Function`, `child_process`, `dangerouslySetInnerHTML`), redirect-sinks, `ilike`/`like`-
gebruik, alle uitgaande `fetch()`-doelen, mass-assignment-patronen, en PII in logging.

**Adminfuncties nagelopen:** stays (aanmaken, welkomstmail, link ophalen, token roteren, late
check-out, bedankmail), producten, prijzen, content (blog en landingspagina's:
create/update/publish/delete/import), aanvragen (offerte versturen, betaallink, afwijzen),
kortingscodes, marketing, Search Console, groei, en het zichtbaar maken van reviews.

### Wat níét gecontroleerd kon worden

| Onderdeel | Waarom niet | Wat ervoor nodig is |
|---|---|---|
| Databaseschema buiten migraties | `reviews`, `guests`, `stays`, `bookings`, `invoices`, `products`, `pricing_*` zijn buiten versiebeheer aangemaakt — defaults, constraints en RLS-dekking onbekend | `pg_dump --schema-only`, of `\d+` per tabel |
| RLS-policies in de praktijk | De baseline-migratie staat in de repo, maar of hij is uitgevoerd is niet te zien | `SELECT * FROM pg_policies;` plus `relrowsecurity` per tabel |
| Vercel-configuratie | Omgevingsvariabelen per environment, protectie op preview-deployments, domeininstellingen | Export van de projectinstellingen |
| Preview- en staging-omgevingen | Niet te bepalen of preview-URL's publiek bereikbaar zijn en of ze op de productiedatabase draaien | Deployments-lijst + `SUPABASE_URL` per environment |
| CI/CD | Geen `.github/workflows` in de repository | Bevestiging of er buiten GitHub Actions om wordt gedeployed, en welke secrets die pipeline heeft |
| Branch protection | Niet zichtbaar vanuit de broncode | De branch-protectieregels op `main` |
| Backups | Geen configuratie in de repository | Supabase-backupinstellingen, retentie, en of een restore ooit is getest |
| Nuki-slotconfiguratie | Lockout-instelling bepaalt of F-12 Medium of Low is | De instellingen van het codeslot |
| Booking.com iCal-inhoud | Bewust niet opgehaald — geen requests naar productiediensten van derden | Eén export bekijken op gastnamen in `SUMMARY` |
| Runtime-gedrag | Geen live testing uitgevoerd | Een staging-omgeving met testdata om de PoC's te bevestigen |

**Over de percentages.** Codebase staat op 95% omdat de i18n-bestanden, datamappen en
SEO-documenten alleen op patronen zijn gescand, niet regel voor regel — daar zit geen
securitylogica. Database staat op 55% omdat de migraties volledig zijn gelezen maar het
feitelijke schema niet te inspecteren was. Infrastructuur staat op 30% omdat alleen
`vercel.json` en `next.config.ts` beschikbaar waren.

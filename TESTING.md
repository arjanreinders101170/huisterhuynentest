# TESTING — Productiehardening PR

> Stap-voor-stap verificatie van de hardening-PR. Houdt ~30 min als je het lineair doorloopt.

## 0. Voordat je begint

Deze PR raakt: database-schema, admin-auth, payment-webhook, deur-API, alle gast-flows en security-headers. **Test op een staging-omgeving**, niet rechtstreeks op productie.

### Wat je nodig hebt

- Toegang tot een **staging Supabase** project (kopie van productie, of throwaway)
- Een Mollie test-account (of de bestaande met test-API-key)
- Een Resend account met geverifieerd domein voor staging
- Lokaal: Node 20+, npm, `tsx` (zit in deps)
- Optioneel maar aanbevolen: een Vercel KV instance voor cross-instance rate-limit-test

### Eenmalige setup

```bash
git fetch origin
git checkout hardening/productiehardening
npm install
cp .env.local.example .env.local
# vul .env.local met staging-secrets
```

---

## 1. Database-migratie toepassen (verplicht eerst)

**Zonder deze stap crasht alles.** De migratie voegt nieuwe kolommen en tabellen toe.

```bash
# Open Supabase SQL editor (staging) en plak de inhoud van:
cat migrations/2026_05_08_productiehardening.sql
# Run het bestand. Verwacht: 0 errors.
```

**Verifieer in Supabase:**
- Tabellen `admin_sessions`, `audit_log`, `mollie_webhook_events` bestaan
- `bookings`, `reviews`, `terugkeer_aanvragen`, `invoices` hebben kolom `lodge text`
- `stays` heeft kolom `expires_at timestamptz`
- `terugkeer_aanvragen` heeft kolom `confirm_token_expires_at timestamptz`

---

## 2. Env-vars zetten

In `.env.local` (en later in Vercel staging):

```
# Bestaand — niets veranderen
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
MOLLIE_API_KEY=test_...
ADMIN_SECRET=<roteer naar nieuwe waarde — oude is historisch via cookie gelekt>
EBOEKHOUDEN_API_TOKEN=...
NEXT_PUBLIC_APP_URL=...
OPENAI_API_KEY=...

# Nieuw — verplicht voor live Nuki
NUKI_API_KEY=...
NUKI_SMARTLOCK_ID_LODGE_1=...
NUKI_SMARTLOCK_ID_LODGE_2=...
# (oude NUKI_SMARTLOCK_ID werkt nog als fallback met deprecation-warning)

# Nieuw — optioneel
MOLLIE_WEBHOOK_SECRET=          # configureer in Mollie dashboard om HMAC-signing aan te zetten
KV_REST_API_URL=                # Vercel KV — zonder draait rate-limit in-memory per instance
KV_REST_API_TOKEN=
```

---

## 3. Smoke-tests (geautomatiseerd, ~3 min)

```bash
# Start de dev server in een aparte terminal
npm run dev

# In je hoofdterminal:
npx tsx scripts/verify-sessions.ts
# Verwacht: "OK" — sessie create/get/revoke roundtrip slaagt

npx tsx scripts/verify-ratelimit.ts
# Verwacht: "OK" — 4e call van 4 met limit=3 returnt ok=false

npx tsx scripts/verify-mollie-idempotency.ts
# Verwacht: drie webhook-replays leiden tot 1 booking-update + 1 invoice + 1 event-rij
# Als script faalt met "missing env": skip — vereist test-Mollie webhook-secret en booking-fixture

npx tsx scripts/verify-nuki-lodge-binding.ts
# Verwacht: instructie-output met curl-commando's voor handmatige verificatie
```

---

## 4. Handmatige flow-tests (~20 min)

### 4.1 Admin auth + audit (Agent D)

| # | Stap | Verwacht |
|---|---|---|
| a | Open `http://localhost:3000/admin` zonder cookie | Redirect naar `/admin/login` |
| b | Login met fout wachtwoord 6× achter elkaar | Vanaf 6e: `429 Too Many Requests` |
| c | Login met juist wachtwoord | Cookie `hth-admin-session-v2` in DevTools (httpOnly, SameSite=Strict). **Niet** `hth-admin-session`. Waarde is geen `ADMIN_SECRET` maar 64-char hex. |
| d | Check Supabase tabel `admin_sessions` | Eén nieuwe rij met die session-id, `expires_at` ~7 dagen vooruit, `revoked_at IS NULL` |
| e | Maak een product aan via Producten-tab | Product verschijnt; check `audit_log` tabel: rij met `action='create_product'`, juiste `actor_session_id` |
| f | Ga naar nieuw "Audit"-tab in backoffice | Toont laatste audit-entries met timestamp, action, resource_type, IP |
| g | Klik **Logout**-knop (rechtsboven) | Redirect naar `/admin/login`. Check Supabase: `admin_sessions.revoked_at` is gevuld |
| h | Probeer terug naar `/admin` met oude cookie (DevTools) | Redirect naar login — sessie is gerevoceerd |

### 4.2 Multi-lodge filtering (Agent D + E)

| # | Stap | Verwacht |
|---|---|---|
| a | In backoffice: switch tussen tabs **Lodge 1** en **Lodge 2** | Stays/bookings/reviews/aanvragen filteren server-side per lodge |
| b | Tab **Alle** | Toont beide lodges + eventuele legacy-rijen met `lodge IS NULL` |
| c | Maak verblijf met expliciete lodge_1 keuze | Stay heeft `lodge='lodge_1'`, welkomstmail bevat correcte deurcode/wifi |

### 4.3 Gast-flow met lodge-propagation (Agent E)

| # | Stap | Verwacht |
|---|---|---|
| a | Vraag terugkomst aan via `/` (Terugkomen-formulier) | E-mail naar host. Link bevat `?lodgeHint=` (alleen hint) |
| b | Open de host-link `/offerte?...`, **zonder lodge te kiezen** | Submit faalt — lodge-selector is verplicht (Agent E) |
| c | Kies Lodge 1, vul prijzen, verstuur | E-mail naar gast met `/bevestig?id=...&t=...` |
| d | Wacht **15 dagen** OF zet `confirm_token_expires_at` in DB op `now() - 1 day` | GET `/bevestig?...` → **410 Gone** |
| e | Met geldige token: bevestig | `bookings`-rij ontstaat met `lodge='lodge_1'` |
| f | Bevestig nogmaals (refresh of curl) | **409 Conflict** — atomic UPDATE WHERE status='offerte_verstuurd' weigert tweede keer |

### 4.4 Mollie idempotency (Agent B)

| # | Stap | Verwacht |
|---|---|---|
| a | Doe een test-betaling van €0,01 via Mollie test-modus | Booking gaat naar `betaald`, e-mail komt, invoice wordt gemaakt, e-Boekhouden push (als token gezet) |
| b | Check `mollie_webhook_events` tabel | Eén rij met juist `payment_id`, `payment_status='paid'`, `signature_valid=true` (of `false` zonder secret), `processed=true` |
| c | Replay webhook (`curl -X POST` met dezelfde `id=...`) | 200 OK, **geen** tweede e-mail, **geen** tweede invoice. `mollie_webhook_events` heeft nog steeds 1 rij voor (paymentId, paid) |
| d | Met `MOLLIE_WEBHOOK_SECRET` gezet: replay zonder Authorization-header | Event-row krijgt `signature_valid=false`, status booking onveranderd |

### 4.5 Nuki per-lodge (Agent C)

| # | Stap | Verwacht |
|---|---|---|
| a | `curl -X POST http://localhost:3000/api/nuki/unlock` (geen body) | **400 Bad Request** (zod-validation) |
| b | `curl -X POST -d '{"token":"nonsense"}' -H 'Content-Type: application/json' /api/nuki/unlock` | **401 Unauthorized** |
| c | Maak een stay aan in lodge_1, kopieer `stay.token` | — |
| d | POST met die token | Demo-log: `{"event":"nuki_unlock_demo","lodge":"lodge_1","smartlockId":"***xxxx"}` (laatste 4 chars zichtbaar) |
| e | Idem voor lodge_2 stay | Demo-log toont `lodge_2` |
| f | Zet `stays.expires_at = now() - 1 day` voor een stay, POST | **401** (token expired via getLodgeFromStayToken) |
| g | `curl /api/stay?token=X` 11× in 1 minuut | 11e response: **429 Too Many Requests** met `Retry-After` header |

### 4.6 CORS + headers (Agent E)

```bash
curl -I -X OPTIONS http://localhost:3000/api/chat \
  -H "Origin: https://evil.example"
```
Verwacht: `Access-Control-Allow-Origin: https://www.huisterhuynen.nl` (NIET `*`).

Op staging-deploy:
```bash
curl -I https://<staging-url>
```
Verwacht headers: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `Content-Security-Policy-Report-Only: ...`, `X-Frame-Options: DENY`.

### 4.7 PII-scrub (Agent E)

```bash
# Maak een booking via /api/booking
# Check Vercel logs (of stdout van npm run dev)
```
Verwacht: log-regel `{"event":"booking_created","bookingId":"...","lodge":"lodge_1"}`. **Geen** gastNaam of gastEmail in logs.

---

## 5. Regressie-tests

Ga deze 'happy paths' nog een keer door om te checken dat niets brak:

- [ ] Homepage `/` laadt en toont reviews
- [ ] Lodge-detailpagina toont alleen reviews voor die lodge
- [ ] Reservering via `/` met test-mode Mollie werkt end-to-end
- [ ] Welkomstmail komt aan, link naar `/welkom?token=...` werkt, deurcode + wifi tonen
- [ ] Chatbot met fallback (zonder OpenAI key) geeft hardcoded antwoord
- [ ] `/landing` (recente nieuwe pagina van origin/main) laadt zonder errors

---

## 6. Bekende beperkingen

- **`@vercel/kv@3` is door Vercel gedeprecateerd** ten faveure van Upstash Redis. API is compatibel, geen runtime-impact. Migreren in volgende iteratie.
- **`/offerte` ADMIN_SECRET-in-URL** blijft bestaan — die route ligt buiten `/admin/*` middleware. Toekomstige iteratie: achter Agent D's nieuwe sessielaag plaatsen. Out-of-scope voor deze PR.
- **CSP staat in Report-Only** — observe een week voordat je naar enforcing CSP gaat.
- **Audit-log groeit ongelimiteerd** — retention-policy is een volgende stap.
- **Backfill van `lodge`** voor bestaande bookings/reviews/aanvragen is best-effort via `guests.id → meest recente stays.lodge`. Rijen zonder bijbehorende stay blijven `lodge IS NULL` ("legacy") en zijn alleen zichtbaar in backoffice tab "Alle".

---

## 7. Rollback

Als iets misgaat:

```bash
# 1. Code rollback
git revert <merge-commit-hash>
git push

# 2. SQL-rollback (handmatig in Supabase)
DROP TABLE mollie_webhook_events, audit_log, admin_sessions;
ALTER TABLE bookings DROP COLUMN lodge;
ALTER TABLE reviews DROP COLUMN lodge;
ALTER TABLE terugkeer_aanvragen DROP COLUMN lodge, DROP COLUMN confirm_token_expires_at;
ALTER TABLE invoices DROP COLUMN lodge, DROP CONSTRAINT uq_invoice_booking, DROP CONSTRAINT uq_invoice_number;
ALTER TABLE stays DROP COLUMN expires_at;
```

> Belangrijk: bij rollback **vóór** code-revert eerst de SQL-rollback doen — anders crasht de oude code op ontbrekende kolommen.

---

## Vragen?

Zie `/Users/dannyreinders/.claude/plans/maak-een-plan-om-melodic-lemur.md` voor de volledige plan-rationale en architectuurkeuzes (Vercel KV, admin_sessions DB-table, string-enum lodge model).

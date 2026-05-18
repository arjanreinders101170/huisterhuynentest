# Meta Pixel + Conversions API — Setup & Operations

Operationele documentatie voor de tracking-stack van Huis ter Huynen.
Voor architectuur-design en code-uitleg: zie PR #107.

---

## Identifiers

| Type | Waarde |
|---|---|
| Pixel ID / Dataset ID | `1331525698872313` |
| App ID (Meta App) | `1356830803006991` (`huisterhuynen-capi`) |
| System User ID | `61589827566686` (`Conversions API System User`) |
| Business Portfolio | `Arjan Reinders` |
| Bedrijfsmiddel (Ad Account) | `1416116725306583` |

---

## Environment variables

In Vercel → Settings → Environment Variables. Markeer alle 3 environments
behalve waar anders aangegeven.

| Variabele | Waarde | Environments | Bron |
|---|---|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | `1331525698872313` | Prod + Preview + Dev | Events Manager → Pixel Settings |
| `META_CAPI_ACCESS_TOKEN` | `EAA…` (System User token) | Prod + Preview | Business Settings → System Users → `Conversions API System User` → Generate Token |
| `META_CAPI_TEST_EVENT_CODE` | leeg in productie | Preview only (optioneel) | Events Manager → Test Events tab |
| `NEXT_PUBLIC_GTM_ID` | `GTM-XXXXXXX` | Prod + Preview + Dev | tagmanager.google.com → Container Settings |
| `NEXT_PUBLIC_SGTM_URL` | leeg (toekomstig) | — | sGTM op subdomein (Cloud Run/Stape) |
| `NEXT_PUBLIC_CONSENT_VERSION` | `2026.05` | Prod + Preview + Dev | Bump om herinstemming af te dwingen |

**Belangrijk:** wijzigingen aan env vars vereisen altijd een **redeploy
zonder build cache** voordat ze actief worden.

---

## Architectuur in één plaatje

```
┌─────────── BROWSER ──────────────────────────────────────────────┐
│                                                                  │
│  Next.js  ──push──▶  window.dataLayer  ──▶  GTM web container   │
│      │                                          │                │
│      │                                          ▼                │
│      │                                     Meta Pixel tag        │
│      │                                     (fbq met eventID)     │
│      │                                                           │
│      │   fetch /api/meta/capi (consent-gated)                    │
└──────┼───────────────────────────────────────────────────────────┘
       │
       ▼
┌──── NEXT.JS (Vercel, fra1) ──────────────────────────────────────┐
│                                                                  │
│  /api/meta/capi          ──┐                                     │
│  /api/mollie/webhook     ──┼──▶  sendCapi()  ──▶  Meta Graph API│
│  (Purchase server event)   ┘                       graph.facebook│
└──────────────────────────────────────────────────────────────────┘
```

Twee onafhankelijke transportlanen. Browser- en server-events delen één
`event_id` (UUID v4, gegenereerd client-side) → Meta dedupliceert.

---

## Events catalogus

11 events gemapt op Meta standard names waar mogelijk.

| Code | Meta naam | Trigger | Bron file |
|---|---|---|---|
| `PageView` | PageView | Route change | `RouteChangePixel.tsx` |
| `ViewContent` | ViewContent | Lodge selectie | `BookingCalendar.tsx` |
| `LodgeView` | LodgeView (custom) | Lodge tab switch | `BookingCalendar.tsx` |
| `AvailabilityCheck` | AvailabilityCheck (custom) | Geldige datumrange | `BookingCalendar.tsx` |
| `InitiateCheckout` | InitiateCheckout | "Reserveer" submit | `BookingCalendar.tsx` |
| `Lead` | Lead | Reservering succes | `BookingCalendar.tsx` |
| `Purchase` | Purchase | Mollie webhook `paid` | `mollie/webhook/route.ts` |
| `Contact` | Contact | WhatsApp/tel/mailto klik | `TrackingListeners.tsx` |
| `BookingComRedirect` | BookingComRedirect (custom) | Outbound booking.com | `TrackingListeners.tsx` |
| `Subscribe` | Subscribe | Newsletter submit | `NewsletterForm.tsx` |

Voor exacte payload-structuur per event: zie `src/lib/tracking/types.ts`
en `src/lib/tracking/dataLayer.ts`.

---

## Deduplicatie

Werkt op `event_name + event_id + pixel_id` binnen 48 uur.

- Browser Pixel: `fbq('track', X, {...}, { eventID: 'uuid' })`
- Server CAPI: `data[].event_id = 'uuid'` (dezelfde)

Voor Purchase: `event_id` wordt gegenereerd bij `InitiateCheckout` en
meegegeven aan `/api/reservering` en `/api/checkout` als
`_meta.event_id` → opgeslagen in DB (`booking_requests.meta_event_id`
of `bookings.metadata.meta_event_id`) → Mollie webhook leest het terug
en stuurt hetzelfde ID mee bij de Purchase CAPI-call.

---

## Consent (GDPR + TTDSG)

- **State storage:** `localStorage.hth-consent-v2`
- **Versie bumping:** verhoog `NEXT_PUBLIC_CONSENT_VERSION` → alle bezoekers krijgen banner opnieuw
- **Categorieën:** functional (locked), statistics, marketing
- **Default state:** alles op `denied` (Consent Mode v2)
- **Banner heropenen:** dispatch `window.dispatchEvent(new Event("hth:open-consent"))`
- **CAPI gate:** `/api/meta/capi` weigert events als `consent_snapshot.marketing === false`

Purchase event vanuit Mollie webhook is **niet consent-gated** — dat is
een legitieme transactie-record en valt onder uitvoering-van-overeenkomst
(art. 6 lid 1 sub b AVG).

---

## Token rotatie

System User token is **onbeperkt geldig** maar moet **gerouleerd** worden bij:

- Vermoeden van lek
- Personeelswisseling (al heeft een System User geen eigenaar, audit-discipline)
- Jaarlijks (best practice)

### Procedure

1. Business Settings → Gebruikers → Systeemgebruikers → `Conversions API System User`
2. **Token genereren** → kies opnieuw `huisterhuynen-capi` app, scopes `ads_management` + `business_management`, vervalt `Nooit`
3. Kopieer nieuw token → Vercel env var `META_CAPI_ACCESS_TOKEN` overschrijven
4. **Redeploy zonder cache**
5. Verifieer in Vercel logs dat `[CAPI] skipped` níet meer verschijnt
6. **Tokens intrekken** in dezelfde UI → revoke alle oude tokens

---

## Diagnose & monitoring

### Events komen niet binnen?

1. **Vercel logs filter `[CAPI]`** — zoek `skipped` (env vars niet geladen), `error 401` (token), `error 400` (payload)
2. **External APIs tab** in een specifieke log-entry — zie of `graph.facebook.com/.../events` is aangeroepen
3. **Events Manager → Diagnostische gegevens** tab — toont per event-type ontvangsten en waarschuwingen
4. **Test Event Code activeren** voor real-time verificatie zonder 30 min latency
5. **Curl-test** rechtstreeks tegen Graph API:

```bash
curl -X POST "https://graph.facebook.com/v20.0/1331525698872313/events?access_token=<TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"data":[{"event_name":"Test","event_time":'"$(date +%s)"',"event_id":"manual-001","event_source_url":"https://www.huisterhuynen.nl/","action_source":"website","user_data":{"client_ip_address":"1.2.3.4","client_user_agent":"Mozilla/5.0"}}]}'
```

Verwacht antwoord: `{"events_received":1, ...}`

### Match Quality verbeteren

Doel: Purchase ≥ 8/10, Lead ≥ 7/10.

| Quick win | Hoe |
|---|---|
| `_fbp` cookie meesturen | Activeer GTM browser Pixel — cookie wordt automatisch gezet |
| IP/UA bij Purchase | In `/api/checkout` opslaan in `bookings.metadata.ip` + `.ua`, in webhook ophalen |
| Phone number | Veld toevoegen aan booking calendar form, doorzetten naar reservering schema |
| City/postal | Eventueel uit IP-geolocatie afleiden in `/api/meta/capi` |

---

## File structure

```
src/
├── lib/tracking/
│   ├── consent.ts        State machine + Consent Mode v2 default-deny snippet
│   ├── dataLayer.ts      Client-side push helpers, event_id generator
│   ├── types.ts          Canonical event shapes
│   ├── hash.ts           SHA-256 PII normalizer (server-only)
│   └── capi.ts           Meta Graph API client (server-only)
├── components/tracking/
│   ├── GTM.tsx           GTM loader + Consent Mode default-deny
│   ├── ConsentBanner.tsx 2-laags banner NL/DE
│   ├── RouteChangePixel.tsx  PageView on route change
│   └── TrackingListeners.tsx Global click delegation
└── app/api/meta/capi/
    └── route.ts          Browser → CAPI mirror endpoint

migrations/
└── 2026_05_17_meta_capi_tracking.sql  booking_requests tracking cols
```

---

## Audiences (toekomstig)

Volgorde van opbouwen zodra ~50 Purchase events binnen zijn:

| Audience | Bron | Window | Doel |
|---|---|---|---|
| WEB · Lodge viewers 60d | ViewContent | 60d | Retargeting |
| WEB · Started booking 7d | InitiateCheckout zonder Purchase | 7d | Cart abandonment |
| CON · Bookers 365d | Purchase | 365d | Suppressie + LAL bron |
| LAL 1% NL · Bookers | LAL van bovenstaand | — | Cold acquisition NL |
| LAL 1-3% DE · Bookers | LAL van bovenstaand | — | Cold acquisition DE |

---

## Verwijzingen

- **Branch waar de stack op gebouwd is:** `claude/meta-pixel-conversions-api-FwHsR`
- **Merge PR:** #107
- **Meta CAPI docs:** https://developers.facebook.com/docs/marketing-api/conversions-api
- **Consent Mode v2 docs:** https://developers.google.com/tag-platform/security/guides/consent

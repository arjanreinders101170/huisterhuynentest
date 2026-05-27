# Huis ter Huynen — Complete To Do Lijst
**Bijgewerkt: 27 mei 2026**

---

## Afgerond ✅

| # | Item | Status |
|---|------|--------|
| 1 | Resend email (domein + templates) | ✅ |
| 2 | OpenAI chatbot (code klaar) | ✅ Wacht op tegoed |
| 3 | Supabase database (4 tabellen) | ✅ |
| 4 | Email templates (premium, table-based) | ✅ |
| 5 | Offerte flow (aanvraag → offerte → bevestiging) | ✅ |
| 6 | Gast-bevestigingsmail (dual email) | ✅ |
| 7 | Lodge control drawer (HA mockup, demo) | ✅ Wacht op NUC |
| 8 | Security: CORS dichttrekken | ✅ |
| 9 | Security: Offerte-route beveiligd (ADMIN_SECRET) | ✅ |
| 10 | Security: HTML-escaping in emails | ✅ |
| 11 | Security: .gitignore aangescherpt + zip bestanden | ✅ |

---

## Open — Integraties

| # | Item | Prioriteit | Toelichting |
|---|------|-----------|-------------|
| 12 | OpenAI tegoed opladen | Hoog | Creditcard toevoegen op platform.openai.com |
| 13 | Mollie iDEAL | Hoog | Account aanmaken, test-key instellen, webhook bouwen |
| 14 | Nuki deur | Middel | Wacht op beslissing: hoe opent gast de deur? |
| 15 | Picnic | Laag | Beslissing: schrappen of behouden? Risico met persoonlijk account |

---

## Open — Security (uit audit)

### Vóór go-live met echte gasten

| # | Finding | Prioriteit | Toelichting |
|---|---------|-----------|-------------|
| 16 | F-01: Nuki auth | Kritiek (zodra live) | Token-based access per verblijf, rate limit |
| 17 | F-03: Bevestig-flow tokenizen | Hoog | Per-aanvraag HMAC confirm_token op bevestig-link |
| 18 | F-04: Mollie webhook + server-side prijzen | Hoog | Server bepaalt prijs, webhook bevestigt betaling |
| 19 | F-05: Supabase service-role opsplitsen | Hoog | Aparte anon-key client voor publieke routes |
| 20 | F-07: Rate limiting | Hoog | Vercel Edge Middleware + Upstash, per route limits |
| 21 | F-09: Input validatie (zod schemas) | Hoog | Product enum, prijs whitelist, metadata strict |

### Binnen 30 dagen

| # | Finding | Prioriteit | Toelichting |
|---|---------|-----------|-------------|
| 22 | F-10: Picnic feature beslissing | Middel | Schrappen of achter admin-auth |
| 23 | F-11: PII uit server logs | Middel | Alleen IDs loggen, geen namen/emails |
| 24 | F-12: Security headers (CSP, HSTS) | Middel | Toevoegen in vercel.json of next.config |
| 25 | F-13: npm audit dependencies | Middel | Wacht op upstream patches, geen --force |
| 26 | F-14: Reviews moderatie + captcha | Middel | zichtbaar default false + Turnstile |
| 27 | F-15: Bevestig race condition | Middel | Atomair UPDATE WHERE status != 'geboekt' |
| 28 | F-16: Wifi/PIN rotatie per verblijf | Middel | Wacht op HA integratie |
| 29 | F-17: .gitignore .env patronen | Laag | ✅ Gedaan |
| 30 | F-18: OWNER_EMAIL naar env var | Laag | process.env.OWNER_EMAIL |
| 31 | F-19: Zip bestanden uit repo | Laag | git rm + history cleanup |
| 32 | F-20: Mollie URL validatie | Laag | Check checkoutUrl begint met mollie.com |
| 33 | F-21: Tests + CI opzetten | Laag | next lint + tsc --noEmit in GitHub Actions |

---

## Open — Home Assistant

| # | Item | Prioriteit | Toelichting |
|---|------|-----------|-------------|
| 34 | NUC hardware aanschaffen | Wacht op Arjan | i3/N100, 8GB, 256GB SSD + UPS |
| 35 | HA installeren + basis integraties | Na NUC | Hue, airco, laadpaal |
| 36 | Cloudflare tunnel setup | Na NUC | ha.huisterhuynen.nl, zero trust |
| 37 | Lodge control → echte HA API calls | Na tunnel | Vervang demo-state door echte commands |
| 38 | Magic link auth (gast-sessies) | Na HA live | Token per verblijf, tijdsgebonden |
| 39 | Automations (afwezig/comfort/nacht) | Na basis | Modi koppelen aan HA scenes |
| 40 | Lodge 2 devices koppelen | Na lodge 1 | Naming conventie lodge_2_* |
| 41 | Load balancing (laadpaal vs airco) | Later | Pas bij piekbelasting |

---

## Open — Backoffice (web dashboard)

| # | Item | Prioriteit | Toelichting |
|---|------|-----------|-------------|
| 42 | Admin login (wachtwoord of magic link) | Hoog | Voorwaarde voor alles hieronder |
| 43 | Dashboard: openstaande boekingen | Hoog | Lijst met status nieuw/bevestigd/betaald |
| 44 | Dashboard: terugkeer-aanvragen + offerte status | Hoog | nieuw → offerte_verstuurd → geboekt |
| 45 | Dashboard: reviews modereren | Middel | Tonen/verbergen toggle |
| 46 | Dashboard: gastlijst | Middel | Naam, email, profiel, laatste bezoek |
| 47 | Gast aanmaken + magic link versturen | Na HA | Verblijf + token + email in één actie |
| 48 | Multi-lodge overzicht | Na lodge 2 | Beide lodges naast elkaar |
| 49 | Device status per lodge | Na HA | Online/offline, temperatuur, laadpaal |
| 50 | Presets: "Gereed voor gast" / "Afwezig" | Na HA | Eén-klik lodge modes |
| 51 | Energie dashboard (eigenaar) | Later | Verbruik per lodge per dag |
| 52 | Financieel overzicht | Later | Boekingen, omzet, conversie |

---

## Open — App verbeteringen

| # | Item | Prioriteit | Toelichting |
|---|------|-----------|-------------|
| 53 | Cookie consent banner | Laag | Functioneel alleen, transparantie-banner |
| 54 | Seizoenslogica (content per seizoen) | Middel | Automatisch andere tips dec-feb vs jun-aug |
| 55 | "Onze tip" labels op top-items | Laag | Persoonlijke gastheer-aanbeveling per item |
| 56 | Follow-up email 2 weken na vertrek | Middel | Review + terugkomen CTA |
| 57 | Gastherkenning bij terugkeer | Laag | "Welkom terug" als zelfde email terugkomt |

---

## Open — Marketing & Vindbaarheid (Pre-opening)

| # | Item | Wanneer | Toelichting |
|---|------|---------|-------------|
| 58 | ✅ Google Business Profile aangemaakt | Gedaan | Openingsdatum + foto's; grootste impact lokale vindbaarheid |
| 59 | VVV Drenthe aanmelden | Nu | Gratis plaatsing via `vvvdrenthe.nl/aanbieders` |
| 60 | Visit Drenthe aanmelden | Nu | Officieel provinciaal toerisme — contact opnemen voor gratis vermelding |
| 61 | Tripadvisor basisprofiel aanmaken | Nu | Gratis, reviews worden er al op gezocht |
| 62 | Natuurhuisje.nl profiel aanmaken | Oktober/november 2026 | Exacte doelgroep (natuur, rust) — ±15% commissie, gratis listing |
| 63 | Airbnb profiel aanmaken | Oktober/november 2026 | Internationaal bereik, koppels/gezinnen |
| 64 | Persbericht opstellen + versturen | November 2026 | Naar Dagblad van het Noorden, RTV Drenthe, Asser Courant bij opening |
| 65 | ANWB verblijfsaccommodatie aanmelden | November 2026 | Gratis vermelding via `anwb.nl/campings/inschrijven` |
| 66 | Wandel-/fietswebsites benaderen voor vermelding | Voor opening | `wandelknooppunt.nl`, `fietsknooppunt.nl` — lodge als uitvalsbasis |
| 67 | 1–2 reisbloggers uitnodigen (ruil: gratis nacht) | Na opening | Backlink + bereik via travel blogs — zoek op "Drenthe reisblog" |
| 68 | Pinterest account aanmaken | Voor opening | Pinboards met Drenthe-foto's → verkeer naar blog |
| 69 | ✅ Schema markup gecontroleerd & uitgebreid | Gedaan | FAQPage + BreadcrumbList + LodgingBusiness + BlogPosting + landing-schemas live |

---

## Openstaande beslissingen (voor Arjan)

| # | Vraag | Impact |
|---|-------|--------|
| A | Hoe opent een gast de deur? (code, app-knop, Nuki invite) | Bepaalt hele auth-mechanisme |
| B | Welke producten via Mollie afrekenen vs "op aanvraag"? | Bepaalt checkout-architectuur |
| C | Picnic: behouden of schrappen? | Risico met persoonlijk account |
| D | Host-login: Google, magic link, of wachtwoord? | Bepaalt backoffice auth |
| E | Wifi/deurcode: vast of roterend per verblijf? | Bepaalt security-aanpak |
| F | AI chat: tekst-only of uitbreiden naar spraak? | Bepaalt kosten + architectuur |
| G | Backoffice: apart domein (admin.huisterhuynen.nl)? | Bepaalt routing-structuur |

---

## Open — Tracking & integraties (18 mei 2026)

| # | Item | Prioriteit | Toelichting |
|---|------|-----------|-------------|
| 70 | e-Boekhouden relation error oplossen | Middel | Mollie webhook logt `e-Boekhouden relation error: Error: e-Boekhouden API...` (zichtbaar in Vercel logs, voor het eerst opgevangen tijdens Mollie test-purchase 18 mei). Niet blocking voor CAPI of bevestigingsmails — wél voor automatisch doorboeken van facturen. Check `EBOEKHOUDEN_API_TOKEN` env var, mogelijk verlopen of mist scope. |

---

## SEO, Content & CRO — sprint mei 2026

### Afgerond ✅
| # | Item | Status |
|---|------|--------|
| 71 | Volledige SEO/CRO-audit + 12-maanden uitvoeringsplan (`seo-cro-uitvoeringsplan.md`) | ✅ |
| 72 | Quick wins: keyword-H1 homepage · nep-reviews verwijderd (eerlijke pre-opening tekst) · www-canonical geconsolideerd · self-assigned `starRating` verwijderd · duplicaat-afbeelding weg | ✅ |
| 73 | 7 SEO-landingspagina's live: hottub · luxe lodge · romantisch weekend · wellness · Assen · Norg · Veenhuizen | ✅ |
| 74 | Landingspagina's database-gedreven + beheerbaar in admin (tab "Landingspagina's", secties-repeater, FAQ, SEO-velden) | ✅ |
| 75 | GA4 directe integratie (opt-in via `NEXT_PUBLIC_GA4_ID`, consent-gated, events → generate_lead/begin_checkout/newsletter_subscribe/purchase) | ✅ code |
| 76 | Sticky mobiele CTA (Bekijk beschikbaarheid + WhatsApp) | ✅ PR #135 |
| 77 | Interne links naar landingspagina's in footers (homepage + landingpagina's) | ✅ PR #135 |
| 78 | Google Search Console: domein-property + sitemap ingediend + indexering aangevraagd | ✅ |

### Open — met prioriteit
| # | Item | Prioriteit | Toelichting |
|---|------|-----------|-------------|
| 79 | **Interieurfoto's lodges** (woonkamer, hottub, badkamer, slaapkamer) maken + op site verwerken | **Hoog** | Grootste resterende conversie-blokker voor de luxe-positionering. Optie A: JPG's aanleveren in `public/`, ik verwerk ze. Optie B: galerij-veld in de admin zodat je ze zelf toevoegt |
| 80 | PR #135 mergen (sticky CTA + footer-links) | Hoog | Operationeel — daarna staan de interne links live |
| 81 | GA4 activeren: `NEXT_PUBLIC_GA4_ID` in Vercel + events als sleutelgebeurtenis markeren | Hoog | Voorwaarde voor het dashboard |
| 82 | Looker Studio managementdashboard (Fase 6) | Middel | Pas zinvol na enkele dagen GA4-data |
| 83 | Resterende landingspagina's: `/lodge-de-heide` + `/lodge-de-eik` (Offer-schema €165) · natuur/activiteit (fietsen, wandelroutes, heide, zeijerstrubben, ballooerveld, dwingelderveld, hunebedden) · Duitse set | Middel | Nu eenvoudig via de admin toe te voegen |
| 84 | Blogcontent: 2 per week (104-onderwerpenplan uit `content-strategie.md` + uitvoeringsplan) | Hoog | Volume + autoriteit; instroom op informatieve zoektermen |
| 85 | Directory-listings: VVV Drenthe (#59), Visit Drenthe (#60), Tripadvisor (#61), ANWB (#65), wandel-/fietssites (#66) | Hoog | Backlinks + lokale autoriteit → versnelt indexering ("Gevonden – niet geïndexeerd") |
| 86 | Reviewvliegwiel: automatische review-verzoeken + `aggregateRating` tonen zodra ≥5 echte reviews | Middel | Sterren in de zoekresultaten |
| 87 | Bron-afbeeldingen comprimeren (<400 KB) voor Core Web Vitals | Laag | `lodge-eik.jpg`/`lodge-heide.jpg` originelen zijn ~3 MB |

### Top-prioriteiten nu (volgorde)
1. **Interieurfoto's** (#79) — directe conversiewinst.
2. **GA4 activeren** (#81) → daarna **Looker dashboard** (#82).
3. **Directory-listings** (#85) — versnelt de indexering die nu nog op "Gevonden – momenteel niet geïndexeerd" staat.
4. **Blogcontent starten** (#84).
5. **Resterende landingspagina's** (#83).

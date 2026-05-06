# Huis ter Huynen — Complete To Do Lijst
**Bijgewerkt: 7 mei 2026**

---

## Afgerond ✅

| # | Item | Status |
|---|------|--------|
| 1 | Resend email (domein + templates) | ✅ |
| 2 | OpenAI chatbot (code klaar) | ✅ Wacht op tegoed |
| 3 | Supabase database (guests, bookings, reviews, terugkeer_aanvragen, products, stays) | ✅ |
| 4 | Email templates (premium, table-based, gold accent) | ✅ |
| 5 | Offerte flow (aanvraag → offerte → bevestiging + confirm_token) | ✅ |
| 6 | Gast-bevestigingsmail (dual email) | ✅ |
| 7 | Lodge control drawer (HA mockup gast-app, demo) | ✅ |
| 8 | Mollie iDEAL (webhook + server-side pricing + producten uit DB) | ✅ |
| 9 | PDF factuur bijlage bij betalingen (BTW per product, logo) | ✅ |
| 10 | Backoffice: admin login + dashboard + 7 tabs | ✅ |
| 11 | Backoffice: producten beheer (CRUD + BTW %) | ✅ |
| 12 | Backoffice: verblijven (aanmaken + welkomstmail + bedankt-mail) | ✅ |
| 13 | Backoffice: Lodge 1 + Lodge 2 HA controls (demo) | ✅ |
| 14 | Backoffice: reviews modereren (toon/verberg) | ✅ |
| 15 | Backoffice: admin.huisterhuynen.nl subdomain | ✅ |
| 16 | Security: CORS, offerte auth, HTML-escaping, .gitignore | ✅ |
| 17 | Security: F-01 t/m F-10 (9/10, F-01 wacht NUC) | ✅ |
| 18 | Security: Rate limiting (per route, in middleware) | ✅ |
| 19 | Security: Zod input validatie op alle POST routes | ✅ |
| 20 | Security: Supabase service-role/anon split | ✅ |
| 21 | Email polish: emoji → goud accent, bedankt-mail met heidefoto | ✅ |
| 22 | Seizoenslogica (data klaar) | ✅ |
| 23 | Follow-up email (14 dagen na vertrek) | ✅ |
| 24 | Picnic verwijderd | ✅ |

---

## Beslissingen genomen ✅

| Vraag | Beslissing |
|-------|-----------|
| Hoe opent gast de deur? | App-knop na magic link, niet voor 15:00, admin override |
| Producten via Mollie vs op aanvraag? | Welkomst + boodschappen + fiets → Mollie. Late checkout → op aanvraag |
| Picnic? | Geschrapt — link naar picnic.app |
| Host-login? | Wachtwoord via env var |
| Wifi/deurcode? | Roterend per verblijf, auto-gegenereerd |
| AI chat? | Tekst-only |
| Backoffice domein? | admin.huisterhuynen.nl |

---

## FASE 1 — App productieklaar (huidige fase)

### Open — Directe acties

| # | Item | Prioriteit | Wacht op |
|---|------|-----------|----------|
| 25 | OpenAI tegoed opladen | Hoog | Creditcard |
| 26 | App herkent gast-token uit welkomst-link | Hoog | Niets |
| 27 | Late checkout timing (avond voor vertrek) | Middel | Niets |
| 28 | Annuleringsmail template | Middel | Niets |
| 29 | Schoonmaakstatus per lodge (boolean in stays) | Middel | Niets |
| 30 | Hero-foto emails (6 foto's nodig) | Middel | Foto's van Arjan |
| 31 | KvK, BTW-nr, IBAN invullen in factuur template | Laag | Gegevens van Arjan |

### Open — Security (vóór go-live)

| # | Finding | Prioriteit |
|---|---------|-----------|
| 32 | F-11: PII uit server logs | Middel |
| 33 | F-12: Security headers (CSP, HSTS) | Middel |
| 34 | F-13: npm audit dependencies | Middel |
| 35 | F-14: Reviews moderatie + captcha | Middel |
| 36 | F-15: Bevestig race condition (atomair update) | Middel |
| 37 | F-18: OWNER_EMAIL naar env var | Laag |
| 38 | F-19: Zip bestanden uit repo history | Laag |
| 39 | F-20: Mollie URL validatie | Laag |
| 40 | F-21: Tests + CI opzetten | Laag |

---

## FASE 2 — Home Assistant & hardware (wacht op NUC)

| # | Item | Toelichting |
|---|------|-------------|
| 41 | NUC hardware aanschaffen | i3/N100, 8GB, 256GB SSD + UPS |
| 42 | HA installeren + basis integraties | Hue, airco, laadpaal |
| 43 | Cloudflare tunnel setup | ha.huisterhuynen.nl, zero trust |
| 44 | Lodge control → echte HA API calls | Vervang demo-state |
| 45 | HA integratie in backoffice | Lodge 1/2 → echte device controls |
| 46 | Nuki auth (F-01) | Token-based, niet voor 15:00, admin override |
| 47 | Nuki rollen | Gast / schoonmaak / beheerder |
| 48 | Magic link auth (gast-sessies) | Token per verblijf, tijdsgebonden |
| 49 | Automations (afwezig/comfort/nacht) | Modi koppelen aan HA scenes |
| 50 | Lodge 2 devices koppelen | Naming conventie lodge_2_* |
| 51 | Wifi/PIN rotatie per verblijf (F-16) | Automatisch bij check-out |
| 52 | Load balancing (laadpaal vs airco) | Pas bij piekbelasting |

---

## FASE 3 — Groei & retentie

| # | Item | Toelichting |
|---|------|-------------|
| 53 | Seizoensbrief (4x/jaar) | Email template + trigger in backoffice |
| 54 | Dag-na-vertrek mail (automatisch) | Warmte, geen CTA |
| 55 | Weer-gekoppelde fiets tip | Weather API + conditie op homepage |
| 56 | Gastherkenning bij terugkeer | "Welkom terug" bij zelfde email |
| 57 | "Onze tip" labels op top-items | Gastheer-aanbeveling |
| 58 | Cookie consent banner | Transparantie |
| 59 | Gast aanmaken + magic link via backoffice | Verblijf + token + email in één actie |
| 60 | Multi-lodge overzicht in backoffice | Beide lodges naast elkaar |
| 61 | Presets in backoffice: "Gereed voor gast" / "Afwezig" | Eén-klik lodge modes |
| 62 | Energie dashboard (eigenaar) | Verbruik per lodge per dag |
| 63 | Financieel overzicht | Boekingen, omzet, conversie |

---

## FASE 4 — Architectuur & opschaling (volgende fase)

*Pas bouwen als de app groeit voorbij 2 lodges of als er een tweede ontwikkelaar bij komt.*

| # | Item | Toelichting |
|---|------|-------------|
| 64 | Modulaire applicatiestructuur | Opdelen in services: accommodations, bookings, access_control, email_templates, invoice_service, nuki_integration |
| 65 | Database structureren voor meerdere locaties | `locations` tabel bovenop `lodges`, eigen domein per locatie |
| 66 | Fallback & retry mechanisme | Automatische retries bij mislukte API-calls, noodtoegang bij Nuki offline |
| 67 | Volledige audit trail | Logging van boekingen, toegang, emails, facturen, beheerder-wijzigingen |
| 68 | Testomgeving (dedicated) | Aparte dev environment, testsloten, fake boekingen |
| 69 | Meertaligheid (Engels) | Alle emails + app in NL + EN |
| 70 | Schoonmaakmeldingen | Automatisch na check-out, status in backoffice |
| 71 | Realtime dashboard | Live status van lodges, sloten, devices |
| 72 | Rollenbeheer backoffice | Admin / schoonmaak / onderhoud accounts |
| 73 | CI/CD pipeline | GitHub Actions: lint, typecheck, tests bij elke push |

---

## Hero-foto's nodig (6 stuks, 1200×400px JPG)

| Foto | Email | Status |
|------|-------|--------|
| Heide landschap | Bedankt-mail | ✅ heide3.jpg |
| Lodge aankomst | Welkomstmail | Wacht op foto |
| Bos/natuur | Follow-up mail | Wacht op foto |
| Lente | Seizoensbrief mrt | Wacht op foto |
| Zomer | Seizoensbrief jun | Wacht op foto |
| Herfst | Seizoensbrief sep | Wacht op foto |
| Winter | Seizoensbrief dec | Wacht op foto |

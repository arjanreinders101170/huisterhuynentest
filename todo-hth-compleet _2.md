# Huis ter Huynen — Complete To Do Lijst
**Bijgewerkt: 8 mei 2026**

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
| 25 | Landingspagina: omgevingssectie (wandelingen, Nationale Parken, seizoenen) | ✅ |
| 26 | Landingspagina: activiteitensectie (wandelen, fietsen, cultuur, wellness) | ✅ |
| 27 | Landingspagina: stats-strip met 4 kerncijfers (0 min / 15 min / 52 / 1000+) | ✅ |
| 28 | Landingspagina: DTP/UX — eyebrow labels, GoldRule, feature-chips, decoratieve quotes, heide-foto hero | ✅ |

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
| 29 | OpenAI tegoed opladen | Hoog | Creditcard |
| 30 | App herkent gast-token uit welkomst-link | Hoog | Niets |
| 31 | Late checkout timing (avond voor vertrek) | Middel | Niets |
| 32 | Annuleringsmail template | Middel | Niets |
| 33 | Schoonmaakstatus per lodge (boolean in stays) | Middel | Niets |
| 34 | Hero-foto emails (6 foto's nodig) | Middel | Foto's van Arjan |
| 35 | KvK, BTW-nr, IBAN invullen in factuur template | Laag | Gegevens van Arjan |

### Open — Security (vóór go-live)

| # | Finding | Prioriteit |
|---|---------|-----------|
| 36 | F-11: PII uit server logs | Middel |
| 37 | F-12: Security headers (CSP, HSTS) | Middel |
| 38 | F-13: npm audit dependencies | Middel |
| 39 | F-14: Reviews moderatie + captcha | Middel |
| 40 | F-15: Bevestig race condition (atomair update) | Middel |
| 41 | F-18: OWNER_EMAIL naar env var | Laag |
| 42 | F-19: Zip bestanden uit repo history | Laag |
| 43 | F-20: Mollie URL validatie | Laag |
| 44 | F-21: Tests + CI opzetten | Laag |

---

## FASE 2 — Home Assistant & hardware (wacht op NUC)

| # | Item | Toelichting |
|---|------|-------------|
| 45 | NUC hardware aanschaffen | i3/N100, 8GB, 256GB SSD + UPS |
| 46 | HA installeren + basis integraties | Hue, airco, laadpaal |
| 47 | Cloudflare tunnel setup | ha.huisterhuynen.nl, zero trust |
| 48 | Lodge control → echte HA API calls | Vervang demo-state |
| 49 | HA integratie in backoffice | Lodge 1/2 → echte device controls |
| 50 | Nuki auth (F-01) | Token-based, niet voor 15:00, admin override |
| 51 | Nuki rollen | Gast / schoonmaak / beheerder |
| 52 | Magic link auth (gast-sessies) | Token per verblijf, tijdsgebonden |
| 53 | Automations (afwezig/comfort/nacht) | Modi koppelen aan HA scenes |
| 54 | Lodge 2 devices koppelen | Naming conventie lodge_2_* |
| 55 | Wifi/PIN rotatie per verblijf (F-16) | Automatisch bij check-out |
| 56 | Load balancing (laadpaal vs airco) | Pas bij piekbelasting |

---

## FASE 3 — Groei & retentie

| # | Item | Toelichting |
|---|------|-------------|
| 57 | Seizoensbrief (4x/jaar) | Email template + trigger in backoffice |
| 58 | Dag-na-vertrek mail (automatisch) | Warmte, geen CTA |
| 59 | Weer-gekoppelde fiets tip | Weather API + conditie op homepage |
| 60 | Gastherkenning bij terugkeer | "Welkom terug" bij zelfde email |
| 61 | "Onze tip" labels op top-items (gast-app) | Gastheer-aanbeveling per categorie-item |
| 62 | Cookie consent banner | Transparantie |
| 63 | Gast aanmaken + magic link via backoffice | Verblijf + token + email in één actie |
| 64 | Multi-lodge overzicht in backoffice | Beide lodges naast elkaar |
| 65 | Presets in backoffice: "Gereed voor gast" / "Afwezig" | Eén-klik lodge modes |
| 66 | Energie dashboard (eigenaar) | Verbruik per lodge per dag |
| 67 | Financieel overzicht | Boekingen, omzet, conversie |

---

## FASE 4 — Architectuur & opschaling (volgende fase)

*Pas bouwen als de app groeit voorbij 2 lodges of als er een tweede ontwikkelaar bij komt.*

| # | Item | Toelichting |
|---|------|-------------|
| 68 | Modulaire applicatiestructuur | Opdelen in services: accommodations, bookings, access_control, email_templates, invoice_service, nuki_integration |
| 69 | Database structureren voor meerdere locaties | `locations` tabel bovenop `lodges`, eigen domein per locatie |
| 70 | Fallback & retry mechanisme | Automatische retries bij mislukte API-calls, noodtoegang bij Nuki offline |
| 71 | Volledige audit trail | Logging van boekingen, toegang, emails, facturen, beheerder-wijzigingen |
| 72 | Testomgeving (dedicated) | Aparte dev environment, testsloten, fake boekingen |
| 73 | Meertaligheid (Engels) | Alle emails + app in NL + EN |
| 74 | Schoonmaakmeldingen | Automatisch na check-out, status in backoffice |
| 75 | Realtime dashboard | Live status van lodges, sloten, devices |
| 76 | Rollenbeheer backoffice | Admin / schoonmaak / onderhoud accounts |
| 77 | CI/CD pipeline | GitHub Actions: lint, typecheck, tests bij elke push |

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

# European Reset Club — Landingpagina (eerste markup)

Front-end implementatie van het wireframe uit `European_Reset_Club_Strategie.pdf`.
Dit is een **zelfstandige, statische landingpagina** voor de validatiefase — geen build-stap nodig.

## Bekijken

Open `index.html` direct in de browser, of serveer lokaal:

```bash
npx serve landing/european-reset-club
# of
python3 -m http.server 8080 --directory landing/european-reset-club
```

## Wat zit erin (1-op-1 met het wireframe)

| Sectie | Geïmplementeerd |
|--------|-----------------|
| Sticky nav met single-action CTA | ✓ |
| Hero (Concept B/C hybrid: emotie + Club-frame) | ✓ |
| Sociale bewijsbalk ("als gezien in" + wachtlijstteller) | ✓ |
| Pijnsectie (6 herkenningskaarten + quote) | ✓ |
| Oplossing (4 features, benefit-framing) | ✓ |
| Hoe werkt het (3 stappen) | ✓ |
| Voor wie / niet voor wie (kwalificatie) | ✓ |
| Bestemmingen (6 cards) | ✓ |
| Testimonials (eerlijk gelabeld, validatiefase) | ✓ |
| FAQ (accordeon, 6 SEO-vragen) | ✓ |
| Leadformulier (3 velden + segmentatie-radio) | ✓ |
| Exit-intent modal (lead magnet) | ✓ |
| Footer | ✓ |

## Techniek
- Semantische HTML5, mobile-first responsive, WCAG-vriendelijk (focus states, `prefers-reduced-motion`).
- SEO-metadata + Open Graph uit het strategiedocument.
- Lichte vanilla JS: sticky nav, scroll-reveal, teller-animatie, formulier-succesflow, exit-intent.
- Geen externe dependencies behalve Google Fonts (Fraunces + Inter).

## Placeholders / nog in te vullen
- **Hero-foto**: nu gelaagde gradient-sfeer als placeholder — vervang door cinematische foto (olijfgaard/infinity pool, gouden uur).
- **Bestemmingsfoto's**: nu kleurgradients — vervang `.d1`–`.d6` `::before` door echte foto's.
- **Media-logo's**: tekstplaceholders tot er echte coverage/gastblogs zijn.
- **Formulier-endpoint**: `leadForm`/`modalForm` loggen nu alleen succes — koppel aan Mailchimp/Brevo/Supabase.

## A/B varianten (uit strategie)
Voor de drie te testen concepten dupliceer je deze pagina en pas je alleen hero `eyebrow`, `h1` en hero-CTA aan:
- `/club` — European Reset Club (huidige controle)
- `/start` — Workation Matchmaker
- `/reset` — Wellness & Reset Coach

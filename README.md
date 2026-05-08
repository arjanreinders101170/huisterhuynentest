# Huis ter Huynen – Boutique Lodge App

Premium digitale guest experience PWA voor Huis ter Huynen in Zeijen, Drenthe.

## Wat zit erin?

- **Homepage** – Welkomstscherm, 6 categorieën, populair vandaag, info-balk
- **Mijn Verblijf** – Nuki smart lock integratie, wifi, parkeerinfo, huisregels
- **AI Chatbot** – Huynen Host digitale conciërge (OpenAI)
- **Reserveren** – Upsell producten met optionele Mollie betaling
- **Info** – Contactgegevens, check-in/out tijden, review

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS
- TypeScript
- Vercel (deploy)

---

## 🚀 Deployen op Vercel (3 stappen)

### Stap 1: Zet op GitHub

```bash
# In de project-map:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/JOUW-NAAM/huis-ter-huynen-app.git
git push -u origin main
```

### Stap 2: Koppel aan Vercel

1. Ga naar [vercel.com](https://vercel.com) en log in
2. Klik **"Add New Project"**
3. Selecteer je GitHub repo `huis-ter-huynen-app`
4. Vercel detecteert automatisch Next.js
5. Klik **"Deploy"**

### Stap 3: Environment Variables instellen

In Vercel dashboard → je project → **Settings** → **Environment Variables**

Voeg toe:

| Variabele | Waarde | Verplicht? |
|-----------|--------|------------|
| `OPENAI_API_KEY` | `sk-...` | Nee (fallback werkt) |
| `NUKI_API_KEY` | `...` | Nee (demo modus) |
| `NUKI_SMARTLOCK_ID` | `...` | Nee (demo modus) |
| `MOLLIE_API_KEY` | `test_...` | Nee (formulier fallback) |
| `NEXT_PUBLIC_APP_URL` | `https://app.huisterhuynen.nl` | Ja |

> **Zonder API keys werkt de app volledig!** De chatbot geeft dan hardcoded Drenthe-tips, de deur opent in demo-modus, en boekingen worden als formulier afgehandeld.

### Domein instellen

1. In Vercel → **Settings** → **Domains**
2. Voeg toe: `app.huisterhuynen.nl`
3. Bij je domein-provider: maak een **CNAME** record aan:
   - Naam: `app`
   - Waarde: `cname.vercel-dns.com`
4. Wacht 5-10 minuten → SSL wordt automatisch geregeld

---

## 💻 Lokaal ontwikkelen

```bash
# Installeer dependencies
npm install

# Kopieer environment template
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 PWA Installatie

De app is installeerbaar als PWA op iPhone en Android:
- **iPhone**: Safari → Deel → "Zet op beginscherm"
- **Android**: Chrome → Menu → "App installeren"

> **Let op**: Voeg nog `icon-192.png` en `icon-512.png` toe in de `/public` map voor het app-icoon (gebruik je logo).

---

## 📁 Project Structuur

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        ← AI chatbot endpoint
│   │   ├── nuki/unlock/route.ts ← Smart lock endpoint
│   │   └── booking/route.ts     ← Boekingen endpoint
│   ├── globals.css              ← Tailwind + animaties
│   ├── layout.tsx               ← Root layout + metadata
│   └── page.tsx                 ← Entry point
├── components/
│   ├── app.tsx                  ← Hoofdcomponent (alle pagina's)
│   └── icons.tsx                ← SVG iconen + schaap avatar
public/
├── manifest.json                ← PWA configuratie
└── icon-*.png                   ← App iconen (zelf toevoegen)
```

---

## 🔑 API Keys verkrijgen

### OpenAI
1. Ga naar [platform.openai.com](https://platform.openai.com)
2. API Keys → Create new key
3. Kopieer de `sk-...` key

### Nuki
1. Ga naar [web.nuki.io](https://web.nuki.io)
2. API → Generate API token
3. Kopieer API key + Smart Lock ID

### Mollie
1. Ga naar [mollie.com](https://mollie.com)
2. Dashboard → Developers → API Keys
3. Gebruik de **test** key (`test_...`) voor testen

---

## Productie-deploy-checklist

Voor go-live met echte gasten op Lodge 1 (Boomhut) en Lodge 2 (Schaapskooi).
Loop deze lijst af; doorloop niet zonder elke stap af te vinken.

- [ ] Migratie SQL toegepast op productie Supabase
      (`migrations/2026_05_08_productiehardening.sql`, handmatig via SQL editor of CLI)
- [ ] Vercel KV-instance gekoppeld; `KV_REST_API_URL` en `KV_REST_API_TOKEN`
      gezet in Vercel project env-vars
- [ ] `NUKI_SMARTLOCK_ID_LODGE_1` en `NUKI_SMARTLOCK_ID_LODGE_2` env-vars gezet
      (legacy `NUKI_SMARTLOCK_ID` mag dan weg — alleen fallback voor migratie)
- [ ] `MOLLIE_WEBHOOK_SECRET` gezet (na configuratie in Mollie dashboard).
      Optioneel; zonder secret blijft de webhook fallback op verify-by-API.
- [ ] `ADMIN_SECRET` geroteerd (oude waarde is historisch via cookie gelekt
      en moet daarom als gecompromitteerd worden behandeld)
- [ ] `RESEND_API_KEY`, `OPENAI_API_KEY`, `MOLLIE_API_KEY` aanwezig in productie
- [ ] Eerste login → controleer dat er een rij in `audit_log` ontstaat
- [ ] Test-betaling van EUR 0,01 → webhook fires → invoice ontstaat →
      e-Boekhouden-sync werkt
- [ ] CSP report-only headers monitoren in browser console gedurende week 1;
      pas daarna eventueel naar enforcing CSP
- [ ] Smoke-scripts groen op staging:
      `npx tsx scripts/verify-sessions.ts`,
      `npx tsx scripts/verify-ratelimit.ts`

# Huis ter Huynen – Boutique Lodge App
<!-- Last updated: 2026-05-08 -->

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

### Google Search Console

Voedt de maandelijkse analyse in **admin → Marketing → Search Console**. De cron
haalt op de 3e van elke maand de vorige volledige kalendermaand op, zodat de
meetperiode altijd vaststaat.

De Search Console API accepteert geen API-sleutel — er is een service-account
nodig dat als gebruiker aan de property is toegevoegd:

1. Maak in [Google Cloud Console](https://console.cloud.google.com) een project
   en zet de **Google Search Console API** aan.
2. IAM & Beheer → Serviceaccounts → maak er een aan en download de JSON-sleutel.
3. Open [Search Console](https://search.google.com/search-console) →
   Instellingen → Gebruikers en machtigingen → voeg het e-mailadres van het
   service-account toe met rechten **Volledig**.
4. Zet in Vercel de variabelen `GSC_CLIENT_EMAIL`, `GSC_PRIVATE_KEY` en
   `GSC_SITE_URL`. De private key komt uit het veld `private_key` van de JSON.
   Plak de waarde **zonder aanhalingstekens** in het Vercel-invoerveld — die
   zijn alleen nodig in een `.env`-bestand, en in de webinterface worden ze
   onderdeel van de sleutel waardoor het ondertekenen mislukt. De `\n`-tekens
   mogen blijven staan; echte regeleindes werken ook.
   Na het instellen is een nieuwe deploy nodig: Vercel geeft bestaande
   deployments geen nieuwe omgevingsvariabelen.
5. Haal eenmalig de historie op — Search Console bewaart zestien maanden:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://www.huisterhuynen.nl/api/cron/gsc-sync?maanden=16"
```

Maanden die al met succes zijn opgehaald worden overgeslagen. Raakt de aanroep
de tijdslimiet van de functie, roep hem dan gewoon opnieuw aan: hij gaat verder
waar hij gebleven was. Met `&force=1` wordt alles alsnog opnieuw opgehaald,
bijvoorbeeld als Search Console cijfers achteraf heeft gecorrigeerd.

Zolang de variabelen ontbreken geeft de sync een nette 503 en toont de tab wat
er nog moet gebeuren, in plaats van stil te falen.

De rekenregels achter de analyse — clustering, boekingsintentie, winbaarheid —
staan in `src/lib/gsc-analyse.ts` en zijn dezelfde als in
`seo-cro-revenue-plan-2027.md`, zodat de maandcijfers vergelijkbaar blijven met
het rapport.

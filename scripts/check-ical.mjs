#!/usr/bin/env node
/**
 * Test een Booking.com iCal-export-URL vóór je hem in Vercel zet.
 *
 *   node scripts/check-ical.mjs "https://ical.booking.com/v1/export?t=..."
 *
 * Gebruikt exact dezelfde parser als src/lib/availability.ts, zodat wat hier
 * werkt ook in de applicatie werkt. Print geen boekingsdetails — alleen
 * aantallen en datumbereiken, zodat je de uitvoer kunt delen zonder gastdata
 * te lekken.
 */

const url = process.argv[2];

if (!url) {
  console.error("Geef een iCal-URL mee:\n  node scripts/check-ical.mjs \"<url>\"");
  process.exit(2);
}

/* ── Zelfde logica als parseICS() en formatDate() in src/lib/availability.ts ── */
function formatDate(raw) {
  const d = raw.replace(/[TZ].*/, "").replace(/-/g, "");
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

function parseICS(ics) {
  const events = [];
  const lines = ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  let inEvent = false, start = "", end = "";
  for (const line of lines) {
    if (line.trim() === "BEGIN:VEVENT") { inEvent = true; start = ""; end = ""; }
    else if (line.trim() === "END:VEVENT") {
      if (start && end) events.push({ start: formatDate(start), end: formatDate(end) });
      inEvent = false;
    } else if (inEvent) {
      const [key, ...rest] = line.split(":");
      const val = rest.join(":");
      if (key.startsWith("DTSTART")) start = val;
      else if (key.startsWith("DTEND")) end = val;
    }
  }
  return events;
}

try {
  const res = await fetch(url, { headers: { "User-Agent": "HuisTermHuynen-Calendar/1.0" } });

  if (!res.ok) {
    console.error(`✗ HTTP ${res.status} ${res.statusText}`);
    console.error("  Een 401/403/404 betekent meestal dat het token is ingetrokken of onjuist.");
    process.exit(1);
  }

  const tekst = await res.text();
  if (!tekst.includes("BEGIN:VCALENDAR")) {
    console.error("✗ Antwoord is geen iCal-bestand.");
    console.error("  Eerste 120 tekens:", JSON.stringify(tekst.slice(0, 120)));
    process.exit(1);
  }

  const periodes = parseICS(tekst);
  console.log(`✓ Geldige iCal-feed (HTTP ${res.status}, ${tekst.length} bytes)`);
  console.log(`  Geparste periodes: ${periodes.length}`);

  if (periodes.length === 0) {
    console.log("  Let op: nul periodes. Dat kan kloppen (lege agenda), maar controleer");
    console.log("  in de extranet of deze export daadwerkelijk de boekingen bevat.");
  } else {
    const gesorteerd = [...periodes].sort((a, b) => a.start.localeCompare(b.start));
    console.log(`  Bereik: ${gesorteerd[0].start} t/m ${gesorteerd.at(-1).end}`);
    const toekomst = periodes.filter(p => p.end >= new Date().toISOString().slice(0, 10));
    console.log(`  Waarvan nog lopend of in de toekomst: ${toekomst.length}`);
  }

  /* Deze feeds zetten gastnamen en reserveringsnummers vaak in SUMMARY. Dat is
   * precies waarom de URL als een wachtwoord behandeld moet worden. */
  const heeftNamen = /^SUMMARY:(?!CLOSED|Not available|Blocked)\S/mi.test(tekst);
  console.log(`  Bevat SUMMARY-velden met inhoud: ${heeftNamen ? "ja — behandel de URL als een wachtwoord" : "nee of alleen generieke labels"}`);
} catch (e) {
  console.error("✗ Kon de feed niet ophalen:", e.message);
  process.exit(1);
}

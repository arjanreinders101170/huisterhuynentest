#!/usr/bin/env node
/**
 * Reproduceert de insert die /api/reservering doet, en zegt precies waarom
 * hij faalt.
 *
 *   node scripts/test-aanvraag-insert.mjs
 *
 * Aanleiding: een aanvraag via de website hoogde de gastenteller op, maar
 * leverde geen rij in booking_requests. De gast wordt vóór de aanvraag
 * weggeschreven (upsert_guest), dus dat patroon betekent dat de insert zelf
 * faalt. safeInsertBookingRequest vangt die fout af en logt hem alleen —
 * daardoor is er in de applicatie niets van te zien.
 *
 * Dit script zet dezelfde kolommen weg als de echte route, in drie stappen:
 * eerst alleen de basiskolommen, dan de Meta-tracking, dan de attributie.
 * De eerste stap die faalt wijst de migratie aan die niet is gedraaid.
 *
 * Een geslaagde testrij wordt meteen weer verwijderd.
 */

import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function uitEnvLocal(sleutel) {
  try {
    const inhoud = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const regel of inhoud.split("\n")) {
      const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && m[1] === sleutel) return m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch { /* geen .env.local */ }
  return null;
}

const url = process.env.SUPABASE_URL || uitEnvLocal("SUPABASE_URL");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || uitEnvLocal("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.error("SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY ontbreken (omgeving of .env.local).");
  process.exit(2);
}
const sb = createClient(url, key);

/* Dezelfde kolommen als src/app/api/reservering/route.ts, in drie groepen die
 * elk bij één migratie horen. */
const BASIS = {
  bron: "homepage",
  gast_naam: "TEST — mag weg",
  gast_email: "test-insert@huisterhuynen.nl",
  lodge: "lodge_1",
  check_in: "2030-01-04",
  check_out: "2030-01-06",
  nachten: 2,
  personen: 2,
  huisdieren: false,
  bericht: null,
  voorgestelde_prijs: 0,
  voorgestelde_prijs_label: null,
  promo_code: null,
  status: "nieuw",
};

const META = {           // migrations/2026_05_17_meta_capi_tracking.sql
  meta_event_id: null,
  anonymous_id: null,
  fbp: null,
  fbc: null,
};

const ATTRIBUTIE = {     // migrations/2026_08_19_aanvraag_attributie.sql
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  referrer: null,
  landing_page: null,
  kanaal: "direct",
  eerste_kanaal: "direct",
  eerste_bezoek_op: null,
};

const STAPPEN = [
  { naam: "basiskolommen", migratie: "2026_05_15_unified_booking_requests.sql", rij: { ...BASIS } },
  { naam: "+ Meta-tracking", migratie: "2026_05_17_meta_capi_tracking.sql", rij: { ...BASIS, ...META } },
  { naam: "+ attributie (volledige route)", migratie: "2026_08_19_aanvraag_attributie.sql", rij: { ...BASIS, ...META, ...ATTRIBUTIE } },
];

async function probeer(stap) {
  const rij = { confirm_token: randomBytes(32).toString("hex"), ...stap.rij };
  const { data, error } = await sb.from("booking_requests").insert(rij).select("id").single();
  if (error) return { ok: false, error };
  await sb.from("booking_requests").delete().eq("id", data.id);
  return { ok: true };
}

async function main() {
  console.log(`Testinsert op ${url.replace(/^https:\/\/([^.]+).*/, "$1")}\n`);

  let eersteFout = null;
  for (const stap of STAPPEN) {
    const r = await probeer(stap);
    if (r.ok) {
      console.log(`✅ ${stap.naam} — insert geslaagd (testrij weer verwijderd)`);
    } else {
      console.log(`❌ ${stap.naam} — insert GEFAALD`);
      console.log(`   message: ${r.error.message}`);
      console.log(`   code:    ${r.error.code}`);
      if (r.error.details) console.log(`   details: ${r.error.details}`);
      if (r.error.hint) console.log(`   hint:    ${r.error.hint}`);
      console.log(`   hoort bij migratie: migrations/${stap.migratie}`);
      if (!eersteFout) eersteFout = stap;
      break;
    }
  }

  if (eersteFout) {
    console.log(
      `\n➜ Draai migrations/${eersteFout.migratie} alsnog op deze database.\n` +
      `  Zolang dat niet is gebeurd, verdwijnt elke aanvraag via dit pad.`
    );
  } else {
    console.log(
      "\n➜ De insert werkt met alle kolommen die de route gebruikt.\n" +
      "  De oorzaak ligt dan niet in het schema — kijk in de Vercel-logs naar\n" +
      '  "[booking_requests] insert failed" voor de echte fout.'
    );
  }

  /* Wanneer kwam de laatste aanvraag binnen? Stopt de reeks rond de datum van
   * een migratie, dan is dat het moment waarop dit stuk ging. */
  const { data: laatste } = await sb
    .from("booking_requests")
    .select("created_at, bron, status, gast_naam")
    .order("created_at", { ascending: false })
    .limit(8);
  console.log("\nLaatste 8 aanvragen in de database:");
  for (const r of laatste || []) {
    console.log(`  ${r.created_at.slice(0, 16).replace("T", " ")}  ${String(r.bron).padEnd(10)} ${String(r.status).padEnd(20)} ${r.gast_naam}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

#!/usr/bin/env node
/**
 * Zoek een gast terug door álle tabellen waar een aanvraag in kán belanden.
 *
 *   node scripts/zoek-aanvraag.mjs "Langenkamp"
 *   node scripts/zoek-aanvraag.mjs "daan@voorbeeld.nl"
 *
 * Bedoeld voor het geval dat een gast zegt een aanvraag te hebben gedaan die
 * niet in de Aanvragen-tab staat. De admin toont alleen booking_requests, en
 * dan ook nog de honderd nieuwste; dit script kijkt breder en zonder limiet,
 * zodat je onderscheid kunt maken tussen "staat er niet" en "wordt niet
 * getoond".
 *
 * Vereist SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY. Die worden uit de
 * omgeving gelezen, en anders uit .env.local in de projectmap.
 *
 * De service-role-sleutel omzeilt RLS: draai dit lokaal, niet op een gedeelde
 * machine, en deel de uitvoer niet zomaar — er staan gastgegevens in.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const term = process.argv[2];
if (!term) {
  console.error('Geef een naam of e-mailadres mee:\n  node scripts/zoek-aanvraag.mjs "Langenkamp"');
  process.exit(2);
}

/* ── Configuratie ── */
function uitEnvLocal(sleutel) {
  try {
    const inhoud = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const regel of inhoud.split("\n")) {
      const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && m[1] === sleutel) return m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch { /* geen .env.local — dan blijft alleen de omgeving over */ }
  return null;
}

const url = process.env.SUPABASE_URL || uitEnvLocal("SUPABASE_URL");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || uitEnvLocal("SUPABASE_SERVICE_ROLE_KEY");

if (!url || !key) {
  console.error(
    "SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY ontbreken.\n" +
    "Zet ze in .env.local, of geef ze mee:\n" +
    '  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/zoek-aanvraag.mjs "Langenkamp"'
  );
  process.exit(2);
}

const sb = createClient(url, key);

/* PostgREST leest `,` en `)` in een or()-filter als syntaxis. Een zoekterm mag
 * die tekens bevatten, dus eruit halen voor we hem in het filter zetten. */
const veilig = term.replace(/[,()*\\]/g, " ").trim();
const patroon = `%${veilig}%`;

/* Elke tabel waar naam of e-mail van een gast in terecht kan komen. Per tabel:
 * de kolommen die we tonen, en de kolommen waarin we zoeken. */
const DOELEN = [
  {
    tabel: "booking_requests",
    kolommen: "id, created_at, bron, status, gast_naam, gast_email, lodge, check_in, check_out, periode_tekst, bericht, kanaal",
    zoek: ["gast_naam", "gast_email", "bericht"],
    sorteer: "created_at",
  },
  {
    tabel: "guests",
    kolommen: "id, naam, email, laatste_bezoek",
    zoek: ["naam", "email"],
    sorteer: null,
  },
  {
    // Legacy-tabel: draagt zelf geen naam of e-mail, alleen guest_id.
    tabel: "terugkeer_aanvragen",
    kolommen: "*",
    zoek: ["bericht"],
    viaGast: true,
    sorteer: "created_at",
  },
  {
    tabel: "stays",
    kolommen: "id, guest_id, lodge, check_in, check_out, status",
    zoek: [],
    viaGast: true,
    sorteer: "check_in",
  },
  {
    tabel: "newsletter_subscribers",
    kolommen: "*",
    zoek: ["email"],
    sorteer: null,
  },
];

function toon(tabel, rijen) {
  if (rijen.length === 0) {
    console.log(`\n${tabel}: geen treffers`);
    return;
  }
  console.log(`\n${tabel}: ${rijen.length} treffer(s)`);
  for (const r of rijen) {
    console.log("  " + JSON.stringify(r, null, 2).replace(/\n/g, "\n  "));
  }
}

async function main() {
  console.log(`Zoeken op "${veilig}" in ${url.replace(/^https:\/\/([^.]+).*/, "$1")}…`);

  let guestIds = [];

  for (const doel of DOELEN) {
    let q = sb.from(doel.tabel).select(doel.kolommen);

    if (doel.viaGast) {
      /* Deze tabellen dragen zelf geen naam: ze hangen aan een gast. Zoeken
       * doen we daarom op de guest_id's die de guests-query opleverde, plus
       * op de eigen tekstkolommen als die er zijn. */
      const filters = doel.zoek.map(k => `${k}.ilike.${patroon}`);
      if (guestIds.length > 0) filters.push(`guest_id.in.(${guestIds.join(",")})`);
      if (filters.length === 0) {
        console.log(`\n${doel.tabel}: overgeslagen (geen gast gevonden om op te zoeken)`);
        continue;
      }
      q = q.or(filters.join(","));
    } else {
      q = q.or(doel.zoek.map(k => `${k}.ilike.${patroon}`).join(","));
    }

    if (doel.sorteer) q = q.order(doel.sorteer, { ascending: false });

    const { data, error } = await q;
    if (error) {
      // Een tabel die niet (meer) bestaat is geen fout die de rest moet stoppen.
      console.log(`\n${doel.tabel}: niet doorzocht — ${error.message}`);
      continue;
    }
    if (doel.tabel === "guests") guestIds = (data || []).map(g => g.id);
    toon(doel.tabel, data || []);
  }

  /* Context: staat de aanvraag er wél maar valt hij buiten de honderd die de
   * admin ophaalt? Dan is het een weergaveprobleem en geen verloren aanvraag. */
  const { count } = await sb
    .from("booking_requests")
    .select("id", { count: "exact", head: true });
  console.log(
    `\nbooking_requests bevat ${count ?? "?"} rijen in totaal. ` +
    `De admin laadt de 100 nieuwste — ${(count ?? 0) > 100 ? "de rest is daar dus niet zichtbaar." : "alles past er dus in."}`
  );

  const sinds = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data: recent } = await sb
    .from("booking_requests")
    .select("created_at, bron, status, gast_naam")
    .gte("created_at", sinds)
    .order("created_at", { ascending: false });
  console.log(`\nAlle aanvragen van de laatste 14 dagen (${(recent || []).length}):`);
  for (const r of recent || []) {
    console.log(`  ${r.created_at.slice(0, 16).replace("T", " ")}  ${String(r.bron).padEnd(10)} ${String(r.status).padEnd(20)} ${r.gast_naam}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

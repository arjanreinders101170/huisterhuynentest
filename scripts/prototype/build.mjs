/**
 * Bouwt de deelbare één-bestandsversie van de mock-up.
 *
 *   node scripts/prototype/build.mjs <uitvoermap>
 *
 * Dit is een momentopname om te tonen, niet het product: de site zelf staat
 * in src/app/wad-weids. Het sjabloon hiernaast bevat dezelfde markup en
 * dezelfde prijsberekening, maar zonder framework, en het stylesheet en de
 * beelden worden ingesloten zodat het bestand overal opent — ook zonder
 * server. Verandert het ontwerp, dan is dit bestand achterhaald tot je het
 * opnieuw bouwt.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PROPERTIES, DESTINATIONS, AMENITIES, AMENITY_GROUPS } from "../../src/lib/wadweids/content.ts";

const S = process.argv[2] || ".";
const css = readFileSync(new URL("../../src/app/wad-weids/wadweids.css", import.meta.url), "utf8");
let html = readFileSync(new URL("template.html", import.meta.url), "utf8");

const extra = ["/lodge-heide.jpg", "/wad-weids/band-avond.svg", "/wad-weids/band-ochtend.svg",
  "/wad-weids/wad-3.svg", "/wad-weids/kwelder-2.svg", "/wad-weids/mist-1.svg"];
const paths = new Set(extra);
for (const p of PROPERTIES) for (const im of p.images) paths.add(im.src);
for (const d of DESTINATIONS) paths.add(d.image);

const MIME = { ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" };
const images = {};
let bytes = 0;
for (const p of paths) {
  const ext = p.slice(p.lastIndexOf("."));
  const buf = readFileSync(new URL("../../public" + p, import.meta.url));
  bytes += buf.length;
  images[p] = `data:${MIME[ext]};base64,${buf.toString("base64")}`;
}

html = html
  .replace("/*__CSS__*/", css)
  .replace("/*__DATA__*/", JSON.stringify({ PROPERTIES, DESTINATIONS, AMENITIES, AMENITY_GROUPS }))
  .replace("/*__IMAGES__*/", JSON.stringify(images));

writeFileSync(S + "/wad-weids-prototype.html", html);
console.log(`${paths.size} beelden (${(bytes / 1e6).toFixed(1)} MB bron) → ${(html.length / 1e6).toFixed(1)} MB html`);

/**
 * Genereert de sfeerbeelden voor de Wad & Weids-mock-up.
 *
 * De echte fotografie van de kust bestaat nog niet, en goedkope stockfoto's
 * zouden het merk onderuit halen. Daarom bouwt dit script atmosferische
 * landschapsscènes als SVG: gelaagde horizonnen, mist, tegenlicht en korrel,
 * in exact het merkpalet. Ze vullen de plek van de fotografie in de mock-up
 * en worden bij oplevering één op één vervangen door echte beelden — het
 * datamodel verwijst alleen naar een pad, dus dat is één regel per woning.
 *
 *   node scripts/wadweids-images.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../public/wad-weids/", import.meta.url);
mkdirSync(OUT, { recursive: true });

/* ── Deterministische ruis, zodat elke build hetzelfde beeld oplevert ── */
function rng(seed) {
  let s = [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/* Golvende horizonlijn: som van sinussen, altijd vloeiend. */
function ridge(w, h, baseY, amp, freq, rand) {
  const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const pts = [];
  for (let x = 0; x <= w; x += Math.max(8, w / 120)) {
    const t = x / w;
    const y =
      baseY +
      Math.sin(t * freq * 6.283 + ph[0]) * amp +
      Math.sin(t * freq * 2.7 * 6.283 + ph[1]) * amp * 0.34 +
      Math.sin(t * freq * 5.3 * 6.283 + ph[2]) * amp * 0.14;
    pts.push([x, y]);
  }
  /* Coördinaten afgerond: scheelt de helft aan bestandsgrootte en is op
     beeldformaat niet te zien. */
  let d = `M0,${pts[0][1].toFixed(0)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` Q${x0.toFixed(0)},${y0.toFixed(0)} ${cx.toFixed(0)},${((y0 + y1) / 2).toFixed(0)}`;
  }
  d += ` L${w},${h} L0,${h} Z`;
  return d;
}

/* Helmgras: dunne halmen op de duinrand. */
function grass(w, baseY, count, color, rand, scale = 1) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const hgt = (18 + rand() * 46) * scale;
    const bend = (rand() - 0.5) * 26 * scale;
    s += `<path d="M${x.toFixed(0)},${baseY.toFixed(0)} Q${(x + bend * 0.4).toFixed(0)},${(baseY - hgt * 0.6).toFixed(0)} ${(x + bend).toFixed(0)},${(baseY - hgt).toFixed(0)}" stroke="${color}" stroke-width="${(1.4 * scale).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}

/* Wadpalen / steigerpalen in het water. */
function poles(w, baseY, count, color, rand) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = w * (0.08 + (i / count) * 0.86) + (rand() - 0.5) * 30;
    const hgt = 40 + rand() * 70;
    s += `<rect x="${x.toFixed(1)}" y="${(baseY - hgt).toFixed(1)}" width="${(5 + rand() * 3).toFixed(1)}" height="${hgt.toFixed(1)}" fill="${color}" rx="2"/>`;
    s += `<rect x="${x.toFixed(1)}" y="${baseY.toFixed(1)}" width="${(5 + rand() * 3).toFixed(1)}" height="${(hgt * 0.5).toFixed(1)}" fill="${color}" opacity=".18" rx="2"/>`;
  }
  return s;
}

/* Silhouet van een moderne vakantiewoning: plat dak, warm verlichte pui. */
function lodge(x, baseY, scale, color, glow) {
  const w = 190 * scale, h = 74 * scale, ov = 12 * scale;
  return `
    <g>
      <rect x="${x}" y="${baseY - h}" width="${w}" height="${h}" fill="${color}" rx="${2 * scale}"/>
      <rect x="${x - ov}" y="${baseY - h - 7 * scale}" width="${w + ov * 2}" height="${8 * scale}" fill="${color}" rx="${2 * scale}"/>
      <rect x="${x + 26 * scale}" y="${baseY - h + 16 * scale}" width="${64 * scale}" height="${40 * scale}" fill="${glow}" opacity=".85" rx="${1.5 * scale}"/>
      <rect x="${x + 104 * scale}" y="${baseY - h + 16 * scale}" width="${40 * scale}" height="${40 * scale}" fill="${glow}" opacity=".6" rx="${1.5 * scale}"/>
      <rect x="${x + 20 * scale}" y="${baseY}" width="${w + 30 * scale}" height="${5 * scale}" fill="${color}" opacity=".5" rx="2"/>
    </g>`;
}

function birds(w, y, count, color, rand) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = w * (0.3 + rand() * 0.55);
    const yy = y + (rand() - 0.5) * 120;
    const k = 7 + rand() * 7;
    s += `<path d="M${x.toFixed(0)},${yy.toFixed(0)} q${(k / 2).toFixed(0)},${(-k / 2.4).toFixed(0)} ${k},0 q${(k / 2).toFixed(0)},${(-k / 2.4).toFixed(0)} ${k},0" stroke="${color}" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`;
  }
  return s;
}

function scene(cfg) {
  const { id, w = 1600, h = 1200, sky, sun, layers = [], mist = [], extras = "", vignette = 0.32, grain = 0.055 } = cfg;
  const rand = rng(id);
  const skyStops = sky.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");

  const layerSvg = layers
    .map((l, i) => {
      const d = ridge(w, h, h * l.y, l.amp ?? 26, l.freq ?? 1.2, rand);
      const blur = l.blur ? ` filter="url(#b${i})"` : "";
      return `${l.blur ? `<filter id="b${i}" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="${l.blur}"/></filter>` : ""}<path d="${d}" fill="${l.color}"${l.opacity ? ` opacity="${l.opacity}"` : ""}${blur}/>`;
    })
    .join("");

  const mistSvg = mist
    .map(
      (m, i) =>
        `<rect x="-40" y="${h * m.y}" width="${w + 80}" height="${h * m.h}" fill="url(#mist${i})" opacity="${m.opacity ?? 0.5}"/>` +
        `<linearGradient id="mist${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.color}" stop-opacity="0"/><stop offset=".45" stop-color="${m.color}" stop-opacity="1"/><stop offset="1" stop-color="${m.color}" stop-opacity="0"/></linearGradient>`
    )
    .join("");

  const sunSvg = sun
    ? `<radialGradient id="sun"><stop offset="0" stop-color="${sun.color}" stop-opacity="${sun.core ?? 0.95}"/><stop offset=".35" stop-color="${sun.color}" stop-opacity=".38"/><stop offset="1" stop-color="${sun.color}" stop-opacity="0"/></radialGradient>
       <circle cx="${w * sun.x}" cy="${h * sun.y}" r="${sun.r * w}" fill="url(#sun)"/>
       ${sun.disc ? `<circle cx="${w * sun.x}" cy="${h * sun.y}" r="${(sun.disc * w).toFixed(1)}" fill="${sun.color}" opacity=".55"/>` : ""}`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Wad &amp; Weids sfeerbeeld">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">${skyStops}</linearGradient>
    <radialGradient id="vig" cx=".5" cy=".45" r=".78">
      <stop offset=".55" stop-color="#0E1714" stop-opacity="0"/><stop offset="1" stop-color="#0E1714" stop-opacity="${vignette}"/>
    </radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".82" numOctaves="3" seed="${Math.floor(rand() * 100)}"/><feColorMatrix type="saturate" values="0"/></filter>
    ${sunSvg ? "" : ""}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  ${sunSvg}
  ${layerSvg}
  ${mistSvg}
  ${extras}
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="${grain}" style="mix-blend-mode:overlay"/>
</svg>`;
}

/* ── Scènes ───────────────────────────────────────────────────────────
   Elke woning en bestemming heeft een eigen palet en compositie, zodat de
   kaarten in de grid duidelijk van elkaar verschillen. */
const PALETTES = {
  /* Ochtend boven het wad: zilverblauw, hoog licht, dijk en palen. */
  wad: {
    sky: [[0, "#B9CBD2"], [0.42, "#DCDFD6"], [1, "#F0E7D6"]],
    sun: { x: 0.71, y: 0.3, r: 0.38, color: "#FDF0DA", core: 0.85 },
    far: "#A6B5B7", mid: "#8B9C9C", water: "#BCC6C1", flat: "#9C9280",
    land: "#5E6C58", near: "#3B4A3F", glow: "#F7DFB2",
  },
  /* Duinen bij dauw: roze-grijze dageraad. */
  duin: {
    sky: [[0, "#C7C0C8"], [0.4, "#E7D9CE"], [1, "#F4E9DA"]],
    sun: { x: 0.28, y: 0.36, r: 0.34, color: "#F9DFC9", core: 0.8 },
    far: "#B3AAA8", mid: "#9E9285", water: "#C9BFAE", flat: "#C0B199",
    land: "#8C7C61", near: "#4C4E40", glow: "#FBE3BC",
  },
  /* Zee bij avond: goud tegenlicht op een lage horizon. */
  zee: {
    sky: [[0, "#4E6C79"], [0.34, "#C58F5E"], [0.62, "#EFC189"], [1, "#F6DCB4"]],
    sun: { x: 0.62, y: 0.52, r: 0.3, color: "#FFE3B0", core: 1, disc: 0.028 },
    far: "#8E938C", mid: "#7C7F79", water: "#B99268",
    flat: "#8E7A5F", land: "#43443C", near: "#24261F", glow: "#FFD9A0",
  },
  /* Blauw uur op het wad: koel, stil, water dat licht vasthoudt. */
  blauw: {
    sky: [[0, "#22384A"], [0.45, "#4A6377"], [1, "#96A3A6"]],
    sun: { x: 0.5, y: 0.62, r: 0.34, color: "#D9C39A", core: 0.55 },
    far: "#5B7183", mid: "#47596A", water: "#7C8B91", flat: "#5A6266",
    land: "#2C3A3B", near: "#1B2528", glow: "#EBC98B",
  },
  /* Kwelder in de namiddag: groen-goud gras achter de zeewering. */
  kwelder: {
    sky: [[0, "#AFC3C6"], [0.45, "#DCDCC9"], [1, "#EFE6CE"]],
    sun: { x: 0.8, y: 0.28, r: 0.32, color: "#FBEFCF", core: 0.7 },
    far: "#9FAFA4", mid: "#87977F", water: "#AFB89F", flat: "#A69C6E",
    land: "#6B7448", near: "#3D4A33", glow: "#F8E2AE",
  },
  /* Heide in augustus: paars, warm en droog, met een houtwal als anker. */
  heide: {
    sky: [[0, "#9FB0BC"], [0.4, "#DCCFC4"], [1, "#F2E4CE"]],
    sun: { x: 0.66, y: 0.34, r: 0.34, color: "#FBE7C2", core: 0.8 },
    far: "#A9A3A8", mid: "#8E8189", water: "#B9A9A6", flat: "#9C7F84",
    land: "#6E5560", near: "#3B3540", glow: "#F7DDAE",
  },
  /* Weide in de mist: alles zacht, alleen een bomenrij als anker. */
  mist: {
    sky: [[0, "#D5D8D0"], [0.5, "#E7E5DA"], [1, "#F4F0E5"]],
    sun: { x: 0.38, y: 0.26, r: 0.4, color: "#FBF3E2", core: 0.7 },
    far: "#BAC0B6", mid: "#A2AA9E", water: "#CBCDBF", flat: "#B4B49E",
    land: "#7E876F", near: "#4E5A48", glow: "#F6E7C4",
  },
  /* Strand bij hoog licht: bleek zand, lange lijnen, veel lucht. */
  strand: {
    sky: [[0, "#BFD2D8"], [0.5, "#E3E4DB"], [1, "#F5EEE0"]],
    sun: { x: 0.5, y: 0.2, r: 0.42, color: "#FFF6E6", core: 0.75 },
    far: "#AFC0C4", mid: "#9DAEB0", water: "#C4CFCB", flat: "#DACDB4",
    land: "#C0AF90", near: "#7E7360", glow: "#FFEBC6",
  },
};

/* Vijf composities per palet: de kaartfoto plus vier galerijbeelden. */
function variants(key, count = 5) {
  const p = PALETTES[key];
  const out = [];
  for (let v = 0; v < count; v++) {
    const rand = rng(`${key}-${v}`);
    const evening = v === 3;
    const close = v === 1 || v === 4;
    const sun = { ...p.sun, x: 0.18 + rand() * 0.64, y: p.sun.y + (evening ? 0.18 : 0) };
    const shift = (rand() - 0.5) * 0.06;
    const layers = [
      { y: 0.5 + shift, amp: 12, freq: 0.7, color: p.far, opacity: 0.85, blur: 3 },
      { y: 0.58 + shift, amp: 18, freq: 1.1, color: p.mid, opacity: 0.9 },
      { y: 0.66 + shift, amp: 8, freq: 0.6, color: p.water },
      { y: 0.76 + shift, amp: 20, freq: 1.4, color: p.flat },
      { y: close ? 0.8 : 0.86, amp: 26, freq: 0.9, color: p.land },
      { y: close ? 0.9 : 0.95, amp: 22, freq: 1.7, color: p.near },
    ];
    let extras = "";
    const w = 1600, h = 1200;
    if (v === 0 || v === 2) extras += poles(w, h * (0.68 + shift), 5 + Math.floor(rand() * 4), p.near, rand);
    if (close) extras += lodge(w * (0.12 + rand() * 0.4), h * (close ? 0.8 : 0.86), 1.5, p.near, p.glow);
    if (v !== 3) extras += birds(w, h * 0.3, 3 + Math.floor(rand() * 4), p.near, rand);
    extras += grass(w, h * (close ? 0.9 : 0.95) + 6, 90, p.near, rand, close ? 1.5 : 1.1);
    out.push({
      id: `${key}-${v + 1}`,
      cfg: {
        id: `${key}-${v}`, w, h,
        sky: evening ? p.sky.map(([o, c], i) => [o, i === 0 ? c : c]) : p.sky,
        sun, layers,
        mist: v === 2 ? [{ y: 0.55, h: 0.16, color: "#F2EEE4", opacity: 0.55 }] : [{ y: 0.6, h: 0.1, color: "#EFEAE0", opacity: 0.3 }],
        extras,
        vignette: evening ? 0.42 : 0.3,
      },
    });
  }
  return out;
}

const files = [];
for (const key of Object.keys(PALETTES)) {
  for (const v of variants(key)) files.push([`${v.id}.svg`, scene(v.cfg)]);
}

/* Bestemmingstegels: staand en breed, rustiger dan de woningbeelden. */
const TILES = [
  ["dest-waddenkust", "wad", 1200, 1500, "palen"],
  ["dest-kust-duinen", "duin", 1200, 1500, "gras"],
  ["dest-friese-natuur", "kwelder", 1400, 900, "gras"],
  ["dest-noord-nederland", "blauw", 1400, 900, "palen"],
  ["dest-eilanden", "strand", 1400, 900, "palen"],
  ["dest-drenthe", "heide", 1200, 1500, "gras"],
];
for (const [id, key, w, h, decor] of TILES) {
  const p = PALETTES[key];
  const rand = rng(id);
  files.push([
    `${id}.svg`,
    scene({
      id, w, h, sky: p.sky, sun: { ...p.sun, x: 0.3 + rand() * 0.45 },
      layers: [
        { y: 0.5, amp: 14, freq: 0.7, color: p.far, opacity: 0.8, blur: 4 },
        { y: 0.6, amp: 20, freq: 1.0, color: p.mid, opacity: 0.9 },
        { y: 0.7, amp: 10, freq: 0.6, color: p.water },
        { y: 0.8, amp: 24, freq: 1.3, color: p.flat },
        { y: 0.9, amp: 24, freq: 1.0, color: p.land },
        { y: 0.97, amp: 16, freq: 1.8, color: p.near },
      ],
      mist: [{ y: 0.56, h: 0.13, color: "#F0ECE1", opacity: 0.34 }],
      extras:
        (decor === "palen" ? poles(w, h * 0.72, 4, p.near, rand) : "") +
        grass(w, h * 0.9 + 8, decor === "gras" ? 150 : 70, p.near, rand, 1.4),
      /* Steviger vignet: de naam van de bestemming staat onderin op het beeld. */
      vignette: 0.52,
    }),
  ]);
}

/* Brede sfeerbanden: hero-alternatief en de "even helemaal weg"-band. */
for (const [id, key, sunY] of [["band-avond", "zee", 0.56], ["hero-wad", "wad", 0.3], ["band-ochtend", "mist", 0.28], ["band-heide", "heide", 0.34]]) {
  const p = PALETTES[key];
  const rand = rng(id);
  files.push([
    `${id}.svg`,
    scene({
      id, w: 2400, h: 1200, sky: p.sky,
      sun: { ...p.sun, x: 0.58, y: sunY, r: 0.34 },
      layers: [
        { y: 0.56, amp: 10, freq: 0.5, color: p.far, opacity: 0.8, blur: 5 },
        { y: 0.64, amp: 16, freq: 0.9, color: p.mid, opacity: 0.9 },
        { y: 0.72, amp: 8, freq: 0.5, color: p.water },
        { y: 0.82, amp: 18, freq: 1.1, color: p.flat },
        { y: 0.93, amp: 20, freq: 0.8, color: p.near },
      ],
      mist: [{ y: 0.6, h: 0.12, color: "#F1ECE1", opacity: 0.42 }],
      extras:
        poles(2400, 1200 * 0.74, 6, p.near, rand) +
        lodge(2400 * 0.66, 1200 * 0.93, 2.1, p.near, p.glow) +
        birds(2400, 300, 5, p.near, rand) +
        grass(2400, 1200 * 0.93 + 8, 130, p.near, rand, 1.6),
      vignette: 0.46,
    }),
  ]);
}

for (const [name, svg] of files) writeFileSync(new URL(name, OUT), svg);
console.log(`${files.length} sfeerbeelden geschreven naar public/wad-weids/`);

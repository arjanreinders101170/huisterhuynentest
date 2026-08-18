#!/usr/bin/env python3
"""Rendert het SEO/CRO-plan naar een gestileerde HTML-pagina.
Palet en typografie komen uit de designtokens van de site zelf
(src/components/LandingTemplate.tsx), zodat het rapport bij het merk hoort."""
import re, html, markdown, sys, pathlib

SRC = pathlib.Path("/home/user/huisterhuynentest/seo-cro-revenue-plan-2027.md")
OUT = pathlib.Path("/home/user/huisterhuynentest/seo-cro-revenue-plan-2027.html")

md_text = SRC.read_text(encoding="utf-8")

# Titelregel + subtitel uit de bron halen; de rest is het rapportlichaam.
lines = md_text.split("\n")
body_md = "\n".join(lines[1:]).lstrip("\n")

converted = markdown.markdown(
    body_md,
    extensions=["tables", "fenced_code", "sane_lists", "attr_list", "md_in_html"],
)

# ── Post-processing ──────────────────────────────────────────────────────

# 1. Bronlabels worden visuele chips. De geloofwaardigheid van dit rapport
#    hangt op herkomst, dus die labels krijgen een eigen vorm.
SOURCE = {"GSC": "gsc", "CODE": "code", "SERP": "serp",
          "ANALYSE": "analyse", "AANNAME": "aanname"}
def chip(m):
    key = m.group(1)
    return f'<span class="src src--{SOURCE[key]}">{key}</span>'
converted = re.sub(r"\[(" + "|".join(SOURCE) + r")\]", chip, converted)

# 2. Prioriteitsaanduidingen als pills (alleen losse tokens, niet in woorden).
def pill(m):
    p = m.group(1)
    return f'<span class="pri pri--{p.lower()}">{p}</span>'
converted = re.sub(r"(?<![\w/-])(P0|P1|P2|P3)(?![\w-])", pill, converted)

# 3. Taken met checkbox krijgen een echt vinkvakje.
converted = re.sub(r"<li>\[ \]\s*", '<li class="task">', converted)

# 4. Tabellen in een eigen scrollcontainer; anders schuift de pagina zijwaarts.
converted = re.sub(r"<table>", '<div class="tw"><table>', converted)
converted = re.sub(r"</table>", "</table></div>", converted)

# 5. Secties opdelen op h1 en een anker + nummer geven.
parts = re.split(r"<h1>(.*?)</h1>", converted)
intro_html = parts[0]
sections = []
for i in range(1, len(parts), 2):
    title = parts[i]
    content = parts[i + 1]
    plain = html.unescape(re.sub(r"<[^>]+>", "", title))
    slug = re.sub(r"[^a-z0-9]+", "-", plain.lower()).strip("-")
    num = None
    m = re.match(r"^(\d+)\.\s*(.*)$", plain)
    label = plain
    if m:
        num, label = m.group(1), m.group(2)
    sections.append(dict(slug=slug, title=title, label=label, num=num, content=content))

nav = "\n".join(
    f'<a class="nav__item" href="#{s["slug"]}">'
    f'<span class="nav__num">{s["num"] or "—"}</span>'
    f'<span class="nav__label">{html.escape(html.unescape(s["label"]))}</span></a>'
    for s in sections
)

body = f'<section class="sec sec--intro">{intro_html}</section>' + "\n".join(
    f'<section class="sec" id="{s["slug"]}">'
    f'<header class="sec__head">'
    + (f'<span class="sec__num">{s["num"]}</span>' if s["num"] else "")
    + f'<h2>{html.escape(html.unescape(s["label"]))}</h2></header>{s["content"]}</section>'
    for s in sections
)

KPI = """
<div class="kpis">
  <div class="kpi">
    <div class="kpi__v">92,3<span class="kpi__u">%</span></div>
    <div class="kpi__l">van alle vertoningen staat op positie 31 of lager</div>
  </div>
  <div class="kpi kpi--alarm">
    <div class="kpi__v">0</div>
    <div class="kpi__l">niet-merkgebonden klikken — alle 8 klikken zijn merknaam</div>
  </div>
  <div class="kpi">
    <div class="kpi__v">754<span class="kpi__u">/249</span></div>
    <div class="kpi__l">vertoningen op &ldquo;jacuzzi&rdquo; tegen &ldquo;hottub&rdquo; — de site zegt hottub</div>
  </div>
  <div class="kpi">
    <div class="kpi__v">0,25<span class="kpi__u">%</span></div>
    <div class="kpi__l">CTR commerci&euml;le pagina&rsquo;s, tegen 3,31% voor de blogs</div>
  </div>
</div>
"""

TPL = """<title>Groeiplan Huis ter Huynen 2027</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap">
<style>
:root {
  --forest:#2F4F3E; --gold:#B49A5E; --sand:#EAE3D2; --paper:#FDFBF6;
  --ground:#F4EFE3; --ink:#2A2418; --muted:#5A534C; --line:#E0D8C8;
  --rail:#FFFFFF;
  --on-forest:#FDFBF6; --eyebrow:#D9C48A;
  --p0:#9A3F28; --p1:#B47B2E; --p2:#3E6B52; --p3:#7C756B;
  --serif:'Playfair Display',Georgia,'Times New Roman',serif;
  --sans:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  --shadow:0 1px 2px rgba(42,36,24,.05), 0 8px 24px rgba(42,36,24,.05);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --forest:#84AC92; --gold:#CDB47C; --sand:#232019; --paper:#1D1A15;
    --ground:#15130F; --ink:#EDE5D4; --muted:#A79E90; --line:#332E25;
    --rail:#1A1712;
    --on-forest:#15130F; --eyebrow:#24402F;
    --p0:#D2755A; --p1:#D6A253; --p2:#7FB394; --p3:#948B7E;
    --shadow:0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.28);
  }
}
:root[data-theme="dark"] {
  --forest:#84AC92; --gold:#CDB47C; --sand:#232019; --paper:#1D1A15;
  --ground:#15130F; --ink:#EDE5D4; --muted:#A79E90; --line:#332E25;
  --rail:#1A1712;
  --on-forest:#15130F; --eyebrow:#24402F;
  --p0:#D2755A; --p1:#D6A253; --p2:#7FB394; --p3:#948B7E;
  --shadow:0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.28);
}

*{box-sizing:border-box}
body{
  margin:0; background:var(--ground); color:var(--ink);
  font-family:var(--sans); font-weight:400; font-size:16px; line-height:1.72;
  font-variant-numeric:tabular-nums; -webkit-font-smoothing:antialiased;
}

/* ── Kop ── */
.masthead{
  background:var(--forest); color:var(--on-forest); padding:60px 32px 54px;
  border-bottom:3px solid var(--gold);
}
.masthead__in{max-width:1180px; margin:0 auto}
.eyebrow{
  font-size:11px; font-weight:700; letter-spacing:.22em; text-transform:uppercase;
  color:var(--eyebrow); margin:0 0 18px;
}
.masthead h1{
  font-family:var(--serif); font-weight:700; font-size:clamp(30px,4.6vw,52px);
  line-height:1.1; margin:0 0 16px; text-wrap:balance; letter-spacing:-.01em;
}
.masthead p{
  margin:0; max-width:62ch; font-size:17px; font-weight:300; line-height:1.7;
  opacity:.9;
}
.meta{
  margin-top:26px; display:flex; flex-wrap:wrap; gap:8px 26px;
  font-size:12.5px; letter-spacing:.03em; opacity:.75;
}

/* ── KPI-band ── */
.kpis{
  max-width:1180px; margin:-30px auto 0; padding:0 32px;
  display:grid; grid-template-columns:repeat(auto-fit,minmax(215px,1fr)); gap:14px;
  position:relative; z-index:2;
}
.kpi{
  background:var(--paper); border:1px solid var(--line); border-radius:12px;
  padding:20px 20px 18px; box-shadow:var(--shadow);
  border-top:3px solid var(--gold);
}
.kpi--alarm{border-top-color:var(--p0)}
.kpi__v{
  font-family:var(--serif); font-size:36px; font-weight:700; line-height:1;
  color:var(--forest); letter-spacing:-.02em;
}
.kpi--alarm .kpi__v{color:var(--p0)}
.kpi__u{font-size:20px; opacity:.6; margin-left:1px}
.kpi__l{
  margin-top:11px; font-size:12.5px; line-height:1.55; color:var(--muted);
  font-weight:400;
}

/* ── Shell ── */
.shell{
  max-width:1180px; margin:0 auto; padding:44px 32px 90px;
  display:grid; grid-template-columns:230px minmax(0,1fr); gap:52px; align-items:start;
}
@media (max-width:940px){
  .shell{grid-template-columns:minmax(0,1fr); gap:0; padding-top:36px}
  .nav{display:none}
}

/* ── Navigatie ── */
.nav{
  position:sticky; top:22px; background:var(--rail); border:1px solid var(--line);
  border-radius:12px; padding:14px 10px; box-shadow:var(--shadow);
  max-height:calc(100vh - 44px); overflow-y:auto;
}
.nav__t{
  font-size:10px; font-weight:700; letter-spacing:.2em; text-transform:uppercase;
  color:var(--muted); padding:6px 10px 10px;
}
.nav__item{
  display:flex; gap:10px; align-items:baseline; padding:7px 10px; border-radius:7px;
  text-decoration:none; color:var(--ink); font-size:13.5px; line-height:1.35;
}
.nav__item:hover{background:var(--sand); color:var(--forest)}
.nav__num{
  font-size:10.5px; font-weight:700; color:var(--gold); min-width:14px;
  font-variant-numeric:tabular-nums;
}
.nav__label{flex:1}

/* ── Inhoud ── */
.doc{min-width:0; max-width:74ch}
.sec{
  background:var(--paper); border:1px solid var(--line); border-radius:14px;
  padding:34px 38px 38px; margin-bottom:22px; box-shadow:var(--shadow);
  scroll-margin-top:20px;
}
@media (max-width:640px){ .sec{padding:26px 20px 30px; border-radius:10px} }
.sec__head{
  display:flex; align-items:baseline; gap:14px; margin:0 0 22px;
  padding-bottom:16px; border-bottom:2px solid var(--sand);
}
.sec__num{
  font-family:var(--serif); font-size:15px; font-weight:700; color:var(--gold);
  border:1.5px solid var(--gold); border-radius:50%;
  width:32px; height:32px; min-width:32px; display:flex;
  align-items:center; justify-content:center; line-height:1;
}
.sec__head h2{
  font-family:var(--serif); font-size:clamp(21px,2.7vw,29px); font-weight:700;
  margin:0; line-height:1.2; color:var(--ink); text-wrap:balance; letter-spacing:-.01em;
}
.sec--intro > p:first-child{
  font-size:17.5px; line-height:1.65; color:var(--ink);
  padding-bottom:16px; border-bottom:2px solid var(--sand); margin-bottom:18px;
}
.sec--intro h2{
  font-family:var(--serif); font-size:clamp(20px,2.5vw,26px); font-weight:700;
  margin:30px 0 14px; line-height:1.22; text-wrap:balance;
}
.doc h2:not(.sec__head h2){
  font-family:var(--serif); font-size:21px; font-weight:700; margin:34px 0 12px;
  line-height:1.28; text-wrap:balance;
}
.doc h3{
  font-family:var(--sans); font-size:15.5px; font-weight:700; margin:26px 0 9px;
  color:var(--forest); letter-spacing:.005em;
}
.doc h4{font-size:14px; font-weight:700; margin:20px 0 7px; color:var(--muted)}
.doc p{margin:0 0 15px}
.doc > p:first-child{margin-top:0}
.doc ul,.doc ol{margin:0 0 16px; padding-left:22px}
.doc li{margin:0 0 7px}
.doc li::marker{color:var(--gold)}
.doc a{color:var(--forest); text-decoration-color:var(--gold); text-underline-offset:3px}
.doc strong{font-weight:700; color:var(--ink)}
.doc em{color:var(--muted)}
.doc hr{border:0; border-top:1px solid var(--line); margin:30px 0}
.doc blockquote{
  margin:22px 0; padding:16px 22px; border-left:3px solid var(--gold);
  background:var(--sand); border-radius:0 8px 8px 0;
  font-family:var(--serif); font-size:17.5px; font-style:italic; color:var(--ink);
}
.doc blockquote p{margin:0}
.doc code{
  font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace; font-size:.87em;
  background:var(--sand); padding:2px 6px; border-radius:4px; color:var(--forest);
  font-weight:500;
}
.doc pre{
  background:var(--sand); border:1px solid var(--line); border-radius:9px;
  padding:16px 18px; overflow-x:auto; font-size:12.5px; line-height:1.7;
}
.doc pre code{background:none; padding:0; color:var(--ink)}

/* ── Tabellen ── */
.tw{overflow-x:auto; margin:0 0 20px; border:1px solid var(--line); border-radius:10px}
.doc table{border-collapse:collapse; width:100%; font-size:13.5px; line-height:1.55}
.doc thead th{
  background:var(--forest); color:var(--on-forest); text-align:left; font-weight:500;
  padding:11px 13px; font-size:11.5px; letter-spacing:.06em; text-transform:uppercase;
  white-space:nowrap; vertical-align:bottom;
}
.doc tbody td{padding:10px 13px; border-top:1px solid var(--line); vertical-align:top}
.doc tbody tr:nth-child(even){background:color-mix(in srgb, var(--sand) 45%, transparent)}
.doc tbody td:first-child{font-weight:500}

/* ── Chips: herkomst van elk cijfer ── */
.src{
  display:inline-block; font-size:9.5px; font-weight:700; letter-spacing:.09em;
  text-transform:uppercase; padding:2px 6px; border-radius:4px;
  vertical-align:1.5px; white-space:nowrap; border:1px solid;
}
.src--gsc{color:var(--forest); border-color:var(--forest); background:color-mix(in srgb,var(--forest) 9%,transparent)}
.src--code{color:var(--p2); border-color:var(--p2); background:color-mix(in srgb,var(--p2) 9%,transparent)}
.src--serp{color:var(--gold); border-color:var(--gold); background:color-mix(in srgb,var(--gold) 12%,transparent)}
.src--analyse{color:var(--muted); border-color:var(--muted); background:color-mix(in srgb,var(--muted) 8%,transparent)}
.src--aanname{color:var(--p1); border-color:var(--p1); background:color-mix(in srgb,var(--p1) 12%,transparent)}

/* ── Prioriteit ── */
.pri{
  display:inline-block; font-size:10.5px; font-weight:700; letter-spacing:.05em;
  padding:2px 7px; border-radius:20px; color:var(--on-forest); white-space:nowrap;
}
.pri--p0{background:var(--p0)} .pri--p1{background:var(--p1)}
.pri--p2{background:var(--p2)} .pri--p3{background:var(--p3)}

/* ── Taken ── */
.doc li.task{
  list-style:none; margin-left:-22px; padding-left:30px; position:relative;
}
.doc li.task::before{
  content:""; position:absolute; left:0; top:5px; width:15px; height:15px;
  border:1.5px solid var(--gold); border-radius:4px; background:var(--paper);
}

.foot{
  max-width:1180px; margin:0 auto; padding:0 32px 60px;
  font-size:12.5px; color:var(--muted); line-height:1.7;
}
@media (max-width:940px){ .foot{padding-bottom:44px} }

:focus-visible{outline:2px solid var(--gold); outline-offset:2px; border-radius:3px}
@media (prefers-reduced-motion:reduce){ *{animation:none!important; transition:none!important} }
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} }
</style>

<header class="masthead">
  <div class="masthead__in">
    <p class="eyebrow">Zoekstrategie &middot; Conversie &middot; Bezetting</p>
    <h1>Groeiplan Huis ter Huynen 2027</h1>
    <p>Twee lodges op de Drentse heide zo volledig mogelijk bezetten tegen een winstgevende nachtprijs. Gebouwd op Search Console-data, de sitecode als feitenbron en live SERP-controles &mdash; niet op aannames.</p>
    <div class="meta">
      <span>Augustus 2026</span>
      <span>221 zoekopdrachten &middot; 35 pagina&rsquo;s</span>
      <span>Zeijen, Drenthe</span>
    </div>
  </div>
</header>

__KPI__

<div class="shell">
  <nav class="nav" aria-label="Inhoudsopgave">
    <div class="nav__t">Inhoud</div>
    __NAV__
  </nav>
  <main class="doc">
    __BODY__
  </main>
</div>

<footer class="foot">
  Elk cijfer in dit rapport is herleidbaar tot Search Console, de sitecode of een expliciet gemarkeerde aanname.
  Het analysescript en de brondata staan in <code>analyse/</code> in de repository.
</footer>
"""

out = (TPL.replace("__KPI__", KPI)
          .replace("__NAV__", nav)
          .replace("__BODY__", body))
OUT.write_text(out, encoding="utf-8")
print(f"geschreven: {OUT}  ({len(out)/1024:.0f} KB, {len(sections)} secties)")

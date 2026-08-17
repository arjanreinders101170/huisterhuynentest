#!/usr/bin/env python3
"""Huis ter Huynen — GSC analyse: clustering, intent, opportunity score."""
import csv, math, json, re
from collections import defaultdict

Q = list(csv.DictReader(open('gsc-zoekopdrachten.csv')))
P = list(csv.DictReader(open('gsc-paginas.csv')))

for r in Q:
    r['q'] = r["Meest uitgevoerde zoekopdrachten"]
    r['clicks'] = int(r['Aantal klikken']); r['imp'] = int(r['Vertoningen'])
    r['pos'] = float(r['Positie'])
for r in P:
    r['url'] = r["Toppagina's"]
    r['clicks'] = int(r['Aantal klikken']); r['imp'] = int(r['Vertoningen'])
    r['pos'] = float(r['Positie'])
    r['path'] = r['url'].replace('https://www.huisterhuynen.nl', '') or '/'

# ── Clustering ────────────────────────────────────────────────────────────
# Order matters: first match wins. Brand before everything.
BRAND = ['huis ter huynen', 'huisterhuynen', 'huynen', 'huis ter zeijen', 'landgoed de huynen',
         'de huynen', 'huinen', 'huijen', 'heinen', 'arjan reinders', 'zuiderstraat 6 zeijen']
COMPETITOR = ['drents genieten', 'wellness suites de heide', 'boutique hotel de drentse liefde',
              'de drentse liefde', 'boutique hotel drentse liefde', 'kleen resorts', 'pureluxe',
              'luxerij ruinen', 'hof van saksen', 'huttenheugte', 'erfgoedlogies termunten',
              'buitengoed drentse vennen', 'heleen', 'boetiekhotel het huis', 'boutique hotel het huis',
              'huis met de vazen', 'mooi twente lodges', 'hoyde lodge', 'gut hohne', 'stuga norg',
              'golf lodge assen', 'vakantiepark huis ter heide', 'huis ter heide', 'love nest drenthe',
              'secret room drenthe', 'wellness hotel & golf resort', 'thermen drenthe', 'winterwoods',
              'zuiderweg 21', '0152-01463401', 'minister cremerstraat']

def cluster(q):
    s = q.lower()
    if any(b in s for b in BRAND): return 'Brand'
    if any(c in s for c in COMPETITOR): return 'Concurrent/Navigational'
    if re.search(r'hond|huisdier|omheinde tuin', s): return 'Hond'
    if re.search(r'jacuzzi|hottub|hot tub|bubbelbad|whirlpool|drentse hottub|drenthse', s): return 'Hottub/Jacuzzi'
    if re.search(r'wellness|sauna|spa|welness|thermen', s): return 'Wellness/Sauna'
    if re.search(r'romantisch|romantische|bruidssuite|love nest|twee personen|z.n tweeen|vriendinnen', s): return 'Romantiek/Koppels'
    if re.search(r'weekend', s): return 'Weekendje weg'
    if re.search(r'bijzonder|uniek|origineel', s): return 'Bijzonder overnachten'
    if re.search(r'luxe|luxus|boutique|boetiek|lodge', s): return 'Luxe/Lodge/Boutique'
    if re.search(r'hunebed', s): return 'Hunebedden'
    if re.search(r'heide|heidebloei', s): return 'Heide'
    if re.search(r'fiets|wandel|kano|vlonder|veentjes|hondsrug|brinkdorp|drentsche aa|drentse aa', s): return 'Natuur & Activiteiten'
    if re.search(r'ferienhaus|ferienwohnung|niederlande|privat|urlaub|wochenende|nähe|holland', s): return 'Duitsland (DE)'
    if re.search(r'assen|norg|veenhuizen|zeijen|drenthe$|^drenthe|^assen$', s): return 'Locatie'
    return 'Overig'

# ── Zoekintentie + boekingsnabijheid (1-5) ───────────────────────────────
# Per cluster de default; specifieke overrides waar de query afwijkt.
CLUSTER_INTENT = {
    'Brand':                  ('Navigational', 5),
    'Concurrent/Navigational':('Navigational', 2),
    'Hottub/Jacuzzi':         ('Transactional', 5),
    'Wellness/Sauna':         ('Commercial investigation', 4),
    'Romantiek/Koppels':      ('Transactional', 5),
    'Weekendje weg':          ('Commercial investigation', 3),
    'Bijzonder overnachten':  ('Commercial investigation', 4),
    'Luxe/Lodge/Boutique':    ('Commercial investigation', 4),
    'Hond':                   ('Transactional', 4),
    'Locatie':                ('Local intent', 4),
    'Duitsland (DE)':         ('Commercial investigation', 4),
    'Hunebedden':             ('Informational', 1),
    'Heide':                  ('Informational', 2),
    'Natuur & Activiteiten':  ('Informational', 1),
    'Overig':                 ('Informational', 1),
}
# Overrides: queries die binnen hun cluster een andere intentie hebben
OVERRIDE = {
    'sauna met overnachting drenthe': ('Transactional', 5),
    'sauna drenthe met overnachting': ('Transactional', 5),
    'prive sauna drenthe': ('Transactional', 4),
    'privé sauna drenthe': ('Transactional', 4),
    'privé wellness drenthe': ('Transactional', 4),
    'dagje wellness drenthe': ('Commercial investigation', 1),   # dagbezoek, geen overnachting
    'thermen drenthe': ('Navigational', 1),
    'sauna huizen': ('Navigational', 1),
    'wellness huisje drenthe': ('Transactional', 5),
    'wellness huis drenthe': ('Transactional', 5),
    'wellness weekend drenthe': ('Transactional', 5),
    'wanneer bloeit de heide in drenthe': ('Informational', 2),
    'wanneer bloeit de heide': ('Informational', 2),
    'slapen in een hunebed': ('Commercial investigation', 2),
    'locatie vriendinnenweekend drenthe': ('Transactional', 5),
    'weekendje twee personen drenthe': ('Transactional', 5),
    'weekendje drenthe met privé jacuzzi': ('Transactional', 5),
    'bruidssuite drenthe': ('Transactional', 3),
    'assen': ('Navigational', 1),
    'zeijen': ('Local intent', 2),
    'vrijstaande': ('Informational', 1),
    'fietsen vlonder': ('Informational', 1),
    'vlonder fietsen': ('Informational', 1),
}

# ── Relevantie voor Huis ter Huynen (0-1) ────────────────────────────────
# Matcht het aanbod (2 lodges, 4 pers, privé hottub, sauna in De Heide, hond in overleg)?
CLUSTER_REL = {
    'Brand': 1.0, 'Hottub/Jacuzzi': 1.0, 'Romantiek/Koppels': 1.0, 'Wellness/Sauna': 0.9,
    'Luxe/Lodge/Boutique': 0.9, 'Bijzonder overnachten': 0.8, 'Locatie': 0.85,
    'Duitsland (DE)': 0.8, 'Weekendje weg': 0.7, 'Hond': 0.6, 'Heide': 0.5,
    'Natuur & Activiteiten': 0.35, 'Hunebedden': 0.3, 'Concurrent/Navigational': 0.15, 'Overig': 0.2,
}
REL_OVERRIDE = {
    # HtH heeft 2 lodges à max 4 personen -> groeps/gezinstermen minder relevant
    'huisje met sauna en jacuzzi drenthe': 1.0,
    'weekendje twee personen drenthe': 1.0,
    'hotel veenhuizen': 0.25, 'hotels veenhuizen': 0.25, 'veenhuizen hotels': 0.25,
    'veenhuizen hotel': 0.25, 'hotels in veenhuizen': 0.25,
    'luxe hotel drenthe': 0.5, 'boutique hotel drenthe': 0.6, 'romantisch hotel drenthe': 0.55,
    'wellness hotel drenthe': 0.5, 'spa hotel drenthe': 0.45, 'luxe hotels drenthe': 0.5,
    'hotel met wellness drenthe': 0.45, 'luxe hotel in drenthe': 0.5, 'hotel drenthe luxe': 0.5,
    'wellness hotels in drenthe': 0.45, 'luxe hotels in drenthe': 0.5,
    'romantische hotels in drenthe': 0.55, 'hotel in drenthe met hond': 0.4,
    'hotel drenthe met hond': 0.4, 'boetiekhotel drenthe': 0.6,
    'dagje wellness drenthe': 0.1, 'thermen drenthe': 0.1, 'sauna huizen': 0.05,
    'fietsen vlonder': 0.1, 'vlonder fietsen': 0.1,
}

# ── Winnbaarheid: hoe SERP-dominant zijn aggregators? (0-1, hoger = winbaarder) ──
# Gebaseerd op de live SERP-check (WebSearch, aug 2026): head-terms worden gedomineerd
# door portals/OTA's; niche- en locatietermen zijn winbaar voor één accommodatie.
CLUSTER_WIN = {
    'Brand': 1.0,
    'Locatie': 0.8,             # weinig accommodaties in Zeijen/Norg -> winbaar
    'Duitsland (DE)': 0.75,     # dun NL-aanbod in DE-taal
    'Hond': 0.5,
    'Romantiek/Koppels': 0.5,
    'Hottub/Jacuzzi': 0.45,     # portals sterk, maar property-sites ranken mee
    'Wellness/Sauna': 0.45,
    'Bijzonder overnachten': 0.3,  # bijna volledig listicles/portals
    'Luxe/Lodge/Boutique': 0.4,
    'Heide': 0.7, 'Hunebedden': 0.6, 'Natuur & Activiteiten': 0.65,
    'Weekendje weg': 0.15,      # OTA-terrein: hotelspecials, weekendjeweg.nl, heerlijkehuisjes
    'Concurrent/Navigational': 0.1, 'Overig': 0.3,
}

def score(r):
    """Opportunity score 0-100. Zie rapport voor de verantwoording per component."""
    c = r['cluster']
    # 1. Vraag (0-25): log-schaal op impressions, 310 imp = max
    demand = min(25, 25 * math.log1p(r['imp']) / math.log1p(310))
    # 2. Positie-upside (0-20): hoeveel valt er te winnen vs haalbaarheid
    p = r['pos']
    if p <= 3:    posv = 4      # al top-3, weinig upside
    elif p <= 10: posv = 20     # striking distance naar top-3
    elif p <= 20: posv = 18     # quick win-zone
    elif p <= 30: posv = 14
    elif p <= 50: posv = 8
    else:         posv = 4      # >50: eerst inhoudelijk herbouwen
    # 3. Commerciele intentie / boekingsnabijheid (0-30)
    comm = 30 * (r['booking'] - 1) / 4
    # 4. Relevantie (0-15)
    rel = 15 * r['rel']
    # 5. Winbaarheid (0-10)
    win = 10 * r['win']
    return round(demand + posv + comm + rel + win, 1), dict(
        demand=round(demand,1), pos=posv, comm=round(comm,1), rel=round(rel,1), win=round(win,1))

for r in Q:
    r['cluster'] = cluster(r['q'])
    it, bk = OVERRIDE.get(r['q'], CLUSTER_INTENT[r['cluster']])
    r['intent'], r['booking'] = it, bk
    r['rel'] = REL_OVERRIDE.get(r['q'], CLUSTER_REL[r['cluster']])
    r['win'] = CLUSTER_WIN[r['cluster']]
    r['score'], r['parts'] = score(r)

# ── Output ───────────────────────────────────────────────────────────────
out = {}
tot_imp = sum(r['imp'] for r in Q)
out['totaal'] = dict(queries=len(Q), impressions=tot_imp, clicks=sum(r['clicks'] for r in Q),
                     ctr=round(100*sum(r['clicks'] for r in Q)/tot_imp,3),
                     gewogen_positie=round(sum(r['pos']*r['imp'] for r in Q)/tot_imp,1))

cl = defaultdict(lambda: dict(n=0, imp=0, clicks=0, pos_num=0))
for r in Q:
    d = cl[r['cluster']]; d['n'] += 1; d['imp'] += r['imp']; d['clicks'] += r['clicks']
    d['pos_num'] += r['pos']*r['imp']
clusters = []
for k, d in cl.items():
    clusters.append(dict(cluster=k, queries=d['n'], impressions=d['imp'], clicks=d['clicks'],
                         aandeel=round(100*d['imp']/tot_imp,1),
                         gew_positie=round(d['pos_num']/d['imp'],1) if d['imp'] else None,
                         booking=CLUSTER_INTENT[k][1], winbaarheid=CLUSTER_WIN[k]))
out['clusters'] = sorted(clusters, key=lambda x: -x['impressions'])

# Positiebuckets
def bucket(p):
    for hi, lab in [(10,'1-10'),(20,'11-20'),(30,'21-30'),(50,'31-50')]:
        if p <= hi: return lab
    return '50+'
bk = defaultdict(lambda: dict(n=0, imp=0, clicks=0))
for r in Q:
    d = bk[bucket(r['pos'])]; d['n'] += 1; d['imp'] += r['imp']; d['clicks'] += r['clicks']
out['posities'] = {k: dict(v, aandeel_imp=round(100*v['imp']/tot_imp,1)) for k, v in
                   sorted(bk.items(), key=lambda x: ['1-10','11-20','21-30','31-50','50+'].index(x[0]))}

def top(rows, key, n=30):
    return [dict(q=r['q'], imp=r['imp'], clicks=r['clicks'], ctr=r['CTR'], pos=r['pos'],
                 cluster=r['cluster'], intent=r['intent'], booking=r['booking'],
                 score=r['score'], parts=r['parts']) for r in sorted(rows, key=key)[:n]]

out['top30_impressies'] = top(Q, lambda r: -r['imp'])
out['top30_score']      = top(Q, lambda r: -r['score'])
out['quickwins']        = top([r for r in Q if 8 <= r['pos'] <= 20 and r['booking'] >= 3], lambda r: -r['score'], 20)
out['striking']         = top([r for r in Q if 11 <= r['pos'] <= 30], lambda r: -r['imp'], 20)
out['hoog_imp_geen_klik'] = top([r for r in Q if r['imp'] >= 40 and r['clicks'] == 0], lambda r: -r['imp'], 25)
out['verspilde_relevantie'] = top([r for r in Q if r['booking'] >= 4 and r['pos'] > 40], lambda r: -r['imp'], 20)

# Pagina's
tot_pimp = sum(r['imp'] for r in P)
out['paginas'] = dict(n=len(P), impressions=tot_pimp, clicks=sum(r['clicks'] for r in P),
                      ctr=round(100*sum(r['clicks'] for r in P)/tot_pimp,2))
out['pagina_lijst'] = [dict(path=r['path'], imp=r['imp'], clicks=r['clicks'], ctr=r['CTR'], pos=r['pos'])
                       for r in sorted(P, key=lambda r: -r['imp'])]
# Commerciele landingspagina's vs blog/info
COMM = ['vakantiehuis-met-hottub','luxe-lodge','wellness-vakantie','romantisch-weekend',
        'vakantiehuis-assen','vakantiehuis-norg','bijzonder-overnachten','vakantiehuis-drenthe-met-hond',
        'overnachten-veenhuizen','ferienhaus','luxus-lodge','wellness-urlaub','romantisches']
comm_imp = sum(r['imp'] for r in P if any(c in r['path'] for c in COMM))
comm_clicks = sum(r['clicks'] for r in P if any(c in r['path'] for c in COMM))
out['commercieel_vs_info'] = dict(commercieel_imp=comm_imp, commercieel_clicks=comm_clicks,
                                  commercieel_ctr=round(100*comm_clicks/comm_imp,2),
                                  rest_imp=tot_pimp-comm_imp, rest_clicks=sum(r['clicks'] for r in P)-comm_clicks)

json.dump(out, open('analyse.json','w'), indent=1, ensure_ascii=False)

# Leesbare samenvatting
print(json.dumps(out['totaal'], ensure_ascii=False))
print('\n── CLUSTERS ──')
for c in out['clusters']:
    print(f"{c['cluster']:26} q={c['queries']:3} imp={c['impressions']:5} ({c['aandeel']:4.1f}%) "
          f"clicks={c['clicks']:2} pos={c['gew_positie']:5} boek={c['booking']} win={c['winbaarheid']}")
print('\n── POSITIEBUCKETS ──')
for k, v in out['posities'].items():
    print(f"{k:6} queries={v['n']:3} imp={v['imp']:5} ({v['aandeel_imp']:4.1f}%) clicks={v['clicks']}")
print('\n── TOP 20 OPPORTUNITY SCORE ──')
for r in out['top30_score'][:20]:
    print(f"{r['score']:5.1f} {r['q'][:44]:46} imp={r['imp']:4} pos={r['pos']:5.1f} {r['cluster'][:20]:22} b={r['booking']}")
print('\n── QUICK WINS (pos 8-20, boek>=3) ──')
for r in out['quickwins']:
    print(f"{r['score']:5.1f} {r['q'][:44]:46} imp={r['imp']:4} pos={r['pos']:5.1f} {r['cluster'][:20]}")
print('\n── COMMERCIEEL vs INFO (pagina-data) ──')
print(out['commercieel_vs_info'])

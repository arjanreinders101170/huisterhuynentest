"""Wat elke bezettingsgraad oplevert, in verkoopbare blokken.

Losse nachten bestaan niet: er wordt verkocht in weekenden (vr+za, 2 nachten),
midweken (di t/m do, 3 nachten) en vakantieweken (7 nachten). De blokken met
het hoogste gemiddelde nachttarief gaan het eerst weg — zo werkt vraag ook.
Daardoor daalt het gemiddelde tarief naarmate de kalender voller wordt, en dat
is precies de curve die we willen zien.
"""
from datetime import date, timedelta

BASIS = 165.0
p = lambda pct: round(BASIS * (1 + pct/100), 2)
VAKANTIES = [(date(2027,1,1),date(2027,1,10)), (date(2027,2,13),date(2027,2,21)),
             (date(2027,4,24),date(2027,5,9)), (date(2027,7,10),date(2027,8,29)),
             (date(2027,10,16),date(2027,10,24)), (date(2027,12,25),date(2027,12,31))]
FEEST = {date(2027,1,1),date(2027,3,28),date(2027,3,29),date(2027,4,27),date(2027,5,5),
         date(2027,5,6),date(2027,5,16),date(2027,5,17),date(2027,12,25),date(2027,12,26)}
TT = (date(2027,6,25), date(2027,6,27))
in_vak = lambda d: any(a <= d <= b for a, b in VAKANTIES)

def tarief(d):
    k = [BASIS]
    if d.weekday() in (4,5,6):  k.append(p(15))
    if d in FEEST:              k.append(p(15))
    if in_vak(d):               k.append(p(25))
    if TT[0] <= d <= TT[1]:     k.append(p(50))
    return max(k)

# ── Blokvoorraad opbouwen: de kalender opdelen zonder overlap ──────────────
blokken, d = [], date(2027, 1, 1)
while d.year == 2027:
    if in_vak(d) and d.weekday() == 5 and (d + timedelta(days=6)).year == 2027:
        nachten = [d + timedelta(days=i) for i in range(7)]      # vakantieweek
        d += timedelta(days=7)
    elif d.weekday() == 4:
        nachten = [d, d + timedelta(days=1)]                     # weekend vr+za
        d += timedelta(days=2)
    elif d.weekday() == 1:
        nachten = [d + timedelta(days=i) for i in range(3)]      # midweek di-do
        d += timedelta(days=3)
    else:
        d += timedelta(days=1); continue
    nachten = [n for n in nachten if n.year == 2027]
    if nachten:
        blokken.append((len(nachten), sum(tarief(n) for n in nachten)))

voorraad = sorted(blokken * 2, key=lambda b: -b[1] / b[0])       # 2 lodges
totaal_nachten = sum(n for n, _ in voorraad)

VERBRUIK, SCHOONMAAK_MARGE = 18.0, 20.0
VASTE_LASTEN = 2000.0 * 12

print(f"Verkoopbare nachten in blokken: {totaal_nachten} van 730 ({totaal_nachten/730*100:.0f}%)")
print("De rest zijn losse zondag- en maandagnachten die zelden apart verkopen.\n")
print(f"{'bezetting':>10}{'nachten':>9}{'boek.':>7}{'ADR':>7}{'omzet':>10}{'netto':>10}{'resultaat':>12}")
print("-" * 66)
rijen = []
n = omzet = boekingen = 0
for lengte, opbrengst in voorraad:
    n += lengte; omzet += opbrengst; boekingen += 1
    rijen.append((n, boekingen, omzet))

for doel in (0.20, 0.30, 0.40, 0.50, 0.60, 0.70):
    ziel = round(730 * doel)
    r = next((x for x in rijen if x[0] >= ziel), rijen[-1])
    n_, bk, om = r
    netto = om - (n_ * VERBRUIK) + bk * SCHOONMAAK_MARGE
    res = netto - VASTE_LASTEN
    vlag = ("  ← break-even" if -1200 < res < 1200 else "  ← doel" if doel == 0.70 else "")
    print(f"{n_/730*100:>9.0f}%{n_:>9}{bk:>7}{om/n_:>7.0f}{om:>9.0f}€{netto:>9.0f}€{res:>11.0f}€{vlag}")

# Break-even exact opzoeken
for n_, bk, om in rijen:
    if om - n_*VERBRUIK + bk*SCHOONMAAK_MARGE >= VASTE_LASTEN:
        print("-" * 66)
        print(f"\nBREAK-EVEN: {n_} nachten = {n_/730*100:.0f}% jaarbezetting")
        print(f"            {bk} boekingen per jaar = {bk/12:.1f} per maand")
        print(f"            gemiddeld € {om/n_:.0f} per nacht, € {om:,.0f} verblijfsomzet".replace(",", "."))
        print(f"            {n_/12:.0f} nachten per maand over twee lodges")
        break

"""Break-even voor Huis ter Huynen, op de kalender van 2027.

Vaste lasten (opgave eigenaar, 19 aug 2026):
  • financieringslasten  € 2.000 per maand   = € 24.000 per jaar
  • parkkosten           € 3.500 per jaar
                                             ─────────────────────
                                               € 27.500 per jaar

Stroom en water worden op de meter afgerekend: dat is dus een variabele
kostenpost per verhuurde nacht en geen vaste last. Die post is seizoensgebonden
— een jacuzzi op temperatuur houden kost in januari een veelvoud van wat het in
juli kost, en de lodge moet er in de winter bovendien warm bij.

Tarieven uit de prijsmotor: basisprijs € 165 (pricing_config), toeslagen uit
DEFAULT_SURCHARGES in TarievenTab.tsx. Per nacht wint de duurste periode,
precies zoals computeStayPrice() dat doet.

Er wordt in verkoopbare blokken gerekend — weekend vr+za, midweek di t/m do,
vakantieweek zeven nachten — en niet in losse nachten, want die bestaan niet.
Elke maand moet zichzelf dragen: november is niet op te halen met de opbrengst
van augustus, want de financieringslasten lopen door.
"""
from datetime import date, timedelta

# ── Prijzen ───────────────────────────────────────────────────────────────
BASIS = 165.0
p = lambda pct: round(BASIS * (1 + pct / 100), 2)
VAKANTIES = [(date(2027,1,1),date(2027,1,10)), (date(2027,2,13),date(2027,2,21)),
             (date(2027,4,24),date(2027,5,9)), (date(2027,7,10),date(2027,8,29)),
             (date(2027,10,16),date(2027,10,24)), (date(2027,12,25),date(2027,12,31))]
FEEST = {date(2027,1,1),date(2027,3,28),date(2027,3,29),date(2027,4,27),date(2027,5,5),
         date(2027,5,6),date(2027,5,16),date(2027,5,17),date(2027,12,25),date(2027,12,26)}
TT = (date(2027,6,25), date(2027,6,27))
in_vak = lambda d: any(a <= d <= b for a, b in VAKANTIES)

def tarief(d):
    k = [BASIS]
    if d.weekday() in (4, 5, 6): k.append(p(15))
    if d in FEEST:               k.append(p(15))
    if in_vak(d):                k.append(p(25))
    if TT[0] <= d <= TT[1]:      k.append(p(50))
    return max(k)

# ── Kosten ────────────────────────────────────────────────────────────────
VASTE_LASTEN_JAAR = 24_000 + 3_500
VASTE_LASTEN_MAAND = VASTE_LASTEN_JAAR / 12          # € 2.291,67

# Stroom + water per verhuurde nacht, op de meter.  [AANNAME]
# Winter: jacuzzi op temperatuur én de lodge verwarmen. Zomer: alleen de jacuzzi.
ENERGIE = {1:28, 2:28, 3:24, 4:18, 5:14, 6:12, 7:12, 8:12, 9:14, 10:20, 11:26, 12:28}
SCHOONMAAK_IN, SCHOONMAAK_UIT = 75.0, 55.0

NAAM = "januari februari maart april mei juni juli augustus september oktober november december".split()

def blokken(m):
    d, uit = date(2027, m, 1), []
    while d.month == m:
        if in_vak(d) and d.weekday() == 5 and (d + timedelta(days=6)).month == m:
            b = [d + timedelta(days=i) for i in range(7)]; d += timedelta(days=7)
        elif d.weekday() == 4 and (d + timedelta(days=1)).month == m:
            b = [d, d + timedelta(days=1)]; d += timedelta(days=2)
        elif d.weekday() == 1 and (d + timedelta(days=2)).month == m:
            b = [d + timedelta(days=i) for i in range(3)]; d += timedelta(days=3)
        else:
            d += timedelta(days=1); continue
        uit.append((len(b), sum(tarief(x) for x in b)))
    return uit

if __name__ == "__main__":
    print(f"Vaste lasten: € {VASTE_LASTEN_JAAR:,} per jaar = € {VASTE_LASTEN_MAAND:,.0f} per maand\n".replace(",", "."))
    print(f"{'maand':<11}{'besch':>6}{'energie':>9}{'nachten':>9}{'boek':>6}{'bezetting':>11}{'omzet':>9}{'netto':>9}{'ADR':>6}")
    print("-" * 76)
    tot_n = tot_b = 0; tot_om = 0.0
    for m in range(1, 13):
        voorraad = sorted(blokken(m) * 2, key=lambda x: -x[1] / x[0])   # 2 lodges
        besch = ((date(2027, m + 1, 1) if m < 12 else date(2028, 1, 1)) - date(2027, m, 1)).days * 2
        e = ENERGIE[m]
        n = bk = 0; om = netto = 0.0
        for lengte, opbrengst in voorraad:
            if netto >= VASTE_LASTEN_MAAND: break
            n += lengte; bk += 1; om += opbrengst
            netto += opbrengst - lengte * e + (SCHOONMAAK_IN - SCHOONMAAK_UIT)
        tot_n += n; tot_b += bk; tot_om += om
        print(f"{NAAM[m-1]:<11}{besch:>6}{e:>8}€{n:>9}{bk:>6}{n/besch*100:>10.0f}%{om:>8.0f}€{netto:>8.0f}€{om/n:>6.0f}")
    print("-" * 76)
    print(f"{'jaar':<11}{730:>6}{'':>9}{tot_n:>9}{tot_b:>6}{tot_n/730*100:>10.0f}%{tot_om:>8.0f}€{'':>9}{tot_om/tot_n:>6.0f}")
    print()
    print(f"BREAK-EVEN : {tot_n/730*100:.0f}% jaarbezetting")
    print(f"             {tot_n/12:.0f} nachten en {tot_b/12:.1f} boekingen per maand, over twee lodges")
    print(f"             € {tot_om:,.0f} verblijfsomzet per jaar bij € {tot_om/tot_n:.0f} gemiddeld".replace(",", "."))
    eigen, conv = 0.47, 0.016
    print(f"             ± {tot_b*eigen/conv/12:.0f} bezoekers per maand")

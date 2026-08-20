"""Break-even voor Huis ter Huynen, op de kalender van 2027.

Vaste lasten (opgave eigenaar):
  • financieringslasten  € 2.000 per maand   = € 24.000 per jaar
  • parkkosten           € 3.500 per jaar
  • marketingbudget      variabele parameter — óók een vaste last

Stroom en water gaan op de meter: variabele kosten per verhuurde nacht,
seizoensgebonden.

BOEKINGSTYPES (besluit eigenaar, 19 aug 2026) — geen losse nachten:
  • Midweek : maandag aankomst, vrijdag vertrek   → 4 nachten (ma,di,wo,do)
  • Weekend : vrijdag aankomst, zondag vertrek    → 2 nachten (vr,za)
  • Week    : maandag aankomst, zondag vertrek    → 6 nachten (= midweek+weekend)

Midweek en weekend sluiten exact op elkaar aan met vrijdag als wisseldag. Per
week van zeven nachten valt alleen de zondagnacht buiten de blokken, dus het
plafond ligt op 6/7 = 85,5%.

Tarieven uit de prijsmotor: basisprijs € 165 (pricing_config), toeslagen uit
DEFAULT_SURCHARGES in TarievenTab.tsx. Per nacht wint de duurste periode.
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
FINANCIERING_JAAR, PARKKOSTEN_JAAR = 24_000, 3_500
ENERGIE = {1:28, 2:28, 3:24, 4:18, 5:14, 6:12, 7:12, 8:12, 9:14, 10:20, 11:26, 12:28}
SCHOONMAAK_IN, SCHOONMAAK_UIT = 75.0, 55.0

def vaste_lasten(marketing_per_maand=0):
    return FINANCIERING_JAAR + PARKKOSTEN_JAAR + marketing_per_maand * 12

NAAM = "januari februari maart april mei juni juli augustus september oktober november december".split()

# ── Blokken: alleen midweek (ma→vr) en weekend (vr→zo) ────────────────────
def alle_blokken():
    """Alle verkoopbare blokken van het jaar, per lodge.

    Over het hele jaar gegenereerd en niet per maand: een midweek van 30 maart
    tot 3 april is gewoon verkoopbaar, en per maand knippen zou zulke blokken
    laten vallen en het plafond kunstmatig verlagen. Een blok telt mee in de
    maand van aankomst.

    Een week-boeking (ma→zo) is de som van een midweek en een weekend en levert
    dezelfde nachten op, dus die hoeft niet apart in de voorraad.
    """
    d, uit = date(2027, 1, 1), []
    while d.year == 2027:
        if d.weekday() == 0:                                   # maandag
            n = [d + timedelta(days=i) for i in range(4)]      # ma,di,wo,do
            soort = "midweek"
        elif d.weekday() == 4:                                 # vrijdag
            n = [d, d + timedelta(days=1)]                     # vr,za
            soort = "weekend"
        else:
            d += timedelta(days=1); continue
        if n[-1].year == 2027:
            uit.append((d.month, soort, len(n), sum(tarief(x) for x in n)))
        d += timedelta(days=1)
    return uit

BLOKKEN = alle_blokken()

def blokken(m):
    """De blokken met aankomst in maand m."""
    return [(soort, lengte, opbrengst) for mnd, soort, lengte, opbrengst in BLOKKEN if mnd == m]

def beschikbaar(m):
    return ((date(2027, m + 1, 1) if m < 12 else date(2028, 1, 1)) - date(2027, m, 1)).days * 2

def maandtabel(marketing_per_maand=0):
    doel = vaste_lasten(marketing_per_maand) / 12
    rijen, tot_n, tot_b, tot_om = [], 0, 0, 0.0
    for m in range(1, 13):
        voorraad = sorted(blokken(m) * 2, key=lambda x: -x[2] / x[1])   # 2 lodges
        e = ENERGIE[m]
        n = bk = 0; om = netto = 0.0
        for _, lengte, opbrengst in voorraad:
            if netto >= doel: break
            n += lengte; bk += 1; om += opbrengst
            netto += opbrengst - lengte * e + (SCHOONMAAK_IN - SCHOONMAAK_UIT)
        rijen.append((NAAM[m-1], beschikbaar(m), e, n, bk, om, netto))
        tot_n += n; tot_b += bk; tot_om += om
    return rijen, tot_n, tot_b, tot_om

if __name__ == "__main__":
    for marketing in (0, 550, 900, 1200):
        vl = vaste_lasten(marketing)
        rijen, n, b, om = maandtabel(marketing)
        label = "zonder marketing" if marketing == 0 else f"marketing € {marketing}/mnd"
        print(f"{label:<24} vaste lasten € {vl:>6,}  →  break-even {n/730*100:>4.1f}%  "
              f"({n} nachten, {b} boekingen, € {om:>7,.0f} omzet)".replace(",", "."))
    print()
    print("── Detail bij marketing € 900 per maand ──")
    rijen, n, b, om = maandtabel(900)
    print(f"{'maand':<11}{'besch':>6}{'energie':>9}{'nachten':>9}{'boek':>6}{'bezetting':>11}{'omzet':>9}")
    print("-" * 61)
    for naam, besch, e, nn, bk, o, netto in rijen:
        print(f"{naam:<11}{besch:>6}{e:>8}€{nn:>9}{bk:>6}{nn/besch*100:>10.0f}%{o:>8.0f}€")
    print("-" * 61)
    print(f"{'jaar':<11}{730:>6}{'':>9}{n:>9}{b:>6}{n/730*100:>10.0f}%{om:>8.0f}€")
    print(f"\nPlafond in blokken: 624 van 730 nachten = 85,5%")

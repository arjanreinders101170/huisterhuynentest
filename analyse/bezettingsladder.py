"""Wat elke bezettingsgraad oplevert boven de vaste lasten.

Deelt de prijs- en kostenaannames met analyse/break-even.py — dat bestand is
de enige plek waar tarieven en kosten staan.

Naarmate de kalender voller wordt daalt het gemiddelde tarief: de dure
weekenden en vakantieweken gaan het eerst weg, de doordeweekse basisnachten
van € 165 blijven het langst liggen.
"""
import importlib.util, pathlib
from datetime import date, timedelta

spec = importlib.util.spec_from_file_location("be", pathlib.Path(__file__).with_name("break-even.py"))
be = importlib.util.module_from_spec(spec); spec.loader.exec_module(be)

# Alle blokken van het jaar, met de maand erbij voor de energiekosten.
voorraad = []
for m in range(1, 13):
    for lengte, opbrengst in be.blokken(m) * 2:          # 2 lodges
        voorraad.append((lengte, opbrengst, be.ENERGIE[m]))
voorraad.sort(key=lambda b: -b[1] / b[0])                # duurste nachten eerst

MARGE = be.SCHOONMAAK_IN - be.SCHOONMAAK_UIT

print(f"Vaste lasten: € {be.VASTE_LASTEN_JAAR:,} per jaar".replace(",", "."))
print(f"Verkoopbaar in blokken: {sum(l for l,_,_ in voorraad)} van 730 nachten\n")
print(f"{'bezetting':>10}{'nachten':>9}{'boek':>6}{'ADR':>7}{'omzet':>10}{'energie':>10}{'netto':>10}{'resultaat':>12}")
print("-" * 74)

loop = []
n = bk = 0; om = en = 0.0
for lengte, opbrengst, e in voorraad:
    n += lengte; bk += 1; om += opbrengst; en += lengte * e
    loop.append((n, bk, om, en))

for doel in (0.22, 0.30, 0.40, 0.50, 0.60, 0.70):
    ziel = round(730 * doel)
    n_, bk_, om_, en_ = next((x for x in loop if x[0] >= ziel), loop[-1])
    netto = om_ - en_ + bk_ * MARGE
    res = netto - be.VASTE_LASTEN_JAAR
    vlag = ("  ← break-even" if -1500 < res < 1500 else "  ← doel" if doel == 0.70 else "")
    print(f"{n_/730*100:>9.0f}%{n_:>9}{bk_:>6}{om_/n_:>7.0f}{om_:>9.0f}€{en_:>9.0f}€{netto:>9.0f}€{res:>11.0f}€{vlag}")

print("-" * 74)
n_, bk_, om_, en_ = loop[-1]
print(f"\nDe winterstraf: een novembernacht à € 190 kost € {be.ENERGIE[11]} aan energie → € {190-be.ENERGIE[11]} netto.")
print(f"                Een augustusnacht à € 206 kost € {be.ENERGIE[8]} → € {206-be.ENERGIE[8]} netto.")
print(f"                De lage maanden zijn dus dubbel benadeeld: moeilijker te verkopen én duurder te leveren.")

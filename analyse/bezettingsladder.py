"""Wat elke bezettingsgraad oplevert boven de vaste lasten.

Deelt prijzen, kosten en blokdefinities met analyse/break-even.py — daar staan
ze, en nergens anders.

Blokken zijn de drie boekingstypes: midweek (ma→vr), weekend (vr→zo) en week
(ma→zo, gelijk aan midweek + weekend). Alleen de zondagnacht valt erbuiten,
dus het plafond ligt op 624 van 730 nachten = 85,5%.
"""
import importlib.util, pathlib

spec = importlib.util.spec_from_file_location("be", pathlib.Path(__file__).with_name("break-even.py"))
be = importlib.util.module_from_spec(spec); spec.loader.exec_module(be)

voorraad = []
for m in range(1, 13):
    for soort, lengte, opbrengst in be.blokken(m) * 2:          # 2 lodges
        voorraad.append((lengte, opbrengst, be.ENERGIE[m]))
voorraad.sort(key=lambda b: -b[1] / b[0])                       # hoogste tarief eerst

MARGE = be.SCHOONMAAK_IN - be.SCHOONMAAK_UIT
PLAFOND = sum(l for l, _, _ in voorraad)

loop, n, bk, om, en = [], 0, 0, 0.0, 0.0
for lengte, opbrengst, e in voorraad:
    n += lengte; bk += 1; om += opbrengst; en += lengte * e
    loop.append((n, bk, om, en))

def resultaat(marketing_per_maand):
    vl = be.vaste_lasten(marketing_per_maand)
    print(f"\nMarketing € {marketing_per_maand}/mnd — vaste lasten € {vl:,}".replace(",", "."))
    print(f"{'bezetting':>10}{'nachten':>9}{'boek':>6}{'ADR':>7}{'omzet':>10}{'energie':>10}{'resultaat':>12}")
    print("-" * 64)
    for doel in (0.22, 0.30, 0.40, 0.50, 0.60, 0.70, 0.855):
        ziel = round(730 * doel)
        n_, bk_, om_, en_ = next((x for x in loop if x[0] >= ziel), loop[-1])
        netto = om_ - en_ + bk_ * MARGE
        res = netto - vl
        merk = ("  ← break-even" if -1600 < res < 1600 else
                "  ← doel" if abs(doel - 0.70) < 0.01 else
                "  ← plafond" if doel > 0.8 else "")
        print(f"{n_/730*100:>9.1f}%{n_:>9}{bk_:>6}{om_/n_:>7.0f}{om_:>9.0f}€{en_:>9.0f}€{res:>11.0f}€{merk}")

if __name__ == "__main__":
    print(f"Plafond in blokken: {PLAFOND} van 730 nachten = {PLAFOND/730*100:.1f}%")
    for mk in (550, 900):
        resultaat(mk)

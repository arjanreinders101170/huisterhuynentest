"""Wat er per maand nodig is om € 2.000 op te halen — met alleen de voorraad
van die maand zelf. Cherry-picken over het hele jaar kan niet: november moet
in november verdiend worden."""
from datetime import date, timedelta
BASIS = 165.0
p = lambda pct: round(BASIS*(1+pct/100), 2)
VAK = [(date(2027,1,1),date(2027,1,10)),(date(2027,2,13),date(2027,2,21)),
       (date(2027,4,24),date(2027,5,9)),(date(2027,7,10),date(2027,8,29)),
       (date(2027,10,16),date(2027,10,24)),(date(2027,12,25),date(2027,12,31))]
FEEST = {date(2027,1,1),date(2027,3,28),date(2027,3,29),date(2027,4,27),date(2027,5,5),
         date(2027,5,6),date(2027,5,16),date(2027,5,17),date(2027,12,25),date(2027,12,26)}
TT = (date(2027,6,25),date(2027,6,27))
inv = lambda d: any(a<=d<=b for a,b in VAK)
def tarief(d):
    k=[BASIS]
    if d.weekday() in (4,5,6): k.append(p(15))
    if d in FEEST: k.append(p(15))
    if inv(d): k.append(p(25))
    if TT[0]<=d<=TT[1]: k.append(p(50))
    return max(k)
VERBRUIK, MARGE, DOEL = 18.0, 20.0, 2000.0
NAAM = "januari februari maart april mei juni juli augustus september oktober november december".split()

print(f"{'maand':<11}{'besch':>6}{'nachten':>9}{'boek':>6}{'bezetting':>11}{'omzet':>9}{'netto':>9}{'ADR':>6}")
print("-"*68)
tot_n = tot_b = 0; tot_om = 0.0
for m in range(1,13):
    d = date(2027,m,1); blok=[]
    while d.month==m:
        if inv(d) and d.weekday()==5 and (d+timedelta(days=6)).month==m:
            b=[d+timedelta(days=i) for i in range(7)]; d+=timedelta(days=7)
        elif d.weekday()==4 and (d+timedelta(days=1)).month==m:
            b=[d,d+timedelta(days=1)]; d+=timedelta(days=2)
        elif d.weekday()==1 and (d+timedelta(days=2)).month==m:
            b=[d+timedelta(days=i) for i in range(3)]; d+=timedelta(days=3)
        else: d+=timedelta(days=1); continue
        blok.append((len(b), sum(tarief(x) for x in b)))
    voorraad = sorted(blok*2, key=lambda x:-x[1]/x[0])
    besch = (date(2027,m+1,1)-date(2027,m,1)).days*2 if m<12 else 62
    n=bk=0; om=netto=0.0
    for lengte,opb in voorraad:
        if netto>=DOEL: break
        n+=lengte; bk+=1; om+=opb; netto+=opb-lengte*VERBRUIK+MARGE
    tot_n+=n; tot_b+=bk; tot_om+=om
    print(f"{NAAM[m-1]:<11}{besch:>6}{n:>9}{bk:>6}{n/besch*100:>10.0f}%{om:>8.0f}€{netto:>8.0f}€{om/n:>6.0f}")
print("-"*68)
print(f"{'jaar':<11}{730:>6}{tot_n:>9}{tot_b:>6}{tot_n/730*100:>10.0f}%{tot_om:>8.0f}€{'':>9}{tot_om/tot_n:>6.0f}")
print()
print(f"Per maand: {tot_n/12:.0f} nachten, {tot_b/12:.1f} boekingen, {tot_n/12/60.8*100:.0f}% bezetting")
# Bezoekers die daarbij horen
eigen = 0.47; conv = 0.016
print(f"Boekingen via eigen site: {tot_b*eigen:.0f} per jaar → {tot_b*eigen/conv:,.0f} bezoekers per jaar".replace(",","."))
print(f"                        = {tot_b*eigen/conv/12:.0f} bezoekers per maand")

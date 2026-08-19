# Huis ter Huynen — Van bezetting naar bezoekers

**Opgesteld:** 19 augustus 2026 · **Herzien:** 19 augustus 2026, nadat het doel scherp werd gesteld: **maximale bezetting het hele jaar door**, niet een bezoekersaantal.
**Opdracht:** hoeveel bezoekers zijn er nodig om de lodges vol te krijgen, en wat kost dat aan marketing?
**Leesbare versie:** https://claude.ai/code/artifact/39ae5e71-3cf0-4a59-8ee7-3d4bce74912b ("Vol het jaar rond")

---

## Bronverantwoording

Cijfers dragen een label, zodat u ziet waar een getal vandaan komt:

| Label | Betekenis |
|---|---|
| `[GSC]` | Rechtstreeks uit Google Search Console |
| `[ANALYSE]` | Door mij berekend uit die data |
| `[CODE]` | Vastgesteld in de broncode van de site |
| `[MARKT]` | Nederlandse markttarieven 2026, bandbreedte uit meerdere offertes en gepubliceerde prijzen |
| `[AANNAME]` | Schatting, expliciet als zodanig gemarkeerd |

Er is één blinde vlek die u moet kennen: **er draait nog geen GA4** [CODE]. Elk conversiepercentage in dit stuk is dus een aanname uit branchecijfers en niet uit uw eigen data. Dat is precies de aanname waar het hele model op draait — zie deel 1 — en hij is met één instelling in Vercel op te lossen.

---

# Samenvatting in één pagina

**De vraag was: 10.000 bezoekers of 10.000 boekers?** Geen van beide. Het doel is maximale bezetting; bezoekers zijn daar een afgeleide van. Hier is de rekensom, van achteren naar voren.

| Stap | Uitkomst |
|---|---|
| Doelbezetting (praktisch maximum voor twee lodges) | **70%** |
| Nachten per jaar | **512** van de 730 [CODE] |
| Boekingen per jaar (gemiddeld 3,4 nachten) | **152** |
| Daarvan via de eigen site (rest via boekingssites en terugkeer) | **72** |
| Bezoekers per jaar bij een seizoensgewogen conversie van 1,6% | **± 4.450** |
| **Bezoekers per maand** | **± 370** |

**Het antwoord op uw vraag: ongeveer 370 bezoekers per maand volstaat.** Niet 10.000 per maand — dat is 27 keer te veel voor twee lodges.

**Maar zet het doel niet op 370.** Daar zit geen enkele marge in, en drie dingen vragen om marge: de conversie begint lager zolang er geen reviews en geen interieurbeeld zijn, verkeer valt nooit precies in de maanden waarin u het nodig heeft, en bezoek dat vandaag niet boekt bouwt wel de e-maillijst waarmee u volgend jaar de lage maanden vult. **Ruim twee keer de minimale behoefte is een verdedigbaar doel — en dat is precies 10.000 bezoekers per jáár, ± 830 per maand.**

**Wat de bezetting werkelijk bepaalt, is geen marketingvraag.** Bij 512 nachten is verkeer niet de beperkende factor. Dit zijn ze, op volgorde:

1. **Doordeweeks verkopen.** Verkoopt u alleen weekenden, dan is uw plafond **43%** — vrijdag, zaterdag en zondag zijn drie van de zeven dagen. Voor 70% moeten er **231 doordeweekse nachten per jaar** verkocht worden, oftewel 55% doordeweekse bezetting [ANALYSE]. Dit is de belangrijkste opdracht van het hele plan, en er is geen advertentie die hem oplost.
2. **Conversie.** Van 1,0% naar 2,0% halveert het benodigde verkeer. Dat is goedkoper dan het verkeer verdubbelen.
3. **Reviews.** Onder de tien reviews zit de bezetting structureel vast — het raakt de positie in Google, de klikkans, de conversie op de site én de rangschikking op Natuurhuisje en Airbnb.
4. **De vijf lage maanden.** November tot en met maart dragen 165 van de 512 nachten. Daar wordt de jaarbezetting gewonnen, niet in augustus — augustus loopt vanzelf vol.

**Wat het kost.** Een nieuw scenario, toegesneden op bezetting: **€ 550 per maand plus € 2.200 eenmalig — € 15.400 over 24 maanden.** Dat is **€ 10.800 minder** dan het oorspronkelijke advies, en het haalt dezelfde 70%. Het verschil zat in verkeer dat u niet kunt verzilveren.

**Wat 10.000 per maand dan nog is.** Een ander doel, voor later: dat koopt geen bezetting meer — die zit dan aan het plafond — maar overvraag, en overvraag is prijsmacht. Van € 210 naar € 260 gemiddeld is bij 512 nachten **€ 25.600 extra per jaar** zonder één extra nacht. Zinvol vanaf 2029, en alleen als er ook een derde lodge of een tweede product komt.

---

# 1. De rekensom, maand voor maand

Twee lodges hebben samen **730 nachten per jaar** te vergeven [CODE]. Alles hieronder loopt daarvandaan terug naar het aantal bezoekers.

## 1.1 Waarom 70% en niet 90%

"Maximale bezetting" is geen 100%. Boven de 75% verkoopt u structureel losse nachten die tussen twee boekingen in vallen, en die kosten meer aan schoonmaak, wisseldagen en planning dan ze opleveren. Voor een particuliere accommodatie met twee eenheden in het Nederlandse binnenland is **70% over een heel jaar het praktische maximum** [MARKT]; 50 tot 60% is wat de meeste vergelijkbare adressen halen.

Dat maximum is bovendien niet gelijk verdeeld over het jaar. Augustus is geen prestatie, november wel.

## 1.2 Het maandmodel

| Maand | Nachten beschikbaar | Doelbezetting | Nachten | Gem. verblijf | Boekingen | Via eigen site | Conversie | **Bezoekers nodig** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| januari | 62 | 50% | 31 | 2,5 | 12 | 4 | 1,0% | 400 |
| februari | 56 | 60% | 34 | 2,5 | 14 | 5 | 1,2% | 417 |
| maart | 62 | 55% | 34 | 2,5 | 14 | 5 | 1,0% | 500 |
| april | 60 | 72% | 43 | 3,5 | 12 | 7 | 2,0% | 350 |
| mei | 62 | 82% | 51 | 3,5 | 15 | 8 | 2,0% | 400 |
| juni | 60 | 78% | 47 | 3,5 | 13 | 7 | 2,0% | 350 |
| juli | 62 | 92% | 57 | 6,0 | 10 | 6 | 2,8% | 214 |
| augustus | 62 | 95% | 59 | 6,0 | 10 | 6 | 2,8% | 214 |
| september | 60 | 80% | 48 | 3,5 | 14 | 8 | 2,0% | 400 |
| oktober | 62 | 68% | 42 | 3,5 | 12 | 7 | 1,8% | 389 |
| november | 60 | 50% | 30 | 2,5 | 12 | 4 | 1,0% | 400 |
| december | 62 | 58% | 36 | 2,5 | 14 | 5 | 1,2% | 417 |
| **Jaar** | **730** | **70%** | **512** | **3,4** | **152** | **72** | **1,6%** | **± 4.450** |

**Drie dingen springen eruit.**

**Het aantal boekingen is het hele jaar vrijwel gelijk — tussen de 10 en 15 per maand.** Dat is contra-intuïtief maar logisch: in het laagseizoen verkoopt u veel korte verblijven, in het hoogseizoen weinig lange. De werkdruk van het boekingsproces is dus jaarrond constant; alleen de omzet per boeking verschilt.

**De conversie is geen constante.** In augustus koopt iemand die op uw pagina landt; in november kijkt hij rond. Dezelfde pagina, hetzelfde beeld, andere koopbereidheid. Daarom staan er in de tabel per maand andere percentages, en daarom heeft u in november bijna twee keer zoveel bezoekers nodig voor een derde van de nachten.

**De uitkomst is klein.** 4.450 bezoekers per jaar, ± 370 per maand. Ter vergelijking: u haalt er nu 28 [ANALYSE]. Het is dus wél een factor 13 groei — maar geen factor 350.

## 1.3 De conversieketen eronder

De percentages in de kolom "conversie" zijn samengestelde cijfers. Zo lopen ze op [AANNAME, branchebandbreedtes]:

| Stap | Bandbreedte | Gebruikt |
|---|---|---|
| Sessie → CTA-klik | 25 – 40% | 30% |
| CTA → beschikbaarheid bekeken | 60 – 80% | 70% |
| Beschikbaarheid → aanvraag gestart | 25 – 40% | 30% |
| Gestart → aanvraag verzonden | 50 – 70% | 60% |
| Aanvraag → bevestigde boeking | 45 – 65% | 55% |
| **Samengesteld** | **1,0 – 3,0%** | **2,1% in het hoogseizoen, 1,0% in het laagseizoen** |

**Dit is de gevoeligste aanname van het hele plan.** Draait de conversie op 1,0% in plaats van 1,6% gemiddeld, dan heeft u geen 4.450 maar 7.200 bezoekers per jaar nodig. Draait hij op 2,2%, dan zijn er 3.270 genoeg. Zolang GA4 niet aanstaat, weten we het niet — en dat maakt het activeren ervan geen administratieve klus maar de goedkoopste manier om dit hele plan scherper te krijgen.

## 1.4 Het bezoekersdoel

Het model vraagt 4.450 per jaar. Het doel zet ik op **10.000 per jaar, ± 830 per maand** — ruim twee keer zoveel. Die marge is er om drie redenen:

1. **De conversie begint lager.** Zonder reviews en zonder interieurbeeld haalt een nieuwe accommodatie eerder 0,8% dan 1,6%. Bij 0,8% is de behoefte 9.000 bezoekers per jaar. De marge dekt precies dat startjaar.
2. **Verkeer valt niet waar u het nodig heeft.** Zoekverkeer komt wanneer mensen zoeken, niet wanneer u een gat in week 46 heeft. Voor die specifieke week heeft u een e-maillijst en retargeting nodig — en de omvang daarvan is een functie van het cumulatieve verkeer, niet van het verkeer deze maand.
3. **Niet-boekend bezoek is niet waardeloos.** Het bouwt de lijst, de naamsbekendheid en de autoriteit waarop de commerciële pagina's meeliften.

Bij 10.000 per jaar zit u dus met een dekking van ruim twee keer op het slechtste scenario en ruim vier keer op het beste. Dat is een gezond doel. **10.000 per máánd is een ander doel** — daarover deel 3.

---

# 2. Waar u nu staat

| Meting | Stand | Bron |
|---|---|---|
| Vertoningen per maand | ± 2.400 | [ANALYSE] |
| Klikken per maand | ± 28 | [ANALYSE] |
| Niet-merkgebonden klikken | 0 | [ANALYSE] |
| Gemiddelde positie (gewogen) | 49,5 | [ANALYSE] |
| Aandeel vertoningen op positie 31 of lager | 92,3% | [ANALYSE] |
| Aantal geïndexeerde pagina's | ± 35 | [GSC] |
| Artikelen live | 24 | [CODE] |
| Landingspagina's live | 11 NL + 4 DE | [CODE] |

**De diagnose in één zin:** Google kent de site, toont hem regelmatig, maar op pagina vier, vijf en zes.

Dat is geen slecht nieuws. Het betekent dat de site technisch in orde is en dat het probleem in één dimensie zit — autoriteit en volume — en niet in tien verschillende. Eén probleem oplossen is aanzienlijk goedkoper dan tien.

**Twee cijfers die u moet onthouden**, omdat ze de hele strategie verklaren:

1. **Uw blogs presteren 13× beter dan uw commerciële pagina's.** Blogs en informatiepagina's: 2.177 vertoningen, 72 klikken, CTR 3,31%. Commerciële landingspagina's: 5.111 vertoningen, 13 klikken, CTR 0,25% [ANALYSE]. De geldpagina's krijgen 70% van de zichtbaarheid en leveren 15% van het verkeer.

2. **`/heide-drenthe` staat al op positie 9,7** [GSC]. Eén pagina zit in de top 10, en dat is een natuurpagina. Dat is het bewijs dat de natuur- en regioclusters winbaar zijn en de commerciële clusters (nog) niet.

Daar bouwt dit plan op: **eerst winnen waar u kunt winnen, en de commerciële pagina's laten meeliften op de autoriteit die dat oplevert.**

---

# 3. Wat de bezetting werkelijk bepaalt

Bij 512 nachten per jaar is verkeer niet de beperkende factor. Dit zijn de zeven hefbomen op volgorde van invloed op de jaarbezetting — en "meer bezoekers" staat bewust onderaan.

## 3.1 Doordeweeks verkopen — de harde randvoorwaarde

Dit is het cijfer dat bepaalt of maximale bezetting überhaupt haalbaar is, en het staat volledig los van marketing.

| | |
|---|---|
| Weekendnachten beschikbaar (vr, za, zo × 52 weken × 2 lodges) | 312 |
| Aandeel van het jaar | **43%** |
| Bij een uitstekende 90% weekendbezetting verkocht | 281 |
| Nog te verkopen om aan 512 te komen | **231 doordeweekse nachten** |
| Doordeweekse nachten beschikbaar | 418 |
| **Benodigde doordeweekse bezetting** | **55%** |

**Verkoopt u alleen weekenden, dan is uw plafond 43%** — hoeveel bezoekers u ook binnenhaalt, hoeveel u ook adverteert. Vrijdag, zaterdag en zondag zijn nu eenmaal drie van de zeven dagen.

Het doordeweekse publiek is een ánder publiek: 55-plussers, thuiswerkers, hondenbezitters, mensen zonder schoolgaande kinderen, Duitse gasten buiten de Nederlandse schoolvakanties. Andere boodschap, ander tarief, andere kanalen. Concreet:

- **Een midweekpakket** (di t/m vr, 3 nachten) dat per nacht goedkoper is dan twee weekendnachten — dan is de keuze voor doordeweeks een besparing en geen concessie
- **Een winterse thuiswerkpropositie**: goede wifi, een bureau, rust. Dit is een groeiende markt en vrijwel niemand in Drenthe bedient hem expliciet
- **Hondvriendelijk doordeweeks**: hondenbezitters mijden juist de drukke weekenden
- **Minimumverblijf-regels** die voorkomen dat een 2-nachts weekendboeking een onverkoopbaar gat van vijf nachten achterlaat
- **Duitse gasten**: hun vakanties vallen anders dan de Nederlandse. Dit is de belangrijkste reden dat de Duitse set in het plan staat — niet extra volume, maar volume in de juiste weken

## 3.2 De overige zes

| # | Hefboom | Effect | Waarom |
|---|---|---|---|
| 2 | **Conversie verhogen** | halveert het benodigde verkeer | Van 1,0% naar 2,0% halveert het aantal bezoekers dat u nodig heeft. Dat is goedkoper dan het verkeer verdubbelen. De vier grootste hefbomen: interieurbeeld, prijs en beschikbaarheid zichtbaar zonder formulier, reviews, en reactiesnelheid op een aanvraag. |
| 3 | **Reviews verzamelen** | tilt élk kanaal tegelijk op | Onder de tien reviews zit de bezetting structureel vast: het raakt de positie in Google, de klikkans in de zoekresultaten, de conversie op de site én de rangschikking op Natuurhuisje en Airbnb. Automatisch verzoek drie dagen na vertrek, geen uitzonderingen. |
| 4 | **De lage maanden verkopen** | november t/m maart | Vijf maanden dragen 165 van de 512 nachten. Daar wordt de jaarbezetting gewonnen of verloren, en niet in augustus — augustus loopt vanzelf vol. Dit is een product- en prijsvraagstuk, en het is de enige plek waar advertentiebudget echt rendeert. |
| 5 | **Gaten in de kalender voorkomen** | 5 – 8% bezetting | Een boeking van vrijdag tot maandag laat vier nachten over die niemand los koopt. Minimumverblijf-regels, flexibele aankomstdagen en een last-minute-kanaal via de e-maillijst maken het verschil tussen 62% en 70%. |
| 6 | **Boekingssites voor restcapaciteit** | vult wat u zelf niet vult | 15 tot 18% commissie is een prima prijs voor een nacht die anders leeg blijft, en een slechte prijs voor een nacht die u zelf ook had verkocht. Blokkeer de weken waarop u zelf vraag heeft, zet de rest erop. |
| 7 | **Meer bezoekers** | 370/mnd is al genoeg | Bewust onderaan. Verkeer is bij twee lodges niet de beperkende factor; de zes punten hierboven zijn dat wel. |

## 3.3 En 10.000 bezoekers per maand dan?

Dat blijft een zinvol doel, maar voor iets anders dan bezetting.

Bij 10.000 bezoekers per maand en 152 boekingen capaciteit zou u ruim tweehonderd aanvragen per maand binnenkrijgen op twintig plekken. U zou er meer dan honderdtachtig moeten afwijzen. Dat is geen luxeprobleem maar een signaal: **overvraag is prijsmacht.** Van € 210 naar € 260 gemiddeld is bij 512 nachten **€ 25.600 extra omzet per jaar** [ANALYSE] — zonder één extra nacht en zonder één euro extra kosten.

Daarnaast is het de goedkoopste lanceerbasis voor een derde lodge of een tweede product: dan begint u niet meer bij nul.

**Maar het is een doel voor 2029, niet voor nu.** Eerst 70% halen. Als de kalender vol staat en de prijzen omhoog kunnen, is het verstandig om er verkeer bij te kopen. Andersom niet.

---

# 4. Waar het verkeer vandaan komt

Als verhouding en niet als absoluut getal, zodat dezelfde mix klopt bij 830 bezoekers per maand én bij 10.000. Geen enkel kanaal mag zo groot worden dat het geheel omvalt als het wegvalt.

| Kanaal | Aandeel | Bij 830/mnd | Vaste kosten/mnd | Waarom dit aandeel |
|---|---:|---:|---:|---|
| Organisch — natuur & regio | 37% | 307 | € 0 | Heide, hunebedden, fietsen, wandelen. Boekt zelf nauwelijks, maar levert het volume en de autoriteit waar de commerciële pagina's op meeliften. `/heide-drenthe` op positie 9,7 bewijst dat dit werkt [GSC]. |
| Organisch — commercieel | 16% | 133 | € 0 | Jacuzzi, wellness, romantiek, luxe, locatie. Dít is het verkeer dat boekt, en het converteert twee tot drie keer beter dan de natuurpagina's. |
| Google Ads | 11% | 91 | € 100 | Bij het scenario Bezetting staat dit budget **alleen op november t/m maart en op doordeweekse gaten**. In augustus adverteren voor een lodge die toch vol zit, is weggegooid geld. |
| Google Bedrijfsprofiel | 9% | 75 | € 0 | Maps en het lokale blok. Gratis, maar vraagt onderhoud — vooral reviews. Voor accommodaties het hoogst renderende gratis kanaal dat bestaat. |
| Meta Ads | 9% | 75 | € 50 | Retargeting op wie de beschikbaarheid bekeek maar niet aanvroeg, plus koud bereik in de dalmaanden. Niet het hele jaar door. |
| Pinterest | 7% | 58 | € 15 | Onderschat kanaal voor natuur- en interieurbeeld. Pins leveren jaren verkeer en de doelgroep — oriënterend op een weekend weg — is exact de onze. |
| Vermeldingen, gidsen & pers | 4% | 33 | € 0 | VVV, Visit Drenthe, ANWB, wandel- en fietssites, reisblogs. Bescheiden verkeer, maar het bouwt de autoriteit waar élke organische positie op steunt. |
| Instagram & Facebook organisch | 3% | 25 | € 0 | Bindt wie u al kent. Reken hier niet op nieuwe vraag. |
| E-mail | 2% | 17 | € 10 | Klein in verkeer, groot in waarde: **het enige kanaal waarmee u gericht één specifieke week kunt vullen.** Onmisbaar voor de laatste gaten in de kalender. |
| Direct & merk | 2% | 17 | € 0 | Mensen die de naam intypen. Een graadmeter, geen stuurknop. |
| **Totaal** | **100%** | **± 830** | **€ 175** | |

**Twee dingen om vast te houden.**

**67% van het verkeer komt uit kanalen zonder vaste maandkosten** [ANALYSE]. Die zijn duur om op te bouwen en gratis om te behouden. Van de resterende 33% is 20% echte advertenties — direct beschikbaar, en elke maand opnieuw te betalen. Content koopt u één keer; advertenties koopt u opnieuw.

**Het kleinste kanaal is operationeel het belangrijkste.** E-mail levert 2% van het verkeer en is tegelijk het enige kanaal waarmee u kunt zeggen: *"week 46 is nog vrij, drie nachten voor de prijs van twee."* Zoekverkeer kan dat niet. Voor maximale bezetting is de lijst dus geen bijzaak maar het instrument waarmee u de laatste 8% bezetting binnenhaalt.

---

# 5. De ladder

Elke fase heeft nu twee doelen: een **bezettingsdoel** — dat is het echte doel — en een **verkeersdoel**, dat is wat ervoor nodig is.

## Fase 0 — Fundament · sep – dec 2026 · 400 bezoekers/mnd · nog geen bezetting

Deze fase gaat niet over verkeer en niet over bezetting: er is nog niets te verhuren. Hij gaat over posities en over meten. Verwacht in de eerste 60 tot 90 dagen géén klikgroei — de beweging wordt zichtbaar in de positiecijfers voordat hij zichtbaar wordt in bezoekers.

| Actie | Waarom nu |
|---|---|
| **GA4 activeren** en aan Search Console koppelen | Dit is nu de belangrijkste actie van de hele fase. Elk conversiecijfer in dit plan is een branche-aanname; zonder GA4 blijft het model een schatting met een factor twee eromheen. Het recept ligt klaar in `ANALYTICS_SETUP.md`. |
| Drie P0-landingspagina's herbouwen (wellness, romantiek, jacuzzi) | Samen 3.745 vertoningen en 2 klikken [GSC]. De grootste pagina van de site staat op positie 62,6. |
| 24 artikelen erbij, 6 per maand | Deze rijpen precies op tijd voor het voorjaar van 2027. |
| Google Bedrijfsprofiel verifiëren, wekelijkse posts | Het merkcluster staat op positie 15,3 — Google heeft "Huis ter Huynen" nog niet als entiteit vastgelegd [ANALYSE]. |
| Gratis vermeldingen: VVV Drenthe, Visit Drenthe, ANWB, Tripadvisor | Versnelt de indexering die nu op "gevonden, niet geïndexeerd" blijft staan. |
| Fotograaf vastleggen, shotlist en stylingbudget bepalen | De shoot zelf staat in februari 2027 — vóór de oplevering valt er geen interieur te fotograferen. Wat nu geregeld kan worden, moet nu geregeld worden. |
| Pinterest-account opzetten met natuur- en buitenbeeld | Pins hebben maanden nodig om te rijpen; begin met wat er ís. |
| **Doordeweekse propositie uitwerken** | Nieuw en belangrijk: bedenk nu wat een midweek bij u ís — pakket, prijs, doelgroep, teksten. In januari moet het verkoopbaar zijn, want doordeweeks is 55% van uw opgave. |

**Budget:** € 400 per maand, geen advertenties, geen eenmalige investeringen.

## Fase 1 — Opening · jan – jun 2027 · 700 bezoekers/mnd · **45% bezetting**

Het eerste halfjaar is geen bezettingsjaar maar een bewijsjaar: geen reviews, geen interieurbeeld tot februari, geen conversiecijfers. 45% over deze zes maanden is een goede uitkomst. Wat hier gebouwd wordt bepaalt of 70% daarna haalbaar is.

| Actie | Waarom nu |
|---|---|
| Persbericht naar RTV Drenthe, Dagblad van het Noorden, Asser Courant | Gratis bereik plus verwijzingen van nieuwsdomeinen — die tellen zwaar. |
| **Interieur- & sfeerfotografie (februari)** | Het scharnierpunt van dit plan. Pinterest, Meta, de landingspagina's, Natuurhuisje en Airbnb hangen alle vijf aan deze ene dag. |
| **Video-impressie (maart)** | Aansluitend op de fotoshoot: dezelfde styling, geen tweede reis- en stylingdag. |
| **Reviewvliegwiel vanaf de eerste gast** | Onder de tien reviews zit de bezetting vast. Automatisch verzoek drie dagen na vertrek. |
| Natuurhuisje live (maart), Airbnb (april) | Bereik in de maanden die u zelf niet vult. Als vindkanaal, niet als hoofdkanaal. |
| Prijs en beschikbaarheid zichtbaar zonder formulier | De grootste conversiehefboom die geen geld kost. |
| E-maillijst opbouwen | Het enige kanaal waarmee u later een specifieke week kunt vullen. |
| Valentijn (februari) | Hoogste ADR-kans van het kwartaal; de content moest daarvoor in december live staan. |

**Budget:** € 700 per maand plus de eenmalige investeringen (€ 2.200).

## Fase 2 — Op niveau · jul 2027 – jun 2028 · 1.000 bezoekers/mnd · **62% bezetting**

Het eerste volledige jaar met beeld, reviews en meetbare conversie. De weekenden lopen vol, de zomer loopt vol — het verschil met 70% zit volledig in doordeweeks en in november tot maart.

| Actie | Waarom nu |
|---|---|
| **Doordeweekse proposities live**: wellness-midweek, thuiswerkweek, hondvriendelijk | Dit is de fase waarin 55% doordeweekse bezetting gehaald moet worden, of niet. |
| **Minimumverblijf-regels** die geen onverkoopbare gaten achterlaten | Goed voor 5 tot 8% jaarbezetting, en het kost niets. |
| Advertentiebudget uitsluitend op de lage maanden en de resterende gaten | In augustus adverteren voor een volle lodge is weggegooid geld. |
| Duitse set compleet maken | Duitse vakanties vallen buiten de Nederlandse — precies de weken die u zelf niet vult. |
| Contentvolume vasthouden: 6 artikelen per maand | Onderbreken kost meer dan doorgaan; het ritme is de investering. |
| TT Assen (eind juni) op `/vakantiehuis-assen` | De grootste lokale vraagpiek, en hij komt nu nergens op de site voor [CODE]. |
| Heidebloei (augustus) — `/heide-drenthe` actualiseren in juni | Uw enige top-10-positie; behandel hem als seizoensbezit. |

**Budget:** € 550 per maand.

## Fase 3 — Maximale bezetting · vanaf jul 2028 · 1.500 bezoekers/mnd · **70% bezetting**

Doel bereikt. Wat daarboven ligt bestaat uit losse nachten tussen boekingen in, en die kosten meer aan schoonmaak en planning dan ze opleveren.

| Actie | Waarom |
|---|---|
| Last-minute-kanaal via de e-maillijst voor de laatste gaten | De laatste 8% bezetting komt hier vandaan, niet uit zoekverkeer. |
| Vaste gasten: terugkeerpercentage verhogen | Goedkoper dan elke advertentie, en zij boeken doordeweeks. |
| Van bezetting sturen naar prijs sturen | Het volgende doel is opbrengst per nacht, niet nog een nacht. |

## Fase 4 — Prijsmacht · 2029 en verder · optioneel

Pas hier is 10.000 bezoekers per máánd zinvol — zie deel 3.3. Alleen doen als er ook een derde lodge of een tweede product komt.

---

# 6. Het marketingbudget

Vier scenario's over 24 maanden. **Vergelijk ze op de bezettingskolom, niet op de bezoekerskolom** — daar gaat het tenslotte om.

## Overzicht

| | **Bezetting** *(advies)* | Zuinig | Doelgericht | Versnellen |
|---|---|---|---|---|
| Per maand | **€ 550** | € 300 | € 1.000 | € 1.875 |
| Eenmalig | **€ 2.200** | € 900 | € 2.200 | € 3.400 |
| **Totaal over 24 maanden** | **€ 15.400** | € 8.100 | € 26.200 | € 48.400 |
| **Bezetting na 24 mnd** | **70%** | 60% | 70% | 70% |
| Bezoekers p/mnd na 24 mnd | 1.200 – 1.800 | 700 – 1.100 | 8.000 – 10.000 | 10.000 – 13.000 |
| Bezettingsdoel gehaald | **ja** | nee | ja | ja |

**Let op wat deze tabel zegt.** Drie van de vier scenario's halen 70%. Het verschil tussen € 15.400 en € 48.400 koopt geen extra nacht — het koopt verkeer dat u pas kunt verzilveren als er meer te verhuren is, of als u de prijzen verhoogt.

## Waarom "Bezetting" het advies is

Dit scenario verschilt van het oorspronkelijke advies op één punt: het budget gaat naar wat de bezetting daadwerkelijk bepaalt in plaats van naar verkeersvolume. Concreet zijn er drie posten weg (minder content, minder linkbuilding, minder jaarrond adverteren) en drie posten bij (conversie, reviews, en advertenties die alleen in de dalmaanden staan).

**Zuinig** haalt 60%: de weekenden en de zomer lopen vol, maar de lage maanden en doordeweeks niet. Dat verschil is ongeveer 70 nachten per jaar — bij € 210 gemiddeld is dat **€ 14.700 aan gemiste omzet**, oftewel bijna twee keer het hele budgetverschil met scenario Bezetting. Zuinig is dus geen besparing.

**Doelgericht** haalt dezelfde 70% voor € 10.800 meer. Dat verschil is niet weggegooid — het bouwt een verkeersfundament dat later prijsmacht en uitbreidingsruimte oplevert — maar het levert dit jaar en volgend jaar geen extra nacht op. Verstandig zodra er een derde lodge in beeld komt.

**Versnellen** is voor twee lodges overinvesteren.

## Bezetting — waar het geld heen gaat, per maand

| Post | Per maand | Aandeel | Wat het koopt |
|---|---|---|---|
| **Contentproductie** | € 200 | 36% | Drie artikelen per maand in plaats van zes (± € 90 per stuk uitbesteed, twee zelf) [MARKT]. Genoeg voor 10.000 bezoekers per jaar; het zesde artikel voegt verkeer toe dat u niet kunt verzilveren. |
| **Advertenties — alleen de lage maanden** | € 150 | 27% | November t/m maart en doordeweekse gaten, niet het hele jaar door. Gemiddeld over twaalf maanden; in de praktijk € 350 in januari en € 0 in augustus. |
| **Conversie & beeld** | € 80 | 15% | Seizoensbeeld, A/B-tests op de CTA, prijs en beschikbaarheid zichtbaar maken. Van 1% naar 2% conversie halveert het benodigde verkeer — de goedkoopste hefboom die er is. |
| **Reviews & gastbeleving** | € 50 | 9% | Automatische reviewverzoeken en kleine attenties die reviews opleveren. Onder de tien reviews zit de bezetting vast. |
| **Tooling** | € 45 | 8% | Positiemeting, e-mail, en een tarieven- en beschikbaarheidsoverzicht om gaten te zien vóórdat ze ontstaan. |
| **Pinterest & e-mail** | € 25 | 5% | De e-maillijst is het enige kanaal waarmee u een specifieke week kunt vullen. Pinterest levert jarenlang verkeer voor bijna niets. |
| **Totaal** | **€ 550** | 100% | |

## Bezetting — eenmalige investeringen

| Post | Bedrag | Wanneer | Waarom onvermijdelijk |
|---|---|---|---|
| Persbericht & persfoto's | € 250 | dec 2026 | Voor de opening. Eén keer bruikbaar, en dat moment komt in januari. |
| **Interieur- & sfeerfotografie** | € 900 | **feb 2027** | Halve dag, beide lodges, inclusief bewerking [MARKT]. Zonder interieurbeeld werkt geen enkel kanaal en blijft de conversie onder 1%. Kan niet eerder — de lodges zijn dan pas opgeleverd. |
| **Korte video's / drone** | € 600 | **mrt 2027** | Vijf clips, aansluitend op de fotoshoot: dezelfde styling, geen tweede reisdag [MARKT]. |
| Duitse vertaling door een native | € 450 | apr 2027 | Tien pagina's. Duitse gasten reizen buiten de Nederlandse schoolvakanties — precies de weken die u zelf niet vult. |
| **Totaal** | **€ 2.200** | | |

## Het advertentiebudget over het jaar

Dit is waar dit scenario het scherpst afwijkt van het vorige. Advertenties staan alleen aan waar ze een nacht kunnen redden.

| Maanden | Advertentiebudget | Waarom |
|---|---|---|
| nov – jan | € 300/mnd | De diepste dalmaanden. Hier verdient elke euro zich terug, want zonder advertentie blijft de nacht leeg. |
| feb – mrt | € 250/mnd | Valentijn, krokus, voorjaar. Nog steeds onder de 60% bezetting. |
| apr – mei | € 100/mnd | Alleen om doordeweekse gaten te vullen. |
| jun – sep | € 0 | Zomer en heidebloei lopen organisch vol. Adverteren voor een volle lodge is weggegooid geld. |
| okt | € 150/mnd | Herfstvakantie en de aanloop naar het lage seizoen. |

Gemiddeld: € 150 per maand — precies de post uit de tabel hierboven. Maar de verdeling is het punt, niet het gemiddelde.

---

# 7. Waar we het in gaan zetten — per kanaal

Bedragen hieronder horen bij het scenario **Bezetting** (€ 550/mnd).

## Content — het fundament (€ 200/mnd)

Drie artikelen per maand, waarvan één à twee uitbesteed. Onderwerpen komen uit het 104-onderwerpenplan in `content-strategie.md`, met deze volgorde:

1. **Natuur- en regioclusters eerst** (heide, hunebedden, Drentsche Aa, fietsen, wandelen, Fochteloërveen). Winbaar, en `/heide-drenthe` op positie 9,7 bewijst het [GSC].
2. **Commerciële ondersteuning daarna** (wat kost een privé lodge, jacuzzi versus sauna, wat is een boutique lodge). Deze vangen mensen die al aan het kiezen zijn.
3. **Seizoenscontent 8 tot 12 weken vóór de piek.** Heidebloei-artikelen in juni, Valentijn in december, TT-week in april.

**Verwachte opbrengst:** 72 nieuwe artikelen over 24 maanden, bovenop de 24 die er al staan. Bij 50 bezoekers per maand per rijp artikel [AANNAME] is dat op papier 4.800 per maand — maar de artikelen uit de laatste zes maanden zijn dan nog niet rijp. Reken op ruim de helft daarvan, en dat is meer dan de 440 uit de kanaalmix die het bezettingsdoel vraagt.

**Waarom drie en niet zes.** In het oorspronkelijke plan stonden er zes per maand, en dat leverde 5.400 bezoekers per maand op. Dat is tien keer meer dan nodig om de kalender te vullen. Drie per maand is nog steeds ruim voldoende, en de € 160 die dat scheelt gaat naar conversie en reviews — waar hij wél een nacht oplevert.

**De reden dat dit desondanks de grootste post blijft:** € 90 voor een artikel dat vervolgens jaren 50 bezoekers per maand levert, is per bezoeker een orde van grootte goedkoper dan welke advertentie ook. Het nadeel is de vertraging van 6 tot 12 maanden. Daarom begint dit in fase 0 en niet later.

## Google Ads (gemiddeld € 100/mnd — alleen in de dalmaanden)

**Wel adverteren op:**
- Merknaam (goedkoop, en het houdt concurrenten van uw eigen naam af)
- `vakantiehuis met jacuzzi drenthe` en varianten — 754 vertoningen aan bestaande vraag [ANALYSE]
- `wellness huisje drenthe` — de grootste cluster waar u organisch op positie 62 staat [GSC]
- `romantisch weekendje weg drenthe` — 95 vertoningen, positie 26,4; hier loopt organisch en betaald het snelst samen [GSC]

**Niet adverteren op:**
- Informatieve termen (hunebedden, wandelroutes). Boekingsnabijheid 1 op 5 [ANALYSE] — u betaalt voor lezers, niet voor gasten.
- Brede termen als "vakantiehuis nederland". Te duur, te weinig relevant.

**Wanneer wel en wanneer niet.** Dit is het scherpste verschil met het oorspronkelijke plan: het budget staat **niet het hele jaar aan**. In november tot en met maart € 250 à € 300 per maand, in juni tot en met september nul. Een advertentie die een gast naar een lodge stuurt die toch al vol zit, kost geld en levert niets — hij verdringt alleen een boeking die u gratis had gekregen.

**Verwachting in een dalmaand:** € 300 → ± 350 klikken → ± 4 aanvragen (1,2% [AANNAME]; in het laagseizoen converteert betaald verkeer lager) → ± 2 boekingen van gemiddeld 2,5 nachten à € 190. Dat is **± € 950 omzet op € 300 advertentiekosten**. Ruim 3 op 1 — magerder dan in het hoogseizoen, maar dit zijn nachten die anders leeg blijven, en een lege nacht levert nul op. Komt de verhouding onder 2 op 1, dan stoppen we ermee.

## Meta Ads (gemiddeld € 50/mnd)

Twee derde **retargeting** op wie de beschikbaarheid bekeek maar niet aanvroeg — dat is altijd het goedkoopste publiek dat er is. Een derde **koud bereik**: Nederland (55 km rond Assen uitgesloten — die boeken geen overnachting) en Noord-Duitsland.

**Verwachting:** ± 120 klikken per maand, met een lagere conversie dan Google omdat er geen bestaande zoekvraag onder ligt. De waarde zit vooral in herhaalbezoek en in het onder de aandacht brengen van de doordeweekse proposities — Meta is het enige advertentiekanaal waarmee u een aanbod kunt tonen aan mensen die er niet naar zoeken. Voor "midweek weg met de hond" bestaat nauwelijks zoekvraag; de doelgroep bestaat wel.

## Google Bedrijfsprofiel (€ 0)

Gratis en momenteel het meest onderbenutte kanaal dat u heeft. Wat er moet gebeuren:

- Wekelijks een post (foto plus twee zinnen — vijf minuten werk)
- Alle categorieën, openingstijden en voorzieningen ingevuld
- Elke review binnen 48 uur beantwoorden
- Foto's per seizoen aanvullen

**Verwachting:** 9% van het verkeer, en een aanzienlijk gróter deel van de boekingen — bezoekers uit Maps zijn veel verder in hun beslissing dan bezoekers uit een blogartikel. Per bezoeker is dit het meest waardevolle kanaal dat u heeft, en het kost niets.

## Pinterest (€ 15/mnd aan advertenties, verder tijd)

Vijftien pins per week vanaf fase 2, opgebouwd vanaf fase 0. Boards per thema: heide, wandelroutes, de lodges, wellness, Drenthe met kinderen, Drenthe met hond.

**Waarom dit erin zit:** een pin blijft jaren verkeer leveren en de doelgroep — mensen die zich oriënteren op een weekend weg — is precies de onze. Het is het enige gratis kanaal dat nog kan verrassen.

## Vermeldingen, gidsen & pers (€ 0 — alleen tijd)

**Gratis, direct doen:** VVV Drenthe, Visit Drenthe, Tripadvisor, ANWB, wandelknooppunt.nl, fietsknooppunt.nl.

Betaalde linkbuilding staat **niet** in het scenario Bezetting. Het werkt wel — het tilt alle pagina's tegelijk op — maar het levert verkeer op dat u bij twee lodges niet kunt verzilveren. Zet het weer op de begroting zodra 70% structureel gehaald wordt.

Wat wél blijft: één tot twee reisbloggers per jaar uitnodigen. Een gratis nacht in een dalmaand kost u ± € 190 aan gederfde omzet — en in november is die nacht anders toch leeg gebleven.

## E-mail — het kanaal voor de laatste 8% (€ 10/mnd)

Klein in verkeer, doorslaggevend in bezetting. Dit is het enige kanaal waarmee u kunt zeggen: *"week 46 is nog vrij, drie nachten voor de prijs van twee."* Zoekverkeer en advertenties kunnen dat niet — die brengen mensen die zelf een datum in gedachten hebben.

- Elke gast komt na afloop op de lijst, ook wie via Natuurhuisje of Airbnb boekte
- Eén seizoensbrief per maand, plus een last-minute-bericht zodra er een gat van meer dan vier nachten in de kalender staat
- Doel: 1.000 abonnees eind 2028. Bij een openpercentage van 35% en een conversie van 1% op een last-minute-aanbod is dat 3 à 4 boekingen per verzending

## Boekingssites — een aparte overweging

**Besloten: we gaan erop, ná de fotoshoot.** Natuurhuisje in maart 2027, Airbnb in april. Beide kosten 15 tot 18% commissie [MARKT], dus ze worden bewust als vindkanaal ingezet en niet als hoofdkanaal:

- Zet erop wat u zelf niet gevuld krijgt — laagseizoen, doordeweekse nachten, last-minutes
- Blokkeer de weken waar u zelf al vraag voor heeft
- Elke gast die via een boekingssite komt, gaat daarna in uw e-maillijst en krijgt bij terugkomst een directe reden om rechtstreeks te boeken
- Airbnb start een maand later dan Natuurhuisje, zodat de lessen uit de eerste listing — welke foto's werken, welke tekst, welke prijsopzet — meteen in de tweede zitten
- In april vergelijken we beide kanalen op netto-opbrengst per nacht ná commissie, en op het aandeel gasten dat later rechtstreeks terugboekt. Dat bepaalt hoeveel capaciteit er volgend seizoen naar de boekingssites gaat

**De rekensom die dit plan verantwoordt.** Twee sommen, naast elkaar:

*Bespaarde commissie.* Brengt dit plan het aandeel directe boekingen van 30% naar 55%, dan is dat over twee jaar ± € 52.500 aan omzet die géén commissie betaalt. Bij 16,5% gemiddeld is dat **± € 8.700** [ANALYSE] — meer dan de helft van het budget van € 15.400, terugverdiend zonder één extra boeking.

*Extra nachten.* Het verschil tussen 60% bezetting (scenario Zuinig) en 70% (scenario Bezetting) is ± 70 nachten per jaar. Bij € 210 gemiddeld is dat **€ 14.700 per jaar, € 29.400 over twee jaar** [ANALYSE].

Samen dekken die twee het budget bijna vier keer. En dan is de ADR-verhoging die uit een vollere kalender volgt nog niet meegerekend.

---

# 8. Wat er deze week al gebouwd is

Drie dingen die het plan uitvoerbaar en beoordeelbaar maken. Ze staan live in de code.

**1. Herkomstmeting op elke aanvraag.** Elke aanvraag draagt nu het kanaal waaruit hij kwam — utm-parameters, klik-ID's van Google en Meta, en het verwijzende domein, zowel van het eerste bezoek als van de laatste klik vóór de aanvraag. Het kanaal wordt op de server afgeleid, zodat er één vocabulaire in de database staat. Klik-ID's winnen bewust van de verwijzer: een advertentieklik komt via google.nl binnen en zou anders als organisch verkeer geboekt worden — precies de fout die een budget onbeoordeelbaar maakt.

**Dit is de voorwaarde onder deel 6.** Zonder deze meting is "verhoog Google Ads naar € 600" een gok.

**2. Snellere indexering.** Een RSS-feed op `/blog/rss.xml` — nieuwsbrieftools, Flipboard, Feedly en automatiseringen kunnen daar op aansluiten zonder dat er iets handmatig gedeeld hoeft te worden. En IndexNow-meldingen bij elke publicatie: Bing, Yandex en Seznam indexeren daardoor binnen uren in plaats van weken. Voor seizoenscontent is dat het verschil tussen op tijd en te laat.

**3. De tab "Groei naar 10.000" in de admin.** De stand uit Search Console met de maandreeks, de vijf fases met hun hefbomen, de kanaalmix, de drie budgetscenario's naast elkaar, en onderaan de werkelijke herkomst van binnengekomen aanvragen — de toets op het budget.

---

# 9. Besluiten

## Genomen — 19 augustus 2026

| Besluit | Uitkomst | Gevolg voor het plan |
|---|---|---|
| **Het doel zelf** | **Maximale bezetting het hele jaar door** — geen bezoekersaantal | Het hele plan is hierop herbouwd. Bezoekers zijn nu een afgeleide: ± 370 per maand volstaat, doel 830 voor de marge. Zie deel 1. |
| **Fotografie** | **Q1 2027**, met een video-impressie erachteraan | De shoot staat in februari, de video in maart — aansluitend, op dezelfde styling, zodat er geen tweede reis- en stylingdag nodig is. Dit is de juiste keuze en niet alleen een uitstel: vóór de oplevering valt er geen interieur te fotograferen. |
| **Boekingssites** | **Ja** — Natuurhuisje en Airbnb, ná de fotoshoot | Natuurhuisje in maart, Airbnb in april. Beide voor restcapaciteit, niet als hoofdkanaal. Zie deel 7. |

**Wat het bezettingsdoel verandert aan het budget.** Het advies gaat van € 26.200 naar **€ 15.400** — scenario *Bezetting*, € 550 per maand plus € 2.200 eenmalig. Het verschil van € 10.800 zat in verkeer dat bij twee lodges niet te verzilveren is. Wat ervoor terugkomt is budget voor conversie, reviews en de dalmaanden, en een advertentiebudget dat alleen aanstaat in de maanden waarin het een nacht kan redden.

**Wat de fotobeslissing kost, eerlijk gezegd.** Het beeldwerk verschuift vijf maanden, en daarmee verschuift ook alles wat eraan hangt: Pinterest op volume, Meta met video, en vooral de conversie op de landingspagina's. Dat raakt de *conversie*, niet het *verkeer* — de bezoekersladder in deel 5 is contentgedreven en blijft staan. Maar reken erop dat de trechter pas vanaf maart 2027 op zijn beoogde niveau werkt, en beoordeel de maanden daarvóór dus niet op boekingen.

**Er is één ding dat het gat gedeeltelijk dicht.** De lodges zijn tussen oplevering en de shoot al wel te zien. Maak in januari zelf een serie werkfoto's met een telefoon — niet voor de landingspagina's, wel voor het Google Bedrijfsprofiel, de nieuwsbrief en "achter de schermen" op social. Dat is gratis, het houdt het profiel levend in de maand waarin u opent, en het kost een uur.

## Nog open

| # | Besluit | Waarom het nu moet | Mijn advies |
|---|---|---|---|
| **1** | **Welk budgetscenario** — Bezetting, Zuinig, Doelgericht of Versnellen? | Bepaalt of contentproductie wordt uitbesteed; dat regelt u niet in een week | **Bezetting** — € 550/mnd plus € 2.200 eenmalig, € 15.400 over 24 maanden. Haalt 70% voor € 10.800 minder dan het vorige advies. |
| **2** | **Hoe ziet een midweek er bij u uit?** | Doordeweeks is 55% van de opgave, en dit is een productvraag die u alleen kunt beantwoorden — pakket, prijs, doelgroep | Begin met één propositie in plaats van drie: **wellness-midweek, drie nachten di t/m vr, per nacht goedkoper dan het weekend.** De thuiswerk- en hondvariant kunnen later. |

**Twee dingen die geen besluit vragen en waar ik direct mee doorga:** GA4 activeren (het recept ligt klaar, en het is nu de belangrijkste openstaande actie van het hele plan) en de gratis vermeldingen aanmelden. Die kosten niets en houden niemand op.

---

# 10. Hoe we het bijhouden

De hoofd-KPI is **bezetting**, niet verkeer. Verkeer is een vroege indicator: het beweegt maanden eerder, maar het is niet waar u op afgerekend wordt.

## Maandelijks — in de tab Groei & bezetting

| Meting | Waar | Waarom deze |
|---|---|---|
| **Bezetting deze maand versus het maandmodel** | Bezettingstijdlijn + het maandmodel in de Groei-tab | De enige meting die er echt toe doet |
| **Doordeweekse bezetting apart** | Idem | 55% is de opgave; het weekendcijfer verbergt of u die haalt |
| Bezoekers versus het fasedoel | Groei-tab, bovenaan | Vroege indicator, drie tot zes maanden vooruit |
| Conversie: sessies → aanvragen → boekingen | GA4 plus de Groei-tab | Elke tiende procent scheelt honderden bezoekers |
| Aanvragen per kanaal | Groei-tab, onderaan | De toets op het advertentiebudget |
| Aantal reviews | GBP en de site | Onder de tien zit alles vast |

## De vier vragen per kwartaal

1. **Halen we de doordeweekse bezetting?** Zit die onder 45%, dan is dat het enige waar het volgende kwartaal over gaat — niet content, niet advertenties. Het product moet dan aangepast worden, niet de marketing.
2. **Beweegt de conversie de goede kant op?** Doel: van onder 1% in 2027 naar 1,6% gemiddeld in 2028. Zit hij vast, kijk dan eerst naar beeld, prijstransparantie en reactiesnelheid — pas daarna naar verkeer.
3. **Levert het advertentiebudget in de dalmaanden nachten op?** Meet het per maand, niet per jaar. Onder 2 op 1 omzet-tegen-kosten in november gaat het budget naar iets anders.
4. **Staat de kanaalmix nog in balans?** Zodra één kanaal boven 45% komt, wordt het een risico.

## De momenten waarop we bijsturen

| Moment | De vraag | Als het antwoord nee is |
|---|---|---|
| **dec 2026** | Zijn de commerciële posities van gemiddeld 49 naar onder de 35 gezakt? En draait GA4? | Niet met advertenties beginnen in januari; eerst de landingspagina's en de meting op orde |
| **jun 2027** | Zitten we op 45% bezetting over het eerste halfjaar? | Het probleem zit in conversie of in het aanbod, niet in verkeer — het verkeersdoel van 700 is dan namelijk gehaald |
| **dec 2027** | Halen we 55% over het jaar, en staan er ≥ 15 reviews? | Doordeweekse propositie herzien vóór het voorjaar van 2028 |
| **jun 2028** | Zit de doordeweekse bezetting boven 50%? | 70% is dan niet haalbaar; stel het jaardoel bij naar 62% en steek het budget in ADR |
| **dec 2028** | 70% gehaald? | Zo ja: het doel verschuift naar opbrengst per nacht, en pas dán is meer verkeer zinvol |

---

# Bijlage — de belangrijkste aannames op een rij

Deze zes getallen dragen het hele model. Als er één significant afwijkt, verschuift de uitkomst.

| Aanname | Gebruikte waarde | Bandbreedte | Effect bij afwijking |
|---|---|---|---|
| Bezoekers per rijp artikel per maand | 50 | 30 – 120 | Bij 30: het doel schuift ± 8 maanden op |
| Rijpingstijd van een artikel | 6 – 12 mnd | 4 – 18 mnd | Bepaalt de hele tijdlijn |
| CPC Google Ads, accommodatie Drenthe | € 0,85 | € 0,60 – € 1,50 | Bij € 1,50: 200 klikken in plaats van 350 |
| CPC Meta Ads, NL reizen | € 0,42 | € 0,25 – € 0,60 | Idem |
| **Conversie bezoeker → boeking (jaargemiddeld)** | **1,6%** | **0,8 – 2,2%** | **De gevoeligste aanname van het plan. Bij 0,8% zijn er 9.000 bezoekers per jaar nodig in plaats van 4.450 — een factor twee. Op te lossen met GA4.** |
| Doelbezetting als praktisch maximum | 70% | 62 – 75% | Bij 62% scheelt dat ± 58 nachten en € 12.000 omzet per jaar |
| Gemiddelde verblijfsduur | 3,4 nachten | 2,8 – 4,0 | Korter betekent meer boekingen voor dezelfde nachten, en dus meer verkeer nodig |
| Aandeel boekingen via de eigen site | 47% | 35 – 60% | Lager betekent meer commissie, maar minder verkeer nodig |
| Meetperiode van de Search Console-export | 3 maanden | onbevestigd | **Verandert de baseline met een factor 3.** Dit is de belangrijkste onzekerheid en hij is met één blik in Search Console op te lossen. |

De maandelijkse Search Console-sync die in de admin draait, lost die laatste onzekerheid vanaf nu structureel op: elke maand wordt als volledige kalendermaand vastgelegd, dus vanaf de volgende meting is de periode geen aanname meer.

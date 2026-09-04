-- /blog/prive-lodge-boeken-nederland-kosten uitgebreid met echte prijzen.
--
-- Dit artikel staat op positie 6,4 op een prijszoekopdracht en is daarmee het
-- sterkste conversiesignaal van de site: iemand die zoekt wat een privé lodge
-- kost, staat aan het eind van de funnel. Het artikel noemde tot nu toe geen
-- enkel bedrag en eindigde met een nieuwsbriefinschrijving — een stap terug voor
-- precies die bezoeker.
--
-- Wat erbij komt: de eigen tarieven (vanaf €165 per nacht, minimaal twee
-- nachten), wat inbegrepen is, wat er bovenop komt, een rekenvoorbeeld voor een
-- weekend van twee nachten en een FAQ-blok. De vanafprijs staat ook in de intro,
-- want dat is de meta description en op een prijszoekopdracht wint een snippet
-- met een bedrag van een snippet zonder.
--
-- De CTA onder het artikel wijst niet meer naar de nieuwsbrief maar naar de
-- beschikbaarheid; dat zit in de code (CTA_PER_ARTIKEL in
-- src/app/blog/[slug]/page.tsx), niet in deze migratie.
--
-- Deze tekst is gegenereerd uit src/lib/blog-seed.ts, zodat seed en database
-- exact hetzelfde zeggen. De database wint van de seed, dus zonder deze migratie
-- blijft het live artikel de oude tekst tonen.
--
-- Idempotent en veilig: de update raakt de rij alleen zolang de oude leestijd er
-- nog staat, dus een handmatige aanpassing in de admin blijft ongemoeid.

update blog_posts set
  intro    = 'Privé lodges met een eigen hottub zijn een van de snelst groeiende vakantievormen in Nederland. Maar wat betaal je daarvoor eigenlijk, en waar zit het verschil met een hotel of een gewoon vakantiehuis? Een eerlijk overzicht van de prijsfactoren, met onze eigen tarieven erbij: vanaf €165 per nacht, met een rekenvoorbeeld voor een weekend van twee nachten.',
  inhoud   = 'Een paar jaar geleden was een privé lodge met eigen hottub nog een buitenbeentje op de Nederlandse vakantiemarkt. Inmiddels is het een van de snelst groeiende segmenten: steeds meer mensen kiezen voor een volledig privé verblijf met eigen buitenruimte, in plaats van een hotelkamer of een vakantiepark met gedeelde voorzieningen. Maar wat kost zo''n privé lodge eigenlijk, en waar zitten de verschillen? In dit artikel zetten we de belangrijkste prijsfactoren op een rij.

## Wat is een privé lodge precies?

De term "lodge" wordt in Nederland breed gebruikt, maar een écht privé lodge heeft een paar kenmerken die hem onderscheiden van een gewoon vakantiehuisje of een chalet op een vakantiepark. Belangrijkste kenmerk: geen gedeelde voorzieningen. Geen gezamenlijk zwembad, geen receptiegebouw waar je doorheen moet, geen buren op een paar meter afstand. Een privé lodge staat op zichzelf, heeft een eigen terras en vaak een eigen hottub of sauna, en is ontworpen om je vanaf het moment van aankomst volledig privé te laten verblijven.

## Wat bepaalt de prijs van een privé lodge?

De prijs van een privé lodge wordt door een aantal factoren bepaald, die je helpen om aanbiedingen met elkaar te vergelijken:

**Locatie.** Lodges in populaire natuurgebieden of dicht bij de Randstad zijn doorgaans duurder dan lodges in rustigere provincies zoals Drenthe, Overijssel of Friesland. Hoe verder van de drukte, hoe meer ruimte je vaak voor je geld krijgt.

**Voorzieningen.** Een eigen hottub, sauna, open haard of infraroodcabine verhoogt de prijs, maar bepaalt ook grotendeels de ervaring. Een lodge zonder deze voorzieningen is in de praktijk vaak weinig meer dan een goed vakantiehuisje.

**Grootte en indeling.** Lodges voor twee personen zijn doorgaans goedkoper per nacht dan lodges voor grotere groepen, maar de prijs per persoon kan juist hoger uitvallen omdat de vaste kosten (verwarming, onderhoud van hottub en sauna) over minder gasten worden verdeeld.

**Seizoen en dagen van de week.** Net als bij hotels liggen prijzen in het hoogseizoen en in weekenden hoger dan midweeks buiten het seizoen. Wie flexibel is in data, kan vaak aanzienlijk besparen.

**Mate van privacy.** Een lodge die volledig op zichzelf staat, zonder zicht op andere verblijven, is doorgaans duurder dan een vergelijkbare lodge op een park met meerdere units — simpelweg omdat er minder van dat type beschikbaar is.

## Privé lodge versus hotel versus vakantiepark

Een hotelkamer met wellnessfaciliteiten is op het eerste gezicht vaak goedkoper per nacht, maar de vergelijking gaat niet helemaal op: bij een hotel deel je het zwembad, de sauna en de gemeenschappelijke ruimtes met andere gasten, en betaal je vaak apart voor ontbijt, parkeren of toegang tot de spa.

Een vakantiepark zit er qua prijs vaak tussenin, maar ook hier geldt: gedeelde voorzieningen, vaste aankomst- en vertrektijden voor de hele accommodatie, en weinig privacy als het park vol is.

Een privé lodge is qua prijs per nacht vaak vergelijkbaar met of iets hoger dan een goed hotel, maar je betaalt voor de hele ervaring: geen gedeelde ruimtes, geen wachttijden, en voorzieningen als een hottub die je de hele dag en avond tot je beschikking hebt — niet alleen tijdens openingstijden van een spa.

## Wat kost een privé lodge bij Huis ter Huynen?

De meeste aanbieders laten een prijs pas zien nadat je een formulier hebt ingevuld. Wij zetten hem hier gewoon neer, zodat je kunt rekenen voordat je iets aanvraagt.

**Vanaf €165 per nacht.** Dat is de vanafprijs voor een van beide lodges, Lodge De Heide of Lodge De Eik, voor maximaal vier personen. In het hoogseizoen, in de schoolvakanties en rond feestdagen ligt de nachtprijs hoger; doordeweeks buiten het seizoen zit je op de vanafprijs.

**Minimaal twee nachten.** Eén nacht boeken kan niet. De dag van aankomst gaat grotendeels op aan aankomen, en een weekend van vrijdag tot zondag is precies het ritme waar deze plek voor gemaakt is.

**Inbegrepen zonder toeslag:** de privé hottub op je eigen terras, 24 uur per dag op 38 °C, de sauna in Lodge De Heide, gratis wifi, parkeren op eigen terrein en het gebruik van de laadpaal voor een elektrische auto. Bij veel accommodaties staat minstens één van deze punten als losse post op de rekening.

**Bovenop de nachtprijs komen:** schoonmaakkosten en toeristenbelasting van de gemeente Tynaarlo. Optioneel zijn een hond (€25), een late check-out tot 13:00 uur (€25) en het wijzigen van een boeking (€25).

**Geen boekingskosten.** Je boekt rechtstreeks bij de eigenaar. Wat een groot platform als servicekosten bovenop de nachtprijs zet — vaak enkele procenten tot ruim tien procent van het totaal — betaal je hier niet.

## Rekenvoorbeeld: een weekend van twee nachten

Een weekend voor twee personen, vrijdag tot zondag, buiten het hoogseizoen: twee nachten vanaf €165 is €330 aan verblijfskosten. Daar komen schoonmaakkosten en toeristenbelasting bij; die staan als aparte regels in het voorstel dat je krijgt, zodat je ziet waar het bedrag vandaan komt.

Voor dat bedrag heb je een heel huis met een eigen terras en een hottub die van niemand anders is, in plaats van een hotelkamer met een dagkaart voor een gedeelde spa. Wie dezelfde twee nachten in een wellnesshotel boekt, betaalt per persoon en per faciliteit — en deelt het water.

Bij een boeking betaal je 30% aanbetaling; het restant is uiterlijk 30 dagen vóór aankomst aan de beurt. Inchecken kan tussen 15:00 en 21:00 uur, uitchecken uiterlijk om 11:00 uur.

## Waar moet je op letten bij het boeken van een privé lodge?

**Check wat er werkelijk privé is.** Sommige aanbieders noemen een verblijf "privé lodge" terwijl het op een park staat met zicht op andere chalets. Vraag of zoek naar foto''s van de directe omgeving, niet alleen van het interieur.

**Vraag naar de hottub-voorwaarden.** Is de hottub het hele jaar beschikbaar, en op welke temperatuur wordt hij gehouden? Bij sommige aanbieders is dit seizoensgebonden.

**Let op bijkomende kosten.** Schoonmaakkosten, energietoeslag, eventuele toeslag voor huisdieren of laat vertrek kunnen het totaalbedrag flink beïnvloeden. Een eerlijke vergelijking kijkt naar de all-in prijs, niet alleen de nachtprijs.

**Boek bij voorkeur direct.** Direct boeken bij de aanbieder scheelt vaak boekingskosten die via grote platforms worden doorberekend, en geeft je sneller en persoonlijker contact bij vragen.

## Twee privé lodges in Drenthe: Huis ter Huynen

Huis ter Huynen in Zeijen brengt dit concept naar Drenthe: twee volledig privé lodges, Lodge De Heide en Lodge De Eik, allebei met een eigen terras en hottub, midden in de natuur en zonder gedeelde voorzieningen of receptie. Lodge De Heide heeft daarnaast een eigen sauna, Lodge De Eik een buitenkeuken met BBQ onder de eiken. Beide lodges zijn geschikt voor maximaal vier personen.

Je boekt rechtstreeks bij de eigenaar: je geeft je data door en krijgt binnen 24 uur een persoonlijk voorstel met de volledige prijsopbouw erin — nachtprijs, schoonmaakkosten en toeristenbelasting als aparte regels, zodat er onderaan geen verrassing staat.

## Veelgestelde vragen over de prijs van een privé lodge

### Wat kost een privé lodge met hottub per nacht?

Bij Huis ter Huynen begint de nachtprijs bij €165 voor de hele lodge, voor maximaal vier personen, bij een verblijf van minimaal twee nachten. In het hoogseizoen, in de schoolvakanties en rond feestdagen ligt die prijs hoger. Bij andere aanbieders hangt de prijs sterk af van locatie, voorzieningen en de mate van privacy — een lodge die volledig op zichzelf staat, is doorgaans duurder dan een vergelijkbaar huisje op een park.

### Is een privé lodge duurder dan een hotel?

Per nacht vaak vergelijkbaar of iets hoger, maar de vergelijking gaat pas op als je alles meerekent. In een hotel betaal je per persoon, deel je de sauna en het zwembad, en komen ontbijt, parkeren en toegang tot de spa er vaak apart bij. Bij een lodge huur je het hele huis, inclusief de hottub, voor het aantal nachten dat je blijft.

### Welke kosten komen er bovenop de nachtprijs?

Bij ons: schoonmaakkosten en toeristenbelasting van de gemeente Tynaarlo. Optioneel een hond (€25), een late check-out tot 13:00 uur (€25) of het wijzigen van een boeking (€25). Boekingskosten rekenen wij niet, omdat je rechtstreeks boekt. Let bij andere aanbieders vooral op energietoeslagen, linnenpakketten en servicekosten van het platform.

### Hoeveel nachten moet ik minimaal boeken?

Twee. Een weekend van vrijdag tot zondag is de meest geboekte vorm; voor een midweek reken je op drie of vier nachten.

### Kan ik direct boeken of moet ik een aanvraag doen?

Je doet een aanvraag met je data en het aantal gasten, en krijgt binnen 24 uur een persoonlijk voorstel met de totaalprijs. Na akkoord betaal je 30% aanbetaling; het restant is uiterlijk 30 dagen vóór aankomst aan de beurt.',
  leestijd = '10 minuten'
where slug = 'prive-lodge-boeken-nederland-kosten'
  and leestijd = '7 minuten';

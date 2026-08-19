-- LP1 en LP2 herbouwd: /wellness-vakantie-drenthe en /romantisch-weekend-weg-drenthe.
--
-- LP1 (1.526 vertoningen, positie 62,6, nul klikken — de grootste pagina van de
-- site met de slechtste positie): geretarget van "wellness vakantie" naar
-- "wellness huisje" (128 vertoningen, de grootste term in de cluster, die in de
-- oude title helemaal niet voorkwam). "Huisje" en "huis" staan nu in H1, title,
-- intro en FAQ.
--
-- LP2 (1.305 vertoningen, positie 50,1, nul klikken): focus verscherpt op de
-- hoofdterm "romantisch weekendje weg drenthe" (95 vertoningen, positie 26,4 —
-- de enige commerciële term met volume binnen bereik van pagina 1). De pagina
-- was te breed en rankte op tientallen irrelevante termen, wat het gemiddelde
-- omlaag trok.
--
-- Beide URL's blijven ongewijzigd: de opgebouwde history weegt zwaarder dan een
-- zoekwoord in het pad.
--
-- Deze tekst is gegenereerd uit src/lib/landing-seed.ts, zodat seed en database
-- exact hetzelfde zeggen. De database wint van de seed, dus zonder deze migratie
-- blijven de live pagina's de oude tekst tonen. Bewust géén "Importeer
-- standaardpagina's": die knop upsert álle landingspagina's.
--
-- Idempotent en veilig: de update raakt een rij alleen zolang de oude H1 er nog
-- staat, dus een handmatige aanpassing in de admin blijft ongemoeid.

update landing_pages set
  breadcrumb       = 'Wellness huisje Drenthe',
  eyebrow          = 'Privé sauna & jacuzzi · Zeijen · Drenthe',
  h1               = 'Wellness huisje in Drenthe met privé-sauna en jacuzzi',
  hero_sub         = 'Geen gedeelde spa, geen openingstijden, geen onbekenden in bad. Twee vrijstaande wellness huisjes op de heide bij Zeijen, met een eigen jacuzzi op het terras en een sauna die alleen van u is.',
  hero_image_alt   = 'Wellness huisje in Drenthe: Lodge De Eik met privé-jacuzzi op het terras, omringd door bos bij Zeijen',
  intro            = 'Een wellness huisje in Drenthe is iets anders dan een wellnesshotel met een dagkaart. Hier is er geen balie, geen tijdslot en geen gedeelde sauna: u huurt een vrijstaand huis op de heide bij Zeijen, met een jacuzzi op uw eigen terras die het hele jaar op 38 °C staat. Lodge De Heide heeft daarnaast een eigen sauna. Er staan maar twee huisjes op het terrein, dus wie u tegenkomt bepaalt u zelf.',
  sections         = '[{"eyebrow":"Het verschil","heading":"Privé wellness: geen openingstijden, geen onbekenden","body":["In vrijwel elk wellnessresort deelt u het water. U reserveert een tijdslot, u loopt langs een balie en u zit met vreemden in dezelfde sauna. Precies dat is de reden dat steeds meer stellen een wellness huisje huren in plaats van een hotel met wellnessafdeling: het water, het terras en de stilte zijn dan van u alleen.","Bij Huis ter Huynen staan twee vrijstaande lodges op ruime afstand van elkaar, elk met een eigen terras dat uitkijkt op natuur en niet op buren. Geen receptie, geen gedeelde faciliteiten en geen sleutel die u bij iemand moet ophalen. U komt aan, u zet uw tas neer en u kunt binnen tien minuten in de jacuzzi liggen."]},{"eyebrow":"In het huisje","heading":"Wat er in het huisje zit: sauna, jacuzzi en een terras dat niemand inkijkt","body":["Beide huisjes zijn ingericht voor maximaal vier personen, met een volledig uitgeruste keuken, fijne bedden en een eigen buitenruimte. Het verschil tussen de twee zit in de wellness, en daar zijn we eerlijk over: de sauna zit in Lodge De Heide."],"bullets":["Privé-jacuzzi op het terras bij beide lodges — 24/7 beschikbaar, standaard op 38 °C.","Eigen sauna in Lodge De Heide, plus panoramisch uitzicht over het bos.","Lodge De Eik heeft geen sauna, maar wel een buitenkeuken met BBQ onder de eiken.","Volledige privacy: uw terras kijkt uit op heide en bos, niet op een ander huisje.","Wandel- en fietsroutes vanuit de deur, gratis wifi en een laadpaal op het terrein."]},{"eyebrow":"Een weekend","heading":"Een wellnessweekend in Drenthe: hoe zo''n dag eruitziet","body":["Acht uur ''s ochtends: een wandeling over het Zeijerveld, als de dauw er nog ligt en u werkelijk niemand tegenkomt. Terug bij het huisje ontbijt op het terras, met de deur open. De middag is voor niets — een boek, een fietstocht door de esdorpen richting Norg, of een uitstapje naar Assen.","Vijf uur: de sauna aan. Zeven uur: eten, rustig, zonder reservering. Negen uur: de jacuzzi in, met damp boven het water en een sterrenhemel erboven die u in de stad niet krijgt — Drenthe heeft nauwelijks lichtvervuiling. Dat ritme van bewegen, opwarmen, afkoelen en niets moeten is precies waar een wellnessweekend voor bedoeld is."]},{"eyebrow":"Seizoen","heading":"Wellness in de winter: waarom januari en februari het mooist zijn","body":["Warm water werkt het best als het buiten koud is. In januari en februari is het hier om vijf uur al donker, hangt er vaak rijp op de heide en zit u in 38 °C water met uw adem als wolkjes boven het oppervlak. De sauna erna is geen luxe meer maar precies wat het lichaam vraagt.","Praktisch is de winter ook het rustigste seizoen in Drenthe: geen fietsdrukte, lege wandelpaden en meer kans op een vrij weekend. Wie liever de paarse heide ziet, komt in augustus of september — maar voor wellness alleen is de winter de sterkste maand."]},{"eyebrow":"De omgeving","heading":"Wat u in de buurt vindt","body":["Het Nationaal Park Drentsche Aa ligt op een kwartier en het Ballooërveld met zijn schaapskudde op twaalf minuten; vanuit de deur loopt u zo de Zeijerstrubben in. Assen — met restaurants, het Drents Museum en een paar wellnesscentra voor een dag extra verwennerij — is twintig minuten rijden.","Wie de wellness wil combineren met een lange wandeling of een dag op de fiets, vindt in de omgeving genoeg routes om de hele week te vullen zonder twee keer hetzelfde pad te lopen."]}]'::jsonb,
  faq              = 'Is de sauna privé of gedeeld? :: Privé. De sauna zit in Lodge De Heide en is uitsluitend voor de gasten van die lodge — geen reservering, geen tijdslot, geen mede-gasten. Er is op het terrein geen gedeelde wellnessruimte.
Kan ik een wellness huisje boeken voor één nacht? :: Nee, een verblijf duurt minimaal twee nachten. Eén nacht is voor een wellnessweekend ook aan de korte kant: de dag van aankomst gaat grotendeels op aan aankomen.
Is de jacuzzi ook in de winter in gebruik? :: Ja, het hele jaar door. De jacuzzi staat 24/7 op 38 °C, en juist in de winter is hij op zijn mooist: warm water, koude lucht en een heldere sterrenhemel.
Wat is het verschil tussen De Heide en De Eik qua wellness? :: Lodge De Heide heeft naast de privé-jacuzzi een eigen sauna en panoramisch uitzicht over het bos. Lodge De Eik heeft dezelfde jacuzzi op het terras, geen sauna, maar wel een buitenkeuken met BBQ.
Kan ik hier met twee stellen terecht? :: Ja. Elk huisje is geschikt voor maximaal vier personen, dus twee stellen passen in één lodge. Wilt u met een grotere groep komen: beide lodges samen zijn goed voor acht personen — vraagt u dat wel gelijktijdig aan.
Boek ik rechtstreeks bij de eigenaar? :: Ja. Huis ter Huynen wordt particulier verhuurd; u boekt rechtstreeks bij ons, zonder tussenpartij en zonder boekingskosten. Wij reageren binnen 24 uur persoonlijk.',
  related          = 'Vakantiehuis met jacuzzi Drenthe :: /vakantiehuis-met-hottub-drenthe
Romantisch weekendje weg Drenthe :: /romantisch-weekend-weg-drenthe
Wandelroutes in Drenthe :: /wandelroutes-drenthe
Paarse heide Drenthe :: /heide-drenthe',
  cta_title        = 'Boek uw wellness huisje in Drenthe',
  cta_body         = 'De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.',
  meta_title       = 'Wellness Huisje Drenthe | Privé Sauna & Jacuzzi, Geen Gedeelde Spa',
  meta_description = 'Een wellness huisje in Drenthe waar de sauna en jacuzzi alleen van u zijn. Twee vrijstaande lodges op de heide bij Zeijen, 24/7 op temperatuur. Vanaf €165 p.n.',
  updated_at       = now()
where slug = 'wellness-vakantie-drenthe'
  and h1 = 'Wellness vakantie in Drenthe';

update landing_pages set
  breadcrumb       = 'Romantisch weekendje weg Drenthe',
  eyebrow          = 'Voor twee · Zeijen · Drenthe',
  h1               = 'Romantisch weekendje weg in Drenthe — met z''n tweeën, privé jacuzzi',
  hero_sub         = 'Een vrijstaande lodge op de heide bij Zeijen, met een eigen jacuzzi op het terras. Geen receptie, geen buren, geen ontbijtzaal met vreemden. Alleen u tweeën en de stilte van Drenthe.',
  hero_image_alt   = 'Paarse bloeiende heide bij zonsondergang in Drenthe, decor voor een romantisch weekendje weg met z''n tweeën',
  intro            = 'Een romantisch weekendje weg mislukt zelden door de bestemming en meestal door de drukte eromheen: een hotel met een volle ontbijtzaal, een wellnessafdeling vol onbekenden, dunne wanden. Bij Huis ter Huynen huurt u een vrijstaand huisje voor twee op de Drentse heide, met een jacuzzi op uw eigen terras die het hele jaar op 38 °C staat. Er staan maar twee lodges op het terrein, u boekt rechtstreeks bij de eigenaar en vanaf het moment dat u de auto parkeert hoeft u niemand meer te spreken.',
  sections         = '[{"eyebrow":"Privacy","heading":"Met z''n tweeën, en verder niemand","body":["Romantiek verdraagt geen publiek. Dat is de reden dat een vrijstaand huisje voor een weekend met z''n tweeën bijna altijd beter werkt dan een hotelkamer: geen gang met deuren, geen personeel dat langsloopt, geen tijdslot voor de sauna. U doet de deur achter u dicht en de rest van de wereld staat buiten.","Er staan hier twee lodges, op afstand van elkaar, elk met een terras dat uitkijkt op heide en bos in plaats van op een ander huisje. Geen receptie: u krijgt uw eigen toegang en kunt aankomen wanneer het u uitkomt."]},{"eyebrow":"Het moment","heading":"De jacuzzi ''s avonds: het moment waar het weekend om draait","body":["Overdag is Drenthe mooi. ''s Avonds is het stil op een manier die in de Randstad niet bestaat. Als het donker wordt, gaat de jacuzzi aan — of beter: die staat al aan, 24/7 op 38 °C — en zit u in warm, bruisend water met damp boven het oppervlak en een glas binnen handbereik.","Boven u een sterrenhemel die hier werkelijk te zien is: Drenthe kent nauwelijks lichtvervuiling, dus op een heldere avond ziet u de Melkweg staan. Dat is het beeld dat mensen zich van dit weekend herinneren, en het is precies waarom een privé-jacuzzi meer doet dan een wellnessabonnement."]},{"eyebrow":"Het programma","heading":"Twee dagen Drenthe voor stellen: een voorstel","body":["Vrijdagavond aankomen, niets meer plannen. Boodschappen doet u onderweg of laat u klaarzetten; koken kan in de volledig uitgeruste keuken, en Lodge De Eik heeft een buitenkeuken met BBQ. De avond eindigt in de jacuzzi.","Zaterdagochtend een wandeling door de Zeijerstrubben, het strubbenbos direct naast het dorp, of iets verder over het Ballooërveld waar de schaapskudde loopt. ''s Middags met de fiets richting Norg of langs de Drentsche Aa, het mooiste beekdal van Nederland. Eten doet u in Norg of aan de rand van de Norgerberg, op een kwartier rijden.","Zondag uitslapen, ontbijt op het terras, nog één keer het water in. Check-out is om elf uur; wilt u later weg, dan is late check-out tegen een meerprijs mogelijk."]},{"eyebrow":"Ook geschikt","heading":"Ook voor een vriendinnenweekend of met twee stellen","body":["Niet elk weekend met z''n tweeën is romantisch bedoeld, en dat hoeft ook niet. Elke lodge slaapt maximaal vier personen, dus een vriendinnenweekend of een weekend met twee stellen past prima — met dezelfde privé-jacuzzi en dezelfde stilte eromheen.","Komt u met een grotere groep: beide lodges samen zijn goed voor acht personen. Vraag ze dan wel in één keer aan, dan houden we de data bij elkaar."]},{"eyebrow":"Gelegenheden","heading":"Valentijn, verjaardag of jubileum in Drenthe","body":["Februari is hier het rustigste en donkerste seizoen, en juist daardoor het sterkste weekend voor Valentijn: koude lucht, warm water, vrijwel niemand op de heide. Voor een verjaardag of jubileum werkt elk seizoen — de paarse heide in augustus en september, de herfstkleuren in oktober, de rijp in januari.","Viert u iets, laat het bij de aanvraag weten. Wij zetten desgewenst een welkomstpakket met streekproducten klaar; voor iets anders — bloemen, een fles bubbels — kijken we wat er te regelen valt."]}]'::jsonb,
  faq              = 'Is de jacuzzi echt privé? :: Ja. Elke lodge heeft een eigen, afgeschermde jacuzzi op het eigen terras. U deelt hem met niemand buiten uw gezelschap; er is op het terrein geen gedeelde wellnessruimte en er staan maar twee lodges.
Kunnen we laat inchecken? :: Ja. Check-in is vanaf 15:00 uur en er is geen receptie waar u zich hoeft te melden — u krijgt uw eigen toegang, dus ook een aankomst laat op de vrijdagavond is geen probleem. Laat het even weten, dan houden we er rekening mee.
Is er een romantisch arrangement? :: Wij werken niet met vaste arrangementen; u boekt de lodge en kiest zelf wat u erbij wilt. Een welkomstpakket met lokaal bier, kaas en worst kan vooraf worden klaargezet, net als een boodschappenpakket of e-bikes voor een dag.
Kunnen we bloemen of champagne laten klaarzetten? :: Vermeld het bij uw aanvraag. Een welkomstpakket met streekproducten regelen we standaard; voor bloemen of een fles bubbels kijken we per aanvraag wat mogelijk is — wij zijn een kleinschalig adres, geen hotel met roomservice.
Hoe ver is het rijden vanuit de Randstad? :: Reken op twee tot tweeënhalf uur: via de A28 tot afslag Zeijen, en dan nog een paar minuten over de weg het dorp in. Assen ligt op twintig minuten, Groningen op een half uur.
Hoeveel nachten moeten we minimaal boeken? :: Een verblijf duurt minimaal twee nachten. Een weekend van vrijdag tot zondag is de meest geboekte vorm en past precies bij het ritme van deze plek.',
  related          = 'Vakantiehuis met jacuzzi Drenthe :: /vakantiehuis-met-hottub-drenthe
Wellness huisje Drenthe :: /wellness-vakantie-drenthe
Wandelroutes in Drenthe :: /wandelroutes-drenthe
Wat te doen in de omgeving :: /omgeving',
  cta_title        = 'Plan uw romantische weekendje weg in Drenthe',
  cta_body         = 'De lodges zijn al boekbaar voor 2027. Bekijk de vrije weekenden of stel uw vraag — wij reageren binnen 24 uur persoonlijk.',
  meta_title       = 'Romantisch Weekendje Weg Drenthe | Privé Jacuzzi voor Twee',
  meta_description = 'Met z''n tweeën weg in Drenthe: een vrijstaande lodge met eigen jacuzzi op het terras, geen buren, geen receptie. Op de heide bij Zeijen. Vanaf €165 per nacht.',
  updated_at       = now()
where slug = 'romantisch-weekend-weg-drenthe'
  and h1 = 'Romantisch weekend weg in Drenthe';

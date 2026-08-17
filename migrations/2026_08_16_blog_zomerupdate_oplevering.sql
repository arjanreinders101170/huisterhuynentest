-- Blogartikel: zomerse update over de vertraagde oplevering van de lodges.
-- Publiceert direct (gepubliceerd = true) met publicatiedatum 16 augustus 2026.
-- Idempotent: draait deze migratie opnieuw, dan gebeurt er niets.

insert into blog_posts (slug, titel, intro, inhoud, categorie, leestijd, auteur, og_image, gepubliceerd, gepubliceerd_op)
values (
  'zomerupdate-oplevering-lodges',
  'De heide staat in bloei — en wij hebben wat meer tijd nodig',
  'Terwijl half Nederland in de file naar het zuiden staat, kleurt de heide rond Zeijen paars. Een zomerse update vanaf het terrein, met eerlijk nieuws erbij: de oplevering loopt vertraging op, waardoor de lodges helaas nog niet vanaf 1 januari beschikbaar zijn.',
  'Augustus in Zeijen ruikt naar warm zand, dennennaalden en heide. Wie hier nu over het Zeijerveld loopt, ziet wat het hele jaar in de aanloop zat: de heide staat in bloei. Niet een beetje, maar tot aan de horizon — dat diepe paars dat op foto''s altijd net iets te mooi lijkt om waar te zijn, en in het echt gewoon klopt. De bijen weten het al weken. De rest van Nederland staat ondertussen in de file bij Lyon.

Ik stond er vorige week weer, vroeg in de ochtend, met koffie uit een thermoskan. En terwijl ik daar stond, wist ik dat ik dit stukje moest schrijven. Want er is goed nieuws, en er is nieuws waar ik eerlijk over wil zijn.

## Het seizoen waarin Drenthe zichzelf verraadt

Er zijn van die weken waarin een landschap laat zien waarom het bestaat. Voor Drenthe is dat nu. De heidevelden bloeien, de schaduw in de Zeijerstrubben is precies koel genoeg om er op een warme middag in te verdwijnen, en langs de Drentsche Aa hangt ''s ochtends nog die dunne sluier boven het water voordat de zon eroverheen gaat.

Het mooie: het is hier stil. Terwijl de kustplaatsen vollopen en de campings in Zuid-Frankrijk op hun drukst zijn, kun je hier op een doordeweekse middag in augustus een uur wandelen zonder iemand tegen te komen. Dat is geen verkooppraatje, dat is gewoon hoe Zeijen werkt. Het dorp dringt zich niet op, en de natuur eromheen al helemaal niet.

Lees je dit met zand in je koffer, net terug van vakantie of nog midden in de vrije weken: dit is de tijd van het jaar waarin ik het liefst mensen hier zou ontvangen. En precies daarover moet ik iets vertellen.

## Eerlijk is eerlijk: de oplevering loopt vertraging op

De planning was helder. De lodges zouden worden opgeleverd zodat Lodge De Heide en Lodge De Eik vanaf 1 januari beschikbaar zouden zijn voor gasten. Die datum staat al maanden in onze communicatie, in de nieuwsbrief en op de site.

Die datum halen we niet. De oplevering heeft meer tijd nodig dan gepland, en daarmee schuift ook het moment op waarop wij de eerste gasten kunnen ontvangen. De lodges zijn dus helaas nog niet vanaf 1 januari beschikbaar.

Ik had dit liever anders geschreven. Maar niets is vervelender dan een vakantie plannen rond een datum die achteraf niet blijkt te kloppen — en dus vertel ik het liever nu, met de zomer nog aan de gang, dan in december met een mail die niemand wil krijgen.

## Waarom ik liever te laat open dan half af

Het is verleidelijk om toch open te gaan. Deuren open, gasten binnen, en de laatste dingen "gaandeweg" afmaken. Ik heb er serieus over nagedacht, en toch besloten het niet te doen.

Dit project begon niet met een businessplan, maar met een beeld: twee mensen die aankomen, de deur achter zich dichttrekken en eindelijk even helemaal tot rust komen. Dat beeld overleeft geen half afgebouwde lodge. Geen bouwstof op het terras, geen hottub die "volgende week" werkt, geen excuses bij het inchecken. Als je hier een paar dagen komt om even niets te hoeven, dan moet alles al voor je geregeld zijn — inclusief de dingen waar je nooit bij stil zult staan.

Liever een paar weken later open met een plek die klopt, dan op tijd open met een plek die uitleg nodig heeft.

## Wat er ondertussen wél gebeurt

Vertraging in de bouw betekent niet dat er stilstand is. Achter de schermen gaat het gewoon door: de inrichting van beide lodges ligt klaar tot aan de laatste details, de praktische zaken rond aankomst en sleutelloze check-in staan, en de omgeving — de wandelrondjes, de fietsroutes, de plekken waar je ''s avonds nog even naartoe kunt — hebben we in alle seizoenen zelf gelopen en gefietst.

Dat laatste is trouwens het aangenaamste deel van het werk. Ik ken inmiddels het verschil tussen het Zeijerveld in april en het Zeijerveld in augustus, en ik weet welke route je moet lopen als het net geregend heeft. Die kennis komt straks in de map die in beide lodges klaarligt.

## Wat betekent dit voor jou?

Vooral dit: reken voor je plannen in de eerste weken van het nieuwe jaar nog niet op ons. Heb je al een aanvraag gedaan of sta je op de lijst voor de opening, dan nemen we persoonlijk contact met je op zodra de nieuwe datum vaststaat — je hoeft daar zelf niets voor te doen.

Zodra de nieuwe openingsdatum definitief is, hoor je het. Niet via een omweg, maar direct: nieuwsbrief-abonnees krijgen als eersten bericht, met de datum, de tarieven en het vroegboekvoordeel dat we voor die groep achterhouden. Dat voordeel blijft gewoon staan — de vertraging gaat niet ten koste van de mensen die vanaf het begin meekijken.

En tot die tijd houden we je op de hoogte van de voortgang. Niet met marketingpraat, maar met wat het is: foto''s vanaf het terrein, de stand van zaken en het eerlijke verhaal als er weer iets verandert.

## Tot slot: bewaar deze zomer even

Ben je nu op vakantie, of net terug: houd dat gevoel vast van de eerste ochtend waarop je nergens heen hoefde. Dat gevoel proberen wij hier straks te maken, op een terras aan de rand van de heide, met een hottub die dampt in de avondlucht en verder vooral heel veel niets.

Het duurt iets langer dan gehoopt. Maar de heide bloeit hier elk jaar opnieuw, en wij zijn er klaar voor zodra het klopt. Je hoort van ons.',
  'Verhaal',
  '5 minuten',
  'Arjan Reinders',
  '/heide3.jpg',
  true,
  '2026-08-16'
)
on conflict (slug) do nothing;

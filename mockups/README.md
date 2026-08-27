# Mockups

Twee frontend-mockups van het merkdak **Wad & Wold**: één merk boven meerdere
vakantiewoningen. Beide zijn zelfstandige HTML-bestanden die de foto's uit
`../public/` lezen — open ze rechtstreeks in een browser.

Bovenin schakel je tussen de schermen; de adresbalk erboven laat per scherm
zien welke URL erbij hoort en of die pagina geïndexeerd mag worden.

## wad-en-wold-v2.html — huidige versie

Payoff: *luxe vakantiehuizen tussen wad en wold*. Zes landschappen (zon, zee,
strand, wad, duinen, bos & heide) in plaats van twee streken, een relaxte
luxe-sfeer zonder gastheer-taal, en de omzetknoppen erbij: arrangementen,
cadeaubon en midweek.

| Scherm | Wat het toont |
|---|---|
| Home | Diptiek-hero, landschappenband, drie huizen, arrangementen, midweek |
| Onze huizen | Resultaten met filters op wat er voor de deur ligt |
| Huispagina | Galerij, sticky boekingskaart, kalender, arrangement-upsell, FAQ |
| Boeken | Drie stappen; verplichte kosten vóór de optionele, arrangementen erachter |
| Structuur & SEO | De payoff-versus-zoekterm-afweging, de landschapslaag, URL-structuur, contentbudget en de domeinkeuze |
| Bouwplan | De `LodgeId`-blokkade, het datacontract dat ervoor in de plaats komt, route-naar-bestand, kwaliteitsbudget, shotlist en volgorde |

Vijf van de zes landschapstegels zijn ontworpen kleurvlakken in afwachting van
fotografie. Ze zijn expres als art direction vormgegeven, niet als kapotte
afbeelding. De shotlist staat in het tabblad Bouwplan.

## wad-en-wold.html — eerste versie

Bewaard ter vergelijking. Zelfde structuur, maar met heide en bos als
dominante sfeer en zonder de marketing- en bouwlaag.

---

Alle inhoud is mockup-materiaal. Prijzen sluiten aan op `PRICE_FROM_EUR` uit
`src/lib/site.ts`; reviews, het derde huis en de arrangementsprijzen zijn als
voorbeeld gemarkeerd.

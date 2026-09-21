-- De prijs in de feitenbalk van beide lodgepagina's.
--
-- Aanleiding: op een telefoon stond het eerste bedrag op /lodge-de-heide pas
-- op ruim 40% van de paginahoogte — in de sectie "Prijzen en beschikbaarheid",
-- ongeveer 5.300 pixels naar beneden op een pagina van ruim 12.000. De pagina
-- is de afgelopen weken flink gegroeid (kamerindeling, voorzieningen,
-- praktische informatie, huisregels, annuleren) en de prijs schoof daarmee
-- mee naar achteren.
--
-- Twee dingen zijn daaraan gedaan. De hero toont de vanafprijs nu vóór de
-- knoppen in plaats van eronder (LandingTemplate). En hier: de prijs komt in
-- de feitenbalk, het groene blok direct onder de hero. Dat is het blok dat een
-- bezoeker scant voordat hij begint te lezen — en juist daar ontbrak het
-- enige gegeven waar hij op dat moment naar zoekt. Personen, slaapkamers,
-- badkamer en oppervlak stonden er wel.
--
-- Het bedrag is hetzelfde dat al in de hero, in de sectie "Prijzen en
-- beschikbaarheid", in de FAQ en in de meta-omschrijving staat: vanaf €165
-- per nacht voor de hele lodge.
--
-- Idempotent en veilig bij een pagina die in de admin is bijgewerkt: de regel
-- wordt vóór de bestaande feiten geplakt en alleen als er nog geen prijsregel
-- staat. Draaien na een handmatige wijziging verandert dus niets.

update landing_pages
   set key_facts = 'Prijs :: Vanaf €165 per nacht' || chr(10) || key_facts,
       updated_at = now()
 where slug in ('lodge-de-heide', 'lodge-de-eik')
   and key_facts is not null
   and key_facts <> ''
   and key_facts not like '%Prijs ::%';

-- Controle na afloop: beide pagina's horen met de prijsregel te beginnen.
--
--   select slug, split_part(key_facts, chr(10), 1) as eerste_feit
--     from landing_pages
--    where slug in ('lodge-de-heide', 'lodge-de-eik');

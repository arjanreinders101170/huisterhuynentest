-- /fochteloerveen-drenthe: hero en og_image rechtzetten.
--
-- De hero was heide2.jpg, met een hunebed prominent in beeld. Dat klopt niet
-- met de pagina zelf: de intro opent met "geen bos, geen houtwallen, maar een
-- wijds, open veenlandschap", en in het Fochteloërveen ligt geen enkele
-- zwerfkei — hoogveen groeit op regenwater, niet op keileem met megalietgraven.
-- Diezelfde foto stond ook als og_image ingesteld, dus elke gedeelde link naar
-- de hoogveenpagina toonde een prehistorisch grafmonument.
--
-- wandel_drenthe.jpg toont wél wat de pagina beschrijft: een vlonderpad over
-- nat veen met pijpenstrootje, veenplassen en berkenopslag. De FAQ noemt die
-- vlonderpaden zelfs met zoveel woorden.
--
-- og_image gaat op leeg: dan genereert /api/og/landing een eigen kaart met de
-- H1 van deze pagina, in plaats van een foto te delen met een andere pagina.
--
-- De seed in src/lib/landing-seed.ts is gelijk bijgewerkt; deze migratie doet
-- hetzelfde voor de rij die al in de database staat (de database wint van de
-- seed). Bewust géén "Importeer standaardpagina's": die knop upsert álle
-- landingspagina's en overschrijft ook handmatige aanpassingen elders.
--
-- Idempotent: raakt de rij alleen zolang de oude foto er nog staat, dus een
-- handmatige aanpassing in de admin blijft ongemoeid.

update landing_pages set
  hero_image     = '/wandel_drenthe.jpg',
  hero_image_alt = 'Vlonderpad over nat hoogveen met pijpenstrootje, veenplassen en berkenopslag in Noord-Drenthe',
  hero_focus     = '50% 60%',
  og_image       = '',
  updated_at     = '2026-08-24'::timestamptz
where slug = 'fochteloerveen-drenthe'
  and hero_image = '/heide2.jpg';

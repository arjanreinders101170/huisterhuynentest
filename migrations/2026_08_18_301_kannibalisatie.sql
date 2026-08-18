-- 301-samenvoegingen tegen kannibalisatie (marketingtaken s26-6, s26-7, s26-8).
--
-- De redirects zelf staan in src/lib/redirects.ts en worden door next.config.ts
-- als permanente 301 geserveerd. Deze migratie haalt de bijbehorende rijen uit
-- de publicatie, zodat ze ook niet meer in de admin-overzichten, het
-- blogoverzicht of de sitemap opduiken als de code-filters ooit wijzigen.
-- De inhoud blijft bewaard (niets wordt verwijderd) — alleen gepubliceerd = false.
-- Idempotent: opnieuw draaien verandert niets.
--
-- Alternatief: de admin-knop "Importeer standaardpagina's" (landingspagina's)
-- en "Importeer conceptartikelen" (blog) doen sinds deze wijziging hetzelfde.

-- s26-6: blog over de privé-hottub → /vakantiehuis-met-hottub-drenthe
-- s26-7: blog over wellness → /wellness-vakantie-drenthe
update blog_posts
set gepubliceerd = false
where slug in (
  'vakantiehuis-met-prive-hottub-in-drenthe-pure-luxe-rust-en-beleving',
  'wellness-in-drenthe'
);

-- s26-8: tweede wandel-landingspagina → /wandelroutes-drenthe
update landing_pages
set gepubliceerd = false
where slug = 'wandelen-drentsche-aa';

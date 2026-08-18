-- Marketingtaak s26-9: de fietsslug van 250+ tekens inkorten.
--
-- De oude URL was een volledige alinea, werd afgekapt in de zoekresultaten en
-- oogde als spam (28 vertoningen, positie 30,1). Het artikel verhuist naar
-- /blog/fietsen-in-drenthe; de oude URL geeft een 301 naar de nieuwe (zie
-- src/lib/redirects.ts).
--
-- LET OP: draai deze migratie samen met de deploy. Zonder de hernoeming wijst
-- de 301 naar een artikel dat nog niet op de korte slug staat.
--
-- Idempotent: draait hij opnieuw, dan bestaat de oude slug niet meer en gebeurt
-- er niets. De not-exists-clausule voorkomt bovendien een botsing als er al een
-- artikel op de korte slug staat.

update blog_posts
set slug = 'fietsen-in-drenthe',
    updated_at = now()
where slug = 'fietsen-in-drenthe-is-misschien-wel-de-mooiste-manier-om-de-provincie-echt-te-beleven-uitgestrekte-heidevelden-eeuwenoude-bossen-kronkelende-beekdalen-karakteristieke-brinkdorpen-en-kilometers-autoluwe-fietspaden-maken-drenthe-tot-een-waar-paradijs-voor-fietsers'
  and not exists (
    select 1 from blog_posts b where b.slug = 'fietsen-in-drenthe'
  );

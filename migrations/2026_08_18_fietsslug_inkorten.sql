-- Fietsartikel: slug van 250+ tekens inkorten naar /blog/fietsen-in-drenthe.
--
-- De slug van dit artikel was de complete intro-alinea. In de SERP wordt zo'n
-- URL afgekapt en oogt hij als spam: 28 vertoningen op positie 30,1 en
-- nauwelijks klikken. De oude URL wordt in next.config.ts met een 301 naar de
-- nieuwe slug gestuurd, zodat de opgebouwde linkwaarde meeverhuist.
--
-- Idempotent: draait deze migratie opnieuw of bestaat 'fietsen-in-drenthe' al,
-- dan gebeurt er niets.

update blog_posts
   set slug = 'fietsen-in-drenthe'
 where slug = 'fietsen-in-drenthe-is-misschien-wel-de-mooiste-manier-om-de-provincie-echt-te-beleven-uitgestrekte-heidevelden-eeuwenoude-bossen-kronkelende-beekdalen-karakteristieke-brinkdorpen-en-kilometers-autoluwe-fietspaden-maken-drenthe-tot-een-waar-paradijs-voor-fietsers'
   and not exists (select 1 from blog_posts b where b.slug = 'fietsen-in-drenthe');

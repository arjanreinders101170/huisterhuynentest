-- De sitemap laat zien dat het prijsartikel herschreven is.
--
-- migrations/2026_09_04_blog_prive_lodge_kosten_uitbreiden.sql verving de tekst
-- van /blog/prive-lodge-boeken-nederland-kosten, maar raakte updated_at niet
-- aan: een update ververst een kolomdefault niet. De sitemap leidde de lastmod
-- tot nu toe bovendien alleen af van gepubliceerd_op, en die hoort niet te
-- verschuiven — het artikel is niet opnieuw gepubliceerd, het is herschreven.
--
-- Gevolg: Google zag aan de sitemap niet dat de pagina veranderd was, precies
-- bij het artikel dat op positie 6,4 staat op een prijszoekopdracht en het
-- sterkste conversiesignaal van de site is.
--
-- De sitemap neemt nu de nieuwste van updated_at en gepubliceerd_op (zie
-- src/app/sitemap.ts). Deze migratie zet updated_at op de dag waarop de tekst
-- daadwerkelijk veranderde, zodat die lastmod klopt.
--
-- Een vaste datum in plaats van now(): dan is de uitkomst niet afhankelijk van
-- het moment van draaien, en zegt de lastmod wat er echt gebeurd is.
--
-- Idempotent en veilig: draait de migratie nog eens, of is het artikel
-- intussen in de admin bijgewerkt, dan blijft de nieuwere datum staan.

update blog_posts
   set updated_at = timestamptz '2026-09-04 12:00:00+02'
 where slug = 'prive-lodge-boeken-nederland-kosten'
   and updated_at < timestamptz '2026-09-04 12:00:00+02';

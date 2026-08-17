-- Unieke social-share previews per pagina.
--
-- Er zijn maar een handvol foto's in /public voor ruim twintig landingspagina's
-- en twintig blogs, waardoor dezelfde afbeelding (vooral lodge-heide.jpg) de
-- preview was van meerdere pagina's tegelijk — slechte CTR op social media.
--
-- Nieuwe regel: een foto is de OG-preview van hoogstens één pagina. Staat er
-- geen eigen foto in og_image, dan genereert de site per pagina een eigen kaart
-- met de eigen titel (/api/og/blog en /api/og/landing).
--
-- Deze migratie maakt og_image leeg bij de pagina's die een foto deelden met een
-- andere pagina. De `and og_image = '...'` clausule maakt het idempotent en laat
-- een in de admin handmatig gekozen andere foto ongemoeid.

-- ── Landingspagina's ─────────────────────────────────────────────────────────
-- lodge-heide.jpg blijft de preview van de homepage.
update landing_pages set og_image = null
  where slug = 'vakantiehuis-met-hottub-drenthe' and og_image = '/lodge-heide.jpg';
update landing_pages set og_image = null
  where slug = 'vakantiehuis-assen' and og_image = '/lodge-heide.jpg';
update landing_pages set og_image = null
  where slug = 'de/ferienhaus-mit-whirlpool-drenthe' and og_image = '/lodge-heide.jpg';
update landing_pages set og_image = null
  where slug = 'de/wellness-urlaub-drenthe' and og_image = '/lodge-heide.jpg';

-- lodge-eik.jpg blijft bij /luxe-lodge-drenthe.
update landing_pages set og_image = null
  where slug = 'wellness-vakantie-drenthe' and og_image = '/lodge-eik.jpg';
update landing_pages set og_image = null
  where slug = 'de/luxus-lodge-drenthe' and og_image = '/lodge-eik.jpg';

-- heide1.jpg blijft bij /heide-drenthe, heide2.jpg bij /fochteloerveen-drenthe,
-- heide3.jpg bij /overnachten-veenhuizen.
update landing_pages set og_image = null
  where slug = 'romantisch-weekend-weg-drenthe' and og_image = '/heide1.jpg';
update landing_pages set og_image = null
  where slug = 'bijzonder-overnachten-drenthe' and og_image = '/heide2.jpg';
update landing_pages set og_image = null
  where slug = 'de/romantisches-wochenende-drenthe' and og_image = '/heide3.jpg';

-- wandel_drenthe.jpg blijft bij /wandelroutes-drenthe.
update landing_pages set og_image = null
  where slug = 'vakantiehuis-norg' and og_image = '/wandel_drenthe.jpg';
update landing_pages set og_image = null
  where slug = 'vakantiehuis-drenthe-met-hond' and og_image = '/wandel_drenthe.jpg';

-- ── Blogartikelen ────────────────────────────────────────────────────────────
-- Elke blog krijgt een eigen gegenereerde kaart; alleen wellness-in-drenthe
-- houdt een foto (welness_drenthe.jpg wordt nergens anders als preview gebruikt).
update blog_posts set og_image = null
  where slug = 'fietsvakantie-drenthe' and og_image = '/rent_a_bike.jpg';
update blog_posts set og_image = null
  where slug = 'e-bike-huren-in-drenthe' and og_image = '/rent_a_bike.jpg';
update blog_posts set og_image = null
  where slug = 'wandelroute-zeijen-veentjesroute' and og_image = '/wandel_drenthe.jpg';
update blog_posts set og_image = null
  where slug = 'drentsche-aa-beekdallandschap' and og_image = '/wandel_drenthe.jpg';
update blog_posts set og_image = null
  where slug = 'kanovaren-drentsche-aa' and og_image = '/wandel_drenthe.jpg';
update blog_posts set og_image = null
  where slug = 'drenthe-of-de-veluwe-natuurweekend' and og_image = '/heide2.jpg';
update blog_posts set og_image = null
  where slug = 'een-dag-in-norg' and og_image = '/heide2.jpg';
update blog_posts set og_image = null
  where slug = 'digitale-detox-drenthe' and og_image = '/heide3.jpg';
update blog_posts set og_image = null
  where slug = 'herfst-in-drenthe-heide' and og_image = '/heide3.jpg';
update blog_posts set og_image = null
  where slug = 'zomerupdate-oplevering-lodges' and og_image = '/heide3.jpg';
update blog_posts set og_image = null
  where slug = 'vakantie-met-hond-in-drenthe' and og_image = '/heide1.jpg';
update blog_posts set og_image = null
  where slug = 'prive-lodge-boeken-nederland-kosten' and og_image = '/lodge-heide.jpg';

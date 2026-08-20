-- F-26 · CRITICAL · "Service role full access" gaf iedereen volledige toegang
--
-- Negen tabellen droegen een policy met deze naam:
--
--   policyname: "Service role full access"
--   roles:      {public}          ← niet {service_role}
--   cmd:        ALL
--   qual:       true
--   with_check: true
--
-- In PostgreSQL is `public` niet "de publieke rol" maar de pseudo-rol die
-- ELKE rol omvat, inclusief `anon` en `authenticated`. Een policy TO public
-- met USING (true) WITH CHECK (true) voor ALL commando's legt dus geen enkele
-- beperking op: iedereen mag lezen, invoegen, wijzigen en verwijderen.
--
-- De naam suggereerde het tegenovergestelde van wat de policy deed, en dat is
-- waarschijnlijk hoe hij jaren kon blijven staan.
--
-- Wat er achter die tabellen zit:
--   stays               stay-tokens en deurcodes — de sleutels tot /api/stay
--                       en /api/nuki/unlock, en daarmee tot de fysieke deur
--   guests              naam en e-mailadres van elke gast
--   invoices            factuurnummers, bedragen, Mollie payment-ID's
--   bookings            boekingen inclusief tracking-metadata
--   terugkeer_aanvragen aanvragen met gastgegevens
--   products, pricing_periods, blocked_dates, reviews
--
-- Let ook op reviews: PERMISSIVE policies worden met OR gecombineerd, dus de
-- correcte `anon_read_visible_reviews` (alleen zichtbaar = true) werd volledig
-- overruled door de ALL-policy ernaast.
--
-- ── Waarom simpelweg droppen de juiste fix is ──
--
-- De service-role omzeilt RLS altijd; die heeft nooit een policy nodig gehad.
-- Deze policies gaven service_role dus niets extra's, en `anon` alles. Ze
-- kunnen weg zonder dat er iets in de applicatie verandert: alle server-routes
-- gebruiken de service-role client, en de enige plek die de anon-client
-- gebruikt (/api/reviews GET) valt netjes onder `anon_read_visible_reviews`.

BEGIN;

DROP POLICY IF EXISTS "Service role full access" ON guests;
DROP POLICY IF EXISTS "Service role full access" ON products;
DROP POLICY IF EXISTS "Service role full access" ON stays;
DROP POLICY IF EXISTS "Service role full access" ON invoices;
DROP POLICY IF EXISTS "Service role full access" ON blocked_dates;
DROP POLICY IF EXISTS "Service role full access" ON bookings;
DROP POLICY IF EXISTS "Service role full access" ON pricing_periods;
DROP POLICY IF EXISTS "Service role full access" ON terugkeer_aanvragen;
DROP POLICY IF EXISTS "Service role full access" ON reviews;

-- Deze policy deed hetzelfde onder een andere naam.
DROP POLICY IF EXISTS "Public can read visible reviews" ON reviews;

-- RLS moet daadwerkelijk aanstaan, anders zijn policies sowieso inert en
-- beslissen alleen de table-grants. blocked_dates ontbrak in de baseline.
ALTER TABLE guests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays               ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_periods     ENABLE ROW LEVEL SECURITY;
ALTER TABLE terugkeer_aanvragen ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;

-- Table-grants worden los van RLS geëvalueerd. Zonder deze REVOKE blijft
-- toegang afhangen van wat er ooit is uitgedeeld.
REVOKE ALL ON guests,
              products,
              stays,
              invoices,
              blocked_dates,
              bookings,
              pricing_periods,
              terugkeer_aanvragen
  FROM anon, authenticated;

-- reviews houdt precies één recht: de anon-client leest de zichtbare reviews
-- voor de homepage (/api/reviews GET, via getPublicSupabase).
REVOKE ALL ON reviews FROM anon, authenticated;
GRANT SELECT ON reviews TO anon;

COMMIT;

-- ── Controle ná uitvoeren ──
--
-- 1. Er mag geen enkele policy meer TO public bestaan:
--
--    SELECT tablename, policyname, roles, cmd
--    FROM pg_policies WHERE schemaname = 'public' AND 'public' = ANY(roles);
--    -- verwacht: 0 rijen
--
-- 2. Alleen de review-policy voor anon blijft over:
--
--    SELECT tablename, policyname, roles, cmd, qual FROM pg_policies
--    WHERE schemaname = 'public';
--    -- verwacht: alleen anon_read_visible_reviews
--
-- 3. RLS staat overal aan:
--
--    SELECT relname, relrowsecurity FROM pg_class
--    WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
--    ORDER BY relrowsecurity, relname;
--    -- verwacht: relrowsecurity = true voor élke tabel
--
-- 4. Rooktest van de applicatie: de homepage moet nog reviews tonen
--    (dat is het enige pad dat de anon-client gebruikt).

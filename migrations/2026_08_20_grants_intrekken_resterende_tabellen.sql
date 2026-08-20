-- F-27 · Medium · Latente grants op de resterende tabellen intrekken
--
-- Vervolg op 2026_08_20_rls_public_policies_intrekken.sql (F-26). Die migratie
-- ruimde de negen tabellen op die een policy TO public droegen. Uit de
-- controle daarna (scripts/check-rls.sql) blijkt dat veertien andere tabellen
-- nog steeds volledige DML-rechten aan anon en authenticated geven:
--
--   SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
--
-- ── Dit is nu géén actief lek ──
--
-- Alle veertien hebben RLS aan en nul policies. PostgreSQL hanteert dan een
-- impliciete deny: je hebt zowel een grant als een policy nodig, en die tweede
-- ontbreekt. Anon komt er dus nergens bij.
--
-- ── Waarom het toch weg moet ──
--
-- Deze grants zijn de helft van het slot die openstaat. F-26 was juist zo
-- ernstig omdat daar allebei de helften aanwezig waren: de grants stonden er
-- al (Supabase deelt ze standaard uit aan elke nieuwe tabel in `public`), en
-- toen kwam er een permissive policy TO public bij. Dat is één handeling in
-- het dashboard.
--
-- Door de grants in te trekken kan diezelfde vergissing niet meer hetzelfde
-- gevolg hebben: zonder grant is een verkeerd gerichte policy alsnog inert.
--
-- ── Waarom dit veilig is voor de applicatie ──
--
-- Elke server-route gebruikt de service-role client, en die omzeilt RLS én
-- heeft eigen rechten. De enige plek die de anon-client gebruikt is
-- /api/reviews GET (getPublicSupabase), en `reviews` staat hier bewust niet
-- tussen — die houdt zijn anon:SELECT uit de vorige migratie.
--
-- Zwaarst wegen admin_sessions en admin_magic_tokens (inlogsessies met
-- e-mailadressen en IP's), booking_requests (gastnaam, e-mailadres, bericht
-- en confirm_token) en newsletter_subscribers (de volledige adressenlijst).

BEGIN;

REVOKE ALL ON admin_magic_tokens,
              admin_sessions,
              availability_discounts,
              blog_posts,
              booking_requests,
              discount_codes,
              fee_templates,
              gsc_metrics,
              gsc_sync_log,
              landing_pages,
              marketing_task_status,
              newsletter_subscribers,
              nuki_unlock_log,
              pricing_config
  FROM anon, authenticated;

-- RLS stond blijkens de controle al overal aan; dit maakt dat expliciet en
-- idempotent, zodat een tabel die er ooit doorheen glipt hier wordt gevangen.
ALTER TABLE admin_magic_tokens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_templates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_metrics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE gsc_sync_log           ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_task_status  ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE nuki_unlock_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config         ENABLE ROW LEVEL SECURITY;

COMMIT;


-- ═══ Aanbevolen, maar bewust NIET in deze migratie ═══
--
-- De grondoorzaak is dat Supabase élke nieuwe tabel in `public` automatisch
-- deze rechten geeft. Zolang dat zo staat, komt de volgende tabel die je
-- aanmaakt met dezelfde openstaande helft binnen.
--
-- Dat is te veranderen met default privileges:
--
--   ALTER DEFAULT PRIVILEGES IN SCHEMA public
--     REVOKE ALL ON TABLES FROM anon, authenticated;
--
-- Ik heb dit er niet in gezet omdat ik het niet tegen jouw project heb kunnen
-- testen, en het schemabreed werkt in plaats van per tabel. Het raakt alleen
-- toekomstige tabellen, niet bestaande. Wil je het: draai het los, maak daarna
-- een testtabel aan en controleer met scripts/check-rls.sql dat die zonder
-- anon-grants binnenkomt — en dat het Supabase-dashboard nog normaal werkt.


-- ═══ Controle ná uitvoeren ═══
--
-- Draai scripts/check-rls.sql opnieuw. Verwacht:
--
--   - elke tabel: rls_aan = true, policies = 0, rechten = '—'
--   - één uitzondering: reviews | true | 1 | anon:SELECT
--   - de vangnet-query (policy TO public) geeft nul rijen
--
-- Rooktest daarna: de homepage moet nog steeds reviews tonen. Dat is het
-- enige pad in de applicatie dat de anon-client gebruikt.

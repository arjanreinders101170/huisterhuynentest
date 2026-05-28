-- H1: RLS baseline — tweede verdedigingslinie als de anon key lekt
--
-- Strategie: streng beginnen.
--   - RLS aan op alle tabellen
--   - Anon krijgt standaard NIKS (geen policy = geen toegang)
--   - Uitzondering: reviews.SELECT where zichtbaar=true
--     (enige tabel die /api/reviews via de anon-client leest)
--   - Service-role bypast RLS altijd — bestaande server-side code werkt onveranderd

-- ── Gevoelige tabellen: alleen service-role ──────────────────────────────────
ALTER TABLE guests                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE terugkeer_aanvragen     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices                ENABLE ROW LEVEL SECURITY;
ALTER TABLE nuki_unlock_log         ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes          ENABLE ROW LEVEL SECURITY;

-- ── Pricing / config: intern gebruik, geen anon policy ──────────────────────
ALTER TABLE pricing_periods         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config          ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_discounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_templates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products                ENABLE ROW LEVEL SECURITY;

-- ── Publieke content: RLS aan, maar nog steeds via service-role gelezen ─────
ALTER TABLE blog_posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages           ENABLE ROW LEVEL SECURITY;

-- ── Reviews: enige tabel die de anon-client (getPublicSupabase) gebruikt ────
ALTER TABLE reviews                 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_visible_reviews"
  ON reviews
  FOR SELECT
  TO anon
  USING (zichtbaar = true);

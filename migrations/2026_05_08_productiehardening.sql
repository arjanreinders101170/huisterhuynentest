-- 1. Lodge-kolommen
ALTER TABLE bookings              ADD COLUMN lodge text;
ALTER TABLE reviews               ADD COLUMN lodge text;
ALTER TABLE terugkeer_aanvragen   ADD COLUMN lodge text;
ALTER TABLE invoices              ADD COLUMN lodge text;

-- Backfill bestaande rijen via guest_id → meest recente stay (best-effort)
UPDATE bookings b SET lodge = s.lodge
  FROM stays s WHERE s.guest_id = b.guest_id AND b.lodge IS NULL;
UPDATE reviews r SET lodge = s.lodge
  FROM stays s WHERE s.guest_id = r.guest_id AND r.lodge IS NULL;

-- Constraint na backfill (lodge mag NULL blijven voor legacy rows; nieuwe rows worden gevalideerd in app)
ALTER TABLE bookings              ADD CONSTRAINT chk_bookings_lodge   CHECK (lodge IS NULL OR lodge IN ('lodge_1','lodge_2'));
ALTER TABLE reviews               ADD CONSTRAINT chk_reviews_lodge    CHECK (lodge IS NULL OR lodge IN ('lodge_1','lodge_2'));
ALTER TABLE terugkeer_aanvragen   ADD CONSTRAINT chk_aanvragen_lodge  CHECK (lodge IS NULL OR lodge IN ('lodge_1','lodge_2'));
ALTER TABLE invoices              ADD CONSTRAINT chk_invoices_lodge   CHECK (lodge IS NULL OR lodge IN ('lodge_1','lodge_2'));
CREATE INDEX idx_bookings_lodge   ON bookings(lodge);
CREATE INDEX idx_reviews_lodge    ON reviews(lodge) WHERE zichtbaar = true;

-- 2. Admin sessions
CREATE TABLE admin_sessions (
  id           text PRIMARY KEY,            -- random 32-byte hex
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  revoked_at   timestamptz,
  ip           text,
  user_agent   text
);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at) WHERE revoked_at IS NULL;

-- 3. Audit log
CREATE TABLE audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_session_id text REFERENCES admin_sessions(id) ON DELETE SET NULL,
  action          text NOT NULL,             -- 'create_product', 'delete_product', 'send_welcome', etc.
  resource_type   text NOT NULL,             -- 'product', 'stay', 'review', 'booking'
  resource_id     text,
  payload         jsonb,
  ip              text,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created  ON audit_log(created_at DESC);

-- 4. Mollie webhook events (idempotency)
CREATE TABLE mollie_webhook_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      text NOT NULL,
  payment_status  text NOT NULL,            -- 'paid', 'failed', etc.
  booking_id      uuid REFERENCES bookings(id) ON DELETE SET NULL,
  signature_valid boolean NOT NULL,
  processed       boolean NOT NULL DEFAULT false,
  raw_body        text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_mollie_event UNIQUE (payment_id, payment_status)
);
CREATE INDEX idx_mollie_event_payment ON mollie_webhook_events(payment_id);

-- 5. Token expiry kolommen
ALTER TABLE stays                ADD COLUMN expires_at timestamptz;
ALTER TABLE terugkeer_aanvragen  ADD COLUMN confirm_token_expires_at timestamptz;

-- Backfill stays: 1 dag na check_out, 12:00
UPDATE stays SET expires_at = (check_out::timestamptz + interval '1 day 12 hours') WHERE expires_at IS NULL;
-- Backfill aanvragen: 14 dagen na created_at (alleen als confirm_token gezet)
UPDATE terugkeer_aanvragen SET confirm_token_expires_at = (created_at + interval '14 days')
  WHERE confirm_token IS NOT NULL AND confirm_token_expires_at IS NULL;

-- 6. Invoice idempotency
ALTER TABLE invoices ADD CONSTRAINT uq_invoice_booking UNIQUE (booking_id);
ALTER TABLE invoices ADD CONSTRAINT uq_invoice_number  UNIQUE (invoice_number);

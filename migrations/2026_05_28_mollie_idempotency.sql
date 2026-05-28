-- K2: Mollie webhook idempotency
-- Voorkomt dat een webhook-retry dezelfde boeking tweemaal als betaald markeert
-- en tweemaal een factuur aanmaakt / naar e-Boekhouden pusht.

-- Sla het Mollie payment_id op zodat de audit-trail compleet is
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS mollie_payment_id text;

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS mollie_payment_id text;

-- Harde garantie: één factuurrecord per boeking
ALTER TABLE invoices
  ADD CONSTRAINT invoices_booking_id_unique UNIQUE (booking_id);

CREATE INDEX IF NOT EXISTS invoices_mollie_payment_id_idx
  ON invoices (mollie_payment_id)
  WHERE mollie_payment_id IS NOT NULL;

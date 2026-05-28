-- K1: audit-log voor Nuki deuropeningen
-- Elke poging (gelukt én mislukt) wordt vastgelegd met stay, lodge, IP en foutmelding.

CREATE TABLE IF NOT EXISTS nuki_unlock_log (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  stay_id     uuid REFERENCES stays(id) ON DELETE SET NULL,
  lodge       text,
  success     boolean NOT NULL,
  ip          text,
  error_msg   text
);

CREATE INDEX IF NOT EXISTS nuki_unlock_log_created_idx
  ON nuki_unlock_log (created_at DESC);

CREATE INDEX IF NOT EXISTS nuki_unlock_log_stay_idx
  ON nuki_unlock_log (stay_id)
  WHERE stay_id IS NOT NULL;

-- F-10 · RLS op de admin-tabellen
--
-- De baseline-migratie (2026_05_28_rls_baseline.sql) zette RLS aan op zestien
-- tabellen met als expliciete reden: "tweede verdedigingslinie als de anon key
-- lekt". De twee tabellen uit 2026_05_13_admin_magic_link.sql zaten daar niet
-- bij, en die migratie zette zelf ook geen RLS aan. Ze stonden dus open voor
-- de anon key.
--
-- Wat dit NIET was: een authenticatiebypass. De sessiecookie moet HMAC-
-- ondertekend zijn met ADMIN_SESSION_SECRET, en dat secret staat niet in de
-- database — wie session_id uitleest kan er geen geldige cookie mee bouwen.
-- Magic-link-tokens staan bovendien alleen als SHA-256-hash opgeslagen.
--
-- Wat het wel was: met de anon key waren de e-mailadressen, IP-adressen en
-- user agents van alle admin-inlogsessies te lezen, en waren sessies te
-- verwijderen of te laten verlopen (denial of service op admintoegang).
--
-- Geen policies = geen toegang. De service-role client die de app gebruikt
-- omzeilt RLS altijd, dus src/lib/admin-auth.ts blijft ongewijzigd werken.

ALTER TABLE admin_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_magic_tokens ENABLE ROW LEVEL SECURITY;

-- RLS alleen is niet genoeg wanneer de rollen al table-grants hebben: die
-- worden apart geëvalueerd. Expliciet intrekken, zodat toegang niet van een
-- eerder uitgedeelde grant afhangt.
REVOKE ALL ON admin_sessions     FROM anon, authenticated;
REVOKE ALL ON admin_magic_tokens FROM anon, authenticated;

-- Controle na uitvoeren — beide moeten rowsecurity = true tonen:
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE relname IN ('admin_sessions','admin_magic_tokens');

-- ═══ Controle: is de database daadwerkelijk afgeschermd? ═══
--
-- Draai dit in de Supabase SQL-editor. Het combineert de drie lagen die
-- samen bepalen of `anon` ergens bij kan — je hebt ze alle drie nodig,
-- want elke laag kan de andere twee onderuithalen:
--
--   1. rls_aan      Staat RLS uit, dan worden policies genegeerd en
--                   beslissen alleen de grants.
--   2. policies     Een tabel met RLS aan en nul policies = niemand erbij
--                   (op de service-role na, die RLS altijd omzeilt).
--                   Dat is de gewenste stand voor bijna alles hier.
--   3. rechten      Table-grants worden LOS van RLS geëvalueerd. Staat hier
--                   iets, dan hangt de toegang daarvan af.
--
-- Achtergrond: de policy "Service role full access" stond op roles={public}
-- in plaats van {service_role}. `public` is in PostgreSQL de pseudo-rol die
-- élke rol omvat, dus die gaf anon volledige lees- én schrijftoegang tot
-- negen tabellen, waaronder stays (tokens en deurcodes) en guests (PII).
-- Zie migrations/2026_08_20_rls_public_policies_intrekken.sql.

select
  c.relname                                        as tabel,
  c.relrowsecurity                                 as rls_aan,
  (select count(*)
     from pg_policies p
    where p.schemaname = 'public'
      and p.tablename  = c.relname)                as policies,
  coalesce(
    string_agg(distinct g.grantee || ':' || g.privilege_type, ', '
               order by g.grantee || ':' || g.privilege_type),
    '—')                                           as rechten_anon_auth
from pg_class c
left join information_schema.role_table_grants g
       on g.table_schema = 'public'
      and g.table_name   = c.relname
      and g.grantee in ('anon', 'authenticated')
where c.relnamespace = 'public'::regnamespace
  and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity asc, c.relname;


-- ═══ Hoe je de uitkomst leest ═══
--
-- GOED, voor vrijwel elke tabel:
--   rls_aan = true, policies = 0, rechten = '—'
--   → alleen de service-role komt erbij, en dat is precies wat de app gebruikt.
--
-- GOED, de enige uitzondering:
--   reviews | true | 1 | anon:SELECT
--   → de homepage leest hier de zichtbare reviews (/api/reviews GET).
--
-- FOUT, en meteen actie:
--   rls_aan = false            → policies doen niets; de grants bepalen alles
--   rechten bevat INSERT/      → anon of authenticated mag schrijven
--     UPDATE/DELETE
--   policies > 0 op een tabel  → controleer met de query hieronder wélke rol
--     die je niet verwacht        die policy toestaat


-- ═══ Vangnet: bestaat er nog ergens een policy TO public? ═══
--
-- Dit is de fout uit F-26. Na de migratie hoort dit nul rijen te geven.

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and 'public' = any(roles);

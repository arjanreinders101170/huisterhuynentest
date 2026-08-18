-- Voortgang van de marketingplanning uit localStorage naar de database.
--
-- De afvinkstatus van de Marketing-tab stond in localStorage
-- ("hth_marketing_done_v1"), dus per browser. Wisselen van laptop of het wissen
-- van de cache zette de hele planning weer op nul. Nu de planning de
-- operationele agenda voor 2027 wordt, moet die status de browser overleven.
--
-- Model: één rij per afgevinkte taak. Aanwezig = afgerond, verwijderd = open.
-- Dat houdt de tabel klein en voorkomt dat een boolean-kolom uit de pas loopt
-- met wat er in beeld staat.

create table if not exists marketing_task_status (
  task_id      text primary key,
  afgerond_op  timestamptz not null default now()
);

comment on table marketing_task_status is
  'Afgevinkte taken van het marketingplan (admin → Marketing Dashboard). Aanwezige rij = afgerond.';
comment on column marketing_task_status.task_id is
  'Taak-id uit MONTHS in src/app/admin/components/MarketingTab.tsx, bijv. "s26-1".';

-- Alleen de service-role komt erbij; de admin-API draait server-side.
-- Geen anon-policy = geen toegang via de anon key.
alter table marketing_task_status enable row level security;

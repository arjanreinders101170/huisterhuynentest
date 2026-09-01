-- Eindfactuur bij een Booking.com-boeking
--
-- Booking.com rekent alleen het logies af. Bedlinnen, eindschoonmaak en
-- toeristenbelasting innen we zelf, na afloop, met een eigen eindfactuur. Tot
-- nu toe stond dat bedrag nergens: je moest per boeking onthouden dat het nog
-- moest, en het per hand uitrekenen.
--
-- Deze migratie geeft een verblijf de gegevens die daarvoor nodig zijn. Het
-- aantal personen staat niet in de Booking.com-export en moet je dus zelf
-- invullen — zonder dat is de toeristenbelasting (per persoon per nacht) niet
-- te berekenen. De regels worden opgeslagen zoals ze op het moment van
-- vastleggen zijn uitgerekend, zodat een latere tariefwijziging in
-- fee_templates een al verstuurde factuur niet met terugwerkende kracht
-- verandert.

alter table stays add column if not exists personen                 int;
alter table stays add column if not exists eindfactuur_regels       jsonb not null default '[]'::jsonb;
alter table stays add column if not exists eindfactuur_totaal       numeric(10,2);
alter table stays add column if not exists eindfactuur_status       text not null default 'open';
alter table stays add column if not exists eindfactuur_bijgewerkt_op timestamptz;

comment on column stays.personen           is 'Aantal gasten; nodig voor toeristenbelasting en bedlinnen. Staat niet in de Booking.com-export.';
comment on column stays.eindfactuur_regels is 'Bevroren factuurregels [{label, bedrag, soort, basis, berekening}] — een latere tariefwijziging verandert een vastgelegde factuur niet.';
comment on column stays.eindfactuur_status is 'open = nog te factureren, verstuurd = factuur de deur uit, voldaan = betaald, nvt = niet van toepassing';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'stays'::regclass and conname = 'stays_eindfactuur_status_check'
  ) then
    alter table stays add constraint stays_eindfactuur_status_check
      check (eindfactuur_status in ('open', 'verstuurd', 'voldaan', 'nvt'));
  end if;
end $$;

create index if not exists stays_eindfactuur_open_idx
  on stays (check_out) where eindfactuur_status = 'open';

/* Bedlinnen als toeslag per persoon, naast de bestaande eindschoonmaak en
 * toeristenbelasting uit 2026_05_15_unified_booking_requests.sql.
 *
 * Bewust zonder bedrag en op inactief: het tarief is een keuze, geen technisch
 * gegeven, en een verzonnen bedrag zou stilzwijgend op facturen belanden. Vul
 * het in bij Dynamic Pricing → Toeslagen en zet de regel daar aan; vanaf dat
 * moment rekent de eindfactuur hem mee. Zolang hij uit staat, blijft de
 * factuur beperkt tot schoonmaak en toeristenbelasting.
 *
 * Let op: dit raakt ook de offerte van een dírecte boeking, want die gebruikt
 * dezelfde tabel. Dat is de bedoeling — bedlinnen hoort in beide gevallen op
 * de rekening. */
insert into fee_templates (label, soort, bedrag, basis, volgorde, actief)
select 'Bedlinnen', 'toeslag', null, 'per_persoon', 25, false
where not exists (select 1 from fee_templates where label ilike 'bedlinnen');

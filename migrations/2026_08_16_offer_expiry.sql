-- Geldigheidsduur van een verstuurde offerte
-- Doel: een offerte blijft niet eeuwig open staan. Bij het versturen wordt een
-- vervaldatum gezet (standaard 7 dagen, nooit later dan de dag vóór aankomst).
-- Twee dagen ervoor krijgt de gast een herinnering; daarna vervalt het aanbod,
-- gaat de status naar 'verlopen' en werkt de bevestigingslink niet meer.

alter table booking_requests add column if not exists offerte_vervalt_op date;
alter table booking_requests add column if not exists herinnering_verstuurd_op timestamptz;
alter table booking_requests add column if not exists verlopen_op timestamptz;

-- Status 'verlopen' toevoegen aan de constraint.
alter table booking_requests drop constraint if exists booking_requests_status_check;
alter table booking_requests add constraint booking_requests_status_check
  check (status in (
    'nieuw',
    'in_behandeling',
    'offerte_verstuurd',
    'bevestigd',
    'afgewezen',
    'verlopen',
    'aanbetaling_verstuurd',
    'aanbetaling_betaald',
    'restbetaling_verstuurd',
    'volledig_betaald'
  ));

-- De cron zoekt dagelijks op status + vervaldatum.
create index if not exists booking_requests_vervalt_idx
  on booking_requests(status, offerte_vervalt_op);

-- Offertes die al openstaan hebben nog geen vervaldatum en zouden dus nooit
-- vervallen. Ze krijgen een verse termijn vanaf vandaag — niet met terugwerkende
-- kracht, want deze gasten hebben nooit een deadline te horen gekregen. Zo
-- krijgen ze eerst netjes een herinnering in plaats van meteen een vervalbericht.
update booking_requests
   set offerte_vervalt_op = greatest(
         current_date,
         least(
           (current_date + interval '7 days')::date,
           coalesce(check_in - 1, (current_date + interval '7 days')::date)
         )
       )
 where status = 'offerte_verstuurd'
   and offerte_vervalt_op is null;

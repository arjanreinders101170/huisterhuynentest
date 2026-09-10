-- wifi_code hoeft niet meer ingevuld te worden
--
-- Aanleiding: het inlezen van de Booking.com-export meldde bij elke nieuwe
-- reservering
--
--   null value in column "wifi_code" of relation "stays" violates not-null constraint
--
-- Reserveringen die al in het overzicht stonden gingen wél goed: die worden
-- bijgewerkt, en een update raakt de kolom niet. Alleen een nieuw verblijf
-- (een insert) liep stuk — vandaar "0 toegevoegd" met twee mislukte regels.
--
-- De kolom stamt uit de tijd dat elk verblijf zijn eigen wifi-code kreeg. Het
-- gastnetwerk heeft allang één vast wachtwoord: dat leest src/lib/wifi.ts
-- server-side uit de omgeving, de gast-app krijgt het via /api/stay ná
-- controle van het stay-token. Geen enkele query leest wifi_code nog — hij
-- staat alleen nog als NOT NULL in de weg, bij élke manier waarop een verblijf
-- ontstaat: de import, 'nieuw verblijf' in de admin, en de automatische
-- aanmaak bij het bevestigen van een aanvraag.
--
-- Deze migratie haalt de verplichting eraf en geeft de kolom een lege
-- standaardwaarde, zodat een insert die hem overslaat niet meer stukloopt.
-- De kolom zelf blijft staan: weggooien is een aparte beslissing, en oude
-- verblijven bewaren zo de code die ze ooit hadden.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stays' and column_name = 'wifi_code'
  ) then
    alter table stays alter column wifi_code drop not null;
    alter table stays alter column wifi_code set default '';
    comment on column stays.wifi_code is
      'Verouderd: het gastnetwerk heeft één vast wachtwoord (env WIFI_PASSWORD, zie src/lib/wifi.ts). Wordt nergens meer gelezen.';
  end if;
end $$;

-- Controle: hierna hoort er geen rij meer uit te komen.
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'stays'
  and column_name  = 'wifi_code'
  and is_nullable  = 'NO';

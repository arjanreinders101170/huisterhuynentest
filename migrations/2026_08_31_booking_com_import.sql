-- Import van de maandelijkse Booking.com-reserveringsexport
--
-- Tot nu toe werden boekingen van Booking.com met de hand in stays overgetypt.
-- Dat kost tijd en is de plek waar datums en bedragen misgaan. Deze migratie
-- maakt van stays een overzicht dat beide kanalen aankan, met het
-- reserveringsnummer van Booking.com als sleutel zodat dezelfde export twee
-- keer inlezen geen dubbele regels oplevert.
--
-- Uitgangspunten:
--   * Beschikbaarheid blijft via iCal lopen. Deze tabel is het overzicht, niet
--     de agenda.
--   * Er komt géén gast in de guests-tabel bij: de export bevat geen
--     e-mailadres, en een gast zonder adres vervuilt de gastenlijst en de
--     follow-upmail. De naam staat daarom op het verblijf zelf.

alter table stays add column if not exists bron              text not null default 'direct';
alter table stays add column if not exists extern_id         text;
alter table stays add column if not exists extern_bedrag     numeric(10,2);
alter table stays add column if not exists extern_commissie  numeric(10,2);
alter table stays add column if not exists extern_valuta     text;
alter table stays add column if not exists geboekt_op        date;
alter table stays add column if not exists gast_naam         text;
alter table stays add column if not exists geimporteerd_op   timestamptz;

comment on column stays.bron             is 'direct = via eigen site/admin, booking_com = geïmporteerd uit de Booking.com-export';
comment on column stays.extern_id        is 'Reserveringsnummer bij het externe kanaal; sleutel voor herhaalde imports';
comment on column stays.extern_bedrag    is 'Totaalbedrag zoals Booking.com het rapporteert (bruto, vóór commissie)';
comment on column stays.extern_commissie is 'Commissie die Booking.com inhoudt; netto-uitbetaling = extern_bedrag - extern_commissie';
comment on column stays.gast_naam        is 'Naam bij een boeking zonder guests-record (externe kanalen leveren geen e-mailadres)';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'stays'::regclass and conname = 'stays_bron_check'
  ) then
    alter table stays add constraint stays_bron_check check (bron in ('direct', 'booking_com'));
  end if;
end $$;

-- De sleutel waarop een herhaalde import zichzelf herkent. Partieel, want
-- eigen boekingen hebben geen extern nummer en mogen niet met elkaar botsen.
create unique index if not exists stays_extern_id_uniek
  on stays (extern_id) where extern_id is not null;

create index if not exists stays_bron_idx on stays (bron, check_in desc);

-- Een geïmporteerde boeking heeft geen gast in guests: de export levert geen
-- e-mailadres. Zonder deze aanpassing kan zo'n verblijf er niet in.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stays'
      and column_name = 'guest_id' and is_nullable = 'NO'
  ) then
    alter table stays alter column guest_id drop not null;
  end if;
end $$;

/* Controle: de e-mailcrons (welkomst-, bedank- en follow-upmail) slaan een
 * verblijf zonder e-mailadres al over — zie src/app/api/cron/emails/route.ts,
 * dat per verblijf `if (!guest?.email) continue;` doet. Geïmporteerde gasten
 * krijgen dus nooit ongevraagd post. Wie een Booking.com-gast tóch de gast-app
 * wil sturen, koppelt in de admin handmatig een gast met e-mailadres. */

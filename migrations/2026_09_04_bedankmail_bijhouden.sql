-- Bijhouden of de bedankmail na een verblijf verstuurd is
--
-- De ochtendcron zocht de bedankmail op één exacte dag op (`check_out` was
-- gisteren) en gebruikte de status als markering: stond een verblijf op
-- 'vertrokken', dan was de mail eruit. Dat hield geen stand.
--
--   * Viel er één cronrun uit, of werd een verblijf pas een dag later
--     ingevoerd, dan schoof de gast door het venster heen en kwam er nooit
--     meer een bedankje.
--   * `status <> 'vertrokken'` laat rijen zonder status buiten beschouwing:
--     in SQL is NULL <> 'vertrokken' niet waar maar onbekend.
--   * De import zet een al afgelopen Booking.com-verblijf meteen op
--     'vertrokken'. Dat betekende "afgehandeld", niet "bedankt" — met de
--     status als markering waren die twee niet uit elkaar te houden.
--
-- Een eigen kolom maakt het ondubbelzinnig: leeg = nog geen bedankmail gehad.
-- De cron kijkt daarmee een week terug in plaats van één dag, zodat een
-- gemiste run zichzelf de volgende ochtend herstelt.

alter table stays add column if not exists bedankt_verstuurd_op timestamptz;

comment on column stays.bedankt_verstuurd_op is
  'Moment waarop de bedankmail na afloop is verstuurd. Leeg = nog niet verstuurd; de ochtendcron pakt het verblijf dan binnen zeven dagen na vertrek alsnog op.';

-- Backfill. Tot nu toe was 'vertrokken' de enige markering die er was, dus dat
-- is wat we hebben. Zonder deze stap zou het nieuwe inhaalvenster bij de
-- eerstvolgende run alsnog mails sturen voor verblijven die al afgehandeld
-- waren. De tijd is onbekend, dus zetten we hem op nu: de kolom zegt "dit is
-- afgehandeld", en alleen voor nieuwe verblijven is hij ook echt het
-- verzendmoment.
--
-- Booking.com-verblijven blijven er bewust buiten. Die zijn nooit bedankt —
-- de export bevat geen e-mailadres — en de import zette ze alleen op
-- 'vertrokken' omdat het bezoek voorbij was. Ze op verstuurd zetten zou dat
-- in het overzicht als "bedankt" laten zien terwijl er niets verstuurd is.
--
-- De uitzondering hangt af van stays.bron, en die kolom komt uit
-- 2026_08_31_booking_com_import.sql. Draait die migratie op deze database nog
-- niet, dan brak dit script hier af met `column "bron" does not exist` — en
-- omdat de SQL-editor het geheel in één transactie draait, werd ook de nieuwe
-- kolom hierboven weer teruggedraaid. Vandaar de controle: bestaat bron niet,
-- dan zijn er ook geen geïmporteerde verblijven en valt er niets uit te
-- sluiten. Zo maakt de volgorde van de twee migraties niet meer uit.
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name = 'stays'
       and column_name = 'bron'
  ) then
    execute $backfill$
      update stays
         set bedankt_verstuurd_op = now()
       where status = 'vertrokken'
         and bedankt_verstuurd_op is null
         and coalesce(bron, 'direct') <> 'booking_com'
    $backfill$;
  else
    update stays
       set bedankt_verstuurd_op = now()
     where status = 'vertrokken'
       and bedankt_verstuurd_op is null;
  end if;
end $$;

-- De cron zoekt op openstaande bedankmails binnen een datumvenster.
create index if not exists stays_bedankmail_open_idx
  on stays (check_out)
  where bedankt_verstuurd_op is null;

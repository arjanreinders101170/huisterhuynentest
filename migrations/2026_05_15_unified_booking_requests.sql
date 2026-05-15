-- Unified booking request funnel
-- Doel: alle aanvragen (homepage, app, terugkomers) landen in één tabel,
-- zodat de admin ze op één plek kan beoordelen en een offerte kan opstellen.
--
-- Strategie: dual-write naast de bestaande tabellen (terugkeer_aanvragen blijft).
-- Oude /offerte links blijven werken; nieuwe admin-flow gebruikt deze tabel.

create table if not exists booking_requests (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  bron                    text not null check (bron in ('homepage','app','terugkomer')),
  guest_id                uuid references guests(id) on delete set null,
  gast_naam               text not null,
  gast_email              text not null,

  -- Aanvraag-details (nullable: terugkomers geven soms geen exacte datums)
  lodge                   text,
  check_in                date,
  check_out               date,
  nachten                 int,
  personen                int default 2,
  huisdieren              boolean default false,
  bericht                 text,
  periode_tekst           text,           -- human-readable fallback ("14 mei — 21 mei")

  -- Prijsvoorstel (uit homepage-calculator of admin-prefill)
  voorgestelde_prijs      numeric(10,2),
  voorgestelde_prijs_label text,
  promo_code              text,

  -- Offerte zoals verstuurd door admin
  prijs_verblijf          numeric(10,2),
  schoonmaak              numeric(10,2),
  toeristenbelasting      numeric(10,2),
  extra_regels            jsonb not null default '[]'::jsonb,
                          -- [{label, bedrag, soort:'toeslag'|'korting'|'belasting'}]
  totaal                  numeric(10,2),

  status                  text not null default 'nieuw'
                          check (status in ('nieuw','in_behandeling','offerte_verstuurd','bevestigd','afgewezen')),
  confirm_token           text,

  -- Brug naar bestaande terugkomers-tabel tijdens transitie
  legacy_terugkeer_id     uuid references terugkeer_aanvragen(id) on delete set null
);

create index if not exists booking_requests_status_idx on booking_requests(status, created_at desc);
create index if not exists booking_requests_email_idx  on booking_requests(gast_email);
create index if not exists booking_requests_bron_idx   on booking_requests(bron, created_at desc);

-- Auto-updated_at trigger
create or replace function set_booking_request_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists booking_requests_updated on booking_requests;
create trigger booking_requests_updated
  before update on booking_requests
  for each row execute function set_booking_request_updated_at();

-- Templates voor toeslagen, kortingen en belastingen
create table if not exists fee_templates (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  soort       text not null check (soort in ('toeslag','korting','belasting')),
  bedrag      numeric(10,2),       -- vast bedrag (nullable als percentage)
  percentage  numeric(5,2),        -- nullable
  basis       text not null default 'eenmalig'
              check (basis in ('eenmalig','per_nacht','per_persoon','per_persoon_per_nacht')),
  actief      boolean not null default true,
  volgorde    int not null default 0,
  created_at  timestamptz not null default now()
);

-- Seeds — gemeente Tynaarlo verordening 2026 (ongewijzigd t.o.v. 2025)
insert into fee_templates (label, soort, bedrag, basis, volgorde, actief) values
  ('Toeristenbelasting',                 'belasting', 1.50, 'per_persoon_per_nacht', 10, true),
  ('Toeristenbelasting (kamperen/groep)','belasting', 1.15, 'per_persoon_per_nacht', 11, false),
  ('Schoonmaak',                         'toeslag',   75,   'eenmalig',              20, true),
  ('Huisdier',                           'toeslag',   25,   'eenmalig',              30, true)
on conflict do nothing;

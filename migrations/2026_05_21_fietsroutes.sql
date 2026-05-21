-- Fietsroutes — door admin beheerd, met link naar fietsnetwerk.nl o.i.d.
-- De QR-code wordt server-side gegenereerd op basis van de URL (kolom 'url'),
-- niet opgeslagen in de database.

create table if not exists fietsroutes (
  id            uuid primary key default gen_random_uuid(),
  titel         text not null,
  lengte_km     numeric(5,1),
  startpunt     text,
  beschrijving  text,
  url           text not null,
  volgorde      int not null default 0,
  actief        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_fietsroutes_volgorde
  on fietsroutes (actief, volgorde);

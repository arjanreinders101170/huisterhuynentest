-- Search Console-cijfers maandelijks vastleggen.
--
-- Tot nu toe kwam deze data uit een handmatige CSV-export. Dat had twee
-- problemen: het gebeurt alleen als iemand eraan denkt, en de export vermeldt
-- geen meetperiode — waardoor "vertoningen per maand" een aanname bleef en de
-- forecast een factor 3 onzeker was. De cron haalt de cijfers nu per volledige
-- kalendermaand op, zodat de periode altijd vaststaat.

-- ── De cijfers zelf ─────────────────────────────────────────────────────────
-- Eén rij per maand × dimensie × sleutel. CTR wordt niet opgeslagen: die is
-- klikken/vertoningen en zou als losse kolom uit de pas kunnen gaan lopen.
create table if not exists gsc_metrics (
  maand        date    not null,          -- altijd de eerste dag van de maand
  dimensie     text    not null,          -- 'query' of 'page'
  sleutel      text    not null,          -- de zoekopdracht of de URL
  klikken      integer not null default 0,
  vertoningen  integer not null default 0,
  positie      numeric(6,2) not null default 0,
  primary key (maand, dimensie, sleutel),
  constraint gsc_metrics_dimensie_check check (dimensie in ('query', 'page'))
);

comment on table gsc_metrics is
  'Google Search Console per kalendermaand. Gevuld door /api/cron/gsc-sync.';
comment on column gsc_metrics.maand is
  'Eerste dag van de maand waarover deze rij gaat.';

-- Vergelijken van twee maanden is de meest voorkomende query.
create index if not exists gsc_metrics_maand_dimensie_idx
  on gsc_metrics (maand desc, dimensie);

-- Vertoningen aflopend binnen een maand: de ranglijsten in de admin.
create index if not exists gsc_metrics_vertoningen_idx
  on gsc_metrics (maand desc, dimensie, vertoningen desc);

-- ── Wat er wanneer is opgehaald ─────────────────────────────────────────────
-- Maakt zichtbaar of een maand compleet is en of de laatste sync is geslaagd,
-- zodat een stilgevallen cron niet maanden onopgemerkt blijft.
create table if not exists gsc_sync_log (
  id            bigserial primary key,
  maand         date        not null,
  gestart_op    timestamptz not null default now(),
  gelukt        boolean     not null default false,
  aantal_queries integer    not null default 0,
  aantal_pages   integer    not null default 0,
  foutmelding   text
);

comment on table gsc_sync_log is
  'Uitvoerlog van de Search Console-sync: welke maand, hoeveel rijen, gelukt of niet.';

create index if not exists gsc_sync_log_maand_idx on gsc_sync_log (maand desc, gestart_op desc);

-- Alleen de service-role komt erbij; de cron en de admin-API draaien server-side.
alter table gsc_metrics  enable row level security;
alter table gsc_sync_log enable row level security;

-- Promotiecode / vroegboekkorting systeem
-- Herbruikbaar voor elke marketingcampagne.

create table if not exists discount_codes (
  id            uuid primary key default gen_random_uuid(),
  code          text not null,
  omschrijving  text,
  type          text not null default 'percentage' check (type in ('percentage', 'fixed')),
  waarde        numeric(10,2) not null check (waarde > 0),
  geldig_van    date,
  geldig_tot    date,
  max_gebruik   integer,
  gebruik_count integer not null default 0,
  min_nachten   integer,
  actief        boolean not null default true,
  created_at    timestamptz not null default now()
);

create unique index if not exists idx_discount_codes_code on discount_codes (upper(code));

-- Atomically increments gebruik_count to prevent race conditions
create or replace function increment_discount_usage(code_id uuid)
returns void language sql security definer as $$
  update discount_codes set gebruik_count = gebruik_count + 1 where id = code_id;
$$;

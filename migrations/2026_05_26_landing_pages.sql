-- Landingspagina's — SEO-landingspagina's beheerbaar vanuit de admin.
-- sections = jsonb array van { eyebrow?, heading, body[], bullets[] }
-- faq      = tekst, één "Vraag :: Antwoord" per regel
-- related  = tekst, één "Label :: /pad" per regel

create table if not exists landing_pages (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  breadcrumb      text not null default '',
  eyebrow         text not null default '',
  h1              text not null,
  hero_sub        text not null default '',
  hero_image      text not null default '/lodge-heide.jpg',
  hero_image_alt  text not null default '',
  price_from      text not null default 'Vanaf €165 per nacht',
  intro           text not null default '',
  sections        jsonb not null default '[]'::jsonb,
  faq             text not null default '',
  related         text not null default '',
  cta_title       text not null default '',
  cta_body        text not null default '',
  meta_title      text not null default '',
  meta_description text not null default '',
  og_image        text not null default '',
  gepubliceerd    boolean not null default false,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_landing_pages_slug on landing_pages (slug);
create index if not exists idx_landing_pages_pub  on landing_pages (gepubliceerd, sort_order);

-- Geen seed hier: de 7 bestaande pagina's worden via de admin-knop
-- "Importeer standaardpagina's" ingeladen (bron: src/lib/landing-seed.ts),
-- zodat code en database één bron delen.

-- Admin magic-link authenticatie
-- Vervangt de single-shared-password (ADMIN_SECRET) flow.
-- Twee tabellen: tokens (eenmalig consumeerbaar) en sessies (revoceerbaar).

create table if not exists admin_magic_tokens (
  id          bigserial primary key,
  token_hash  text not null unique,
  email       text not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now(),
  ip          text,
  user_agent  text
);

create index if not exists idx_admin_magic_tokens_email on admin_magic_tokens (email);

create table if not exists admin_sessions (
  id          bigserial primary key,
  session_id  text not null unique,
  email       text not null,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now(),
  ip          text,
  user_agent  text
);

create index if not exists idx_admin_sessions_email on admin_sessions (email);

-- Blog post scheduling: posts kunnen vooruit gepland worden,
-- de cron /api/cron/publish-posts zet ze automatisch live als de tijd er is.

alter table blog_posts
  add column if not exists geplande_publicatie timestamptz;

-- Index voor de cron-query: zoek posts die nog niet gepubliceerd zijn
-- en waarvan de geplande publicatie inmiddels gepasseerd is.
create index if not exists idx_blog_posts_geplande_publicatie
  on blog_posts (geplande_publicatie)
  where gepubliceerd = false and geplande_publicatie is not null;

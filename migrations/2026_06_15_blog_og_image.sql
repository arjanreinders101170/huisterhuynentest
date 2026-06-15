-- Per-blogpost OG/social-share afbeelding (anders deelden alle blogs lodge-heide.jpg)
alter table blog_posts
  add column if not exists og_image text;

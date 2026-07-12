-- ============================================================================
-- blog_posts: storage for the "Behind the Lens" articles page.
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- ============================================================================

create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  type            text not null check (type in ('featured', 'standard')),
  badge           text,
  title           text not null,
  description     text,
  author          text,
  category        text not null,
  category_color  text not null,
  media_url       text not null,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now()
);

-- Enable Row Level Security.
alter table public.blog_posts enable row level security;

-- Public read access for anon and authenticated users.
drop policy if exists "blog_posts public read" on public.blog_posts;
create policy "blog_posts public read"
  on public.blog_posts
  for select
  to anon, authenticated
  using (true);

-- Helpful index for the default ordering used by the page.
create index if not exists blog_posts_display_order_idx
  on public.blog_posts (display_order asc);

-- ----------------------------------------------------------------------------
-- Seed rows (matches the local fallback in src/data/blogPosts.ts).
-- Truncate first so re-running is idempotent.
-- ----------------------------------------------------------------------------
truncate table public.blog_posts restart identity;

insert into public.blog_posts
  (type, badge, title, description, author, category, category_color, media_url, display_order)
values
  (
    'featured',
    'Must Read',
    'Full-Frame vs. Crop Sensor: Which for Photography?',
    'An honest look at the real-world differences between these camera systems to help you choose what''s actually right for your photography needs.',
    'By August Renner (c)',
    'Gear',
    '#7d1a4a',
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_155500_808e6fdd-761f-4acd-b3be-cb7e6e700def.mp4',
    0
  ),
  (
    'standard',
    null,
    'Finding Natural Light in Unexpected Places',
    null,
    null,
    'Lighting',
    '#2c4c34',
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_030111_a9e15665-d379-4a7f-8116-695bbe452ad1.mp4',
    1
  ),
  (
    'standard',
    null,
    'My Approach to Editing: Creating a Consistent Photography Style',
    null,
    null,
    'Editing',
    '#a63e2d',
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4',
    2
  ),
  (
    'standard',
    null,
    'Pricing Your Photography: Strategies That Work',
    null,
    null,
    'Business',
    '#1a2b8c',
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_154232_f8809bd2-a6c3-4a38-908d-2005e5b3cb3e.mp4',
    3
  );

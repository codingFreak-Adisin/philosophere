-- ============================================================================
-- Admin / editor support for blog_posts.
--
-- The team editor (src/pages/AdminPage.tsx) is gated by an access code. The
-- code is sent on every write request as an `x-admin-code` header, and these
-- RLS policies enforce it at the database — so the secret never lives in the
-- browser bundle. Public read is unchanged.
--
-- >>> CHANGE THE CODE BELOW (default '3333') before going to production, and
-- >>> pick something long/random rather than a 4-digit number.
-- ============================================================================

-- The access code used by every policy in this migration.
-- Update this single value to change the team access code.
do $$
begin
  -- no-op placeholder; the literal is referenced directly in policies below
  -- so it's easy to find-and-replace.
  null;
end $$;

-- ----------------------------------------------------------------------------
-- blog_posts: allow team INSERT / UPDATE / DELETE when the request carries the
-- correct x-admin-code header. Reads stay public (see 0001_blog_posts.sql).
-- ----------------------------------------------------------------------------
drop policy if exists "blog_posts team insert" on public.blog_posts;
create policy "blog_posts team insert"
  on public.blog_posts
  for insert
  to anon, authenticated
  with check ((current_setting('request.headers', true)::json->>'x-admin-code') = '3333');

drop policy if exists "blog_posts team update" on public.blog_posts;
create policy "blog_posts team update"
  on public.blog_posts
  for update
  to anon, authenticated
  using ((current_setting('request.headers', true)::json->>'x-admin-code') = '3333')
  with check ((current_setting('request.headers', true)::json->>'x-admin-code') = '3333');

drop policy if exists "blog_posts team delete" on public.blog_posts;
create policy "blog_posts team delete"
  on public.blog_posts
  for delete
  to anon, authenticated
  using ((current_setting('request.headers', true)::json->>'x-admin-code') = '3333');

-- ----------------------------------------------------------------------------
-- admin_ping(): lets the editor verify the access code immediately on unlock
-- without performing a write. Returns true only when the header matches.
-- Callable by anon; the only thing it reveals is whether a given code is
-- correct — same threat model as the code gate itself.
-- ----------------------------------------------------------------------------
create or replace function public.admin_ping()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (current_setting('request.headers', true)::json->>'x-admin-code') = '3333'
$$;

-- ----------------------------------------------------------------------------
-- Storage bucket for images uploaded from the editor (article body + hero).
-- Public read; writes/deletes gated by the same admin code.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('article-media', 'article-media', true)
on conflict (id) do nothing;

drop policy if exists "article-media public read" on storage.objects;
create policy "article-media public read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'article-media');

drop policy if exists "article-media team insert" on storage.objects;
create policy "article-media team insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'article-media'
    and (current_setting('request.headers', true)::json->>'x-admin-code') = '3333'
  );

drop policy if exists "article-media team update" on storage.objects;
create policy "article-media team update"
  on storage.objects
  for update
  to anon, authenticated
  using (
    bucket_id = 'article-media'
    and (current_setting('request.headers', true)::json->>'x-admin-code') = '3333'
  )
  with check (
    bucket_id = 'article-media'
    and (current_setting('request.headers', true)::json->>'x-admin-code') = '3333'
  );

drop policy if exists "article-media team delete" on storage.objects;
create policy "article-media team delete"
  on storage.objects
  for delete
  to anon, authenticated
  using (
    bucket_id = 'article-media'
    and (current_setting('request.headers', true)::json->>'x-admin-code') = '3333'
  );

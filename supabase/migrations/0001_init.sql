-- =============================================================================
-- Hearts4Hands — initial schema
-- Run this once in the Supabase SQL editor (or `supabase db push`).
--
-- Security model
--   * anon may READ published posts and site stats. Nothing else.
--   * All writes go through Next.js server actions using the service-role key,
--     which validate input first. There are deliberately NO public INSERT
--     policies — that keeps the public API surface closed even though the
--     forms are public.
--   * Signed-in admins (rows in `admins`) get full access via `is_admin()`.
-- =============================================================================

create extension if not exists "pgcrypto";

-- --- enums -------------------------------------------------------------------

do $$ begin
  create type submission_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- --- admin allow-list --------------------------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- --- volunteer sign-ups & hour logs -----------------------------------------

create table if not exists public.volunteer_signups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  age_group text,
  country text not null check (char_length(country) between 1 and 100),
  state text,
  city text,
  school text,
  activities text[] not null default '{}',
  hours numeric(6, 2) not null default 0 check (hours >= 0 and hours <= 2000),
  cards_made integer not null default 0 check (cards_made >= 0 and cards_made <= 100000),
  activity_date date,
  notes text,
  proof_path text,
  status submission_status not null default 'pending',
  reviewer_note text,
  reviewed_at timestamptz
);

create index if not exists volunteer_signups_created_idx
  on public.volunteer_signups (created_at desc);
create index if not exists volunteer_signups_status_idx
  on public.volunteer_signups (status);
create index if not exists volunteer_signups_email_idx
  on public.volunteer_signups (lower(email));

-- --- blog submissions --------------------------------------------------------

create table if not exists public.blog_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 3 and 160),
  category text not null,
  author_name text not null check (char_length(author_name) between 1 and 120),
  author_email text not null,
  author_location text,
  body text not null check (char_length(body) between 200 and 40000),
  status submission_status not null default 'pending',
  reviewer_note text,
  reviewed_at timestamptz,
  published_post_id uuid
);

create index if not exists blog_submissions_created_idx
  on public.blog_submissions (created_at desc);
create index if not exists blog_submissions_status_idx
  on public.blog_submissions (status);

-- --- published posts ---------------------------------------------------------

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  category text not null,
  author_name text not null,
  author_location text,
  excerpt text,
  body text not null,
  status post_status not null default 'draft',
  featured boolean not null default false,
  published_at timestamptz,
  submission_id uuid references public.blog_submissions (id) on delete set null
);

create index if not exists posts_published_idx
  on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category);

alter table public.blog_submissions
  drop constraint if exists blog_submissions_published_post_fk;
alter table public.blog_submissions
  add constraint blog_submissions_published_post_fk
  foreign key (published_post_id) references public.posts (id) on delete set null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- --- contact messages --------------------------------------------------------

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null,
  topic text not null default 'general',
  subject text,
  message text not null check (char_length(message) between 10 and 8000),
  handled boolean not null default false
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

-- --- manually maintained impact numbers -------------------------------------

create table if not exists public.site_stats (
  id integer primary key default 1 check (id = 1),
  total_raised_cents bigint not null default 0,
  materials_cents bigint not null default 0,
  research_cents bigint not null default 0,
  goal_cents bigint not null default 500000,
  cards_made integer not null default 0,
  volunteers integer not null default 0,
  hours_logged integer not null default 0,
  hospitals_served integer not null default 0,
  note text,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (id) values (1) on conflict (id) do nothing;

drop trigger if exists site_stats_touch_updated_at on public.site_stats;
create trigger site_stats_touch_updated_at
  before update on public.site_stats
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.admins             enable row level security;
alter table public.volunteer_signups  enable row level security;
alter table public.blog_submissions   enable row level security;
alter table public.posts              enable row level security;
alter table public.contact_messages   enable row level security;
alter table public.site_stats         enable row level security;

-- Public reads: published posts only.
drop policy if exists "public reads published posts" on public.posts;
create policy "public reads published posts"
  on public.posts for select
  to anon, authenticated
  using (status = 'published' and published_at is not null);

-- Public reads: the single stats row.
drop policy if exists "public reads site stats" on public.site_stats;
create policy "public reads site stats"
  on public.site_stats for select
  to anon, authenticated
  using (true);

-- Admins can see and change everything.
do $$
declare t text;
begin
  foreach t in array array[
    'volunteer_signups', 'blog_submissions', 'posts',
    'contact_messages', 'site_stats', 'admins'
  ] loop
    execute format('drop policy if exists "admins full access" on public.%I', t);
    execute format(
      'create policy "admins full access" on public.%I for all to authenticated
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- =============================================================================
-- Storage: private bucket for volunteer proof-of-cards uploads
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'volunteer-proof', 'volunteer-proof', false, 8388608,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins read proof" on storage.objects;
create policy "admins read proof"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'volunteer-proof' and public.is_admin());

-- =============================================================================
-- Bootstrapping an admin
--
--   1. Supabase dashboard -> Authentication -> Users -> "Add user"
--      (email + password, "Auto Confirm User" on).
--   2. Disable public sign-ups: Authentication -> Providers -> Email ->
--      turn OFF "Enable Sign Ups".
--   3. Run, with that user's email:
--        insert into public.admins (user_id, email)
--        select id, email from auth.users where email = 'you@example.com'
--        on conflict (user_id) do nothing;
-- =============================================================================

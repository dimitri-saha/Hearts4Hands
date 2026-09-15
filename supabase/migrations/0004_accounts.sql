-- =============================================================================
-- Hearts4Hands — volunteer accounts, profiles, and school-club groups
--
-- Run this once in the Supabase SQL editor, after 0003_purge_handled_messages.sql.
--
-- Security model, unchanged in spirit from 0001 but now with a second kind of
-- signed-in user:
--   * anon           — published posts and site stats. Nothing else.
--   * a volunteer    — their OWN profile, hour entries, and story submissions.
--                      Read only; every write still goes through a server
--                      action using the service-role key, which sets user_id
--                      from the session and never from client input.
--   * an admin       — everything, via is_admin().
--
-- A club leader seeing their roster is deliberately NOT expressed in RLS. It
-- needs other people's names and hours, and writing a policy broad enough to
-- allow that risks leaking far more than intended. The roster is assembled in
-- a server component with the service-role key after explicitly checking
-- leadership, so the blast radius of a mistake is one query, not one policy.
-- =============================================================================

-- --- profiles ----------------------------------------------------------------
-- auth.users holds credentials; this holds who the volunteer actually is.
-- For an under-13 account the credentials belong to a parent or guardian while
-- full_name is the child's — they did the volunteering and the certificate
-- names them. See UNDER_13 in src/lib/site.ts.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  age_group text not null,
  country text,
  terms_accepted_at timestamptz
);

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Under-13 accounts are guardian-held. Stored as a column rather than derived
-- in app code so the database can enforce the story ban itself, below.
alter table public.profiles
  add column if not exists is_guardian_account boolean not null default false;

-- --- groups (school clubs) ---------------------------------------------------

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  organisation text,
  invite_code text not null unique,
  created_by uuid references auth.users (id) on delete set null,
  archived boolean not null default false
);

create table if not exists public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_idx on public.group_members (user_id);

/*
 * Invite codes are read aloud in classrooms, so the alphabet drops the
 * characters people mishear or mistype: 0/O, 1/I/L, 5/S, 8/B.
 */
create or replace function public.generate_invite_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet text := '234679ACDEFGHJKMNPQRTUVWXYZ';
  code text;
  i integer;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
    end loop;
    exit when not exists (select 1 from public.groups g where g.invite_code = code);
  end loop;
  return code;
end;
$$;

-- --- linking existing tables to accounts -------------------------------------
-- ON DELETE SET NULL, not CASCADE: deleting an account must anonymise the
-- volunteering record rather than erase it, so impact totals survive. That is
-- the promise made on /privacy.

alter table public.volunteer_signups
  add column if not exists user_id uuid references auth.users (id) on delete set null,
  add column if not exists group_id uuid references public.groups (id) on delete set null;

alter table public.blog_submissions
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists volunteer_signups_user_idx on public.volunteer_signups (user_id);
create index if not exists volunteer_signups_group_idx on public.volunteer_signups (group_id);
create index if not exists blog_submissions_user_idx on public.blog_submissions (user_id);

-- Rows created before accounts existed keep a null user_id and belong to
-- nobody. Admins still see them; no volunteer can claim them.

-- --- group helpers -----------------------------------------------------------
-- SECURITY DEFINER so a policy on group_members can consult group_members
-- without recursing into its own policy.

create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = gid and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_group_leader(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = gid and m.user_id = auth.uid() and m.role = 'leader'
  );
$$;

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.profiles      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;

-- --- profiles ---
drop policy if exists "volunteers read own profile" on public.profiles;
create policy "volunteers read own profile"
  on public.profiles for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "volunteers update own profile" on public.profiles;
create policy "volunteers update own profile"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "admins full access" on public.profiles;
create policy "admins full access"
  on public.profiles for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- --- own volunteering records ---
-- SELECT only. Inserts and updates go through server actions on the service
-- role, so a volunteer can never approve their own hours or rewrite history.
drop policy if exists "volunteers read own signups" on public.volunteer_signups;
create policy "volunteers read own signups"
  on public.volunteer_signups for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "volunteers read own submissions" on public.blog_submissions;
create policy "volunteers read own submissions"
  on public.blog_submissions for select
  to authenticated
  using (user_id = auth.uid());

-- --- groups ---
drop policy if exists "members read their groups" on public.groups;
create policy "members read their groups"
  on public.groups for select
  to authenticated
  using (public.is_group_member(id));

drop policy if exists "admins full access" on public.groups;
create policy "admins full access"
  on public.groups for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- A member sees only their own membership row. A leader sees the whole roster
-- of their group — but only the membership rows; names and hours come from a
-- service-role query that re-checks leadership.
drop policy if exists "members read own membership" on public.group_members;
create policy "members read own membership"
  on public.group_members for select
  to authenticated
  using (user_id = auth.uid() or public.is_group_leader(group_id));

drop policy if exists "admins full access" on public.group_members;
create policy "admins full access"
  on public.group_members for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- Under-13 accounts may not submit stories
--
-- Enforced in the form and again in the server action, and a third time here.
-- Publishing a child's writing under their name is public disclosure, which
-- needs far stricter parental consent than an account can carry.
-- =============================================================================

create or replace function public.block_under_13_submissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is not null and exists (
    select 1 from public.profiles p
    where p.user_id = new.user_id and p.is_guardian_account is true
  ) then
    raise exception 'Story submissions are not accepted from under-13 accounts';
  end if;
  return new;
end;
$$;

drop trigger if exists blog_submissions_block_under_13 on public.blog_submissions;
create trigger blog_submissions_block_under_13
  before insert on public.blog_submissions
  for each row execute function public.block_under_13_submissions();

-- =============================================================================
-- After running this
--
--   1. Authentication -> Providers -> Email -> turn ON "Enable Sign Ups".
--      (It was off. Admin access is gated by membership of public.admins, not
--      by "is authenticated", so a new sign-up gains nothing.)
--   2. Authentication -> Providers -> Email -> keep "Confirm email" ON.
--   3. Authentication -> URL Configuration:
--        Site URL:      https://www.hearts4hands.org
--        Redirect URLs: https://www.hearts4hands.org/**
--                       http://localhost:3000/**
--                       https://hearts4hands.vercel.app/**   (preview builds)
--      Magic links and password resets fail silently without these, and the
--      host must match NEXT_PUBLIC_SITE_URL exactly — www and apex are
--      different origins as far as this list is concerned.
--   4. Later, before real volunteers arrive: Project Settings -> Authentication
--      -> SMTP Settings -> point at Resend. The built-in mailer is rate-limited
--      to a handful of messages an hour.
-- =============================================================================

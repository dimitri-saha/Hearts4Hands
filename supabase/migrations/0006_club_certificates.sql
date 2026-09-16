-- =============================================================================
-- 0006_club_certificates.sql — certificates for a whole club
--
-- A club certificate names the club and states what its members did together.
-- It is cumulative, like the individual ones (see 0005).
--
-- The hours on it are the SAME hours that appear on its members' personal
-- certificates, counted once at the club level. That overlap is intentional —
-- a team trophy alongside individual medals — and the PDF says so in words, so
-- nobody reads a club certificate plus five personal ones as six separate
-- contributions.
--
-- This works because an hour entry is stamped with its club at logging time
-- (volunteer_signups.group_id) rather than attributed by current membership:
-- a club's total is therefore stable. Someone joining later does not inflate
-- it, and someone leaving does not strip it away.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- `full_name` no longer describes what the column holds — for a club it is the
-- club's name. Renaming now while the table is nearly empty; it will never be
-- cheaper, and a column whose name lies is a trap for whoever reads this next.
-- -----------------------------------------------------------------------------
alter table public.certificates
  rename column full_name to subject_name;

alter table public.certificates
  add column if not exists kind text not null default 'volunteer'
    check (kind in ('volunteer', 'club')),
  add column if not exists group_id uuid references public.groups (id) on delete set null,
  -- Only meaningful for kind = 'club': how many people contributed to the total.
  add column if not exists volunteer_count integer not null default 0
    check (volunteer_count >= 0);

comment on column public.certificates.subject_name is
  'Who or what this certificate names: a volunteer, or a club. Snapshot at issue time.';
comment on column public.certificates.group_id is
  'Set only for kind = ''club''. ON DELETE SET NULL so deleting a club does not '
  'destroy a certificate somebody has already been handed.';

create index if not exists certificates_group_idx
  on public.certificates (group_id, issued_at desc);

-- A club should not hold two certificates for the same totals; the request
-- path checks this, and the index makes the check cheap.
create index if not exists certificates_kind_idx on public.certificates (kind);

-- -----------------------------------------------------------------------------
-- Row-level security
--
-- Members of a club can see its certificates. Issuing still goes through a
-- server action on the service-role key, which verifies leadership first — a
-- read policy is not permission to create one.
-- -----------------------------------------------------------------------------
drop policy if exists "club members read club certificates" on public.certificates;
create policy "club members read club certificates"
  on public.certificates for select
  to authenticated
  using (group_id is not null and public.is_group_member(group_id));

-- -----------------------------------------------------------------------------
-- Public verification
--
-- Replaced rather than extended: the return type changes, and Postgres will not
-- alter a function's signature in place.
-- -----------------------------------------------------------------------------
drop function if exists public.verify_certificate(text);

create or replace function public.verify_certificate(p_code text)
returns table (
  code text,
  kind text,
  subject_name text,
  hours numeric,
  cards integer,
  volunteer_count integer,
  issued_at timestamptz,
  revoked boolean,
  revoked_reason text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select c.code,
         c.kind,
         c.subject_name,
         c.hours,
         c.cards,
         c.volunteer_count,
         c.issued_at,
         (c.revoked_at is not null),
         c.revoked_reason
  from public.certificates c
  where upper(replace(p_code, '-', '')) = upper(replace(c.code, '-', ''))
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- A club's approved totals, as of now.
--
-- security definer with an explicit membership check: the caller may only ask
-- about a club they belong to. Returning aggregates rather than rows means it
-- can never leak who logged what.
-- -----------------------------------------------------------------------------
create or replace function public.club_approved_totals(gid uuid)
returns table (hours numeric, cards integer, volunteers integer, entries integer)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(sum(v.hours), 0)::numeric,
         coalesce(sum(v.cards_made), 0)::integer,
         count(distinct v.user_id)::integer,
         count(*)::integer
  from public.volunteer_signups v
  where v.group_id = gid
    and v.status = 'approved'
    and (public.is_group_member(gid) or public.is_admin());
$$;

revoke all on function public.club_approved_totals(uuid) from public;
grant execute on function public.club_approved_totals(uuid) to authenticated;

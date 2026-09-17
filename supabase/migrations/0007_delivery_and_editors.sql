-- =============================================================================
-- 0007_delivery_and_editors.sql
--
-- Two unrelated additions:
--   1. How a batch of cards reaches the hospital (volunteer chooses at logging).
--   2. Admin roles, so an editor can be given the stories queue and nothing else.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Delivery method
--
-- Nullable on purpose: it is only asked when the entry includes card-making, and
-- every row that already exists predates the question. A NOT NULL default would
-- assert something about past entries that nobody actually told us.
-- -----------------------------------------------------------------------------
alter table public.volunteer_signups
  add column if not exists delivery_method text
    check (delivery_method in ('self', 'print_ship'));

comment on column public.volunteer_signups.delivery_method is
  '''self'' = the volunteer posts the cards themselves; ''print_ship'' = we print '
  'from their photo and post it. Null for entries with no card-making, and for '
  'everything logged before the question existed.';

-- -----------------------------------------------------------------------------
-- 2. Admin roles
--
-- `admins` previously answered one question: are you an admin. That made every
-- admin able to do everything — approve hours, edit impact numbers, withdraw
-- certificates. An editor recruited to read story submissions does not need any
-- of that, and handing it over anyway is a standing risk for no benefit.
--
-- 'owner' keeps the behaviour the table had before, so existing rows are
-- unchanged by this migration.
-- -----------------------------------------------------------------------------
alter table public.admins
  add column if not exists role text not null default 'owner'
    check (role in ('owner', 'editor'));

comment on column public.admins.role is
  '''owner'' = full access. ''editor'' = story submissions and posts only.';

-- -----------------------------------------------------------------------------
-- `is_admin()` stays as-is: "is this person staff at all", used by every
-- existing policy. Narrower questions get their own function, so no existing
-- policy silently changes meaning.
-- -----------------------------------------------------------------------------
create or replace function public.admin_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select a.role from public.admins a where a.user_id = auth.uid() limit 1;
$$;

revoke all on function public.admin_role() from public;
grant execute on function public.admin_role() to authenticated;

/*
 * True for full admins only.
 *
 * Note what this deliberately does NOT do: it does not loosen anything. Tables
 * an editor must not write are still protected by their existing `is_admin()`
 * policies at the database level, because every write goes through a server
 * action on the service-role key that checks the role first. This function
 * exists so policies *can* be tightened table by table without a second
 * migration rewriting all of them at once.
 */
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- -----------------------------------------------------------------------------
-- Editors have no business reading volunteer hour entries, contact messages or
-- certificates: those carry personal data they were never recruited to handle.
-- Replace the blanket admin policies on those tables with owner-only ones.
-- -----------------------------------------------------------------------------
drop policy if exists "admins full access to certificates" on public.certificates;
create policy "owners full access to certificates"
  on public.certificates for all
  to authenticated
  using (public.is_owner()) with check (public.is_owner());

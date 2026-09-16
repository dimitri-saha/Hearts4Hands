-- =============================================================================
-- 0005_certificates.sql — volunteer certificates
--
-- Certificates are CUMULATIVE, not segmented. Each one states a lifetime total
-- as of its issue date — "has volunteered 25 hours as of 14 September 2026" —
-- the way a transcript does.
--
-- The rejected alternative was to have each certificate *claim* a set of hour
-- entries so the same hours could never be certified twice. It fragments a
-- volunteer's record: someone with 25 hours across three certificates has to
-- hand a college three documents that each show a slice. And when a previously
-- approved entry is later rejected, the claim arithmetic silently breaks.
--
-- Cumulative certificates overlap on purpose. An older one is not wrong, it is
-- dated, and it says so on its face.
-- =============================================================================

create extension if not exists pgcrypto;

create table if not exists public.certificates (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  user_id        uuid not null references auth.users(id) on delete cascade,

  -- Snapshot. What this certificate asserts, frozen at issue time. A volunteer
  -- who later corrects the spelling of their name does not thereby change a
  -- document somebody has already printed and filed.
  full_name      text not null,
  hours          numeric(6,1) not null check (hours >= 0),
  cards          integer not null default 0 check (cards >= 0),

  -- Audit trail, NOT a claim. Because certificates are cumulative these sets
  -- overlap between certificates by design. They exist to answer "which
  -- approved entries did this count?" when an entry is later corrected — never
  -- to work out what is still uncertified.
  entry_ids      uuid[] not null default '{}',

  issued_at      timestamptz not null default now(),

  -- Revocation is what makes the verify page worth anything. Without it,
  -- "we certify this" is a claim that can never be taken back, and rejecting an
  -- already-approved entry would leave a certificate standing behind it.
  revoked_at     timestamptz,
  revoked_reason text,
  revoked_by     uuid references auth.users(id) on delete set null
);

create index if not exists certificates_user_idx
  on public.certificates (user_id, issued_at desc);

-- -----------------------------------------------------------------------------
-- Codes
--
-- The code is printed on the certificate and typed into /verify by hand, so the
-- alphabet drops every character that gets misread off paper (0/O, 1/I/l, 5/S,
-- 8/B). Ten characters from a 27-character alphabet is ~2e14 combinations: the
-- verify URL is a capability, and it has to be unguessable rather than merely
-- unique.
-- -----------------------------------------------------------------------------
create or replace function public.generate_certificate_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet text := '234679ACDEFGHJKMNPQRTUVWXYZ';
  body text;
  candidate text;
  i integer;
begin
  loop
    body := '';
    for i in 1..10 loop
      body := body || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
    end loop;
    candidate := 'H4H-' || substr(body, 1, 5) || '-' || substr(body, 6, 5);
    exit when not exists (select 1 from public.certificates where code = candidate);
  end loop;
  return candidate;
end;
$$;

-- -----------------------------------------------------------------------------
-- Row-level security
--
-- No insert or update policy for volunteers: issuing and revoking both go
-- through server actions on the service-role key, which set user_id from the
-- session and never from client input.
-- -----------------------------------------------------------------------------
alter table public.certificates enable row level security;

drop policy if exists "volunteers read own certificates" on public.certificates;
create policy "volunteers read own certificates"
  on public.certificates for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "admins full access to certificates" on public.certificates;
create policy "admins full access to certificates"
  on public.certificates for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Public verification
--
-- RLS can hide rows but not columns, so the public path is a function with a
-- fixed projection rather than a policy on the table. It cannot return user_id
-- or entry_ids no matter how the caller asks.
--
-- Dashes are ignored on input so someone reading a code off paper can type it
-- however they like.
-- -----------------------------------------------------------------------------
create or replace function public.verify_certificate(p_code text)
returns table (
  code text,
  full_name text,
  hours numeric,
  cards integer,
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
         c.full_name,
         c.hours,
         c.cards,
         c.issued_at,
         (c.revoked_at is not null),
         c.revoked_reason
  from public.certificates c
  where upper(replace(p_code, '-', '')) = upper(replace(c.code, '-', ''))
  limit 1;
$$;

revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

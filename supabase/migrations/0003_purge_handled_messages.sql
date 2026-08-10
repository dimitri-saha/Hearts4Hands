-- =============================================================================
-- Hearts4Hands — automatic cleanup of handled contact messages
--
-- Run this once in the Supabase SQL editor, after 0002_purge_rejected.sql.
--
-- What it does
--   * Adds contact_messages.handled_at, maintained by a trigger.
--   * Adds purge_handled_messages(), deleting messages 7 days after they were
--     marked handled.
--   * Schedules it daily with pg_cron.
--
-- Why a trigger rather than setting handled_at from the app: the column and
-- the deploy that writes it would otherwise have to land in the right order,
-- and marking a message handled would fail in between. The database owns the
-- timestamp, so the app needs no change and cannot get it wrong.
--
-- Only *handled* messages are ever removed. An open message stays forever,
-- however old — the queue is the inbox, and nothing should silently vanish
-- before someone has replied to it.
-- =============================================================================

alter table public.contact_messages
  add column if not exists handled_at timestamptz;

-- Anything already marked handled starts its 7 days from now, not from
-- whenever it was actually handled — we have no record of that, and dating it
-- retroactively could delete messages the moment this runs.
update public.contact_messages
set handled_at = now()
where handled is true and handled_at is null;

create index if not exists contact_messages_handled_idx
  on public.contact_messages (handled, handled_at);

-- --- keep handled_at in step with handled ------------------------------------

create or replace function public.touch_handled_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.handled_at := case when new.handled then now() else null end;
  elsif new.handled is distinct from old.handled then
    -- Re-opening a message clears the clock, so it is never deleted while
    -- someone still owes a reply.
    new.handled_at := case when new.handled then now() else null end;
  end if;
  return new;
end;
$$;

drop trigger if exists contact_messages_touch_handled_at on public.contact_messages;
create trigger contact_messages_touch_handled_at
  before insert or update on public.contact_messages
  for each row execute function public.touch_handled_at();

-- --- the purge ---------------------------------------------------------------

create or replace function public.purge_handled_messages(retain interval default '7 days')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.contact_messages
  where handled is true
    and handled_at is not null
    and handled_at < now() - retain;

  get diagnostics removed = row_count;

  if removed > 0 then
    raise log 'purge_handled_messages: removed % handled message(s)', removed;
  end if;

  return removed;
end;
$$;

comment on function public.purge_handled_messages(interval) is
  'Deletes contact messages 7 days after they were marked handled. Scheduled daily by pg_cron; also safe to run by hand.';

revoke execute on function public.purge_handled_messages(interval) from public, anon, authenticated;

-- --- schedule it -------------------------------------------------------------

create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'purge-handled-messages') then
    perform cron.unschedule('purge-handled-messages');
  end if;
end $$;

select cron.schedule(
  'purge-handled-messages',
  '42 3 * * *',                                  -- daily, 03:42 UTC
  $$select public.purge_handled_messages('7 days');$$
);

-- --- checking on it ----------------------------------------------------------
--   select jobname, schedule, active from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 10;
--
-- Preview what a run would delete, without deleting anything:
--   select count(*) from public.contact_messages
--   where handled is true and handled_at < now() - interval '7 days';
--
-- To keep messages longer, re-run cron.schedule with a different interval.

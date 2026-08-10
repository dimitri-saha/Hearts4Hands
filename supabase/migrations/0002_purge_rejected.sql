-- =============================================================================
-- Hearts4Hands — automatic cleanup of not-approved story submissions
--
-- Run this once in the Supabase SQL editor, after 0001_init.sql.
--
-- What it does
--   * Adds purge_rejected_submissions(), which deletes rejected rows from
--     public.blog_submissions once they are older than a retention window
--     (30 days by default, measured from the review decision).
--   * Schedules it to run daily at 03:17 UTC with pg_cron.
--
-- Why a hard delete: these are unpublished drafts of other people's personal
-- writing about illness. Keeping rejected copies around forever is the wrong
-- default, and there is no product feature that reads them back.
--
-- Posts already created from a submission are NOT touched — posts.submission_id
-- is ON DELETE SET NULL (see 0001_init.sql), so a published story survives its
-- source submission being cleaned up.
--
-- Volunteer submissions are deliberately excluded: they carry uploaded proof
-- photos in Storage, and deleting the database row here would leave the file
-- orphaned in the bucket. Clean those up through the admin panel instead.
-- =============================================================================

create or replace function public.purge_rejected_submissions(retain interval default '30 days')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  delete from public.blog_submissions
  where status = 'rejected'
    -- reviewed_at is when it was turned down; fall back to created_at for any
    -- row rejected before that column was being written.
    and coalesce(reviewed_at, created_at) < now() - retain;

  get diagnostics removed = row_count;

  if removed > 0 then
    raise log 'purge_rejected_submissions: removed % rejected submission(s)', removed;
  end if;

  return removed;
end;
$$;

comment on function public.purge_rejected_submissions(interval) is
  'Deletes not-approved blog submissions older than the retention window. Scheduled daily by pg_cron; also safe to run by hand.';

-- Only the service role and admins should be able to invoke it directly.
revoke execute on function public.purge_rejected_submissions(interval) from public, anon, authenticated;

-- --- schedule it -------------------------------------------------------------
-- If this errors with "extension pg_cron is not available", enable it first at
-- Dashboard -> Database -> Extensions -> pg_cron, then re-run this file.

create extension if not exists pg_cron;

-- Idempotent: drop any previous schedule before adding this one, so re-running
-- the migration doesn't stack up duplicate jobs.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'purge-rejected-stories') then
    perform cron.unschedule('purge-rejected-stories');
  end if;
end $$;

select cron.schedule(
  'purge-rejected-stories',
  '17 3 * * *',                                  -- daily, 03:17 UTC
  $$select public.purge_rejected_submissions('30 days');$$
);

-- --- checking on it ----------------------------------------------------------
--   select jobname, schedule, active from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 10;
--
-- To change the retention window, re-run cron.schedule with a different
-- interval, e.g. '90 days'. To run it right now:
--   select public.purge_rejected_submissions('30 days');
-- To preview what a run would delete without deleting anything:
--   select count(*) from public.blog_submissions
--   where status = 'rejected'
--     and coalesce(reviewed_at, created_at) < now() - interval '30 days';

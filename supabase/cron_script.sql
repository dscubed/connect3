-- 1. Safely remove the old job (only runs if it exists)
select cron.unschedule('insta-cron-sync')
where exists (
  select 1 from cron.job where jobname = 'insta-cron-sync'
);

-- 2. Immediately create the new updated job
select cron.schedule(
  'insta-cron-sync',
  '*/30 * * * *',      -- Schedule: Every 5 mins
  $$
  select net.http_post(
      url => 'https://nsjrzxbtxsqmsdgevszv.supabase.co/functions/v1/insta-cron-sync',
      headers => '{"Content-Type": "application/json", "Authorization": "Bearer 123"}'::jsonb,
      timeout_milliseconds => 120000
  ) as request_id;
  $$
);
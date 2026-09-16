-- The "Show prompts with date <= today" RLS policy correctly hides
-- tomorrow's full prompt row from clients. The sneak-peek teaser needs
-- just one axis label of it, so expose only that via a narrow
-- SECURITY DEFINER function instead of loosening the RLS policy.
-- The date is passed in (rather than using current_date) because the
-- app's notion of "today" is Pacific time, not the DB server's UTC.
create or replace function public.get_tomorrow_prompt_teaser(target_date date)
returns text as $$
  select x_axis_label from public.prompts
  where prompt_date = target_date
  limit 1;
$$ language sql security definer stable;

grant execute on function public.get_tomorrow_prompt_teaser(date) to authenticated;

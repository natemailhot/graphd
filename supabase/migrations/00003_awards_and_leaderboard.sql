-- Per-prompt quadrant awards (e.g. "Role Model" for high-trust/high-approval).
-- Nullable — prompts without custom labels just don't show an awards panel.
alter table public.prompts add column if not exists award_labels jsonb;

-- Accuracy leaderboard: how closely each placer's guesses matched the
-- group's consensus (average) position for each target. SECURITY DEFINER
-- so it can read across all members' placements (bypassing the normal
-- "no peeking until everyone submitted" gate on raw placements) while only
-- ever exposing a derived aggregate score, never individual placements.
-- Membership is still enforced: callers who aren't in the group get no rows.
create or replace function public.group_accuracy_leaderboard(gid uuid, pid uuid default null)
returns table(user_id uuid, display_name text, avatar_url text, avg_match numeric, placements_count bigint)
security definer
set search_path = public
language sql
stable
as $$
  with target_avg as (
    select group_id, prompt_id, target_user_id,
           avg(x_value) as avg_x, avg(y_value) as avg_y
    from public.placements
    where group_id = gid
      and (pid is null or prompt_id = pid)
    group by group_id, prompt_id, target_user_id
  ),
  per_placement as (
    select p.placed_by,
           1 - (sqrt(power(p.x_value - t.avg_x, 2) + power(p.y_value - t.avg_y, 2)) / sqrt(2)) as match_fraction
    from public.placements p
    join target_avg t
      on t.group_id = p.group_id and t.prompt_id = p.prompt_id and t.target_user_id = p.target_user_id
    where p.group_id = gid
      and (pid is null or p.prompt_id = pid)
  )
  select pr.id as user_id, pr.display_name, pr.avatar_url,
         round((avg(pp.match_fraction) * 100)::numeric, 1) as avg_match,
         count(pp.*) as placements_count
  from per_placement pp
  join public.profiles pr on pr.id = pp.placed_by
  where exists (select 1 from public.group_members gm where gm.group_id = gid and gm.user_id = auth.uid())
  group by pr.id, pr.display_name, pr.avatar_url
  order by avg_match desc;
$$;

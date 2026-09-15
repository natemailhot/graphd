-- All-time accuracy summary for the calling user (auth.uid()), aggregated
-- across every group and prompt they've placed in. SECURITY DEFINER so it
-- can read across groups without loosening the placements RLS policies;
-- it only ever exposes the caller's own aggregate stats plus target display
-- names (already public via "Public profiles are viewable by everyone").
create or replace function public.user_accuracy_summary()
returns table(
  overall_avg_match numeric,
  total_placements bigint,
  most_accurate_name text,
  most_accurate_match numeric,
  least_accurate_name text,
  least_accurate_match numeric
)
security definer
set search_path = public
language sql
stable
as $$
  with target_avg as (
    select group_id, prompt_id, target_user_id, avg(x_value) as avg_x, avg(y_value) as avg_y
    from public.placements
    group by group_id, prompt_id, target_user_id
  ),
  my_matches as (
    select p.target_user_id,
           1 - (sqrt(power(p.x_value - t.avg_x, 2) + power(p.y_value - t.avg_y, 2)) / sqrt(2)) as match_fraction
    from public.placements p
    join target_avg t on t.group_id = p.group_id and t.prompt_id = p.prompt_id and t.target_user_id = p.target_user_id
    where p.placed_by = auth.uid()
  ),
  per_target as (
    select mm.target_user_id, pr.display_name, avg(mm.match_fraction) as avg_match
    from my_matches mm
    join public.profiles pr on pr.id = mm.target_user_id
    group by mm.target_user_id, pr.display_name
  ),
  overall as (
    select round((avg(match_fraction) * 100)::numeric, 1) as overall_avg_match, count(*) as total_placements
    from my_matches
  ),
  best as (
    select display_name, round((avg_match * 100)::numeric, 1) as match from per_target order by avg_match desc limit 1
  ),
  worst as (
    select display_name, round((avg_match * 100)::numeric, 1) as match from per_target order by avg_match asc limit 1
  )
  select o.overall_avg_match, o.total_placements,
         b.display_name, b.match,
         w.display_name, w.match
  from (select 1) dummy
  left join overall o on true
  left join best b on true
  left join worst w on true;
$$;

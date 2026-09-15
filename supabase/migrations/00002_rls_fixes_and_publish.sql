-- Backfills RLS policies that were applied directly to production but never
-- captured in a migration file (the live database had drifted from
-- 00001_initial_schema.sql — these were missing entirely, causing silent
-- RLS-denied writes: member removal, leaving groups, and starting gameplay
-- all failed with no error surfaced).

create policy "Host can remove group members"
  on public.group_members for delete using (
    exists (
      select 1 from public.groups
      where groups.id = group_members.group_id
      and groups.created_by = auth.uid()
    )
  );

create policy "Members can leave groups"
  on public.group_members for delete using (user_id = auth.uid());

create policy "Host can update group"
  on public.groups for update using (created_by = auth.uid());

-- Lets the host preview results before every member has submitted
-- (bypasses the all_members_submitted() gate for just the host).
create policy "Host can view placements early"
  on public.placements for select using (
    exists (
      select 1 from public.groups
      where groups.id = placements.group_id
      and groups.created_by = auth.uid()
    )
  );

-- Publish results: host can reveal a group's results to everyone before
-- all members have submitted, instead of only previewing it themselves.
create table if not exists public.result_publications (
  group_id uuid references public.groups(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) not null,
  published_by uuid references public.profiles(id) not null,
  published_at timestamptz default now() not null,
  primary key (group_id, prompt_id)
);

alter table public.result_publications enable row level security;

create policy "Anyone can view publication status"
  on public.result_publications for select using (auth.uid() is not null);

create policy "Host can publish results"
  on public.result_publications for insert with check (
    exists (
      select 1 from public.groups
      where groups.id = result_publications.group_id
      and groups.created_by = auth.uid()
    )
  );

create policy "Placements visible once published"
  on public.placements for select using (
    exists (
      select 1 from public.result_publications rp
      where rp.group_id = placements.group_id
      and rp.prompt_id = placements.prompt_id
    )
  );

-- Realtime was configured in application code (useRealtimeSubmissions) but
-- these tables were never actually added to the publication, so live
-- updates silently never fired.
alter publication supabase_realtime add table public.placements;
alter publication supabase_realtime add table public.result_publications;
alter publication supabase_realtime add table public.group_members;

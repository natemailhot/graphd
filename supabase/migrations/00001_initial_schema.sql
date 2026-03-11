-- Profiles table (auto-created on signup via trigger)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Groups table
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  invite_code text unique not null,
  created_by uuid references public.profiles(id) not null,
  min_members integer default 4 not null check (min_members >= 4),
  created_at timestamptz default now() not null
);

alter table public.groups enable row level security;

create policy "Authenticated users can create groups"
  on public.groups for insert with check (auth.uid() = created_by);

-- Group members table (must be created before groups RLS policies that reference it)
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now() not null,
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;

-- Security definer function to check membership (bypasses RLS to avoid recursion)
create or replace function public.is_group_member(gid uuid, uid uuid)
returns boolean as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = uid
  );
$$ language sql security definer stable;

-- Simple policy: any authenticated user can view membership (group names aren't secret)
create policy "Authenticated users can view membership"
  on public.group_members for select using (auth.uid() is not null);

create policy "Authenticated users can join groups"
  on public.group_members for insert with check (auth.uid() = user_id);

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

-- Groups: allow all SELECT (needed for invite code join flow; sensitive data is in members table)
create policy "Anyone can view groups"
  on public.groups for select using (true);

create policy "Host can update group"
  on public.groups for update using (created_by = auth.uid());

-- Prompts table
create table public.prompts (
  id uuid default gen_random_uuid() primary key,
  x_axis_label text not null,
  y_axis_label text not null,
  prompt_date date unique,
  source text default 'curated' not null check (source in ('curated', 'user')),
  created_at timestamptz default now() not null
);

alter table public.prompts enable row level security;

create policy "Show prompts with date <= today"
  on public.prompts for select using (
    prompt_date is null or prompt_date <= current_date
  );

-- Placements table
create table public.placements (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) not null,
  placed_by uuid references public.profiles(id) not null,
  target_user_id uuid references public.profiles(id) not null,
  x_value real not null check (x_value >= 0 and x_value <= 1),
  y_value real not null check (y_value >= 0 and y_value <= 1),
  created_at timestamptz default now() not null,
  unique (group_id, prompt_id, placed_by, target_user_id)
);

alter table public.placements enable row level security;

-- Security definer function to check if all members submitted (bypasses RLS)
create or replace function public.all_members_submitted(gid uuid, pid uuid)
returns boolean as $$
  select not exists (
    select 1 from public.group_members gm
    where gm.group_id = gid
    and not exists (
      select 1 from public.placements p
      where p.group_id = gid
      and p.prompt_id = pid
      and p.placed_by = gm.user_id
    )
  );
$$ language sql security definer stable;

-- Critical: no peeking at others' placements until all members submitted
create policy "Own placements always visible"
  on public.placements for select using (placed_by = auth.uid());

create policy "All placements visible when everyone submitted"
  on public.placements for select using (
    public.all_members_submitted(group_id, prompt_id)
  );

create policy "Users can insert own placements"
  on public.placements for insert with check (auth.uid() = placed_by);

create policy "Users can update own placements"
  on public.placements for update using (auth.uid() = placed_by);

-- Submission tracking view
create or replace view public.group_submissions as
select
  gm.group_id,
  p.id as prompt_id,
  gm.user_id,
  exists (
    select 1 from public.placements pl
    where pl.group_id = gm.group_id
    and pl.prompt_id = p.id
    and pl.placed_by = gm.user_id
  ) as has_submitted
from public.group_members gm
cross join public.prompts p
where p.prompt_date is not null;

-- Function to assign a daily prompt (called by cron or self-healing)
create or replace function public.assign_daily_prompt()
returns uuid as $$
declare
  selected_id uuid;
begin
  select id into selected_id
  from public.prompts
  where prompt_date is null
  order by random()
  limit 1;

  if selected_id is not null then
    update public.prompts
    set prompt_date = current_date
    where id = selected_id;
  end if;

  return selected_id;
end;
$$ language plpgsql security definer;

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Avatars are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Lets any signed-in user suggest a new prompt idea (x vs y axis pair).
-- Suggestions are just collected for curation; they don't get promoted
-- into `prompts` automatically.
create table if not exists public.prompt_suggestions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references public.profiles(id) on delete set null,
  x_axis_label text not null,
  y_axis_label text not null,
  created_at timestamptz default now() not null
);

alter table public.prompt_suggestions enable row level security;

create policy "Signed-in users can submit suggestions"
  on public.prompt_suggestions for insert
  with check (auth.uid() = submitted_by);

create policy "Users can view their own suggestions"
  on public.prompt_suggestions for select
  using (auth.uid() = submitted_by);

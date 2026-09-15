-- Per-prompt custom axis endpoint labels (e.g. "Won't Pick Up" / "Always
-- Answers" instead of generic "Low"/"High"). Nullable — prompts without
-- custom labels just fall back to "Low"/"High" in the UI.
alter table public.prompts add column if not exists axis_labels jsonb;

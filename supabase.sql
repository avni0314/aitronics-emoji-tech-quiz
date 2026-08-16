-- Run this once in your Supabase project's SQL editor.

create table if not exists scores (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 24),
  score int not null check (score >= 0 and score <= 150),
  seconds int not null check (seconds >= 0 and seconds <= 200),
  created_at timestamptz not null default now()
);

alter table scores enable row level security;

-- Anyone with the anon key can read the leaderboard.
create policy "Allow public read" on scores
  for select using (true);

-- Anyone with the anon key can submit a score, within sane bounds
-- (the check constraints above already block wildly out-of-range values).
create policy "Allow public insert" on scores
  for insert with check (true);

-- Phase 0 schema: profiles, habits, habit_checkins, plans, subscriptions.
-- Streak logic lives in a trigger so it can never drift from what was
-- actually checked in, and so "missed a day" is handled with freezes
-- instead of a punitive reset (core product differentiator for TDAH users).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'UTC',
  onboarding_completed_at timestamptz,
  notification_prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- habits
-- ---------------------------------------------------------------------------
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text,
  color text,
  frequency_type text not null default 'daily'
    check (frequency_type in ('daily', 'weekly_n_times', 'specific_days')),
  frequency_config jsonb not null default '{}'::jsonb,
  reminder_time time,
  reminder_enabled boolean not null default false,
  archived_at timestamptz,
  sort_order integer not null default 0,
  -- Cached streak state, kept in sync by trg_habit_checkins_streak below.
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_checkin_date date,
  freezes_available integer not null default 1,
  freezes_used_this_period integer not null default 0,
  created_at timestamptz not null default now()
);

create index habits_user_id_idx on public.habits (user_id) where archived_at is null;

-- ---------------------------------------------------------------------------
-- habit_checkins
-- ---------------------------------------------------------------------------
create table public.habit_checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  checkin_date date not null,
  completed_at timestamptz not null default now(),
  status text not null default 'completed'
    check (status in ('completed', 'skipped_excused')),
  note text,
  unique (habit_id, checkin_date)
);

create index habit_checkins_habit_id_idx on public.habit_checkins (habit_id);

-- Recalculates current_streak / longest_streak / freezes on the parent habit
-- whenever a check-in is inserted. A gap of missed days is covered by
-- freezes when available ("racha protegida"); only an uncovered gap resets
-- the streak, and longest_streak is never touched by a reset.
create function public.fn_apply_checkin_to_streak()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  h public.habits%rowtype;
  gap_days integer;
begin
  if new.status <> 'completed' then
    return new;
  end if;

  select * into h from public.habits where id = new.habit_id for update;

  -- Backfilled/retroactive check-in for a date at or before the last one
  -- on record: record it, but don't touch the streak counters.
  if h.last_checkin_date is not null and new.checkin_date <= h.last_checkin_date then
    return new;
  end if;

  if h.last_checkin_date is null then
    gap_days := 1;
  else
    gap_days := new.checkin_date - h.last_checkin_date;
  end if;

  if gap_days <= 1 then
    update public.habits
      set current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          last_checkin_date = new.checkin_date
      where id = h.id;
  else
    -- gap_days - 1 days were missed between the last check-in and this one.
    if h.freezes_available >= gap_days - 1 then
      update public.habits
        set current_streak = current_streak + 1,
            longest_streak = greatest(longest_streak, current_streak + 1),
            last_checkin_date = new.checkin_date,
            freezes_available = freezes_available - (gap_days - 1),
            freezes_used_this_period = freezes_used_this_period + (gap_days - 1)
        where id = h.id;
    else
      -- Not enough freezes to cover the gap: streak restarts, but this is
      -- surfaced in the UI as "racha protegida hasta aqui", never as a
      -- punitive "you failed" message, and longest_streak is preserved.
      update public.habits
        set current_streak = 1,
            last_checkin_date = new.checkin_date
        where id = h.id;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_habit_checkins_streak
  after insert on public.habit_checkins
  for each row execute function public.fn_apply_checkin_to_streak();

-- ---------------------------------------------------------------------------
-- plans / subscriptions
-- ---------------------------------------------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  stripe_price_id text,
  features jsonb not null default '[]'::jsonb,
  price_display text
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan_id uuid references public.plans (id),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.fn_set_updated_at();

insert into public.plans (name, features, price_display) values
  ('free', '[]'::jsonb, 'Gratis'),
  ('premium', '["advanced_analytics", "csv_export", "custom_themes"]'::jsonb, '2,99€/mes');

-- ---------------------------------------------------------------------------
-- Row Level Security: every user reads/writes only their own rows.
-- Writes to `subscriptions` are reserved for the Stripe webhook, which uses
-- the service role key and therefore bypasses RLS entirely.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_checkins enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "habits_select_own" on public.habits
  for select using (auth.uid() = user_id);
create policy "habits_insert_own" on public.habits
  for insert with check (auth.uid() = user_id);
create policy "habits_update_own" on public.habits
  for update using (auth.uid() = user_id);
create policy "habits_delete_own" on public.habits
  for delete using (auth.uid() = user_id);

create policy "habit_checkins_select_own" on public.habit_checkins
  for select using (auth.uid() = user_id);
create policy "habit_checkins_insert_own" on public.habit_checkins
  for insert with check (auth.uid() = user_id);
create policy "habit_checkins_delete_own" on public.habit_checkins
  for delete using (auth.uid() = user_id);

create policy "plans_select_all" on public.plans
  for select using (true);

create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

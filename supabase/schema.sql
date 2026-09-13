-- North Hills Pickleball Availability — M0 schema
-- Run this once in the Supabase project's SQL editor.

create extension if not exists pgcrypto;

-- One row per court. Single hardcoded row for M0 (see CLAUDE.md).
create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

insert into public.courts (name)
select 'North Hills Park'
where not exists (select 1 from public.courts where name = 'North Hills Park');

-- Extends auth.users with the app-specific profile fields from the M0 data model.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  contact text,
  dupr_rating numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  court_id uuid not null references public.courts (id),
  date date not null,
  start_time time not null,
  end_time time not null,
  signal_type text not null check (signal_type in ('thinking', 'going')),
  created_at timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);

create index if not exists availability_date_idx on public.availability (date);
create index if not exists availability_user_idx on public.availability (user_id);

-- Auto-create a profile row when someone signs up, using the metadata
-- passed to supabase.auth.signUp() (name, dupr_rating, contact).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, contact, dupr_rating)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'contact', new.email),
    nullif(new.raw_user_meta_data ->> 'dupr_rating', '')::numeric
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.courts enable row level security;
alter table public.profiles enable row level security;
alter table public.availability enable row level security;

-- Courts: readable by any signed-in user, no writes from the client.
drop policy if exists "courts_select_authenticated" on public.courts;
create policy "courts_select_authenticated" on public.courts
  for select to authenticated using (true);

-- Profiles: everyone signed in can see display names (needed for the
-- aggregated view); users can only edit their own row.
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- Availability: everyone signed in can see everyone's signaled slots
-- (that's the aggregated view); users can only write/delete their own.
drop policy if exists "availability_select_authenticated" on public.availability;
create policy "availability_select_authenticated" on public.availability
  for select to authenticated using (true);

drop policy if exists "availability_insert_own" on public.availability;
create policy "availability_insert_own" on public.availability
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "availability_delete_own" on public.availability;
create policy "availability_delete_own" on public.availability
  for delete to authenticated using (auth.uid() = user_id);

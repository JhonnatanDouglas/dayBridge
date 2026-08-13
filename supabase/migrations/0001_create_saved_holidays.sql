create table public.saved_holidays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  external_id text not null,
  country_code text not null check (country_code in ('BR', 'US', 'GB', 'CA')),
  holiday_date date not null,
  local_name text not null,
  name text not null,
  created_at timestamptz not null default now(),
  constraint saved_holidays_user_external_unique unique (user_id, external_id)
);

create index saved_holidays_user_date_idx
  on public.saved_holidays (user_id, holiday_date);

alter table public.saved_holidays enable row level security;

revoke all on table public.saved_holidays from anon;
grant select, insert, delete on table public.saved_holidays to authenticated;

create policy "Users can read their own saved holidays"
  on public.saved_holidays
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can save holidays for themselves"
  on public.saved_holidays
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own saved holidays"
  on public.saved_holidays
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

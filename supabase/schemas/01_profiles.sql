create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 20),
  cat_type text not null default 'white'
    check (cat_type in ('white', 'black', 'mike', 'sham', 'chatora')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.profiles to service_role;
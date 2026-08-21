create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  is_solo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index groups_one_solo_per_owner
on public.groups (owner_id)
where is_solo;

alter table public.groups enable row level security;

revoke all on public.groups from anon, authenticated;

grant select, insert, update, delete on public.groups to service_role;
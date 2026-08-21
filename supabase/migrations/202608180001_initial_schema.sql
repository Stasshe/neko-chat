create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 20),
  cat_type text not null default 'white'
    check (cat_type in ('white', 'black', 'mike', 'sham', 'chatora')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  is_solo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists groups_one_solo_per_owner
on public.groups (owner_id)
where is_solo;

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_by_user
on public.group_members (user_id, joined_at desc);

create table if not exists public.invite_codes (
  group_id uuid primary key references public.groups(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 30),
  emotion text not null
    check (emotion in ('positive', 'neutral', 'negative', 'random')),
  created_at timestamptz not null default now()
);

create index if not exists posts_by_group
on public.posts (group_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.invite_codes enable row level security;
alter table public.posts enable row level security;
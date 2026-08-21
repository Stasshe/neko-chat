create table public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 30),
  emotion text not null
    check (emotion in ('positive', 'neutral', 'negative', 'random')),
  created_at timestamptz not null default now()
);

create index posts_by_group
on public.posts (group_id, created_at desc);

alter table public.posts enable row level security;

revoke all on public.posts from anon, authenticated;

grant select, insert, update, delete on public.posts to service_role;
create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  slot smallint not null check (slot between 1 and 5),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id),
  unique (group_id, slot)
);

create index group_members_by_user
on public.group_members (user_id, joined_at desc);

alter table public.group_members enable row level security;

revoke all on public.group_members from anon, authenticated;

grant select, insert, update, delete on public.group_members to service_role;
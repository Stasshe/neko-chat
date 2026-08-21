create table public.invite_codes (
  group_id uuid primary key references public.groups(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

revoke all on public.invite_codes from anon, authenticated;

grant select, insert, update, delete on public.invite_codes to service_role;
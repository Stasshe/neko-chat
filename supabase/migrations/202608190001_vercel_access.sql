alter table public.group_members
add column if not exists slot smallint;

with ranked_members as (
  select
    group_id,
    user_id,
    row_number() over (partition by group_id order by joined_at, user_id) as slot
  from public.group_members
)
update public.group_members member
set slot = ranked.slot
from ranked_members ranked
where member.group_id = ranked.group_id
  and member.user_id = ranked.user_id
  and member.slot is null;

alter table public.group_members
alter column slot set not null;

alter table public.group_members
add constraint group_members_slot_range check (slot between 1 and 5);

alter table public.group_members
add constraint group_members_group_slot_key unique (group_id, slot);

revoke all on public.profiles from anon, authenticated;
revoke all on public.groups from anon, authenticated;
revoke all on public.group_members from anon, authenticated;
revoke all on public.invite_codes from anon, authenticated;
revoke all on public.posts from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.groups to service_role;
grant select, insert, update, delete on public.group_members to service_role;
grant select, insert, update, delete on public.invite_codes to service_role;
grant select, insert, update, delete on public.posts to service_role;

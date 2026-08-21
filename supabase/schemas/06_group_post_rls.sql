create or replace function public.is_group_member(
  target_group_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = auth.uid()
  );
$$;

revoke all on function public.is_group_member(uuid) from public;
grant execute on function public.is_group_member(uuid)
to authenticated, service_role;

create or replace function public.is_group_owner(
  target_group_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.groups
    where id = target_group_id
      and owner_id = auth.uid()
  );
$$;

revoke all on function public.is_group_owner(uuid) from public;
grant execute on function public.is_group_owner(uuid)
to authenticated, service_role;

create policy "groups_select_member"
on public.groups
for select
to authenticated
using (public.is_group_member(id));

create policy "groups_insert_owner"
on public.groups
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "groups_update_owner"
on public.groups
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "groups_delete_owner"
on public.groups
for delete
to authenticated
using (owner_id = auth.uid());

create policy "group_members_select_member"
on public.group_members
for select
to authenticated
using (public.is_group_member(group_id));

create policy "group_members_insert_owner"
on public.group_members
for insert
to authenticated
with check (
  public.is_group_owner(group_id)
);

create policy "group_members_delete_self_or_owner"
on public.group_members
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.is_group_owner(group_id)
);

create policy "posts_select_member"
on public.posts
for select
to authenticated
using (public.is_group_member(group_id));

create policy "posts_insert_self"
on public.posts
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_group_member(group_id)
);
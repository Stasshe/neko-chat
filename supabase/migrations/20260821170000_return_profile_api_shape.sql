-- Return Profile values in the frontend API shape from every profile RPC.
drop function if exists public.create_profile_if_needed();
drop function if exists public.get_my_profile();
drop function if exists public.update_my_profile(text, text);

create or replace function public.create_profile_if_needed()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_row public.profiles;
  default_username text;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  select coalesce(
    nullif(left(trim(raw_user_meta_data ->> 'name'), 20), ''),
    nullif(left(trim(raw_user_meta_data ->> 'full_name'), 20), ''),
    nullif(left(trim(split_part(coalesce(email, ''), '@', 1)), 20), ''),
    'ななしの猫'
  )
  into default_username
  from auth.users
  where id = auth.uid();

  insert into public.profiles (id, username, cat_type)
  values (auth.uid(), default_username, 'mike')
  on conflict (id) do nothing;

  select * into profile_row
  from public.profiles
  where id = auth.uid();

  return jsonb_build_object(
    'profile', jsonb_build_object(
      'id', profile_row.id,
      'username', profile_row.username,
      'catType', profile_row.cat_type,
      'createdAt', profile_row.created_at,
      'updatedAt', profile_row.updated_at
    )
  );
end;
$$;

create or replace function public.get_my_profile()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'profile', jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'catType', p.cat_type,
      'createdAt', p.created_at,
      'updatedAt', p.updated_at
    )
  )
  from public.profiles as p
  where p.id = auth.uid();
$$;

create or replace function public.update_my_profile(
  p_username text,
  p_cat_type text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  profile_row public.profiles;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  if p_username is null or char_length(btrim(p_username)) not between 1 and 20 then
    raise exception 'username must be between 1 and 20 characters';
  end if;

  if p_cat_type is null
    or p_cat_type not in ('white', 'black', 'mike', 'sham', 'chatora') then
    raise exception 'invalid cat_type';
  end if;

  update public.profiles
  set
    username = btrim(p_username),
    cat_type = p_cat_type,
    updated_at = now()
  where id = auth.uid()
  returning * into profile_row;

  if not found then
    raise exception 'profile not found';
  end if;

  return jsonb_build_object(
    'profile', jsonb_build_object(
      'id', profile_row.id,
      'username', profile_row.username,
      'catType', profile_row.cat_type,
      'createdAt', profile_row.created_at,
      'updatedAt', profile_row.updated_at
    )
  );
end;
$$;

revoke all on function public.create_profile_if_needed() from public;
grant execute on function public.create_profile_if_needed() to authenticated;
revoke all on function public.get_my_profile() from public;
grant execute on function public.get_my_profile() to authenticated;
revoke all on function public.update_my_profile(text, text) from public;
grant execute on function public.update_my_profile(text, text) to authenticated;

-- Create the current authenticated user's profile if it does not exist yet.
-- This function is safe to call after every successful sign-in.
create or replace function public.create_profile_if_needed()
returns public.profiles
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

  select *
  into profile_row
  from public.profiles
  where id = auth.uid();

  return profile_row;
end;
$$;

revoke all on function public.create_profile_if_needed() from public;
grant execute on function public.create_profile_if_needed() to authenticated;

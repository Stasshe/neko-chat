-- Return the profile for the currently authenticated user only.
create or replace function public.get_my_profile()
returns public.profiles
language sql
stable
security invoker
set search_path = ''
as $$
  select p.*
  from public.profiles as p
  where p.id = auth.uid();
$$;

revoke all on function public.get_my_profile() from public;
grant execute on function public.get_my_profile() to authenticated;

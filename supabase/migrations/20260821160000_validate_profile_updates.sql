-- Keep profile data valid even when it is updated outside the RPC.
alter table public.profiles
  add constraint profiles_username_length_check
  check (char_length(btrim(username)) between 1 and 20);

alter table public.profiles
  add constraint profiles_cat_type_check
  check (cat_type in ('white', 'black', 'mike', 'sham', 'chatora'));

-- Validate inputs before saving and return the updated profile.
create or replace function public.update_my_profile(
  p_username text,
  p_cat_type text
)
returns public.profiles
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

  return profile_row;
end;
$$;

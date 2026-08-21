-- Update the currently authenticated user's profile and return the saved row.
-- Detailed username and cat-type validation is added in the follow-up migration.
create or replace function public.update_my_profile(
  p_username text,
  p_cat_type text
)
returns public.profiles
language sql
security invoker
set search_path = ''
as $$
  update public.profiles
  set
    username = p_username,
    cat_type = p_cat_type,
    updated_at = now()
  where id = auth.uid()
  returning *;
$$;

revoke all on function public.update_my_profile(text, text) from public;
grant execute on function public.update_my_profile(text, text) to authenticated;

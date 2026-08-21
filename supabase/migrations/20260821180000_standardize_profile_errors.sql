-- Standardize profile RPC responses as ApiResult<T>.
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
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'ログインが必要です')
    );
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
    'ok', true,
    'data', jsonb_build_object(
      'profile', jsonb_build_object(
        'id', profile_row.id,
        'username', profile_row.username,
        'catType', profile_row.cat_type,
        'createdAt', profile_row.created_at,
        'updatedAt', profile_row.updated_at
      )
    )
  );
exception
  when others then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'UNKNOWN', 'message', 'プロフィールの作成に失敗しました')
    );
end;
$$;

create or replace function public.get_my_profile()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  profile_row public.profiles;
begin
  if auth.uid() is null then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'ログインが必要です')
    );
  end if;

  select * into profile_row
  from public.profiles
  where id = auth.uid();

  if not found then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'NOT_FOUND', 'message', 'プロフィールが見つかりません')
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'profile', jsonb_build_object(
        'id', profile_row.id,
        'username', profile_row.username,
        'catType', profile_row.cat_type,
        'createdAt', profile_row.created_at,
        'updatedAt', profile_row.updated_at
      )
    )
  );
exception
  when others then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'UNKNOWN', 'message', 'プロフィールの取得に失敗しました')
    );
end;
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
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'UNAUTHORIZED', 'message', 'ログインが必要です')
    );
  end if;

  if p_username is null or char_length(btrim(p_username)) not between 1 and 20 then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'VALIDATION_ERROR', 'message', 'ユーザー名は1〜20文字で入力してください')
    );
  end if;

  if p_cat_type is null
    or p_cat_type not in ('white', 'black', 'mike', 'sham', 'chatora') then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'VALIDATION_ERROR', 'message', '猫の種類が不正です')
    );
  end if;

  update public.profiles
  set
    username = btrim(p_username),
    cat_type = p_cat_type,
    updated_at = now()
  where id = auth.uid()
  returning * into profile_row;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'NOT_FOUND', 'message', 'プロフィールが見つかりません')
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'profile', jsonb_build_object(
        'id', profile_row.id,
        'username', profile_row.username,
        'catType', profile_row.cat_type,
        'createdAt', profile_row.created_at,
        'updatedAt', profile_row.updated_at
      )
    )
  );
exception
  when others then
    return jsonb_build_object(
      'ok', false,
      'error', jsonb_build_object('code', 'UNKNOWN', 'message', 'プロフィールの更新に失敗しました')
    );
end;
$$;

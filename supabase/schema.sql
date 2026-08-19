-- 1. profiles テーブル
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 20),
  friend_code text unique not null,
  avatar_type text not null default 'orange_tabby',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. friendships テーブル
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_different_users check (requester_id <> addressee_id)
);

create unique index unique_friendship_pair on public.friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);

-- 3. groups テーブル
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. group_members テーブル
create table public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- 5. posts テーブル
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 100),
  cat_expression text not null check (cat_expression in ('normal', 'happy', 'sad', 'angry', 'sleepy', 'excited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_posts_group_user_created 
on public.posts (group_id, user_id, created_at desc);

-- 6. Friend Code 自動生成関数
create or replace function generate_friend_code()
returns text as $$
declare
  chars text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  result text := 'CAT-';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- 7. プロフィール自動作成トリガー
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, friend_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'ななしの猫'),
    generate_friend_code()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 8. RLS（セキュリティ設定）の有効化
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.posts enable row level security;

-- 9. ヘルパー関数
create or replace function is_group_member(_group_id uuid, _user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.group_members
    where group_id = _group_id and user_id = _user_id
  );
$$ language sql security definer;

-- 10. RLS ポリシー設定
create policy "全ユーザーがプロフを参照可能" on public.profiles for select using (true);
create policy "自分のプロフのみ更新可能" on public.profiles for update using (auth.uid() = id);

create policy "自分が関与するフレンド関係のみ参照可能" on public.friendships for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "自分の名義でフレンド申請作成" on public.friendships for insert with check (auth.uid() = requester_id);
create policy "申請の受け手のみステータス変更可能" on public.friendships for update using (auth.uid() = addressee_id);

create policy "所属メンバーのみグループ参照可能" on public.groups for select using (is_group_member(id, auth.uid()));
create policy "ログインユーザーはグループ作成可能" on public.groups for insert with check (auth.uid() = owner_id);
create policy "Ownerのみグループ更新可能" on public.groups for update using (auth.uid() = owner_id);
create policy "Ownerのみグループ削除可能" on public.groups for delete using (auth.uid() = owner_id);

create policy "同一グループのメンバー参照可能" on public.group_members for select using (is_group_member(group_id, auth.uid()));
create policy "グループ作成時またはOwnerによる招待" on public.group_members for insert with check (auth.uid() = user_id or exists (select 1 from public.groups where id = group_id and owner_id = auth.uid()));
create policy "Ownerによる削除または自己退出" on public.group_members for delete using (auth.uid() = user_id or exists (select 1 from public.groups where id = group_id and owner_id = auth.uid()));

create policy "グループメンバーのみ投稿を参照可能" on public.posts for select using (is_group_member(group_id, auth.uid()));
create policy "グループメンバーのみ自分名義で投稿可能" on public.posts for insert with check (auth.uid() = user_id and is_group_member(group_id, auth.uid()));
create policy "自分の投稿のみ削除可能" on public.posts for delete using (auth.uid() = user_id);

-- 11. Realtime の有効化
alter publication supabase_realtime add table public.posts;

--------------------------------------------------
-- グループ人数上限（5人）チェック
--------------------------------------------------

-- 1. 5人制限チェック用のトリガー関数
create or replace function public.check_group_member_limit()
returns trigger
language plpgsql
security definer
as $$
declare
  v_member_count integer;
begin
  -- 追加しようとしているグループの現在の人数をカウント
  select count(*)
    into v_member_count
    from public.group_members
   where group_id = new.group_id;

  -- 5人以上ならエラーを発生させる
  if v_member_count >= 5 then
    raise exception 'グループの人数上限（5人）に達しています。';
  end if;

  return new;
end;
$$;

-- 2. group_members テーブルへの追加前に実行するトリガー
drop trigger if exists check_group_member_limit_trigger on public.group_members;

create trigger check_group_member_limit_trigger
  before insert on public.group_members
  for each row
  execute function public.check_group_member_limit();
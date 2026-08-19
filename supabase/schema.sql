-- 1. profiles テーブル
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 1 and 20),
  cat_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. groups テーブル
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 30),
  is_solo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. group_members テーブル
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  constraint unique_group_user unique (group_id, user_id)
);

-- 4. invite_codes テーブル
create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  code text not null,
  created_at timestamptz not null default now(),
  constraint unique_invite_group_id unique (group_id),
  constraint unique_invite_code unique (code)
);

-- 5. posts テーブル
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 30),
  emotion text not null check (emotion in ('positive', 'neutral', 'negative', 'random')),
  created_at timestamptz not null default now()
);

create index idx_posts_group_user_created 
on public.posts (group_id, user_id, created_at desc);

-- 6. グループ人数上限（5人）チェック関数 ＆ トリガー
create or replace function check_group_member_limit()
returns trigger as $$
declare
  member_count integer;
begin
  select count(*) into member_count
  from public.group_members
  where group_id = new.group_id;

  if member_count >= 5 then
    raise exception 'グループの人数制限（5人）に達しています';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trigger_check_group_member_limit
  before insert on public.group_members
  for each row execute function check_group_member_limit();

-- 7. プロフィール自動作成トリガー（新規ログイン時）
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, cat_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'ななしの猫'),
    coalesce(new.raw_user_meta_data->>'cat_type', 'orange_tabby')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 8. RLS（セキュリティ設定）の有効化
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.invite_codes enable row level security;
alter table public.posts enable row level security;

-- 9. ヘルパー関数（グループ所属判定）
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

create policy "所属メンバーのみグループ参照可能" on public.groups for select using (is_group_member(id, auth.uid()));
create policy "ログインユーザーはグループ作成可能" on public.groups for insert with check (auth.uid() is not null);

create policy "同一グループのメンバー参照可能" on public.group_members for select using (is_group_member(group_id, auth.uid()));
create policy "グループ参加作成可能" on public.group_members for insert with check (auth.uid() = user_id);

create policy "ログインユーザーは招待コード参照・作成可能" on public.invite_codes for all using (auth.uid() is not null);

create policy "グループメンバーのみ投稿を参照可能" on public.posts for select using (is_group_member(group_id, auth.uid()));
create policy "グループメンバーのみ自分名義で投稿可能" on public.posts for insert with check (auth.uid() = user_id and is_group_member(group_id, auth.uid()));

-- 11. Realtime の有効化
alter publication supabase_realtime add table public.posts;
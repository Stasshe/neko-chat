# バックエンドタスク

## 前提

- 認証は `Supabase Auth + Googleログイン`
- 友達機能は今回やらない
- 画面の正はFigma
- `一人で始める` はUI上ではグループ作成/参加をスキップする
- ただし内部的には1人用グループを作って通常グループと同じ仕組みで扱う
- グループ人数上限は `5人`
- MVPでは `owner/member` の権限分けはしない
- 投稿文字数上限は `30文字`
- 投稿の編集・削除は今回やらない

## テーブル定義案

### `profiles`

- 役割
  - ユーザーのプロフィール情報を持つ
- カラム
  - `id`
    - 型: `uuid`
    - 必須
    - 認証ユーザーIDに対応
  - `username`
    - 型: `text`
    - 必須
  - `cat_type`
    - 型: `text`
    - 必須
  - `created_at`
    - 型: `timestamptz`
    - 必須
  - `updated_at`
    - 型: `timestamptz`
    - 必須

### `groups`

- 役割
  - グループ自体の情報を持つ
- カラム
  - `id`
    - 型: `uuid`
    - 必須
  - `name`
    - 型: `text`
    - 必須
  - `is_solo`
    - 型: `boolean`
    - 必須
    - 一人用グループかどうか
  - `created_at`
    - 型: `timestamptz`
    - 必須
  - `updated_at`
    - 型: `timestamptz`
    - 必須

### `group_members`

- 役割
  - 誰がどのグループに所属しているかを持つ
- カラム
  - `id`
    - 型: `uuid`
    - 必須
  - `group_id`
    - 型: `uuid`
    - 必須
  - `user_id`
    - 型: `uuid`
    - 必須
  - `joined_at`
    - 型: `timestamptz`
    - 必須
- 制約
  - `unique(group_id, user_id)`
- 今回持たせないもの
  - `role`
  - `owner_flag`

### `invite_codes`

- 役割
  - グループ参加用の招待コードを持つ
- カラム
  - `id`
    - 型: `uuid`
    - 必須
  - `group_id`
    - 型: `uuid`
    - 必須
  - `code`
    - 型: `text`
    - 必須
  - `created_at`
    - 型: `timestamptz`
    - 必須
- 制約
  - `unique(group_id)`
  - `unique(code)`

### `posts`

- 役割
  - 投稿データを持つ
- カラム
  - `id`
    - 型: `uuid`
    - 必須
    - 投稿1件ごとのID
  - `group_id`
    - 型: `uuid`
    - 必須
  - `user_id`
    - 型: `uuid`
    - 必須
  - `body`
    - 型: `text`
    - 必須
    - 最大30文字
  - `emotion`
    - 型: `text`
    - 必須
    - `positive`, `neutral`, `negative`, `random`
  - `created_at`
    - 型: `timestamptz`
    - 必須

## 重要ルール

- グループ内の全ユーザーは同じ権限として扱う
- 招待コードは `1グループ1コード`
- 招待コードの期限切れは今回なし
- 招待コードの再生成は今回なし
- 一人モードでもホーム・投稿・取得処理は通常グループと同じ仕組みで扱う
- 1ユーザーは複数グループに所属できる

## 2人での担当分け

## 優先順位

### 最優先

1. Googleログイン設定
2. `profiles` の作成
3. `groups`, `group_members`, `invite_codes` の作成
4. 一人モード開始処理
5. 通常グループ作成処理
6. 招待コード参加処理
7. `posts` の作成
8. 投稿取得処理
9. 投稿作成処理

### 次にやる

1. RLS の厳密化
2. エラーコードの統一
3. 複数アカウントでの結合確認

## バックエンドに返してもらうべきもの

1. `Profile`
2. `GroupSummary`
3. `InviteCode`
4. `Post`
5. `Post.user`
6. 主機能ごとの input / output
7. 共通エラー型

理由:

- フロントが画面表示用に複数テーブルの情報を毎回手で組み立てなくて済むようにするため
- ホーム画面やグループ画面で必要な情報を、1回の取得で表示しやすくするため
- エラー時の分岐をフロントと揃えるため

## A担当: 認証 / プロフィール / 基盤

### タスク

1. Supabase Auth で Googleログインを有効化する
2. ローカルのリダイレクトURLが動くことを確認する
3. `profiles` テーブルを作る
4. `profiles` の制約を入れる
5. 自分のプロフィールだけ読めるRLSを入れる
6. 自分のプロフィールだけ更新できるRLSを入れる
7. 初回ログイン後のプロフィール作成処理を作る
8. 自分のプロフィール取得処理を作る
9. 自分のプロフィール更新処理を作る
10. `username` と `cat_type` の更新時バリデーションを入れる
11. 自分が担当した変更を `supabase/schemas/01_profiles.sql` に反映する
12. `Profile` の返り値をフロント向けの形に揃える
13. プロフィール系のエラー形を揃える

### 完了条件

- Googleログインが成功する
- ログイン済みユーザーが自分のプロフィールを取得できる
- `username` を更新できる
- `cat_type` を更新できる
- 他人のプロフィールを更新できない

## B担当: グループ / 招待コード / 投稿

### タスク

1. `groups` テーブルを作る
2. `group_members` テーブルを作る
3. `invite_codes` テーブルを作る
4. `posts` テーブルを作る
5. 外部キーと一意制約を入れる
6. グループ人数上限5人のチェックを入れる
7. 一人モード開始処理を作る
8. 通常グループ作成処理を作る
9. 招待コード発行処理を作る
10. 招待コード参加処理を作る
11. 自分の所属グループ一覧取得処理を作る
12. 投稿作成処理を作る
13. グループ投稿一覧取得処理を作る
14. グループ関連のRLSを `supabase/schemas/06_group_post_rls.sql` に入れる
15. 投稿関連のRLSを `supabase/schemas/06_group_post_rls.sql` に入れる
16. 投稿文字数と emotion の値チェックを入れる
17. 自分が担当した変更を `supabase/schemas/02_groups.sql`〜`supabase/schemas/06_group_post_rls.sql` の該当ファイルに反映する
18. `GroupSummary`, `InviteCode`, `Post`, `Post.user` の返り値をフロント向けの形に揃える
19. グループ系・投稿系のエラー形を揃える

### 完了条件

- 一人モードで内部的な1人用グループが作られる
- 通常グループ作成で、グループ・所属情報・招待コードが作られる
- 招待コード参加ができる
- 6人目は参加できない
- グループメンバーが投稿を作成できる
- 非メンバーはそのグループの投稿を読めない、作れない

## 実装単位

GitHub Issue は次の単位で切る想定です。

- `create_profile_if_needed`
- `get_my_profile`
- `update_my_profile`
- `start_solo_mode`
- `create_group_with_invite`
- `join_group_by_invite_code`
- `get_my_groups`
- `create_post`
- `get_group_posts`

## バックエンドが返す形として優先して揃えるもの

1. `getMyProfile` で `Profile` を返す
2. `createGroupWithInvite` で `GroupSummary` と `inviteCode` を返す
3. `joinGroupByInviteCode` で `GroupSummary` を返す
4. `getMyGroups` で `GroupSummary[]` を返す
5. `getGroupPosts` で `group` と `posts` を返す
6. `createPost` で `Post` を返す

## おすすめ実装順

1. Googleログイン設定
2. `profiles`
3. `groups`, `group_members`, `invite_codes`
4. 一人モード
5. 通常グループ作成
6. 招待コード参加
7. `posts`
8. RLS確認
9. 複数アカウントで結合確認

## 結合確認チェック

1. Googleログインできる
2. プロフィールが存在しなければ作られる
3. `username` と `cat_type` を保存できる
4. 一人モードでホームに入れる
5. 通常グループを作って招待コードが発行される
6. 別ユーザーが招待コードで参加できる
7. 同じグループ内で投稿一覧を取得できる
8. 同じグループ内で投稿を作成できる
9. 6人目がブロックされる
10. 非メンバーは別グループの投稿を見られない

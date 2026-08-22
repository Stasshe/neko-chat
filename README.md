# 猫チャット

猫の表情と30文字以内の一言で、グループ内の近況を共有するモバイルPWA。

## 開発

```bash
pnpm install
pnpm dev
```

コンポーネント単体確認は `pnpm storybook`。詳細は [STORYBOOK.md](./STORYBOOK.md)。

### 環境変数

Next.jsのモード別env読み込みで、ローカル用と本番用を分離している。コピーや切り替えは不要。

| ファイル | 使われるタイミング |
| --- | --- |
| `.env.development.local` | `pnpm dev` |
| `.env.production.local` | `pnpm build` / `pnpm start` |

初回セットアップ:

```bash
cp .env.development.local.example .env.development.local
pnpm db:start   # Docker上にローカルSupabaseを起動
```

`pnpm db:start` の出力(`SECRET_KEY`)を `.env.development.local` の `SUPABASE_SECRET_KEY` に貼る。service-role鍵なのでコミットしない。

```bash
pnpm dev
```

停止は `pnpm db:stop`、スキーマ変更後は `pnpm db:reset`。ログインはメール/パスワードで完結するので、Google OAuthの設定なしで動作確認できる。

本番Supabaseに接続して確認したい場合は `.env.production.local` に値を設定し、`pnpm build && pnpm start` で起動する。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

公開変数はSupabase Auth専用。`SUPABASE_SECRET_KEY`はVercelのRoute Handlerだけが使い、ブラウザへ配布しない。

既存プロジェクトはSupabase SQL Editorで `supabase/migrations/202608190001_vercel_access.sql` を一度適用する。Vercel用権限と5人上限を保証するmember slot制約が入る。

### Supabaseスキーマの管理

DBスキーマの正本は `supabase/schemas/*.sql` とする。
テーブル定義、インデックス、RLS、権限を変更する場合は、担当するテーブルのファイルへ反映する。

| 実行順 | ファイル | 管理対象 |
| --- | --- | --- |
| 1 | `supabase/schemas/01_profiles.sql` | `profiles` |
| 2 | `supabase/schemas/02_groups.sql` | `groups` |
| 3 | `supabase/schemas/03_group_members.sql` | `group_members` |
| 4 | `supabase/schemas/04_invite_codes.sql` | `invite_codes` |
| 5 | `supabase/schemas/05_posts.sql` | `posts` |
| 6 | `supabase/schemas/06_group_post_rls.sql` | `groups` / `group_members` / `posts` のRLS Policyと補助関数 |

外部キーの依存関係があるため、初回構築時は必ず `01` から `06` の順で実行する。

スキーマ変更時のルール:

- 変更対象のテーブルに対応するSQLファイルだけを編集する
- 複数テーブルにまたがる変更は、各テーブルのファイルへ分けて反映する
- 新しいテーブルを追加する場合は、外部キーの依存順に番号を付ける
- `supabase/schema.sql` は使用しない
- 既存環境の更新は `supabase/migrations/` のmigrationで行う
- `DROP TABLE`、`DROP COLUMN` などの破壊的変更は、適用前に必ずレビューする

## データ境界

ブラウザはアクセストークン付きで `/api` を呼ぶ。Route Handlerがトークン検証、入力検証、認可、Supabase Data API呼び出しを担当する。リクエスト、APIレスポンス、Supabaseの取得行、環境変数はZodで境界検証する。5人上限はメンバーslotの一意制約で保証する。Supabase RPC、DBトリガー、ブラウザからの直接DB操作は使わない。

## 画面

オンボーディングは `/onboarding/profile` から開始し、ユーザー名、モード、グループ作成／参加、猫選択の順でAPIへ保存する。既存ユーザーの主要画面は `/home` を起点にする。

- `/onboarding/cat`: 猫選択とプロフィール保存
- `/onboarding/invite`: 招待コード表示・コピー
- `/home`: 現在のグループの投稿空間
- ホームのつぶやきパネル: 30文字投稿と表情選択
- `/groups`: 所属グループ一覧・切り替え
- `/settings`: 名前・猫・ログアウト

完成像の正は `figma-img/`。書き出し画像は参照資料として保持し、UIで再利用する猫・ナビゲーション・吹き出しは `src/components/` の解像度非依存部品として管理する。

## 検証

```bash
pnpm lint
pnpm format:check
pnpm exec tsc --noEmit
pnpm build
```

Pull Requestと`main`へのpushでは、GitHub Actionsがlint、format、buildを検証する。`main`のRepository rulesでは`ci-lint`、`ci-format`、`ci-build`をrequired checksに指定する。

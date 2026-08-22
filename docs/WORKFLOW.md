# Workflow

このリポジトリでは、古い `main` をベースにしたまま作業を進めてしまい、最新実装を巻き戻す事故を防ぐことを最優先にする。

## 基本ルール

1. 新しい issue に着手するときは、毎回 `origin/main` から新しいブランチを切る。
2. 昔使った作業ブランチを使い回さない。
3. PR を作る前に、`origin/main` との差分を必ず確認する。
4. 担当外ファイルの大量変更や大量削除が見えたら、その PR は一度止める。
5. `main` への直接 push はしない。

## 作業開始手順

毎回この手順で開始する。

```bash
git fetch origin
git switch main
git reset --hard origin/main
git switch -c feature/issue-xx-summary
```

`feature/issue-xx-summary` は作業内容が分かる名前にする。

## ローカル開発環境

`pnpm dev` はローカルSupabase(`pnpm db:start`)を使う。Google OAuth設定なしでメール/パスワードログインで動作確認できる。詳細は [README.md](./README.md#環境変数)。

例:

```bash
git switch -c feature/profile-rls
git switch -c feature/onboarding-mode-page
```

## 作業中の更新手順

`main` が進んだら、PR を出す前に最新 `main` を取り込む。

### merge 方式

```bash
git fetch origin
git merge origin/main
```

### rebase 方式

```bash
git fetch origin
git rebase origin/main
```

チームで統一ルールがない場合は、履歴事故を避けやすい `merge origin/main` を優先する。

## PR 作成前の必須チェック

PR を出す前に、必ず次を確認する。

```bash
git diff --stat origin/main
git diff --name-status origin/main
git log --oneline --decorate --graph --left-right origin/main...HEAD
```

## チェック時の見方

### `git diff --stat origin/main`

- 担当範囲の差分だけか
- 変更量が想定より大きすぎないか

### `git diff --name-status origin/main`

- `D` が大量に並んでいないか
- `src/app/*` や `src/server/*` の大量削除が起きていないか
- `README.md` や `package.json` など、担当外の基盤ファイルが不自然に変わっていないか

### `git log --left-right origin/main...HEAD`

- `>` は自分のブランチだけにあるコミット
- `<` は `main` 側にだけあるコミット
- `main` 側に新しいコミットが多いのに未取り込みなら、そのまま PR を出さない

## 危険信号

次のどれかが出たら、その PR はいったん止める。

- テンプレ画面に戻っている
- 既存画面や `src/server/*` が大量に消えている
- `supabase/schema.sql` を古い仕様で復活させている
- `supabase/schemas/*.sql` を消している
- `package.json` から依存が消えている
- 担当 issue と無関係な大量変更が入っている

## 古いブランチを救済しない判断

差分確認で大量削除や巻き戻しが見えたら、無理に直し続けない。

その場合は次の手順でやり直す。

```bash
git fetch origin
git switch -c fix/redo-issue-xx origin/main
```

必要なファイルだけを古いブランチから個別に持ってくる。

やってはいけない例:

```bash
git merge old-branch
git checkout old-branch -- .
```

安全な例:

```bash
git checkout old-branch -- path/to/needed-file.sql
```

## PR レビュー時の確認ポイント

レビュー担当は、機能だけでなくベースブランチ事故も確認する。

- この差分は本当に issue の範囲だけか
- 最新 `main` を取り込んでいるか
- 大量削除や古い仕様への巻き戻しがないか
- lint / build の確認結果があるか

## 推奨の最終確認

可能なら PR 前にこれを実行する。

```bash
pnpm lint
pnpm build
```

## 迷ったとき

迷ったら、次の順で止まって確認する。

1. `origin/main` との差分を見る
2. 担当外の変更が入っていないか見る
3. 危険なら新しいブランチを `origin/main` から作り直す

古いブランチを頑張って延命するより、最新 `main` から必要な差分だけ積み直した方が安全なことが多い。

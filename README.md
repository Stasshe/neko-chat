# 猫チャット

猫の表情と30文字以内の一言で、グループ内の近況を共有するモバイルPWA。

## 開発

```bash
pnpm install
pnpm dev
```

Supabase 接続には次の公開環境変数が必要。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

未設定・API失敗時は主要画面内にエラーを表示する。Service Role Key はブラウザへ渡さない。

## 画面

- `/onboarding/cat`: 猫選択とプロフィール保存
- `/onboarding/invite`: 招待コード表示・コピー
- `/home`: 現在のグループの投稿空間
- `/compose`: 30文字投稿と表情選択
- `/groups`: 所属グループ一覧・切り替え
- `/settings`: 名前・猫・ログアウト

完成像の正は `figma-img/`。書き出し画像は参照資料として保持し、UIで再利用する猫・ナビゲーション・吹き出しは `src/components/` の解像度非依存部品として管理する。

## 検証

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

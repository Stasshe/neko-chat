# Storybook

コンポーネントを単体で確認するためのツール。`figma-img/` の完成イメージと突き合わせながらUI実装するときに使う。

## 起動

```bash
pnpm storybook
```

http://localhost:6006 で開く。

## 「Couldn't find any stories」と出る場合

エラーではない。`*.stories.tsx` ファイルがまだ存在しないだけ。
`.storybook/main.ts` の `stories` は `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` を探す設定。対象コンポーネントに story ファイルを作れば表示される。

## Story の書き方

対象コンポーネントと同じディレクトリに `ComponentName.stories.tsx` を置く。

```tsx
// src/components/button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "投稿する",
  },
};
```

## ログイン画面へのリダイレクトについて

`AuthGuard`(`src/lib/auth/auth-guard.tsx`)配下のコンポーネントは通常 `useAuth()` が未ログイン状態だと `/` へ `redirect` する。

Storybook では `.storybook/preview.tsx` の decorator で `AuthContext.Provider` に `isAuthenticated: true` の固定値を注入している。これにより Storybook 上ではリダイレクトが発生せず、認証必須コンポーネントもそのまま表示できる。認証状態を変えたテストが必要な場合は、この decorator ではなく該当 story 個別に別の decorator を追加する。

## 構成

自動セットアップ(`storybook init`)は vitest / playwright / chromatic / MCP addon まで一括導入するが、今回はコンポーネント単体確認のみが目的のため未使用アドオンは削除済み。`@storybook/nextjs-vite` フレームワーク + `@storybook/addon-docs` の最小構成。

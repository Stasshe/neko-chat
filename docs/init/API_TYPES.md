# API 型メモ

## 目的

- フロントエンドとバックエンドで、APIの入出力認識を揃えるためのメモ
- まずはMVPの主機能で必要な型を先に固める
- 追加候補の型は後から拡張できるように分けて持つ

## 前提

- 認証は `Supabase Auth + Googleログイン`

## 共通ルール

1. ID はフロントではすべて `string` として扱う
2. 日時は ISO 文字列で扱う
3. API の成功時と失敗時の形をできるだけ揃える
4. フロントは Supabase の生レスポンスをそのまま使わず、アプリ用の型に寄せて扱う
5. APIレスポンスはZodで検証し、アプリ型は共通スキーマから推論する

## 役割分担

### バックエンドに返してもらうべきもの

- `Profile`
- `GroupSummary`
- `InviteCode`
- `Post`
- `Post.user`
- 各主機能の input / output
- `ApiError`

理由:

- 画面表示に必要なデータをフロントで毎回組み立て直さないため
- 参加処理や投稿取得など、複数テーブルにまたがる情報をフロントへそのまま渡せるようにするため
- エラー時の扱いをフロントとバックエンドで揃えるため

### フロントで吸収してよいもの

- `AuthState`
- `CurrentGroupState`
- `OnboardingDraft`
- `GroupMemberPreview`

理由:

- 一時状態や表示補助のための型であり、保存形式そのものではないため
- バックエンド実装よりもフロントの画面都合で変わりやすいため

## 主機能で使う型

### `CatType`

```ts
type CatType = "white" | "black" | "mike" | "sham" | "chatora";
```

注記:

- 値は仮置き
- Figma に合わせて最終確定する

### `Emotion`

```ts
type Emotion = "positive" | "neutral" | "negative" | "random";
```

### `Profile`

```ts
type Profile = {
  id: string;
  username: string;
  catType: CatType;
  createdAt: string;
  updatedAt: string;
};
```

### `Group`

```ts
type Group = {
  id: string;
  name: string;
  isSolo: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### `GroupSummary`

```ts
type GroupSummary = {
  id: string;
  name: string;
  isSolo: boolean;
  memberCount: number;
};
```

注記:

- 一覧用の軽い型
- `inviteCode` は常には含めない
- 招待コードが必要なAPIだけ個別に返す

### `InviteCode`

```ts
type InviteCode = {
  groupId: string;
  code: string;
};
```

### `PostUser`

```ts
type PostUser = {
  id: string;
  username: string;
  catType: CatType;
};
```

### `Post`

```ts
type Post = {
  id: string;
  groupId: string;
  userId: string;
  body: string;
  emotion: Emotion;
  createdAt: string;
  user: PostUser;
};
```

注記:

- `user` をネストで返す前提の型
- これによりホーム画面で表示しやすくなる

## 主機能の API 入出力型

HTTP境界:

| Method | Path | Operation |
| --- | --- | --- |
| `GET` | `/api/profile` | `createProfileIfNeeded`, `getMyProfile` |
| `PATCH` | `/api/profile` | `updateMyProfile` |
| `GET` | `/api/groups` | `getMyGroups` |
| `POST` | `/api/groups` | `startSoloMode`, `createGroupWithInvite` |
| `POST` | `/api/groups/join` | `joinGroupByInviteCode` |
| `GET` | `/api/groups/:groupId/posts` | `getGroupPosts` |
| `POST` | `/api/groups/:groupId/posts` | `createPost` |

ブラウザはSupabase AuthのBearer tokenを送る。Vercel Route Handlerが認証・認可・Supabase Data API呼び出しを担当する。Supabase RPCは使わない。

### `createProfileIfNeeded`

```ts
type CreateProfileIfNeededResponse = {
  profile: Profile;
};
```

注記:

- Googleログイン成功直後に `profiles` を作る前提
- そのため `profile` は常に存在する想定

### `getMyProfile`

```ts
type GetMyProfileResponse = {
  profile: Profile;
};
```

### `updateMyProfile`

```ts
type UpdateMyProfileInput = {
  username: string;
  catType: CatType;
};

type UpdateMyProfileResponse = {
  profile: Profile;
};
```

### `startSoloMode`

```ts
type StartSoloModeResponse = {
  group: GroupSummary;
};
```

注記:

- 一人モードでは既存の solo group があれば再利用する
- 同じユーザーに solo group を複数作らない

### `createGroupWithInvite`

```ts
type CreateGroupWithInviteInput = {
  name: string;
};

type CreateGroupWithInviteResponse = {
  group: GroupSummary;
  inviteCode: string;
};
```

### `joinGroupByInviteCode`

```ts
type JoinGroupByInviteCodeInput = {
  code: string;
};

type JoinGroupByInviteCodeResponse = {
  group: GroupSummary;
};
```

### `getMyGroups`

```ts
type GetMyGroupsResponse = {
  groups: GroupSummary[];
};
```

### `getGroupPosts`

```ts
type GetGroupPostsInput = {
  groupId: string;
};

type GetGroupPostsResponse = {
  group: GroupSummary;
  posts: Post[];
};
```

### `createPost`

```ts
type CreatePostInput = {
  groupId: string;
  body: string;
  emotion: Emotion;
};

type CreatePostResponse = {
  post: Post;
};
```

## 共通エラー型

### `ApiErrorCode`

```ts
type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "GROUP_FULL"
  | "INVALID_INVITE_CODE"
  | "ALREADY_JOINED"
  | "CONFIGURATION_ERROR"
  | "UNKNOWN";
```

### `ApiError`

```ts
type ApiError = {
  code: ApiErrorCode;
  message: string;
};
```

### `ApiResult<T>`

```ts
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };
```

## 追加候補の型

### `AuthState`

```ts
type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
};
```

### `CurrentGroupState`

```ts
type CurrentGroupState = {
  currentGroupId: string | null;
};
```

### `OnboardingDraft`

```ts
type OnboardingDraft = {
  username: string;
  selectedMode: "solo" | "create_group" | "join_group" | null;
  catType: CatType | null;
  groupName: string;
  inviteCode: string;
};
```

### `GroupMemberPreview`

```ts
type GroupMemberPreview = {
  id: string;
  username: string;
  catType: CatType;
};
```

注記:

- これはフロント側で表示用に整える軽量型として持てばよい

## まだ未確定の論点

1. `CatType` の値一覧の最終確定
2. `getGroupPosts` に `group` を含めるか最終確定

## 反映済みの決定事項

1. `startSoloMode` は既存 solo group を再利用する
2. `Post.user` はネストして返す
3. `GroupSummary` に `inviteCode` は常には含めない
4. Googleログイン成功直後に `profiles` を作る

## このファイルの使い方

1. フロントが画面に必要なデータを確認する
2. バックエンドが返り値として実装可能か確認する
3. 不要な項目や足りない項目をここで修正する
4. 合意したら、フロント型・バックエンド返り値・実装をこれに寄せる

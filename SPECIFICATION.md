猫チャット PWA 仕様書

1. 概要

1.1 プロダクト名

猫チャット

1.2 コンセプト

友達同士でグループを作り、短い一言と「猫の表情」を投稿して、ゆるく近況を共有するPWA。

LINEのように友達を追加し、その友達を招待してグループを作成する。

通常のチャットアプリのようなリアルタイム会話を主目的にはせず、

* 今なにしてる
* どんな気分
* ちょっとした一言

を短文で共有することを中心とする。

各投稿には猫の表情・ポーズを設定でき、グループ画面上では各ユーザーの猫が投稿内容に応じた姿で表示される。

⸻

2. 技術構成

2.1 Frontend

* Next.js
* React
* TypeScript
* App Router
* PWA
* Tailwind CSS などによるスタイリング

2.2 Backend

Supabaseを利用する。

使用機能：

* Supabase Auth
* PostgreSQL
* Row Level Security
* Supabase Realtime
* Supabase Storage

基本的には独立したAPIサーバーを設けず、Next.js + Supabaseで構成する。

サーバー側処理が必要な場合は以下を使用する。

* Next.js Server Actions
* Route Handlers
* Supabase Edge Functions

⸻

3. ユーザー

3.1 User

猫チャットを利用するユーザー。

ユーザーは以下を持つ。

* User ID
* ユーザー名
* アイコン用猫
* 友達
* 所属グループ
* 投稿

⸻

4. 基本ユーザーフロー

初回利用時：

アプリ起動
↓
ユーザー登録 / ログイン
↓
ユーザー名設定
↓
ホーム

友達との利用：

友達追加
↓
グループ作成
↓
友達をグループへ招待
↓
投稿
↓
グループメンバーが閲覧

⸻

5. 認証

5.1 認証方式

Supabase Authを利用する。

MVPでは以下のいずれかを採用する。

推奨：

* Email + Password

将来的には以下にも対応可能。

* Google
* Apple
* Magic Link

5.2 Session

Supabase Authのセッションを利用する。

未認証ユーザーはグループや投稿へアクセスできない。

⸻

6. プロフィール

ユーザーはプロフィール情報を持つ。

項目

項目	内容
id	Supabase Auth User ID
username	表示名
avatar_type	猫の種類
created_at	作成日時
updated_at	更新日時

username

* 1〜20文字
* グループ内で表示
* 重複可能

⸻

7. 友達機能

7.1 概要

LINEの友達追加に近い仕組みを提供する。

友達になったユーザーをグループへ招待できる。

⸻

7.2 友達追加方法

MVPでは以下を採用する。

Friend Code

ユーザーごとに一意のFriend Codeを発行する。

例：

CAT-4JF8X2

友達のコードを入力すると友達申請できる。

将来的にはFriend CodeからQRコードを生成する。

Friend Code
↓
QR Code
↓
相手が読み取り
↓
友達追加

⸻

7.3 友達申請

状態：

pending
accepted
rejected

フロー：

User A
↓
Friend Request
↓
User B
↓
Accept
↓
Friends

一方的なfollowではなく、双方の承認によるFriend関係とする。

⸻

8. グループ

8.1 グループ作成

ユーザーは新しいグループを作成できる。

入力項目：

* グループ名
* 招待する友達

グループ名：

* 1〜30文字

⸻

8.2 グループメンバー

グループには複数ユーザーが所属する。

MVPでは以下のRoleを用意する。

owner
member

owner

* グループ名変更
* メンバー招待
* メンバー削除
* グループ削除

member

* 投稿
* 投稿閲覧
* グループ退出

⸻

8.3 招待

グループ作成時またはグループ設定から友達を招待できる。

MVPでは招待されたユーザーを即時参加させてもよい。

将来的には：

invited
accepted
rejected

形式へ拡張可能。

⸻

9. 投稿

9.1 概要

グループ内に短文を投稿する。

投稿はTwitter/X型の公開投稿ではなく、所属しているグループ内限定の投稿とする。

⸻

9.2 投稿内容

投稿は以下を持つ。

投稿者
本文
猫の表情
投稿日時

本文：

* 最大100文字
* 空文字不可

MVPでは画像投稿なし。

⸻

10. 猫の表情

投稿時に猫の状態を選択する。

例：

NORMAL
HAPPY
SAD
ANGRY
SLEEPY
EXCITED

UI上では文字ではなく猫のイラストで選択する。

例：

😺 普通
😸 楽しい
😿 悲しい
😾 怒り
😴 眠い
🙀 びっくり

実際のUIではEmojiではなく、猫チャット独自のイラストを利用する。

⸻

11. グループ画面

猫チャットの中心となる画面。

参考デザインのように、グループを「猫たちが集まっている空間」として表示する。

例えば：

公園
部屋
庭

などの背景上に各ユーザーの猫を配置する。

⸻

11.1 猫表示

各メンバーについて、そのユーザーの最新投稿を表示する。

User A
「眠すぎる」
😴
User B
「いまからバイト」
😿

これを画面上では猫 + 吹き出しとして表示する。

⸻

11.2 最新投稿

基本的には各ユーザーの最新投稿を1件表示する。

つまり投稿が増えるたび画面に無限に吹き出しを増やすのではなく、

User A
最新投稿
↓
新しい投稿
↓
表示更新

とする。

過去投稿は別画面から閲覧できる。

⸻

12. 投稿作成

画面下部の投稿ボタンから投稿する。

フロー：

投稿ボタン
↓
本文入力
↓
猫の表情選択
↓
投稿

投稿フォーム：

------------------------
いまどうしてる？
[                  ]
猫の気分
○ NORMAL
○ HAPPY
○ SAD
○ SLEEPY
        投稿する
------------------------

投稿すると即座にグループ画面へ反映する。

Supabase Realtimeを使用する。

⸻

13. タイムライン

各グループには過去投稿を確認するためのタイムラインを用意する。

表示：

User A
「大学ついた」
10:21
User B
「眠すぎ」
10:18
User A
「電車」
09:42

新しい順に表示。

⸻

14. ホーム

ログイン後のトップ画面。

表示内容：

* 所属グループ
* グループ追加
* 友達

例：

グループ
┌─────────────┐
│ 大学           │
│ 👱 👱 👱       │
└─────────────┘
┌─────────────┐
│ バイト         │
│ 👱 👱          │
└─────────────┘
        ＋
   グループを作る

⸻

15. Bottom Navigation

主要画面ではBottom Navigationを表示する。

Home
Post
Groups

参考UIに合わせる場合：

🏠       ✏️       🐈🐈
ホーム   つぶやく   グループ

⸻

16. 画面一覧

MVPでは以下を実装する。

ID	画面
S01	ログイン
S02	ユーザー登録
S03	初期プロフィール設定
S04	ホーム
S05	グループ一覧
S06	グループ作成
S07	グループ
S08	投稿作成
S09	投稿履歴
S10	友達一覧
S11	友達追加
S12	友達申請
S13	グループ設定
S14	ユーザー設定

⸻

17. データベース

profiles

profiles
id uuid primary key
username text
friend_code text unique
avatar_type text
created_at timestamptz
updated_at timestamptz

idはauth.users.idと対応する。

⸻

18. friendships

友達関係。

friendships
id uuid primary key
requester_id uuid
addressee_id uuid
status text
created_at timestamptz
updated_at timestamptz

status：

pending
accepted
rejected

制約として、

requester_id != addressee_id

を設定する。

また、同じ2ユーザー間でFriendshipが重複しないようにする。

⸻

19. groups

groups
id uuid primary key
name text
owner_id uuid
created_at timestamptz
updated_at timestamptz

⸻

20. group_members

group_members
group_id uuid
user_id uuid
role text
joined_at timestamptz

Primary Key：

(group_id, user_id)

role：

owner
member

⸻

21. posts

posts
id uuid primary key
group_id uuid
user_id uuid
content text
cat_expression text
created_at timestamptz
updated_at timestamptz

cat_expression：

normal
happy
sad
angry
sleepy
excited

⸻

22. Relations

概念的には以下となる。

auth.users
    |
    1
    |
profiles
profiles
    |
    | friendships
    |
profiles
groups
    |
    N
group_members
    N
    |
profiles
groups
    |
    1
    |
    N
posts
    N
    |
profiles

⸻

23. Row Level Security

SupabaseではRLSを必須とする。

Frontendによる表示制御だけでアクセス制御を行わない。

⸻

posts

SELECT可能条件：

ログインユーザーが
そのpost.group_idの
group_memberである

INSERT可能条件：

user_id = auth.uid()
AND
auth.uid() が
そのgroupのmember

UPDATE / DELETE：

post.user_id = auth.uid()

⸻

groups

SELECT：

auth.uid() がgroup_member

UPDATE：

auth.uid() がowner

DELETE：

auth.uid() がowner

⸻

group_members

SELECT：

auth.uid() が同一groupのmember

INSERT：

group ownerのみ

DELETE：

ownerによる削除
OR
本人による退出

⸻

friendships

閲覧可能：

requester_id = auth.uid()
OR
addressee_id = auth.uid()

Friend Request作成：

requester_id = auth.uid()

承認：

addressee_id = auth.uid()

⸻

24. Realtime

Supabase Realtimeを使用する。

対象：

posts

グループ画面を開いているユーザーは、そのグループの新規投稿を購読する。

INSERT posts
WHERE group_id = currentGroupId

イベント受信後に画面を更新する。

⸻

25. PWA

猫チャットはPWAとして提供する。

対応：

* Add to Home Screen
* standalone表示
* manifest
* app icon
* theme color
* Service Worker

MVPではオフライン投稿は対応しない。

ネットワーク接続がない場合：

現在オフラインです

と表示する。

⸻

26. 通知

MVPではPush Notificationは必須としない。

将来的にはWeb Pushを利用し、

〇〇が「大学」グループにつぶやきました

のような通知を実装する。

通知過多を防ぐため、グループ単位で通知ON/OFFを設定できる設計を想定する。

⸻

27. 投稿削除

投稿者本人のみ削除可能。

削除した投稿はMVPではDBから削除する。

将来的に監査性が必要になった場合、

deleted_at

によるSoft Deleteへ変更する。

⸻

28. グループ退出

memberは自由に退出可能。

ownerは、

他ユーザーへownerを移譲

してから退出する。

メンバーがownerしか存在しない場合はグループ削除を選択できる。

⸻

29. 非機能要件

Performance

通常操作について、

初期表示: 3秒以内
画面遷移: 1秒以内を目標

とする。

⸻

Security

以下を必須とする。

* Supabase RLS
* Server-side Authorization
* 入力値Validation
* XSS対策
* CSRFを考慮した認証設計
* UUIDによるResource ID
* Secret KeyをClientへ公開しない

SUPABASE_SECRET_KEYはVercel環境変数だけに置く。

⸻

30. 入力Validation

共通ValidationにはZodなどを利用する。

username

1 <= length <= 20

group name

1 <= length <= 30

post

1 <= length <= 30

⸻

31. MVP

最初のリリースでは機能を以下に限定する。

Authentication

* ユーザー登録
* ログイン
* ログアウト

Profile

* ユーザー名
* 猫アイコン

Friends

* Friend Code
* 友達申請
* 承認
* 友達一覧

Groups

* グループ作成
* 友達招待
* グループ一覧
* グループ退出

Posts

* 短文投稿
* 猫表情選択
* 最新投稿表示
* 投稿履歴
* 投稿削除

Realtime

* 新規投稿リアルタイム反映

PWA

* ホーム画面追加
* standalone起動

⸻

32. MVPでは実装しないもの

以下は初期実装から除外する。

* DM
* 画像投稿
* 動画投稿
* 音声投稿
* スタンプ
* 既読
* 投稿への返信
* Like
* Reaction
* 投稿編集
* 検索
* 公開アカウント
* 公開投稿
* Recommendation
* Algorithmic Timeline

猫チャットの中心はあくまで、

Friend
→ Group
→ Short Post
→ Cat Expression

とする。

⸻

33. 将来機能

MVP後に以下を検討する。

QR友達追加

Friend CodeからQRコードを生成する。

Push Notification

新規投稿通知。

Group Theme

グループごとに背景を変更。

公園
部屋
海
学校
宇宙

Cat Customization

猫について、

* 色
* 模様
* アクセサリー
* 表情
* ポーズ

を設定可能にする。

Reaction

投稿された猫をタップして、

❤️
👏
😂

など簡単なReactionを送れるようにする。

⸻

34. アプリの基本思想

猫チャットはLINEやDiscordの代替を目指さない。

通常のチャットでは、

誰かが話す
↓
誰かが返す
↓
会話が続く

ことが前提となる。

猫チャットでは、

いまの自分を投稿する
↓
友達の猫がそこにいる
↓
なんとなく近況が分かる

という体験を中心とする。

そのためUIでも単純なメッセージ一覧ではなく、グループを1つの「猫たちがいる空間」として表現する。

参考デザインのように、

背景
+
ユーザーの猫
+
最新の一言

をグループ画面の中心UIとする。

これが猫チャットにおける最も重要なプロダクト上の特徴である。

⸻

35. フロントエンド実装境界

35.1 デザイン

完成像の正は `figma-img/` の393×852書き出し。

画面は393pxを基準幅とし、狭い端末では親幅へ縮む。高さは`100dvh`、safe areaを含める。デスクトップではモバイル面を中央に置く。

色、角丸、影はCSS変数で共有する。猫、TopBar、BottomTabBar、MemberAvatars、SpeechBubbleは画面から分離する。書き出し画像そのものを画面背景にしない。

35.2 状態

API境界は`API_TYPES.md`。画面はDB行やSupabase生レスポンスを扱わない。Vercel Route HandlerがDB行をアプリ型へ変換する。

現在グループIDだけをlocalStorageへ保存する。プロフィール、グループ、投稿の正はSupabase。グループ切り替え時は対象投稿の取得成功後に現在グループを更新する。

猫選択、プロフィール更新、投稿は保存成功後だけ遷移する。失敗時は入力を保持して画面内に理由を表示する。

35.3 主要画面

`/onboarding/cat`は5種類から猫を選び、プロフィールを保存する。`/onboarding/invite`は発行済みコードを表示しClipboard APIでコピーする。

`/home`は現在グループ、メンバー、最大4件の近況を空間UIへ配置する。0件、読み込み中、取得失敗を区別する。

`/compose`は本文1〜30文字と4種の感情を受け取り、保存後に投稿一覧を再取得してホームへ戻る。

`/groups`は所属グループと人数を表示し、選択したグループへ切り替える。`/settings`は名前更新、猫再選択、ログアウトを提供する。

35.4 接続失敗

`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_SECRET_KEY`が必要。未設定、認証切れ、権限不足、入力不正、グループ満員、招待コード不正を画面内エラーとして顕在化する。Secret Keyはブラウザへ配布しない。

35.5 Vercel API

ブラウザはSupabase Authのaccess tokenをBearer tokenとして`/api`へ送る。Route Handlerは毎回Supabase Authでユーザーを検証する。

プロフィール、所属グループ、投稿の読み書きはVercelからSecret Key付きでSupabase Data APIを呼ぶ。Supabase RPC、DBトリガー、公開RLSポリシーは使わない。RLSは有効化し、ブラウザからの直接DB操作を拒否する。

グループメンバーはgroup内で1〜5のslotを持ち、`group_id, slot`を一意にする。招待参加の同時実行時もslot競合を再試行し、6人目をDB制約で拒否する。複数行を作るグループ作成に失敗した場合は作成済みgroupを削除し、cascadeで中間データを回収する。

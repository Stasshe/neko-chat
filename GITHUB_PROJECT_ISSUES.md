# GitHub Project 用 Issue 一覧

Project のカラム例:

- `Backlog`
- `Ready`
- `In Progress`
- `Review`
- `Done`

## バックエンド Issue

### A担当

1. `BE-A: Supabase の Googleログイン設定を確認する`
2. `BE-A: profiles テーブルを作成する`
3. `BE-A: profiles の RLS を設定する`
4. `BE-A: create_profile_if_needed を実装する`
5. `BE-A: get_my_profile を実装する`
6. `BE-A: update_my_profile を実装する`
7. `BE-A: username と cat_type の更新バリデーションを入れる`
8. `BE-A: Profile の返り値をフロント向けの形に揃える`
9. `BE-A: プロフィール系のエラー形を揃える`

### B担当

1. `BE-B: groups テーブルを作成する`
2. `BE-B: group_members テーブルを作成する`
3. `BE-B: invite_codes テーブルを作成する`
4. `BE-B: posts テーブルを作成する`
5. `BE-B: groups 系テーブルの制約を入れる`
6. `BE-B: start_solo_mode を実装する`
7. `BE-B: create_group_with_invite を実装する`
8. `BE-B: join_group_by_invite_code を実装する`
9. `BE-B: get_my_groups を実装する`
10. `BE-B: create_post を実装する`
11. `BE-B: get_group_posts を実装する`
12. `BE-B: groups と posts の RLS を設定する`
13. `BE-B: グループ人数上限5人のチェックを入れる`
14. `BE-B: GroupSummary と InviteCode の返り値をフロント向けの形に揃える`
15. `BE-B: Post と Post.user の返り値をフロント向けの形に揃える`
16. `BE-B: グループ系と投稿系のエラー形を揃える`

### バックエンド優先 Issue

1. `BE: Googleログイン設定を先に通す`
2. `BE: profiles を先に固める`
3. `BE: groups group_members invite_codes を作る`
4. `BE: start_solo_mode を実装する`
5. `BE: create_group_with_invite を実装する`
6. `BE: join_group_by_invite_code を実装する`
7. `BE: posts を実装する`
8. `BE: フロントへ返す型を API_TYPES.md に合わせる`

## フロントエンド Issue

### FE-A

1. `FE-A: テンプレのトップ画面をアプリ導線に置き換える`
2. `FE-A: フロント用 Supabase client を設定する`
3. `FE-A: 起動時の認証状態復元を実装する`
4. `FE-A: 保護ルートを実装する`
5. `FE-A: ログアウト処理を実装する`
6. `FE-A: 最低限の共通レイアウト土台を作る`
7. `FE-A: API呼び出し用 client 関数を整備する`
8. `FE-A: APIエラーの共通処理を整備する`
9. `FE-A: Googleログイン画面を作る`
10. `FE-A: 共通 Button と TextField を作る`
11. `FE-A: ユーザー名入力画面を作る`
12. `FE-A: モード選択画面を作る`
13. `FE-A: グループ名入力画面を作る`
14. `FE-A: 招待コード作成完了画面を作る`
15. `FE-A: グループ参加画面を作る`
16. `FE-A: グループ参加完了画面を作る`
17. `FE-A: 一人モードの導線を繋ぐ`
18. `FE-A: グループ作成処理を繋ぐ`
19. `FE-A: グループ参加処理を繋ぐ`

### FE-A 優先 Issue

1. `FE-A: フロント用 Supabase client を最初に通す`
2. `FE-A: 起動時の認証状態復元を実装する`
3. `FE-A: 保護ルートを実装する`
4. `FE-A: API呼び出し用 client 関数を整備する`
5. `FE-A: APIエラーの共通処理を整備する`
6. `FE-A: Googleログイン画面を作る`
7. `FE-A: オンボーディング前半の導線を通す`

### FE-B

1. `FE-B: デザイントークンとモバイル画面ラッパーを作る`
2. `FE-B: Figma 素材を整理する`
3. `FE-B: 共通 TopBar と BottomTabBar を作る`
4. `FE-B: 共通 CatDisplay と MemberAvatars と SpeechBubble を作る`
5. `FE-B: 猫選択画面を作る`
6. `FE-B: ホーム画面を作る`
7. `FE-B: 投稿画面を作る`
8. `FE-B: グループ一覧画面を作る`
9. `FE-B: 設定画面を作る`
10. `FE-B: オンボーディング保存処理を繋ぐ`
11. `FE-B: 招待コードコピー機能を付ける`
12. `FE-B: 投稿作成処理を繋ぐ`
13. `FE-B: プロフィール更新処理を繋ぐ`
14. `FE-B: グループ切り替え動作を繋ぐ`
15. `FE-B: 一人モード後半の導線確認をする`
16. `FE-B: ホーム画面の見た目をFigmaに寄せる`
17. `FE-B: 主要画面のローディングとエラー表示を整える`
18. `FE-B: モバイル表示崩れを調整する`

### FE-B 優先 Issue

1. `FE-B: デザイントークンとモバイル画面ラッパーを作る`
2. `FE-B: Figma 素材を整理する`
3. `FE-B: 共通 TopBar と BottomTabBar を作る`
4. `FE-B: 共通 CatDisplay と MemberAvatars と SpeechBubble を作る`
5. `FE-B: 猫選択画面の見た目を作る`
6. `FE-B: ホーム画面を作る`
7. `FE-B: 投稿画面を作る`
8. `FE-B: グループ一覧画面を作る`
9. `FE-B: 設定画面を作る`

## 責務メモ

### バックエンドに返してもらう前提

1. `Profile`
2. `GroupSummary`
3. `InviteCode`
4. `Post`
5. `Post.user`
6. APIごとの input / output
7. 共通エラー型

### フロントで吸収してよいもの

1. `AuthState`
2. `CurrentGroupState`
3. `OnboardingDraft`
4. `GroupMemberPreview`

### 確認

1. `確認: 一人モードを通し確認する`
2. `確認: グループ作成フローを通し確認する`
3. `確認: グループ参加フローを通し確認する`
4. `確認: 投稿作成フローを通し確認する`
5. `確認: ログアウトと session 復元を確認する`

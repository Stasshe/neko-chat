指示されていない問題を勝手に直すな
問題を見つければ最後に報告しろ。場合によってはissueを起票する。

react,hooksの使い方には注意しろ。usememoをむやみに使うな

supabaseDB,supabase authを使っている

mainブランチのプロテクションはある。

pnpm lint, pnpm format, pnpm exec react-doctorを最後に実行しろ
react-doctorはたまに誤検知するから、すべてを信じるな。

可用性・拡張性の高いコード


完成イメージmockは figma-img/にあるからUI作るときは必ずそれを参照しろ
キャラクター素材はあとから追加するため、入れ替えやすいようにしておけ

ユーザーフローはfigma-img/flow/
assetsはpublic/images/にある。

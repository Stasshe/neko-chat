## アセット構成

`public/images/` には、アプリで実際に使用する画像を配置します。

### ディレクトリ

- `cats/<cat-type>/<emotion>.png`
  - 猫タイプ: `white`, `black`, `mike`, `sham`, `chatora`
  - 表情: `positive`, `neutral`, `negative`
- `ui/backgrounds/`
  - 全画面背景やシーン背景
- `ui/decorations/`
  - 雲、木、ソファ、毛糸玉などの装飾用パーツ
- `ui/icons/`
  - 猫アイコン、肉球、時計などの再利用するアイコン
- `ui/navigation/`
  - ナビゲーション関連のボタンアセット

### 命名ルール

- UI 用アセットは小文字の kebab-case で統一する。
- `cats/` のディレクトリ名はアプリ内の `CatType` の値と一致させる。
- 猫の表情ファイル名は、可能な限りアプリ内の `Emotion` の値と一致させる。
- `favicon.png` はアプリアイコンの入口として使う可能性があるため、`public/` 直下に置く。

### 現在の制約

- `random` 専用の猫表情画像はまだ存在しない。
  - 追加されるまでは、実装側で `neutral` などのフォールバックを使う。

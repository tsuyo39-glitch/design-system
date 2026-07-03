# ds-builder

DTCG 形式のデザイントークンを **読み込み → 編集 → ライブプレビュー → エクスポート** するデスクトップ寄りの Web アプリ。デザインシステムを組み立てて、AI エージェントや各プラットフォームに渡すための道具です。

**公開デモ: https://tsuyo39-glitch.github.io/design-system/**

> `ds-builder` は仮称です。正式名称が決まったら repo 名・package name・UI のワードマークをまとめて置換します。

---

## できること

- **読み込み** … 同梱サンプル / DTCG JSON の import / 空から新規作成
- **一覧** … トークンをグループ階層のツリーで表示。色スウォッチ・型バッジ・値を等幅で表示し、解決できない参照には ⚠ を出す
- **編集** … 型ごとの専用 UI で直感的に編集
  - color: 色相環（hue リング + 彩度/明度スクエア）＋ HEX 入力
  - dimension / duration: 数値 + 単位、fontWeight: 400/500/600、number / cubicBezier: 数値入力
  - typography / shadow: composite をサブキーごとのフィールドで編集
  - 参照（`{group.token}`）とリテラルの切り替え、トークン/グループの追加・改名（参照追従）・削除
- **ライブプレビュー** … 参照・light/dark を解決したサンプル UI をリアルタイム描画。モード切替に追従
- **Undo/Redo** … `Cmd/Ctrl+Z` / `Shift+Z`。色相環ドラッグ等の連続編集は 1 ステップにまとめる
- **自動保存** … 編集中のドキュメントを localStorage に保存し、次回起動時に復元
- **エクスポート** … 下記 5 形式

### エクスポート形式

| 形式 | 内容 |
| --- | --- |
| DTCG JSON | 参照を残した編集用フォーマット |
| CSS 変数 | 解決済みカスタムプロパティ（`:root` と `[data-mode="dark"]`） |
| 解決済み JSON | 参照と light/dark を解決した `{ light, dark }` のネスト木 |
| Swift | color トークンの SwiftUI `Color` 拡張（light） |
| Kotlin | color トークンの Jetpack Compose `Color` 定数（light） |

---

## 技術スタック

- React 19 + TypeScript（strict）+ Vite 8
- Tailwind CSS 4（生成した CSS 変数を theme に流し込む）
- 状態管理: Zustand 5（トークンツリーを 1 ストアで保持、履歴・永続化込み）
- テスト: Vitest + Testing Library
- デプロイ: GitHub Pages（GitHub Actions）

---

## 開発

```bash
npm install
npm run dev          # 開発サーバ
npm run build        # 本番ビルド（tsc --noEmit && vite build）
npm run preview      # ビルド結果の確認
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest
npm run tokens:build # design-system/tokens.json -> src/styles/tokens.css を再生成
```

**完了の定義:** `npm run typecheck` と `npm run build` が両方通ること。トークンを触ったら `npm run tokens:build` も走らせる。

---

## アーキテクチャの要点

このアプリは **2 種類のトークンを厳密に分離** します。ここを交差させないことが設計の核です。

1. **アプリ自身のテーマ（chrome の見た目）** … `design-system/tokens.json` を build して得た `src/styles/tokens.css` の CSS 変数。アプリの外見はこれだけで着色する。
2. **ユーザーが編集中のドキュメント** … アプリの state（Zustand）上のデータ。プレビュー枠に描画し、エクスポートで書き出す対象。**アプリの CSS ではない。**

```
        design-system/tokens.json
                 │  (build time: scripts/build-tokens.ts)
                 ▼
          src/styles/tokens.css  ──►  アプリ chrome の見た目
                                       (:root = light, [data-mode="dark"] = dark)

        ┌──────────────── アプリ実行時 ────────────────┐
   import / new ─► Zustand store（TokenDocument）
                       │        ▲
        token-list ────┤        ├──── token-editor
                       ▼        │
                    preview     └──► export（JSON / CSS / Swift / Kotlin …）
        （preview だけがユーザードキュメントを解決して描画する）
        └───────────────────────────────────────────────┘
```

DTCG のパース・`{ref}` 参照解決・mode(light/dark) 解決・入出力は `src/model/`（React 非依存の純粋 TS）に閉じ込め、UI からはストア越しに触ります。アプリの見た目も同じ DTCG フォーマットから作る（ドッグフーディング）ので、「アプリの見た目が自分のデザインシステムからズレる」事故が原理的に起きません。

---

## ディレクトリ構成

```
/
├─ design-system/
│  ├─ tokens.json            # アプリ自身のテーマの種（DTCG）
│  └─ design-principles.md   # 判断基準（UI 生成時はこれに従う）
├─ scripts/
│  └─ build-tokens.ts        # tokens.json -> src/styles/tokens.css（light + dark）
├─ src/
│  ├─ styles/tokens.css      # 生成物（手編集しない）
│  ├─ model/                 # DTCG 型・参照/mode 解決・入出力・各エクスポータ（UI 非依存）
│  ├─ store/                 # Zustand ストア（履歴・永続化込み）
│  ├─ features/              # token-list / token-editor / preview / export
│  └─ App.tsx
├─ SPECIFICATION.md          # 何を作るか・スコープ・データモデル
└─ CLAUDE.md                 # 開発規約
```

---

## デプロイ

`main` への push で GitHub Actions（`.github/workflows/deploy.yml`）が build → GitHub Pages へ公開します。プロジェクトサイト配下（`/design-system/`）に出るため、本番ビルドのみ Vite の `base` を付けています。

---

## 関連ドキュメント

- 何を作るか・スコープ・データモデル → [`SPECIFICATION.md`](SPECIFICATION.md)
- どう見せるか・判断基準 → [`design-system/design-principles.md`](design-system/design-principles.md)
- 開発規約 → [`CLAUDE.md`](CLAUDE.md)

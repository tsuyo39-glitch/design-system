# CLAUDE.md

このファイルは Claude Code 用のプロジェクト規約です。作業を始める前に必ず読み、`SPECIFICATION.md` と `design-system/design-principles.md` にも目を通してください。

---

## プロジェクト概要

DTCG 形式のデザイントークン（`tokens.json`）を **読み込み → 編集 → ライブプレビュー → エクスポート** するデスクトップ寄りの Web アプリ。デザインシステムを構築して AI エージェントに渡すための道具です。

**作業名（仮）: `ds-builder`。** 正式名称が決まったら repo 名・package name・UI のワードマークをまとめて置換してください。

---

## 中核原則（これを外すと設計が崩れます）

1. **DTCG JSON が single source of truth。** データモデルはトークンツリーを中心に置き、UI はその周りに生やす。プレビューもエクスポートもエディタも、すべて「同じ 1 本のツリー」を見る。
2. **2 種類のトークンを混同しない。**
   - **アプリ自身のテーマ**（chrome の見た目）… `design-system/tokens.json` を build して `src/styles/tokens.css` にした CSS 変数。アプリの外見はこれだけで着色する。
   - **ユーザーが編集中のドキュメント**… アプリの state 上のデータ。プレビュー枠に描画し、エクスポートで書き出す対象。**アプリの CSS ではない。**
   この 2 つは絶対に配線を交差させない。
3. **ドッグフーディング。** アプリ自身の見た目も、アプリが扱うのと同じ DTCG フォーマットから作る。だから「アプリの見た目が自分のデザインシステムとズレる」事故は起きない。

---

## 技術スタック

- React 18 + TypeScript（strict）+ Vite
- Tailwind CSS（トークンは生成 CSS 変数を Tailwind theme に流し込む）
- 状態管理: Zustand（トークンツリーを 1 ストアで保持）
- トークン変換: Style Dictionary もしくは `scripts/build-tokens.ts` の自作スクリプト（下記参照）
- テスト: Vitest
- 対象: デスクトップブラウザ優先（モバイル対応は非目標）

---

## コマンド

```bash
npm run dev          # 開発サーバ
npm run build        # 本番ビルド
npm run preview      # ビルド結果の確認
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # vitest
npm run tokens:build # design-system/tokens.json -> src/styles/tokens.css を再生成
```

**完了の定義:** `npm run typecheck` と `npm run build` が両方通ること。トークンを触ったら `npm run tokens:build` も走らせる。

---

## ディレクトリ構成

```
/
├─ CLAUDE.md
├─ SPECIFICATION.md
├─ design-system/
│  ├─ tokens.json            # アプリ自身のテーマの種（DTCG）
│  └─ design-principles.md   # 判断基準。UI 生成時はこれに従う
├─ scripts/
│  └─ build-tokens.ts        # tokens.json -> src/styles/tokens.css（light + dark）
├─ src/
│  ├─ styles/
│  │  └─ tokens.css          # 生成物。手で編集しない
│  ├─ model/                 # DTCG の型・参照解決・入出力（UI 非依存）
│  │  ├─ dtcg.ts             #   型定義
│  │  ├─ resolve.ts          #   {ref} 解決 + mode 解決
│  │  └─ io.ts               #   import / export
│  ├─ store/                 # Zustand ストア（トークンツリー）
│  ├─ features/
│  │  ├─ token-list/         # 一覧
│  │  ├─ token-editor/       # 単体編集
│  │  ├─ preview/            # ライブプレビュー
│  │  └─ export/             # 書き出し
│  ├─ components/            # 共有 UI（Button, Input …）トークンで実装
│  ├─ App.tsx
│  └─ main.tsx
```

---

## コーディング規約

- **生の HEX・px を UI に直接書かない。** 色・寸法は生成された CSS 変数（Tailwind 経由）を使う。`design-principles.md` の「literal より semantic」をコードでも守る。
- `src/model/` は React に依存させない（純粋な TS）。DTCG のパース・参照解決・mode 解決はここに閉じ込め、UI からはストア越しに触る。
- `src/styles/tokens.css` は生成物。手編集せず、変更は `tokens.json` → `tokens:build` 経由で行う。
- コンポーネントは feature ディレクトリに凝集させ、共有部品だけ `src/components/` に置く。
- TypeScript は strict。`any` を新設しない。DTCG の型は `src/model/dtcg.ts` に集約。
- UI 文言は sentence case、数値・HEX・トークン名は等幅表示（`design-principles.md` §2）。

---

## ワークフロー規約

- **1 セッション = 1 機能 = 1 ブランチ。** スライス順は `SPECIFICATION.md` §feature-slices に従う。
- 各機能が緑（typecheck / lint / build 通過）になったらコミット。まとめて大コミットにしない。
- 無関係な作業に移るときは `/clear`。長い 1 機能の途中でコンテキストが膨らんだら `/compact`。
- 自分で動作確認していないコードを「完了」にしない。差分は要約して提示し、丸呑みを促さない。

---

## ガードレール（やらないこと）

- 最初から全トークン種別・全エクスポート先を実装しない（MVP スコープは `SPECIFICATION.md` を厳守）。
- プレビューとエディタを密結合にしない。両者は必ずストア（= トークンツリー）越しに繋ぐ。
- `tokens.css` を手で編集しない。
- アプリ chrome のテーマと、ユーザー編集ドキュメントの配線を交差させない。
- 破壊的操作（全消去・ファイル削除等）を確認なしに実装・実行しない。

---

## 参照

- 何を作るか・スコープ・データモデル → `SPECIFICATION.md`
- どう見せるか・判断基準 → `design-system/design-principles.md`
- 値の定義 → `design-system/tokens.json`

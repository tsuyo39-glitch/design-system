# Design Principles — Technical Minimalism

このドキュメントは `tokens.json` と対になる「判断基準」の層です。
`tokens.json` が **値（何を使うか）** を、この `.md` が **意図とルール（なぜ・どう使うか）** を定義します。
UI を生成する AI エージェントは、両方を読んでから実装してください。

---

## 0. このシステムの性格

**Technical Minimalism。** これはデザインシステムを作るための「道具」のデザインです。
道具自身が主張しすぎると、ユーザーが作ろうとしている別のデザインの邪魔になる。
かといって無個性でも使っていて楽しくない。その中間、すなわち

- **静けさ** … 低彩度のクールグレー基調、広い余白、装飾ゼロ
- **精度** … 数値・HEX・トークン名はすべて等幅（mono）で表示、境界は 1px で精緻に
- **中立** … アクセントは indigo 1 色のみ。色で語らず、構造で語る

を狙います。迷ったら「静かで、正確な方」を選んでください。

---

## 1. トークンの読み方

3 層構造です。**UI は必ず semantic 層以降を参照し、primitive を直接使わないでください。**

1. **Primitive**（`color.*`, `spacing.*`, `fontSize.*` …）— 意味を持たない生の値
2. **Semantic**（`semantic.color.*`）— 役割。UI が実際に消費する層
3. **Component**（`component.*`）— 特定部品専用

参照は `{group.token}` 記法です。例: `component.button.primary.background` → `{semantic.color.action.default}` → `{color.indigo.500}`。

### モード（light / dark）の扱い

semantic トークンは 1 つの役割名が 2 テーマに解決されます。

- `$value` … **light モードの値**
- `$extensions["com.tokens.mode"].dark` … **dark モードの値**

同じ `semantic.color.action.default` が light では `indigo.500`、dark では `indigo.400` になる——
「値ではなく意図を渡す」という設計の核がここにあります。実装時は現在のモードに応じてどちらかを解決してください。

---

## 2. デザイン原則

数値では表せないルールです。以下は上から順に優先度が高いものです。

1. **1 画面にアクセントは 1 つ。** primary ボタンや選択状態など、`action.default` で塗る要素は原則 1 つだけ。増やすほど安っぽく、指示が弱くなります。
2. **数値はすべて mono。** HEX・サイズ・トークン名・座標・コードは `fontFamily.mono`。これがこの道具の一番の個性であり、精度の演出です。
3. **余白を恐れない。** 詰めるより空ける。密度は `spacing` スケールに従い、独自の中間値を発明しない。
4. **literal より semantic。** `#6366F1` を直接書かない。必ず役割名（`action.default` 等）を経由する。
5. **状態は必須。** インタラクティブ要素は default / hover / focus / disabled を必ず定義する。省略して勝手に補完させない。
6. **装飾より階層。** 影・グラデーション・枠線の多用で目立たせない。サイズ・ウェイト・余白のコントラストで階層を作る。

---

## 3. カラー

- **Neutral** はわずかに青みを含んだクールグレー。無彩色すぎず、冷たすぎず、「精密機器」の質感を出す温度感です。
- **Accent は indigo のみ。** 差し替え前提の設計なので、ブランドを変えるときは `color.indigo.*` ランプ 1 本だけを入れ替えれば全体が追従します。
- **Status 色（success / warning / error / info）はアクセントとは別枠。** 意味があるときだけ使い、装飾目的で使わない。success=緑, warning=琥珀, error=赤, info=青の UI 慣習を守る。
- **コントラスト:** 本文テキストと背景は WCAG AA（4.5:1）以上を満たすこと。`text.muted` は補助情報限定で、本文には使わない。
- **透明度で色を薄めない。** 薄い色が必要なら `action.subtle` のような専用トークンを使う。opacity は背景により発色がずれるため禁止。

---

## 4. タイポグラフィ

- UI テキストは `fontFamily.sans`（Inter）、数値・コードは `fontFamily.mono`（JetBrains Mono）。
- スケールは `fontSize.base = 14px` を基準にした 12 / 13 / 14 / 16 / 18 / 20 / 24 / 30。中間値を作らない。
- ウェイトは 400 / 500 / 600 の 3 段階のみ。**700 以上は使わない**（静かな道具の中で音が大きすぎる）。
- 見出し・本文などは個別指定せず、`typography.*` の複合トークン（title / heading / body / label / code …）を束ねて使う。

---

## 5. スペーシング・レイアウト

- 余白・padding・gap はすべて `spacing`（4px スケール）から取る。
- 角丸のデフォルトはコントロールが `radius.md`（6px）、カード・パネルが `radius.xl`（12px）。片側だけの境界線に角丸を付けない。
- 境界線は `borderWidth.thin`（1px）が基本。`thick`（2px）は focus リングのみ。
- 影は最小限。dark モードでは影に頼らず、`bg.raised` の明度差で浮きを表現する。

---

## 6. モーション

- duration は `fast`(120ms) / `base`(180ms) / `slow`(240ms)。
- イージングは `easing.standard`（expo-out）。速く始まり、静かに着地する。
- 情報量のない装飾アニメーションは付けない。状態変化のフィードバックにだけ使う。

---

## 7. コンポーネント指針

- **Button** … variant は primary / secondary（必要なら ghost を追加）。すべてに default / hover / focus / disabled を定義。primary は 1 画面 1 つ。
- **Input** … `input.borderFocus` を focus リングに使い、focus 状態を必ず可視化する。placeholder は `text.muted`。
- **アナトミー** … 部品の内部余白も `spacing` から取り、目分量で決めない。

---

## 8. 実装エージェントへの指示

このシステムから UI を生成するとき、次を厳守してください。

- 色・寸法・フォントは **必ず semantic / component トークン経由**で参照し、primitive や生の HEX を UI に直接書かない。
- **現在のモード**を判定し、semantic トークンは `$value`（light）または `$extensions["com.tokens.mode"].dark`（dark）のいずれかに解決する。
- インタラクティブ要素には **default / hover / focus / disabled の 4 状態**を必ず用意する。
- **アクセント（`action.default`）で塗る要素は 1 画面につき 1 つ**に抑える。
- 数値・HEX・トークン名・コードは **mono** で表示する。
- スケールに無い中間値（余白・サイズ・角丸）を勝手に作らない。
- 迷ったら、より静かで、より余白の多い方を選ぶ。

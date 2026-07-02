# SPECIFICATION.md

`ds-builder`（仮）の仕様書。`CLAUDE.md` と `design-system/design-principles.md` と対で読む。

---

## 1. 目的と MVP スコープ

DTCG 形式のデザイントークンを編集し、AI エージェントに渡せる形で書き出す道具。
**MVP は一本道に絞る:** JSON 読込 → 一覧 → 単体編集 → ライブプレビュー → エクスポート。

### スコープ内（MVP）

- `tokens.json`（DTCG）の import と、空ドキュメントからの新規作成
- トークン一覧の表示（グループ階層 / 型 / 値のプレビュー）
- 単体トークンの編集（color / dimension / fontFamily / fontWeight など主要型）
- `{ref}` 参照と mode（light / dark）の解決を反映したライブプレビュー
- DTCG JSON としてのエクスポート（ダウンロード）
- light / dark プレビュー切替

### スコープ外（後回し）

- CSS / Swift / Kotlin など複数出力先への変換 UI（MVP は JSON 出力のみ）
- 複数ドキュメントの管理・履歴・差分
- 複数人・クラウド同期
- モバイル対応
- composite 型（typography / shadow）の GUI 編集（MVP は表示のみ、編集は raw JSON で可）

---

## 2. ユーザーフロー

1. 起動 → サンプル（`tokens.json`）読込 or 新規作成 or ファイル import
2. 左に一覧、中央/右にプレビュー
3. 一覧からトークンを選ぶ → エディタで値を編集
4. 変更が即プレビューに反映（参照・mode 解決込み）
5. light / dark を切替えて確認
6. エクスポート → DTCG JSON をダウンロード

---

## 3. データモデル

DTCG ツリーをそのままメモリに持ち、UI はストア越しに触る。

### 3.1 型（`src/model/dtcg.ts` の骨子）

```ts
type TokenType =
  | 'color' | 'dimension' | 'fontFamily' | 'fontWeight'
  | 'number' | 'duration' | 'cubicBezier' | 'shadow' | 'typography';

interface Token {
  $value: unknown;              // ref文字列 "{group.token}" もしくは実値
  $type?: TokenType;            // 省略時は親グループから継承
  $description?: string;
  $extensions?: {
    'com.tokens.mode'?: { dark?: unknown };   // dark モード上書き
    [key: string]: unknown;
  };
}

interface Group {
  $type?: TokenType;            // 子に継承
  $description?: string;
  [key: string]: Group | Token | TokenType | string | undefined;
}

type TokenDocument = Group;     // ルートも Group
```

判定: `$value` を持てば Token、持たなければ Group（`$` 始まりのメタキーは除く）。

### 3.2 参照・mode 解決（`src/model/resolve.ts`）

- `resolveRef(doc, "{color.indigo.500}")` … `{…}` を辿って実値へ。循環参照は検出してエラー。
- `resolveToken(doc, path, mode)` … mode='dark' のとき `$extensions['com.tokens.mode'].dark` があればそれを優先、無ければ `$value`。その後 `{ref}` を再帰解決。
- 継承: `$type` 未指定のトークンは最も近い親グループの `$type` を採用。

### 3.3 型ごとの実値の形

- color: `"#RRGGBB"` / `"#RRGGBBAA"`（MVP は HEX 文字列）
- dimension: `"16px"`（文字列。将来 `{value, unit}` 対応を検討）
- fontFamily: `string[]`
- fontWeight: `number`（400/500/600）
- number: `number`
- duration: `"120ms"` / cubicBezier: `[n,n,n,n]`
- typography / shadow: object（MVP は表示のみ）

---

## 4. アーキテクチャ

```
        design-system/tokens.json
                 │  (build time)
                 ▼
      scripts/build-tokens.ts  ──►  src/styles/tokens.css   ──► アプリ chrome の見た目
                                        (:root = light, [data-mode=dark] = dark)

        ┌──────────────── アプリ実行時 ────────────────┐
        │                                               │
   import/new ──► Zustand store（TokenDocument）        │
                     │        ▲                          │
        ┌────────────┼────────┴───────────┐             │
        ▼            ▼                     ▼             │
   token-list   token-editor          preview           │
        │            │                     ▲             │
        └── 全て store 越しに接続。直接繋がない ──┘        │
                     │                                    │
                     ▼                                    │
                  export（TokenDocument → JSON）           │
        └───────────────────────────────────────────────┘
```

**要点:** アプリ chrome（左の流れ）と、ユーザー編集ドキュメント（右の store 側）は別系統。preview だけがユーザードキュメントを解決して描画する。

### 4.1 トークン → CSS 変換（`scripts/build-tokens.ts`）

mode が `$extensions` にあるため、素の Style Dictionary だけでは解決できない。前処理を入れる:

1. ツリーを走査し `{ref}` を解決
2. light 用ツリー（`$value`）と dark 用ツリー（dark 上書きを適用）の 2 つを生成
3. それぞれを CSS カスタムプロパティに変換し、`:root { … }` と `[data-mode="dark"] { … }` として出力

Style Dictionary を使う場合はこの前処理の出力を 2 config で流す。MVP では同等処理を自作スクリプトで書いても良い（依存を減らせる）。どちらでも出力先は `src/styles/tokens.css`。

---

## 5. 画面・コンポーネント

- **AppShell**: 上部バー（ワードマーク / import / export / light-dark 切替）＋ 3 ペイン
- **TokenList**（`features/token-list`）: グループ階層のツリー。各行に型バッジ・値スウォッチ・mono の値表示
- **TokenEditor**（`features/token-editor`）: 選択トークンの型別入力（color picker + HEX、dimension 数値+単位、fontFamily 配列 …）＋ 参照/実値の切替
- **Preview**（`features/preview`）: 解決済みトークンでサンプル UI（ボタン各状態・入力・カード・テキストスケール・スウォッチ）を描画。mode 切替に追従
- **共有部品**（`src/components`）: Button / Input など。**生成トークンで実装**しドッグフーディングの実例にする

---

## 6. フィーチャースライス（実装順）

各スライスは 1 ブランチ。緑になったらコミット。

1. **scaffold** — Vite+React+TS+Tailwind、起動する空箱。`npm run build` 通過。
2. **tokens-pipeline** — `build-tokens.ts` と `tokens.css`。アプリ chrome が自分のトークンで着色される。light/dark 切替が chrome に効く。
3. **model** — `dtcg.ts` / `resolve.ts` / `io.ts`。参照・mode 解決に単体テスト（循環参照検出含む）。
4. **store + import** — Zustand ストア、JSON import、サンプル読込。
5. **token-list** — ツリー表示。選択状態をストアに保持。
6. **token-editor** — color / dimension / fontFamily / fontWeight の編集。編集がストアに反映。
7. **preview** — 解決済みサンプル UI。mode 切替追従。
8. **export** — TokenDocument → JSON ダウンロード。round-trip（import→export で同値）を確認。

---

## 7. 受け入れ基準（抜粋）

- model: `resolveToken(doc, 'semantic.color.action.default', 'dark')` が `#818CF8` を返す。循環参照はスローする。
- pipeline: `tokens.css` に `:root` と `[data-mode="dark"]` 両方が出力され、chrome の accent が mode で切り替わる。
- editor→preview: エディタで `color.indigo.500` を変更すると、それを参照する preview の accent が即追従する。
- export: import した JSON を無編集で export すると、意味的に同一の DTCG が得られる。

---

## 8. 非目標・将来

- 複数出力先（Style Dictionary の他 platform）、テーマの複数系統、バージョン管理、共有・コメントは MVP 後。
- `$extensions` の名前空間キーは正式アプリ名に合わせて置換する。
- dimension のオブジェクト形式（`{value, unit}`）対応は変換ツール要件が固まってから。

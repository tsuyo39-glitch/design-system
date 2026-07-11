import { deriveSystem } from '../../model/system'
import type { DesignSpec } from '../../model/templates'

/** デザイン（テンプレート＋微調整）を、意味づけされたトークン一式として書き出す。 */

/** CSS カスタムプロパティとして書き出す。 */
export function designToCss(spec: DesignSpec): string {
  const s = deriveSystem(spec)
  const { colors: c, type, fonts } = s
  return `:root {
  --color-background: ${c.background};
  --color-surface: ${c.surface};
  --color-text: ${c.text};
  --color-text-muted: ${c.textMuted};
  --color-border: ${c.border};
  --color-primary: ${c.primary};
  --color-primary-hover: ${c.primaryHover};
  --color-primary-subtle: ${c.primarySubtle};
  --color-on-primary: ${c.onPrimary};
  --color-accent: ${c.accent};
  --color-on-accent: ${c.onAccent};
  --font-heading: ${fonts.heading};
  --font-body: ${fonts.body};
  --text-display: ${type.display}px;
  --text-heading: ${type.heading}px;
  --text-subheading: ${type.subheading}px;
  --text-body: ${type.body}px;
  --text-caption: ${type.caption}px;
  --spacing: ${s.spacing}px;
  --radius: ${s.radius}px;
}
`
}

/** JSON として書き出す。 */
export function designToJson(spec: DesignSpec): string {
  const s = deriveSystem(spec)
  return JSON.stringify(
    {
      colors: s.colors,
      typography: {
        heading: s.fonts.heading,
        body: s.fonts.body,
        display: `${s.type.display}px`,
        heading_size: `${s.type.heading}px`,
        subheading: `${s.type.subheading}px`,
        body_size: `${s.type.body}px`,
        caption: `${s.type.caption}px`,
      },
      spacing: `${s.spacing}px`,
      radius: `${s.radius}px`,
    },
    null,
    2,
  )
}

/**
 * AI エージェント／実装者向けの仕様書（Markdown）として書き出す。
 * 値だけでなく「役割と使い方のルール」を持たせる。design.json / design.css と値は一致。
 */
export function designToMarkdown(spec: DesignSpec): string {
  const s = deriveSystem(spec)
  const { colors: c, type, fonts } = s

  const colorRows: Array<[string, string, string, string]> = [
    ['background', c.background, '--color-background', 'ページ全体の背景'],
    ['surface', c.surface, '--color-surface', 'カード・パネルなど一段上の面'],
    ['text', c.text, '--color-text', '本文の文字色'],
    ['text-muted', c.textMuted, '--color-text-muted', '補足・キャプションなど控えめな文字'],
    ['border', c.border, '--color-border', '区切り線・枠線'],
    ['primary', c.primary, '--color-primary', '主要ボタン・リンク・強調（少数に絞る）'],
    ['primary-hover', c.primaryHover, '--color-primary-hover', 'primary のホバー時'],
    ['primary-subtle', c.primarySubtle, '--color-primary-subtle', '選択中・通知などの淡い背景'],
    ['on-primary', c.onPrimary, '--color-on-primary', 'primary の上に乗せる文字色'],
    ['accent', c.accent, '--color-accent', '差し色。バッジ・ハイライト等に少量'],
    ['on-accent', c.onAccent, '--color-on-accent', 'accent の上に乗せる文字色'],
  ]

  const typeRows: Array<[string, number, string]> = [
    ['display', type.display, 'ヒーローなど特大見出し'],
    ['heading', type.heading, 'セクション見出し'],
    ['subheading', type.subheading, '小見出し'],
    ['body', type.body, '本文'],
    ['caption', type.caption, '補足・キャプション'],
  ]

  return `# デザイン仕様

このデザインシステムを UI 実装に使うためのガイドです。値は \`design.json\`（機械可読）および \`design.css\` と一致します。実装時はこのルールに従ってトークンを使ってください。

## カラー

| 役割 | 値 | CSS 変数 | 使いどころ |
| --- | --- | --- | --- |
${colorRows.map(([role, val, cssVar, use]) => `| ${role} | \`${val}\` | \`${cssVar}\` | ${use} |`).join('\n')}

## タイポグラフィ

- 見出しフォント: \`${fonts.heading}\`
- 本文フォント: \`${fonts.body}\`

| 役割 | サイズ | 用途 |
| --- | --- | --- |
${typeRows.map(([role, size, use]) => `| ${role} | ${size}px | ${use} |`).join('\n')}

## スペーシング・角丸

- 基準スペーシング: \`${s.spacing}px\`（padding・要素間の gap の基準。半分・倍で調整）
- 角丸: \`${s.radius}px\`（ボタン・カード・入力に共通で適用）

## 使い方の原則

- **primary は主役。** 主要ボタンやリンクなど強調したい要素に絞って使い、1画面で多用しない。
- **accent は少量の差し色。** バッジやハイライト程度にとどめる。
- **コントラストを確保。** 文字は背景/面に対して読みやすい色（text / on-primary / on-accent）を選ぶ。
- **面の階層は border と surface で表現。** 影に頼りすぎない。
- **余白・角丸・サイズはこの値に統一。** 独自の中間値を作らない。

## 参照

- 機械可読な値: \`design.json\`
- そのまま使える CSS: \`design.css\`
`
}

function downloadText(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadDesignCss(spec: DesignSpec, filename = 'design.css'): void {
  downloadText(designToCss(spec), filename, 'text/css')
}

export function downloadDesignJson(spec: DesignSpec, filename = 'design.json'): void {
  downloadText(designToJson(spec), filename, 'application/json')
}

export function downloadDesignMarkdown(spec: DesignSpec, filename = 'design.md'): void {
  downloadText(designToMarkdown(spec), filename, 'text/markdown')
}

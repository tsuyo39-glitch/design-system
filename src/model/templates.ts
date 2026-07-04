/** テンプレート起点デザインの中核データ（UI 非依存）。 */

export interface DesignSpec {
  colors: {
    /** ページ背景 */
    background: string
    /** カード等の面 */
    surface: string
    /** ブランド主役色（ボタン・見出し） */
    primary: string
    /** 差し色 */
    accent: string
    /** 本文の文字色 */
    text: string
  }
  fonts: { heading: string; body: string }
  /** 本文の基準サイズ(px) */
  sizeBase: number
  /** 余白の基準(px) */
  spacing: number
  /** 角丸(px) */
  radius: number
}

export interface Template {
  id: string
  name: string
  description: string
  spec: DesignSpec
}

const SANS = 'system-ui, -apple-system, "Segoe UI", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif'
const SERIF = 'Georgia, "Times New Roman", "Hiragino Mincho ProN", "Noto Serif JP", serif'
const ROUNDED = '"Hiragino Maru Gothic ProN", "Quicksand", system-ui, "Noto Sans JP", sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, "Noto Sans JP", monospace'

export const TEMPLATES: Template[] = [
  {
    id: 'claude',
    name: 'クロード',
    description: 'Claude 風。温かいアイボリーにクレイ色、明朝見出しの editorial な雰囲気。',
    spec: {
      colors: { background: '#F5F4EE', surface: '#FFFFFF', primary: '#D97757', accent: '#5C8A7B', text: '#2B2A27' },
      fonts: { heading: SERIF, body: SANS },
      sizeBase: 16,
      spacing: 24,
      radius: 8,
    },
  },
  {
    id: 'minimal',
    name: 'ミニマル',
    description: '余白広めの静かな白基調。迷ったらこれ。',
    spec: {
      colors: { background: '#FFFFFF', surface: '#F7F8FA', primary: '#111827', accent: '#6366F1', text: '#111827' },
      fonts: { heading: SANS, body: SANS },
      sizeBase: 16,
      spacing: 20,
      radius: 8,
    },
  },
  {
    id: 'pop',
    name: 'ポップ',
    description: '明るくまるい、親しみやすい印象。',
    spec: {
      colors: { background: '#FFF7ED', surface: '#FFFFFF', primary: '#F97316', accent: '#EC4899', text: '#431407' },
      fonts: { heading: ROUNDED, body: SANS },
      sizeBase: 16,
      spacing: 24,
      radius: 16,
    },
  },
  {
    id: 'elegant',
    name: 'エレガント',
    description: '明朝見出しの落ち着いた上品さ。',
    spec: {
      colors: { background: '#FBFAF7', surface: '#FFFFFF', primary: '#9F1239', accent: '#B45309', text: '#1C1917' },
      fonts: { heading: SERIF, body: SANS },
      sizeBase: 16,
      spacing: 20,
      radius: 4,
    },
  },
  {
    id: 'tech',
    name: 'テック',
    description: 'ダークで硬質。プロダクトやSaaS向け。',
    spec: {
      colors: { background: '#0B1120', surface: '#111827', primary: '#3B82F6', accent: '#22D3EE', text: '#E5E7EB' },
      fonts: { heading: SANS, body: MONO },
      sizeBase: 16,
      spacing: 16,
      radius: 8,
    },
  },
  {
    id: 'natural',
    name: 'ナチュラル',
    description: '温かみのある緑基調。やわらかい印象。',
    spec: {
      colors: { background: '#F5F7F0', surface: '#FFFFFF', primary: '#4D7C0F', accent: '#CA8A04', text: '#1A2E05' },
      fonts: { heading: SANS, body: SANS },
      sizeBase: 16,
      spacing: 20,
      radius: 16,
    },
  },
  {
    id: 'monochrome',
    name: 'モノクロ',
    description: '無彩色に赤の差し色。シャープで力強い。',
    spec: {
      colors: { background: '#FFFFFF', surface: '#F4F4F5', primary: '#18181B', accent: '#EF4444', text: '#18181B' },
      fonts: { heading: SANS, body: SANS },
      sizeBase: 16,
      spacing: 16,
      radius: 4,
    },
  },
]

export const DEFAULT_TEMPLATE = TEMPLATES[0]

/** 微調整で選べるフォント。 */
export const FONT_CHOICES: Array<{ label: string; value: string }> = [
  { label: 'ゴシック体', value: SANS },
  { label: '明朝体', value: SERIF },
  { label: 'まるゴシック', value: ROUNDED },
  { label: '等幅', value: MONO },
]

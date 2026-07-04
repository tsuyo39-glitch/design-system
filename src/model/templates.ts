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

// システムフォント（ダウンロード不要の安全な既定）
const SANS = 'system-ui, -apple-system, "Segoe UI", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif'
const SERIF = 'Georgia, "Times New Roman", "Hiragino Mincho ProN", "Noto Serif JP", serif'
const ROUNDED = '"Hiragino Maru Gothic ProN", "Quicksand", system-ui, "Noto Sans JP", sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, "Noto Sans JP", monospace'

// デザイナー定番の Web フォント（index.html で読み込み）。欧文フォントには日本語フォールバックを付ける。
const INTER = 'Inter, "Noto Sans JP", sans-serif'
const POPPINS = 'Poppins, "Noto Sans JP", sans-serif'
const MONTSERRAT = 'Montserrat, "Noto Sans JP", sans-serif'
const SPACE_GROTESK = '"Space Grotesk", "Noto Sans JP", sans-serif'
const NOTO_SANS_JP = '"Noto Sans JP", sans-serif'
const PLAYFAIR = '"Playfair Display", "Noto Serif JP", serif'
const LORA = 'Lora, "Noto Serif JP", serif'
const ROBOTO_SLAB = '"Roboto Slab", "Noto Serif JP", serif'
const NOTO_SERIF_JP = '"Noto Serif JP", serif'
const MPLUS_ROUNDED = '"M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", sans-serif'
const ZEN_MARU = '"Zen Maru Gothic", "Hiragino Maru Gothic ProN", sans-serif'
const JETBRAINS = '"JetBrains Mono", ui-monospace, monospace'

export const TEMPLATES: Template[] = [
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

/** 微調整で選べるフォント。上からゴシック→明朝→まる→等幅の順。 */
export const FONT_CHOICES: Array<{ label: string; value: string }> = [
  // ゴシック体（サンセリフ）
  { label: 'ゴシック体（システム）', value: SANS },
  { label: 'Inter', value: INTER },
  { label: 'Poppins', value: POPPINS },
  { label: 'Montserrat', value: MONTSERRAT },
  { label: 'Space Grotesk', value: SPACE_GROTESK },
  { label: 'Noto Sans JP', value: NOTO_SANS_JP },
  // 明朝体（セリフ）
  { label: '明朝体（システム）', value: SERIF },
  { label: 'Playfair Display', value: PLAYFAIR },
  { label: 'Lora', value: LORA },
  { label: 'Roboto Slab', value: ROBOTO_SLAB },
  { label: 'Noto Serif JP', value: NOTO_SERIF_JP },
  // まるゴシック
  { label: 'まるゴシック（システム）', value: ROUNDED },
  { label: 'M PLUS Rounded 1c', value: MPLUS_ROUNDED },
  { label: 'Zen Maru Gothic', value: ZEN_MARU },
  // 等幅
  { label: '等幅（システム）', value: MONO },
  { label: 'JetBrains Mono', value: JETBRAINS },
]

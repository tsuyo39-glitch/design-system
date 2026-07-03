import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const FONT_STORAGE_KEY = 'ds-builder:font'

/** 見出し・本文で選べるフォント（日本語フォールバック込み）。 */
export const FONT_OPTIONS: Array<{ label: string; value: string }> = [
  {
    label: 'ゴシック体（標準）',
    value: 'system-ui, -apple-system, "Segoe UI", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif',
  },
  { label: 'Inter（サンセリフ）', value: 'Inter, system-ui, sans-serif' },
  {
    label: '明朝体（セリフ）',
    value: 'Georgia, "Times New Roman", "Hiragino Mincho ProN", "Noto Serif JP", serif',
  },
  { label: '等幅（モノスペース）', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
]

/** 文字サイズのプリセット（本文の基準 px）。 */
export const SIZE_OPTIONS: Array<{ label: string; base: number }> = [
  { label: '小', base: 14 },
  { label: '標準', base: 16 },
  { label: '大', base: 18 },
]

interface FontState {
  heading: string
  body: string
  base: number
  setHeading: (value: string) => void
  setBody: (value: string) => void
  setBase: (base: number) => void
}

export const useFontStore = create<FontState>()(
  persist(
    (set) => ({
      heading: FONT_OPTIONS[0].value,
      body: FONT_OPTIONS[0].value,
      base: 16,
      setHeading: (value) => set({ heading: value }),
      setBody: (value) => set({ body: value }),
      setBase: (base) => set({ base }),
    }),
    { name: FONT_STORAGE_KEY, version: 1 },
  ),
)

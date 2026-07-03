import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const LAYOUT_STORAGE_KEY = 'ds-builder:layout'

export type SpacingPreset = 'compact' | 'normal' | 'relaxed'
export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg'

/** プリセット → px。プレビューとエクスポートが同じ値を使う。 */
export const SPACING_PX: Record<SpacingPreset, number> = { compact: 8, normal: 16, relaxed: 24 }
export const RADIUS_PX: Record<RadiusPreset, number> = { none: 0, sm: 4, md: 8, lg: 16 }

export const SPACING_OPTIONS: Array<{ id: SpacingPreset; label: string }> = [
  { id: 'compact', label: 'コンパクト' },
  { id: 'normal', label: '標準' },
  { id: 'relaxed', label: 'ゆったり' },
]

export const RADIUS_OPTIONS: Array<{ id: RadiusPreset; label: string }> = [
  { id: 'none', label: 'なし' },
  { id: 'sm', label: '小' },
  { id: 'md', label: '中' },
  { id: 'lg', label: '大' },
]

interface LayoutState {
  spacing: SpacingPreset
  radius: RadiusPreset
  setSpacing: (spacing: SpacingPreset) => void
  setRadius: (radius: RadiusPreset) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      spacing: 'normal',
      radius: 'md',
      setSpacing: (spacing) => set({ spacing }),
      setRadius: (radius) => set({ radius }),
    }),
    { name: LAYOUT_STORAGE_KEY, version: 1 },
  ),
)

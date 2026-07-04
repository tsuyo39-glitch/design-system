import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_TEMPLATE, type DesignSpec } from '../model/templates'

export const DESIGN_STORAGE_KEY = 'ds-builder:design'

export type ColorRole = 'primary' | 'accent'

interface DesignState {
  /** 最後に適用したテンプレート。微調整しても表示の目印として残す。 */
  templateId: string
  spec: DesignSpec
  applyTemplate: (id: string, spec: DesignSpec) => void
  setColor: (role: ColorRole, hex: string) => void
  setHeading: (font: string) => void
  setBody: (font: string) => void
  setSizeBase: (px: number) => void
  setSpacing: (px: number) => void
  setRadius: (px: number) => void
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set) => ({
      templateId: DEFAULT_TEMPLATE.id,
      spec: DEFAULT_TEMPLATE.spec,
      applyTemplate: (id, spec) => set({ templateId: id, spec }),
      setColor: (role, hex) => set((s) => ({ spec: { ...s.spec, colors: { ...s.spec.colors, [role]: hex } } })),
      setHeading: (font) => set((s) => ({ spec: { ...s.spec, fonts: { ...s.spec.fonts, heading: font } } })),
      setBody: (font) => set((s) => ({ spec: { ...s.spec, fonts: { ...s.spec.fonts, body: font } } })),
      setSizeBase: (px) => set((s) => ({ spec: { ...s.spec, sizeBase: px } })),
      setSpacing: (px) => set((s) => ({ spec: { ...s.spec, spacing: px } })),
      setRadius: (px) => set((s) => ({ spec: { ...s.spec, radius: px } })),
    }),
    { name: DESIGN_STORAGE_KEY, version: 1 },
  ),
)

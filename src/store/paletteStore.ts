import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { deriveAccent, deriveMain } from '../model/palette'

/** シンプルなカラー三役（ベース／メイン／アクセント）専用の保存キー。 */
export const PALETTE_STORAGE_KEY = 'ds-builder:palette'

const DEFAULT_BASE = '#7FA8D9' // 落ち着いた青

export type Role = 'base' | 'main' | 'accent'

interface PaletteState {
  base: string
  main: string
  accent: string
  /** ベースを変えるとメイン・アクセントも連動して作り直す（三役の関係を保つ）。 */
  setBase: (hex: string) => void
  /** メインを変えるとアクセント（補色）も連動。 */
  setMain: (hex: string) => void
  setAccent: (hex: string) => void
  /** ベースからメイン・アクセントを作り直す。 */
  regenerate: () => void
}

export const usePaletteStore = create<PaletteState>()(
  persist(
    (set, get) => ({
      base: DEFAULT_BASE,
      main: deriveMain(DEFAULT_BASE),
      accent: deriveAccent(deriveMain(DEFAULT_BASE)),
      setBase: (hex) => {
        const main = deriveMain(hex)
        set({ base: hex, main, accent: deriveAccent(main) })
      },
      setMain: (hex) => set({ main: hex, accent: deriveAccent(hex) }),
      setAccent: (hex) => set({ accent: hex }),
      regenerate: () => {
        const main = deriveMain(get().base)
        set({ main, accent: deriveAccent(main) })
      },
    }),
    { name: PALETTE_STORAGE_KEY, version: 1 },
  ),
)

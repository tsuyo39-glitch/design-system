import { useEffect, useState } from 'react'
import { downloadDesignCss, downloadDesignJson, type Design } from './features/export/designExport'
import { FontDesigner } from './features/font/FontDesigner'
import { LayoutDesigner } from './features/layout/LayoutDesigner'
import { SimpleDesigner } from './features/simple/SimpleDesigner'
import { useFontStore } from './store/fontStore'
import { RADIUS_PX, SPACING_PX, useLayoutStore } from './store/layoutStore'
import { usePaletteStore } from './store/paletteStore'

type Mode = 'light' | 'dark'
type Tab = 'color' | 'font' | 'layout' | 'io'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'color', label: 'カラー' },
  { id: 'font', label: 'フォント' },
  { id: 'layout', label: 'レイアウト' },
  { id: 'io', label: '入出力' },
]

const secondaryButton = 'rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface'

function App() {
  const [mode, setMode] = useState<Mode>('light')
  const [tab, setTab] = useState<Tab>('color')

  const palette = usePaletteStore()
  const font = useFontStore()
  const layout = useLayoutStore()

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  const design: Design = {
    color: { base: palette.base, main: palette.main, accent: palette.accent },
    font: { heading: font.heading, body: font.body, baseSize: font.base },
    layout: { spacing: SPACING_PX[layout.spacing], radius: RADIUS_PX[layout.radius] },
  }

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6">
        <p className="py-4 text-lg font-semibold">ds-builder</p>
        <nav role="tablist" aria-label="ビュー" className="flex items-center gap-6">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={`border-b py-4 text-sm ${
                  active
                    ? 'border-accent font-medium text-accent'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </nav>
        <button
          type="button"
          onClick={() => setMode((current) => (current === 'light' ? 'dark' : 'light'))}
          className={secondaryButton}
        >
          {mode === 'light' ? 'ダークモード' : 'ライトモード'}
        </button>
      </header>

      {tab === 'color' && (
        <div role="tabpanel" className="flex-1 overflow-y-auto p-6">
          <SimpleDesigner />
        </div>
      )}

      {tab === 'font' && (
        <div role="tabpanel" className="flex-1 overflow-y-auto p-6">
          <FontDesigner />
        </div>
      )}

      {tab === 'layout' && (
        <div role="tabpanel" className="flex-1 overflow-y-auto p-6">
          <LayoutDesigner />
        </div>
      )}

      {tab === 'io' && (
        <div role="tabpanel" className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex max-w-lg flex-col gap-3">
            <h2 className="text-lg font-semibold">書き出し</h2>
            <p className="text-sm text-ink-muted">
              カラー・フォント・レイアウトで作った内容をまとめて書き出します。
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadDesignCss(design)}
                className="rounded-md bg-accent px-3 py-2 text-sm text-on-accent hover:bg-accent-hover"
              >
                CSS 変数
              </button>
              <button type="button" onClick={() => downloadDesignJson(design)} className={secondaryButton}>
                JSON
              </button>
            </div>
            <ul className="flex flex-col gap-1 text-sm text-ink-muted">
              <li>
                <span className="text-ink">CSS 変数</span> …{' '}
                <span className="font-mono">:root</span> のカスタムプロパティ（色・フォント・余白・角丸）。
              </li>
              <li>
                <span className="text-ink">JSON</span> … 同じ内容を構造化データで。
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

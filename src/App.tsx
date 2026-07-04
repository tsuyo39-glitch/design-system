import { useState } from 'react'
import { Controls } from './features/design/Controls'
import { SystemShowcase } from './features/design/SystemShowcase'
import { downloadDesignCss, downloadDesignJson } from './features/export/designExport'
import { useDesignStore } from './store/designStore'

const secondaryButton = 'rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface'

function App() {
  const spec = useDesignStore((s) => s.spec)
  const [exportOpen, setExportOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-lg font-semibold">ds-builder</p>
          <p className="text-xs text-ink-muted">テンプレートを選んで、微調整するだけ。</p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            className="rounded-md bg-accent px-3 py-2 text-sm text-on-accent hover:bg-accent-hover"
          >
            書き出し
          </button>
          {exportOpen && (
            <div className="absolute right-0 z-10 mt-2 flex w-44 flex-col gap-2 rounded-md border border-border bg-canvas p-2 shadow-md">
              <button
                type="button"
                onClick={() => {
                  downloadDesignCss(spec)
                  setExportOpen(false)
                }}
                className={secondaryButton}
              >
                CSS 変数
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadDesignJson(spec)
                  setExportOpen(false)
                }}
                className={secondaryButton}
              >
                JSON
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-border p-4">
          <Controls />
        </aside>
        <main className="flex-1 overflow-y-auto bg-surface p-8">
          <div className="mx-auto max-w-4xl">
            <SystemShowcase spec={spec} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App

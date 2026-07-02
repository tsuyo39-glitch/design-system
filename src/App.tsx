import { useEffect, useRef, useState } from 'react'
import { downloadCss, downloadDocument } from './features/export/exportDocument'
import { TokenEditor } from './features/token-editor/TokenEditor'
import { AddToken } from './features/token-list/AddToken'
import { TokenList } from './features/token-list/TokenList'
import { Preview } from './features/preview/Preview'
import type { Mode } from './model/resolve'
import { useDocumentStore } from './store/documentStore'

function App() {
  const [mode, setMode] = useState<Mode>('light')
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDocument = useDocumentStore((s) => s.importDocument)
  const newDocument = useDocumentStore((s) => s.newDocument)
  const loadSample = useDocumentStore((s) => s.loadSample)

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  const handleImportFile = async (file: File) => {
    try {
      importDocument(await file.text())
      setImportError(null)
    } catch {
      setImportError(`${file.name} を DTCG JSON として読み込めませんでした`)
    }
  }

  const secondaryButton =
    'rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface'

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <p className="text-lg font-semibold">ds-builder</p>
        <div className="flex items-center gap-2">
          {importError && <p className="text-sm text-error">{importError}</p>}
          <button type="button" onClick={newDocument} className={secondaryButton}>
            New
          </button>
          <button type="button" onClick={loadSample} className={secondaryButton}>
            Sample
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className={secondaryButton}>
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            aria-label="DTCG JSON を import"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImportFile(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => downloadCss(useDocumentStore.getState().document)}
            className={secondaryButton}
          >
            Export CSS
          </button>
          <button
            type="button"
            onClick={() => downloadDocument(useDocumentStore.getState().document)}
            className="rounded-md bg-accent px-3 py-2 text-sm text-on-accent hover:bg-accent-hover"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => setMode((current) => (current === 'light' ? 'dark' : 'light'))}
            className={secondaryButton}
          >
            {mode === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border p-2">
          <AddToken />
          <div className="pt-2">
            <TokenList />
          </div>
        </aside>
        <section className="w-96 shrink-0 overflow-y-auto border-r border-border p-6">
          <TokenEditor />
        </section>
        <main className="flex-1 overflow-y-auto p-6">
          <Preview mode={mode} />
        </main>
      </div>
    </div>
  )
}

export default App

import { useEffect, useState } from 'react'
import { TokenList } from './features/token-list/TokenList'
import { useDocumentStore } from './store/documentStore'

type Mode = 'light' | 'dark'

function App() {
  const [mode, setMode] = useState<Mode>('light')
  const selectedPath = useDocumentStore((s) => s.selectedPath)

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
        <p className="text-lg font-semibold">ds-builder</p>
        <button
          type="button"
          onClick={() => setMode((current) => (current === 'light' ? 'dark' : 'light'))}
          className="rounded-md bg-accent px-3 py-2 text-sm text-on-accent hover:bg-accent-hover"
        >
          {mode === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-y-auto border-r border-border p-2">
          <TokenList />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <p className="text-ink-muted">
            {selectedPath ? (
              <>
                選択中: <span className="font-mono text-ink">{selectedPath}</span>
              </>
            ) : (
              '左のトークン一覧から選択してください。'
            )}
          </p>
        </main>
      </div>
    </div>
  )
}

export default App

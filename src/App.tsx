import { useEffect, useState } from 'react'
import { TokenEditor } from './features/token-editor/TokenEditor'
import { TokenList } from './features/token-list/TokenList'
import { Preview } from './features/preview/Preview'
import type { Mode } from './model/resolve'

function App() {
  const [mode, setMode] = useState<Mode>('light')

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

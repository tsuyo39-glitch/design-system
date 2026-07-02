import { useEffect, useState } from 'react'

type Mode = 'light' | 'dark'

function App() {
  const [mode, setMode] = useState<Mode>('light')

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <p className="text-lg font-semibold">ds-builder</p>
        <button
          type="button"
          onClick={() => setMode((current) => (current === 'light' ? 'dark' : 'light'))}
          className="rounded-md bg-accent px-3 py-2 text-sm text-on-accent hover:bg-accent-hover"
        >
          {mode === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </header>
      <main className="p-6">
        <p className="text-ink-muted">
          design-system/tokens.json から生成した CSS 変数でこの chrome を着色しています。
        </p>
      </main>
    </div>
  )
}

export default App

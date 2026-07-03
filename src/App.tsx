import { useEffect, useRef, useState } from 'react'
import {
  downloadCss,
  downloadDocument,
  downloadKotlin,
  downloadResolvedJson,
  downloadSwift,
} from './features/export/exportDocument'
import { TokenEditor } from './features/token-editor/TokenEditor'
import { AddToken } from './features/token-list/AddToken'
import { TokenList } from './features/token-list/TokenList'
import { Preview } from './features/preview/Preview'
import type { Mode } from './model/resolve'
import { useDocumentStore } from './store/documentStore'

type Tab = 'edit' | 'preview' | 'io'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'edit', label: '編集' },
  { id: 'preview', label: 'プレビュー' },
  { id: 'io', label: '入出力' },
]

const secondaryButton = 'rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface'

function App() {
  const [mode, setMode] = useState<Mode>('light')
  const [tab, setTab] = useState<Tab>('edit')
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDocument = useDocumentStore((s) => s.importDocument)
  const newDocument = useDocumentStore((s) => s.newDocument)
  const loadSample = useDocumentStore((s) => s.loadSample)

  useEffect(() => {
    document.documentElement.dataset.mode = mode
  }, [mode])

  // 読込系の操作後は結果が見える編集タブへ移す。
  const loadThenEdit = (load: () => void) => {
    load()
    setImportError(null)
    setTab('edit')
  }

  const handleImportFile = async (file: File) => {
    try {
      importDocument(await file.text())
      setImportError(null)
      setTab('edit')
    } catch {
      setImportError(`${file.name} を DTCG JSON として読み込めませんでした`)
    }
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
          {mode === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </header>

      {tab === 'edit' && (
        <div role="tabpanel" className="flex flex-1 overflow-hidden">
          <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-border p-2">
            <AddToken />
            <div className="pt-2">
              <TokenList />
            </div>
          </aside>
          <main className="flex-1 overflow-y-auto p-6">
            <TokenEditor />
          </main>
        </div>
      )}

      {tab === 'preview' && (
        <div role="tabpanel" className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            <Preview mode={mode} />
          </div>
        </div>
      )}

      {tab === 'io' && (
        <div role="tabpanel" className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex max-w-lg flex-col gap-8">
            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-medium uppercase text-ink-muted">ドキュメント</h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => loadThenEdit(newDocument)} className={secondaryButton}>
                  空から新規
                </button>
                <button type="button" onClick={() => loadThenEdit(loadSample)} className={secondaryButton}>
                  サンプルを読込
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className={secondaryButton}>
                  JSON を読み込む
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
              </div>
              {importError && <p className="text-sm text-error">{importError}</p>}
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="text-xs font-medium uppercase text-ink-muted">エクスポート</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadDocument(useDocumentStore.getState().document)}
                  className="rounded-md bg-accent px-3 py-2 text-sm text-on-accent hover:bg-accent-hover"
                >
                  DTCG JSON
                </button>
                <button
                  type="button"
                  onClick={() => downloadCss(useDocumentStore.getState().document)}
                  className={secondaryButton}
                >
                  CSS 変数
                </button>
                <button
                  type="button"
                  onClick={() => downloadResolvedJson(useDocumentStore.getState().document)}
                  className={secondaryButton}
                >
                  解決済み JSON
                </button>
                <button
                  type="button"
                  onClick={() => downloadSwift(useDocumentStore.getState().document)}
                  className={secondaryButton}
                >
                  Swift
                </button>
                <button
                  type="button"
                  onClick={() => downloadKotlin(useDocumentStore.getState().document)}
                  className={secondaryButton}
                >
                  Kotlin
                </button>
              </div>
              <ul className="flex flex-col gap-1 text-sm text-ink-muted">
                <li>
                  <span className="text-ink">DTCG JSON</span> … 参照を残した編集用フォーマット。
                </li>
                <li>
                  <span className="text-ink">CSS 変数</span> … 解決済みカスタムプロパティ（
                  <span className="font-mono">:root</span> と{' '}
                  <span className="font-mono">[data-mode=&quot;dark&quot;]</span>）。
                </li>
                <li>
                  <span className="text-ink">解決済み JSON</span> … 参照と light/dark を解決した{' '}
                  <span className="font-mono">{'{ light, dark }'}</span> の木。
                </li>
                <li>
                  <span className="text-ink">Swift</span> … color トークンの SwiftUI{' '}
                  <span className="font-mono">Color</span> 拡張（light）。
                </li>
                <li>
                  <span className="text-ink">Kotlin</span> … color トークンの Jetpack Compose{' '}
                  <span className="font-mono">Color</span> 定数（light）。
                </li>
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

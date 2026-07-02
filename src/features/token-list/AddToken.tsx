import { useState } from 'react'
import type { TokenType } from '../../model/dtcg'
import { useDocumentStore } from '../../store/documentStore'

const TOKEN_TYPES: TokenType[] = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'number',
  'duration',
  'cubicBezier',
  'shadow',
  'typography',
]

export function AddToken() {
  const addToken = useDocumentStore((s) => s.addToken)
  const [path, setPath] = useState('')
  const [type, setType] = useState<TokenType>('color')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const trimmed = path.trim()
    if (!trimmed) return
    try {
      addToken(trimmed, type)
      setPath('')
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '追加できませんでした')
    }
  }

  const field = 'rounded-md border border-border bg-surface px-2 py-1 text-sm text-ink'

  return (
    <form
      className="flex flex-col gap-1 border-b border-border px-1 pb-2"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="color.brand.primary"
          aria-label="追加するトークンのパス"
          className={`${field} min-w-0 flex-1 font-mono`}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TokenType)}
          aria-label="トークンの型"
          className={`${field} font-mono`}
        >
          {TOKEN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-border px-2 py-1 text-sm text-ink hover:bg-surface">
          Add
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </form>
  )
}

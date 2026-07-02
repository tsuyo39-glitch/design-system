import { useState } from 'react'
import { defaultValueFor } from '../../model/defaults'
import type { TokenType } from '../../model/dtcg'
import { getToken, resolveType } from '../../model/resolve'
import { useDocumentStore } from '../../store/documentStore'

const REF_PATTERN = /^\{(.+)\}$/

function isRef(value: unknown): value is string {
  return typeof value === 'string' && REF_PATTERN.test(value)
}

function defaultLiteralFor(type: TokenType | '?'): unknown {
  return type === '?' ? null : defaultValueFor(type)
}

function RefInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const path = value.match(REF_PATTERN)?.[1] ?? ''
  return (
    <input
      type="text"
      value={path}
      onChange={(e) => onChange(`{${e.target.value}}`)}
      placeholder="group.token"
      className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
    />
  )
}

function ColorInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="カラーピッカー"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 shrink-0 rounded border border-border"
      />
      <input
        type="text"
        aria-label="HEX値"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
      />
    </div>
  )
}

function DimensionInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const match = value.match(/^(-?\d*\.?\d+)([a-z%]*)$/i)
  const amount = match ? match[1] : '0'
  const unit = match ? match[2] : 'px'
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={amount}
        onChange={(e) => onChange(`${e.target.value}${unit}`)}
        className="w-24 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
      />
      <input
        type="text"
        value={unit}
        onChange={(e) => onChange(`${amount}${e.target.value}`)}
        className="w-16 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
      />
    </div>
  )
}

function FontFamilyInput({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return (
    <input
      type="text"
      value={value.join(', ')}
      onChange={(e) =>
        onChange(
          e.target.value
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean),
        )
      }
      className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
    />
  )
}

function FontWeightInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
    >
      {[400, 500, 600].map((weight) => (
        <option key={weight} value={weight}>
          {weight}
        </option>
      ))}
    </select>
  )
}

/** color/dimension/fontFamily/fontWeight 以外の型は raw JSON で編集する（SPECIFICATION §3.3）。 */
function RawJsonInput({ value, onChange }: { value: unknown; onChange: (value: unknown) => void }) {
  const serialized = JSON.stringify(value)
  const [prevSerialized, setPrevSerialized] = useState(serialized)
  const [draft, setDraft] = useState(serialized)
  const [error, setError] = useState<string | null>(null)

  // 選択トークンが変わって serialized が変化したら、レンダー中に draft を同期する
  // （React公式の「propが変わったらstateを調整する」パターン。useEffectは使わない）。
  if (serialized !== prevSerialized) {
    setPrevSerialized(serialized)
    setDraft(serialized)
    setError(null)
  }

  const commit = () => {
    try {
      onChange(JSON.parse(draft))
      setError(null)
    } catch {
      setError('JSON として解析できません')
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        rows={4}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

function LiteralInput({
  type,
  value,
  onChange,
}: {
  type: TokenType | '?'
  value: unknown
  onChange: (value: unknown) => void
}) {
  switch (type) {
    case 'color':
      return <ColorInput value={typeof value === 'string' ? value : '#000000'} onChange={onChange} />
    case 'dimension':
      return <DimensionInput value={typeof value === 'string' ? value : '0px'} onChange={onChange} />
    case 'fontFamily':
      return <FontFamilyInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
    case 'fontWeight':
      return <FontWeightInput value={typeof value === 'number' ? value : 400} onChange={onChange} />
    default:
      return <RawJsonInput value={value} onChange={onChange} />
  }
}

export function TokenEditor() {
  const selectedPath = useDocumentStore((s) => s.selectedPath)
  const document = useDocumentStore((s) => s.document)
  const setValue = useDocumentStore((s) => s.setValue)
  const removeNode = useDocumentStore((s) => s.removeNode)
  // 削除の確認中パス。selectedPath と一致するときだけ確認 UI を出すので、別トークンを選ぶと自然に解除される。
  const [confirmingPath, setConfirmingPath] = useState<string | null>(null)

  if (!selectedPath) {
    return <p className="text-ink-muted">左のトークン一覧から選択してください。</p>
  }

  let value: unknown
  let type: TokenType | '?'
  try {
    value = getToken(document, selectedPath).$value
    type = resolveType(document, selectedPath)
  } catch {
    return <p className="text-ink-muted">このトークンは編集できません。</p>
  }

  const referencing = isRef(value)

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="truncate font-mono text-sm text-ink">{selectedPath}</h2>
        <span className="shrink-0 rounded border border-border px-1 font-mono text-xs text-ink-muted">{type}</span>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={referencing}
          onChange={() => setValue(selectedPath, referencing ? defaultLiteralFor(type) : '{}')}
        />
        参照として指定する
      </label>

      {referencing ? (
        <RefInput value={value as string} onChange={(v) => setValue(selectedPath, v)} />
      ) : (
        <LiteralInput type={type} value={value} onChange={(v) => setValue(selectedPath, v)} />
      )}

      <div className="border-t border-border pt-4">
        {confirmingPath === selectedPath ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-error">削除しますか？</span>
            <button
              type="button"
              onClick={() => {
                removeNode(selectedPath)
                setConfirmingPath(null)
              }}
              className="rounded-md border border-error px-3 py-1 text-sm text-error hover:bg-surface"
            >
              削除する
            </button>
            <button
              type="button"
              onClick={() => setConfirmingPath(null)}
              className="rounded-md border border-border px-3 py-1 text-sm text-ink hover:bg-surface"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingPath(selectedPath)}
            className="rounded-md border border-border px-3 py-1 text-sm text-ink-muted hover:bg-surface"
          >
            このトークンを削除
          </button>
        )}
      </div>
    </div>
  )
}

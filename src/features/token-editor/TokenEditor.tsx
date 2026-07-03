import { useState } from 'react'
import { defaultValueFor } from '../../model/defaults'
import { isToken, type TokenType } from '../../model/dtcg'
import { checkToken, describeIssue, findNode, getToken, resolveType } from '../../model/resolve'
import { useDocumentStore } from '../../store/documentStore'
import { ColorWheel } from './ColorWheel'

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
  return (
    <div className="flex flex-col gap-3">
      <ColorWheel value={value} onChange={onChange} />
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-9 w-9 shrink-0 rounded-md border border-border"
          style={{ backgroundColor: value }}
        />
        <input
          type="text"
          aria-label="HEX値"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
        />
      </div>
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

function NumberInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-32 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
    />
  )
}

function CubicBezierInput({
  value,
  onChange,
}: {
  value: [number, number, number, number]
  onChange: (value: [number, number, number, number]) => void
}) {
  const labels = ['x1', 'y1', 'x2', 'y2']
  return (
    <div className="flex gap-2">
      {value.map((n, i) => (
        <label key={labels[i]} className="flex flex-col gap-1">
          <span className="font-mono text-xs text-ink-muted">{labels[i]}</span>
          <input
            type="number"
            step="0.01"
            value={n}
            onChange={(e) => {
              const next = [...value] as [number, number, number, number]
              next[i] = Number(e.target.value)
              onChange(next)
            }}
            className="w-16 rounded-md border border-border bg-surface px-2 py-1 font-mono text-sm text-ink"
          />
        </label>
      ))}
    </div>
  )
}

function displayComposite(sub: unknown): string {
  if (typeof sub === 'string') return sub
  if (typeof sub === 'number') return String(sub)
  return JSON.stringify(sub)
}

/** composite のサブ値を、元の型・参照記法を尊重して解釈する。 */
function parseComposite(input: string, original: unknown): unknown {
  if (REF_PATTERN.test(input.trim())) return input // {ref} はそのまま文字列
  if (typeof original === 'number') {
    const n = Number(input)
    return input.trim() !== '' && Number.isFinite(n) ? n : input
  }
  if (Array.isArray(original)) {
    try {
      return JSON.parse(input)
    } catch {
      return input
    }
  }
  return input
}

/** typography / shadow など object 値を、キーごとのラベル付き入力で編集する。 */
function CompositeInput({
  value,
  onChange,
}: {
  value: Record<string, unknown>
  onChange: (value: Record<string, unknown>) => void
}) {
  const entries = Object.entries(value)
  if (entries.length === 0) {
    return <RawJsonInput value={value} onChange={(v) => onChange(v as Record<string, unknown>)} />
  }
  return (
    <div className="flex flex-col gap-2">
      {entries.map(([key, sub]) => (
        <label key={key} className="flex flex-col gap-1">
          <span className="font-mono text-xs text-ink-muted">{key}</span>
          <input
            type="text"
            value={displayComposite(sub)}
            onChange={(e) => onChange({ ...value, [key]: parseComposite(e.target.value, sub) })}
            className="w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
          />
        </label>
      ))}
    </div>
  )
}

/** 想定外の形の値に対する保険。通常の型はすべて専用入力に振り分ける。 */
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
    case 'duration':
      return <DimensionInput value={typeof value === 'string' ? value : '0px'} onChange={onChange} />
    case 'fontFamily':
      return <FontFamilyInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} />
    case 'fontWeight':
      return <FontWeightInput value={typeof value === 'number' ? value : 400} onChange={onChange} />
    case 'number':
      return <NumberInput value={typeof value === 'number' ? value : 0} onChange={onChange} />
    case 'cubicBezier':
      return (
        <CubicBezierInput
          value={Array.isArray(value) ? (value as [number, number, number, number]) : [0, 0, 1, 1]}
          onChange={onChange}
        />
      )
    case 'shadow':
    case 'typography':
      return typeof value === 'object' && value !== null && !Array.isArray(value) ? (
        <CompositeInput value={value as Record<string, unknown>} onChange={onChange} />
      ) : (
        <RawJsonInput value={value} onChange={onChange} />
      )
    default:
      return <RawJsonInput value={value} onChange={onChange} />
  }
}

/** 選択中ノードの改名。key={path} で remount して draft をリセットする前提。 */
function RenameControl({ path }: { path: string }) {
  const rename = useDocumentStore((s) => s.rename)
  const currentName = path.split('.').at(-1) ?? ''
  const [draft, setDraft] = useState(currentName)
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const next = draft.trim()
    if (!next || next === currentName) return
    try {
      rename(path, next)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '改名できませんでした')
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <form
        className="flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="名前"
          className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
        />
        <button type="submit" className="rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface">
          Rename
        </button>
      </form>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}

/** トークン/グループ共通の削除 UI（インライン2段階確認）。 */
function DeleteControl({ path, label }: { path: string; label: string }) {
  const removeNode = useDocumentStore((s) => s.removeNode)
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="border-t border-border pt-4">
      {confirming ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-error">削除しますか？</span>
          <button
            type="button"
            onClick={() => removeNode(path)}
            className="rounded-md border border-error px-3 py-1 text-sm text-error hover:bg-surface"
          >
            削除する
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-md border border-border px-3 py-1 text-sm text-ink hover:bg-surface"
          >
            キャンセル
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-md border border-border px-3 py-1 text-sm text-ink-muted hover:bg-surface"
        >
          {label}
        </button>
      )}
    </div>
  )
}

function TokenValueEditor({ path, type }: { path: string; type: TokenType | '?' }) {
  const setValue = useDocumentStore((s) => s.setValue)
  const document = useDocumentStore((s) => s.document)
  const value = getToken(document, path).$value
  const referencing = isRef(value)
  const issue = checkToken(document, path)

  return (
    <>
      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={referencing}
          onChange={() => setValue(path, referencing ? defaultLiteralFor(type) : '{}')}
        />
        参照として指定する
      </label>

      {referencing ? (
        <RefInput value={value as string} onChange={(v) => setValue(path, v)} />
      ) : (
        <LiteralInput type={type} value={value} onChange={(v) => setValue(path, v)} />
      )}

      {issue && (
        <p className="rounded-md border border-error px-3 py-2 text-sm text-error">
          {describeIssue(issue)}: {issue.message}
        </p>
      )}
    </>
  )
}

export function TokenEditor() {
  const selectedPath = useDocumentStore((s) => s.selectedPath)
  const document = useDocumentStore((s) => s.document)

  if (!selectedPath) {
    return <p className="text-ink-muted">左のトークン一覧から選択してください。</p>
  }

  let node: ReturnType<typeof findNode>
  try {
    node = findNode(document, selectedPath)
  } catch {
    return <p className="text-ink-muted">この項目は編集できません。</p>
  }

  const asToken = isToken(node)
  let badge = 'group'
  if (asToken) {
    try {
      badge = resolveType(document, selectedPath)
    } catch {
      badge = '?'
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="truncate font-mono text-sm text-ink">{selectedPath}</h2>
        <span className="shrink-0 rounded border border-border px-1 font-mono text-xs text-ink-muted">{badge}</span>
      </div>

      <RenameControl key={selectedPath} path={selectedPath} />

      {asToken ? (
        <TokenValueEditor path={selectedPath} type={badge as TokenType | '?'} />
      ) : (
        <p className="text-sm text-ink-muted">グループです。名前の変更と削除ができます。</p>
      )}

      <DeleteControl path={selectedPath} label={asToken ? 'このトークンを削除' : 'このグループを削除'} />
    </div>
  )
}

import type { Group, Token, TokenDocument } from '../../model/dtcg'
import { isMetaKey, isToken } from '../../model/dtcg'
import { resolveToken, resolveType } from '../../model/resolve'
import { useDocumentStore } from '../../store/documentStore'

function describeValue(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}

function swatchColor(doc: TokenDocument, path: string): string | undefined {
  try {
    const resolved = resolveToken(doc, path, 'light')
    return typeof resolved === 'string' ? resolved : undefined
  } catch {
    return undefined
  }
}

interface TokenRowProps {
  path: string[]
  node: Group | Token
  doc: TokenDocument
  depth: number
}

function TokenRow({ path, node, doc, depth }: TokenRowProps) {
  const fullPath = path.join('.')
  // 「自分が選択中か」だけを購読する。selectedPath 全体を購読すると、
  // どのトークンを選んでも全 TokenRow が再レンダーされてしまうため。
  const isSelected = useDocumentStore((s) => s.selectedPath === fullPath)
  const select = useDocumentStore((s) => s.select)
  const name = path[path.length - 1]
  const indent = { paddingLeft: `${depth * 16 + 8}px` }

  if (isToken(node)) {
    let type: string
    try {
      type = resolveType(doc, fullPath)
    } catch {
      type = '?'
    }
    const swatch = type === 'color' ? swatchColor(doc, fullPath) : undefined

    return (
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => select(fullPath)}
        style={indent}
        className={`flex w-full items-center gap-2 rounded-md py-1 pr-2 text-left text-sm ${
          isSelected ? 'bg-accent-subtle' : 'hover:bg-surface'
        }`}
      >
        {swatch && (
          <span
            className="h-3 w-3 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: swatch }}
          />
        )}
        <span className="truncate font-mono">{name}</span>
        <span className="ml-auto shrink-0 rounded border border-border px-1 font-mono text-xs text-ink-muted">
          {type}
        </span>
        <span className="w-24 shrink-0 truncate text-right font-mono text-xs text-ink-muted">
          {describeValue(node.$value)}
        </span>
      </button>
    )
  }

  const children = Object.entries(node).filter(([key]) => !isMetaKey(key))

  return (
    <div>
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={() => select(fullPath)}
        style={indent}
        className={`flex w-full items-center rounded-md py-1 pr-2 text-left font-mono text-xs font-medium text-ink-muted ${
          isSelected ? 'bg-accent-subtle' : 'hover:bg-surface'
        }`}
      >
        {name}
      </button>
      {children.map(([key, child]) => (
        <TokenRow key={key} path={[...path, key]} node={child as Group | Token} doc={doc} depth={depth + 1} />
      ))}
    </div>
  )
}

export function TokenList() {
  const document = useDocumentStore((s) => s.document)
  const entries = Object.entries(document).filter(([key]) => !isMetaKey(key))

  return (
    <nav aria-label="トークン一覧" className="flex flex-col">
      {entries.map(([key, child]) => (
        <TokenRow key={key} path={[key]} node={child as Group | Token} doc={document} depth={0} />
      ))}
    </nav>
  )
}

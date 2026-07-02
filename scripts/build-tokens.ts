/**
 * design-system/tokens.json (DTCG) -> src/styles/tokens.css
 *
 * $extensions["com.tokens.mode"].dark は素の Style Dictionary では解決できないため、
 * SPECIFICATION.md §4.1 の通り自作スクリプトで前処理する:
 *   1. {ref} を解決
 *   2. light 用ツリー（$value）と dark 用ツリー（dark 上書き適用）を生成
 *   3. CSS カスタムプロパティに変換し :root / [data-mode="dark"] として出力
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SOURCE = resolve(__dirname, '../design-system/tokens.json')
const TARGET = resolve(__dirname, '../src/styles/tokens.css')

type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'number'
  | 'duration'
  | 'cubicBezier'
  | 'shadow'
  | 'typography'

// biome-ignore-start: DTCG ツリーは動的な形なので unknown ベースで扱う
type Node = { [key: string]: unknown }
// biome-ignore-end

const isToken = (node: Node): boolean => '$value' in node
const isMetaKey = (key: string): boolean => key.startsWith('$')

type Mode = 'light' | 'dark'

/**
 * {group.token} 形式の参照をルートから辿って解決する。循環参照はエラー。
 * mode='dark' のときは、参照先トークンに dark 上書きがあればそちらを優先する
 * （参照を経由しても mode 解決が伝播するように）。
 */
function resolveRefs(value: unknown, root: Node, mode: Mode, seen: readonly string[] = []): unknown {
  if (typeof value === 'string') {
    const match = value.match(/^\{(.+)\}$/)
    if (!match) return value

    const path = match[1]
    if (seen.includes(path)) {
      throw new Error(`循環参照を検出しました: ${[...seen, path].join(' -> ')}`)
    }

    let cursor: unknown = root
    for (const key of path.split('.')) {
      if (typeof cursor !== 'object' || cursor === null || !(key in cursor)) {
        throw new Error(`参照が解決できません: {${path}}`)
      }
      cursor = (cursor as Node)[key]
    }

    let resolved = cursor
    if (typeof cursor === 'object' && cursor !== null && isToken(cursor as Node)) {
      const token = cursor as Node
      const extensions = token.$extensions as Node | undefined
      const modeExtension = extensions?.['com.tokens.mode'] as Node | undefined
      resolved =
        mode === 'dark' && modeExtension && 'dark' in modeExtension ? modeExtension.dark : token.$value
    }
    return resolveRefs(resolved, root, mode, [...seen, path])
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveRefs(item, root, mode, seen))
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolveRefs(v, root, mode, seen)]),
    )
  }

  return value
}

interface FlatToken {
  path: string[]
  type: TokenType
  light: unknown
  dark: unknown
}

/** DTCG ツリーを再帰的に走査し、mode 解決済みのフラットなトークン一覧にする。 */
function flatten(
  node: Node,
  root: Node,
  path: string[],
  inheritedType: TokenType | undefined,
  out: FlatToken[],
): void {
  const type = (node.$type as TokenType | undefined) ?? inheritedType

  if (isToken(node)) {
    if (!type) throw new Error(`$type が解決できません: ${path.join('.')}`)
    const extensions = node.$extensions as Node | undefined
    const modeExtension = extensions?.['com.tokens.mode'] as Node | undefined
    const darkRaw = modeExtension && 'dark' in modeExtension ? modeExtension.dark : node.$value

    out.push({
      path,
      type,
      light: resolveRefs(node.$value, root, 'light'),
      dark: resolveRefs(darkRaw, root, 'dark'),
    })
    return
  }

  for (const [key, child] of Object.entries(node)) {
    if (isMetaKey(key) || typeof child !== 'object' || child === null) continue
    flatten(child as Node, root, [...path, key], type, out)
  }
}

const CSS_KEYWORDS = new Set(['system-ui', 'sans-serif', 'serif', 'monospace', 'ui-monospace'])

/** 型ごとの実値を CSS カスタムプロパティの値文字列に変換する。typography は複数型の合成なので対象外。 */
function toCssValue(type: TokenType, value: unknown): string | undefined {
  switch (type) {
    case 'color':
    case 'dimension':
    case 'duration':
      return String(value)
    case 'number':
    case 'fontWeight':
      return String(value)
    case 'fontFamily':
      return (value as string[])
        .map((name) => (CSS_KEYWORDS.has(name) || !name.includes(' ') ? name : `"${name}"`))
        .join(', ')
    case 'cubicBezier': {
      const [a, b, c, d] = value as [number, number, number, number]
      return `cubic-bezier(${a}, ${b}, ${c}, ${d})`
    }
    case 'shadow': {
      const shadow = value as { offsetX: string; offsetY: string; blur: string; spread: string; color: string }
      return `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread} ${shadow.color}`
    }
    case 'typography':
      return undefined
  }
}

function toVarName(path: string[]): string {
  return `--${path.join('-')}`
}

function render(tokens: FlatToken[], pick: 'light' | 'dark'): string {
  const lines = tokens
    .map((token) => {
      const css = toCssValue(token.type, token[pick])
      return css === undefined ? null : `  ${toVarName(token.path)}: ${css};`
    })
    .filter((line): line is string => line !== null)
  return lines.join('\n')
}

function main(): void {
  const doc = JSON.parse(readFileSync(SOURCE, 'utf-8')) as Node
  const tokens: FlatToken[] = []
  flatten(doc, doc, [], undefined, tokens)

  const output = `/**
 * 生成ファイル。手で編集しない。
 * design-system/tokens.json から \`npm run tokens:build\` (scripts/build-tokens.ts) で生成。
 */

:root {
${render(tokens, 'light')}
}

[data-mode='dark'] {
${render(tokens, 'dark')}
}
`

  mkdirSync(dirname(TARGET), { recursive: true })
  writeFileSync(TARGET, output)
  console.log(`tokens.css を書き出しました: ${tokens.length} トークン -> ${TARGET}`)
}

main()

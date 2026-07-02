import { isMetaKey, isToken, type Group, type Token, type TokenDocument, type TokenType } from './dtcg'
import { resolveToken, resolveType, type Mode } from './resolve'

/**
 * TokenDocument を解決済みの CSS カスタムプロパティに変換する（UI 非依存の純粋関数）。
 * :root = light、[data-mode="dark"] = dark。参照と mode 上書きは model/resolve に委譲する。
 *
 * scripts/build-tokens.ts はアプリ chrome 用に同種の変換を行うが、あちらはビルド時に
 * design-system/tokens.json を対象とする別レイヤー。こちらは実行時にユーザードキュメントを対象とする。
 */

const CSS_KEYWORDS = new Set(['system-ui', 'sans-serif', 'serif', 'monospace', 'ui-monospace'])

function quoteFontName(name: string): string {
  return CSS_KEYWORDS.has(name) || !/\s/.test(name) ? name : `"${name}"`
}

interface ShadowValue {
  color: string
  offsetX: string
  offsetY: string
  blur: string
  spread: string
}

/** 型ごとの解決済み実値を CSS 値文字列にする。typography は複合型なので単一プロパティにできず undefined。 */
function toCssValue(type: TokenType, value: unknown): string | undefined {
  switch (type) {
    case 'color':
    case 'dimension':
    case 'duration':
      return typeof value === 'string' ? value : undefined
    case 'number':
    case 'fontWeight':
      return typeof value === 'number' ? String(value) : undefined
    case 'fontFamily':
      return Array.isArray(value) ? value.map(quoteFontName).join(', ') : undefined
    case 'cubicBezier': {
      if (!Array.isArray(value) || value.length !== 4) return undefined
      const [a, b, c, d] = value as number[]
      return `cubic-bezier(${a}, ${b}, ${c}, ${d})`
    }
    case 'shadow': {
      const s = value as ShadowValue
      if (!s || typeof s !== 'object') return undefined
      return `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`
    }
    case 'typography':
      return undefined
  }
}

function toVarName(path: string[]): string {
  return `--${path.join('-')}`
}

/** DTCG ツリーを走査し、トークンのドット区切りパス配列を集める。 */
function collectTokenPaths(node: Group | Token, path: string[], out: string[][]): void {
  if (isToken(node)) {
    out.push(path)
    return
  }
  for (const [key, child] of Object.entries(node)) {
    if (isMetaKey(key) || typeof child !== 'object' || child === null) continue
    collectTokenPaths(child as Group | Token, [...path, key], out)
  }
}

function renderBlock(selector: string, lines: string[]): string {
  return `${selector} {\n${lines.join('\n')}\n}`
}

/** ドキュメントを CSS 文字列（:root + [data-mode="dark"]）に変換する。 */
export function documentToCss(doc: TokenDocument): string {
  const paths: string[][] = []
  collectTokenPaths(doc, [], paths)

  const lightLines: string[] = []
  const darkLines: string[] = []

  for (const path of paths) {
    const dotted = path.join('.')
    let type: TokenType
    try {
      type = resolveType(doc, dotted)
    } catch {
      continue // $type を解決できないトークンは飛ばす
    }

    for (const [mode, lines] of [
      ['light', lightLines],
      ['dark', darkLines],
    ] as Array<[Mode, string[]]>) {
      let resolved: unknown
      try {
        resolved = resolveToken(doc, dotted, mode)
      } catch {
        continue // 壊れた参照・循環参照は export 自体を落とさず握りつぶす
      }
      const css = toCssValue(type, resolved)
      if (css !== undefined) lines.push(`  ${toVarName(path)}: ${css};`)
    }
  }

  return `${renderBlock(':root', lightLines)}\n\n${renderBlock('[data-mode="dark"]', darkLines)}\n`
}

import { isMetaKey, isToken, type Group, type Token, type TokenDocument, type TokenType } from './dtcg'
import { resolveToken, resolveType } from './resolve'

export interface ResolvedToken {
  path: string[]
  type: TokenType | null
  /** light / dark とも参照・mode を解決済みの実値。 */
  light: unknown
  dark: unknown
}

/**
 * DTCG ツリーを走査し、各トークンを light/dark とも完全解決した一覧にする（UI 非依存）。
 * 各エクスポータ（CSS 以外）が共有する土台。light が解決できないトークンは壊れているので飛ばす。
 */
export function flattenResolved(doc: TokenDocument): ResolvedToken[] {
  const out: ResolvedToken[] = []

  const walk = (node: Group | Token, path: string[]): void => {
    if (isToken(node)) {
      const dotted = path.join('.')
      let light: unknown
      try {
        light = resolveToken(doc, dotted, 'light')
      } catch {
        return
      }
      let dark: unknown
      try {
        dark = resolveToken(doc, dotted, 'dark')
      } catch {
        dark = light
      }
      let type: TokenType | null
      try {
        type = resolveType(doc, dotted)
      } catch {
        type = null
      }
      out.push({ path, type, light, dark })
      return
    }

    for (const [key, child] of Object.entries(node)) {
      if (isMetaKey(key) || typeof child !== 'object' || child === null) continue
      walk(child as Group | Token, [...path, key])
    }
  }

  walk(doc, [])
  return out
}

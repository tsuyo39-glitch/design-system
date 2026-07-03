import type { TokenDocument } from './dtcg'
import { flattenResolved } from './flatten'

function setDeep(root: Record<string, unknown>, path: string[], value: unknown): void {
  let node = root
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    if (typeof node[key] !== 'object' || node[key] === null) node[key] = {}
    node = node[key] as Record<string, unknown>
  }
  node[path[path.length - 1]] = value
}

/**
 * 参照と light/dark を完全に解決した { light, dark } のネスト木を JSON 文字列にする。
 * DTCG エクスポート（参照つきの authoring 形式）を補完し、解決処理を持たない
 * 消費側（AI エージェント・任意のツール）がそのまま使える出力。
 */
export function toResolvedJson(doc: TokenDocument): string {
  const light: Record<string, unknown> = {}
  const dark: Record<string, unknown> = {}

  for (const token of flattenResolved(doc)) {
    setDeep(light, token.path, token.light)
    setDeep(dark, token.path, token.dark)
  }

  return JSON.stringify({ light, dark }, null, 2)
}

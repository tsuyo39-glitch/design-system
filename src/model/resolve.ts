import { isToken, type Group, type Token, type TokenDocument, type TokenType } from './dtcg'

export type Mode = 'light' | 'dark'

function getNode(doc: TokenDocument, path: string): Group | Token {
  let cursor: Group | Token = doc
  for (const key of path.split('.')) {
    if (isToken(cursor) || !(key in cursor)) {
      throw new Error(`トークンが見つかりません: ${path}`)
    }
    cursor = cursor[key] as Group | Token
  }
  return cursor
}

/** mode='dark' のとき $extensions['com.tokens.mode'].dark があればそれを優先、無ければ $value。 */
function pickValue(token: Token, mode: Mode): unknown {
  if (mode === 'dark') {
    const dark = token.$extensions?.['com.tokens.mode']?.dark
    if (dark !== undefined) return dark
  }
  return token.$value
}

/** {ref} 文字列・配列・オブジェクトを再帰的に辿り、実値まで解決する。循環参照はエラー。 */
function resolveDeep(value: unknown, doc: TokenDocument, mode: Mode, seen: readonly string[]): unknown {
  if (typeof value === 'string') {
    const match = value.match(/^\{(.+)\}$/)
    if (!match) return value

    const refPath = match[1]
    if (seen.includes(refPath)) {
      throw new Error(`循環参照を検出しました: ${[...seen, refPath].join(' -> ')}`)
    }

    const node = getNode(doc, refPath)
    if (!isToken(node)) {
      throw new Error(`グループは参照できません: {${refPath}}`)
    }
    return resolveDeep(pickValue(node, mode), doc, mode, [...seen, refPath])
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveDeep(item, doc, mode, seen))
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveDeep(v, doc, mode, seen)]))
  }

  return value
}

/** "{group.token}" 形式の参照文字列を実値まで解決する。 */
export function resolveRef(doc: TokenDocument, ref: string, mode: Mode = 'light'): unknown {
  return resolveDeep(ref, doc, mode, [])
}

/** ドット区切りパスのトークンを mode 解決込みで実値まで解決する。 */
export function resolveToken(doc: TokenDocument, path: string, mode: Mode = 'light'): unknown {
  const node = getNode(doc, path)
  if (!isToken(node)) {
    throw new Error(`グループは値を持ちません: ${path}`)
  }
  return resolveDeep(pickValue(node, mode), doc, mode, [path])
}

/** $type 未指定のトークンは最も近い親グループの $type を採用する。 */
export function resolveType(doc: TokenDocument, path: string): TokenType {
  let cursor: Group | Token = doc
  let inherited = doc.$type
  for (const key of path.split('.')) {
    if (isToken(cursor) || !(key in cursor)) {
      throw new Error(`トークンが見つかりません: ${path}`)
    }
    cursor = cursor[key] as Group | Token
    if (cursor.$type) inherited = cursor.$type
  }
  if (!inherited) {
    throw new Error(`$type が解決できません: ${path}`)
  }
  return inherited
}

/** パス上のトークンを（解決せず）そのまま取得する。エディタが宣言値・参照有無を見るために使う。 */
export function getToken(doc: TokenDocument, path: string): Token {
  const node = getNode(doc, path)
  if (!isToken(node)) {
    throw new Error(`グループはトークンではありません: ${path}`)
  }
  return node
}

/** パス上のトークンの $value を差し替えた新しいドキュメントを返す（イミュータブル）。 */
export function setTokenValue(doc: TokenDocument, path: string, value: unknown): TokenDocument {
  const keys = path.split('.')

  function recur(node: Group, index: number): Group {
    const key = keys[index]
    const child = node[key]
    if (typeof child !== 'object' || child === null) {
      throw new Error(`トークンが見つかりません: ${path}`)
    }

    if (index === keys.length - 1) {
      if (!isToken(child as Group | Token)) {
        throw new Error(`グループはトークンではありません: ${path}`)
      }
      return { ...node, [key]: { ...(child as Token), $value: value } }
    }

    if (isToken(child as Group | Token)) {
      throw new Error(`トークンが見つかりません: ${path}`)
    }
    return { ...node, [key]: recur(child as Group, index + 1) }
  }

  return recur(doc, 0)
}

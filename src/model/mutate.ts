import { defaultValueFor } from './defaults'
import { isMetaKey, isToken, type Group, type Token, type TokenDocument, type TokenType } from './dtcg'

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/** ドット区切りパスとして妥当か（空セグメント・メタキー・空文字を弾く）。 */
export function isValidPath(path: string): boolean {
  const segments = path.split('.')
  return segments.length > 0 && segments.every((s) => s.length > 0 && !isMetaKey(s))
}

/**
 * パスの位置に新しいトークンを挿入した新しいドキュメントを返す（イミュータブル）。
 * 中間グループは無ければ自動生成する。既存のパス、または途中がトークンなら throw。
 */
export function insertToken(doc: TokenDocument, path: string, type: TokenType): TokenDocument {
  if (!isValidPath(path)) {
    throw new Error(`不正なパスです: ${path}`)
  }
  const keys = path.split('.')

  function recur(node: Group, index: number): Group {
    const key = keys[index]
    const isLast = index === keys.length - 1

    if (isLast) {
      if (hasOwn(node, key)) {
        throw new Error(`すでに存在します: ${path}`)
      }
      const token: Token = { $value: defaultValueFor(type), $type: type }
      return { ...node, [key]: token }
    }

    const child = hasOwn(node, key) ? node[key] : undefined
    if (child === undefined) {
      return { ...node, [key]: recur({}, index + 1) }
    }
    if (typeof child !== 'object' || child === null || isToken(child as Group | Token)) {
      throw new Error(`途中がトークンなのでグループを作れません: ${path}`)
    }
    return { ...node, [key]: recur(child as Group, index + 1) }
  }

  return recur(doc, 0)
}

/** パスのノード（トークンまたはグループ）を削除した新しいドキュメントを返す。無ければ throw。 */
export function deleteNode(doc: TokenDocument, path: string): TokenDocument {
  const keys = path.split('.')

  function recur(node: Group, index: number): Group {
    const key = keys[index]
    if (!hasOwn(node, key)) {
      throw new Error(`見つかりません: ${path}`)
    }

    if (index === keys.length - 1) {
      const copy = { ...node }
      delete copy[key]
      return copy
    }

    const child = node[key]
    if (typeof child !== 'object' || child === null || isToken(child as Group | Token)) {
      throw new Error(`見つかりません: ${path}`)
    }
    return { ...node, [key]: recur(child as Group, index + 1) }
  }

  return recur(doc, 0)
}

/** 親オブジェクトの並び順を保ったまま、oldName のキーを newName に差し替える。 */
function renameKey(node: Group, parentKeys: string[], oldName: string, newName: string, depth: number): Group {
  if (depth === parentKeys.length) {
    if (!hasOwn(node, oldName)) {
      throw new Error(`見つかりません: ${oldName}`)
    }
    if (hasOwn(node, newName)) {
      throw new Error(`すでに存在します: ${newName}`)
    }
    const out: Group = {}
    for (const [k, v] of Object.entries(node)) {
      out[k === oldName ? newName : k] = v
    }
    return out
  }

  const key = parentKeys[depth]
  const child = hasOwn(node, key) ? node[key] : undefined
  if (typeof child !== 'object' || child === null || isToken(child as Group | Token)) {
    throw new Error(`見つかりません: ${parentKeys.slice(0, depth + 1).join('.')}`)
  }
  return { ...node, [key]: renameKey(child as Group, parentKeys, oldName, newName, depth + 1) }
}

/** ドキュメント全体を走査し、{oldPath} と {oldPath.配下} の参照を新パスに書き換える。 */
function rewriteRefs<T>(value: T, oldPath: string, newPath: string): T {
  if (typeof value === 'string') {
    const match = value.match(/^\{(.+)\}$/)
    if (!match) return value
    const p = match[1]
    let next = p
    if (p === oldPath) next = newPath
    else if (p.startsWith(`${oldPath}.`)) next = newPath + p.slice(oldPath.length)
    return `{${next}}` as unknown as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteRefs(item, oldPath, newPath)) as unknown as T
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, rewriteRefs(v, oldPath, newPath)]),
    ) as T
  }
  return value
}

/**
 * oldPath のノード（トークン/グループ）を同じ親の下で newName に改名した新ドキュメントを返す。
 * ノード自体のキー差し替えに加え、ドキュメント内の {oldPath}/{oldPath.配下} 参照も追従して書き換える。
 */
export function renameNode(doc: TokenDocument, oldPath: string, newName: string): TokenDocument {
  if (!isValidPath(newName) || newName.includes('.')) {
    throw new Error(`不正な名前です: ${newName}`)
  }
  const keys = oldPath.split('.')
  const oldName = keys[keys.length - 1]
  if (newName === oldName) return doc

  const parentKeys = keys.slice(0, -1)
  const newPath = [...parentKeys, newName].join('.')

  const renamed = renameKey(doc, parentKeys, oldName, newName, 0)
  return rewriteRefs(renamed, oldPath, newPath)
}

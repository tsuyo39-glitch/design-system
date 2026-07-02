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

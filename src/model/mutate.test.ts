import { describe, expect, it } from 'vitest'
import type { TokenDocument } from './dtcg'
import { deleteNode, insertToken, isValidPath, renameNode } from './mutate'
import { getToken, resolveToken, resolveType } from './resolve'

describe('isValidPath', () => {
  it('通常のドットパスを許可する', () => {
    expect(isValidPath('color.brand.primary')).toBe(true)
  })

  it('空セグメント・メタキー・空文字を弾く', () => {
    expect(isValidPath('color..brand')).toBe(false)
    expect(isValidPath('color.$type')).toBe(false)
    expect(isValidPath('')).toBe(false)
  })
})

describe('insertToken', () => {
  it('中間グループを自動生成して型付きトークンを挿入する', () => {
    const doc = insertToken({}, 'color.brand.primary', 'color')
    expect(getToken(doc, 'color.brand.primary').$value).toBe('#000000')
    expect(resolveType(doc, 'color.brand.primary')).toBe('color')
  })

  it('型ごとの初期値が入る', () => {
    expect(getToken(insertToken({}, 'x', 'dimension'), 'x').$value).toBe('0px')
    expect(getToken(insertToken({}, 'x', 'fontWeight'), 'x').$value).toBe(400)
  })

  it('既存のパスには挿入できない', () => {
    const doc: TokenDocument = { color: { $type: 'color', brand: { $value: '#000000' } } }
    expect(() => insertToken(doc, 'color.brand', 'color')).toThrow(/すでに存在/)
  })

  it('途中がトークンならグループを作れない', () => {
    const doc: TokenDocument = { color: { $type: 'color', brand: { $value: '#000000' } } }
    expect(() => insertToken(doc, 'color.brand.deeper', 'color')).toThrow(/トークン/)
  })

  it('既存ドキュメントはイミュータブルに保たれる', () => {
    const doc: TokenDocument = { color: { $type: 'color' } }
    insertToken(doc, 'color.brand', 'color')
    expect('brand' in (doc.color as object)).toBe(false)
  })
})

describe('deleteNode', () => {
  it('トークンを削除する', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', a: { $value: '#000' }, b: { $value: '#fff' } },
    }
    const updated = deleteNode(doc, 'color.a')
    expect('a' in (updated.color as object)).toBe(false)
    expect('b' in (updated.color as object)).toBe(true)
  })

  it('グループごと削除する', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', brand: { primary: { $value: '#000' } } },
      spacing: { $type: 'dimension' },
    }
    const updated = deleteNode(doc, 'color')
    expect('color' in updated).toBe(false)
    expect('spacing' in updated).toBe(true)
  })

  it('存在しないパスは投げる', () => {
    const doc: TokenDocument = { color: { $type: 'color' } }
    expect(() => deleteNode(doc, 'color.missing')).toThrow(/見つかりません/)
  })
})

describe('renameNode', () => {
  it('トークンを改名し、親の並び順を保つ', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', a: { $value: '#000' }, b: { $value: '#fff' }, c: { $value: '#111' } },
    }
    const updated = renameNode(doc, 'color.b', 'mid')
    expect(Object.keys(updated.color as object)).toEqual(['$type', 'a', 'mid', 'c'])
    expect(getToken(updated, 'color.mid').$value).toBe('#fff')
  })

  it('改名したトークンへの参照を追従して書き換える', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', indigo: { $value: '#6366F1' } },
      semantic: { action: { $value: '{color.indigo}', $type: 'color' } },
    }
    const updated = renameNode(doc, 'color.indigo', 'brand')
    expect(getToken(updated, 'semantic.action').$value).toBe('{color.brand}')
    expect(resolveToken(updated, 'semantic.action')).toBe('#6366F1')
  })

  it('グループ改名時は配下パスへの参照も prefix ごと書き換える', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', indigo: { 500: { $value: '#6366F1' } } },
      semantic: { action: { $value: '{color.indigo.500}', $type: 'color' } },
    }
    const updated = renameNode(doc, 'color.indigo', 'brand')
    expect(getToken(updated, 'semantic.action').$value).toBe('{color.brand.500}')
    expect(resolveToken(updated, 'semantic.action')).toBe('#6366F1')
  })

  it('$extensions の dark 参照も追従する', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', d: { $value: '#818CF8' } },
      semantic: {
        action: {
          $type: 'color',
          $value: '#000',
          $extensions: { 'com.tokens.mode': { dark: '{color.d}' } },
        },
      },
    }
    const updated = renameNode(doc, 'color.d', 'dark400')
    expect(resolveToken(updated, 'semantic.action', 'dark')).toBe('#818CF8')
  })

  it('既存の名前へは改名できない', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', a: { $value: '#000' }, b: { $value: '#fff' } },
    }
    expect(() => renameNode(doc, 'color.a', 'b')).toThrow(/すでに存在/)
  })

  it('不正な名前（ドット・メタキー）は投げる', () => {
    const doc: TokenDocument = { color: { $type: 'color', a: { $value: '#000' } } }
    expect(() => renameNode(doc, 'color.a', 'x.y')).toThrow(/不正な名前/)
    expect(() => renameNode(doc, 'color.a', '$type')).toThrow(/不正な名前/)
  })

  it('同名への改名は no-op', () => {
    const doc: TokenDocument = { color: { $type: 'color', a: { $value: '#000' } } }
    expect(renameNode(doc, 'color.a', 'a')).toBe(doc)
  })
})

import { describe, expect, it } from 'vitest'
import type { TokenDocument } from './dtcg'
import { deleteNode, insertToken, isValidPath } from './mutate'
import { getToken, resolveType } from './resolve'

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

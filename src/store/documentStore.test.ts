import { beforeEach, describe, expect, it } from 'vitest'
import { useDocumentStore } from './documentStore'

describe('useDocumentStore', () => {
  beforeEach(() => {
    useDocumentStore.getState().loadSample()
  })

  it('起動時はサンプルドキュメント（design-system/tokens.json）を読み込んでいる', () => {
    const doc = useDocumentStore.getState().document
    expect(doc).toHaveProperty('semantic')
    expect(doc).toHaveProperty('color')
  })

  it('newDocument() で空のドキュメントになる', () => {
    useDocumentStore.getState().newDocument()
    expect(useDocumentStore.getState().document).toEqual({})
  })

  it('importDocument() で渡した JSON がドキュメントになる', () => {
    useDocumentStore.getState().importDocument('{"color":{"$type":"color","brand":{"$value":"#000000"}}}')
    expect(useDocumentStore.getState().document).toEqual({
      color: { $type: 'color', brand: { $value: '#000000' } },
    })
  })

  it('importDocument() に不正な JSON を渡すとエラーを投げ、ドキュメントは変わらない', () => {
    const before = useDocumentStore.getState().document
    expect(() => useDocumentStore.getState().importDocument('{不正')).toThrow()
    expect(useDocumentStore.getState().document).toBe(before)
  })

  it('select() で選択中のパスをストアに保持する', () => {
    useDocumentStore.getState().select('semantic.color.action.default')
    expect(useDocumentStore.getState().selectedPath).toBe('semantic.color.action.default')
    useDocumentStore.getState().select(null)
    expect(useDocumentStore.getState().selectedPath).toBeNull()
  })

  it('newDocument() / importDocument() / loadSample() で選択状態がリセットされる', () => {
    useDocumentStore.getState().select('color')
    useDocumentStore.getState().newDocument()
    expect(useDocumentStore.getState().selectedPath).toBeNull()

    useDocumentStore.getState().select('color')
    useDocumentStore.getState().importDocument('{}')
    expect(useDocumentStore.getState().selectedPath).toBeNull()

    useDocumentStore.getState().select('color')
    useDocumentStore.getState().loadSample()
    expect(useDocumentStore.getState().selectedPath).toBeNull()
  })
})

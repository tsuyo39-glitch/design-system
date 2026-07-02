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

  it('setValue() で該当トークンの $value だけを更新する', () => {
    useDocumentStore.getState().setValue('color.neutral.0', '#FF0000')
    const doc = useDocumentStore.getState().document as {
      color: { neutral: { 0: { $value: string }; 50: { $value: string } } }
    }
    expect(doc.color.neutral[0].$value).toBe('#FF0000')
    expect(doc.color.neutral[50].$value).toBe('#F7F8FA')
  })

  it('addToken() でトークンを追加し、そのパスを選択状態にする', () => {
    useDocumentStore.getState().newDocument()
    useDocumentStore.getState().addToken('color.brand', 'color')
    const state = useDocumentStore.getState()
    expect(state.selectedPath).toBe('color.brand')
    const doc = state.document as { color: { brand: { $value: string } } }
    expect(doc.color.brand.$value).toBe('#000000')
  })

  it('removeNode() で削除し、その子孫を選択中だったら選択を外す', () => {
    useDocumentStore.getState().newDocument()
    useDocumentStore.getState().addToken('color.brand', 'color')
    expect(useDocumentStore.getState().selectedPath).toBe('color.brand')

    useDocumentStore.getState().removeNode('color')
    const state = useDocumentStore.getState()
    expect('color' in state.document).toBe(false)
    expect(state.selectedPath).toBeNull()
  })

  it('removeNode() で無関係なトークンを消しても選択は保持される', () => {
    useDocumentStore.getState().newDocument()
    useDocumentStore.getState().addToken('color.a', 'color')
    useDocumentStore.getState().addToken('color.b', 'color')
    useDocumentStore.getState().select('color.a')

    useDocumentStore.getState().removeNode('color.b')
    expect(useDocumentStore.getState().selectedPath).toBe('color.a')
  })
})

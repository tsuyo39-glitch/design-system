import { beforeEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, useDocumentStore } from './documentStore'

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

  it('rename() で改名し、選択中パスを新パスへ付け替える', () => {
    useDocumentStore.getState().newDocument()
    useDocumentStore.getState().addToken('color.brand', 'color')
    useDocumentStore.getState().select('color.brand')

    useDocumentStore.getState().rename('color.brand', 'primary')
    const state = useDocumentStore.getState()
    expect(state.selectedPath).toBe('color.primary')
    const doc = state.document as { color: { primary: { $value: string } } }
    expect(doc.color.primary.$value).toBe('#000000')
  })

  it('rename() でグループを改名すると、選択中の子孫パスも付け替わる', () => {
    useDocumentStore.getState().newDocument()
    useDocumentStore.getState().addToken('color.indigo.500', 'color')
    useDocumentStore.getState().select('color.indigo.500')

    useDocumentStore.getState().rename('color.indigo', 'brand')
    expect(useDocumentStore.getState().selectedPath).toBe('color.brand.500')
  })
})

describe('useDocumentStore の Undo/Redo', () => {
  beforeEach(() => {
    // 履歴も含めてクリーンな状態から始める。
    useDocumentStore.setState({ document: {}, selectedPath: null, past: [], future: [], lastEditPath: null })
  })

  const valueAt = (path: string): unknown => {
    const doc = useDocumentStore.getState().document as Record<string, Record<string, { $value: unknown }>>
    const [g, k] = path.split('.')
    return doc[g]?.[k]?.$value
  }

  it('undo で直前の変更を取り消し、redo でやり直す', () => {
    const s = useDocumentStore.getState()
    s.addToken('color.a', 'color')
    useDocumentStore.getState().setValue('color.a', '#111111')
    expect(valueAt('color.a')).toBe('#111111')

    useDocumentStore.getState().undo()
    expect(valueAt('color.a')).toBe('#000000')

    useDocumentStore.getState().redo()
    expect(valueAt('color.a')).toBe('#111111')
  })

  it('同一パスの連続編集（ドラッグ相当）は1回の undo でまとめて戻る', () => {
    useDocumentStore.getState().addToken('color.a', 'color')
    useDocumentStore.getState().select('color.a') // coalesce の区切り
    useDocumentStore.getState().setValue('color.a', '#111111')
    useDocumentStore.getState().setValue('color.a', '#222222')
    useDocumentStore.getState().setValue('color.a', '#333333')
    expect(valueAt('color.a')).toBe('#333333')

    useDocumentStore.getState().undo()
    // 3回の setValue が1履歴にまとまり、一気に編集前へ戻る
    expect(valueAt('color.a')).toBe('#000000')
  })

  it('別パスへ移ってからの編集は別履歴になる', () => {
    useDocumentStore.getState().addToken('color.a', 'color')
    useDocumentStore.getState().addToken('color.b', 'color')
    useDocumentStore.getState().setValue('color.a', '#111111')
    useDocumentStore.getState().setValue('color.b', '#222222')

    useDocumentStore.getState().undo()
    expect(valueAt('color.b')).toBe('#000000')
    expect(valueAt('color.a')).toBe('#111111')
  })

  it('undo で存在しなくなるトークンを選択中なら選択を外す', () => {
    useDocumentStore.getState().addToken('color.a', 'color')
    useDocumentStore.getState().select('color.a')
    useDocumentStore.getState().undo() // addToken を取り消し → color.a が消える
    expect(useDocumentStore.getState().selectedPath).toBeNull()
    expect('color' in useDocumentStore.getState().document).toBe(false)
  })

  it('新しい編集をすると redo 履歴は捨てられる', () => {
    useDocumentStore.getState().addToken('color.a', 'color')
    useDocumentStore.getState().setValue('color.a', '#111111')
    useDocumentStore.getState().undo()
    useDocumentStore.getState().setValue('color.a', '#999999')
    expect(useDocumentStore.getState().future.length).toBe(0)
    useDocumentStore.getState().redo()
    expect(valueAt('color.a')).toBe('#999999') // redo は効かない
  })
})

describe('useDocumentStore の永続化', () => {
  const readStored = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { state: { document: unknown } }) : null
  }

  it('編集すると localStorage に document が保存される（選択状態は保存しない）', () => {
    useDocumentStore.getState().newDocument()
    useDocumentStore.getState().addToken('color.brand', 'color')
    useDocumentStore.getState().select('color.brand')

    const stored = readStored()!
    expect(stored.state.document).toEqual({ color: { brand: { $value: '#000000', $type: 'color' } } })
    expect(stored.state).not.toHaveProperty('selectedPath')
  })

  it('localStorage の内容から rehydrate で復元される', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { document: { spacing: { $type: 'dimension', 4: { $value: '16px' } } } }, version: 1 }),
    )
    await useDocumentStore.persist.rehydrate()
    expect(useDocumentStore.getState().document).toEqual({
      spacing: { $type: 'dimension', 4: { $value: '16px' } },
    })
  })

  it('壊れた保存値（配列）は無視して現在のドキュメントを保つ', async () => {
    useDocumentStore.getState().loadSample()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { document: [] }, version: 1 }))
    await useDocumentStore.persist.rehydrate()
    expect(Array.isArray(useDocumentStore.getState().document)).toBe(false)
    expect(useDocumentStore.getState().document).toHaveProperty('semantic')
  })
})

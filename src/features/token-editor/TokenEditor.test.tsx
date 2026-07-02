import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDocumentStore } from '../../store/documentStore'
import { TokenEditor } from './TokenEditor'

describe('TokenEditor', () => {
  beforeEach(() => {
    useDocumentStore.getState().loadSample()
  })

  it('未選択のときは案内文を表示する', () => {
    render(<TokenEditor />)
    expect(screen.getByText('左のトークン一覧から選択してください。')).toBeInTheDocument()
  })

  it('color トークンを選択すると HEX 入力とカラーピッカーを表示する', () => {
    useDocumentStore.getState().select('color.neutral.0')
    render(<TokenEditor />)
    const hexInput = screen.getByLabelText('HEX値')
    expect(hexInput).toBeInTheDocument()
  })

  it('HEX 入力を変更するとストアの $value が更新される', () => {
    useDocumentStore.getState().select('color.neutral.0')
    render(<TokenEditor />)
    const hexInput = screen.getByLabelText('HEX値')
    fireEvent.change(hexInput, { target: { value: '#123456' } })

    const doc = useDocumentStore.getState().document as {
      color: { neutral: { 0: { $value: string } } }
    }
    expect(doc.color.neutral[0].$value).toBe('#123456')
  })

  it('fontWeight トークンは select 入力で編集できる', () => {
    useDocumentStore.getState().select('fontWeight.medium')
    render(<TokenEditor />)
    const select = screen.getByDisplayValue('500')
    fireEvent.change(select, { target: { value: '600' } })

    const doc = useDocumentStore.getState().document as {
      fontWeight: { medium: { $value: number } }
    }
    expect(doc.fontWeight.medium.$value).toBe(600)
  })

  it('参照トークンは参照パス入力を表示する（参照チェックボックスがオン）', () => {
    useDocumentStore.getState().select('semantic.color.action.default')
    render(<TokenEditor />)
    const checkbox = screen.getByRole('checkbox', { name: '参照として指定する' })
    expect(checkbox).toBeChecked()
    expect(screen.getByDisplayValue('color.indigo.500')).toBeInTheDocument()
  })

  it('参照チェックボックスを外すと型に応じたリテラルのデフォルト値になる', () => {
    useDocumentStore.getState().select('semantic.color.action.default')
    render(<TokenEditor />)
    const checkbox = screen.getByRole('checkbox', { name: '参照として指定する' })
    fireEvent.click(checkbox)

    const doc = useDocumentStore.getState().document as {
      semantic: { color: { action: { default: { $value: string } } } }
    }
    expect(doc.semantic.color.action.default.$value).toBe('#000000')
  })
})

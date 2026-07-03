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

  it('color トークンを選択すると HEX 入力と色相環を表示する', () => {
    useDocumentStore.getState().select('color.neutral.0')
    render(<TokenEditor />)
    expect(screen.getByLabelText('HEX値')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: '色相' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: '彩度と明度' })).toBeInTheDocument()
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

  it('typography トークンは raw JSON ではなくサブキーごとのフィールドで編集できる', () => {
    useDocumentStore.getState().select('typography.body')
    render(<TokenEditor />)
    // サブキーがラベルとして並ぶ（raw JSON textarea ではない）
    expect(screen.getByText('fontFamily')).toBeInTheDocument()
    expect(screen.getByText('fontSize')).toBeInTheDocument()

    const fontSize = screen.getByDisplayValue('{fontSize.base}')
    fireEvent.change(fontSize, { target: { value: '{fontSize.md}' } })
    const doc = useDocumentStore.getState().document as {
      typography: { body: { $value: { fontSize: string; fontWeight: string } } }
    }
    expect(doc.typography.body.$value.fontSize).toBe('{fontSize.md}')
    // 他のサブキーは保持される
    expect(doc.typography.body.$value.fontWeight).toBe('{fontWeight.regular}')
  })

  it('shadow トークンの数値でないサブキー（色・寸法）は文字列のまま保持される', () => {
    useDocumentStore.getState().select('shadow.sm')
    render(<TokenEditor />)
    const offsetY = screen.getByDisplayValue('1px')
    fireEvent.change(offsetY, { target: { value: '2px' } })
    const doc = useDocumentStore.getState().document as {
      shadow: { sm: { $value: { offsetY: string; color: string } } }
    }
    expect(doc.shadow.sm.$value.offsetY).toBe('2px')
    expect(doc.shadow.sm.$value.color).toBe('#0000000F')
  })

  it('cubicBezier トークンは 4 つの数値入力で編集できる', () => {
    useDocumentStore.getState().select('easing.standard')
    render(<TokenEditor />)
    const x1 = screen.getByDisplayValue('0.16')
    fireEvent.change(x1, { target: { value: '0.25' } })
    const doc = useDocumentStore.getState().document as {
      easing: { standard: { $value: number[] } }
    }
    expect(doc.easing.standard.$value).toEqual([0.25, 1, 0.3, 1])
  })

  it('参照先が存在しないトークンは、エディタに未解決の警告を出す', () => {
    useDocumentStore.getState().importDocument(
      JSON.stringify({ color: { $type: 'color', a: { $value: '{color.zzz}' } } }),
    )
    useDocumentStore.getState().select('color.a')
    render(<TokenEditor />)
    expect(screen.getByText(/未解決の参照/)).toBeInTheDocument()
  })

  it('壊れた参照を有効な参照に直すと警告が消える', () => {
    useDocumentStore.getState().importDocument(
      JSON.stringify({
        color: { $type: 'color', ok: { $value: '#123456' }, a: { $value: '{color.zzz}' } },
      }),
    )
    useDocumentStore.getState().select('color.a')
    const { rerender } = render(<TokenEditor />)
    expect(screen.getByText(/未解決の参照/)).toBeInTheDocument()

    fireEvent.change(screen.getByDisplayValue('color.zzz'), { target: { value: 'color.ok' } })
    rerender(<TokenEditor />)
    expect(screen.queryByText(/未解決の参照/)).not.toBeInTheDocument()
  })
})

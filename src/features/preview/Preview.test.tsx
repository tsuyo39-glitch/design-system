import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDocumentStore } from '../../store/documentStore'
import { Preview } from './Preview'

describe('Preview', () => {
  beforeEach(() => {
    useDocumentStore.getState().loadSample()
  })

  it('light mode で component.button.primary の色を解決して描画する', () => {
    render(<Preview mode="light" />)
    const button = screen.getByRole('button', { name: 'Default' })
    expect(button).toHaveStyle({ backgroundColor: '#6366F1' })
  })

  it('mode="dark" のとき action.default の dark 上書き色で描画する', () => {
    render(<Preview mode="dark" />)
    const button = screen.getByRole('button', { name: 'Default' })
    expect(button).toHaveStyle({ backgroundColor: '#818CF8' })
  })

  it('ストアで参照先の値を変更すると、参照しているボタンの色に即反映される（受け入れ基準）', () => {
    useDocumentStore.getState().setValue('color.indigo.500', '#00FF00')
    render(<Preview mode="light" />)
    const button = screen.getByRole('button', { name: 'Default' })
    expect(button).toHaveStyle({ backgroundColor: '#00FF00' })
  })

  it('ステータススウォッチを表示する', () => {
    render(<Preview mode="light" />)
    expect(screen.getByText('success')).toBeInTheDocument()
    expect(screen.getByText('error')).toBeInTheDocument()
  })
})

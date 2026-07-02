import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useDocumentStore } from '../../store/documentStore'
import { TokenList } from './TokenList'

describe('TokenList', () => {
  beforeEach(() => {
    useDocumentStore.getState().loadSample()
  })

  it('グループ階層と型バッジ・値を表示する', () => {
    render(<TokenList />)
    expect(screen.getByText('spacing', { selector: 'div' })).toBeInTheDocument()
    expect(screen.getByText('semantic', { selector: 'div' })).toBeInTheDocument()
    expect(screen.getAllByText('color', { selector: 'span' }).length).toBeGreaterThan(0)
  })

  it('トークン行をクリックするとストアの選択状態が更新される', () => {
    render(<TokenList />)
    fireEvent.click(screen.getByText('mono'))
    expect(useDocumentStore.getState().selectedPath).toBe('fontFamily.mono')
  })

  it('選択中の行は aria-pressed が true になる', () => {
    render(<TokenList />)
    const row = screen.getByText('mono').closest('button')
    expect(row).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(row!)
    expect(row).toHaveAttribute('aria-pressed', 'true')
  })
})

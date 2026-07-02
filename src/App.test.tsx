import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('起動する空箱として描画される', () => {
    render(<App />)
    expect(screen.getByText('ds-builder')).toBeInTheDocument()
  })
})

import { describe, expect, it } from 'vitest'
import { designToCss, designToJson, type Design } from './designExport'

const design: Design = {
  color: { base: '#7FA8D9', main: '#2E6FD0', accent: '#D0902E' },
  font: { heading: 'Inter, sans-serif', body: 'Georgia, serif', baseSize: 16 },
  layout: { spacing: 16, radius: 8 },
}

describe('designToCss', () => {
  it('3タブの値を CSS カスタムプロパティにする', () => {
    const css = designToCss(design)
    expect(css).toContain('--color-base: #7FA8D9;')
    expect(css).toContain('--color-accent: #D0902E;')
    expect(css).toContain('--font-heading: Inter, sans-serif;')
    expect(css).toContain('--font-size-base: 16px;')
    expect(css).toContain('--spacing: 16px;')
    expect(css).toContain('--radius: 8px;')
  })
})

describe('designToJson', () => {
  it('色・フォント・レイアウトを JSON にする（px 付き）', () => {
    const json = JSON.parse(designToJson(design))
    expect(json.color.main).toBe('#2E6FD0')
    expect(json.font.baseSize).toBe('16px')
    expect(json.layout.radius).toBe('8px')
  })
})

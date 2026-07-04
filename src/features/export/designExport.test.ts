import { describe, expect, it } from 'vitest'
import type { DesignSpec } from '../../model/templates'
import { designToCss, designToJson } from './designExport'

const spec: DesignSpec = {
  colors: { background: '#FFFFFF', surface: '#F7F8FA', primary: '#111827', accent: '#6366F1', text: '#111827' },
  fonts: { heading: 'Inter, sans-serif', body: 'Georgia, serif' },
  sizeBase: 16,
  spacing: 20,
  radius: 8,
}

describe('designToCss', () => {
  it('デザインを CSS カスタムプロパティにする', () => {
    const css = designToCss(spec)
    expect(css).toContain('--color-background: #FFFFFF;')
    expect(css).toContain('--color-primary: #111827;')
    expect(css).toContain('--color-accent: #6366F1;')
    expect(css).toContain('--font-heading: Inter, sans-serif;')
    expect(css).toContain('--font-size-base: 16px;')
    expect(css).toContain('--spacing: 20px;')
    expect(css).toContain('--radius: 8px;')
  })
})

describe('designToJson', () => {
  it('色・フォント・寸法を JSON にする（px 付き）', () => {
    const json = JSON.parse(designToJson(spec))
    expect(json.colors.primary).toBe('#111827')
    expect(json.fonts.body).toBe('Georgia, serif')
    expect(json.sizeBase).toBe('16px')
    expect(json.radius).toBe('8px')
  })
})

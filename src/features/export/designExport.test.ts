import { describe, expect, it } from 'vitest'
import type { DesignSpec } from '../../model/templates'
import { designToCss, designToJson, designToMarkdown } from './designExport'

const spec: DesignSpec = {
  colors: { background: '#FFFFFF', surface: '#F7F8FA', primary: '#111827', accent: '#6366F1', text: '#111827' },
  fonts: { heading: 'Inter, sans-serif', body: 'Georgia, serif' },
  sizeBase: 16,
  spacing: 20,
  radius: 8,
}

describe('designToCss', () => {
  it('派生した意味的トークンを CSS カスタムプロパティにする', () => {
    const css = designToCss(spec)
    expect(css).toContain('--color-background: #FFFFFF;')
    expect(css).toContain('--color-primary: #111827;')
    expect(css).toContain('--color-accent: #6366F1;')
    // 派生トークンも含む
    expect(css).toContain('--color-text-muted:')
    expect(css).toContain('--color-on-primary:')
    expect(css).toContain('--color-primary-subtle:')
    expect(css).toContain('--text-display:')
    expect(css).toContain('--spacing: 20px;')
    expect(css).toContain('--radius: 8px;')
  })
})

describe('designToJson', () => {
  it('色・タイポ・寸法を JSON にする（派生トークン込み）', () => {
    const json = JSON.parse(designToJson(spec))
    expect(json.colors.primary).toBe('#111827')
    expect(json.colors.onPrimary).toBeDefined()
    expect(json.typography.body).toBe('Georgia, serif')
    expect(json.typography.display).toMatch(/px$/)
    expect(json.radius).toBe('8px')
  })
})

describe('designToMarkdown', () => {
  it('値と使い方のルールを持つ仕様書になる', () => {
    const md = designToMarkdown(spec)
    expect(md).toContain('# デザイン仕様')
    // トークンの値と CSS 変数名が表に載る
    expect(md).toContain('`--color-primary`')
    expect(md).toContain('`#111827`')
    // 使い方の原則（自然言語のルール）が含まれる
    expect(md).toContain('使い方の原則')
    expect(md).toContain('primary は主役')
    // タイポ・寸法も記載
    expect(md).toContain('20px')
    expect(md).toContain('見出しフォント')
  })
})

import { describe, expect, it } from 'vitest'
import { DEFAULT_TEMPLATE, FONT_CHOICES, TEMPLATES } from './templates'

const HEX = /^#[0-9A-Fa-f]{6}$/

describe('TEMPLATES', () => {
  it('id が一意で、必要な色がすべて有効な HEX', () => {
    const ids = TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of TEMPLATES) {
      for (const key of ['background', 'surface', 'primary', 'accent', 'text'] as const) {
        expect(t.spec.colors[key], `${t.id}.${key}`).toMatch(HEX)
      }
      expect(t.spec.sizeBase).toBeGreaterThan(0)
      expect(t.spec.fonts.heading.length).toBeGreaterThan(0)
    }
  })

  it('各テンプレートのフォントは FONT_CHOICES のいずれか', () => {
    const values = new Set(FONT_CHOICES.map((c) => c.value))
    for (const t of TEMPLATES) {
      expect(values.has(t.spec.fonts.heading), `${t.id} heading`).toBe(true)
      expect(values.has(t.spec.fonts.body), `${t.id} body`).toBe(true)
    }
  })

  it('DEFAULT_TEMPLATE は TEMPLATES の先頭', () => {
    expect(DEFAULT_TEMPLATE).toBe(TEMPLATES[0])
  })
})

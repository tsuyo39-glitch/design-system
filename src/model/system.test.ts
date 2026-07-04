import { describe, expect, it } from 'vitest'
import { darken, deriveSystem, mix } from './system'
import type { DesignSpec } from './templates'

const spec: DesignSpec = {
  colors: { background: '#FFFFFF', surface: '#F7F8FA', primary: '#3B82F6', accent: '#F59E0B', text: '#111827' },
  fonts: { heading: 'serif', body: 'sans-serif' },
  sizeBase: 16,
  spacing: 20,
  radius: 8,
}

describe('mix', () => {
  it('t=0 で a、t=1 で b', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000')
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF')
  })
  it('中間で平均色になる', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080')
  })
})

describe('darken', () => {
  it('明度を下げる', () => {
    expect(darken('#FFFFFF', 0.2)).toBe('#CCCCCC')
  })
})

describe('deriveSystem', () => {
  const sys = deriveSystem(spec)

  it('元の色をそのまま持ち、派生トークンを追加する', () => {
    expect(sys.colors.background).toBe('#FFFFFF')
    expect(sys.colors.primary).toBe('#3B82F6')
    // ミュート文字は本文と背景の中間なので、本文より薄い
    expect(sys.colors.textMuted).not.toBe(sys.colors.text)
    // primary の上の文字色は白（青は暗い）
    expect(sys.colors.onPrimary).toBe('#FFFFFF')
  })

  it('sizeBase からタイポスケールを作る', () => {
    expect(sys.type.body).toBe(16)
    expect(sys.type.display).toBe(42) // 16 * 2.6
    expect(sys.type.caption).toBe(13) // 16 * 0.82
  })
})

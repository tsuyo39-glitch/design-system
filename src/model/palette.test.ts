import { describe, expect, it } from 'vitest'
import { parseHexColor } from './color'
import { deriveAccent, deriveMain, readableTextOn } from './palette'

describe('deriveMain', () => {
  it('ベースより彩度が高いメインを作り、色相は保つ', () => {
    const base = '#9DB4D6' // くすんだ青
    const main = deriveMain(base)
    const b = parseHexColor(base)!.hsv
    const m = parseHexColor(main)!.hsv
    expect(m.s).toBeGreaterThan(b.s)
    expect(Math.abs(m.h - b.h)).toBeLessThan(1) // 色相はほぼ同じ
  })

  it('不正な値はそのまま返す', () => {
    expect(deriveMain('{ref}')).toBe('{ref}')
  })
})

describe('deriveAccent', () => {
  it('メインの補色（色相 +180°）を返す', () => {
    const main = '#2266CC'
    const accent = deriveAccent(main)
    const m = parseHexColor(main)!.hsv
    const a = parseHexColor(accent)!.hsv
    expect(Math.round((a.h - m.h + 360) % 360)).toBe(180)
  })
})

describe('readableTextOn', () => {
  it('明るい背景には濃い文字、暗い背景には白文字', () => {
    expect(readableTextOn('#FFFFFF')).toBe('#111111')
    expect(readableTextOn('#0E1015')).toBe('#FFFFFF')
  })
})

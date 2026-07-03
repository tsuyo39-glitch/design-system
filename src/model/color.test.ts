import { describe, expect, it } from 'vitest'
import { hsvToHex, parseHexColor } from './color'

describe('parseHexColor', () => {
  it('原色を正しい色相に分解する', () => {
    expect(parseHexColor('#FF0000')!.hsv).toEqual({ h: 0, s: 1, v: 1 })
    expect(parseHexColor('#00FF00')!.hsv).toEqual({ h: 120, s: 1, v: 1 })
    expect(parseHexColor('#0000FF')!.hsv).toEqual({ h: 240, s: 1, v: 1 })
  })

  it('白・黒は彩度/明度で表現される', () => {
    expect(parseHexColor('#FFFFFF')!.hsv).toEqual({ h: 0, s: 0, v: 1 })
    expect(parseHexColor('#000000')!.hsv).toEqual({ h: 0, s: 0, v: 0 })
  })

  it('#RRGGBBAA のアルファ部を分離して保持する', () => {
    const parsed = parseHexColor('#ff00007f')!
    expect(parsed.hsv.h).toBe(0)
    expect(parsed.alpha).toBe('7F')
  })

  it('対応形式でない文字列は null', () => {
    expect(parseHexColor('red')).toBeNull()
    expect(parseHexColor('#FFF')).toBeNull()
    expect(parseHexColor('{color.brand}')).toBeNull()
  })
})

describe('hsvToHex', () => {
  it('HSV を大文字 HEX にする', () => {
    expect(hsvToHex({ h: 0, s: 1, v: 1 })).toBe('#FF0000')
    expect(hsvToHex({ h: 240, s: 1, v: 1 })).toBe('#0000FF')
    expect(hsvToHex({ h: 0, s: 0, v: 1 })).toBe('#FFFFFF')
  })

  it('parseHexColor と往復して同じ HEX に戻る', () => {
    for (const hex of ['#6366F1', '#818CF8', '#F59E0B', '#22C55E', '#171A21', '#9AA2B1']) {
      expect(hsvToHex(parseHexColor(hex)!.hsv)).toBe(hex)
    }
  })
})

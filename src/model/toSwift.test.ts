import { describe, expect, it } from 'vitest'
import type { TokenDocument } from './dtcg'
import { toSwift } from './toSwift'

describe('toSwift', () => {
  it('color トークンを SwiftUI Color 拡張にする', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', white: { $value: '#FFFFFF' } },
    }
    const out = toSwift(doc)
    expect(out).toContain('import SwiftUI')
    expect(out).toContain('public extension Color {')
    expect(out).toContain('static let colorWhite = Color(red: 1, green: 1, blue: 1, opacity: 1)')
  })

  it('パスを lowerCamelCase の識別子にし、参照色は解決した値で出す', () => {
    const doc: TokenDocument = {
      color: {
        $type: 'color',
        indigo: { 500: { $value: '#6366F1' } },
      },
      semantic: { action: { $value: '{color.indigo.500}', $type: 'color' } },
    }
    const out = toSwift(doc)
    expect(out).toContain('static let colorIndigo500 = Color(')
    // semantic.action は参照先の値で出る
    expect(out).toMatch(/static let semanticAction = Color\(red: 0\.388/)
  })

  it('color 以外の型・非 HEX 値は対象外', () => {
    const doc: TokenDocument = {
      spacing: { $type: 'dimension', 4: { $value: '16px' } },
      color: { $type: 'color', named: { $value: 'transparent' } },
    }
    const out = toSwift(doc)
    expect(out).not.toContain('spacing')
    expect(out).not.toContain('transparent')
  })

  it('#RRGGBBAA のアルファを opacity に反映する', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', half: { $value: '#000000FF' } },
    }
    expect(toSwift(doc)).toContain('opacity: 1)')
    const doc2: TokenDocument = {
      color: { $type: 'color', half: { $value: '#00000000' } },
    }
    expect(toSwift(doc2)).toContain('opacity: 0)')
  })
})

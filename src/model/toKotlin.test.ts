import { describe, expect, it } from 'vitest'
import type { TokenDocument } from './dtcg'
import { toKotlin } from './toKotlin'

describe('toKotlin', () => {
  it('color トークンを Compose Color(0xAARRGGBB) 定数にする', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', indigo: { 500: { $value: '#6366F1' } } },
    }
    const out = toKotlin(doc)
    expect(out).toContain('import androidx.compose.ui.graphics.Color')
    expect(out).toContain('object DesignTokens {')
    expect(out).toContain('val colorIndigo500 = Color(0xFF6366F1)')
  })

  it('参照色は解決した値で出す', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', indigo: { 500: { $value: '#6366F1' } } },
      semantic: { action: { $value: '{color.indigo.500}', $type: 'color' } },
    }
    expect(toKotlin(doc)).toContain('val semanticAction = Color(0xFF6366F1)')
  })

  it('#RRGGBBAA のアルファを先頭（AA）に置く', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', a: { $value: '#12345680' } },
    }
    expect(toKotlin(doc)).toContain('val colorA = Color(0x80123456)')
  })

  it('color 以外の型・非 HEX 値は対象外', () => {
    const doc: TokenDocument = {
      spacing: { $type: 'dimension', 4: { $value: '16px' } },
      color: { $type: 'color', named: { $value: 'transparent' } },
    }
    const out = toKotlin(doc)
    expect(out).not.toContain('spacing')
    expect(out).not.toContain('transparent')
  })
})

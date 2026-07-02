import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { TokenDocument } from './dtcg'
import { resolveRef, resolveToken, resolveType } from './resolve'

describe('resolveToken', () => {
  it('参照を辿らず $value をそのまま返す', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', brand: { $value: '#6366F1' } },
    }
    expect(resolveToken(doc, 'color.brand')).toBe('#6366F1')
  })

  it('{ref} を辿って実値まで解決する（多段参照も可）', () => {
    const doc: TokenDocument = {
      color: {
        $type: 'color',
        indigo: { 500: { $value: '#6366F1' } },
      },
      semantic: {
        action: { $value: '{color.indigo.500}', $type: 'color' },
      },
      alias: { $value: '{semantic.action}', $type: 'color' },
    }
    expect(resolveToken(doc, 'alias')).toBe('#6366F1')
  })

  it('mode="dark" のとき $extensions の dark 上書きを優先する', () => {
    const doc: TokenDocument = {
      color: {
        $type: 'color',
        indigo: { 400: { $value: '#818CF8' }, 500: { $value: '#6366F1' } },
      },
      semantic: {
        action: {
          $type: 'color',
          $value: '{color.indigo.500}',
          $extensions: { 'com.tokens.mode': { dark: '{color.indigo.400}' } },
        },
      },
    }
    expect(resolveToken(doc, 'semantic.action', 'light')).toBe('#6366F1')
    expect(resolveToken(doc, 'semantic.action', 'dark')).toBe('#818CF8')
  })

  it('dark 上書きが無ければ mode="dark" でも $value にフォールバックする', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', muted: { $value: '#6B7280' } },
    }
    expect(resolveToken(doc, 'color.muted', 'dark')).toBe('#6B7280')
  })

  it('参照を経由しても dark 上書きの解決が伝播する', () => {
    const doc: TokenDocument = {
      color: {
        $type: 'color',
        indigo: { 400: { $value: '#818CF8' }, 500: { $value: '#6366F1' } },
      },
      semantic: {
        $type: 'color',
        action: {
          $value: '{color.indigo.500}',
          $extensions: { 'com.tokens.mode': { dark: '{color.indigo.400}' } },
        },
      },
      component: {
        buttonBackground: { $value: '{semantic.action}', $type: 'color' },
      },
    }
    expect(resolveToken(doc, 'component.buttonBackground', 'dark')).toBe('#818CF8')
  })

  it('循環参照はエラーを投げる', () => {
    const doc: TokenDocument = {
      a: { $value: '{b}', $type: 'color' },
      b: { $value: '{a}', $type: 'color' },
    }
    expect(() => resolveToken(doc, 'a')).toThrow(/循環参照/)
  })

  it('Group を直接 resolveToken すると投げる', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', brand: { $value: '#6366F1' } },
    }
    expect(() => resolveToken(doc, 'color')).toThrow()
  })
})

describe('resolveRef', () => {
  it('"{group.token}" 形式の参照文字列を実値まで解決する', () => {
    const doc: TokenDocument = {
      color: { $type: 'color', brand: { $value: '#6366F1' } },
    }
    expect(resolveRef(doc, '{color.brand}')).toBe('#6366F1')
  })
})

describe('resolveType', () => {
  it('$type 未指定のトークンは最も近い親グループの $type を継承する', () => {
    const doc: TokenDocument = {
      spacing: { $type: 'dimension', 4: { $value: '16px' } },
    }
    expect(resolveType(doc, 'spacing.4')).toBe('dimension')
  })

  it('トークン自身の $type がある場合はそちらを優先する', () => {
    const doc: TokenDocument = {
      component: {
        button: { radius: { $value: '{radius.md}', $type: 'dimension' } },
      },
    }
    expect(resolveType(doc, 'component.button.radius')).toBe('dimension')
  })
})

describe('design-system/tokens.json（受け入れ基準）', () => {
  const dir = dirname(fileURLToPath(import.meta.url))
  const doc = JSON.parse(
    readFileSync(resolvePath(dir, '../../design-system/tokens.json'), 'utf-8'),
  ) as TokenDocument

  it("resolveToken(doc, 'semantic.color.action.default', 'dark') が #818CF8 を返す", () => {
    expect(resolveToken(doc, 'semantic.color.action.default', 'dark')).toBe('#818CF8')
  })
})

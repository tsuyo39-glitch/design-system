import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { TokenDocument } from './dtcg'
import { documentToCss } from './toCss'

describe('documentToCss', () => {
  it(':root と [data-mode="dark"] の 2 ブロックを出力する', () => {
    const doc: TokenDocument = { color: { $type: 'color', brand: { $value: '#6366F1' } } }
    const css = documentToCss(doc)
    expect(css).toContain(':root {')
    expect(css).toContain('[data-mode="dark"] {')
  })

  it('参照と mode 上書きを解決して custom property にする', () => {
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
    }
    const css = documentToCss(doc)
    const [root, dark] = css.split('[data-mode="dark"]')
    expect(root).toContain('--semantic-action: #6366F1;')
    expect(dark).toContain('--semantic-action: #818CF8;')
  })

  it('fontFamily はスペースを含む名前を引用して結合する', () => {
    const doc: TokenDocument = {
      font: {
        $type: 'fontFamily',
        sans: { $value: ['Inter', 'system-ui', 'Segoe UI'] },
      },
    }
    expect(documentToCss(doc)).toContain('--font-sans: Inter, system-ui, "Segoe UI";')
  })

  it('cubicBezier と shadow を CSS 記法にする', () => {
    const doc: TokenDocument = {
      easing: { $type: 'cubicBezier', standard: { $value: [0.16, 1, 0.3, 1] } },
      shadow: {
        $type: 'shadow',
        sm: {
          $value: { color: '#0000000F', offsetX: '0px', offsetY: '1px', blur: '2px', spread: '0px' },
        },
      },
    }
    const css = documentToCss(doc)
    expect(css).toContain('--easing-standard: cubic-bezier(0.16, 1, 0.3, 1);')
    expect(css).toContain('--shadow-sm: 0px 1px 2px 0px #0000000F;')
  })

  it('typography（複合型）は単一プロパティにできないので出力しない', () => {
    const doc: TokenDocument = {
      typography: {
        $type: 'typography',
        body: { $value: { fontSize: '14px', fontWeight: 400 } },
      },
    }
    expect(documentToCss(doc)).not.toContain('--typography-body')
  })

  it('壊れた参照は握りつぶし、export 自体は落とさない', () => {
    const doc: TokenDocument = {
      color: {
        $type: 'color',
        ok: { $value: '#000000' },
        broken: { $value: '{color.missing}' },
      },
    }
    const css = documentToCss(doc)
    expect(css).toContain('--color-ok: #000000;')
    expect(css).not.toContain('--color-broken')
  })
})

describe('design-system/tokens.json（受け入れ基準）', () => {
  it('action.default が :root で #6366F1、dark で #818CF8 に解決される', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const doc = JSON.parse(
      readFileSync(resolvePath(dir, '../../design-system/tokens.json'), 'utf-8'),
    ) as TokenDocument
    const css = documentToCss(doc)
    const [root, dark] = css.split('[data-mode="dark"]')
    expect(root).toContain('--semantic-color-action-default: #6366F1;')
    expect(dark).toContain('--semantic-color-action-default: #818CF8;')
  })
})

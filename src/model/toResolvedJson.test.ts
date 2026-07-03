import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { TokenDocument } from './dtcg'
import { toResolvedJson } from './toResolvedJson'

function parse(doc: TokenDocument): { light: unknown; dark: unknown } {
  return JSON.parse(toResolvedJson(doc)) as { light: unknown; dark: unknown }
}

describe('toResolvedJson', () => {
  it('参照と mode を解決して { light, dark } のネスト木にする', () => {
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
    const out = parse(doc)
    expect((out.light as { semantic: { action: string } }).semantic.action).toBe('#6366F1')
    expect((out.dark as { semantic: { action: string } }).semantic.action).toBe('#818CF8')
  })

  it('dark 上書きが無いトークンは dark 木でも light と同じ値になる', () => {
    const doc: TokenDocument = { spacing: { $type: 'dimension', 4: { $value: '16px' } } }
    const out = parse(doc)
    expect((out.light as { spacing: { 4: string } }).spacing[4]).toBe('16px')
    expect((out.dark as { spacing: { 4: string } }).spacing[4]).toBe('16px')
  })

  it('composite（typography）はサブ参照まで解決される', () => {
    const doc: TokenDocument = {
      fontSize: { $type: 'dimension', base: { $value: '14px' } },
      typography: {
        $type: 'typography',
        body: { $value: { fontSize: '{fontSize.base}', fontWeight: 400 } },
      },
    }
    const body = (parse(doc).light as { typography: { body: { fontSize: string; fontWeight: number } } })
      .typography.body
    expect(body.fontSize).toBe('14px')
    expect(body.fontWeight).toBe(400)
  })
})

describe('design-system/tokens.json（受け入れ基準）', () => {
  it('action.default が light #6366F1 / dark #818CF8 に解決される', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const doc = JSON.parse(
      readFileSync(resolvePath(dir, '../../design-system/tokens.json'), 'utf-8'),
    ) as TokenDocument
    const out = parse(doc)
    type Shape = { semantic: { color: { action: { default: string } } } }
    expect((out.light as Shape).semantic.color.action.default).toBe('#6366F1')
    expect((out.dark as Shape).semantic.color.action.default).toBe('#818CF8')
  })
})

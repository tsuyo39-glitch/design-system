import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TokenDocument } from '../../model/dtcg'
import { parseDocument, serializeDocument } from '../../model/io'
import { downloadCss, downloadDocument } from './exportDocument'

function captureDownload(run: () => void): { blob: Blob; clicked: number; revoked: boolean } {
  let blob: Blob | null = null
  let revoked = false
  const createObjectURL = vi.fn((b: Blob) => {
    blob = b
    return 'blob:mock'
  })
  const revokeObjectURL = vi.fn(() => {
    revoked = true
  })
  vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  run()
  return { blob: blob!, clicked: click.mock.calls.length, revoked }
}

describe('downloadDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ドキュメントを JSON Blob にして a[download] 経由でダウンロードさせる', () => {
    const doc: TokenDocument = { color: { $type: 'color', brand: { $value: '#6366F1' } } }
    const { blob, clicked, revoked } = captureDownload(() => downloadDocument(doc, 'my-tokens.json'))

    expect(blob.type).toBe('application/json')
    expect(clicked).toBe(1)
    expect(revoked).toBe(true)
  })
})

describe('downloadCss', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('解決済み CSS を text/css Blob にしてダウンロードさせる', async () => {
    const doc: TokenDocument = { color: { $type: 'color', brand: { $value: '#6366F1' } } }
    const { blob, clicked } = captureDownload(() => downloadCss(doc))

    expect(blob.type).toBe('text/css')
    expect(clicked).toBe(1)
    expect(await blob.text()).toContain('--color-brand: #6366F1;')
  })
})

describe('round-trip（受け入れ基準）', () => {
  it('design-system/tokens.json を import して無編集で export すると意味的に同一の DTCG になる', () => {
    const dir = dirname(fileURLToPath(import.meta.url))
    const original = readFileSync(resolvePath(dir, '../../../design-system/tokens.json'), 'utf-8')

    const imported = parseDocument(original)
    const exported = serializeDocument(imported)

    expect(JSON.parse(exported)).toEqual(JSON.parse(original))
  })
})

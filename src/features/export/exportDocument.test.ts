import { readFileSync } from 'node:fs'
import { dirname, resolve as resolvePath } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TokenDocument } from '../../model/dtcg'
import { parseDocument, serializeDocument } from '../../model/io'
import { downloadDocument } from './exportDocument'

describe('downloadDocument', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ドキュメントを JSON Blob にして a[download] 経由でダウンロードさせる', () => {
    const doc: TokenDocument = { color: { $type: 'color', brand: { $value: '#6366F1' } } }

    let capturedBlob: Blob | null = null
    const createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob
      return 'blob:mock'
    })
    const revokeObjectURL = vi.fn()
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadDocument(doc, 'my-tokens.json')

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(capturedBlob!.type).toBe('application/json')
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')
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

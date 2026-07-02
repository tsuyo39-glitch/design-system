import type { TokenDocument } from '../../model/dtcg'
import { serializeDocument } from '../../model/io'

/** TokenDocument を DTCG JSON ファイルとしてダウンロードさせる。 */
export function downloadDocument(doc: TokenDocument, filename = 'tokens.json'): void {
  const blob = new Blob([serializeDocument(doc)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

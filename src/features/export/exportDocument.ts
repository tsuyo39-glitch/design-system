import type { TokenDocument } from '../../model/dtcg'
import { serializeDocument } from '../../model/io'
import { documentToCss } from '../../model/toCss'

function downloadText(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/** TokenDocument を DTCG JSON ファイルとしてダウンロードさせる。 */
export function downloadDocument(doc: TokenDocument, filename = 'tokens.json'): void {
  downloadText(serializeDocument(doc), filename, 'application/json')
}

/** TokenDocument を解決済み CSS カスタムプロパティ（light + dark）としてダウンロードさせる。 */
export function downloadCss(doc: TokenDocument, filename = 'tokens.css'): void {
  downloadText(documentToCss(doc), filename, 'text/css')
}

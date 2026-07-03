import type { TokenDocument } from '../../model/dtcg'
import { serializeDocument } from '../../model/io'
import { documentToCss } from '../../model/toCss'
import { toKotlin } from '../../model/toKotlin'
import { toResolvedJson } from '../../model/toResolvedJson'
import { toSwift } from '../../model/toSwift'

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

/** 参照・mode を完全解決した { light, dark } JSON をダウンロードさせる。 */
export function downloadResolvedJson(doc: TokenDocument, filename = 'tokens.resolved.json'): void {
  downloadText(toResolvedJson(doc), filename, 'application/json')
}

/** color トークンを SwiftUI Color 拡張としてダウンロードさせる。 */
export function downloadSwift(doc: TokenDocument, filename = 'Tokens.swift'): void {
  downloadText(toSwift(doc), filename, 'text/plain')
}

/** color トークンを Jetpack Compose Color 定数としてダウンロードさせる。 */
export function downloadKotlin(doc: TokenDocument, filename = 'DesignTokens.kt'): void {
  downloadText(toKotlin(doc), filename, 'text/plain')
}

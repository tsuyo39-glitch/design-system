/** コード生成系エクスポータ（Swift / Kotlin …）が共有する小物。 */

/** パス配列を lowerCamelCase の識別子にする。先頭が数字なら _ を前置。 */
export function toCamelIdentifier(path: string[]): string {
  const camel = path
    .map((seg, i) => (i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '')
  return /^[0-9]/.test(camel) ? `_${camel}` : camel
}

/** "#RRGGBB" / "#RRGGBBAA" を 0-255 の各成分に分解する。非対応なら null。 */
export function parseHexBytes(hex: string): { r: number; g: number; b: number; a: number } | null {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.trim())
  if (!match) return null
  const h = match[1]
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: match[2] ? parseInt(match[2], 16) : 255,
  }
}

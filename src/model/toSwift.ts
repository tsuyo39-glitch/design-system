import type { TokenDocument } from './dtcg'
import { flattenResolved } from './flatten'

/** パス配列を Swift の識別子（lowerCamelCase）にする。先頭が数字なら _ を前置。 */
function swiftName(path: string[]): string {
  const camel = path
    .map((seg, i) => (i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
    .join('')
    .replace(/[^A-Za-z0-9]/g, '')
  return /^[0-9]/.test(camel) ? `_${camel}` : camel
}

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } | null {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.trim())
  if (!match) return null
  const h = match[1]
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: match[2] ? parseInt(match[2], 16) / 255 : 1,
  }
}

const round = (n: number): string => String(Math.round(n * 1000) / 1000)

/**
 * color トークンを SwiftUI Color 拡張（light モード値）に変換する。
 * 色以外の型・非 HEX 値は Swift の Color に素直に落とせないため対象外。
 * dark 値が必要な場合は解決済み JSON エクスポートを使う。
 */
export function toSwift(doc: TokenDocument): string {
  const lines: string[] = []
  for (const token of flattenResolved(doc)) {
    if (token.type !== 'color' || typeof token.light !== 'string') continue
    const rgba = hexToRgba(token.light)
    if (!rgba) continue
    lines.push(
      `    static let ${swiftName(token.path)} = Color(red: ${round(rgba.r)}, green: ${round(rgba.g)}, blue: ${round(rgba.b)}, opacity: ${round(rgba.a)})`,
    )
  }

  return `import SwiftUI

// デザイントークンから生成（light モードの色）。dark 値は解決済み JSON エクスポートを参照。
public extension Color {
${lines.join('\n')}
}
`
}

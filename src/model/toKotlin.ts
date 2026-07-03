import { toCamelIdentifier, parseHexBytes } from './codegen'
import type { TokenDocument } from './dtcg'
import { flattenResolved } from './flatten'

const hex2 = (n: number): string => n.toString(16).padStart(2, '0').toUpperCase()

/**
 * color トークンを Jetpack Compose の Color 定数（light モード値）に変換する。
 * Compose の Color(0xAARRGGBB) 形式。色以外・非 HEX は対象外。
 * dark 値が必要な場合は解決済み JSON エクスポートを使う。
 */
export function toKotlin(doc: TokenDocument): string {
  const lines: string[] = []
  for (const token of flattenResolved(doc)) {
    if (token.type !== 'color' || typeof token.light !== 'string') continue
    const rgba = parseHexBytes(token.light)
    if (!rgba) continue
    const argb = `0x${hex2(rgba.a)}${hex2(rgba.r)}${hex2(rgba.g)}${hex2(rgba.b)}`
    lines.push(`    val ${toCamelIdentifier(token.path)} = Color(${argb})`)
  }

  return `import androidx.compose.ui.graphics.Color

// デザイントークンから生成（light モードの色）。dark 値は解決済み JSON エクスポートを参照。
object DesignTokens {
${lines.join('\n')}
}
`
}

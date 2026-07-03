import { hsvToHex, parseHexColor } from './color'
import { parseHexBytes } from './codegen'

/**
 * カラー三役の派生ロジック（純粋関数）。
 * - メインカラー = ベースカラーの彩度を上げたもの（同じ色相）
 * - アクセントカラー = メインカラーの反対色（補色 = 色相 +180°）
 */

/** ベースの彩度を上げてメインカラーを作る。色相は保つ。 */
export function deriveMain(base: string): string {
  const parsed = parseHexColor(base)
  if (!parsed) return base
  const { h, s, v } = parsed.hsv
  // 彩度をしっかり上げる（下限も設けて、ぼんやりしたベースでも主張が出るように）
  const saturation = Math.max(0.55, Math.min(1, s + 0.35))
  return hsvToHex({ h, s: saturation, v: Math.max(v, 0.6) })
}

/** メインの補色（色相 +180°）をアクセントにする。 */
export function deriveAccent(main: string): string {
  const parsed = parseHexColor(main)
  if (!parsed) return main
  const { h, s, v } = parsed.hsv
  return hsvToHex({ h: (h + 180) % 360, s, v })
}

/** 背景色の上に置く文字色として、白と黒の読みやすい方を返す（YIQ 明度で判定）。 */
export function readableTextOn(background: string): string {
  const rgb = parseHexBytes(background)
  if (!rgb) return '#000000'
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return yiq >= 140 ? '#111111' : '#FFFFFF'
}

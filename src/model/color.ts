/** HSV 色空間と HEX 文字列の相互変換。ColorWheel（色相環）用の純粋関数。 */

export interface Hsv {
  /** 色相 0-360 */
  h: number
  /** 彩度 0-1 */
  s: number
  /** 明度 0-1 */
  v: number
}

const HEX_PATTERN = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i

/**
 * "#RRGGBB" / "#RRGGBBAA" を HSV とアルファ部（"AA" または ""）に分解する。
 * 対応形式でなければ null。
 */
export function parseHexColor(value: string): { hsv: Hsv; alpha: string } | null {
  const match = HEX_PATTERN.exec(value.trim())
  if (!match) return null

  const hex6 = match[1]
  const r = parseInt(hex6.slice(0, 2), 16) / 255
  const g = parseInt(hex6.slice(2, 4), 16) / 255
  const b = parseInt(hex6.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
    if (h < 0) h += 360
  }

  return {
    hsv: { h, s: max === 0 ? 0 : delta / max, v: max },
    alpha: (match[2] ?? '').toUpperCase(),
  }
}

/** "#RRGGBB" / "#RRGGBBAA" を 0-255 の各成分に分解する。非対応なら null。 */
export function parseHexBytes(hex: string): { r: number; g: number; b: number; a: number } | null {
  const match = HEX_PATTERN.exec(hex.trim())
  if (!match) return null
  const h = match[1]
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: match[2] ? parseInt(match[2], 16) : 255,
  }
}

/** HSV を "#RRGGBB"（大文字）にする。 */
export function hsvToHex({ h, s, v }: Hsv): string {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c

  let r: number
  let g: number
  let b: number
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase()
}

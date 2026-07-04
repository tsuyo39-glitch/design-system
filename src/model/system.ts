import { hsvToHex, parseHexBytes, parseHexColor } from './color'
import { readableTextOn } from './palette'
import type { DesignSpec } from './templates'

/**
 * テンプレート＋微調整の少数の値から、意味づけされたデザインシステムを導出する（純粋）。
 * Anthropic のデザイン体系のように、役割ごとに名前を持つトークン一式にまとめる。
 */

const toHex2 = (n: number): string =>
  Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()

/** 2 色を t(0-1) で混ぜる。 */
export function mix(a: string, b: string, t: number): string {
  const A = parseHexBytes(a)
  const B = parseHexBytes(b)
  if (!A || !B) return a
  return `#${toHex2(A.r + (B.r - A.r) * t)}${toHex2(A.g + (B.g - A.g) * t)}${toHex2(A.b + (B.b - A.b) * t)}`
}

/** 明度(V)を下げて暗くする。 */
export function darken(hex: string, amount: number): string {
  const parsed = parseHexColor(hex)
  if (!parsed) return hex
  return hsvToHex({ ...parsed.hsv, v: Math.max(0, parsed.hsv.v - amount) })
}

/**
 * 背景色から相性の良い面(surface)色を作る。
 * 暗い背景は少し明るく（カードが浮く）、明るい背景は白に寄せる（オフホワイトでも自然な段差）。
 */
export function deriveSurface(background: string): string {
  const dark = readableTextOn(background) === '#FFFFFF'
  return dark ? mix(background, '#FFFFFF', 0.08) : mix(background, '#FFFFFF', 0.55)
}

export interface SystemColors {
  background: string
  surface: string
  text: string
  textMuted: string
  border: string
  primary: string
  primaryHover: string
  primarySubtle: string
  onPrimary: string
  accent: string
  onAccent: string
}

export interface TypeScale {
  display: number
  heading: number
  subheading: number
  body: number
  caption: number
}

export interface DesignSystem {
  colors: SystemColors
  type: TypeScale
  fonts: DesignSpec['fonts']
  spacing: number
  radius: number
}

const round = (n: number): number => Math.round(n)

/** DesignSpec から意味的なトークン一式を導出する。 */
export function deriveSystem(spec: DesignSpec): DesignSystem {
  const c = spec.colors
  return {
    colors: {
      background: c.background,
      surface: c.surface,
      text: c.text,
      textMuted: mix(c.text, c.background, 0.42),
      border: mix(c.text, c.background, 0.86),
      primary: c.primary,
      primaryHover: darken(c.primary, 0.08),
      primarySubtle: mix(c.primary, c.background, 0.86),
      onPrimary: readableTextOn(c.primary),
      accent: c.accent,
      onAccent: readableTextOn(c.accent),
    },
    type: {
      display: round(spec.sizeBase * 2.6),
      heading: round(spec.sizeBase * 1.8),
      subheading: round(spec.sizeBase * 1.3),
      body: spec.sizeBase,
      caption: round(spec.sizeBase * 0.82),
    },
    fonts: spec.fonts,
    spacing: spec.spacing,
    radius: spec.radius,
  }
}

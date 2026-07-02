import { useRef, useState } from 'react'
import { hsvToHex, parseHexColor, type Hsv } from './color'

const WHEEL = 192
const RING = 24
const RADIUS = WHEEL / 2
const INNER = RADIUS - RING
const SQUARE = 96
const SQUARE_OFFSET = (WHEEL - SQUARE) / 2

// リング・SVスクエアの生値はカラーピッカーの「表示対象そのもの」なので、
// chrome テーマのトークンではなく色空間の生値で描く（テーマに追従させない）。
const HUE_GRADIENT =
  'conic-gradient(#FF0000, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)'
const HANDLE_SHADOW = '0 0 0 1px rgb(0 0 0 / 0.35)'

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

interface ColorWheelProps {
  /** "#RRGGBB" / "#RRGGBBAA"。それ以外は初期姿勢（赤）で表示し、操作時に HEX を発行する。 */
  value: string
  onChange: (hex: string) => void
}

export function ColorWheel({ value, onChange }: ColorWheelProps) {
  const parsed = parseHexColor(value)
  const alpha = parsed?.alpha ?? ''
  const [hsv, setHsv] = useState<Hsv>(parsed?.hsv ?? { h: 0, s: 1, v: 1 })
  const [prevValue, setPrevValue] = useState(value)
  const wheelRef = useRef<HTMLDivElement>(null)
  const svRef = useRef<HTMLDivElement>(null)

  // 外部（HEX入力・別トークン選択）で値が変わったらレンダー中に同期する。
  // 自分の commit 由来（HSV を HEX 化すると一致する）の場合は同期しない——
  // グレー系 HEX は色相情報を持たないため、上書きするとドラッグ中に色相が 0 に飛ぶ。
  if (value !== prevValue) {
    setPrevValue(value)
    if (parsed && hsvToHex(hsv) + alpha !== value.trim().toUpperCase()) {
      setHsv(parsed.hsv)
    }
  }

  const commit = (next: Hsv) => {
    setHsv(next)
    onChange(hsvToHex(next) + alpha)
  }

  const hueAt = (clientX: number, clientY: number): number => {
    const rect = wheelRef.current!.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width / 2)
    const dy = clientY - (rect.top + rect.height / 2)
    // 12時方向を 0°、時計回り（conic-gradient の向きと一致）
    return ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
  }

  const onHuePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    if (Math.hypot(dx, dy) < INNER) return // 穴の中は SV エリアに任せる
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 合成イベント（テスト等）ではキャプチャできなくてよい
    }
    commit({ ...hsv, h: hueAt(e.clientX, e.clientY) })
  }

  const onHuePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    commit({ ...hsv, h: hueAt(e.clientX, e.clientY) })
  }

  const svAt = (clientX: number, clientY: number): { s: number; v: number } => {
    const rect = svRef.current!.getBoundingClientRect()
    return {
      s: clamp01((clientX - rect.left) / rect.width),
      v: 1 - clamp01((clientY - rect.top) / rect.height),
    }
  }

  const onSvPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 合成イベントでは不要
    }
    commit({ ...hsv, ...svAt(e.clientX, e.clientY) })
  }

  const onSvPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    commit({ ...hsv, ...svAt(e.clientX, e.clientY) })
  }

  const midRadius = RADIUS - RING / 2
  const hueRad = (hsv.h * Math.PI) / 180
  const hueHandleX = RADIUS + midRadius * Math.sin(hueRad)
  const hueHandleY = RADIUS - midRadius * Math.cos(hueRad)

  return (
    <div
      ref={wheelRef}
      role="slider"
      aria-label="色相"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hsv.h)}
      className="relative touch-none select-none"
      style={{ width: WHEEL, height: WHEEL }}
      onPointerDown={onHuePointerDown}
      onPointerMove={onHuePointerMove}
    >
      <div aria-hidden className="h-full w-full rounded-full" style={{ background: HUE_GRADIENT }} />
      <div aria-hidden className="absolute rounded-full bg-canvas" style={{ inset: RING }} />
      <div
        aria-hidden
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{
          left: hueHandleX,
          top: hueHandleY,
          backgroundColor: `hsl(${hsv.h} 100% 50%)`,
          boxShadow: HANDLE_SHADOW,
        }}
      />
      <div
        ref={svRef}
        role="slider"
        aria-label="彩度と明度"
        aria-valuetext={`彩度 ${Math.round(hsv.s * 100)}% 明度 ${Math.round(hsv.v * 100)}%`}
        className="absolute rounded-sm"
        style={{
          left: SQUARE_OFFSET,
          top: SQUARE_OFFSET,
          width: SQUARE,
          height: SQUARE,
          background: `linear-gradient(to top, #000000, transparent), linear-gradient(to right, #FFFFFF, hsl(${hsv.h} 100% 50%))`,
        }}
        onPointerDown={onSvPointerDown}
        onPointerMove={onSvPointerMove}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{
            left: hsv.s * SQUARE,
            top: (1 - hsv.v) * SQUARE,
            backgroundColor: hsvToHex(hsv),
            boxShadow: HANDLE_SHADOW,
          }}
        />
      </div>
    </div>
  )
}

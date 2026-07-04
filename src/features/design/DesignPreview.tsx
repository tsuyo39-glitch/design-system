import type { CSSProperties } from 'react'
import { parseHexBytes } from '../../model/color'
import { readableTextOn } from '../../model/palette'
import type { DesignSpec } from '../../model/templates'

/** 文字色を薄めた補助色（プレビュー内はユーザーデザインの表現なので rgba を許容）。 */
function muted(hex: string, alpha = 0.62): string {
  const c = parseHexBytes(hex)
  if (!c) return hex
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`
}

export function DesignPreview({ spec }: { spec: DesignSpec }) {
  const { colors, fonts, sizeBase, spacing, radius } = spec
  const onPrimary = readableTextOn(colors.primary)
  const onAccent = readableTextOn(colors.accent)
  const borderColor = muted(colors.text, 0.14)

  const page: CSSProperties = {
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: sizeBase,
  }
  const primaryBtn: CSSProperties = {
    backgroundColor: colors.primary,
    color: onPrimary,
    borderRadius: radius,
    padding: `${spacing * 0.5}px ${spacing}px`,
    fontSize: sizeBase * 0.9,
    fontWeight: 600,
    border: 'none',
  }
  const outlineBtn: CSSProperties = {
    backgroundColor: 'transparent',
    color: colors.text,
    borderRadius: radius,
    padding: `${spacing * 0.5}px ${spacing}px`,
    fontSize: sizeBase * 0.9,
    fontWeight: 600,
    border: `1px solid ${borderColor}`,
  }
  const card: CSSProperties = {
    backgroundColor: colors.surface,
    borderRadius: radius,
    border: `1px solid ${borderColor}`,
    padding: spacing,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing * 0.4,
  }
  const heading: CSSProperties = { fontFamily: fonts.heading, color: colors.text, fontWeight: 700 }

  return (
    <div style={{ ...page, borderRadius: radius }} className="overflow-hidden border border-border">
      {/* ナビ */}
      <nav
        style={{ padding: `${spacing * 0.75}px ${spacing}px`, borderBottom: `1px solid ${borderColor}` }}
        className="flex items-center justify-between"
      >
        <span style={{ ...heading, fontSize: sizeBase * 1.15 }}>Brand</span>
        <div className="flex items-center gap-4" style={{ fontSize: sizeBase * 0.9 }}>
          <span style={{ color: muted(colors.text) }}>機能</span>
          <span style={{ color: muted(colors.text) }}>料金</span>
          <button type="button" style={primaryBtn}>
            登録する
          </button>
        </div>
      </nav>

      {/* ヒーロー */}
      <header style={{ padding: `${spacing * 2}px ${spacing}px`, display: 'flex', flexDirection: 'column', gap: spacing * 0.6 }}>
        <span
          style={{
            alignSelf: 'flex-start',
            backgroundColor: colors.accent,
            color: onAccent,
            borderRadius: 9999,
            padding: `${spacing * 0.2}px ${spacing * 0.6}px`,
            fontSize: sizeBase * 0.75,
            fontWeight: 600,
          }}
        >
          NEW
        </span>
        <h1 style={{ ...heading, fontSize: sizeBase * 2.6, lineHeight: 1.15 }}>
          伝わるデザインを、すぐに。
        </h1>
        <p style={{ color: muted(colors.text, 0.8), fontSize: sizeBase * 1.05, maxWidth: 460, lineHeight: 1.6 }}>
          テンプレートを選ぶだけで、色・フォント・余白の整ったデザインが手に入ります。
        </p>
        <div className="flex flex-wrap" style={{ gap: spacing * 0.6, marginTop: spacing * 0.4 }}>
          <button type="button" style={primaryBtn}>
            無料で始める
          </button>
          <button type="button" style={outlineBtn}>
            詳しく見る
          </button>
        </div>
      </header>

      {/* 特徴カード */}
      <section style={{ padding: `0 ${spacing}px ${spacing * 1.5}px`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing * 0.75 }}>
        {[
          { t: '選ぶだけ', d: '完成された型から始められます。' },
          { t: '微調整', d: '色やフォントを少しだけ変えられます。' },
          { t: '書き出し', d: 'CSS や JSON でそのまま使えます。' },
        ].map((f) => (
          <div key={f.t} style={card}>
            <span style={{ width: sizeBase, height: sizeBase, borderRadius: 9999, backgroundColor: colors.accent }} />
            <p style={{ ...heading, fontSize: sizeBase }}>{f.t}</p>
            <p style={{ color: muted(colors.text, 0.75), fontSize: sizeBase * 0.85, lineHeight: 1.5 }}>{f.d}</p>
          </div>
        ))}
      </section>

      {/* フォーム */}
      <section style={{ padding: `0 ${spacing}px ${spacing * 2}px` }}>
        <div style={{ ...card, flexDirection: 'row', alignItems: 'center', gap: spacing * 0.5 }}>
          <input
            readOnly
            value="you@example.com"
            style={{
              flex: 1,
              backgroundColor: colors.background,
              color: colors.text,
              border: `1px solid ${borderColor}`,
              borderRadius: radius,
              padding: `${spacing * 0.5}px ${spacing * 0.75}px`,
              fontSize: sizeBase * 0.9,
            }}
          />
          <button type="button" style={primaryBtn}>
            送信
          </button>
        </div>
      </section>
    </div>
  )
}

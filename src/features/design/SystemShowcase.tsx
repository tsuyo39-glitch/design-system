import type { CSSProperties } from 'react'
import { deriveSystem } from '../../model/system'
import type { DesignSpec } from '../../model/templates'

/**
 * 現在のデザインを「デザインシステム」として提示する。
 * カラートークン・タイポスケール・コンポーネントの3セクション（Anthropic の体系を参考に）。
 */
export function SystemShowcase({ spec }: { spec: DesignSpec }) {
  const sys = deriveSystem(spec)
  const { colors: c, type, fonts, spacing, radius } = sys

  const sectionTitle: CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: type.subheading,
    color: c.text,
    fontWeight: 600,
  }
  const card: CSSProperties = {
    backgroundColor: c.surface,
    border: `1px solid ${c.border}`,
    borderRadius: radius,
    padding: spacing,
  }
  const btnBase: CSSProperties = {
    borderRadius: radius,
    padding: `${spacing * 0.5}px ${spacing}px`,
    fontSize: type.body * 0.95,
    fontWeight: 600,
  }
  const primaryBtn: CSSProperties = { ...btnBase, backgroundColor: c.primary, color: c.onPrimary, border: 'none' }
  const secondaryBtn: CSSProperties = { ...btnBase, backgroundColor: c.surface, color: c.text, border: `1px solid ${c.border}` }
  const ghostBtn: CSSProperties = { ...btnBase, backgroundColor: 'transparent', color: c.primary, border: 'none' }

  const SWATCHES: Array<{ name: string; role: string; value: string }> = [
    { name: '背景', role: 'background', value: c.background },
    { name: '面', role: 'surface', value: c.surface },
    { name: '本文', role: 'text', value: c.text },
    { name: 'ミュート文字', role: 'text-muted', value: c.textMuted },
    { name: 'ボーダー', role: 'border', value: c.border },
    { name: 'プライマリ', role: 'primary', value: c.primary },
    { name: 'プライマリ hover', role: 'primary-hover', value: c.primaryHover },
    { name: 'アクセント', role: 'accent', value: c.accent },
  ]

  const TYPES: Array<{ label: string; size: number; font: string; sample: string }> = [
    { label: 'ディスプレイ', size: type.display, font: fonts.heading, sample: '伝わるデザイン' },
    { label: '見出し', size: type.heading, font: fonts.heading, sample: 'セクションの見出し' },
    { label: '小見出し', size: type.subheading, font: fonts.heading, sample: '小見出しのテキスト' },
    { label: '本文', size: type.body, font: fonts.body, sample: '本文のサンプルです。読みやすさを確かめられます。' },
    { label: 'キャプション', size: type.caption, font: fonts.body, sample: '補足・キャプション' },
  ]

  return (
    <div
      className="border border-border"
      style={{
        backgroundColor: c.background,
        color: c.text,
        fontFamily: fonts.body,
        borderRadius: radius,
        padding: spacing * 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing * 1.5,
      }}
    >
      {/* カラー */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: spacing * 0.75 }}>
        <h3 style={sectionTitle}>カラー</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: spacing * 0.6 }}>
          {SWATCHES.map((s) => (
            <div key={s.role} style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 48, backgroundColor: s.value }} />
              <div style={{ padding: spacing * 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: type.caption }}>{s.name}</span>
                <span style={{ fontSize: type.caption * 0.92, color: c.textMuted, fontFamily: 'ui-monospace, monospace' }}>
                  {s.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* タイポグラフィ */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: spacing * 0.75 }}>
        <h3 style={sectionTitle}>タイポグラフィ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing * 0.6 }}>
          {TYPES.map((t) => (
            <div
              key={t.label}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: spacing,
                borderBottom: `1px solid ${c.border}`,
                paddingBottom: spacing * 0.5,
              }}
            >
              <span style={{ width: 104, flexShrink: 0, fontSize: type.caption, color: c.textMuted }}>
                {t.label} · {t.size}px
              </span>
              <span
                style={{
                  fontFamily: t.font,
                  fontSize: t.size,
                  fontWeight: t.size >= type.subheading ? 700 : 400,
                  lineHeight: 1.2,
                }}
              >
                {t.sample}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* コンポーネント */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: spacing * 0.75 }}>
        <h3 style={sectionTitle}>コンポーネント</h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: spacing * 0.6 }}>
          <button type="button" style={primaryBtn}>
            プライマリ
          </button>
          <button type="button" style={secondaryBtn}>
            セカンダリ
          </button>
          <button type="button" style={ghostBtn}>
            ゴースト
          </button>
          <span
            style={{
              backgroundColor: c.accent,
              color: c.onAccent,
              borderRadius: 9999,
              padding: `${spacing * 0.2}px ${spacing * 0.6}px`,
              fontSize: type.caption,
              fontWeight: 600,
            }}
          >
            バッジ
          </span>
        </div>

        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: spacing * 0.5 }}>
          <p style={{ fontFamily: fonts.heading, fontSize: type.subheading, fontWeight: 600 }}>カードタイトル</p>
          <p style={{ fontSize: type.body * 0.95, color: c.textMuted, lineHeight: 1.6 }}>
            面・ボーダー・角丸のトークンで構成した基本カードです。
          </p>
        </div>

        <div style={{ display: 'flex', gap: spacing * 0.5 }}>
          <input
            readOnly
            value="you@example.com"
            style={{
              flex: 1,
              backgroundColor: c.surface,
              color: c.text,
              border: `1px solid ${c.border}`,
              borderRadius: radius,
              padding: `${spacing * 0.5}px ${spacing * 0.75}px`,
              fontSize: type.body * 0.95,
            }}
          />
          <button type="button" style={primaryBtn}>
            送信
          </button>
        </div>

        <div
          style={{
            backgroundColor: c.primarySubtle,
            color: c.text,
            border: `1px solid ${c.border}`,
            borderRadius: radius,
            padding: spacing * 0.75,
            fontSize: type.body * 0.95,
          }}
        >
          プライマリ subtle を使った、控えめな通知バーの例です。
        </div>
      </section>
    </div>
  )
}

import type { CSSProperties } from 'react'
import type { TokenDocument } from '../../model/dtcg'
import { resolveToken, type Mode } from '../../model/resolve'
import { useDocumentStore } from '../../store/documentStore'

/**
 * ユーザーが編集中のドキュメントを解決して描画するのはこのコンポーネントだけ。
 * アプリ chrome の見た目（Tailwind theme / src/styles/tokens.css）は一切参照せず、
 * すべて resolveToken(doc, path, mode) の実値をインラインスタイルで当てる。
 */

function resolveColor(doc: TokenDocument, path: string, mode: Mode): string | undefined {
  try {
    const value = resolveToken(doc, path, mode)
    return typeof value === 'string' ? value : undefined
  } catch {
    return undefined
  }
}

function resolveDimension(doc: TokenDocument, path: string, mode: Mode): string | undefined {
  return resolveColor(doc, path, mode)
}

interface TypographyValue {
  fontFamily?: string[]
  fontSize?: string
  fontWeight?: number
  lineHeight?: number
}

function resolveTypography(doc: TokenDocument, path: string, mode: Mode): CSSProperties {
  try {
    const value = resolveToken(doc, path, mode) as TypographyValue
    return {
      fontFamily: value.fontFamily?.join(', '),
      fontSize: value.fontSize,
      fontWeight: value.fontWeight,
      lineHeight: value.lineHeight,
    }
  } catch {
    return {}
  }
}

const STATUS_SWATCHES: Array<{ label: string; path: string }> = [
  { label: 'success', path: 'semantic.color.status.success' },
  { label: 'warning', path: 'semantic.color.status.warning' },
  { label: 'error', path: 'semantic.color.status.error' },
  { label: 'info', path: 'semantic.color.status.info' },
]

export function Preview({ mode }: { mode: Mode }) {
  const document = useDocumentStore((s) => s.document)
  const color = (path: string) => resolveColor(document, path, mode)
  const dimension = (path: string) => resolveDimension(document, path, mode)

  const canvas = color('semantic.color.bg.canvas')
  const raised = color('semantic.color.bg.raised')
  const textPrimary = color('semantic.color.text.primary')
  const textSecondary = color('semantic.color.text.secondary')
  const textMuted = color('semantic.color.text.muted')
  const border = color('semantic.color.border.default')

  const buttonBackground = color('component.button.primary.background')
  const buttonBackgroundHover = color('component.button.primary.backgroundHover')
  const buttonText = color('component.button.primary.text')
  const buttonRadius = dimension('component.button.primary.radius')
  const buttonPaddingX = dimension('component.button.primary.paddingX')
  const buttonPaddingY = dimension('component.button.primary.paddingY')
  const focusRing = color('semantic.color.focus.ring')

  const secondaryBorder = color('component.button.secondary.border')
  const secondaryText = color('component.button.secondary.text')
  const secondaryRadius = dimension('component.button.secondary.radius')

  const inputBackground = color('component.input.background')
  const inputBorder = color('component.input.border')
  const inputText = color('component.input.text')
  const inputPlaceholder = color('component.input.placeholder')
  const inputRadius = dimension('component.input.radius')

  const buttonBaseStyle: CSSProperties = {
    backgroundColor: buttonBackground,
    color: buttonText,
    borderRadius: buttonRadius,
    paddingLeft: buttonPaddingX,
    paddingRight: buttonPaddingX,
    paddingTop: buttonPaddingY,
    paddingBottom: buttonPaddingY,
    border: 'none',
    fontSize: '14px',
  }

  return (
    <div
      style={{ backgroundColor: canvas, color: textPrimary, borderColor: border }}
      className="flex flex-col gap-6 rounded-xl border p-6"
    >
      <section>
        <h3 style={{ color: textSecondary }} className="mb-2 text-xs font-medium uppercase">
          Buttons
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" style={buttonBaseStyle}>
            Default
          </button>
          <button type="button" style={{ ...buttonBaseStyle, backgroundColor: buttonBackgroundHover }}>
            Hover
          </button>
          <button
            type="button"
            style={{ ...buttonBaseStyle, boxShadow: `0 0 0 2px ${focusRing}` }}
          >
            Focus
          </button>
          <button type="button" style={{ ...buttonBaseStyle, opacity: 0.5 }} disabled>
            Disabled
          </button>
          <button
            type="button"
            style={{
              backgroundColor: 'transparent',
              color: secondaryText,
              borderRadius: secondaryRadius,
              border: `1px solid ${secondaryBorder}`,
              padding: '8px 12px',
              fontSize: '14px',
            }}
          >
            Secondary
          </button>
        </div>
      </section>

      <section>
        <h3 style={{ color: textSecondary }} className="mb-2 text-xs font-medium uppercase">
          Input
        </h3>
        <input
          type="text"
          placeholder="placeholder"
          className="ds-preview-input"
          style={{
            backgroundColor: inputBackground,
            color: inputText,
            borderRadius: inputRadius,
            border: `1px solid ${inputBorder}`,
            padding: '8px 12px',
            fontSize: '14px',
          }}
        />
        <style>{`.ds-preview-input::placeholder { color: ${inputPlaceholder}; }`}</style>
      </section>

      <section>
        <h3 style={{ color: textSecondary }} className="mb-2 text-xs font-medium uppercase">
          Card
        </h3>
        <div
          style={{ backgroundColor: raised, borderColor: border }}
          className="w-64 rounded-lg border p-4"
        >
          <p style={{ color: textPrimary, fontWeight: 600 }}>カードの見出し</p>
          <p style={{ color: textSecondary, fontSize: '13px' }}>カードの本文テキストのサンプルです。</p>
        </div>
      </section>

      <section>
        <h3 style={{ color: textSecondary }} className="mb-2 text-xs font-medium uppercase">
          Text scale
        </h3>
        <div className="flex flex-col gap-1">
          <p style={{ ...resolveTypography(document, 'typography.title', mode), color: textPrimary }}>Title</p>
          <p style={{ ...resolveTypography(document, 'typography.heading', mode), color: textPrimary }}>Heading</p>
          <p style={{ ...resolveTypography(document, 'typography.body', mode), color: textPrimary }}>
            Body text sample.
          </p>
          <p style={{ ...resolveTypography(document, 'typography.caption', mode), color: textMuted }}>Caption</p>
        </div>
      </section>

      <section>
        <h3 style={{ color: textSecondary }} className="mb-2 text-xs font-medium uppercase">
          Swatches
        </h3>
        <div className="flex gap-2">
          {STATUS_SWATCHES.map(({ label, path }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                style={{ backgroundColor: color(path), borderColor: border }}
                className="h-8 w-8 rounded-full border"
              />
              <span style={{ color: textMuted }} className="font-mono text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

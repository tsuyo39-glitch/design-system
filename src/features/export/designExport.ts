import { deriveSystem } from '../../model/system'
import type { DesignSpec } from '../../model/templates'

/** デザイン（テンプレート＋微調整）を、意味づけされたトークン一式として書き出す。 */

/** CSS カスタムプロパティとして書き出す。 */
export function designToCss(spec: DesignSpec): string {
  const s = deriveSystem(spec)
  const { colors: c, type, fonts } = s
  return `:root {
  --color-background: ${c.background};
  --color-surface: ${c.surface};
  --color-text: ${c.text};
  --color-text-muted: ${c.textMuted};
  --color-border: ${c.border};
  --color-primary: ${c.primary};
  --color-primary-hover: ${c.primaryHover};
  --color-primary-subtle: ${c.primarySubtle};
  --color-on-primary: ${c.onPrimary};
  --color-accent: ${c.accent};
  --color-on-accent: ${c.onAccent};
  --font-heading: ${fonts.heading};
  --font-body: ${fonts.body};
  --text-display: ${type.display}px;
  --text-heading: ${type.heading}px;
  --text-subheading: ${type.subheading}px;
  --text-body: ${type.body}px;
  --text-caption: ${type.caption}px;
  --spacing: ${s.spacing}px;
  --radius: ${s.radius}px;
}
`
}

/** JSON として書き出す。 */
export function designToJson(spec: DesignSpec): string {
  const s = deriveSystem(spec)
  return JSON.stringify(
    {
      colors: s.colors,
      typography: {
        heading: s.fonts.heading,
        body: s.fonts.body,
        display: `${s.type.display}px`,
        heading_size: `${s.type.heading}px`,
        subheading: `${s.type.subheading}px`,
        body_size: `${s.type.body}px`,
        caption: `${s.type.caption}px`,
      },
      spacing: `${s.spacing}px`,
      radius: `${s.radius}px`,
    },
    null,
    2,
  )
}

function downloadText(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function downloadDesignCss(spec: DesignSpec, filename = 'design.css'): void {
  downloadText(designToCss(spec), filename, 'text/css')
}

export function downloadDesignJson(spec: DesignSpec, filename = 'design.json'): void {
  downloadText(designToJson(spec), filename, 'application/json')
}

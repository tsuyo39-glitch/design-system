import type { DesignSpec } from '../../model/templates'

/** デザイン（テンプレート＋微調整の結果）を書き出す。 */

/** CSS カスタムプロパティとして書き出す。 */
export function designToCss(spec: DesignSpec): string {
  const { colors, fonts, sizeBase, spacing, radius } = spec
  return `:root {
  --color-background: ${colors.background};
  --color-surface: ${colors.surface};
  --color-primary: ${colors.primary};
  --color-accent: ${colors.accent};
  --color-text: ${colors.text};
  --font-heading: ${fonts.heading};
  --font-body: ${fonts.body};
  --font-size-base: ${sizeBase}px;
  --spacing: ${spacing}px;
  --radius: ${radius}px;
}
`
}

/** JSON として書き出す。 */
export function designToJson(spec: DesignSpec): string {
  return JSON.stringify(
    {
      colors: spec.colors,
      fonts: spec.fonts,
      sizeBase: `${spec.sizeBase}px`,
      spacing: `${spec.spacing}px`,
      radius: `${spec.radius}px`,
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

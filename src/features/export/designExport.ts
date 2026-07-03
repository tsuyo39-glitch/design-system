/** カラー／フォント／レイアウトの3タブで作った設計を書き出す。 */

export interface Design {
  color: { base: string; main: string; accent: string }
  font: { heading: string; body: string; baseSize: number }
  layout: { spacing: number; radius: number }
}

/** CSS カスタムプロパティとして書き出す。 */
export function designToCss(design: Design): string {
  const { color, font, layout } = design
  return `:root {
  --color-base: ${color.base};
  --color-main: ${color.main};
  --color-accent: ${color.accent};
  --font-heading: ${font.heading};
  --font-body: ${font.body};
  --font-size-base: ${font.baseSize}px;
  --spacing: ${layout.spacing}px;
  --radius: ${layout.radius}px;
}
`
}

/** JSON として書き出す。 */
export function designToJson(design: Design): string {
  return JSON.stringify(
    {
      color: design.color,
      font: { heading: design.font.heading, body: design.font.body, baseSize: `${design.font.baseSize}px` },
      layout: { spacing: `${design.layout.spacing}px`, radius: `${design.layout.radius}px` },
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

export function downloadDesignCss(design: Design, filename = 'design.css'): void {
  downloadText(designToCss(design), filename, 'text/css')
}

export function downloadDesignJson(design: Design, filename = 'design.json'): void {
  downloadText(designToJson(design), filename, 'application/json')
}

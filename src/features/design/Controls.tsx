import { useState } from 'react'
import { deriveSurface } from '../../model/system'
import { FONT_CHOICES, TEMPLATES } from '../../model/templates'
import { useDesignStore, type ColorRole } from '../../store/designStore'
import { ColorWheel } from './ColorWheel'

const SIZE_PRESETS = [
  { label: '小', value: 14 },
  { label: '標準', value: 16 },
  { label: '大', value: 18 },
]
const SPACING_PRESETS = [
  { label: '詰め', value: 16 },
  { label: '標準', value: 20 },
  { label: '広め', value: 24 },
]
const RADIUS_PRESETS = [
  { label: 'なし', value: 0 },
  { label: '小', value: 4 },
  { label: '中', value: 8 },
  { label: '大', value: 16 },
]

const COLOR_ROLES: Array<{ role: ColorRole; label: string }> = [
  { role: 'background', label: '背景' },
  { role: 'surface', label: '面' },
  { role: 'text', label: '本文' },
  { role: 'primary', label: 'プライマリ' },
  { role: 'accent', label: 'アクセント' },
]

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ label: string; value: number }>
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-md border py-1.5 text-sm ${
              option.value === value ? 'border-accent text-accent' : 'border-border text-ink hover:bg-surface'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function FontSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink"
      >
        {FONT_CHOICES.map((choice) => (
          <option key={choice.label} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Controls() {
  const { templateId, spec, applyTemplate, setColor, setHeading, setBody, setSizeBase, setSpacing, setRadius } =
    useDesignStore()
  const [colorRole, setColorRole] = useState<ColorRole>('primary')

  return (
    <div className="flex flex-col gap-6">
      {/* テンプレート */}
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">テンプレート</h2>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((template) => {
            const selected = template.id === templateId
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template.id, template.spec)}
                title={template.description}
                className={`flex flex-col gap-2 rounded-md border p-2 text-left ${
                  selected ? 'border-accent' : 'border-border hover:bg-surface'
                }`}
              >
                <span className="flex h-6 overflow-hidden rounded" style={{ border: '1px solid var(--color-border)' }}>
                  <span className="flex-1" style={{ backgroundColor: template.spec.colors.background }} />
                  <span className="flex-1" style={{ backgroundColor: template.spec.colors.primary }} />
                  <span className="flex-1" style={{ backgroundColor: template.spec.colors.accent }} />
                </span>
                <span className="text-xs font-medium">{template.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 配色（全色を自由に編集） */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">配色</h2>
        <p className="text-xs text-ink-muted">背景から全て、自由に編集できます。</p>

        <div className="grid grid-cols-3 gap-2">
          {COLOR_ROLES.map(({ role, label }) => (
            <button
              key={role}
              type="button"
              onClick={() => setColorRole(role)}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs ${
                role === colorRole ? 'border-accent text-accent' : 'border-border text-ink hover:bg-surface'
              }`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: spec.colors[role] }}
              />
              {label}
            </button>
          ))}
        </div>

        <ColorWheel value={spec.colors[colorRole]} onChange={(hex) => setColor(colorRole, hex)} />
        <input
          type="text"
          aria-label="選択中の色のHEX値"
          value={spec.colors[colorRole]}
          onChange={(e) => setColor(colorRole, e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
        />

        <button
          type="button"
          onClick={() => setColor('surface', deriveSurface(spec.colors.background))}
          className="rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface"
        >
          背景から面・ボーダーを生成
        </button>
      </section>

      {/* 書体・サイズ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">書体・サイズ</h2>
        <FontSelect label="見出しフォント" value={spec.fonts.heading} onChange={setHeading} />
        <FontSelect label="本文フォント" value={spec.fonts.body} onChange={setBody} />

        <Segmented label="文字サイズ" options={SIZE_PRESETS} value={spec.sizeBase} onChange={setSizeBase} />
        <Segmented label="余白" options={SPACING_PRESETS} value={spec.spacing} onChange={setSpacing} />
        <Segmented label="角丸" options={RADIUS_PRESETS} value={spec.radius} onChange={setRadius} />
      </section>
    </div>
  )
}

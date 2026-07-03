import { readableTextOn } from '../../model/palette'
import { usePaletteStore } from '../../store/paletteStore'
import {
  RADIUS_OPTIONS,
  RADIUS_PX,
  SPACING_OPTIONS,
  SPACING_PX,
  useLayoutStore,
  type RadiusPreset,
  type SpacingPreset,
} from '../../store/layoutStore'

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Array<{ id: T; label: string }>
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-2">
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`flex-1 rounded-md border py-2 text-sm ${
                selected ? 'border-accent text-accent' : 'border-border text-ink hover:bg-surface'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function LayoutDesigner() {
  const { spacing, radius, setSpacing, setRadius } = useLayoutStore()
  const main = usePaletteStore((s) => s.main)

  const gap = SPACING_PX[spacing]
  const pad = SPACING_PX[spacing]
  const rad = RADIUS_PX[radius]
  const onMain = readableTextOn(main)

  return (
    <div className="flex gap-8">
      {/* 左: レイアウトのコントロール */}
      <div className="flex w-80 shrink-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">レイアウト</h2>
          <p className="text-sm text-ink-muted">余白（間隔）と角丸の大きさを選びます。</p>
        </div>

        <Segmented<SpacingPreset>
          label="余白の広さ"
          options={SPACING_OPTIONS}
          value={spacing}
          onChange={setSpacing}
        />
        <Segmented<RadiusPreset> label="角丸" options={RADIUS_OPTIONS} value={radius} onChange={setRadius} />

        <p className="text-sm text-ink-muted">
          間隔 <span className="font-mono text-ink">{gap}px</span> ／ 角丸{' '}
          <span className="font-mono text-ink">{rad}px</span>
        </p>
      </div>

      {/* 右: ライブプレビュー */}
      <div className="flex-1">
        <div
          className="border border-border bg-surface"
          style={{ padding: pad, borderRadius: rad, display: 'flex', flexDirection: 'column', gap }}
        >
          <div
            className="border border-border bg-canvas"
            style={{ padding: pad, borderRadius: rad, display: 'flex', flexDirection: 'column', gap: gap / 2 }}
          >
            <p className="font-semibold">カードの見出し</p>
            <p className="text-sm text-ink-muted">
              余白と角丸を変えると、詰まった印象にもゆったりした印象にもなります。
            </p>
            <div style={{ display: 'flex', gap }}>
              <button
                type="button"
                style={{ backgroundColor: main, color: onMain, borderRadius: rad, padding: `${gap / 2}px ${gap}px` }}
                className="text-sm font-medium"
              >
                主ボタン
              </button>
              <button
                type="button"
                style={{ borderRadius: rad, padding: `${gap / 2}px ${gap}px` }}
                className="border border-border text-sm text-ink"
              >
                副ボタン
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: gap / 2 }}>
            {['項目 1', '項目 2', '項目 3'].map((item) => (
              <div
                key={item}
                className="border border-border bg-canvas text-sm"
                style={{ padding: pad, borderRadius: rad }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

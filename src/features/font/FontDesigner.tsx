import { FONT_OPTIONS, SIZE_OPTIONS, useFontStore } from '../../store/fontStore'

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
        {FONT_OPTIONS.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function FontDesigner() {
  const { heading, body, base, setHeading, setBody, setBase } = useFontStore()

  return (
    <div className="flex gap-8">
      {/* 左: フォントのコントロール */}
      <div className="flex w-80 shrink-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">フォント</h2>
          <p className="text-sm text-ink-muted">見出しと本文の書体、文字サイズを選びます。</p>
        </div>

        <FontSelect label="見出しフォント" value={heading} onChange={setHeading} />
        <FontSelect label="本文フォント" value={body} onChange={setBody} />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">文字サイズ</span>
          <div className="flex gap-2">
            {SIZE_OPTIONS.map((option) => {
              const selected = option.base === base
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setBase(option.base)}
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
      </div>

      {/* 右: ライブプレビュー */}
      <div className="flex-1">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-8">
          <p style={{ fontFamily: heading, fontSize: base * 2, fontWeight: 600, lineHeight: 1.2 }}>
            見出しテキスト
          </p>
          <p style={{ fontFamily: heading, fontSize: base * 1.375, fontWeight: 500, lineHeight: 1.3 }}>
            小見出しのテキスト
          </p>
          <p style={{ fontFamily: body, fontSize: base, lineHeight: 1.6 }}>
            本文のサンプルです。読みやすさは書体とサイズで大きく変わります。実際の文章を入れて、
            見出しと本文のバランスを確かめてください。The quick brown fox jumps over the lazy dog.
          </p>
          <p style={{ fontFamily: body, fontSize: base * 0.85, lineHeight: 1.5 }} className="text-ink-muted">
            キャプション・補足のテキスト（小さめ）
          </p>
        </div>
      </div>
    </div>
  )
}

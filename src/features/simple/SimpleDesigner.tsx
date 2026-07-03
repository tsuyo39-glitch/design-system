import { useState } from 'react'
import { readableTextOn } from '../../model/palette'
import { usePaletteStore, type Role } from '../../store/paletteStore'
import { ColorWheel } from '../token-editor/ColorWheel'

const ROLES: Array<{ id: Role; name: string; description: string; ratio: string }> = [
  { id: 'base', name: 'ベースカラー', description: '全体の基盤になる色。画面の大部分を占めます。', ratio: '75%' },
  {
    id: 'main',
    name: 'メインカラー',
    description: 'ロゴやキャッチフレーズなど主役に使う色。ベースの彩度を上げた色です。',
    ratio: '25%',
  },
  {
    id: 'accent',
    name: 'アクセントカラー',
    description: 'メインの反対色（補色）。ボタンなどの差し色に少しだけ使います。',
    ratio: '5%',
  },
]

/** 75:25:5 の割合バー。 */
function RatioBar({ base, main, accent }: { base: string; main: string; accent: string }) {
  return (
    <div className="flex h-6 overflow-hidden rounded-md border border-border">
      <div style={{ width: '75%', backgroundColor: base }} title="ベース 75%" />
      <div style={{ width: '20%', backgroundColor: main }} title="メイン 20%" />
      <div style={{ width: '5%', backgroundColor: accent }} title="アクセント 5%" />
    </div>
  )
}

/** カラー三役を使った 75:25:5 のサンプル画面。 */
function LivePreview({ base, main, accent }: { base: string; main: string; accent: string }) {
  const onBase = readableTextOn(base)
  const onMain = readableTextOn(main)
  const onAccent = readableTextOn(accent)

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div style={{ backgroundColor: base, color: onBase }} className="flex flex-col gap-6 p-8">
        <div className="flex items-center gap-2">
          <span style={{ backgroundColor: main }} className="h-6 w-6 rounded-full" />
          <span className="font-semibold">ブランド名</span>
        </div>

        <div style={{ backgroundColor: main, color: onMain }} className="flex flex-col gap-3 rounded-xl p-6">
          <p className="text-2xl font-semibold">キャッチフレーズがここに入ります</p>
          <p className="text-sm opacity-90">
            メインカラーは主役の面。見出しや目立たせたいカードに使います。
          </p>
          <div>
            <button
              type="button"
              style={{ backgroundColor: accent, color: onAccent }}
              className="rounded-md px-4 py-2 text-sm font-medium"
            >
              いますぐ始める
            </button>
          </div>
        </div>

        <p className="text-sm">
          本文テキストはベースの上に置きます。落ち着いた面を広くとり、主役とアクセントを少しだけ効かせるのがコツです。
        </p>
      </div>
    </div>
  )
}

export function SimpleDesigner() {
  const { base, main, accent, setBase, setMain, setAccent, regenerate } = usePaletteStore()
  const [activeRole, setActiveRole] = useState<Role>('base')

  const colorOf: Record<Role, string> = { base, main, accent }
  const setterOf: Record<Role, (hex: string) => void> = { base: setBase, main: setMain, accent: setAccent }
  const active = ROLES.find((r) => r.id === activeRole)!

  return (
    <div className="flex gap-8">
      {/* 左: カラー三役のコントロール */}
      <div className="flex w-80 shrink-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">カラーパレット</h2>
          <p className="text-sm text-ink-muted">3色を選ぶだけ。右の画面にすぐ反映されます。</p>
        </div>

        {/* 3役の切り替え兼スウォッチ */}
        <div className="flex gap-2">
          {ROLES.map((role) => {
            const selected = role.id === activeRole
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setActiveRole(role.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-md border p-2 ${
                  selected ? 'border-accent' : 'border-border hover:bg-surface'
                }`}
              >
                <span
                  className="h-8 w-full rounded border border-border"
                  style={{ backgroundColor: colorOf[role.id] }}
                />
                <span className="text-xs">{role.name.replace('カラー', '')}</span>
                <span className="font-mono text-xs text-ink-muted">{colorOf[role.id]}</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {active.name}
            <span className="ml-2 font-mono text-xs text-ink-muted">{active.ratio}</span>
          </p>
          <p className="text-sm text-ink-muted">{active.description}</p>
        </div>

        <ColorWheel value={colorOf[activeRole]} onChange={setterOf[activeRole]} />

        <div className="flex items-center gap-2">
          <span
            className="h-9 w-9 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: colorOf[activeRole] }}
          />
          <input
            type="text"
            aria-label={`${active.name}のHEX値`}
            value={colorOf[activeRole]}
            onChange={(e) => setterOf[activeRole](e.target.value)}
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-ink"
          />
        </div>

        <button
          type="button"
          onClick={regenerate}
          className="rounded-md border border-border px-3 py-2 text-sm text-ink hover:bg-surface"
        >
          ベースからメイン・アクセントを作り直す
        </button>
      </div>

      {/* 右: ライブプレビュー（同一画面・リアルタイム） */}
      <div className="flex flex-1 flex-col gap-3">
        <RatioBar base={base} main={main} accent={accent} />
        <LivePreview base={base} main={main} accent={accent} />
      </div>
    </div>
  )
}

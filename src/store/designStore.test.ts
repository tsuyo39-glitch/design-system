import { beforeEach, describe, expect, it } from 'vitest'
import { TEMPLATES } from '../model/templates'
import { useDesignStore } from './designStore'

describe('useDesignStore', () => {
  beforeEach(() => {
    const first = TEMPLATES[0]
    useDesignStore.setState({ templateId: first.id, spec: first.spec })
  })

  it('applyTemplate でテンプレートの spec を適用する', () => {
    const pop = TEMPLATES.find((t) => t.id === 'pop')!
    useDesignStore.getState().applyTemplate(pop.id, pop.spec)
    expect(useDesignStore.getState().templateId).toBe('pop')
    expect(useDesignStore.getState().spec.colors.primary).toBe(pop.spec.colors.primary)
  })

  it('setColor は該当ロールの色だけを更新し、他は保持する', () => {
    const before = useDesignStore.getState().spec.colors
    useDesignStore.getState().setColor('primary', '#123456')
    const after = useDesignStore.getState().spec.colors
    expect(after.primary).toBe('#123456')
    expect(after.accent).toBe(before.accent)
    expect(after.background).toBe(before.background)
  })

  it('サイズ・余白・角丸の微調整が反映される', () => {
    useDesignStore.getState().setSizeBase(18)
    useDesignStore.getState().setSpacing(24)
    useDesignStore.getState().setRadius(0)
    const spec = useDesignStore.getState().spec
    expect(spec.sizeBase).toBe(18)
    expect(spec.spacing).toBe(24)
    expect(spec.radius).toBe(0)
  })
})

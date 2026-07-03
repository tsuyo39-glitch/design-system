import type { TokenType } from './dtcg'

/** 型ごとのリテラル初期値。新規トークン作成時と、参照→リテラル切替時に使う。 */
export function defaultValueFor(type: TokenType): unknown {
  switch (type) {
    case 'color':
      return '#000000'
    case 'dimension':
      return '0px'
    case 'fontFamily':
      return []
    case 'fontWeight':
      return 400
    case 'number':
      return 0
    case 'duration':
      return '0ms'
    case 'cubicBezier':
      return [0, 0, 1, 1]
    case 'shadow':
      return { color: '#00000000', offsetX: '0px', offsetY: '0px', blur: '0px', spread: '0px' }
    case 'typography':
      // composite。空だと GUI 編集の足がかりが無いので標準サブキーを持たせる。
      return { fontFamily: ['sans-serif'], fontSize: '16px', fontWeight: 400, lineHeight: 1.5 }
  }
}

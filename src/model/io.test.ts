import { describe, expect, it } from 'vitest'
import { DtcgParseError, parseDocument, serializeDocument } from './io'

describe('parseDocument', () => {
  it('DTCG JSON をパースする', () => {
    const doc = parseDocument('{"color":{"$type":"color","brand":{"$value":"#6366F1"}}}')
    expect(doc).toEqual({ color: { $type: 'color', brand: { $value: '#6366F1' } } })
  })

  it('不正な JSON はエラーを投げる', () => {
    expect(() => parseDocument('{不正}')).toThrow(DtcgParseError)
  })

  it('ルートが配列の場合はエラーを投げる', () => {
    expect(() => parseDocument('[]')).toThrow(DtcgParseError)
  })
})

describe('serializeDocument', () => {
  it('import した内容を無編集で export すると意味的に同一の DTCG になる（round-trip）', () => {
    const original = '{"color":{"$type":"color","brand":{"$value":"#6366F1"}}}'
    const roundTripped = serializeDocument(parseDocument(original))
    expect(JSON.parse(roundTripped)).toEqual(JSON.parse(original))
  })
})

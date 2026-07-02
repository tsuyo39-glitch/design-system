import type { TokenDocument } from './dtcg'

export class DtcgParseError extends Error {}

/** DTCG JSON 文字列を TokenDocument にパースする。ルートはオブジェクトである必要がある。 */
export function parseDocument(json: string): TokenDocument {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch (cause) {
    throw new DtcgParseError('JSON として解析できません', { cause })
  }

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new DtcgParseError('DTCG ドキュメントのルートはオブジェクトである必要があります')
  }

  return data as TokenDocument
}

/** TokenDocument を DTCG JSON 文字列に書き出す。import したものを無編集で export すると同値になる。 */
export function serializeDocument(doc: TokenDocument): string {
  return JSON.stringify(doc, null, 2)
}

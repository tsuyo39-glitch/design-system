export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'number'
  | 'duration'
  | 'cubicBezier'
  | 'shadow'
  | 'typography'

export interface TokenExtensions {
  'com.tokens.mode'?: { dark?: unknown }
  [key: string]: unknown
}

export interface Token {
  $value: unknown
  $type?: TokenType
  $description?: string
  $extensions?: TokenExtensions
}

export interface Group {
  $type?: TokenType
  $description?: string
  [key: string]: Group | Token | TokenType | string | undefined
}

export type TokenDocument = Group

/** $value を持てば Token、持たなければ Group（$ 始まりのメタキーは判定に使わない）。 */
export function isToken(node: Group | Token): node is Token {
  return '$value' in node
}

export function isMetaKey(key: string): boolean {
  return key.startsWith('$')
}

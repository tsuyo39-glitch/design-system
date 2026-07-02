import { create } from 'zustand'
import type { TokenDocument } from '../model/dtcg'
import { parseDocument } from '../model/io'
import sampleDocument from '../../design-system/tokens.json'

interface DocumentState {
  /** ユーザーが編集中のドキュメント。アプリ chrome のテーマ（src/styles/tokens.css）とは別系統。 */
  document: TokenDocument
  /** token-list で選択中のトークンのドット区切りパス。 */
  selectedPath: string | null
  loadSample: () => void
  newDocument: () => void
  importDocument: (json: string) => void
  select: (path: string | null) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: sampleDocument as TokenDocument,
  selectedPath: null,
  loadSample: () => set({ document: sampleDocument as TokenDocument, selectedPath: null }),
  newDocument: () => set({ document: {}, selectedPath: null }),
  importDocument: (json) => set({ document: parseDocument(json), selectedPath: null }),
  select: (path) => set({ selectedPath: path }),
}))

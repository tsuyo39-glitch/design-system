import { create } from 'zustand'
import type { TokenDocument } from '../model/dtcg'
import { parseDocument } from '../model/io'
import sampleDocument from '../../design-system/tokens.json'

interface DocumentState {
  /** ユーザーが編集中のドキュメント。アプリ chrome のテーマ（src/styles/tokens.css）とは別系統。 */
  document: TokenDocument
  loadSample: () => void
  newDocument: () => void
  importDocument: (json: string) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: sampleDocument as TokenDocument,
  loadSample: () => set({ document: sampleDocument as TokenDocument }),
  newDocument: () => set({ document: {} }),
  importDocument: (json) => set({ document: parseDocument(json) }),
}))

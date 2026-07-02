import { create } from 'zustand'
import type { TokenDocument, TokenType } from '../model/dtcg'
import { parseDocument } from '../model/io'
import { deleteNode, insertToken, renameNode } from '../model/mutate'
import { setTokenValue } from '../model/resolve'
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
  setValue: (path: string, value: unknown) => void
  addToken: (path: string, type: TokenType) => void
  removeNode: (path: string) => void
  rename: (path: string, newName: string) => void
}

/** 削除されたパス、またはその子孫を選択中だったら選択を外す。 */
function clearSelectionIfUnder(selectedPath: string | null, removed: string): string | null {
  if (selectedPath === null) return null
  if (selectedPath === removed || selectedPath.startsWith(`${removed}.`)) return null
  return selectedPath
}

/** 改名されたパス、またはその子孫を選択中だったら、選択パスを新パスへ付け替える。 */
function remapSelection(selectedPath: string | null, oldPath: string, newPath: string): string | null {
  if (selectedPath === null) return null
  if (selectedPath === oldPath) return newPath
  if (selectedPath.startsWith(`${oldPath}.`)) return newPath + selectedPath.slice(oldPath.length)
  return selectedPath
}

export const useDocumentStore = create<DocumentState>((set) => ({
  document: sampleDocument as TokenDocument,
  selectedPath: null,
  loadSample: () => set({ document: sampleDocument as TokenDocument, selectedPath: null }),
  newDocument: () => set({ document: {}, selectedPath: null }),
  importDocument: (json) => set({ document: parseDocument(json), selectedPath: null }),
  select: (path) => set({ selectedPath: path }),
  setValue: (path, value) => set((state) => ({ document: setTokenValue(state.document, path, value) })),
  addToken: (path, type) =>
    set((state) => ({ document: insertToken(state.document, path, type), selectedPath: path })),
  removeNode: (path) =>
    set((state) => ({
      document: deleteNode(state.document, path),
      selectedPath: clearSelectionIfUnder(state.selectedPath, path),
    })),
  rename: (path, newName) =>
    set((state) => {
      const document = renameNode(state.document, path, newName)
      const parentKeys = path.split('.').slice(0, -1)
      const newPath = [...parentKeys, newName].join('.')
      return { document, selectedPath: remapSelection(state.selectedPath, path, newPath) }
    }),
}))

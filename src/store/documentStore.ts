import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TokenDocument, TokenType } from '../model/dtcg'
import { parseDocument } from '../model/io'
import { deleteNode, insertToken, renameNode } from '../model/mutate'
import { findNode, setTokenValue } from '../model/resolve'
import sampleDocument from '../../design-system/tokens.json'

/** localStorage の保存キー。ユーザー編集ドキュメント専用（chrome テーマとは別系統）。 */
export const STORAGE_KEY = 'ds-builder:document'

/** Undo 履歴の上限。ドラッグ編集は coalesce するので通常はここまで貯まらない。 */
const HISTORY_LIMIT = 200

function isPlainObject(value: unknown): value is TokenDocument {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function pathExists(doc: TokenDocument, path: string | null): boolean {
  if (path === null) return true
  try {
    findNode(doc, path)
    return true
  } catch {
    return false
  }
}

interface DocumentState {
  /** ユーザーが編集中のドキュメント。アプリ chrome のテーマ（src/styles/tokens.css）とは別系統。 */
  document: TokenDocument
  /** token-list で選択中のトークンのドット区切りパス。 */
  selectedPath: string | null
  /** Undo/Redo 用のドキュメントスナップショット履歴（永続化しない）。 */
  past: TokenDocument[]
  future: TokenDocument[]
  /** 直前の編集対象パス。同一パスの連続編集（ドラッグ等）を1履歴にまとめるための印。 */
  lastEditPath: string | null
  loadSample: () => void
  newDocument: () => void
  importDocument: (json: string) => void
  select: (path: string | null) => void
  setValue: (path: string, value: unknown) => void
  addToken: (path: string, type: TokenType) => void
  removeNode: (path: string) => void
  rename: (path: string, newName: string) => void
  undo: () => void
  redo: () => void
}

/**
 * ドキュメントを変える操作の履歴管理を一手に引き受ける。
 * coalesceKey が直前の編集と同じなら past に積まず前の履歴に上書き（ドラッグを1ステップに）。
 */
function historyFields(
  state: DocumentState,
  coalesceKey: string | null,
): Pick<DocumentState, 'past' | 'future' | 'lastEditPath'> {
  const coalesce = coalesceKey !== null && coalesceKey === state.lastEditPath
  return {
    past: coalesce ? state.past : [...state.past, state.document].slice(-HISTORY_LIMIT),
    future: [],
    lastEditPath: coalesceKey,
  }
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

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      document: sampleDocument as TokenDocument,
      selectedPath: null,
      past: [],
      future: [],
      lastEditPath: null,
      loadSample: () =>
        set((state) => ({
          document: sampleDocument as TokenDocument,
          selectedPath: null,
          ...historyFields(state, null),
        })),
      newDocument: () =>
        set((state) => ({ document: {}, selectedPath: null, ...historyFields(state, null) })),
      importDocument: (json) =>
        set((state) => ({ document: parseDocument(json), selectedPath: null, ...historyFields(state, null) })),
      // 選択は履歴を積まないが、次の編集を新しい履歴にしたいので coalesce の印は消す。
      select: (path) => set({ selectedPath: path, lastEditPath: null }),
      setValue: (path, value) =>
        set((state) => ({
          document: setTokenValue(state.document, path, value),
          ...historyFields(state, path),
        })),
      addToken: (path, type) =>
        set((state) => ({
          document: insertToken(state.document, path, type),
          selectedPath: path,
          ...historyFields(state, null),
        })),
      removeNode: (path) =>
        set((state) => ({
          document: deleteNode(state.document, path),
          selectedPath: clearSelectionIfUnder(state.selectedPath, path),
          ...historyFields(state, null),
        })),
      rename: (path, newName) =>
        set((state) => {
          const document = renameNode(state.document, path, newName)
          const parentKeys = path.split('.').slice(0, -1)
          const newPath = [...parentKeys, newName].join('.')
          return {
            document,
            selectedPath: remapSelection(state.selectedPath, path, newPath),
            ...historyFields(state, null),
          }
        }),
      undo: () =>
        set((state) => {
          if (state.past.length === 0) return {}
          const previous = state.past[state.past.length - 1]
          return {
            document: previous,
            past: state.past.slice(0, -1),
            future: [state.document, ...state.future],
            selectedPath: pathExists(previous, state.selectedPath) ? state.selectedPath : null,
            lastEditPath: null,
          }
        }),
      redo: () =>
        set((state) => {
          if (state.future.length === 0) return {}
          const next = state.future[0]
          return {
            document: next,
            past: [...state.past, state.document].slice(-HISTORY_LIMIT),
            future: state.future.slice(1),
            selectedPath: pathExists(next, state.selectedPath) ? state.selectedPath : null,
            lastEditPath: null,
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // 保存するのは編集ドキュメントのみ。選択状態は一時的なので永続化しない。
      partialize: (state) => ({ document: state.document }),
      // 壊れた保存値（配列・非オブジェクト）は無視して初期ドキュメントを保つ。
      merge: (persisted, current) => {
        const doc = (persisted as { document?: unknown } | undefined)?.document
        return { ...current, document: isPlainObject(doc) ? doc : current.document }
      },
    },
  ),
)

"use client"

import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import { Draft } from "immer"
import { nanoid } from "nanoid"
import { ComponentNode, PageSchema, BuilderState, AppConfig } from "@/types/builder"
import { registry } from "@/registry/index"

const MAX_HISTORY = 50

type StoreType = BuilderState & BuilderActions

function createPage(name: string, path: string): PageSchema {
  return { id: nanoid(8), name, path, nodes: {}, rootIds: [] }
}

function snapshotState(
  state: Pick<BuilderState, "pages" | "currentPageId">
): { pages: PageSchema[]; currentPageId: string } {
  return {
    pages: JSON.parse(JSON.stringify(state.pages)) as PageSchema[],
    currentPageId: state.currentPageId,
  }
}

function removeNodeRecursive(
  nodes: Draft<Record<string, ComponentNode>>,
  id: string
) {
  const node = nodes[id]
  if (!node) return
  node.children.forEach((childId) => removeNodeRecursive(nodes, childId))
  delete nodes[id]
}

interface BuilderActions {
  addNode: (type: string, parentId: string | null, insertIndex?: number) => string
  removeNode: (id: string) => void
  moveNode: (id: string, newParentId: string | null, insertIndex: number) => void
  updateProp: (id: string, key: string, value: unknown) => void
  setSelected: (id: string | null) => void
  addPage: (name: string) => void
  removePage: (id: string) => void
  setCurrentPage: (id: string) => void
  renamePage: (id: string, name: string) => void
  setViewport: (viewport: BuilderState["viewport"]) => void
  undo: () => void
  redo: () => void
  pushHistory: () => void
  clearCanvas: () => void
  updateAppConfig: (config: Partial<AppConfig>) => void
}

const firstPage = createPage("Trang chủ", "/")

export const useBuilderStore = create<StoreType>()(
  immer((set, get) => ({
    pages: [firstPage],
    currentPageId: firstPage.id,
    selectedId: null,
    viewport: "mobile" as const,
    history: [] as { pages: PageSchema[]; currentPageId: string }[],
    historyIndex: -1,
    appConfig: {
      title: "My Zalo App",
      themeColor: "#0068FF",
      statusBar: "transparent" as const,
      actionBarHidden: true,
      appId: "",
      localUrl: "",
    },

    pushHistory: () => {
      set((state: Draft<StoreType>) => {
        const snap = snapshotState(state)
        const sliced = state.history.slice(0, state.historyIndex + 1)
        sliced.push(snap)
        if (sliced.length > MAX_HISTORY) sliced.shift()
        state.history = sliced
        state.historyIndex = sliced.length - 1
      })
    },

    addNode: (type: string, parentId: string | null, insertIndex?: number) => {
      const def = registry[type]
      if (!def) return ""
      const id = nanoid(8)
      get().pushHistory()
      set((state: Draft<StoreType>) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return
        page.nodes[id] = { id, type, props: { ...def.defaultProps }, children: [], parentId }
        if (parentId) {
          const parent = page.nodes[parentId]
          if (parent) {
            const idx = insertIndex ?? parent.children.length
            parent.children.splice(idx, 0, id)
          }
        } else {
          const idx = insertIndex ?? page.rootIds.length
          page.rootIds.splice(idx, 0, id)
        }
      })
      return id
    },

    removeNode: (id: string) => {
      get().pushHistory()
      set((state: Draft<StoreType>) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return
        const node = page.nodes[id]
        if (!node) return
        if (node.parentId) {
          const parent = page.nodes[node.parentId]
          if (parent) parent.children = parent.children.filter((c) => c !== id)
        } else {
          page.rootIds = page.rootIds.filter((r) => r !== id)
        }
        removeNodeRecursive(page.nodes, id)
        if (state.selectedId === id) state.selectedId = null
      })
    },

    moveNode: (id: string, newParentId: string | null, insertIndex: number) => {
      get().pushHistory()
      set((state: Draft<StoreType>) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return
        const node = page.nodes[id]
        if (!node) return
        if (node.parentId) {
          const oldParent = page.nodes[node.parentId]
          if (oldParent) oldParent.children = oldParent.children.filter((c) => c !== id)
        } else {
          page.rootIds = page.rootIds.filter((r) => r !== id)
        }
        node.parentId = newParentId
        if (newParentId) {
          const newParent = page.nodes[newParentId]
          if (newParent) newParent.children.splice(insertIndex, 0, id)
        } else {
          page.rootIds.splice(insertIndex, 0, id)
        }
      })
    },

    updateProp: (id: string, key: string, value: unknown) => {
      set((state: Draft<StoreType>) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (page?.nodes[id]) page.nodes[id].props[key] = value
      })
    },

    setSelected: (id: string | null) =>
      set((state: Draft<StoreType>) => { state.selectedId = id }),

    addPage: (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
      const newPage = createPage(name, `/${slug}`)
      set((state: Draft<StoreType>) => {
        state.pages.push(newPage as Draft<PageSchema>)
        state.currentPageId = newPage.id
        state.selectedId = null
      })
    },

    removePage: (id: string) => {
      set((state: Draft<StoreType>) => {
        if (state.pages.length <= 1) return
        state.pages = state.pages.filter((p) => p.id !== id)
        if (state.currentPageId === id) state.currentPageId = state.pages[0].id
        state.selectedId = null
      })
    },

    setCurrentPage: (id: string) =>
      set((state: Draft<StoreType>) => {
        state.currentPageId = id
        state.selectedId = null
      }),

    renamePage: (id: string, name: string) =>
      set((state: Draft<StoreType>) => {
        const page = state.pages.find((p) => p.id === id)
        if (page) page.name = name
      }),

    setViewport: (viewport: BuilderState["viewport"]) =>
      set((state: Draft<StoreType>) => { state.viewport = viewport }),

    clearCanvas: () => {
      get().pushHistory()
      set((state: Draft<StoreType>) => {
        const page = state.pages.find((p) => p.id === state.currentPageId)
        if (!page) return
        page.nodes = {}
        page.rootIds = []
        state.selectedId = null
      })
    },

    updateAppConfig: (config: Partial<AppConfig>) =>
      set((state: Draft<StoreType>) => { Object.assign(state.appConfig, config) }),

    undo: () =>
      set((state: Draft<StoreType>) => {
        if (state.historyIndex <= 0) return
        state.historyIndex -= 1
        const snap = state.history[state.historyIndex]
        state.pages = snap.pages as Draft<PageSchema>[]
        state.currentPageId = snap.currentPageId
        state.selectedId = null
      }),

    redo: () =>
      set((state: Draft<StoreType>) => {
        if (state.historyIndex >= state.history.length - 1) return
        state.historyIndex += 1
        const snap = state.history[state.historyIndex]
        state.pages = snap.pages as Draft<PageSchema>[]
        state.currentPageId = snap.currentPageId
        state.selectedId = null
      }),
  }))
)

export const selectCurrentPage = (state: StoreType) =>
  state.pages.find((p) => p.id === state.currentPageId)

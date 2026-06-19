# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A visual no-code/low-code builder for Zalo Mini Apps. Users drag components onto a canvas, edit properties, and export production-ready TypeScript/React code targeting the Zalo Mini App platform (`zmp-ui`, `zmp-sdk`).

The repo has two sub-projects:
- `react-builder/` — the Next.js builder application
- `template/` — a starter Zalo Mini App that also represents the export target format

---

## react-builder

### Commands

```bash
cd react-builder
npm run dev      # Start dev server (Next.js)
npm run build    # Production build
npm run lint     # ESLint
```

### Important: Next.js version warning

This project uses **Next.js 16** (App Router). Read `node_modules/next/dist/docs/` before writing any Next.js-specific code — APIs and conventions may differ from training data. `react-builder/AGENTS.md` repeats this warning for agent context.

### Architecture

**Three-layer design:**

1. **Types** (`src/types/builder.ts`) — shared data model
   - `ComponentNode`: a node on the canvas (`id`, `type`, `props`, `children[]`, `parentId`)
   - `PageSchema`: a page (`id`, `name`, `path`, `nodes` flat map, `rootIds[]`)
   - `ComponentDefinition`: blueprint for a component type (`propSchema`, `renderer`, `acceptsChildren`, etc.)
   - `BuilderState`: full store shape (pages, history, viewport, appConfig)

2. **Registry** (`src/registry/index.tsx`) — all available components defined here
   - 18 component definitions across 4 categories: `zalo`, `layout`, `ui`, `form`
   - Each entry has: `propSchema` (drives the properties panel UI), `defaultProps`, `renderer` (live preview), `acceptsChildren`
   - **To add a new component**: add a `ComponentDefinition` entry to the registry and a matching entry in `ZMP_COMPONENT_MAP` in `src/lib/exportCode.ts`

3. **Store** (`src/store/builderStore.ts`) — Zustand + Immer
   - Single store manages all builder state: pages, nodes, selection, viewport, undo/redo history (50-step cap), appConfig
   - Nodes are stored as a flat map per page (`page.nodes: Record<string, ComponentNode>`) with a `rootIds[]` array for ordering — this is a virtual DOM tree, not a nested structure
   - Mutations always call `pushHistory()` before `set()` to enable undo
   - `selectCurrentPage` is the primary derived selector exported from the store

**Code export** (`src/lib/exportCode.ts`):
- `exportToZMP({ pages, appConfig })` → `Record<string, string>` (filename → content)
- Generates: `src/pages/*.tsx`, `src/components/layout.tsx`, `app-config.json`
- Builder types map to `zmp-ui` components via `ZMP_COMPONENT_MAP`
- `ZaloPage`, `ZaloHeader`, `ZaloBottomNav`, etc. are builder-internal type names; they export as `Page`, `Header`, `BottomNavigation`, etc.
- Gotcha: `ZaloSearchBar` and `ZaloInput` both map to `Input` in `ZMP_COMPONENT_MAP` — they share the same zmp-ui component
- `exportToReact` (bottom of file) is a legacy single-page export, kept for compatibility; prefer `exportToZMP`

**Canvas rendering** (`src/components/builder/`):
- `BuilderDnd.tsx` wraps the canvas in a dnd-kit `DndContext`
- `Canvas.tsx` renders the current page's `rootIds` as a list of `CanvasNode` components
- `CanvasNode.tsx` recursively renders nodes, handles click-to-select and drop-zone highlighting
- `PropertiesPanel.tsx` reads `propSchema` from the registry to render the correct input type per prop (`string`, `number`, `boolean`, `color`, `select`, `textarea`)

**Drag-and-drop system** (`BuilderDnd.tsx`, `CanvasNode.tsx`):

There are two distinct drag sources:
- **Panel drag** (`active.data.current.isPanel === true`): drags a new component type string from `ComponentPanel`; on drop calls `addNode(nodeType, parentId, index)`
- **Canvas drag** (no `isPanel`): drags an existing node by its `id`; on drop calls `moveNode(id, parentId, index)`

Drop targets carry `{ parentId: string | null, index: number }` in their data. Two target types:
- `DropZone` — a thin visual gap between sibling nodes; id format `dropzone__${parentId ?? "root"}__${index}`
- `CanvasNode` container (when `acceptsChildren: true`) — id format `node__${id}`; appends after existing children

Collision detection uses `pointerWithin` first, falling back to `closestCenter`.

**History / undo nuance:**

`updateProp` deliberately skips `pushHistory()` — live prop edits during typing do not create history entries. All structural mutations (`addNode`, `removeNode`, `moveNode`, `clearCanvas`) always call `pushHistory()` first. History cap is 50 snapshots (full deep-cloned page state).

---

## template

### Commands

```bash
cd template
npm run start    # Start Zalo dev server (zmp start)
npm login        # Authenticate with Zalo
npm run deploy   # Deploy to Zalo
```

### Structure

The template is the **target format** for exported builder code. Understanding it helps when modifying `exportCode.ts`:
- Entry: `src/app.ts` mounts `<Layout />`
- Layout: `src/components/layout.tsx` — `App > SnackbarProvider > ZMPRouter > AnimationRoutes > Route[]`
- Pages: `src/pages/*.tsx` — each is a `<Page>` component using `zmp-ui` primitives
- State: Jotai atoms (lightweight, no context boilerplate)
- Styles: Tailwind 3 via `src/css/tailwind.scss` + `src/css/app.scss`
- Config: `app-config.json` — Zalo app metadata (title, statusBar, actionBarHidden)

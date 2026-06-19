# Component Panel UX Improvement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace inconsistent emoji/text icons in the component panel with Remix Icons (react-icons/ri) and add a hover tooltip showing a live renderer preview of each component.

**Architecture:** Three sequential tasks — (1) install dependency + update the shared `ComponentDefinition` type, (2) update the registry to use icon components and add descriptions, (3) rewrite `ComponentPanel` with tooltip state. Each task is independently lint-verifiable.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, react-icons v5, dnd-kit (unchanged)

## Global Constraints

- Working directory for all commands: `react-builder/`
- Do NOT change drag-and-drop logic in `BuilderDnd.tsx`, `CanvasNode.tsx`, or `builderStore.ts`
- Do NOT add or remove component definitions from the registry (only update icon + description fields)
- All Tailwind classes must use the existing dark palette: `bg-[#141417]`, `bg-[#1E1E24]`, `border-[#2A2A32]`, accent `#0068FF`
- Panel stays `w-52` (208px); tooltip is fixed-position at `left: 216px`
- Tooltip must have `pointer-events-none` — must not interfere with drag-and-drop
- No new files beyond what's listed; no test framework setup (project has none)

---

### Task 1: Install react-icons and update ComponentDefinition type

**Files:**
- Modify: `package.json` (add dependency)
- Modify: `src/types/builder.ts:18-39` (change `icon` type, add `description`)

**Interfaces:**
- Produces: `ComponentDefinition.icon: React.ElementType` and `ComponentDefinition.description?: string` — consumed by Tasks 2 and 3

- [ ] **Step 1: Install react-icons**

```bash
npm install react-icons
```

Expected: `react-icons` appears in `package.json` dependencies, no errors.

- [ ] **Step 2: Update `src/types/builder.ts`**

Replace the entire file with:

```ts
import type React from "react"

export type PropType = "string" | "number" | "boolean" | "color" | "select" | "textarea"

export interface PropSchema {
  label: string
  type: PropType
  defaultValue: unknown
  options?: string[]
}

export interface ComponentNode {
  id: string
  type: string
  props: Record<string, unknown>
  children: string[]
  parentId: string | null
}

export interface ComponentDefinition {
  type: string
  label: string
  /** A react-icons component, e.g. RiLayoutLine */
  icon: React.ElementType
  description?: string
  category: "layout" | "ui" | "form" | "zalo"
  propSchema: Record<string, PropSchema>
  defaultProps: Record<string, unknown>
  acceptsChildren: boolean
  renderer: (props: Record<string, unknown>, children?: React.ReactNode) => React.ReactElement
  zmpComponent?: string
  /** Named exports to import from "zmp-ui" when this component is used */
  zmpImports?: string[]
  /**
   * Generate the JSX string for code export.
   * renderChildren(level) renders all children indented at the given level.
   */
  toJSX?: (
    props: Record<string, unknown>,
    renderChildren: (level: number) => string,
    level: number
  ) => string
}

export interface PageSchema {
  id: string
  name: string
  path: string
  nodes: Record<string, ComponentNode>
  rootIds: string[]
}

export interface AppConfig {
  title: string
  themeColor: string
  statusBar: "transparent" | "white" | "auto"
  actionBarHidden: boolean
  appId: string
  localUrl: string
}

export interface BuilderState {
  pages: PageSchema[]
  currentPageId: string
  selectedId: string | null
  viewport: "desktop" | "tablet" | "mobile"
  history: { pages: PageSchema[]; currentPageId: string }[]
  historyIndex: number
  appConfig: AppConfig
}
```

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: TypeScript errors about `icon: string` in the registry and ComponentPanel — these are expected and will be fixed in Tasks 2–3. If there are errors ONLY in those two files, proceed. If errors are elsewhere, investigate.

- [ ] **Step 4: Commit**

```bash
git add src/types/builder.ts package.json package-lock.json
git commit -m "feat: add react-icons dep, update ComponentDefinition icon type + description field"
```

---

### Task 2: Update registry — replace icons and add descriptions

**Files:**
- Modify: `src/registry/index.tsx` (all 14 `ComponentDefinition` objects + `categoryOrder`)

**Interfaces:**
- Consumes: `ComponentDefinition.icon: React.ElementType`, `ComponentDefinition.description?: string` from Task 1
- Produces: registry with react-icons component references as `icon` values — consumed by Task 3

- [ ] **Step 1: Add react-icons imports at top of `src/registry/index.tsx`**

Insert after `import { JSX } from "react"`:

```tsx
import {
  RiLayoutLine,
  RiMenuLine,
  RiApps2Line,
  RiSquareLine,
  RiListUnordered,
  RiUserLine,
  RiPriceTag3Line,
  RiCursorLine,
  RiInputMethodLine,
  RiSearchLine,
  RiLayoutRowLine,
  RiLayoutColumnLine,
  RiSeparatorLine,
  RiFileTextLine,
  RiImageLine,
} from "react-icons/ri"
```

> **If any icon causes an "export not found" error** after running lint, check the exact name at https://react-icons.github.io/react-icons/icons/ri/ and replace. Safe fallbacks: `RiSquareLine` → `RiRectangleLine`; `RiSeparatorLine` → `RiLayoutBottomLine`; `RiLayoutRowLine` → `RiLayout4Line`.

- [ ] **Step 2: Update `textDef`**

Change:
```tsx
icon: "T",
```
To:
```tsx
icon: RiFileTextLine,
description: "Khối văn bản tùy chỉnh — tiêu đề, đoạn văn, span",
```

- [ ] **Step 3: Update `imageDef`**

Change:
```tsx
icon: "🖼",
```
To:
```tsx
icon: RiImageLine,
description: "Hình ảnh với tùy chọn bo góc và object-fit",
```

- [ ] **Step 4: Update `stackDef`**

Change:
```tsx
icon: "☰",
```
To:
```tsx
icon: RiLayoutColumnLine,
description: "Container xếp chồng dọc hoặc ngang với gap tùy chỉnh",
```

- [ ] **Step 5: Update `dividerDef`**

Change:
```tsx
icon: "—",
```
To:
```tsx
icon: RiSeparatorLine,
description: "Đường kẻ phân cách giữa các phần nội dung",
```

- [ ] **Step 6: Update `zaloBtnDef`**

Change:
```tsx
icon: "🔵",
```
To:
```tsx
icon: RiCursorLine,
description: "Nút bấm với kiểu primary, secondary hoặc tertiary",
```

- [ ] **Step 7: Update `zaloInputDef`**

Change:
```tsx
icon: "✏️",
```
To:
```tsx
icon: RiInputMethodLine,
description: "Ô nhập liệu có label, placeholder và validation",
```

- [ ] **Step 8: Update `zaloHeaderDef`**

Change:
```tsx
icon: "🔝",
```
To:
```tsx
icon: RiMenuLine,
description: "Thanh tiêu đề cố định trên cùng của trang ZMP",
```

- [ ] **Step 9: Update `zaloBottomNavDef`**

Change:
```tsx
icon: "⬛",
```
To:
```tsx
icon: RiApps2Line,
description: "Thanh điều hướng dưới cùng với tối đa 3 tab",
```

- [ ] **Step 10: Update `zaloCardDef`**

Change:
```tsx
icon: "🃏",
```
To:
```tsx
icon: RiSquareLine,
description: "Khung card nền trắng có bo góc và shadow",
```

- [ ] **Step 11: Update `zaloListItemDef`**

Change:
```tsx
icon: "≡",
```
To:
```tsx
icon: RiListUnordered,
description: "Mục danh sách với tiêu đề, mô tả và tùy chọn avatar",
```

- [ ] **Step 12: Update `zaloAvatarDef`**

Change:
```tsx
icon: "👤",
```
To:
```tsx
icon: RiUserLine,
description: "Ảnh đại diện hình tròn với fallback initials",
```

- [ ] **Step 13: Update `zaloTagDef`**

Change:
```tsx
icon: "🏷️",
```
To:
```tsx
icon: RiPriceTag3Line,
description: "Nhãn phân loại màu sắc — blue, green, red, v.v.",
```

- [ ] **Step 14: Update `zaloSearchBarDef`**

Change:
```tsx
icon: "🔍",
```
To:
```tsx
icon: RiSearchLine,
description: "Thanh tìm kiếm với placeholder tùy chỉnh",
```

- [ ] **Step 15: Update `zaloSectionDef`**

Change:
```tsx
icon: "§",
```
To:
```tsx
icon: RiLayoutRowLine,
description: "Tiêu đề mục với link 'xem thêm' tùy chọn",
```

- [ ] **Step 16: Update `zaloPageDef`**

Change:
```tsx
icon: "📄",
```
To:
```tsx
icon: RiLayoutLine,
description: "Trang chính của ứng dụng ZMP — wrapper cho toàn bộ nội dung",
```

- [ ] **Step 17: Remove "form" from `categoryOrder`**

Change:
```tsx
export const categoryOrder = ["zalo", "layout", "ui", "form"] as const
export type CategoryKey = (typeof categoryOrder)[number]
```
To:
```tsx
export const categoryOrder = ["zalo", "layout", "ui"] as const
export type CategoryKey = (typeof categoryOrder)[number]
```

- [ ] **Step 18: Verify lint passes with zero errors**

```bash
npm run lint
```

Expected: Only remaining error should be in `ComponentPanel.tsx` (still uses `def.icon` as string). Zero errors in `registry/index.tsx` or `types/builder.ts`.

- [ ] **Step 19: Commit**

```bash
git add src/registry/index.tsx
git commit -m "feat: replace emoji/text icons with react-icons/ri, add component descriptions"
```

---

### Task 3: Rewrite ComponentPanel with card polish and hover tooltip

**Files:**
- Modify: `src/components/builder/ComponentPanel.tsx` (full rewrite)

**Interfaces:**
- Consumes: `ComponentDefinition.icon: React.ElementType`, `ComponentDefinition.description?: string` from Tasks 1–2
- Consumes: `registry`, `categoryOrder` from `src/registry/index`
- Produces: updated panel UI with tooltip — no interface changes for consumers

- [ ] **Step 1: Replace `ComponentPanel.tsx` with the full implementation below**

```tsx
"use client"

import React, { useState, useRef } from "react"
import { useDraggable } from "@dnd-kit/core"
import { registry, categoryOrder } from "@/registry/index"
import { ComponentDefinition } from "@/types/builder"
import { cn } from "@/lib/utils"

// ─── Tooltip ────────────────────────────────────────────────────────────────

const categoryChipClass: Record<string, string> = {
  zalo: "bg-blue-950 text-blue-400",
  layout: "bg-purple-950 text-purple-400",
  ui: "bg-emerald-950 text-emerald-400",
}

const categoryLabels: Record<string, string> = {
  zalo: "Zalo UI",
  layout: "Layout",
  ui: "Content",
}

function ComponentTooltip({ def, y }: { def: ComponentDefinition; y: number }) {
  const maxY = typeof window !== "undefined" ? window.innerHeight - 260 : 400
  const clampedY = Math.max(8, Math.min(y, maxY))
  const Icon = def.icon as React.FC<{ size?: number; className?: string }>

  return (
    <div
      className="fixed z-50 w-56 rounded-xl border border-[#2A2A32] bg-[#1E1E24] shadow-2xl p-3 pointer-events-none"
      style={{ left: 216, top: clampedY }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={18} className="text-zinc-300 shrink-0" />
        <span className="text-sm font-semibold text-zinc-100 flex-1 truncate">
          {def.label}
        </span>
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
            categoryChipClass[def.category] ?? "bg-zinc-800 text-zinc-400"
          )}
        >
          {categoryLabels[def.category] ?? def.category}
        </span>
      </div>

      {/* Live preview */}
      <div
        className="bg-white rounded-lg overflow-hidden mb-2.5"
        style={{ height: 88 }}
      >
        <div
          style={{
            transform: "scale(0.75)",
            transformOrigin: "top left",
            width: "133%",
            pointerEvents: "none",
          }}
        >
          {def.renderer(def.defaultProps, null)}
        </div>
      </div>

      {/* Description */}
      {def.description && (
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          {def.description}
        </p>
      )}
    </div>
  )
}

// ─── Draggable card ──────────────────────────────────────────────────────────

interface DraggableComponentItemProps {
  def: ComponentDefinition
  onHover: (def: ComponentDefinition, y: number) => void
  onLeave: () => void
}

function DraggableComponentItem({
  def,
  onHover,
  onLeave,
}: DraggableComponentItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel__${def.type}`,
    data: { isPanel: true, nodeType: def.type },
  })

  const Icon = def.icon as React.FC<{ size?: number; className?: string }>

  function handleMouseEnter(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect()
    onHover(def, rect.top)
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-lg cursor-grab select-none transition-all duration-150",
        "bg-[#1E1E24] border border-[#2A2A32]",
        "hover:border-[#0068FF]/50 hover:bg-[#1A1D2E]",
        isDragging && "opacity-40 cursor-grabbing scale-95"
      )}
    >
      <Icon
        size={18}
        className={cn(
          "transition-colors duration-150",
          isDragging ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-200"
        )}
      />
      <span className="text-[11px] text-zinc-500 font-medium leading-none tracking-tight text-center">
        {def.label}
      </span>
    </div>
  )
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function ComponentPanel() {
  const [search, setSearch] = useState("")
  const [tooltip, setTooltip] = useState<{
    def: ComponentDefinition
    y: number
  } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showTooltip(def: ComponentDefinition, y: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setTooltip({ def, y }), 150)
  }

  function hideTooltip() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTooltip(null)
  }

  const grouped = categoryOrder.reduce(
    (acc, cat) => {
      const items = Object.values(registry).filter(
        (d) =>
          d.category === cat &&
          (search === "" ||
            d.label.toLowerCase().includes(search.toLowerCase()))
      )
      if (items.length) acc[cat] = items
      return acc
    },
    {} as Record<string, ComponentDefinition[]>
  )

  return (
    <>
      <div className="w-52 border-r border-[#1E1E24] bg-[#141417] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3 pt-3 pb-2.5 shrink-0">
          <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em] mb-2">
            Components
          </p>
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full text-[11px] bg-[#1A1A1E] border border-[#2A2A32] rounded-lg pl-7 pr-2.5 py-1.5 outline-none focus:border-[#0068FF]/60 text-zinc-300 placeholder:text-zinc-700 transition-colors"
            />
          </div>
        </div>

        {/* Component list */}
        <div className="overflow-y-auto flex-1 px-2 pb-3 scrollbar-hide">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-[11px] text-zinc-700 text-center mt-8">
              Không tìm thấy component nào
            </p>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <p className="text-[9px] font-semibold text-zinc-700 uppercase tracking-[0.12em] px-1 mb-1.5">
                  {categoryLabels[cat] ?? cat}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((def) => (
                    <DraggableComponentItem
                      key={def.type}
                      def={def}
                      onHover={showTooltip}
                      onLeave={hideTooltip}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tooltip — rendered outside the panel div so it's not clipped */}
      {tooltip && <ComponentTooltip def={tooltip.def} y={tooltip.y} />}
    </>
  )
}
```

- [ ] **Step 2: Verify lint passes with zero errors**

```bash
npm run lint
```

Expected: zero errors. If TypeScript complains about `def.icon as React.FC<...>`, ensure `import React` is present at the top of the file.

- [ ] **Step 3: Start dev server and visually verify**

```bash
npm run dev
```

Open http://localhost:3000 and check:

1. All 14 component cards show SVG icons (no emoji, no text chars)
2. Labels are readable at `text-[11px]`
3. Hovering a card after 150ms shows the tooltip to the right of the panel
4. Tooltip shows: icon, label, category chip (colored), live preview in white box, description text
5. Moving mouse away hides the tooltip
6. Dragging a component onto the canvas still works (tooltip must NOT block drag)
7. Search for "button" → only Button card shown, empty state shows "Không tìm thấy component nào"

- [ ] **Step 4: Commit**

```bash
git add src/components/builder/ComponentPanel.tsx
git commit -m "feat: component panel — react-icons, hover tooltip with live preview"
```

---

## Self-Review

**Spec coverage:**
- ✅ Replace emoji/text icons with react-icons/ri — Task 2
- ✅ `icon: React.ElementType` type change — Task 1
- ✅ `description?: string` added to type + all 14 entries — Tasks 1 & 2
- ✅ Hover tooltip, 150ms debounce, fixed position at `left: 216px` — Task 3
- ✅ Live renderer in tooltip (`def.renderer(def.defaultProps, null)`) — Task 3
- ✅ Category chips with color coding — Task 3
- ✅ `pointer-events-none` on tooltip — Task 3
- ✅ Fix typo "Khong tim thay" — Task 3
- ✅ Remove "form" from `categoryOrder` — Task 2
- ✅ Card padding and label size improvements — Task 3

**No placeholders, no TBDs.**

**Type consistency:** `ComponentDefinition.icon` is `React.ElementType` in Task 1; cast to `React.FC<{ size?: number; className?: string }>` at all usage sites in Task 3 — consistent.

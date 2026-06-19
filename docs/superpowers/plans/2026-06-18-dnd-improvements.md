# DnD Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp hệ thống kéo thả của ZMP Builder theo hướng FlutterFlow — kéo trực tiếp trên canvas, insertion line chính xác, smart layout direction, layers panel drag, keyboard shortcuts.

**Architecture:** Incremental enhancement trên nền dnd-kit hiện có. 4 file thay đổi, store và registry không đụng. `DragStateContext` mở rộng để chia sẻ `draggingLabel` và `draggingIsPanel` xuống toàn cây.

**Tech Stack:** React 18, dnd-kit/core (`useDraggable`, `useDroppable`, `DragOverlay`), Zustand + Immer, Tailwind CSS, TypeScript, Next.js 16 App Router.

## Global Constraints

- Không thay đổi store schema (`BuilderState`, `ComponentNode`, `PageSchema`)
- Không thay đổi registry hoặc exportCode
- Không thêm npm package mới — chỉ dùng dnd-kit đã có
- `distance: 5` activation constraint giữ nguyên (phân biệt click vs drag)
- Tailwind class cho màu Zalo blue: `#0068FF`
- TypeScript strict — không dùng `any` mới

---

## File Map

| File | Loại | Nội dung thay đổi |
|------|------|-------------------|
| `react-builder/src/components/builder/BuilderDnd.tsx` | Modify | Context mở rộng, DragOverlay mới, layer drag handler |
| `react-builder/src/components/builder/CanvasNode.tsx` | Modify | Direct drag, DropZone insertion line, container highlight |
| `react-builder/src/components/builder/LayersPanel.tsx` | Modify | LayerItem draggable, LayerDropZone mới |
| `react-builder/src/components/builder/BuilderContent.tsx` | Modify | Keyboard shortcuts useEffect |

---

### Task 1: Extend DragStateContext + DragOverlay

**Files:**
- Modify: `react-builder/src/components/builder/BuilderDnd.tsx`

**Interfaces:**
- Produces:
  - `useDragState()` → `{ isDraggingAny: boolean, draggingLabel: string, draggingIsPanel: boolean }`
  - `useIsDraggingAny()` giữ nguyên (backward compat)
  - `handleDragEnd` xử lý thêm branch `isLayer` (chuẩn bị cho Task 4)

- [ ] **Step 1: Thay toàn bộ nội dung `BuilderDnd.tsx`**

```tsx
"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  CollisionDetection,
} from "@dnd-kit/core"
import { useBuilderStore } from "@/store/builderStore"
import { registry } from "@/registry/index"

interface DragState {
  isDraggingAny: boolean
  draggingLabel: string
  draggingIsPanel: boolean
}

const DragStateContext = createContext<DragState>({
  isDraggingAny: false,
  draggingLabel: "",
  draggingIsPanel: false,
})

export const useIsDraggingAny = () => useContext(DragStateContext).isDraggingAny
export const useDragState = () => useContext(DragStateContext)

const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  if (hits.length > 0) return hits
  return closestCenter(args)
}

export function BuilderDnd({ children }: { children: React.ReactNode }) {
  const addNode = useBuilderStore((s) => s.addNode)
  const moveNode = useBuilderStore((s) => s.moveNode)

  const [draggingType, setDraggingType] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [draggingIsPanel, setDraggingIsPanel] = useState(false)

  const isDraggingAny = draggingType !== null || draggingId !== null
  const draggingLabel =
    draggingType != null
      ? (registry[draggingType]?.label ?? draggingType)
      : draggingId != null
        ? (registry[useBuilderStore.getState().pages
            .find((p) => p.id === useBuilderStore.getState().currentPageId)
            ?.nodes[draggingId]?.type ?? ""]?.label ?? "")
        : ""

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.isPanel) {
      const nodeType = active.data.current.nodeType as string
      setDraggingType(nodeType)
      setDraggingIsPanel(true)
    } else if (active.data.current?.isLayer) {
      const nodeId = active.data.current.nodeId as string
      setDraggingId(nodeId)
      setDraggingIsPanel(false)
    } else {
      setDraggingId(active.id as string)
      setDraggingIsPanel(false)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingType(null)
      setDraggingId(null)
      setDraggingIsPanel(false)
      const { active, over } = event
      if (!over) return
      const overData = over.data.current as
        | { parentId: string | null; index: number; isLayerDrop?: boolean }
        | undefined
      if (!overData) return

      if (active.data.current?.isLayer) {
        if (overData.isLayerDrop) {
          const { parentId, index } = overData
          const nodeId = active.data.current.nodeId as string
          if (nodeId !== over.id) moveNode(nodeId, parentId, index)
        }
        return
      }

      const { parentId, index } = overData
      if (active.data.current?.isPanel) {
        addNode(active.data.current.nodeType as string, parentId, index)
      } else {
        const activeId = active.id as string
        if (activeId !== over.id) moveNode(activeId, parentId, index)
      }
    },
    [addNode, moveNode]
  )

  const dragLabel =
    draggingType != null
      ? (registry[draggingType]?.label ?? draggingType)
      : ""

  return (
    <DragStateContext.Provider value={{ isDraggingAny, draggingLabel: dragLabel, draggingIsPanel }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {draggingType && (
            <div className="bg-white border-2 border-[#0068FF] rounded-xl px-3 py-2 text-sm shadow-2xl flex items-center gap-2 pointer-events-none min-w-[120px]">
              <span className="text-base">{registry[draggingType]?.icon}</span>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-800 text-[11px] leading-tight">
                  {registry[draggingType]?.label ?? draggingType}
                </span>
                <span className="text-[9px] text-[#0068FF] font-semibold uppercase tracking-wide">Mới</span>
              </div>
            </div>
          )}
          {draggingId && (
            <div className="bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm shadow-2xl flex items-center gap-2 pointer-events-none min-w-[100px]">
              <span className="text-zinc-400 text-base">⠿</span>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-800 text-[11px] leading-tight">Di chuyển</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">Canvas</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DragStateContext.Provider>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd react-builder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors từ `BuilderDnd.tsx`.

- [ ] **Step 3: Verify trong browser**

Mở `http://localhost:3000`, kéo component từ panel ra canvas → DragOverlay hiện card trắng có icon + label + badge "Mới". Kéo node đang có trên canvas → DragOverlay hiện card "Di chuyển".

- [ ] **Step 4: Commit**

```bash
git add react-builder/src/components/builder/BuilderDnd.tsx
git commit -m "feat: extend DragStateContext with draggingLabel/draggingIsPanel, upgrade DragOverlay"
```

---

### Task 2: Direct Canvas Drag

**Files:**
- Modify: `react-builder/src/components/builder/CanvasNode.tsx`

**Interfaces:**
- Consumes: `useIsDraggingAny` từ `BuilderDnd`
- Không thay đổi interface của `CanvasNode` hay `DropZone` (direction prop sẽ thêm ở Task 3)

- [ ] **Step 1: Chuyển drag listeners lên wrapper div, bỏ nút Drag**

Thay phần `return` của `CanvasNode` (từ dòng `return (` đến `}`) bằng:

```tsx
  return (
    <div
      ref={(el) => {
        setDragRef(el)
        if (def.acceptsChildren) setDropRef(el)
      }}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={cn(
        "relative group",
        isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab",
        isSelected && "outline outline-2 outline-[#0068FF] outline-offset-1 rounded-sm",
        !isSelected && "hover:outline hover:outline-1 hover:outline-[#0068FF]/40 hover:outline-offset-1 hover:rounded-sm",
        def.acceptsChildren && isOver && !isDragging && "ring-2 ring-[#0068FF]/30 ring-inset"
      )}
    >
      {/* Floating toolbar on select */}
      {isSelected && (
        <div className="absolute -top-7 left-0 z-50 flex items-center gap-1">
          <span className="bg-[#0068FF] text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-tight shadow-sm">
            {node.type}
          </span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold shadow-sm transition-colors"
          >
            Del
          </button>
        </div>
      )}
      {rendered}
    </div>
  )
```

> **Lưu ý quan trọng:** Nút Del dùng `onPointerDown={(e) => e.stopPropagation()}` để pointer event không kích hoạt drag khi nhấn Del.

- [ ] **Step 2: TypeScript check**

```bash
cd react-builder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Verify trong browser**

- Click vào node → toolbar "type + Del" hiện, không có nút Drag nữa
- Nhấn giữ node rồi kéo (không cần click trước) → node drag được ngay
- Click nhanh (< 5px) → vẫn chọn node, không trigger drag
- Nút Del vẫn xoá node bình thường (không trigger drag)

- [ ] **Step 4: Commit**

```bash
git add react-builder/src/components/builder/CanvasNode.tsx
git commit -m "feat: direct canvas drag — move listeners to wrapper, remove Drag button"
```

---

### Task 3: Insertion Line DropZone + Container Highlight

**Files:**
- Modify: `react-builder/src/components/builder/CanvasNode.tsx`

**Interfaces:**
- `DropZone` nhận thêm prop `direction?: "vertical" | "horizontal"` (default `"vertical"`)
- `useDragState` từ `BuilderDnd` (export từ Task 1)
- Container rỗng + isDraggingAny → `min-h-[64px]`

- [ ] **Step 1: Thêm import `useDragState`**

Đầu file, thay dòng import BuilderDnd:
```tsx
import { useIsDraggingAny, useDragState } from "@/components/builder/BuilderDnd"
```

- [ ] **Step 2: Thay toàn bộ component `DropZone`**

```tsx
interface DropZoneProps {
  parentId: string | null
  index: number
  isVisible: boolean
  direction?: "vertical" | "horizontal"
}

export function DropZone({ parentId, index, isVisible, direction = "vertical" }: DropZoneProps) {
  const id = `dropzone__${parentId ?? "root"}__${index}`
  const { setNodeRef, isOver } = useDroppable({ id, data: { parentId, index, isDropZone: true } })
  const { draggingLabel } = useDragState()

  const isHorizontal = direction === "horizontal"

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative transition-all duration-150",
        isHorizontal
          ? cn("w-1 self-stretch", isVisible ? "w-4" : "w-0.5")
          : cn("rounded-md mx-1", isVisible ? "h-4" : "h-0.5")
      )}
      style={{ overflow: "visible" }}
    >
      {isOver && (
        <>
          {/* Insertion line */}
          <div
            className={cn(
              "absolute bg-[#0068FF] pointer-events-none",
              isHorizontal
                ? "top-0 bottom-0 w-0.5 left-1/2 -translate-x-1/2"
                : "left-0 right-0 h-0.5 top-1/2 -translate-y-1/2"
            )}
          />
          {/* Label chip */}
          <div
            className={cn(
              "absolute z-50 bg-[#0068FF] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold pointer-events-none whitespace-nowrap",
              isHorizontal
                ? "top-0 left-1/2 -translate-x-1/2 -translate-y-full"
                : "top-1/2 left-0 -translate-y-1/2"
            )}
          >
            {draggingLabel || "Thả vào đây"}
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Cập nhật `CanvasNode` — container highlight + min-h + direction DropZone**

Trong `CanvasNode`, thay phần tính `children` và phần className container:

Phần tính `children` (thay toàn bộ từ `const children =` đến hết assignment):
```tsx
  const isHorizontalStack = node.type === "Stack" && node.props.direction === "horizontal"
  const dzDirection = isHorizontalStack ? "horizontal" : "vertical"

  const children =
    def.acceptsChildren && node.children.length > 0
      ? node.children.flatMap((childId, i) => [
          <DropZone key={`dz-${i}`} parentId={id} index={i} isVisible={isDraggingAny} direction={dzDirection} />,
          <CanvasNode key={childId} id={childId} nodes={nodes} depth={depth + 1} isDraggingAny={isDraggingAny} />,
        ]).concat(
          <DropZone key="dz-last" parentId={id} index={node.children.length} isVisible={isDraggingAny} direction={dzDirection} />
        )
      : def.acceptsChildren
        ? [<DropZone key="dz-empty" parentId={id} index={0} isVisible={true} direction={dzDirection} />]
        : undefined
```

Thay className của wrapper div (đặc biệt là `acceptsChildren && isOver` phần):
```tsx
      className={cn(
        "relative group",
        isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab",
        def.acceptsChildren && isDraggingAny && node.children.length === 0 && "min-h-[64px]",
        isSelected && "outline outline-2 outline-[#0068FF] outline-offset-1 rounded-sm",
        !isSelected && "hover:outline hover:outline-1 hover:outline-[#0068FF]/40 hover:outline-offset-1 hover:rounded-sm",
        def.acceptsChildren && isOver && !isDragging && "outline outline-2 outline-dashed outline-[#0068FF]/60 bg-[#0068FF]/5 rounded-sm"
      )}
```

Thêm "Thả vào đây" label bên trong wrapper, ngay trước `{rendered}`:
```tsx
      {/* Container drop hint */}
      {def.acceptsChildren && isOver && !isDragging && (
        <div className="absolute top-1 right-1 z-50 bg-[#0068FF] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold pointer-events-none">
          Thả vào đây
        </div>
      )}
      {rendered}
```

- [ ] **Step 4: TypeScript check**

```bash
cd react-builder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 5: Verify trong browser**

- Kéo component từ panel lên DropZone → hiện đường kẻ xanh 2px + chip tên component
- Kéo vào container rỗng → border dashed + "Thả vào đây" label xuất hiện, container cao lên 64px
- Kéo vào Stack horizontal → DropZone dạng cột dọc, insertion line dọc

- [ ] **Step 6: Commit**

```bash
git add react-builder/src/components/builder/CanvasNode.tsx
git commit -m "feat: insertion line DropZone with direction support + container highlight"
```

---

### Task 4: Layers Panel Drag

**Files:**
- Modify: `react-builder/src/components/builder/LayersPanel.tsx`

**Interfaces:**
- Consumes: `useDraggable`, `useDroppable` từ `@dnd-kit/core`
- `BuilderDnd.handleDragEnd` đã xử lý `isLayer` branch từ Task 1
- Layer drag data: `{ isLayer: true, nodeId: string }`
- Layer drop data: `{ isLayerDrop: true, parentId: string | null, index: number }`
- Layer-into drop data: `{ isLayerDrop: true, parentId: string, index: 0 }`

- [ ] **Step 1: Thay toàn bộ nội dung `LayersPanel.tsx`**

```tsx
"use client"

import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { ComponentNode } from "@/types/builder"
import { registry } from "@/registry/index"
import { cn } from "@/lib/utils"

interface LayerDropZoneProps {
  parentId: string | null
  index: number
}

function LayerDropZone({ parentId, index }: LayerDropZoneProps) {
  const id = `layer-dz__${parentId ?? "root"}__${index}`
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { isLayerDrop: true, parentId, index },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-0.5 rounded-full mx-2 transition-all duration-100",
        isOver ? "bg-[#0068FF] h-1" : "bg-transparent"
      )}
    />
  )
}

interface LayerItemProps {
  id: string
  nodes: Record<string, ComponentNode>
  depth: number
  parentId: string | null
  index: number
  siblingCount: number
}

function LayerItem({ id, nodes, depth, parentId, index, siblingCount }: LayerItemProps) {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const setSelected = useBuilderStore((s) => s.setSelected)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const node = nodes[id]
  const def = registry[node?.type ?? ""]
  const isSelected = selectedId === id

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `layer__${id}`,
    data: { isLayer: true, nodeId: id },
  })

  const { setNodeRef: setDropRef, isOver: isOverContainer } = useDroppable({
    id: `layer-into__${id}`,
    data: { isLayerDrop: true, parentId: id, index: 0 },
    disabled: !def?.acceptsChildren,
  })

  if (!node) return null

  return (
    <>
      {/* Drop zone before this item */}
      <LayerDropZone parentId={parentId} index={index} />

      <div
        ref={(el) => {
          setDragRef(el)
          if (def?.acceptsChildren) setDropRef(el)
        }}
        onClick={() => setSelected(id)}
        className={cn(
          "flex items-center gap-1.5 py-1 rounded-md cursor-pointer text-[11px] group transition-colors relative",
          isDragging && "opacity-30",
          isSelected
            ? "bg-[#0068FF]/12 text-blue-400"
            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/4",
          def?.acceptsChildren && isOverContainer && !isDragging && "bg-[#0068FF]/10 outline outline-1 outline-[#0068FF]/40"
        )}
        style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: "6px" }}
      >
        {/* Left accent line for selected */}
        {isSelected && (
          <div className="absolute left-0 top-0.5 bottom-0.5 w-0.5 rounded-full bg-[#0068FF]" />
        )}

        {/* Tree indent guide */}
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-[#2A2A32]"
            style={{ left: `${4 + (depth - 1) * 12}px` }}
          />
        )}

        {/* Drag handle */}
        <span
          {...listeners}
          {...attributes}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing text-[11px] shrink-0 select-none"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          ⠿
        </span>

        <span className="text-sm leading-none opacity-60 shrink-0">{def?.icon ?? "□"}</span>
        <span className="flex-1 font-medium truncate tracking-tight">{node.type}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            removeNode(id)
          }}
          className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all text-[10px] w-4 h-4 flex items-center justify-center rounded shrink-0"
        >
          x
        </button>
      </div>

      {/* Children */}
      {node.children.map((childId, childIndex) => (
        <LayerItem
          key={childId}
          id={childId}
          nodes={nodes}
          depth={depth + 1}
          parentId={id}
          index={childIndex}
          siblingCount={node.children.length}
        />
      ))}

      {/* Drop zone after last item at this level */}
      {index === siblingCount - 1 && (
        <LayerDropZone parentId={parentId} index={siblingCount} />
      )}
    </>
  )
}

export function LayersPanel() {
  const currentPage = useBuilderStore(selectCurrentPage)
  const nodes = currentPage?.nodes ?? {}
  const rootIds = currentPage?.rootIds ?? []

  return (
    <div className="border-t border-[#1E1E24] bg-[#141417] flex flex-col flex-1 min-h-0">
      <div className="px-3 py-2 shrink-0">
        <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em]">Layers</p>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2 scrollbar-hide">
        {rootIds.length === 0 ? (
          <p className="text-[11px] text-zinc-700 text-center py-4">Chua co layer</p>
        ) : (
          rootIds.map((id, i) => (
            <LayerItem
              key={id}
              id={id}
              nodes={nodes}
              depth={0}
              parentId={null}
              index={i}
              siblingCount={rootIds.length}
            />
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd react-builder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Verify trong browser**

- Layers panel hiển thị icon ⠿ bên trái mỗi layer
- Kéo icon ⠿ của một layer → DragOverlay hiện card "Di chuyển"
- Thả lên LayerDropZone (đường kẻ xanh giữa các item) → node reorder đúng
- Thả vào container layer → node reparented vào container đó

- [ ] **Step 4: Commit**

```bash
git add react-builder/src/components/builder/LayersPanel.tsx
git commit -m "feat: layers panel drag-to-reorder with LayerDropZone"
```

---

### Task 5: Keyboard Shortcuts

**Files:**
- Modify: `react-builder/src/components/builder/BuilderContent.tsx`

**Interfaces:**
- Consumes store actions: `removeNode(id)`, `setSelected(null)`, `undo()`, `redo()`
- Consumes store state: `selectedId`
- Guard: skip khi focus đang ở `INPUT`, `TEXTAREA`, `SELECT`, `CONTENTEDITABLE`

- [ ] **Step 1: Thay toàn bộ nội dung `BuilderContent.tsx`**

```tsx
"use client"

import { useEffect } from "react"
import { BuilderDnd } from "@/components/builder/BuilderDnd"
import { Topbar } from "@/components/builder/Topbar"
import { ComponentPanel } from "@/components/builder/ComponentPanel"
import { Canvas } from "@/components/builder/Canvas"
import { PropertiesPanel } from "@/components/builder/PropertiesPanel"
import { LayersPanel } from "@/components/builder/LayersPanel"
import { useBuilderStore } from "@/store/builderStore"

function KeyboardShortcuts() {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const setSelected = useBuilderStore((s) => s.setSelected)
  const undo = useBuilderStore((s) => s.undo)
  const redo = useBuilderStore((s) => s.redo)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isEditable = (e.target as HTMLElement).isContentEditable
      const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || isEditable

      if (e.key === "Escape") {
        setSelected(null)
        return
      }

      if ((e.key === "Delete" || e.key === "Backspace") && !inInput) {
        if (selectedId) {
          e.preventDefault()
          removeNode(selectedId)
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && !inInput) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
          return
        }
        if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault()
          redo()
          return
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedId, removeNode, setSelected, undo, redo])

  return null
}

export default function BuilderContent() {
  return (
    <BuilderDnd>
      <KeyboardShortcuts />
      <div className="flex flex-col h-screen overflow-hidden bg-[#141417]">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="flex flex-col w-52 shrink-0">
            <ComponentPanel />
            <LayersPanel />
          </div>
          {/* Canvas */}
          <Canvas />
          {/* Right panel */}
          <PropertiesPanel />
        </div>
      </div>
    </BuilderDnd>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd react-builder && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Verify trong browser**

- Click chọn node → nhấn `Delete` → node bị xoá
- Nhấn `Escape` → deselect node
- Thêm node, kéo vị trí → `Ctrl+Z` → undo về trạng thái trước
- `Ctrl+Y` → redo lại
- Click vào ô input trong Properties Panel → nhấn Delete → **không** xoá node (guard hoạt động)

- [ ] **Step 4: Commit**

```bash
git add react-builder/src/components/builder/BuilderContent.tsx
git commit -m "feat: keyboard shortcuts — Delete, Escape, Ctrl+Z/Y"
```

---

## Self-Review Checklist (đã chạy)

- [x] Spec coverage: Task 1 → Section 2+3, Task 2 → Section 1, Task 3 → Section 2+4, Task 4 → Section 5, Task 5 → Section 6
- [x] No placeholders — mọi step có code đầy đủ
- [x] Type consistency: `isLayerDrop`, `isLayer`, `nodeId`, `parentId`, `index` nhất quán giữa Task 1 và Task 4
- [x] `useDragState` export từ Task 1, dùng trong Task 3
- [x] `onPointerDown stopPropagation` trên Del button (Task 2) và drag handle (Task 4) để tránh conflict

# DnD Improvements Design — 2026-06-18

## Goal

Nâng cấp hệ thống kéo thả của ZMP Builder theo hướng FlutterFlow: kéo trực tiếp trên canvas, insertion line chính xác, smart layout direction, layers panel drag, và keyboard shortcuts.

## Approach

Option A — Incremental enhancement trên nền dnd-kit hiện có. Không migrate thư viện, không đụng vào store schema.

---

## Section 1: Direct Canvas Drag

**File:** `src/components/builder/CanvasNode.tsx`

**Thay đổi:**
- Chuyển `{...listeners} {...attributes}` từ nút "Drag" lên **wrapper div** của `CanvasNode`
- Activation constraint `distance: 5` đã có trong `BuilderDnd.tsx` — phân biệt click vs drag tự động
- Wrapper thêm `cursor-grab` khi không drag, `cursor-grabbing` khi `isDragging`
- Floating toolbar chỉ còn: chip tên type + nút Del (bỏ chip "Drag")

**Invariant:** `onClick` vẫn hoạt động bình thường vì pointer chưa di chuyển đủ 5px.

---

## Section 2: Insertion Line Indicator

**Files:** `src/components/builder/BuilderDnd.tsx`, `src/components/builder/CanvasNode.tsx`

### DragStateContext mở rộng

```ts
const DragStateContext = createContext({
  isDraggingAny: false,
  draggingLabel: '',      // label hiện trong insertion line
  draggingIsPanel: false, // phân biệt panel drag vs canvas drag trong overlay
})
```

`BuilderDnd.tsx` set `draggingLabel = registry[type]?.label ?? type` khi drag bắt đầu.

### DropZone mới

Props thêm: `direction: "vertical" | "horizontal"` (default `"vertical"`).

| State | Visual |
|-------|--------|
| Bình thường, không drag | `h-1`, trong suốt |
| `isDraggingAny`, không over | `h-4`, trong suốt (hitbox rộng hơn) |
| `isOver` + direction vertical | Đường kẻ ngang 2px `#0068FF` + chip label trái |
| `isOver` + direction horizontal | Đường kẻ dọc 2px `#0068FF` + chip label trên |

Chip label: `bg-[#0068FF] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold`.

Đường kẻ render bằng `absolute` div bên trong DropZone div (overflow visible), không chiếm không gian layout.

### Stack horizontal DropZone

Trong `CanvasNode.tsx`, khi render children của Stack:
```ts
const isHorizontal = node.type === "Stack" && node.props.direction === "horizontal"
// truyền direction={isHorizontal ? "horizontal" : "vertical"} vào DropZone
```

---

## Section 3: DragOverlay Enhancement

**File:** `src/components/builder/BuilderDnd.tsx`

| Drag source | Overlay |
|-------------|---------|
| Panel (new component) | Card: icon lớn + label + badge "Mới" xanh |
| Canvas (move existing) | Card: icon + label + badge "Di chuyển" xám |

Dùng `registry[type]` để lấy icon và label. Không render actual component renderer (tránh side effects).

---

## Section 4: Container Highlight

**File:** `src/components/builder/CanvasNode.tsx`

Khi `isOver && !isDragging && def.acceptsChildren`:
- Border: `outline-2 outline-dashed outline-[#0068FF]/60`
- Background: `bg-[#0068FF]/5`
- Label `"Thả vào đây"` absolute top-right, ẩn đi khi không over

Container rỗng + `isDraggingAny`: `min-h-[64px]` thay vì `min-h-[40px]` để dễ target hơn.

---

## Section 5: Layers Panel Drag

**File:** `src/components/builder/LayersPanel.tsx`

### LayerItem drag

```ts
const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
  id: `layer__${id}`,
  data: { isLayer: true, nodeId: id },
})
```

Handle drag = icon ⠿ bên trái mỗi LayerItem (luôn visible, không chỉ on hover).

### DropZone trong layers

Giữa mỗi LayerItem thêm `LayerDropZone` (component riêng nhỏ):
- id: `layer-dz__${parentId ?? "root"}__${index}`
- data: `{ isLayerDrop: true, parentId, index }`
- Visual: đường kẻ 1px xanh khi `isOver`, invisible khi không

Container LayerItem (`acceptsChildren: true`) cũng là droppable:
- id: `layer-into__${id}`
- data: `{ isLayerDrop: true, parentId: id, index: 0 }`
- Visual: background highlight khi `isOver`

### BuilderDnd xử lý

Trong `handleDragEnd`, thêm branch:
```ts
if (active.data.current?.isLayer) {
  const { nodeId } = active.data.current
  if (overData?.isLayerDrop) {
    const { parentId, index } = overData
    if (nodeId !== over.id) moveNode(nodeId, parentId, index)
  }
}
```

---

## Section 6: Keyboard Shortcuts

**File:** `src/components/builder/BuilderContent.tsx` (hoặc wrapper component)

`useEffect` với `keydown` listener trên `document`:

| Key | Action | Guard |
|-----|--------|-------|
| `Delete` / `Backspace` | `removeNode(selectedId)` | selectedId không null; focus không ở input/textarea/select |
| `Escape` | `setSelected(null)` | — |
| `Ctrl+Z` | `undo()` | focus không ở input |
| `Ctrl+Y` / `Ctrl+Shift+Z` | `redo()` | focus không ở input |

Guard: `const tag = (e.target as HTMLElement).tagName; if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return`

---

## Files Changed

| File | Loại thay đổi |
|------|---------------|
| `src/components/builder/BuilderDnd.tsx` | DragStateContext mở rộng, DragOverlay mới, layer drag handler |
| `src/components/builder/CanvasNode.tsx` | Direct drag, DropZone mới, container highlight, direction prop |
| `src/components/builder/LayersPanel.tsx` | LayerItem draggable, LayerDropZone mới |
| `src/components/builder/BuilderContent.tsx` | Keyboard shortcuts |

Store, registry, exportCode không thay đổi.

---

## Out of Scope

- Multi-select (Ctrl+click)
- Constraint-based layout (width/height pinning)
- Animation khi drop (transition transform)

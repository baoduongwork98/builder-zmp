# Component Panel UX Improvement

**Date:** 2026-06-18  
**Scope:** `react-builder/src/components/builder/ComponentPanel.tsx`, `src/registry/index.tsx`, `src/types/builder.ts`

## Problem

The component panel has two key UX issues:
1. **Inconsistent icons** — mix of emoji (🔵, ✏️, 🃏), text characters ("T", "—", "§", "≡"), and unicode symbols. Visually noisy and hard to recognise at a glance.
2. **No preview** — users can't tell what a component looks like until they drag it onto the canvas.

Minor issues: typo in empty search state ("Khong tim thay"), unused `"form"` category in `categoryOrder`.

## Approach

Approach A: React Icons + hover tooltip with live renderer preview.

- Replace all icons with Remix Icons from `react-icons/ri` — consistent SVG, theme-aware
- On hover, show a fixed-position tooltip to the right of the panel containing a live render of the component and a short description
- Keep 2-column grid layout, minor card polish

## Design

### 1. Icon System

Install `react-icons`. Use the `ri` (Remix Icons) sub-package for all components.

| Component | New Icon |
|---|---|
| ZaloPage | `RiLayoutLine` |
| ZaloHeader | `RiLayoutTopLine` |
| ZaloBottomNav | `RiLayoutBottomLine` |
| ZaloCard | `RiRectangleLine` |
| ZaloListItem | `RiListCheck` |
| ZaloAvatar | `RiUserLine` |
| ZaloTag | `RiPriceTagLine` |
| ZaloButton | `RiCursorLine` |
| ZaloInput | `RiInputMethodLine` |
| ZaloSearchBar | `RiSearchLine` |
| ZaloSection | `RiLayoutRowLine` |
| Stack | `RiStackLine` |
| Divider | `RiSeparatorLine` |
| Text | `RiTextLine` |
| Image | `RiImageLine` |

Icons render as `<IconComponent size={18} />` replacing the current `def.icon` string. The `icon` field in `ComponentDefinition` changes type from `string` to `React.ElementType` (a react-icons component reference).

### 2. Hover Tooltip

**Trigger:** `onMouseEnter` / `onMouseLeave` on each card. Show delayed by 150ms (via `setTimeout`) to avoid flicker when moving mouse across cards quickly — clear the timer on `onMouseLeave`.

**State** in `ComponentPanel`:
```ts
const [tooltip, setTooltip] = useState<{ def: ComponentDefinition; y: number } | null>(null)
```

**Positioning:** Fixed, left = panel width (208px) + 8px gap = `216px`. Vertical: clamp tooltip `y` so it stays within viewport.

**Tooltip content:**
- Header row: icon (24px) + component label (bold) + category chip
- Divider
- Live preview: `def.renderer(def.defaultProps, null)` inside a white rounded box, `overflow-hidden`, max-height 128px, pointer-events none
- Footer: `def.description` text (zinc-400, text-xs)

**Animation:** `opacity 0→1` + `translateX -4px→0` over 120ms via Tailwind `transition`.

**Category chip colors:**
- `zalo` → blue (`bg-blue-950 text-blue-400`)
- `layout` → purple (`bg-purple-950 text-purple-400`)
- `ui` → emerald (`bg-emerald-950 text-emerald-400`)

### 3. Data Additions

**`ComponentDefinition` type** — add optional field:
```ts
description?: string
icon: React.ElementType   // was: string
```

**Descriptions** added to all 14 registry entries (Vietnamese):

| Component | Description |
|---|---|
| ZaloPage | Trang chính của ứng dụng ZMP |
| ZaloHeader | Thanh tiêu đề cố định trên cùng |
| ZaloBottomNav | Thanh điều hướng dưới cùng |
| ZaloCard | Khung card nền trắng có bo góc |
| ZaloListItem | Mục danh sách với tiêu đề và mô tả |
| ZaloAvatar | Ảnh đại diện người dùng |
| ZaloTag | Nhãn phân loại màu sắc |
| ZaloButton | Nút bấm với các kiểu primary/secondary |
| ZaloInput | Ô nhập liệu có label |
| ZaloSearchBar | Thanh tìm kiếm |
| ZaloSection | Tiêu đề mục có link "xem thêm" |
| Stack | Container xếp chồng dọc hoặc ngang |
| Divider | Đường kẻ phân cách |
| Text | Khối văn bản tùy chỉnh |
| Image | Hình ảnh có tùy chọn bo góc |

### 4. Minor Fixes

- Fix typo: `"Khong tim thay"` → `"Không tìm thấy component nào"`
- Remove `"form"` from `categoryOrder` (no components registered)

## Files Changed

| File | Change |
|---|---|
| `package.json` | Add `react-icons` dependency |
| `src/types/builder.ts` | `icon: React.ElementType`, add `description?: string` |
| `src/registry/index.tsx` | Replace icon strings with react-icons components, add descriptions |
| `src/components/builder/ComponentPanel.tsx` | Tooltip state + rendering, card polish, typo fix |

## Out of Scope

- Adding new components to the "form" category
- Keyboard navigation within the panel
- Drag-and-drop changes
- Properties panel or layers panel changes

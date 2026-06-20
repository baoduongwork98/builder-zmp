# New Components Design: Carousel, Modal, Skeleton, Accordion

**Date:** 2026-06-20
**Scope:** Add 4 new UI components to the ZMP Builder component registry

---

## Background

The builder currently has 18 components across 4 categories. Users (coming from FlutterFlow background) expect common mobile UI patterns like image carousels, modal dialogs, loading skeletons, and collapsible sections. This spec adds all four.

---

## Approach: Option A — Lightweight

- No new prop types, no changes to `types/builder.ts`
- No changes to `PropertiesPanel`
- All components follow existing registry patterns (numbered props for arrays, `toJSX` for code generation)
- Only 2 files change: `registry/index.tsx` and `lib/exportCode.ts`

---

## Files Changed

| File | Change |
|------|--------|
| `react-builder/src/registry/index.tsx` | Add 4 `ComponentDefinition` entries |
| `react-builder/src/lib/exportCode.ts` | Extend `collectLocalHooks` for `Accordion` + `Modal` |

---

## Component Designs

### 1. Carousel

**Type:** `"Carousel"` — Category: `"ui"` — `acceptsChildren: false`

**Props:**

| Key | Type | Default |
|-----|------|---------|
| `imageCount` | select "2"–"5" | "3" |
| `image1`–`image5` | string | `https://placehold.co/600x300` |
| `height` | string | "200px" |
| `showDots` | boolean | true |
| `showArrows` | boolean | false |

**propGroups:** One group per slide (Slide 1–5), each with just `imageN`. Group `showWhen` hides slide N when `imageCount < N`.

**Canvas renderer:**
- Static: shows `image1` in a rounded container at the specified height
- If `showDots`: renders N dots below, first dot active (blue)
- If `showArrows`: renders left/right arrow overlays (non-functional in canvas)

**Generated code (toJSX):**
```tsx
<div style={{ position: "relative", overflow: "hidden", borderRadius: 12 }}>
  <div style={{ display: "flex", overflowX: "scroll", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
    <img src="..." style={{ width: "100%", height: "200px", objectFit: "cover", scrollSnapAlign: "start", flexShrink: 0 }} />
    {/* ... more images */}
  </div>
  {/* dots */}
  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0068FF" }} />
    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#D1D5DB" }} />
  </div>
</div>
```

No `useState` needed. Scroll is native browser behavior.

---

### 2. Modal / Bottom Sheet

**Type:** `"Modal"` — Category: `"ui"` — `acceptsChildren: true`

**Props:**

| Key | Type | Default |
|-----|------|---------|
| `type` | select "modal" \| "bottomSheet" | "modal" |
| `title` | string | "Xác nhận" |
| `triggerLabel` | string | "Mở" |
| `triggerVariant` | select "primary" \| "secondary" \| "tertiary" | "primary" |
| `overlayClose` | boolean | true |

**Canvas renderer:**
- Top area: styled trigger button (same visual style as ZaloButton)
- Below: inline preview frame showing the modal "open" state — rounded card for `modal`, flat sheet with rounded top for `bottomSheet`
- Header row with title + close icon (×)
- Children drop zone below header (labelled "Thả nội dung vào đây" when empty)
- The whole thing is static in canvas — no open/close toggle

**Generated code (toJSX):**
```tsx
<>
  <button onClick={() => setIsModal_SAFEID_Open(true)} style={{ ... }}>
    {triggerLabel}
  </button>
  {isModal_SAFEID_Open && (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
               display: "flex", alignItems: type === "modal" ? "center" : "flex-end" }}
      onClick={overlayClose ? () => setIsModal_SAFEID_Open(false) : undefined}
    >
      <div
        style={{ background: "white", borderRadius: type === "modal" ? 16 : "16px 16px 0 0",
                 width: "100%", maxHeight: "80vh", overflow: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
          <button onClick={() => setIsModal_SAFEID_Open(false)}>×</button>
        </div>
        <div style={{ padding: 20 }}>
          {/* children */}
        </div>
      </div>
    </div>
  )}
</>
```

**`collectLocalHooks` extension:**
```typescript
if (node.type === "Modal") {
  const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
  const varName = `isModal_${safeId}_Open`
  const setter = `set${varName[0].toUpperCase()}${varName.slice(1)}`
  lines.push(`const [${varName}, ${setter}] = useState(false)`)
  needsUseState = true
}
```

---

### 3. Skeleton Loader

**Type:** `"Skeleton"` — Category: `"ui"` — `acceptsChildren: false`

**Props:**

| Key | Type | Default |
|-----|------|---------|
| `variant` | select "text" \| "card" \| "avatar-row" \| "list-item" | "card" |
| `rows` | number | 3 |
| `animated` | boolean | true |

**Canvas renderer:**
- All variants use `bg-gray-200 rounded` divs
- `animated: true` applies `animate-pulse` class
- Shapes per variant:
  - `text`: N rows of rounded rectangles, last row ~60% width
  - `card`: full-width rectangle (image area) + 2 text rows below
  - `avatar-row`: circle (avatar) + 2 short lines to the right
  - `list-item`: circle (avatar) + lines, with a small square on the right

**Generated code (toJSX):**
- Pure Tailwind — uses `animate-pulse`, `bg-gray-200`, `rounded`, no JS state
- Self-contained inline structure, no external deps

---

### 4. Accordion / Collapse

**Type:** `"Accordion"` — Category: `"ui"` — `acceptsChildren: true`

**Props:**

| Key | Type | Default |
|-----|------|---------|
| `title` | string | "Tiêu đề mục" |
| `subtitle` | string | "" |
| `defaultOpen` | boolean | false |
| `bordered` | boolean | true |
| `chevron` | boolean | true |

**Canvas renderer:**
- Static — shows header row with title + subtitle + optional chevron
- Content area (children drop zone) visible based on `defaultOpen`
- `bordered: true` wraps everything in a rounded border container

**Generated code (toJSX):**
```tsx
<div style={{ borderRadius: 12, border: bordered ? "1px solid #E5E7EB" : "none", overflow: "hidden" }}>
  <button
    onClick={() => setIsAccordion_SAFEID_Open(!isAccordion_SAFEID_Open)}
    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
             padding: "14px 16px", background: "white", border: "none", cursor: "pointer" }}
  >
    <div style={{ textAlign: "left" }}>
      <span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>{title}</span>
      {subtitle && <span style={{ display: "block", fontSize: 12, color: "#6B7280", marginTop: 2 }}>{subtitle}</span>}
    </div>
    {chevron && (
      <svg style={{ transform: isAccordion_SAFEID_Open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
           width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )}
  </button>
  {isAccordion_SAFEID_Open && (
    <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F3F4F6" }}>
      {/* children */}
    </div>
  )}
</div>
```

**`collectLocalHooks` extension:**
```typescript
if (node.type === "Accordion") {
  const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
  const varName = `isAccordion_${safeId}_Open`
  const setter = `set${varName[0].toUpperCase()}${varName.slice(1)}`
  lines.push(`const [${varName}, ${setter}] = useState(${JSON.stringify(node.props.defaultOpen ?? false)})`)
  needsUseState = true
}
```

---

## Implementation Order

1. Add `Carousel` to registry (no exportCode change)
2. Add `Skeleton` to registry (no exportCode change)
3. Add `Accordion` to registry + extend `collectLocalHooks`
4. Add `Modal` to registry + extend `collectLocalHooks`

---

## Non-Goals

- No new prop types
- No Carousel auto-play (would need `useEffect` in generated code — deferred)
- No animated open/close transitions for Accordion or Modal (deferred)
- No Modal state exposed as a variable (deferred)

# New UI Components: Carousel, Skeleton, Accordion, ModalDialog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new UI components (Carousel, Skeleton, Accordion, ModalDialog) to the ZMP Builder component registry so users can drag them onto the canvas, configure props, and export working ZMP TypeScript/React code.

**Architecture:** Each component is a `ComponentDefinition` added to `registry/index.tsx`. Accordion and ModalDialog require `useState` in generated code, so `collectLocalHooks` in `exportCode.ts` is extended to detect these component types and inject the necessary hook declarations. `toJSX` and `collectLocalHooks` use the same `safeId` + setter formula so generated code is internally consistent.

**Tech Stack:** React (canvas renderer), TypeScript, `react-icons/ri` for icons, CSS scroll-snap (Carousel), Tailwind `animate-pulse` (Skeleton), `useState` hook injection pattern already used by `Tabs` (Accordion + ModalDialog).

## Global Constraints

- No new PropType values — only existing: `"string"`, `"number"`, `"boolean"`, `"color"`, `"select"`, `"textarea"`, `"toggle"`, `"page-select"`
- No changes to `types/builder.ts` or `PropertiesPanel.tsx`
- All new components use `zmpImports: []` (pure HTML/Tailwind, no zmp-ui dependency)
- `ind(n)` helper (already defined at top of registry as `const ind = (n: number) => "  ".repeat(n)`) for indentation in `toJSX`
- Every new `ComponentDefinition` variable must be added to the `registry` export object at line ~2117 of `registry/index.tsx`
- Note: `ModalCard` (static modal layout) and `BottomSheet` (static sheet layout) already exist — `ModalDialog` is distinct: it has a trigger button and open/close `useState`
- Dev server: `cd react-builder && npm run dev` → `http://localhost:3000`
- TypeScript check: `cd react-builder && npx tsc --noEmit`

---

### Task 1: Carousel

**Files:**
- Modify: `react-builder/src/registry/index.tsx`

**Interfaces:**
- Consumes: `ind`, `tk`, `RiArrowLeftSLine`, `RiArrowRightSLine` (both already imported at line ~39–40), `RiSlideshowLine` (new — must add to import block)
- Produces: `carouselDef: ComponentDefinition`, exported as `registry["Carousel"]`

- [ ] **Step 1: Add `RiSlideshowLine` to the react-icons/ri import block**

Find the import block starting at line 10 in `react-builder/src/registry/index.tsx`. Add `RiSlideshowLine` to it:

```tsx
import {
  RiLayoutColumnLine,
  RiArrowDownSLine,
  // ... all existing entries ...
  RiCloseCircleLine,
  RiSlideshowLine,   // ← add this line
} from "react-icons/ri"
```

- [ ] **Step 2: Add `carouselDef` above the registry export block**

Find the comment `// ─── Registry exports` (around line 2115). Insert the following block directly above it:

```tsx
// ─── Carousel ─────────────────────────────────────────────────────────────────

const carouselDef: ComponentDefinition = {
  type: "Carousel",
  label: "Carousel",
  icon: RiSlideshowLine,
  description: "Trình chiếu ảnh trượt ngang với dots indicator",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: {
    imageCount: "3",
    image1: "https://placehold.co/600x300/0068FF/white?text=Slide+1",
    image2: "https://placehold.co/600x300/0084FF/white?text=Slide+2",
    image3: "https://placehold.co/600x300/5BA3FF/white?text=Slide+3",
    image4: "https://placehold.co/600x300/89BFFF/white?text=Slide+4",
    image5: "https://placehold.co/600x300/B8D9FF/white?text=Slide+5",
    height: "200px",
    showDots: true,
    showArrows: false,
  },
  propSchema: {
    imageCount: { label: "Số slides", type: "select", defaultValue: "3", options: ["2", "3", "4", "5"] },
    image1: { label: "Slide 1 URL", type: "string", defaultValue: "https://placehold.co/600x300" },
    image2: { label: "Slide 2 URL", type: "string", defaultValue: "https://placehold.co/600x300" },
    image3: { label: "Slide 3 URL", type: "string", defaultValue: "https://placehold.co/600x300" },
    image4: { label: "Slide 4 URL", type: "string", defaultValue: "https://placehold.co/600x300" },
    image5: { label: "Slide 5 URL", type: "string", defaultValue: "https://placehold.co/600x300" },
    height: { label: "Chiều cao", type: "string", defaultValue: "200px" },
    showDots: { label: "Hiện dots", type: "boolean", defaultValue: true },
    showArrows: { label: "Hiện arrows", type: "boolean", defaultValue: false },
  },
  propGroups: [
    { label: "Slide 1", keys: ["image1"], defaultExpanded: true },
    { label: "Slide 2", keys: ["image2"], defaultExpanded: false, showWhen: (p) => parseInt(p.imageCount as string) >= 2 },
    { label: "Slide 3", keys: ["image3"], defaultExpanded: false, showWhen: (p) => parseInt(p.imageCount as string) >= 3 },
    { label: "Slide 4", keys: ["image4"], defaultExpanded: false, showWhen: (p) => parseInt(p.imageCount as string) >= 4 },
    { label: "Slide 5", keys: ["image5"], defaultExpanded: false, showWhen: (p) => parseInt(p.imageCount as string) >= 5 },
  ],
  renderer: (props) => {
    const count = parseInt(props.imageCount as string)
    const images = [props.image1, props.image2, props.image3, props.image4, props.image5].slice(0, count) as string[]
    return (
      <div style={{ position: "relative", borderRadius: tk.radius.lg, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0] ?? "https://placehold.co/600x300"}
          alt="Slide 1"
          style={{ width: "100%", height: props.height as string, objectFit: "cover", display: "block" }}
        />
        {(props.showArrows as boolean) && (
          <>
            <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RiArrowLeftSLine style={{ fontSize: 18, color: "white" }} />
            </div>
            <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <RiArrowRightSLine style={{ fontSize: 18, color: "white" }} />
            </div>
          </>
        )}
        {(props.showDots as boolean) && (
          <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
            {images.map((_, i) => (
              <div key={i} style={{ width: i === 0 ? 16 : 6, height: 6, borderRadius: 3, background: i === 0 ? tk.accent : "rgba(255,255,255,0.6)", transition: "width 0.2s" }} />
            ))}
          </div>
        )}
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const count = parseInt(props.imageCount as string)
    const images = [props.image1, props.image2, props.image3, props.image4, props.image5].slice(0, count) as string[]
    const height = props.height as string
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)

    const imgLines = images.map((src, idx) =>
      `${i2}<img src="${src}" alt="Slide ${idx + 1}" style={{ width: "100%", height: "${height}", objectFit: "cover", flexShrink: 0, scrollSnapAlign: "start" }} />`
    ).join("\n")

    const dotsLines = !(props.showDots as boolean) ? "" : [
      `${i1}<div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>`,
      ...images.map(() => `${i2}<div style={{ width: 6, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.6)" }} />`),
      `${i1}</div>`,
    ].join("\n")

    return [
      `${i0}<div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>`,
      `${i1}<div style={{ display: "flex", overflowX: "scroll", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>`,
      imgLines,
      `${i1}</div>`,
      dotsLines,
      `${i0}</div>`,
    ].filter(Boolean).join("\n")
  },
}
```

- [ ] **Step 3: Add `Carousel` to the registry export object**

In the `export const registry` block (line ~2117), add under the `// UI` section:

```tsx
  // UI
  Text: textDef,
  Image: imageDef,
  Banner: bannerDef,
  ProgressBar: progressBarDef,
  Switch: switchDef,
  Rating: ratingDef,
  Textarea: textareaDef,
  Chip: chipDef,
  HeroSection: heroSectionDef,
  Tabs: tabsDef,
  SelectField: selectFieldDef,
  Carousel: carouselDef,    // ← add
  Skeleton: skeletonDef,    // ← placeholder (filled in Task 2)
```

For now just add `Carousel: carouselDef,` — leave `Skeleton` for Task 2.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd react-builder && npx tsc --noEmit
```

Expected: no errors. If `RiSlideshowLine` is not found, check the react-icons version with `cat react-builder/node_modules/react-icons/package.json | grep version` and replace with `RiGalleryLine` if needed.

- [ ] **Step 5: Verify in browser**

```bash
cd react-builder && npm run dev
```

Open `http://localhost:3000`. In the left panel under **UI** category you should see **Carousel** with a slideshow icon. Drag it onto the canvas — should show a blue placeholder slide with two dots below.

In the Properties panel: `imageCount` select, 3 Slide groups (Slide 1 expanded), `height`, `showDots`, `showArrows`. Change `imageCount` to "4" → Slide 4 group appears. Change `showArrows` to `true` → left/right arrows appear on the image preview.

Open Export → check the page file — should contain a `<div style={{ display: "flex", overflowX: "scroll", scrollSnapType: "x mandatory" ...` with `<img>` tags inside.

- [ ] **Step 6: Commit**

```bash
git add react-builder/src/registry/index.tsx
git commit -m "feat: add Carousel component to builder registry"
```

---

### Task 2: Skeleton Loader

**Files:**
- Modify: `react-builder/src/registry/index.tsx`

**Interfaces:**
- Consumes: `ind`, `tk`, `RiLoader2Line` (new import)
- Produces: `skeletonDef: ComponentDefinition`, exported as `registry["Skeleton"]`

- [ ] **Step 1: Add `RiLoader2Line` to the react-icons/ri import block**

```tsx
import {
  // ... existing ...
  RiSlideshowLine,
  RiLoader2Line,   // ← add
} from "react-icons/ri"
```

- [ ] **Step 2: Add `skeletonDef` above the registry export block**

Insert directly above `// ─── Registry exports`:

```tsx
// ─── Skeleton ─────────────────────────────────────────────────────────────────

const skeletonDef: ComponentDefinition = {
  type: "Skeleton",
  label: "Skeleton",
  icon: RiLoader2Line,
  description: "Placeholder loading animation cho text, card, avatar hoặc list item",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { variant: "card", rows: 3, animated: true },
  propSchema: {
    variant: { label: "Kiểu", type: "select", defaultValue: "card", options: ["text", "card", "avatar-row", "list-item"] },
    rows: { label: "Số dòng (text)", type: "number", defaultValue: 3 },
    animated: { label: "Animation", type: "boolean", defaultValue: true },
  },
  renderer: (props) => {
    const animated = props.animated as boolean
    const cls = animated ? "animate-pulse" : ""
    const gray = "#E5E7EB"

    if (props.variant === "text") {
      const rows = Math.max(1, props.rows as number)
      return (
        <div className={cls} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ height: 12, background: gray, borderRadius: 4, width: i === rows - 1 ? "60%" : "100%" }} />
          ))}
        </div>
      )
    }

    if (props.variant === "avatar-row") {
      return (
        <div className={cls} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: gray, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 14, background: gray, borderRadius: 4, width: "70%" }} />
            <div style={{ height: 12, background: gray, borderRadius: 4, width: "45%" }} />
          </div>
        </div>
      )
    }

    if (props.variant === "list-item") {
      return (
        <div className={cls} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "white", borderRadius: 12, border: tk.border }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: gray, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ height: 14, background: gray, borderRadius: 4, width: "75%" }} />
            <div style={{ height: 12, background: gray, borderRadius: 4, width: "50%" }} />
          </div>
          <div style={{ width: 24, height: 24, borderRadius: 4, background: gray, flexShrink: 0 }} />
        </div>
      )
    }

    // card (default)
    return (
      <div className={cls} style={{ borderRadius: 12, overflow: "hidden", border: tk.border }}>
        <div style={{ height: 160, background: gray }} />
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 14, background: gray, borderRadius: 4, width: "80%" }} />
          <div style={{ height: 12, background: gray, borderRadius: 4, width: "50%" }} />
        </div>
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const animCls = (props.animated as boolean) ? " animate-pulse" : ""
    const rows = Math.max(1, props.rows as number)

    if (props.variant === "text") {
      const rowDivs = Array.from({ length: rows }).map((_, i) =>
        `${i1}<div className="h-3 bg-gray-200 rounded${i === rows - 1 ? " w-3/5" : " w-full"}" />`
      ).join("\n")
      return `${i0}<div className="flex flex-col gap-2${animCls}">\n${rowDivs}\n${i0}</div>`
    }

    if (props.variant === "avatar-row") {
      return [
        `${i0}<div className="flex items-center gap-3 py-2${animCls}">`,
        `${i1}<div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />`,
        `${i1}<div className="flex-1 flex flex-col gap-2">`,
        `${i2}<div className="h-3.5 bg-gray-200 rounded w-3/4" />`,
        `${i2}<div className="h-3 bg-gray-200 rounded w-2/5" />`,
        `${i1}</div>`,
        `${i0}</div>`,
      ].join("\n")
    }

    if (props.variant === "list-item") {
      return [
        `${i0}<div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-black/5${animCls}">`,
        `${i1}<div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />`,
        `${i1}<div className="flex-1 flex flex-col gap-2">`,
        `${i2}<div className="h-3.5 bg-gray-200 rounded w-3/4" />`,
        `${i2}<div className="h-3 bg-gray-200 rounded w-1/2" />`,
        `${i1}</div>`,
        `${i1}<div className="w-6 h-6 rounded bg-gray-200 shrink-0" />`,
        `${i0}</div>`,
      ].join("\n")
    }

    // card
    return [
      `${i0}<div className="rounded-xl overflow-hidden border border-black/5${animCls}">`,
      `${i1}<div className="h-40 bg-gray-200" />`,
      `${i1}<div className="p-4 flex flex-col gap-2">`,
      `${i2}<div className="h-3.5 bg-gray-200 rounded w-4/5" />`,
      `${i2}<div className="h-3 bg-gray-200 rounded w-1/2" />`,
      `${i1}</div>`,
      `${i0}</div>`,
    ].join("\n")
  },
}
```

- [ ] **Step 3: Add `Skeleton` to the registry export object**

```tsx
  Carousel: carouselDef,
  Skeleton: skeletonDef,    // ← add
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd react-builder && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Verify in browser**

**Skeleton** appears in the UI panel. Drag to canvas — default shows "card" variant: gray rectangle + two gray lines below, pulsing. Switch `variant` to "text" with `rows: 4` → four gray lines, last one shorter. Switch to "avatar-row" → circle + two lines. Toggle `animated` off → static gray (no pulse).

Open Export → page file should contain `className="... animate-pulse"` divs with `bg-gray-200`.

- [ ] **Step 6: Commit**

```bash
git add react-builder/src/registry/index.tsx
git commit -m "feat: add Skeleton loader component to builder registry"
```

---

### Task 3: Accordion + exportCode hook

**Files:**
- Modify: `react-builder/src/registry/index.tsx` — add `accordionDef`
- Modify: `react-builder/src/lib/exportCode.ts` — extend `collectLocalHooks`

**Interfaces:**
- Consumes: `ind`, `tk`, `RiArrowDownSLine` (already imported at line ~13)
- Produces:
  - `accordionDef: ComponentDefinition`, exported as `registry["Accordion"]`
  - `collectLocalHooks` now emits `const [isAccordion_${safeId}_Open, setIsAccordion_${safeId}_Open] = useState(false|true)` for every Accordion node

Naming formula used in **both** `toJSX` and `collectLocalHooks` (must match exactly):
```
safeId  = id.replace(/[^a-zA-Z0-9]/g, "_")
stateVar = `isAccordion_${safeId}_Open`
setter   = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
         = `setIsAccordion_${safeId}_Open`
```

- [ ] **Step 1: Add `accordionDef` above the registry export block**

```tsx
// ─── Accordion ────────────────────────────────────────────────────────────────

const accordionDef: ComponentDefinition = {
  type: "Accordion",
  label: "Accordion",
  icon: RiArrowDownSLine,
  description: "Phần nội dung có thể mở rộng / thu gọn — kéo component vào bên trong",
  category: "ui",
  acceptsChildren: true,
  zmpImports: [],
  defaultProps: { title: "Tiêu đề mục", subtitle: "", defaultOpen: false, bordered: true, chevron: true },
  propSchema: {
    title:       { label: "Tiêu đề",        type: "string",  defaultValue: "Tiêu đề mục" },
    subtitle:    { label: "Mô tả phụ",      type: "string",  defaultValue: "" },
    defaultOpen: { label: "Mặc định mở",    type: "boolean", defaultValue: false },
    bordered:    { label: "Viền",           type: "boolean", defaultValue: true },
    chevron:     { label: "Hiện mũi tên",  type: "boolean", defaultValue: true },
  },
  renderer: (props, children) => {
    const isOpen = props.defaultOpen as boolean
    return (
      <div style={{ borderRadius: 12, border: (props.bordered as boolean) ? tk.border : "none", overflow: "hidden" }}>
        <div
          className="flex items-center justify-between bg-white"
          style={{ padding: "14px 16px", cursor: "pointer" }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: tk.textPrimary, display: "block" }}>
              {props.title as string}
            </span>
            {(props.subtitle as string) && (
              <span style={{ display: "block", fontSize: 12, color: tk.textSecondary, marginTop: 2 }}>
                {props.subtitle as string}
              </span>
            )}
          </div>
          {(props.chevron as boolean) && (
            <svg
              style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tk.textTertiary} strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </div>
        {isOpen ? (
          <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F3F4F6" }}>
            {children ?? (
              <div
                className="flex items-center justify-center py-4 text-xs rounded-lg"
                style={{ border: "2px dashed rgba(0,104,255,0.2)", color: "rgba(0,104,255,0.4)" }}
              >
                Thả component vào đây
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "0 16px 8px" }}>
            <div
              className="flex items-center justify-center py-3 text-xs rounded-lg"
              style={{ border: "2px dashed rgba(0,104,255,0.1)", color: "rgba(0,104,255,0.3)" }}
            >
              Nội dung (mặc định ẩn)
            </div>
          </div>
        )}
      </div>
    )
  },
  toJSX: (props, renderChildren, level, nodeId) => {
    const safeId = (nodeId ?? `a${level}`).replace(/[^a-zA-Z0-9]/g, "_")
    const stateVar = `isAccordion_${safeId}_Open`
    const setter = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2), i3 = ind(level + 3)

    const wrapStyle = (props.bordered as boolean)
      ? `{{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}`
      : `{{ borderRadius: 12, overflow: "hidden" }}`

    const subtitle = (props.subtitle as string)
      ? `\n${i3}<span style={{ display: "block", fontSize: 12, color: "#6B7280", marginTop: 2 }}>${props.subtitle}</span>`
      : ""

    const chevron = (props.chevron as boolean)
      ? `\n${i2}<svg style={{ transform: ${stateVar} ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>`
      : ""

    const children = renderChildren(level + 3)
    const childContent = children || `${i3}{/* Nội dung accordion */}`

    return [
      `${i0}<div style=${wrapStyle}>`,
      `${i1}<button onClick={() => ${setter}(!${stateVar})} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "white", border: "none", cursor: "pointer", textAlign: "left" }}>`,
      `${i2}<div style={{ flex: 1, minWidth: 0 }}>`,
      `${i3}<span style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>${props.title}</span>${subtitle}`,
      `${i2}</div>${chevron}`,
      `${i1}</button>`,
      `${i1}{${stateVar} && (`,
      `${i2}<div style={{ padding: "0 16px 16px", borderTop: "1px solid #F3F4F6" }}>`,
      childContent,
      `${i2}</div>`,
      `${i1})}`,
      `${i0}</div>`,
    ].join("\n")
  },
}
```

- [ ] **Step 2: Add `Accordion` to the registry export object**

```tsx
  Carousel: carouselDef,
  Skeleton: skeletonDef,
  Accordion: accordionDef,    // ← add
```

- [ ] **Step 3: Extend `collectLocalHooks` in `exportCode.ts`**

Open `react-builder/src/lib/exportCode.ts`. Find `collectLocalHooks` (around line 910). The current `walk` function body is:

```typescript
  const walk = (id: string) => {
    const node = nodes[id]
    if (!node) return
    if (node.type === "Tabs") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const varName = `activeTab_${safeId}`
      const setter = `set${varName.charAt(0).toUpperCase()}${varName.slice(1)}`
      lines.push(`const [${varName}, ${setter}] = useState(${JSON.stringify(node.props.activeTab ?? "1")})`)
      needsUseState = true
    }
    node.children.forEach(walk)
  }
```

Replace it with:

```typescript
  const walk = (id: string) => {
    const node = nodes[id]
    if (!node) return
    if (node.type === "Tabs") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const varName = `activeTab_${safeId}`
      const setter = `set${varName.charAt(0).toUpperCase()}${varName.slice(1)}`
      lines.push(`const [${varName}, ${setter}] = useState(${JSON.stringify(node.props.activeTab ?? "1")})`)
      needsUseState = true
    }
    if (node.type === "Accordion") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const stateVar = `isAccordion_${safeId}_Open`
      const setter = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
      lines.push(`const [${stateVar}, ${setter}] = useState(${JSON.stringify(node.props.defaultOpen ?? false)})`)
      needsUseState = true
    }
    node.children.forEach(walk)
  }
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd react-builder && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Verify Accordion in browser**

Drag **Accordion** onto the canvas. Default: header "Tiêu đề mục" with chevron (pointing down) + dashed "Nội dung (mặc định ẩn)" placeholder below.

Toggle `defaultOpen` to `true` in Properties → content area changes to a drop zone (upward chevron). Drop a **Text** component inside.

Click **Export** → the page file should contain:

```tsx
import { useState } from "react"

export default function IndexPage() {
  const [isAccordion_XXXX_Open, setIsAccordion_XXXX_Open] = useState(false)
  return (
    ...
    <div style={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <button onClick={() => setIsAccordion_XXXX_Open(!isAccordion_XXXX_Open)} ...>
```

Where `XXXX` is the node's id with non-alphanumeric chars replaced by `_`.

- [ ] **Step 6: Commit**

```bash
git add react-builder/src/registry/index.tsx react-builder/src/lib/exportCode.ts
git commit -m "feat: add Accordion component with useState export support"
```

---

### Task 4: ModalDialog + exportCode hook

**Files:**
- Modify: `react-builder/src/registry/index.tsx` — add `modalDialogDef`
- Modify: `react-builder/src/lib/exportCode.ts` — extend `collectLocalHooks` for ModalDialog

Note: `ModalCard` (type `"ModalCard"`) and `BottomSheet` (type `"BottomSheet"`) are static layout-only components already in the registry. `ModalDialog` is a new triggerable component with open/close `useState` — different type, different use case.

**Interfaces:**
- Consumes: `ind`, `tk`, `RiWindowLine` (already imported, also used by `modalCardDef`), `RiCloseCircleLine` (already imported)
- Produces:
  - `modalDialogDef: ComponentDefinition`, exported as `registry["ModalDialog"]`
  - `collectLocalHooks` emits `const [isModal_${safeId}_Open, setIsModal_${safeId}_Open] = useState(false)` for every ModalDialog node

Naming formula — must match in both `toJSX` and `collectLocalHooks`:
```
safeId   = id.replace(/[^a-zA-Z0-9]/g, "_")
stateVar = `isModal_${safeId}_Open`
setter   = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
         = `setIsModal_${safeId}_Open`
```

- [ ] **Step 1: Add `modalDialogDef` above the registry export block**

```tsx
// ─── ModalDialog ──────────────────────────────────────────────────────────────

const modalDialogDef: ComponentDefinition = {
  type: "ModalDialog",
  label: "Modal Dialog",
  icon: RiWindowLine,
  description: "Modal hoặc bottom sheet có nút trigger và open/close state — kéo nội dung vào bên trong",
  category: "ui",
  acceptsChildren: true,
  zmpImports: [],
  defaultProps: {
    type: "modal",
    title: "Xác nhận",
    triggerLabel: "Mở",
    triggerVariant: "primary",
    overlayClose: true,
  },
  propSchema: {
    type:           { label: "Kiểu",              type: "select",  defaultValue: "modal",   options: ["modal", "bottomSheet"] },
    title:          { label: "Tiêu đề",           type: "string",  defaultValue: "Xác nhận" },
    triggerLabel:   { label: "Nút trigger",       type: "string",  defaultValue: "Mở" },
    triggerVariant: { label: "Kiểu nút",          type: "select",  defaultValue: "primary", options: ["primary", "secondary", "tertiary"] },
    overlayClose:   { label: "Click ngoài đóng", type: "boolean", defaultValue: true },
  },
  renderer: (props, children) => {
    const isBottomSheet = props.type === "bottomSheet"
    const variant = props.triggerVariant as string
    const btnStyle: React.CSSProperties =
      variant === "primary"
        ? { background: tk.accentGrad, color: "white", boxShadow: tk.accentShadow }
        : variant === "secondary"
        ? { background: tk.surface, color: tk.accent, border: "1.5px solid rgba(0,104,255,0.25)" }
        : { background: "transparent", color: tk.accent }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Trigger button */}
        <button style={{ borderRadius: tk.radius.md, padding: "12px 20px", fontSize: 15, fontWeight: 600, border: "none", cursor: "default", letterSpacing: "-0.1px", ...btnStyle }}>
          {props.triggerLabel as string}
        </button>
        {/* Inline modal preview — always open in canvas */}
        <div style={{ border: "2px dashed rgba(0,104,255,0.15)", borderRadius: isBottomSheet ? "16px 16px 0 0" : 16, overflow: "hidden", opacity: 0.9 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "rgba(0,104,255,0.03)", borderBottom: "1px solid rgba(0,104,255,0.08)" }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: tk.textPrimary }}>{props.title as string}</span>
            <RiCloseCircleLine style={{ fontSize: 18, color: tk.textTertiary }} />
          </div>
          <div style={{ padding: "12px 16px", background: "white" }}>
            {children ?? (
              <div
                className="flex items-center justify-center py-4 text-xs rounded-lg"
                style={{ border: "2px dashed rgba(0,104,255,0.2)", color: "rgba(0,104,255,0.4)" }}
              >
                Thả nội dung vào đây
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
  toJSX: (props, renderChildren, level, nodeId) => {
    const safeId = (nodeId ?? `m${level}`).replace(/[^a-zA-Z0-9]/g, "_")
    const stateVar = `isModal_${safeId}_Open`
    const setter = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2), i3 = ind(level + 3), i4 = ind(level + 4)

    const isBottomSheet = props.type === "bottomSheet"
    const overlayAlign = isBottomSheet ? `"flex-end"` : `"center"`
    const sheetRadius = isBottomSheet ? `"16px 16px 0 0"` : `16`
    const overlayPad = isBottomSheet ? 0 : 16

    const variant = props.triggerVariant as string
    const btnStyle =
      variant === "primary"
        ? `background: "linear-gradient(135deg, #0068FF, #0084FF)", color: "white", boxShadow: "0 4px 12px rgba(0,104,255,0.28)"`
        : variant === "secondary"
        ? `background: "white", color: "#0068FF", border: "1.5px solid rgba(0,104,255,0.25)"`
        : `background: "transparent", color: "#0068FF"`

    const overlayClickAttr = (props.overlayClose as boolean) ? `onClick={() => ${setter}(false)} ` : ""
    const children = renderChildren(level + 4)
    const childContent = children || `${i4}{/* Nội dung modal */}`

    return [
      `${i0}<>`,
      `${i1}<button onClick={() => ${setter}(true)} style={{ borderRadius: 12, padding: "12px 20px", fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer", ${btnStyle} }}>`,
      `${i2}${props.triggerLabel}`,
      `${i1}</button>`,
      `${i1}{${stateVar} && (`,
      `${i2}<div ${overlayClickAttr}style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: ${overlayAlign}, padding: ${overlayPad} }}>`,
      `${i3}<div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: ${sheetRadius}, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>`,
      `${i4}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>`,
      `${i4}  <span style={{ fontWeight: 600, fontSize: 16, color: "#111827" }}>${props.title}</span>`,
      `${i4}  <button onClick={() => ${setter}(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#9CA3AF", lineHeight: 1 }}>×</button>`,
      `${i4}</div>`,
      `${i4}<div style={{ padding: 20 }}>`,
      childContent,
      `${i4}</div>`,
      `${i3}</div>`,
      `${i2}</div>`,
      `${i1})}`,
      `${i0}</>`,
    ].join("\n")
  },
}
```

- [ ] **Step 2: Add `ModalDialog` to the registry export object**

```tsx
  Carousel: carouselDef,
  Skeleton: skeletonDef,
  Accordion: accordionDef,
  ModalDialog: modalDialogDef,    // ← add
```

- [ ] **Step 3: Extend `collectLocalHooks` for `ModalDialog`**

In `react-builder/src/lib/exportCode.ts`, inside `walk`, add after the `"Accordion"` block:

```typescript
    if (node.type === "ModalDialog") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const stateVar = `isModal_${safeId}_Open`
      const setter = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
      lines.push(`const [${stateVar}, ${setter}] = useState(false)`)
      needsUseState = true
    }
```

Full `walk` body after all three additions:

```typescript
  const walk = (id: string) => {
    const node = nodes[id]
    if (!node) return
    if (node.type === "Tabs") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const varName = `activeTab_${safeId}`
      const setter = `set${varName.charAt(0).toUpperCase()}${varName.slice(1)}`
      lines.push(`const [${varName}, ${setter}] = useState(${JSON.stringify(node.props.activeTab ?? "1")})`)
      needsUseState = true
    }
    if (node.type === "Accordion") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const stateVar = `isAccordion_${safeId}_Open`
      const setter = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
      lines.push(`const [${stateVar}, ${setter}] = useState(${JSON.stringify(node.props.defaultOpen ?? false)})`)
      needsUseState = true
    }
    if (node.type === "ModalDialog") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const stateVar = `isModal_${safeId}_Open`
      const setter = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
      lines.push(`const [${stateVar}, ${setter}] = useState(false)`)
      needsUseState = true
    }
    node.children.forEach(walk)
  }
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd react-builder && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Verify ModalDialog in browser**

Drag **Modal Dialog** onto the canvas. Should show:
1. A blue "Mở" primary button at top
2. Below it: a dashed-bordered frame with header row ("Xác nhận" + × icon) and a content drop zone

In Properties: `type` (modal/bottomSheet), `title`, `triggerLabel`, `triggerVariant`, `overlayClose`. Change `type` to "bottomSheet" → top border-radius becomes `16px 16px 0 0`. Change `triggerVariant` to "secondary" → button becomes white with blue border.

Drop a **Text** component into the content area of the modal preview.

Click **Export** → page file should contain:

```tsx
import { useState } from "react"

export default function IndexPage() {
  const [isModal_XXXX_Open, setIsModal_XXXX_Open] = useState(false)
  return (
    ...
    <>
      <button onClick={() => setIsModal_XXXX_Open(true)} ...>Mở</button>
      {isModal_XXXX_Open && (
        <div onClick={() => setIsModal_XXXX_Open(false)} style={{ position: "fixed", inset: 0, ...}}>
```

- [ ] **Step 6: Commit**

```bash
git add react-builder/src/registry/index.tsx react-builder/src/lib/exportCode.ts
git commit -m "feat: add ModalDialog component with useState export support"
```

---

## Self-Review

**Spec coverage:**
- ✓ Carousel: numbered props (image1–5), `showWhen` propGroups, canvas shows image1 + dots/arrows, `toJSX` uses CSS scroll-snap
- ✓ Skeleton: 4 variants, `rows` prop for text, `animated` → Tailwind `animate-pulse`, no JS state
- ✓ Accordion: `acceptsChildren: true`, `defaultOpen` controls canvas render, `collectLocalHooks` emits `useState`, `toJSX` uses same naming formula
- ✓ ModalDialog: trigger button + inline preview (always open in canvas), `acceptsChildren: true`, `collectLocalHooks` emits `useState`, `toJSX` handles modal/bottomSheet type
- ✓ Only 2 files modified total (registry + exportCode)
- ✓ No new prop types, no changes to `types/builder.ts` or `PropertiesPanel`

**Placeholder scan:** No TBD, TODO, or "similar to Task N" references. Every step has complete code.

**Type consistency:**
- `stateVar` / `setter` formula is identical string operations in both `toJSX` and `collectLocalHooks` for each component type — verified by reading both in Task 3 Step 1+3 and Task 4 Step 1+3
- `safeId` computed as `id.replace(/[^a-zA-Z0-9]/g, "_")` in both places
- `ind(level)` usage consistent with existing registry patterns (`i0`/`i1`/`i2`/`i3`/`i4` variables)

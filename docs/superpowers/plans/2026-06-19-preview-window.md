# Preview Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khi user click Preview trong Topbar, mở popup `/preview` (430×932px) hiển thị phone mockup với nội dung builder hiện tại, live-sync qua BroadcastChannel, và hỗ trợ điều hướng multi-page.

**Architecture:** Route `/preview` đọc initial state từ localStorage (`zmp-builder-v2`) và nhận live updates qua `BroadcastChannel("zmp-preview")`. `PreviewNode` render cây node sạch (không dnd/selection) dùng registry renderers có sẵn. `PreviewContext` cung cấp `navigate(path)` cho toàn cây; `ZaloBottomNav` renderer nhận `__navigate__` và `__currentPath__` được inject bởi `PreviewNode` để handle tab switching.

**Tech Stack:** Next.js 16 App Router (`"use client"`), React, TypeScript, Zustand persist, BroadcastChannel API, Tailwind CSS

## Global Constraints

- Next.js 16 App Router — mọi file client-side đều cần `"use client"` directive ở đầu
- `previewChannel.ts` không được import từ builder store (tránh circular deps)
- Zustand persist key: `"zmp-builder-v2"`, cấu trúc: `{ state: { pages, currentPageId, appConfig, variables, apis }, version }`
- Không có test framework — verify manually qua browser
- Thay đổi ZaloBottomNav renderer phải backward-compatible (canvas builder không bị ảnh hưởng)
- Renderer signature: `(props: Record<string, unknown>, children?: React.ReactNode) => React.ReactElement`

---

## File Map

### Tạo mới
| File | Trách nhiệm |
|---|---|
| `src/lib/previewChannel.ts` | BroadcastChannel send/receive + `PreviewSnapshot` type |
| `src/lib/previewUtils.ts` | `readFromLocalStorage` + `findGlobalBottomNav` |
| `src/components/preview/PreviewRenderer.tsx` | `PreviewContext` + `PreviewNode` + action executor |
| `src/app/preview/page.tsx` | Next.js route `/preview` — phone mockup shell + mini-router |

### Chỉnh sửa
| File | Thay đổi |
|---|---|
| `src/components/builder/PhoneMockup.tsx` | Thêm optional `themeColor` prop |
| `src/components/builder/BuilderContent.tsx` | Thêm store subscriber → broadcast |
| `src/registry/index.tsx` | `zaloBottomNavDef.renderer` — inject preview navigation |
| `src/components/builder/Topbar.tsx` | `handlePreview` mở `/preview` popup |

---

## Task 1: Foundation utilities — previewChannel + previewUtils

**Files:**
- Create: `src/lib/previewChannel.ts`
- Create: `src/lib/previewUtils.ts`

**Interfaces:**
- Produces:
  - `PreviewSnapshot` type (exported từ `previewChannel.ts`)
  - `broadcastState(snapshot: PreviewSnapshot): void`
  - `listenPreviewState(cb: (s: PreviewSnapshot) => void): () => void`
  - `readFromLocalStorage(): PreviewSnapshot | null`
  - `findGlobalBottomNav(pages: PageSchema[]): { node: ComponentNode; nodes: Record<string, ComponentNode> } | null`

- [ ] **Step 1: Tạo `src/lib/previewChannel.ts`**

```ts
import { PageSchema, AppConfig, Variable, ApiDefinition } from "@/types/builder"

export type PreviewSnapshot = {
  pages: PageSchema[]
  appConfig: AppConfig
  variables: Variable[]
  apis: ApiDefinition[]
}

const CHANNEL_NAME = "zmp-preview"

export function broadcastState(snapshot: PreviewSnapshot): void {
  const ch = new BroadcastChannel(CHANNEL_NAME)
  ch.postMessage(snapshot)
  ch.close()
}

export function listenPreviewState(cb: (s: PreviewSnapshot) => void): () => void {
  const ch = new BroadcastChannel(CHANNEL_NAME)
  ch.onmessage = (e) => cb(e.data as PreviewSnapshot)
  return () => ch.close()
}
```

- [ ] **Step 2: Tạo `src/lib/previewUtils.ts`**

```ts
import { PageSchema, ComponentNode } from "@/types/builder"
import { PreviewSnapshot } from "./previewChannel"

export function readFromLocalStorage(): PreviewSnapshot | null {
  try {
    const raw = localStorage.getItem("zmp-builder-v2")
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: PreviewSnapshot }
    const s = parsed?.state
    if (!s?.pages) return null
    return {
      pages: s.pages,
      appConfig: s.appConfig,
      variables: s.variables ?? [],
      apis: s.apis ?? [],
    }
  } catch {
    return null
  }
}

export function findGlobalBottomNav(
  pages: PageSchema[]
): { node: ComponentNode; nodes: Record<string, ComponentNode> } | null {
  for (const page of pages) {
    for (const node of Object.values(page.nodes)) {
      if (node.type === "ZaloBottomNav") return { node, nodes: page.nodes }
    }
  }
  return null
}
```

- [ ] **Step 3: Verify — mở browser console tại localhost:3000, chạy:**

```js
localStorage.getItem("zmp-builder-v2")
```

Kết quả phải là JSON string có key `state.pages`. Nếu null → cần build/drag ít nhất 1 component trước.

- [ ] **Step 4: Commit**

```bash
git add src/lib/previewChannel.ts src/lib/previewUtils.ts
git commit -m "feat: add preview channel + utils (BroadcastChannel, localStorage reader)"
```

---

## Task 2: PhoneMockup — thêm optional themeColor prop

**Files:**
- Modify: `src/components/builder/PhoneMockup.tsx`

**Interfaces:**
- Consumes: không
- Produces: `PhoneMockupProps` với `themeColor?: string` — nếu được pass thì dùng, không thì fallback về store

- [ ] **Step 1: Cập nhật `PhoneMockup.tsx`**

Thay đoạn interface và khai báo component (dòng 4-12) thành:

```tsx
interface PhoneMockupProps {
  children: React.ReactNode
  bottomNav?: React.ReactNode
  themeColor?: string
}

export function PhoneMockup({ children, bottomNav, themeColor: themeColorProp }: PhoneMockupProps) {
  const storeThemeColor = useBuilderStore((s) => s.appConfig.themeColor)
  const themeColor = themeColorProp ?? storeThemeColor
```

(Xóa dòng `const themeColor = useBuilderStore(...)` cũ đi, thay bằng 2 dòng mới trên.)

- [ ] **Step 2: Verify — builder canvas vẫn hiển thị đúng themeColor trong status bar**

Mở builder → đổi `themeColor` trong app config → status bar trong phone mockup đổi màu ngay.

- [ ] **Step 3: Commit**

```bash
git add src/components/builder/PhoneMockup.tsx
git commit -m "feat: PhoneMockup accepts optional themeColor prop for preview mode"
```

---

## Task 3: ZaloBottomNav renderer — preview navigation support

**Files:**
- Modify: `src/registry/index.tsx` — chỉ phần `zaloBottomNavDef.renderer` (dòng 413–462)

**Interfaces:**
- Consumes: `props.__navigate__?: (path: string) => void`, `props.__currentPath__?: string`
- Produces: BottomNav tabs có onClick + active highlight dựa vào currentPath khi ở preview mode

- [ ] **Step 1: Thay thế `zaloBottomNavDef.renderer` (dòng 413–462)**

```tsx
renderer: (props) => {
  const navigate = props.__navigate__ as ((path: string) => void) | undefined
  const currentPath = props.__currentPath__ as string | undefined

  const tabs = [
    { icon: props.tab1Icon as string, label: props.tab1Label as string, key: "1", route: (props.tab1Route as string) ?? "" },
    { icon: props.tab2Icon as string, label: props.tab2Label as string, key: "2", route: (props.tab2Route as string) ?? "" },
    { icon: props.tab3Icon as string, label: props.tab3Label as string, key: "3", route: (props.tab3Route as string) ?? "" },
  ]

  return (
    <div
      className="flex items-center justify-around px-2 shrink-0"
      style={{
        height: 60,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: tk.border,
      }}
    >
      {tabs.map((tab) => {
        // Preview mode: match by route; canvas mode: match by activeTab prop
        const isActive = currentPath !== undefined
          ? tab.route !== "" && tab.route === currentPath
          : props.activeTab === tab.key

        const handleClick = navigate && tab.route
          ? () => navigate(tab.route)
          : undefined

        const IconComp = emojiIconMap[tab.icon]
        return (
          <div
            key={tab.key}
            onClick={handleClick}
            className="flex flex-col items-center gap-0.5 flex-1 relative pt-1"
            style={{ cursor: handleClick ? "pointer" : "default" }}
          >
            {isActive && (
              <div
                className="absolute top-0 w-8 h-[3px] rounded-full"
                style={{ background: tk.accent }}
              />
            )}
            {IconComp ? (
              <IconComp
                style={{
                  fontSize: 22,
                  color: isActive ? tk.accent : tk.textTertiary,
                }}
              />
            ) : (
              <span className="text-xl leading-none">{tab.icon}</span>
            )}
            <span
              className="text-[10px] font-medium"
              style={{ color: isActive ? tk.accent : tk.textTertiary }}
            >
              {tab.label}
            </span>
          </div>
        )
      })}
    </div>
  )
},
```

- [ ] **Step 2: Verify — canvas mode không bị ảnh hưởng**

Mở builder → kéo BottomNav vào canvas → hiển thị đúng như trước (active tab theo `activeTab` prop, không có click navigation).

- [ ] **Step 3: Commit**

```bash
git add src/registry/index.tsx
git commit -m "feat: ZaloBottomNav renderer supports __navigate__ + __currentPath__ for preview mode"
```

---

## Task 4: BuilderContent — store broadcast subscriber

**Files:**
- Modify: `src/components/builder/BuilderContent.tsx`

**Interfaces:**
- Consumes: `useBuilderStore` (đã import), `broadcastState` từ `previewChannel.ts`

- [ ] **Step 1: Thêm import vào đầu file**

```tsx
import { broadcastState } from "@/lib/previewChannel"
import { useBuilderStore } from "@/store/builderStore"
```

(import `useBuilderStore` đã có sẵn — chỉ cần thêm `broadcastState`)

- [ ] **Step 2: Thêm component `PreviewBroadcaster` trước `BuilderContent`**

```tsx
function PreviewBroadcaster() {
  useEffect(() => {
    return useBuilderStore.subscribe((state) => {
      broadcastState({
        pages: state.pages,
        appConfig: state.appConfig,
        variables: state.variables,
        apis: state.apis,
      })
    })
  }, [])
  return null
}
```

- [ ] **Step 3: Render `<PreviewBroadcaster />` bên trong `BuilderContent`**

Trong JSX của `BuilderContent`, thêm `<PreviewBroadcaster />` ngay sau `<KeyboardShortcuts />`:

```tsx
<BuilderDnd>
  <KeyboardShortcuts />
  <PreviewBroadcaster />    {/* ← thêm dòng này */}
  <div className="flex flex-col h-screen overflow-hidden bg-[#141417]">
```

- [ ] **Step 4: Verify — mở DevTools > Application > BroadcastChannel**

Kéo 1 component vào canvas → kiểm tra Console (không có error). Tạm thời có thể log trong `broadcastState` để verify:
```ts
// tạm thêm log vào broadcastState trong previewChannel.ts
console.log("[preview broadcast]", snapshot.pages.length, "pages")
```
Thấy log xuất hiện khi kéo component. Xóa log sau khi verify.

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/BuilderContent.tsx src/lib/previewChannel.ts
git commit -m "feat: broadcast builder state on every change for live preview sync"
```

---

## Task 5: PreviewRenderer — PreviewContext + PreviewNode

**Files:**
- Create: `src/components/preview/PreviewRenderer.tsx`

**Interfaces:**
- Consumes:
  - `registry` từ `@/registry/index`
  - `ComponentNode` từ `@/types/builder`
  - `EventType`, `Action` từ `@/types/builder`
- Produces:
  - `PreviewContext` (exported)
  - `PreviewNode` (exported) — `({ id, nodes }: { id: string; nodes: Record<string, ComponentNode> }) => JSX.Element | null`

- [ ] **Step 1: Tạo `src/components/preview/PreviewRenderer.tsx`**

```tsx
"use client"

import { createContext, useContext } from "react"
import { registry } from "@/registry/index"
import { ComponentNode } from "@/types/builder"

// ─── Context ──────────────────────────────────────────────────────────────────

type PreviewContextValue = {
  currentPath: string
  navigate: (path: string) => void
}

export const PreviewContext = createContext<PreviewContextValue>({
  currentPath: "/",
  navigate: () => {},
})

// ─── Action executor ──────────────────────────────────────────────────────────

function executeAction(
  actionType: string,
  action: Record<string, unknown>,
  navigate: (path: string) => void
) {
  switch (action.type) {
    case "navigate":
      navigate(action.to as string)
      break
    case "openUrl":
      window.open(action.url as string, "_blank")
      break
    case "openPhone":
      window.open(`tel:${action.phone as string}`)
      break
    // showSnackbar, setState, callApi — out of scope for now
  }
}

// ─── PreviewNode ──────────────────────────────────────────────────────────────

export function PreviewNode({
  id,
  nodes,
}: {
  id: string
  nodes: Record<string, ComponentNode>
}) {
  const node = nodes[id]
  const def = node ? registry[node.type] : null
  const { navigate, currentPath } = useContext(PreviewContext)

  if (!node || !def) return null

  const handleClick = node.events?.onClick
    ? (e: React.MouseEvent) => {
        e.stopPropagation()
        executeAction("onClick", node.events!.onClick as Record<string, unknown>, navigate)
      }
    : undefined

  // ZaloBottomNav needs navigate + currentPath injected as special props
  const extraProps =
    node.type === "ZaloBottomNav"
      ? { __navigate__: navigate, __currentPath__: currentPath }
      : {}

  const childrenEl =
    node.children.length > 0 ? (
      <>
        {node.children.map((cid) => (
          <PreviewNode key={cid} id={cid} nodes={nodes} />
        ))}
      </>
    ) : undefined

  const rendered = def.renderer({ ...node.props, ...extraProps }, childrenEl)

  if (!handleClick) return rendered

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      {rendered}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript — chạy**

```bash
cd react-builder && npm run lint
```

Không có lỗi TypeScript trong file mới. Nếu có lỗi `node.events` chưa được type → kiểm tra `types/builder.ts` xem `NodeEvents` có `onClick` không.

- [ ] **Step 3: Commit**

```bash
git add src/components/preview/PreviewRenderer.tsx
git commit -m "feat: add PreviewContext and PreviewNode for clean preview rendering"
```

---

## Task 6: /preview page

**Files:**
- Create: `src/app/preview/page.tsx`

**Interfaces:**
- Consumes:
  - `PreviewSnapshot`, `listenPreviewState` từ `@/lib/previewChannel`
  - `readFromLocalStorage`, `findGlobalBottomNav` từ `@/lib/previewUtils`
  - `PhoneMockup` từ `@/components/builder/PhoneMockup`
  - `PreviewContext`, `PreviewNode` từ `@/components/preview/PreviewRenderer`

- [ ] **Step 1: Tạo `src/app/preview/page.tsx`**

```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { listenPreviewState, PreviewSnapshot } from "@/lib/previewChannel"
import { readFromLocalStorage, findGlobalBottomNav } from "@/lib/previewUtils"
import { PhoneMockup } from "@/components/builder/PhoneMockup"
import { PreviewContext, PreviewNode } from "@/components/preview/PreviewRenderer"

const LAYOUT_NODE_TYPES = new Set(["ZaloBottomNav"])

export default function PreviewPage() {
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)

  // Load initial state from localStorage
  useEffect(() => {
    const initial = readFromLocalStorage()
    if (initial) {
      setSnapshot(initial)
      setCurrentPageId(initial.pages[0]?.id ?? null)
    }
  }, [])

  // Live sync from builder via BroadcastChannel
  useEffect(() => {
    return listenPreviewState((s) => {
      setSnapshot(s)
      setCurrentPageId((prev) => {
        // Keep current page if it still exists, else fall back to first
        const stillExists = s.pages.some((p) => p.id === prev)
        return stillExists ? prev : (s.pages[0]?.id ?? null)
      })
    })
  }, [])

  const navigate = useCallback(
    (path: string) => {
      const page = snapshot?.pages.find((p) => p.path === path)
      if (page) setCurrentPageId(page.id)
    },
    [snapshot]
  )

  const currentPage = snapshot?.pages.find((p) => p.id === currentPageId)
  const currentPath = currentPage?.path ?? "/"
  const bottomNavEntry = findGlobalBottomNav(snapshot?.pages ?? [])

  const contentNodeIds = (currentPage?.rootIds ?? []).filter(
    (id) => !LAYOUT_NODE_TYPES.has(currentPage!.nodes[id]?.type)
  )

  return (
    <PreviewContext.Provider value={{ currentPath, navigate }}>
      <div
        className="flex items-center justify-center min-h-screen bg-[#1A1A1E]"
        style={{
          backgroundImage: "radial-gradient(circle, #2A2A32 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {snapshot ? (
          <PhoneMockup
            themeColor={snapshot.appConfig.themeColor}
            bottomNav={
              bottomNavEntry ? (
                <PreviewNode
                  id={bottomNavEntry.node.id}
                  nodes={bottomNavEntry.nodes}
                />
              ) : undefined
            }
          >
            <div className="flex flex-col bg-white min-h-full">
              {contentNodeIds.map((id) => (
                <PreviewNode key={id} id={id} nodes={currentPage!.nodes} />
              ))}
            </div>
          </PhoneMockup>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0068FF]/10 flex items-center justify-center">
              <span className="text-[#0068FF] text-xl">Z</span>
            </div>
            <p className="text-zinc-400 text-sm">Mở builder để bắt đầu</p>
            <p className="text-zinc-600 text-xs">
              Giữ cửa sổ này mở — preview sẽ tự động cập nhật
            </p>
          </div>
        )}
      </div>
    </PreviewContext.Provider>
  )
}
```

- [ ] **Step 2: Verify — navigate tới `localhost:3000/preview` trong browser**

Trang hiển thị: phone mockup nếu builder đã có state, hoặc empty state "Mở builder để bắt đầu".

- [ ] **Step 3: Verify — live sync**

Mở builder (localhost:3000) và `/preview` song song. Kéo component vào canvas builder → preview tự cập nhật trong vài ms.

- [ ] **Step 4: Commit**

```bash
git add src/app/preview/page.tsx
git commit -m "feat: add /preview route with phone mockup, live sync, and mini-router"
```

---

## Task 7: Topbar — cập nhật handlePreview

**Files:**
- Modify: `src/components/builder/Topbar.tsx`

**Interfaces:**
- Consumes: không có deps mới

- [ ] **Step 1: Thay thế hàm `handlePreview` (dòng 163–176)**

Tìm và thay:
```ts
const handlePreview = () => {
  const { localUrl } = appConfig
  if (localUrl) {
    const left = Math.round(window.screenX + (window.outerWidth - PREVIEW_W) / 2)
    const top = Math.round(window.screenY + (window.outerHeight - PREVIEW_H) / 2)
    window.open(
      localUrl,
      "zmp-preview",
      `width=${PREVIEW_W},height=${PREVIEW_H},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  } else {
    setShowQR(true)
  }
}
```

Thành:
```ts
const handlePreview = () => {
  const w = 430, h = 932
  const left = Math.round(window.screenX + (window.outerWidth - w) / 2)
  const top  = Math.round(window.screenY + (window.outerHeight - h) / 2)
  window.open(
    "/preview",
    "zmp-preview",
    `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
  )
}
```

- [ ] **Step 2: Xóa hằng `PREVIEW_W` và `PREVIEW_H` (dòng 160-161) vì không còn dùng nữa**

```ts
// Xóa 2 dòng này:
const PREVIEW_W = 430
const PREVIEW_H = 932
```

- [ ] **Step 3: Verify — bấm Preview button trong builder**

Cửa sổ popup mở tại `/preview` với kích thước 430×932, hiển thị phone mockup đúng nội dung canvas hiện tại.

- [ ] **Step 4: Verify — multi-page navigation**

Thêm 2+ pages, kéo BottomNav với tab routes trỏ đến các page. Mở preview → bấm tab trong BottomNav → page chuyển đúng.

- [ ] **Step 5: Verify — live sync end-to-end**

Preview đang mở → kéo thêm component vào canvas → preview cập nhật ngay không cần refresh.

- [ ] **Step 6: Commit**

```bash
git add src/components/builder/Topbar.tsx
git commit -m "feat: Preview button opens /preview popup — no longer requires localUrl"
```

---

## Self-Review Checklist

### Spec coverage
- [x] Mở cửa sổ popup mới khi click Preview → Task 7
- [x] Phone mockup shell → Task 6 (dùng PhoneMockup)
- [x] Live sync qua BroadcastChannel → Tasks 1, 4, 6
- [x] Multi-page navigation → Tasks 1 (findGlobalBottomNav), 3 (ZaloBottomNav), 5 (PreviewContext), 6 (mini-router)
- [x] Interactive events (navigate, openUrl, openPhone) → Task 5 (executeAction)
- [x] Initial load từ localStorage → Tasks 1 (readFromLocalStorage), 6
- [x] themeColor live update → Task 2 (PhoneMockup prop), Task 6 (pass themeColor)
- [x] Edge case: page bị xóa → Task 6 (fallback to pages[0])
- [x] Edge case: preview mở trước builder → Task 6 (empty state)
- [x] Out of scope (snackbar, setState, callApi) → documented, not implemented

### Type consistency
- `PreviewSnapshot` defined in Task 1, used in Tasks 4, 6 ✓
- `findGlobalBottomNav` signature matches usage in Task 6 ✓  
- `PreviewNode` props `{ id, nodes }` consistent across Tasks 5 and 6 ✓
- `PhoneMockup` `themeColor` prop added in Task 2, used in Task 6 ✓
- `__navigate__` + `__currentPath__` injected in Task 5, consumed in Task 3 ✓

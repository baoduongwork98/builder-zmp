# Preview Window — Design Spec

**Date:** 2026-06-19  
**Status:** Approved

## Overview

Khi user click **Preview** trong Topbar, mở một cửa sổ popup mới (`/preview`) có kích thước phone (430×932). Preview hiển thị phone mockup chứa nội dung hiện tại của builder, hỗ trợ:

- **Live sync** — mỗi khi builder state thay đổi, preview cập nhật ngay qua BroadcastChannel
- **Multi-page navigation** — các action `navigate(path)` hoạt động thật, chuyển page trong preview
- **Interactive events** — `onClick` trên node thực thi action (navigate, openUrl, v.v.)

---

## Files

### Tạo mới

| File | Mục đích |
|---|---|
| `react-builder/src/app/preview/page.tsx` | Next.js route `/preview` — page shell, mini-router, PhoneMockup |
| `react-builder/src/components/preview/PreviewRenderer.tsx` | PreviewContext, PreviewNode, action executor |
| `react-builder/src/lib/previewChannel.ts` | BroadcastChannel wrapper — send/receive snapshot |
| `react-builder/src/lib/previewUtils.ts` | `findGlobalBottomNav` + `readFromLocalStorage` — shared utils |

### Chỉnh sửa

| File | Thay đổi |
|---|---|
| `react-builder/src/components/builder/Topbar.tsx` | `handlePreview` mở `/preview` popup, bỏ dependency vào `localUrl` |
| `react-builder/src/store/builderStore.ts` | Subscribe store → broadcast snapshot khi state thay đổi |

---

## State Sync

### PreviewSnapshot type
```ts
type PreviewSnapshot = {
  pages: PageSchema[]
  appConfig: AppConfig
  variables: Variable[]
  apis: ApiDefinition[]
}
```

### previewChannel.ts
```ts
const CHANNEL_NAME = "zmp-preview"

export function broadcastState(snapshot: PreviewSnapshot): void {
  new BroadcastChannel(CHANNEL_NAME).postMessage(snapshot)
}

export function listenPreviewState(cb: (s: PreviewSnapshot) => void): () => void {
  const ch = new BroadcastChannel(CHANNEL_NAME)
  ch.onmessage = (e) => cb(e.data as PreviewSnapshot)
  return () => ch.close()
}
```

### Store subscriber (builderStore.ts)
Sau khi store được khởi tạo, gọi `useBuilderStore.subscribe` để broadcast mỗi khi `pages` hoặc `appConfig` thay đổi:

```ts
useBuilderStore.subscribe((state) => {
  broadcastState({
    pages: state.pages,
    appConfig: state.appConfig,
    variables: state.variables,
    apis: state.apis,
  })
})
```

### Initial load trong preview
Preview đọc state từ localStorage key `zmp-builder-store` (Zustand persist middleware đã lưu tại đây) khi mount lần đầu — không cần request network.

```ts
function readFromLocalStorage(): PreviewSnapshot | null {
  try {
    const raw = localStorage.getItem("zmp-builder-store")
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const s = parsed?.state
    return s ? { pages: s.pages, appConfig: s.appConfig, variables: s.variables ?? [], apis: s.apis ?? [] } : null
  } catch {
    return null
  }
}
```

---

## PreviewRenderer

### PreviewContext
```ts
type PreviewContextValue = {
  currentPath: string
  navigate: (path: string) => void
}

const PreviewContext = createContext<PreviewContextValue>({
  currentPath: "/",
  navigate: () => {},
})
```

### PreviewNode
Component render sạch — không có dnd, không có selection chrome, không có dropzone:

```tsx
function PreviewNode({ id, nodes }: { id: string; nodes: Record<string, ComponentNode> }) {
  const node = nodes[id]
  const def = registry[node.type]
  const { navigate } = useContext(PreviewContext)

  if (!node || !def) return null

  const handleEvent = (eventType: string) => {
    const action = node.events?.[eventType as EventType]
    if (!action) return
    switch (action.type) {
      case "navigate":    navigate(action.to); break
      case "openUrl":     window.open(action.url, "_blank"); break
      case "openPhone":   window.open(`tel:${action.phone}`); break
      case "showSnackbar": /* show toast in preview */ break
    }
  }

  const children = node.children.map((cid) => (
    <PreviewNode key={cid} id={cid} nodes={nodes} />
  ))

  const hasClick = Boolean(node.events?.onClick)

  return (
    <div
      onClick={hasClick ? () => handleEvent("onClick") : undefined}
      style={{ cursor: hasClick ? "pointer" : "inherit" }}
    >
      {def.renderer(node.props, node, nodes, children)}
    </div>
  )
}
```

### BottomNav trong context
Registry renderers là plain functions — không thể dùng `useContext` trực tiếp. Giải pháp: `PreviewNode` inject `__navigate__` và `__currentPath__` vào props khi render `ZaloBottomNav`:

```tsx
const isBottomNav = node.type === "ZaloBottomNav"
const extraProps = isBottomNav
  ? { __navigate__: navigate, __currentPath__: currentPath }
  : {}

def.renderer({ ...node.props, ...extraProps }, node, nodes, children)
```

Registry renderer của `ZaloBottomNav` kiểm tra `props.__navigate__` và `props.__currentPath__` — nếu có thì dùng cho active tab highlight và click handler. Nếu không có (canvas mode) thì render như cũ.

`findGlobalBottomNav` được extract ra `src/lib/previewUtils.ts` (copy logic từ `Canvas.tsx`) để dùng chung giữa Canvas và preview page.

---

## /preview/page.tsx

```tsx
export default function PreviewPage() {
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(() => readFromLocalStorage())
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)

  // Live sync từ builder
  useEffect(() => listenPreviewState((s) => {
    setSnapshot(s)
  }), [])

  // Set page đầu tiên khi snapshot load
  useEffect(() => {
    if (snapshot && !currentPageId)
      setCurrentPageId(snapshot.pages[0]?.id ?? null)
  }, [snapshot, currentPageId])

  const navigate = useCallback((path: string) => {
    const page = snapshot?.pages.find((p) => p.path === path)
    if (page) setCurrentPageId(page.id)
  }, [snapshot])

  const currentPage = snapshot?.pages.find((p) => p.id === currentPageId)

  // BottomNav là layout-level — tìm global trong tất cả pages
  const bottomNavEntry = findGlobalBottomNav(snapshot?.pages ?? [])

  const currentPath = currentPage?.path ?? "/"

  return (
    <PreviewContext.Provider value={{ currentPath, navigate }}>
      <div className="flex items-center justify-center min-h-screen bg-[#1A1A1E]"
           style={{ backgroundImage: "radial-gradient(circle, #2A2A32 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
        {snapshot ? (
          <PhoneMockup bottomNav={bottomNavEntry && (
            <PreviewNode id={bottomNavEntry.node.id} nodes={bottomNavEntry.nodes} />
          )}>
            <div className="flex flex-col">
              {currentPage?.rootIds
                .filter((id) => currentPage.nodes[id]?.type !== "ZaloBottomNav")
                .map((id) => (
                  <PreviewNode key={id} id={id} nodes={currentPage.nodes} />
                ))}
            </div>
          </PhoneMockup>
        ) : (
          <div className="text-zinc-500 text-sm">Mở builder để bắt đầu</div>
        )}
      </div>
    </PreviewContext.Provider>
  )
}
```

---

## Topbar — handlePreview

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

Preview button không còn phụ thuộc vào `localUrl`. QRPreviewModal vẫn giữ nguyên, có thể gọi riêng nếu cần (flow Zalo on-device).

---

## Các edge cases

| Case | Xử lý |
|---|---|
| Preview mở trước khi builder load | Hiển thị empty state "Mở builder để bắt đầu" |
| Page bị xóa trong builder khi preview đang ở đó | Fallback về `pages[0]` |
| Node type không có trong registry | `PreviewNode` return null |
| Popup bị block bởi browser | Không handle — user tự cho phép |
| BroadcastChannel không hỗ trợ (rất hiếm) | Graceful — chỉ hiện initial state |

---

## Out of scope

- Snackbar/toast hiển thị trong preview (có thể làm sau)
- `setState` action thực thi variables (có thể làm sau)
- `callApi` action thực thi trong preview
- Responsive breakpoint switch trong preview window

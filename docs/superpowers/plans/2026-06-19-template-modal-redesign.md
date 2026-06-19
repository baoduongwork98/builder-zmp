# Template Modal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp TemplateModal thành two-panel layout 880px với CSS wireframe previews, search, animations, 3 template mới, và cải thiện nội dung 8 template hiện có.

**Architecture:** Toàn bộ thay đổi nằm trong một file `TemplateModal.tsx`. Cấu trúc: (1) helper builders cho 11 templates, (2) 11 CSS wireframe components, (3) TemplateModal component với 2 panel. State: `selectedId` (template đã click), `hoveredId` (template đang hover), `search` (search string), `category` (filter).

**Tech Stack:** React, Next.js 16 App Router, Tailwind CSS, Zustand (qua useBuilderStore), nanoid

## Global Constraints

- File: `react-builder/src/components/builder/TemplateModal.tsx` — đây là file DUY NHẤT được chỉnh sửa
- Không thêm dependency mới
- Không thay đổi `loadTemplate(nodes, rootIds)` API signature
- Wireframe components dùng inline style, không dùng Tailwind (tránh purge issues)
- Modal width: 880px, left panel: 280px fixed, right panel: flex-1
- Verify bằng `npm run lint` sau mỗi task, visual check sau task cuối

---

## Task 1: Thêm 3 template builder mới + cập nhật TEMPLATES/category

**Files:**
- Modify: `react-builder/src/components/builder/TemplateModal.tsx` (thêm 3 build functions + cập nhật TEMPLATES array + CATEGORY_LABELS + CATEGORY_COLORS + CategoryFilter type)

**Interfaces:**
- Produces: `buildFoodOrderTemplate()`, `buildBookingTemplate()`, `buildOnboardingTemplate()` — cùng return type `BuildResult` như các template hiện có
- Produces: cập nhật `TEMPLATES: Template[]` với 3 entry mới, `CategoryFilter` type thêm `"services"`, `CATEGORY_LABELS` và `CATEGORY_COLORS` thêm `"services"` key

- [ ] **Step 1: Thêm `buildFoodOrderTemplate` sau `buildDashboardTemplate`**

Chèn đoạn code sau vào cuối phần template builders (trước `// ─── Template definitions`):

```tsx
// ─── Template: Food Order ─────────────────────────────────────────────────────

function buildFoodOrderTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Đặt món", showBack: false, bgColor: "#FF6B35" })

  const banner = mk("Banner", {
    message: "🔥 Ưu đãi hôm nay — Giảm 20% cho đơn từ 100K",
    type: "warning",
    showIcon: false,
  })

  const chipRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "4", background: "transparent", align: "start" })
  const c1 = mk("Chip", { label: "🍚 Cơm", active: true, color: "#FF6B35" }, chipRow.id)
  const c2 = mk("Chip", { label: "🍜 Phở", active: false, color: "#FF6B35" }, chipRow.id)
  const c3 = mk("Chip", { label: "🥗 Bún", active: false, color: "#FF6B35" }, chipRow.id)
  const c4 = mk("Chip", { label: "🧋 Đồ uống", active: false, color: "#FF6B35" }, chipRow.id)
  nest(chipRow, c1, c2, c3, c4)

  const section = mk("ZaloSection", { title: "Món phổ biến", subtitle: "Xem thêm" })
  const grid = mk("Grid", { columns: "2", gap: "4", padding: "4" }, section.id)
  const foods = [
    { name: "Cơm tấm sườn bì chả", price: "45.000đ", seed: "food-a", badge: "Bán chạy" },
    { name: "Phở bò tái nạm gân", price: "65.000đ", seed: "food-b", badge: "" },
    { name: "Bún bò Huế đặc biệt", price: "55.000đ", seed: "food-c", badge: "Hot" },
    { name: "Trà sữa trân châu", price: "35.000đ", seed: "food-d", badge: "-10%" },
  ].map((f) =>
    mk("ProductCard", {
      imageSrc: `https://picsum.photos/seed/${f.seed}/400/300`,
      name: f.name,
      price: f.price,
      originalPrice: "",
      rating: 4,
      badge: f.badge,
    }, grid.id)
  )
  nest(grid, ...foods)
  nest(section, grid)

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Đặt món", tab2Icon: "🍜", tab2Route: "/order",
    tab3Label: "Giỏ hàng", tab3Icon: "🛒", tab3Route: "/cart",
    activeTab: "2",
  })

  return build([header, banner, chipRow, section, bnav], all)
}
```

- [ ] **Step 2: Thêm `buildBookingTemplate` ngay sau `buildFoodOrderTemplate`**

```tsx
// ─── Template: Booking ────────────────────────────────────────────────────────

function buildBookingTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Đặt lịch dịch vụ", showBack: true, bgColor: "#7C3AED" })

  const serviceSection = mk("ZaloSection", { title: "Chọn dịch vụ", subtitle: "" })
  const serviceGrid = mk("Grid", { columns: "2", gap: "3", padding: "4" }, serviceSection.id)
  const services = [
    { value: "Cắt tóc", label: "Cắt tóc", color: "#7C3AED" },
    { value: "Nhuộm tóc", label: "Nhuộm tóc", color: "#7C3AED" },
    { value: "Massage", label: "Massage", color: "#7C3AED" },
    { value: "Làm nail", label: "Làm nail", color: "#7C3AED" },
  ].map((s) =>
    mk("StatCard", { value: s.value, label: s.label, icon: "star", color: s.color, trend: "" }, serviceGrid.id)
  )
  nest(serviceGrid, ...services)
  nest(serviceSection, serviceGrid)

  const timeSection = mk("ZaloSection", { title: "Chọn khung giờ", subtitle: "Hôm nay" })
  const timeRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "4", background: "transparent", align: "start" }, timeSection.id)
  const t1 = mk("Chip", { label: "09:00", active: false, color: "#7C3AED" }, timeRow.id)
  const t2 = mk("Chip", { label: "10:30", active: true, color: "#7C3AED" }, timeRow.id)
  const t3 = mk("Chip", { label: "14:00", active: false, color: "#7C3AED" }, timeRow.id)
  const t4 = mk("Chip", { label: "15:30", active: false, color: "#7C3AED" }, timeRow.id)
  nest(timeRow, t1, t2, t3, t4)
  nest(timeSection, timeRow)

  const progress = mk("ProgressBar", {
    value: 60,
    label: "Đã đặt 6/10 chỗ hôm nay",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    showLabel: true,
  })

  const confirmBtn = mk("ZaloButton", { label: "Xác nhận đặt lịch", variant: "primary", fullWidth: true })

  return build([header, serviceSection, timeSection, progress, confirmBtn], all)
}
```

- [ ] **Step 3: Thêm `buildOnboardingTemplate` ngay sau `buildBookingTemplate`**

```tsx
// ─── Template: Onboarding ─────────────────────────────────────────────────────

function buildOnboardingTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const page = mk("ZaloPage", { backgroundColor: "#0068FF" })

  const centerStack = mk("Stack", {
    direction: "vertical", gap: "4", padding: "8", align: "center", background: "transparent",
  }, page.id)

  const illustration = mk("Image", {
    src: "https://picsum.photos/seed/onboard-hero/600/400",
    alt: "Welcome",
    width: "100%",
    height: "220px",
    rounded: "xl",
    objectFit: "cover",
  }, centerStack.id)

  const heading = mk("Text", {
    content: "Khám phá thế giới mua sắm",
    tag: "h1", size: "2xl", weight: "bold", color: "#FFFFFF", align: "center",
  }, centerStack.id)

  const subtext = mk("Text", {
    content: "Hàng ngàn sản phẩm chính hãng, giao hàng nhanh và ưu đãi độc quyền dành cho bạn.",
    tag: "p", size: "sm", weight: "normal", color: "#BFDBFE", align: "center",
  }, centerStack.id)

  const dotRow = mk("Stack", { direction: "horizontal", gap: "1", padding: "0", align: "center", background: "transparent" }, centerStack.id)
  const d1 = mk("Chip", { label: "●", active: true, color: "#FFFFFF" }, dotRow.id)
  const d2 = mk("Chip", { label: "○", active: false, color: "#BFDBFE" }, dotRow.id)
  const d3 = mk("Chip", { label: "○", active: false, color: "#BFDBFE" }, dotRow.id)
  nest(dotRow, d1, d2, d3)

  const startBtn = mk("ZaloButton", { label: "Bắt đầu ngay", variant: "primary", fullWidth: true }, centerStack.id)

  const loginText = mk("Text", {
    content: "Đã có tài khoản? Đăng nhập",
    tag: "span", size: "sm", weight: "semibold", color: "#BFDBFE", align: "center",
  }, centerStack.id)

  nest(centerStack, illustration, heading, subtext, dotRow, startBtn, loginText)
  nest(page, centerStack)

  return build([page], all)
}
```

- [ ] **Step 4: Cập nhật `CategoryFilter` type, `CATEGORY_LABELS`, `CATEGORY_COLORS`, `TEMPLATES` array**

Tìm đoạn:
```tsx
interface Template {
  id: string
  name: string
  description: string
  emoji: string
  category: "ecommerce" | "auth" | "analytics" | "social"
  build: () => BuildResult
}
```

Thay thành:
```tsx
interface Template {
  id: string
  name: string
  description: string
  emoji: string
  category: "ecommerce" | "auth" | "analytics" | "social" | "services"
  build: () => BuildResult
}
```

Tìm `const CATEGORY_LABELS`:
```tsx
const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: "E-commerce",
  auth:      "Auth",
  analytics: "Analytics",
  social:    "Social",
}
```
Thay thành:
```tsx
const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: "E-commerce",
  auth:      "Auth",
  analytics: "Analytics",
  social:    "Social",
  services:  "Services",
}
```

Tìm `const CATEGORY_COLORS`:
```tsx
const CATEGORY_COLORS: Record<string, string> = {
  ecommerce: "text-blue-600 bg-blue-50 border-blue-100",
  auth:      "text-purple-600 bg-purple-50 border-purple-100",
  analytics: "text-emerald-600 bg-emerald-50 border-emerald-100",
  social:    "text-orange-600 bg-orange-50 border-orange-100",
}
```
Thay thành:
```tsx
const CATEGORY_COLORS: Record<string, string> = {
  ecommerce: "text-blue-600 bg-blue-50 border-blue-100",
  auth:      "text-purple-600 bg-purple-50 border-purple-100",
  analytics: "text-emerald-600 bg-emerald-50 border-emerald-100",
  social:    "text-orange-600 bg-orange-50 border-orange-100",
  services:  "text-teal-600 bg-teal-50 border-teal-100",
}
```

Cuối `TEMPLATES` array (trước dấu `]`), thêm 3 entry mới:
```tsx
  {
    id: "food-order",
    name: "Food Order",
    description: "Header cam + banner promo + chip món + lưới thực phẩm 2 cột",
    emoji: "🍜",
    category: "ecommerce",
    build: buildFoodOrderTemplate,
  },
  {
    id: "booking",
    name: "Đặt lịch",
    description: "Chọn dịch vụ + khung giờ + progress đã đặt + CTA xác nhận",
    emoji: "📅",
    category: "services",
    build: buildBookingTemplate,
  },
  {
    id: "onboarding",
    name: "Onboarding",
    description: "Illustration + heading lớn + step dots + CTA bắt đầu",
    emoji: "✨",
    category: "auth",
    build: buildOnboardingTemplate,
  },
```

- [ ] **Step 5: Cập nhật `CategoryFilter` type trong component**

Tìm dòng:
```tsx
type CategoryFilter = "all" | "ecommerce" | "auth" | "analytics" | "social"
```
Thay thành:
```tsx
type CategoryFilter = "all" | "ecommerce" | "auth" | "analytics" | "social" | "services"
```

- [ ] **Step 6: Lint check**

```bash
cd react-builder && npm run lint
```
Expected: 0 errors. Nếu có lỗi type, kiểm tra lại các union type.

- [ ] **Step 7: Commit**

```bash
git add react-builder/src/components/builder/TemplateModal.tsx
git commit -m "feat: add Food Order, Booking, Onboarding templates + services category"
```

---

## Task 2: Cải thiện nội dung 8 template hiện có

**Files:**
- Modify: `react-builder/src/components/builder/TemplateModal.tsx` (cập nhật props trong 8 build functions)

**Interfaces:**
- Không thay đổi API, chỉ cập nhật literal values trong props

- [ ] **Step 1: Cập nhật `buildHomeTemplate`**

Tìm trong `buildHomeTemplate`:
```tsx
  const hero = mk("HeroSection", {
    imageSrc: "https://picsum.photos/seed/zmp-hero/800/400",
    heading: "Sale Hè 2024 🔥",
    subtext: "Giảm đến 50% toàn bộ sản phẩm — Chỉ hôm nay",
    ctaLabel: "Mua ngay",
    overlayOpacity: 50,
  })
```
Thay:
```tsx
  const hero = mk("HeroSection", {
    imageSrc: "https://picsum.photos/seed/zmp-hero/800/400",
    heading: "Siêu Sale Cuối Tuần 🔥",
    subtext: "Giảm đến 60% — Freeship toàn quốc cho đơn từ 99K",
    ctaLabel: "Khám phá ngay",
    overlayOpacity: 55,
  })
```

- [ ] **Step 2: Cập nhật `buildDetailTemplate` — thêm padding cho priceRow và ratingRow**

Tìm trong `buildDetailTemplate`:
```tsx
  const ratingRow = mk("Stack", { direction: "horizontal", gap: "3", padding: "0", align: "center", background: "transparent" })
```
Thay:
```tsx
  const ratingRow = mk("Stack", { direction: "horizontal", gap: "3", padding: "4", align: "center", background: "transparent" })
```

Tìm:
```tsx
  const priceRow = mk("Stack", { direction: "horizontal", gap: "3", padding: "0", align: "center", background: "transparent" })
```
Thay:
```tsx
  const priceRow = mk("Stack", { direction: "horizontal", gap: "3", padding: "4", align: "center", background: "transparent" })
```

Tìm:
```tsx
  const titleText = mk("Text", {
    content: "Áo thun Oversized Premium Cotton",
```
Thay:
```tsx
  const titleText = mk("Text", {
    content: "Áo thun Unisex Premium Cotton 230gsm",
```

- [ ] **Step 3: Cập nhật `buildDashboardTemplate` — greeting text thực tế hơn**

Tìm trong `buildDashboardTemplate`:
```tsx
  const greeting = mk("Text", {
    content: "Xin chào, Nguyễn Văn A 👋",
    tag: "h2", size: "lg", weight: "bold", color: "#111827", align: "left",
  })
  const subGreeting = mk("Text", {
    content: "Đây là tổng quan hoạt động hôm nay",
    tag: "p", size: "sm", weight: "normal", color: "#6B7280", align: "left",
  })
```
Thay:
```tsx
  const greeting = mk("Text", {
    content: "Chào buổi sáng, Admin 👋",
    tag: "h2", size: "lg", weight: "bold", color: "#111827", align: "left",
  })
  const subGreeting = mk("Text", {
    content: "Thứ Năm, 19/06/2026 · Cửa hàng đang hoạt động tốt",
    tag: "p", size: "sm", weight: "normal", color: "#6B7280", align: "left",
  })
```

- [ ] **Step 4: Lint check**

```bash
cd react-builder && npm run lint
```
Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add react-builder/src/components/builder/TemplateModal.tsx
git commit -m "chore: improve existing template content (hero text, padding, descriptions)"
```

---

## Task 3: Thêm CSS wireframe components

**Files:**
- Modify: `react-builder/src/components/builder/TemplateModal.tsx` (thêm wireframe components + TEMPLATE_WIREFRAMES map, đặt ngay trước `// ─── TemplateModal`)

**Interfaces:**
- Produces: `TEMPLATE_WIREFRAMES: Record<string, React.FC>` — map từ template id → wireframe component
- Produces: `WireframeHome`, `WireframeProductList`, `WireframeDetail`, `WireframeCart`, `WireframeProfile`, `WireframeNotifications`, `WireframeLogin`, `WireframeDashboard`, `WireframeFoodOrder`, `WireframeBooking`, `WireframeOnboarding` — React functional components, không nhận props

- [ ] **Step 1: Thêm wireframe block helpers và 11 wireframe components**

Chèn đoạn code sau ngay trước dòng `// ─── TemplateModal ───`:

```tsx
// ─── CSS Wireframe components ─────────────────────────────────────────────────

function WfHeader({ color = "#93C5FD" }: { color?: string }) {
  return <div style={{ height: 28, background: color, borderRadius: "4px 4px 0 0", marginBottom: 4, flexShrink: 0 }} />
}

function WfHero() {
  return <div style={{ height: 56, background: "#D1D5DB", borderRadius: 4, marginBottom: 4, flexShrink: 0 }} />
}

function WfSearchBar() {
  return (
    <div style={{ height: 18, background: "#E5E7EB", borderRadius: 9, marginBottom: 4, marginLeft: 4, marginRight: 4, flexShrink: 0 }} />
  )
}

function WfChipRow() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "0 4px", marginBottom: 4, flexShrink: 0 }}>
      {[38, 32, 28, 34].map((w, i) => (
        <div key={i} style={{ height: 14, width: w, background: i === 0 ? "#93C5FD" : "#E5E7EB", borderRadius: 7, flexShrink: 0 }} />
      ))}
    </div>
  )
}

function WfGrid2({ rows = 2 }: { rows?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "0 4px", marginBottom: 4 }}>
      {Array(rows * 2).fill(0).map((_, i) => (
        <div key={i} style={{ background: "#F3F4F6", borderRadius: 4, padding: 4 }}>
          <div style={{ height: 28, background: "#D1D5DB", borderRadius: 3, marginBottom: 3 }} />
          <div style={{ height: 7, background: "#E5E7EB", borderRadius: 3, marginBottom: 2 }} />
          <div style={{ height: 7, background: "#E5E7EB", borderRadius: 3, width: "55%" }} />
        </div>
      ))}
    </div>
  )
}

function WfBottomNav() {
  return (
    <div style={{ height: 28, background: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0, marginTop: "auto" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ width: 14, height: 14, background: "#D1D5DB", borderRadius: "50%" }} />
      ))}
    </div>
  )
}

function WfTextLine({ width = "100%", bold = false }: { width?: string; bold?: boolean }) {
  return <div style={{ height: bold ? 9 : 6, background: bold ? "#9CA3AF" : "#E5E7EB", borderRadius: 3, width, marginBottom: 3, flexShrink: 0 }} />
}

function WfButton({ color = "#93C5FD" }: { color?: string }) {
  return <div style={{ height: 22, background: color, borderRadius: 6, marginBottom: 4, flexShrink: 0 }} />
}

function WfListItem() {
  return (
    <div style={{ display: "flex", gap: 6, padding: "5px 4px", borderBottom: "1px solid #F3F4F6", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: 24, height: 24, background: "#E5E7EB", borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 6, background: "#D1D5DB", borderRadius: 3, marginBottom: 3, width: "65%" }} />
        <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: "45%" }} />
      </div>
    </div>
  )
}

function WfCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #F3F4F6", borderRadius: 6, padding: 6, marginBottom: 4, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", flexShrink: 0 }}>
      {children}
    </div>
  )
}

function WfProgressBar({ pct = 70, color = "#93C5FD" }: { pct?: number; color?: string }) {
  return (
    <div style={{ marginBottom: 5, flexShrink: 0 }}>
      <div style={{ height: 7, background: "#F3F4F6", borderRadius: 4 }}>
        <div style={{ height: 7, background: color, borderRadius: 4, width: `${pct}%` }} />
      </div>
    </div>
  )
}

function WireframeHome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader />
      <WfHero />
      <WfChipRow />
      <WfGrid2 rows={2} />
      <WfBottomNav />
    </div>
  )
}

function WireframeProductList() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader />
      <WfSearchBar />
      <WfChipRow />
      <WfGrid2 rows={3} />
      <WfBottomNav />
    </div>
  )
}

function WireframeDetail() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader />
      <div style={{ height: 64, background: "#D1D5DB", borderRadius: 4, marginBottom: 4, flexShrink: 0 }} />
      <div style={{ padding: "0 4px" }}>
        <WfTextLine width="80%" bold />
        <WfTextLine width="50%" />
        <WfTextLine width="100%" bold />
        <WfTextLine width="90%" />
        <WfTextLine width="75%" />
      </div>
      <div style={{ padding: "0 4px", marginTop: "auto" }}>
        <WfButton />
      </div>
    </div>
  )
}

function WireframeCart() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader />
      <WfListItem />
      <WfListItem />
      <WfListItem />
      <WfCard>
        <WfTextLine width="100%" />
        <WfTextLine width="65%" />
        <WfTextLine width="100%" bold />
      </WfCard>
      <div style={{ padding: "0 0", marginTop: "auto" }}>
        <WfButton />
      </div>
      <WfBottomNav />
    </div>
  )
}

function WireframeProfile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader />
      <WfCard>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#D1D5DB", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <WfTextLine width="55%" bold />
            <WfTextLine width="80%" />
          </div>
        </div>
      </WfCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, padding: "0 0", marginBottom: 4, flexShrink: 0 }}>
        {["#DBEAFE", "#FEF3C7", "#FCE7F3"].map((bg, i) => (
          <div key={i} style={{ background: bg, borderRadius: 6, padding: 5 }}>
            <div style={{ height: 9, background: "rgba(0,0,0,0.1)", borderRadius: 3, marginBottom: 3 }} />
            <div style={{ height: 6, background: "rgba(0,0,0,0.07)", borderRadius: 3 }} />
          </div>
        ))}
      </div>
      <WfListItem />
      <WfListItem />
      <WfListItem />
      <WfBottomNav />
    </div>
  )
}

function WireframeNotifications() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader />
      <div style={{ height: 20, background: "#DBEAFE", borderRadius: 4, marginBottom: 4, flexShrink: 0 }} />
      <WfChipRow />
      <WfListItem />
      <WfListItem />
      <WfListItem />
      <WfListItem />
      <WfBottomNav />
    </div>
  )
}

function WireframeLogin() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#F9FAFB", alignItems: "center", padding: "8px 8px 0" }}>
      <div style={{ width: 36, height: 36, background: "#DBEAFE", borderRadius: 10, marginBottom: 6, marginTop: 14, flexShrink: 0 }} />
      <WfTextLine width="55%" bold />
      <WfTextLine width="72%" />
      <WfCard>
        <div style={{ height: 16, background: "#F3F4F6", borderRadius: 4, marginBottom: 4 }} />
        <div style={{ height: 16, background: "#F3F4F6", borderRadius: 4, marginBottom: 4 }} />
        <WfButton />
        <div style={{ height: 1, background: "#E5E7EB", margin: "4px 0" }} />
        <WfButton color="#E5E7EB" />
      </WfCard>
    </div>
  )
}

function WireframeDashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader />
      <div style={{ padding: "0 4px" }}>
        <WfTextLine width="55%" bold />
        <WfTextLine width="80%" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "0 4px", marginBottom: 4, flexShrink: 0 }}>
        {["#DBEAFE", "#D1FAE5", "#EDE9FE", "#FEF3C7"].map((bg, i) => (
          <div key={i} style={{ background: bg, borderRadius: 6, padding: 5 }}>
            <div style={{ height: 9, background: "rgba(0,0,0,0.1)", borderRadius: 3, marginBottom: 3, width: "45%" }} />
            <div style={{ height: 6, background: "rgba(0,0,0,0.07)", borderRadius: 3 }} />
          </div>
        ))}
      </div>
      <WfCard>
        <WfProgressBar pct={72} color="#93C5FD" />
        <WfProgressBar pct={85} color="#6EE7B7" />
        <WfProgressBar pct={48} color="#FCD34D" />
      </WfCard>
      <WfListItem />
      <WfListItem />
      <WfBottomNav />
    </div>
  )
}

function WireframeFoodOrder() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader color="#FDBA74" />
      <div style={{ height: 20, background: "#FEF3C7", borderRadius: 4, marginBottom: 4, flexShrink: 0 }} />
      <WfChipRow />
      <WfGrid2 rows={2} />
      <WfBottomNav />
    </div>
  )
}

function WireframeBooking() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <WfHeader color="#C4B5FD" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "0 4px", marginBottom: 4, flexShrink: 0 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ background: "#EDE9FE", borderRadius: 6, padding: 5, height: 32 }}>
            <div style={{ height: 6, background: "rgba(124,58,237,0.2)", borderRadius: 3, marginBottom: 3, width: "65%" }} />
            <div style={{ height: 5, background: "rgba(124,58,237,0.1)", borderRadius: 3 }} />
          </div>
        ))}
      </div>
      <WfChipRow />
      <WfProgressBar pct={60} color="#C4B5FD" />
      <div style={{ padding: "0 0", marginTop: "auto" }}>
        <WfButton color="#C4B5FD" />
      </div>
    </div>
  )
}

function WireframeOnboarding() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#3B82F6", alignItems: "center", padding: "10px 8px 8px" }}>
      <div style={{ width: "100%", height: 72, background: "rgba(255,255,255,0.2)", borderRadius: 8, marginBottom: 10, flexShrink: 0 }} />
      <div style={{ height: 9, background: "rgba(255,255,255,0.7)", borderRadius: 4, width: "65%", marginBottom: 5, flexShrink: 0 }} />
      <div style={{ height: 6, background: "rgba(255,255,255,0.4)", borderRadius: 3, width: "88%", marginBottom: 3, flexShrink: 0 }} />
      <div style={{ height: 6, background: "rgba(255,255,255,0.4)", borderRadius: 3, width: "72%", marginBottom: 10, flexShrink: 0 }} />
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexShrink: 0 }}>
        {[true, false, false].map((active, i) => (
          <div key={i} style={{ width: active ? 16 : 8, height: 7, background: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", borderRadius: 4 }} />
        ))}
      </div>
      <div style={{ height: 22, background: "rgba(255,255,255,0.9)", borderRadius: 6, width: "100%", marginBottom: 7, flexShrink: 0 }} />
      <div style={{ height: 6, background: "rgba(255,255,255,0.5)", borderRadius: 3, width: "55%", flexShrink: 0 }} />
    </div>
  )
}

const TEMPLATE_WIREFRAMES: Record<string, React.FC> = {
  home: WireframeHome,
  "product-list": WireframeProductList,
  detail: WireframeDetail,
  cart: WireframeCart,
  profile: WireframeProfile,
  notifications: WireframeNotifications,
  login: WireframeLogin,
  dashboard: WireframeDashboard,
  "food-order": WireframeFoodOrder,
  booking: WireframeBooking,
  onboarding: WireframeOnboarding,
}
```

- [ ] **Step 2: Lint check**

```bash
cd react-builder && npm run lint
```
Expected: 0 errors. Nếu lỗi `React` không import, kiểm tra file đã có `import React from "react"` chưa — Next.js 16 không cần import React nhưng cần thiết nếu dùng `React.FC`.

Nếu cần, thêm ở đầu file sau `"use client"`:
```tsx
import React from "react"
```

- [ ] **Step 3: Commit**

```bash
git add react-builder/src/components/builder/TemplateModal.tsx
git commit -m "feat: add CSS wireframe preview components for all 11 templates"
```

---

## Task 4: Rewrite TemplateModal component — two-panel layout

**Files:**
- Modify: `react-builder/src/components/builder/TemplateModal.tsx` — thay toàn bộ `export function TemplateModal` bằng implementation mới

**Interfaces:**
- Consumes: `TEMPLATES: Template[]`, `CATEGORY_LABELS`, `CATEGORY_COLORS`, `TEMPLATE_WIREFRAMES: Record<string, React.FC>` — đã định nghĩa ở các task trước
- Consumes: `useBuilderStore((s) => s.loadTemplate)` — API không đổi
- Props: `TemplateModalProps = { onClose: () => void }` — không đổi

- [ ] **Step 1: Thay toàn bộ `export function TemplateModal` bằng implementation mới**

Xóa từ dòng `interface TemplateModalProps {` đến cuối file và thay bằng:

```tsx
// ─── TemplateModal ────────────────────────────────────────────────────────────

interface TemplateModalProps {
  onClose: () => void
}

type CategoryFilter = "all" | "ecommerce" | "auth" | "analytics" | "social" | "services"

export function TemplateModal({ onClose }: TemplateModalProps) {
  const loadTemplate = useBuilderStore((s) => s.loadTemplate)
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [selectedId, setSelectedId] = React.useState<string>(TEMPLATES[0].id)
  const [category, setCategory] = React.useState<CategoryFilter>("all")
  const [search, setSearch] = React.useState("")

  const filtered = TEMPLATES.filter((t) => {
    const matchCategory = category === "all" || t.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })

  const previewId = hoveredId ?? selectedId
  const previewTemplate = TEMPLATES.find((t) => t.id === previewId) ?? TEMPLATES[0]
  const WireframeComponent = TEMPLATE_WIREFRAMES[previewTemplate.id]

  function handleApply() {
    const template = TEMPLATES.find((t) => t.id === selectedId)
    if (!template) return
    const { nodes, rootIds } = template.build()
    loadTemplate(nodes, rootIds)
    onClose()
  }

  const FILTER_TABS: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "ecommerce", label: "E-com" },
    { key: "social", label: "Social" },
    { key: "services", label: "Services" },
    { key: "auth", label: "Auth" },
    { key: "analytics", label: "Analytics" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)", animation: "tmModalIn 180ms ease-out" }}
      onClick={onClose}
    >
      <style>{`
        @keyframes tmModalIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes tmPreviewFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .tm-scrollbar-hide::-webkit-scrollbar { display: none; }
        .tm-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="bg-white rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ width: 880, maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <div className="flex flex-col border-r border-zinc-100 shrink-0" style={{ width: 280 }}>
          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-zinc-100 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-zinc-800">Chọn template</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">{TEMPLATES.length} layouts sẵn có</p>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-2.5">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm template..."
                className="w-full pl-7 pr-3 py-1.5 text-[12px] border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-colors placeholder:text-zinc-400"
              />
            </div>

            {/* Category filter */}
            <div className="flex gap-1 overflow-x-auto tm-scrollbar-hide">
              {FILTER_TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className={`shrink-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                    category === key
                      ? "bg-[#0068FF] text-white border-[#0068FF]"
                      : "text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Template list */}
          <div className="overflow-y-auto flex-1 tm-scrollbar-hide py-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-[12px]">Không tìm thấy template</p>
              </div>
            ) : (
              <>
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    onMouseEnter={() => setHoveredId(t.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                      selectedId === t.id
                        ? "bg-blue-50 border-r-2 border-[#0068FF]"
                        : "hover:bg-zinc-50 border-r-2 border-transparent"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 transition-colors ${
                      selectedId === t.id ? "bg-blue-100" : "bg-zinc-100"
                    }`}>
                      {t.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[12px] font-semibold truncate mb-0.5 ${
                        selectedId === t.id ? "text-[#0068FF]" : "text-zinc-700"
                      }`}>
                        {t.name}
                      </div>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>
                        {CATEGORY_LABELS[t.category]}
                      </span>
                    </div>
                  </button>
                ))}

                {/* Blank canvas option */}
                <button
                  onClick={onClose}
                  onMouseEnter={() => setHoveredId("blank")}
                  onMouseLeave={() => setHoveredId(null)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 hover:bg-zinc-50 border-r-2 border-transparent"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-100 shrink-0">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-zinc-500 mb-0.5">Canvas trắng</div>
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border text-zinc-400 bg-zinc-50 border-zinc-200">
                      Custom
                    </span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 bg-zinc-50 min-w-0">
          {/* Preview area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
            {hoveredId === "blank" || (!hoveredId && !selectedId) ? (
              <div className="flex flex-col items-center gap-3 text-zinc-400">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-zinc-300 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <p className="text-[13px] font-medium text-zinc-500">Canvas trắng</p>
                <p className="text-[11px] text-zinc-400">Tự do thiết kế từ đầu</p>
              </div>
            ) : WireframeComponent ? (
              <>
                {/* Phone mockup */}
                <div
                  key={previewId}
                  style={{
                    width: 200,
                    height: 380,
                    borderRadius: 26,
                    boxShadow: "0 0 0 7px #1F2937, 0 16px 40px rgba(0,0,0,0.28)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    animation: "tmPreviewFade 120ms ease-in-out",
                    flexShrink: 0,
                    background: "#fff",
                  }}
                >
                  {/* Notch */}
                  <div style={{ height: 18, background: "#1F2937", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 3, flexShrink: 0 }}>
                    <div style={{ width: 52, height: 7, background: "#374151", borderRadius: 4 }} />
                  </div>
                  {/* Screen content */}
                  <div style={{ flex: 1, overflow: "hidden", padding: 5 }}>
                    <WireframeComponent />
                  </div>
                </div>

                {/* Template info below mockup */}
                <div className="mt-5 text-center">
                  <h3 className="text-sm font-bold text-zinc-800 mb-1">{previewTemplate.name}</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[260px]">
                    {previewTemplate.description}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* Apply button */}
          <div className="px-5 pb-5 pt-3 border-t border-zinc-200 bg-white shrink-0">
            {hoveredId !== "blank" && selectedId ? (
              <button
                onClick={handleApply}
                className="w-full py-2.5 bg-[#0068FF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#0055D4] transition-all active:scale-[0.97] shadow-sm"
              >
                Áp dụng template này
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-zinc-100 text-zinc-600 text-[13px] font-semibold rounded-xl hover:bg-zinc-200 transition-all"
              >
                Bắt đầu canvas trắng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Xóa đoạn `type CategoryFilter` cũ nếu còn tồn tại phía trên**

Đảm bảo chỉ có MỘT khai báo `type CategoryFilter` trong file. Tìm và xóa khai báo cũ nếu trùng.

Đồng thời xóa `FILTER_TABS` cũ nếu còn tồn tại ngoài component function.

- [ ] **Step 3: Lint check**

```bash
cd react-builder && npm run lint
```
Expected: 0 errors. Nếu lỗi về `React.useState` — đảm bảo `import React from "react"` ở đầu file hoặc dùng `useState` trực tiếp từ `import { useState } from "react"`.

Nếu dùng `useState` trực tiếp, thay `React.useState` → `useState` và `React.FC` → thêm type annotation trực tiếp `() => JSX.Element`.

- [ ] **Step 4: Chạy dev server và verify visually**

```bash
cd react-builder && npm run dev
```

Mở http://localhost:3000, click nút "Template" trên Topbar. Kiểm tra:

✅ Modal mở rộng ~880px với 2 panel  
✅ Panel trái có search bar + category filter tabs + list template  
✅ Panel phải hiển thị phone mockup với wireframe khi hover/select  
✅ Hover item → preview đổi với fade animation  
✅ Click item → selected state (border xanh bên phải + bg blue-50)  
✅ Search "login" → chỉ hiện template Đăng nhập  
✅ Filter "Services" → chỉ hiện Đặt lịch  
✅ Nút "Áp dụng template này" load template lên canvas  
✅ Click "Canvas trắng" đóng modal  
✅ Animation modal mở mượt  

- [ ] **Step 5: Commit**

```bash
git add react-builder/src/components/builder/TemplateModal.tsx
git commit -m "feat: redesign TemplateModal — two-panel layout with phone mockup preview, search, and animations"
```

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Modal 880px, two panel | Task 4 |
| Left panel: search | Task 4 |
| Left panel: category filter với "services" | Task 1 + Task 4 |
| Left panel: scrollable list | Task 4 |
| Right panel: phone mockup | Task 4 |
| CSS wireframe cho 11 templates | Task 3 |
| Preview update on hover | Task 4 (hoveredId state) |
| Selected state on click | Task 4 (selectedId state) |
| Apply button | Task 4 |
| Modal animations | Task 4 (CSS keyframes) |
| 3 template mới | Task 1 |
| Improve 8 template content | Task 2 |
| Empty state khi search không ra | Task 4 |
| "Canvas trắng" blank option | Task 4 |

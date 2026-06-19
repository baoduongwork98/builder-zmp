# Template Modal Redesign & Template Content Improvements

**Date:** 2026-06-19  
**Status:** Approved  

---

## Overview

Cải thiện toàn diện `TemplateModal` theo hướng Approach A (two-panel modal) và nâng cấp nội dung 8 template hiện có, đồng thời thêm 3 template mới.

---

## 1. TemplateModal UI Redesign

### Layout

Modal mở rộng từ 600px → **880px**, max-height 88vh, chia 2 panel song song:

- **Left panel (280px, cố định):** list template + search + filter
- **Right panel (flex-1):** phone mockup preview + tên/mô tả + CTA

### Left Panel

```
[🔍 Tìm kiếm template...]
────────────────────────
[Tất cả][E-com][Social][Auth][Analytics][Services]
────────────────────────
● 🏠 Trang chủ        [E-com]
○ 🛍️ Khám phá sản phẩm [E-com]
○ 📦 Chi tiết sản phẩm  [E-com]
○ 🛒 Giỏ hàng          [E-com]
○ 👤 Hồ sơ cá nhân     [Social]
○ 🔔 Thông báo         [Social]
○ 🔐 Đăng nhập         [Auth]
○ 📊 Dashboard         [Analytics]
○ 🍜 Food Order        [E-com]
○ 📅 Booking           [Services]
○ ✨ Onboarding        [Auth]
○ [+] Canvas trắng     [Custom]
```

Behavior:
- Search filter theo `name` + `description` (case-insensitive)
- Category filter tabs: `all | ecommerce | social | auth | analytics | services`
- Hover item → highlight + update right panel preview
- Selected item (click) → được đánh dấu, nhấn "Áp dụng" mới load
- Keyboard: arrow keys để navigate list, Enter để apply

### Right Panel

- **Phone mockup frame:** border radius, notch giả, shadow — kích thước ~280×480px (scale down)
- **Bên trong mockup:** CSS wireframe của template đang hover/selected
  - Mỗi template có `WireframeComponent` riêng, dùng colored div blocks
  - Màu dùng: zinc-200 cho text blocks, blue-200 cho header/CTA, gray-100 cho backgrounds
- **Bên dưới mockup:** Template name (bold) + description (gray) + category badge
- **Nút "Áp dụng template":** primary blue, full width, disabled khi không có template được chọn

### Animations

| Event | Effect |
|-------|--------|
| Modal mount | `scale(0.95) opacity(0)` → `scale(1) opacity(1)`, 180ms ease-out |
| Modal unmount | `scale(0.97) opacity(0)`, 140ms ease-in |
| List item hover | background transition 150ms |
| Preview switch | cross-fade `opacity`, 120ms |
| Apply button click | `scale(0.97)` press, 80ms |

### Search

- Input trong left panel header, placeholder "Tìm kiếm template..."
- Filter real-time theo `template.name` và `template.description`
- Khi không có kết quả: hiển thị empty state "Không tìm thấy template"
- Search kết hợp với category filter (AND logic)

---

## 2. CSS Wireframe Components

Mỗi template có một `renderWireframe()` function trả về JSX. Dùng inline style, không phụ thuộc Tailwind để đảm bảo tính đơn giản.

Wireframe conventions:
- Header bar: `h-8 bg-blue-400 rounded-t`
- Hero/image blocks: `bg-gray-200 rounded`
- Text lines: `h-2 bg-gray-300 rounded-full` (width biến đổi)
- Card blocks: `bg-white border rounded shadow-sm`
- Button: `bg-blue-400 rounded h-6`
- Bottom nav: `h-8 bg-white border-t flex`
- Grid items: `bg-gray-100 rounded`

Danh sách wireframe templates: Home, ProductList, Detail, Cart, Profile, Notifications, Login, Dashboard, FoodOrder, Booking, Onboarding.

---

## 3. Nội dung Template Cải thiện (8 template hiện có)

Không thay đổi cấu trúc component. Chỉ cải thiện `props` để nội dung tự nhiên hơn:

| Template | Thay đổi |
|----------|----------|
| Home | Cập nhật text hero realistic hơn, thêm padding cho Stack |
| Product List | Cải thiện tên/giá sản phẩm, seed ảnh |
| Detail | Thêm padding cho các Stack, nội dung mô tả tốt hơn |
| Cart | Tên sản phẩm cụ thể hơn, hiển thị số lượng rõ ràng |
| Profile | Bio và stats realistic |
| Notifications | Content thông báo có chiều sâu hơn |
| Login | Tagline tốt hơn |
| Dashboard | KPI data realistic |

---

## 4. Template Mới

### 4a. Food Order 🍜

- **Category:** `ecommerce`
- **Layout:** Header (bgColor `#FF6B35`) → Banner promo → Chip categories (Cơm, Phở, Bún, Đồ uống) → Grid 2 col food cards (tên món, giá, seed ảnh food) → ZaloBottomNav

### 4b. Booking 📅

- **Category:** `services` (category mới)
- **Layout:** Header → ZaloSection "Dịch vụ" → Grid 2 col service cards (tên, giá/giờ, icon) → ZaloSection "Chọn ngày & giờ" → Grid thời gian (Stack horizontal các Chip giờ) → ProgressBar đã đặt → ZaloButton "Xác nhận đặt lịch"

### 4c. Onboarding ✨

- **Category:** `auth`
- **Layout:** ZaloPage (backgroundColor `#0068FF`) → Stack vertical center: Image (illustration URL picsum), Text heading lớn (color white), Text subtext (color white/70), Stack horizontal indicator dots (3 Chip nhỏ), ZaloButton "Bắt đầu", Text "Đã có tài khoản? Đăng nhập"

---

## 5. Category Update

Thêm `services` vào:
- `CATEGORY_LABELS`: `"services": "Services"`
- `CATEGORY_COLORS`: `"services": "text-teal-600 bg-teal-50 border-teal-100"`
- `FILTER_TABS` trong modal

---

## 6. Files bị ảnh hưởng

| File | Thay đổi |
|------|----------|
| `react-builder/src/components/builder/TemplateModal.tsx` | Toàn bộ: redesign modal UI + thêm 3 template + wireframe components + search |

Chỉ **1 file** thay đổi — tất cả logic và data nằm trong `TemplateModal.tsx`.

---

## 7. Không thay đổi

- `builderStore.ts` — `loadTemplate` API không đổi
- `registry/index.tsx` — không thêm component mới
- `exportCode.ts` — không thay đổi
- `types/builder.ts` — không thay đổi
- Các file builder khác — không thay đổi

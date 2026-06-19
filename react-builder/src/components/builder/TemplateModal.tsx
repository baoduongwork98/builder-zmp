"use client"

import React from "react"
import { nanoid } from "nanoid"
import { ComponentNode } from "@/types/builder"
import { useBuilderStore } from "@/store/builderStore"
import { Input } from "@/components/ui/input"

// ─── Node builder helpers ─────────────────────────────────────────────────────

function n(
  type: string,
  props: Record<string, unknown>,
  parentId: string | null = null
): ComponentNode {
  return { id: nanoid(8), type, props, children: [], parentId }
}

/** Link children into a parent node and set their parentId */
function nest(parent: ComponentNode, ...children: ComponentNode[]): ComponentNode {
  parent.children = children.map((c) => c.id)
  children.forEach((c) => { c.parentId = parent.id })
  return parent
}

type BuildResult = { nodes: Record<string, ComponentNode>; rootIds: string[] }

function build(roots: ComponentNode[], allCreated: ComponentNode[]): BuildResult {
  const nodes: Record<string, ComponentNode> = {}
  allCreated.forEach((node) => { nodes[node.id] = node })
  return { nodes, rootIds: roots.map((r) => r.id) }
}

// ─── Template: Trang chủ ─────────────────────────────────────────────────────

function buildHomeTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Trang chủ", showBack: false, bgColor: "#0068FF" })

  const hero = mk("HeroSection", {
    imageSrc: "https://picsum.photos/seed/zmp-hero/800/400",
    heading: "Siêu Sale Cuối Tuần 🔥",
    subtext: "Giảm đến 60% — Freeship toàn quốc cho đơn từ 99K",
    ctaLabel: "Khám phá ngay",
    overlayOpacity: 55,
  })

  const chipRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "4", background: "transparent", align: "start" })
  const c1 = mk("Chip", { label: "Tất cả", active: true, color: "#0068FF" }, chipRow.id)
  const c2 = mk("Chip", { label: "Áo", active: false, color: "#0068FF" }, chipRow.id)
  const c3 = mk("Chip", { label: "Quần", active: false, color: "#0068FF" }, chipRow.id)
  const c4 = mk("Chip", { label: "Giày", active: false, color: "#0068FF" }, chipRow.id)
  nest(chipRow, c1, c2, c3, c4)

  const grid = mk("Grid", { columns: "2", gap: "4", padding: "4" })

  const p1 = mk("ProductCard", {
    imageSrc: "https://picsum.photos/seed/prod-a/400/300",
    name: "Áo thun Oversized",
    price: "129.000đ",
    originalPrice: "199.000đ",
    rating: 5,
    badge: "-35%",
  }, grid.id)
  const p2 = mk("ProductCard", {
    imageSrc: "https://picsum.photos/seed/prod-b/400/300",
    name: "Quần jeans slim fit",
    price: "349.000đ",
    originalPrice: "450.000đ",
    rating: 4,
    badge: "Hot",
  }, grid.id)
  const p3 = mk("ProductCard", {
    imageSrc: "https://picsum.photos/seed/prod-c/400/300",
    name: "Giày sneaker trắng",
    price: "529.000đ",
    originalPrice: "",
    rating: 5,
    badge: "Mới",
  }, grid.id)
  const p4 = mk("ProductCard", {
    imageSrc: "https://picsum.photos/seed/prod-d/400/300",
    name: "Túi canvas local brand",
    price: "189.000đ",
    originalPrice: "220.000đ",
    rating: 4,
    badge: "",
  }, grid.id)
  nest(grid, p1, p2, p3, p4)

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Khám phá", tab2Icon: "🔍", tab2Route: "/kham-pha",
    tab3Label: "Cá nhân", tab3Icon: "👤", tab3Route: "/profile",
    activeTab: "1",
  })

  return build([header, hero, chipRow, grid, bnav], all)
}

// ─── Template: Khám phá sản phẩm ─────────────────────────────────────────────

function buildProductListTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Khám phá", showBack: false, bgColor: "#0068FF" })
  const search = mk("ZaloSearchBar", { placeholder: "Tìm kiếm sản phẩm..." })

  const chipRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "4", background: "transparent", align: "start" })
  const c1 = mk("Chip", { label: "Tất cả", active: true }, chipRow.id)
  const c2 = mk("Chip", { label: "Thời trang", active: false }, chipRow.id)
  const c3 = mk("Chip", { label: "Phụ kiện", active: false }, chipRow.id)
  nest(chipRow, c1, c2, c3)

  const grid = mk("Grid", { columns: "2", gap: "4", padding: "4" })
  const products = [
    { name: "Áo polo cotton", price: "219.000đ", originalPrice: "290.000đ", seed: "polo", badge: "-25%", rating: 5 },
    { name: "Quần kaki slim", price: "289.000đ", originalPrice: "", seed: "kaki", badge: "Mới", rating: 4 },
    { name: "Giày da lịch lãm", price: "689.000đ", originalPrice: "850.000đ", seed: "shoes", badge: "Hot", rating: 5 },
    { name: "Balo campus", price: "399.000đ", originalPrice: "480.000đ", seed: "bag", badge: "", rating: 4 },
    { name: "Nón bucket", price: "149.000đ", originalPrice: "", seed: "hat", badge: "Mới", rating: 4 },
    { name: "Kính mát UV400", price: "259.000đ", originalPrice: "320.000đ", seed: "glass", badge: "-19%", rating: 5 },
  ].map((p) =>
    mk("ProductCard", {
      imageSrc: `https://picsum.photos/seed/${p.seed}/400/300`,
      name: p.name, price: p.price, originalPrice: p.originalPrice,
      rating: p.rating, badge: p.badge,
    }, grid.id)
  )
  nest(grid, ...products)

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Khám phá", tab2Icon: "🔍", tab2Route: "/kham-pha",
    tab3Label: "Giỏ hàng", tab3Icon: "🛒", tab3Route: "/gio-hang",
    activeTab: "2",
  })

  return build([header, search, chipRow, grid, bnav], all)
}

// ─── Template: Chi tiết sản phẩm ─────────────────────────────────────────────

function buildDetailTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Chi tiết sản phẩm", showBack: true, bgColor: "#0068FF" })

  const image = mk("Image", {
    src: "https://picsum.photos/seed/detail-hero/800/500",
    alt: "Sản phẩm",
    width: "100%",
    height: "260px",
    rounded: "none",
    objectFit: "cover",
  })

  const tagRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "4", background: "transparent", align: "center" })
  const tag1 = mk("ZaloTag", { label: "Mới nhất", color: "blue" }, tagRow.id)
  const tag2 = mk("ZaloTag", { label: "Còn hàng", color: "green" }, tagRow.id)
  nest(tagRow, tag1, tag2)

  const titleText = mk("Text", {
    content: "Áo thun Unisex Premium Cotton 230gsm",
    tag: "h2",
    size: "xl",
    weight: "bold",
    color: "#111827",
    align: "left",
  })

  const ratingRow = mk("Stack", { direction: "horizontal", gap: "3", padding: "4", align: "center", background: "transparent" })
  const rating = mk("Rating", { value: 4, max: "5", color: "#F59E0B", showValue: true }, ratingRow.id)
  const reviewCount = mk("Text", { content: "128 đánh giá", tag: "span", size: "sm", weight: "normal", color: "#6B7280", align: "left" }, ratingRow.id)
  nest(ratingRow, rating, reviewCount)

  const priceRow = mk("Stack", { direction: "horizontal", gap: "3", padding: "4", align: "center", background: "transparent" })
  const price = mk("Text", { content: "129.000đ", tag: "span", size: "2xl", weight: "bold", color: "#0068FF", align: "left" }, priceRow.id)
  const origPrice = mk("Text", { content: "199.000đ", tag: "span", size: "base", weight: "normal", color: "#9CA3AF", align: "left" }, priceRow.id)
  nest(priceRow, price, origPrice)

  const desc = mk("Text", {
    content: "Áo thun Oversized làm từ 100% cotton cao cấp, thoáng mát và thấm hút mồ hôi tốt. Phong cách streetwear hiện đại, phù hợp nhiều dịp từ đi chơi đến dạo phố.",
    tag: "p",
    size: "sm",
    weight: "normal",
    color: "#6B7280",
    align: "left",
  })

  const progress = mk("ProgressBar", { value: 68, label: "Đã bán 68/100 sản phẩm", color: "#0068FF", bgColor: "#E5E7EB", showLabel: true })

  const btnStack = mk("Stack", { direction: "horizontal", gap: "3", padding: "4", background: "transparent", align: "stretch" })
  const wishBtn = mk("ZaloButton", { label: "❤  Yêu thích", variant: "secondary", fullWidth: false }, btnStack.id)
  const buyBtn = mk("ZaloButton", { label: "Thêm vào giỏ", variant: "primary", fullWidth: true }, btnStack.id)
  nest(btnStack, wishBtn, buyBtn)

  return build([header, image, tagRow, titleText, ratingRow, priceRow, desc, progress, btnStack], all)
}

// ─── Template: Hồ sơ cá nhân ─────────────────────────────────────────────────

function buildProfileTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Cá nhân", showBack: false, bgColor: "#0068FF" })

  const profileCard = mk("UserProfileCard", {
    avatarSrc: "https://picsum.photos/seed/user-ava/200/200",
    name: "Nguyễn Minh Khoa",
    bio: "Yêu thích khám phá, mua sắm và chia sẻ review sản phẩm",
    stat1Label: "Bài đăng", stat1Value: "48",
    stat2Label: "Theo dõi", stat2Value: "1.2K",
    stat3Label: "Đang theo", stat3Value: "234",
  })

  const statGrid = mk("Grid", { columns: "3", gap: "3", padding: "4" })
  const stat1 = mk("StatCard", { value: "48", label: "Đơn hàng", icon: "cart", color: "#0068FF", trend: "" }, statGrid.id)
  const stat2 = mk("StatCard", { value: "3", label: "Voucher", icon: "star", color: "#F59E0B", trend: "" }, statGrid.id)
  const stat3 = mk("StatCard", { value: "12K", label: "Điểm tích lũy", icon: "heart", color: "#EF4444", trend: "" }, statGrid.id)
  nest(statGrid, stat1, stat2, stat3)

  const settingCard = mk("ZaloCard", { padding: "md", shadow: true, rounded: "xl" })
  const sw1 = mk("Switch", { label: "Nhận thông báo", description: "Đơn hàng, khuyến mãi", checked: true }, settingCard.id)
  const div1 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, settingCard.id)
  const sw2 = mk("Switch", { label: "Giao diện tối", description: "Chế độ Dark mode", checked: false }, settingCard.id)
  const div2 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, settingCard.id)
  const li1 = mk("ZaloListItem", { title: "Ngôn ngữ", subtitle: "Tiếng Việt", showArrow: true, showAvatar: false, avatarText: "" }, settingCard.id)
  const div3 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, settingCard.id)
  const li2 = mk("ZaloListItem", { title: "Bảo mật & Quyền riêng tư", subtitle: "Xác thực 2 lớp đang bật", showArrow: true, showAvatar: false, avatarText: "" }, settingCard.id)
  nest(settingCard, sw1, div1, sw2, div2, li1, div3, li2)

  const logoutBtn = mk("ZaloButton", { label: "Đăng xuất", variant: "tertiary", fullWidth: true })

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Khám phá", tab2Icon: "🔍", tab2Route: "/kham-pha",
    tab3Label: "Cá nhân", tab3Icon: "👤", tab3Route: "/profile",
    activeTab: "3",
  })

  return build([header, profileCard, statGrid, settingCard, logoutBtn, bnav], all)
}

// ─── Template: Thông báo ──────────────────────────────────────────────────────

function buildNotificationTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Thông báo", showBack: false, bgColor: "#0068FF" })

  const banner = mk("Banner", {
    message: "Bạn có 3 thông báo chưa đọc",
    type: "info",
    showIcon: true,
  })

  const chipRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "4", background: "transparent", align: "start" })
  const c1 = mk("Chip", { label: "Tất cả", active: true }, chipRow.id)
  const c2 = mk("Chip", { label: "Đơn hàng", active: false }, chipRow.id)
  const c3 = mk("Chip", { label: "Khuyến mãi", active: false }, chipRow.id)
  nest(chipRow, c1, c2, c3)

  const list = mk("ZaloList", {})
  const notifs = [
    {
      title: "Đơn hàng đã được giao thành công",
      body: "Đơn #DH2024001 — Áo thun Oversized đã đến nơi. Hãy đánh giá sản phẩm!",
      time: "2 phút trước", icon: "check", iconColor: "#059669", unread: true,
    },
    {
      title: "Flash sale 0h — Giảm đến 70%",
      body: "Hàng ngàn sản phẩm giảm giá sốc chỉ trong đêm nay. Đừng bỏ lỡ!",
      time: "1 giờ trước", icon: "star", iconColor: "#F59E0B", unread: true,
    },
    {
      title: "Nguyễn Thu Hà đã theo dõi bạn",
      body: "Theo dõi lại để không bỏ lỡ những review mới nhất từ bạn bè.",
      time: "3 giờ trước", icon: "user", iconColor: "#0068FF", unread: true,
    },
    {
      title: "Voucher 50K sắp hết hạn",
      body: "Voucher SUMMER50 của bạn hết hạn vào 23:59 hôm nay. Dùng ngay kẻo lỡ!",
      time: "Hôm qua", icon: "cart", iconColor: "#7C3AED", unread: false,
    },
    {
      title: "Đơn hàng đang được vận chuyển",
      body: "Đơn #DH2024002 đang trên đường giao đến bạn, dự kiến nhận trong 2 giờ.",
      time: "Hôm qua", icon: "info", iconColor: "#6B7280", unread: false,
    },
  ].map((props) => mk("NotificationItem", props, list.id))
  nest(list, ...notifs)

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Thông báo", tab2Icon: "⭐", tab2Route: "/thong-bao",
    tab3Label: "Cá nhân", tab3Icon: "👤", tab3Route: "/profile",
    activeTab: "2",
  })

  return build([header, banner, chipRow, list, bnav], all)
}

// ─── Template: Giỏ hàng ──────────────────────────────────────────────────────

function buildCartTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Giỏ hàng (3)", showBack: true, bgColor: "#0068FF" })

  const list = mk("ZaloList", {})
  const items = [
    { name: "Áo thun Oversized Premium", price: "129.000đ", seed: "cart-a", qty: 1 },
    { name: "Quần jeans slim fit màu xanh", price: "349.000đ", seed: "cart-b", qty: 2 },
    { name: "Giày sneaker trắng năng động", price: "529.000đ", seed: "cart-c", qty: 1 },
  ].map(({ name, price, seed, qty }) => mk("ZaloListItem", {
    title: name,
    subtitle: `${price} × ${qty}`,
    showArrow: false,
    showAvatar: true,
    avatarText: "🛍️",
  }, list.id))
  nest(list, ...items)

  const voucherCard = mk("ZaloCard", { padding: "md", shadow: true, rounded: "xl" })
  const voucherRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "0", align: "center", background: "transparent" }, voucherCard.id)
  const voucherInput = mk("ZaloInput", { placeholder: "Nhập mã giảm giá", type: "text", label: "" }, voucherRow.id)
  const applyBtn = mk("ZaloButton", { label: "Áp dụng", variant: "secondary", fullWidth: false }, voucherRow.id)
  nest(voucherRow, voucherInput, applyBtn)
  nest(voucherCard, voucherRow)

  const summaryCard = mk("ZaloCard", { padding: "md", shadow: true, rounded: "xl" })
  const r1 = mk("Stack", { direction: "horizontal", gap: "0", padding: "0", align: "center", background: "transparent" }, summaryCard.id)
  const t1a = mk("Text", { content: "Tạm tính", tag: "span", size: "sm", weight: "normal", color: "#6B7280", align: "left" }, r1.id)
  const t1b = mk("Text", { content: "1.007.000đ", tag: "span", size: "sm", weight: "semibold", color: "#111827", align: "right" }, r1.id)
  nest(r1, t1a, t1b)
  const div1 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, summaryCard.id)
  const r2 = mk("Stack", { direction: "horizontal", gap: "0", padding: "0", align: "center", background: "transparent" }, summaryCard.id)
  const t2a = mk("Text", { content: "Phí vận chuyển", tag: "span", size: "sm", weight: "normal", color: "#6B7280", align: "left" }, r2.id)
  const t2b = mk("Text", { content: "Miễn phí", tag: "span", size: "sm", weight: "semibold", color: "#059669", align: "right" }, r2.id)
  nest(r2, t2a, t2b)
  const div2 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, summaryCard.id)
  const r3 = mk("Stack", { direction: "horizontal", gap: "0", padding: "0", align: "center", background: "transparent" }, summaryCard.id)
  const t3a = mk("Text", { content: "Tổng thanh toán", tag: "span", size: "base", weight: "bold", color: "#111827", align: "left" }, r3.id)
  const t3b = mk("Text", { content: "1.007.000đ", tag: "span", size: "lg", weight: "bold", color: "#0068FF", align: "right" }, r3.id)
  nest(r3, t3a, t3b)
  nest(summaryCard, r1, div1, r2, div2, r3)

  const checkoutBtn = mk("ZaloButton", { label: "Đặt hàng ngay", variant: "primary", fullWidth: true })

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Khám phá", tab2Icon: "🔍", tab2Route: "/kham-pha",
    tab3Label: "Giỏ hàng", tab3Icon: "🛒", tab3Route: "/gio-hang",
    activeTab: "3",
  })

  return build([header, list, voucherCard, summaryCard, checkoutBtn, bnav], all)
}

// ─── Template: Đăng nhập ─────────────────────────────────────────────────────

function buildLoginTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const page = mk("ZaloPage", { backgroundColor: "#F9FAFB" })

  const logoSection = mk("Stack", { direction: "vertical", gap: "2", padding: "8", align: "center", background: "transparent" }, page.id)
  const logo = mk("Image", {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/240px-Icon_of_Zalo.svg.png",
    alt: "Logo", width: "72px", height: "72px", rounded: "xl", objectFit: "contain",
  }, logoSection.id)
  const appTitle = mk("Text", { content: "My Zalo App", tag: "h1", size: "2xl", weight: "bold", color: "#111827", align: "center" }, logoSection.id)
  const tagline = mk("Text", { content: "Đăng nhập để tiếp tục mua sắm", tag: "p", size: "sm", weight: "normal", color: "#6B7280", align: "center" }, logoSection.id)
  nest(logoSection, logo, appTitle, tagline)

  const formCard = mk("ZaloCard", { padding: "lg", shadow: true, rounded: "xl" }, page.id)
  const phoneInput = mk("ZaloInput", { placeholder: "Số điện thoại", type: "tel", label: "Số điện thoại" }, formCard.id)
  const passwordInput = mk("ZaloInput", { placeholder: "Mật khẩu", type: "password", label: "Mật khẩu" }, formCard.id)
  const loginBtn = mk("ZaloButton", { label: "Đăng nhập", variant: "primary", fullWidth: true }, formCard.id)
  const divider = mk("Divider", { color: "#E5E7EB", thickness: "1px", margin: "none" }, formCard.id)
  const zaloLoginBtn = mk("ZaloButton", { label: "Đăng nhập với Zalo", variant: "secondary", fullWidth: true }, formCard.id)
  nest(formCard, phoneInput, passwordInput, loginBtn, divider, zaloLoginBtn)

  const registerRow = mk("Stack", { direction: "horizontal", gap: "1", padding: "4", align: "center", background: "transparent" }, page.id)
  const regText = mk("Text", { content: "Chưa có tài khoản?", tag: "span", size: "sm", weight: "normal", color: "#6B7280", align: "center" }, registerRow.id)
  const regLink = mk("Text", { content: "Đăng ký ngay", tag: "span", size: "sm", weight: "semibold", color: "#0068FF", align: "center" }, registerRow.id)
  nest(registerRow, regText, regLink)
  nest(page, logoSection, formCard, registerRow)

  return build([page], all)
}

// ─── Template: Dashboard ─────────────────────────────────────────────────────

function buildDashboardTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Dashboard", showBack: false, bgColor: "#0068FF" })

  const greeting = mk("Text", {
    content: "Chào buổi sáng, Admin 👋",
    tag: "h2", size: "lg", weight: "bold", color: "#111827", align: "left",
  })
  const subGreeting = mk("Text", {
    content: "Dashboard · Tổng quan hoạt động kinh doanh",
    tag: "p", size: "sm", weight: "normal", color: "#6B7280", align: "left",
  })

  const kpiGrid = mk("Grid", { columns: "2", gap: "3", padding: "4" })
  const kpiData = [
    { value: "128", label: "Đơn hàng", icon: "cart", color: "#0068FF", trend: "+12%" },
    { value: "4.2M", label: "Doanh thu", icon: "chart", color: "#059669", trend: "+8%" },
    { value: "96%", label: "Đúng hẹn", icon: "check", color: "#7C3AED", trend: "+2%" },
    { value: "4.8★", label: "Đánh giá", icon: "star", color: "#F59E0B", trend: "→" },
  ]
  const kpis = kpiData.map((k) => mk("StatCard", { ...k }, kpiGrid.id))
  nest(kpiGrid, ...kpis)

  const progressCard = mk("ZaloCard", { padding: "md", shadow: true, rounded: "xl" })
  const pb1 = mk("ProgressBar", { label: "Doanh thu", value: 72, color: "#0068FF", showLabel: true }, progressCard.id)
  const pb2 = mk("ProgressBar", { label: "Đơn hàng", value: 85, color: "#059669", showLabel: true }, progressCard.id)
  const pb3 = mk("ProgressBar", { label: "Khách mới", value: 48, color: "#F59E0B", showLabel: true }, progressCard.id)
  nest(progressCard, pb1, pb2, pb3)

  const recentList = mk("ZaloList", {})
  const recentItems = [
    { title: "#DH2024088 — Áo thun Oversized", subtitle: "Đang giao · 129.000đ" },
    { title: "#DH2024087 — Quần jeans slim", subtitle: "Hoàn thành · 349.000đ" },
    { title: "#DH2024086 — Giày sneaker", subtitle: "Chờ xác nhận · 529.000đ" },
  ].map(({ title, subtitle }) =>
    mk("ZaloListItem", { title, subtitle, showArrow: true, showAvatar: false, avatarText: "" }, recentList.id)
  )
  nest(recentList, ...recentItems)

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Dashboard", tab1Icon: "📊", tab1Route: "/",
    tab2Label: "Đơn hàng", tab2Icon: "📦", tab2Route: "/don-hang",
    tab3Label: "Cá nhân", tab3Icon: "👤", tab3Route: "/profile",
    activeTab: "1",
  })

  return build([header, greeting, subGreeting, kpiGrid, progressCard, recentList, bnav], all)
}

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

  const grid = mk("Grid", { columns: "2", gap: "4", padding: "4" })
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

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Đặt món", tab2Icon: "🍜", tab2Route: "/order",
    tab3Label: "Giỏ hàng", tab3Icon: "🛒", tab3Route: "/cart",
    activeTab: "2",
  })

  return build([header, banner, chipRow, grid, bnav], all)
}

// ─── Template: Booking ────────────────────────────────────────────────────────

function buildBookingTemplate(): BuildResult {
  const all: ComponentNode[] = []
  const mk = (type: string, props: Record<string, unknown>, parentId: string | null = null) => {
    const node = n(type, props, parentId); all.push(node); return node
  }

  const header = mk("ZaloHeader", { title: "Đặt lịch dịch vụ", showBack: true, bgColor: "#7C3AED" })

  const serviceGrid = mk("Grid", { columns: "2", gap: "3", padding: "4" })
  const services = [
    { value: "80K", label: "✂️ Cắt tóc", color: "#7C3AED" },
    { value: "250K", label: "🎨 Nhuộm tóc", color: "#7C3AED" },
    { value: "150K", label: "💆 Massage", color: "#7C3AED" },
    { value: "120K", label: "💅 Làm nail", color: "#7C3AED" },
  ].map((s) =>
    mk("StatCard", { value: s.value, label: s.label, icon: "star", color: s.color, trend: "" }, serviceGrid.id)
  )
  nest(serviceGrid, ...services)

  const timeRow = mk("Stack", { direction: "horizontal", gap: "2", padding: "4", background: "transparent", align: "start" })
  const t1 = mk("Chip", { label: "09:00", active: false, color: "#7C3AED" }, timeRow.id)
  const t2 = mk("Chip", { label: "10:30", active: true, color: "#7C3AED" }, timeRow.id)
  const t3 = mk("Chip", { label: "14:00", active: false, color: "#7C3AED" }, timeRow.id)
  const t4 = mk("Chip", { label: "15:30", active: false, color: "#7C3AED" }, timeRow.id)
  nest(timeRow, t1, t2, t3, t4)

  const progress = mk("ProgressBar", {
    value: 60,
    label: "Đã đặt 6/10 chỗ hôm nay",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    showLabel: true,
  })

  const confirmBtn = mk("ZaloButton", { label: "Xác nhận đặt lịch", variant: "primary", fullWidth: true })

  return build([header, serviceGrid, timeRow, progress, confirmBtn], all)
}

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

// ─── Template definitions ─────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  description: string
  emoji: string
  category: "ecommerce" | "auth" | "analytics" | "social" | "services"
  build: () => BuildResult
}

const TEMPLATES: Template[] = [
  {
    id: "home",
    name: "Trang chủ",
    description: "Hero banner + chip lọc + lưới sản phẩm + bottom nav",
    emoji: "🏠",
    category: "ecommerce",
    build: buildHomeTemplate,
  },
  {
    id: "product-list",
    name: "Khám phá sản phẩm",
    description: "Search + filter chips + 6 product cards 2 cột",
    emoji: "🛍️",
    category: "ecommerce",
    build: buildProductListTemplate,
  },
  {
    id: "detail",
    name: "Chi tiết sản phẩm",
    description: "Ảnh + tags + rating + giá + mô tả + CTA",
    emoji: "📦",
    category: "ecommerce",
    build: buildDetailTemplate,
  },
  {
    id: "cart",
    name: "Giỏ hàng",
    description: "Danh sách sản phẩm + mã giảm giá + tổng đơn + checkout",
    emoji: "🛒",
    category: "ecommerce",
    build: buildCartTemplate,
  },
  {
    id: "profile",
    name: "Hồ sơ cá nhân",
    description: "Profile card + stat cards + cài đặt toggle + list",
    emoji: "👤",
    category: "social",
    build: buildProfileTemplate,
  },
  {
    id: "notifications",
    name: "Thông báo",
    description: "Banner info + filter chips + danh sách notification",
    emoji: "🔔",
    category: "social",
    build: buildNotificationTemplate,
  },
  {
    id: "login",
    name: "Đăng nhập",
    description: "Logo + form phone/password + Zalo login + đăng ký",
    emoji: "🔐",
    category: "auth",
    build: buildLoginTemplate,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "KPI cards + progress bars + recent orders list",
    emoji: "📊",
    category: "analytics",
    build: buildDashboardTemplate,
  },
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
]

const CATEGORY_LABELS: Record<string, string> = {
  ecommerce: "E-commerce",
  auth:      "Auth",
  analytics: "Analytics",
  social:    "Social",
  services:  "Services",
}
const CATEGORY_COLORS: Record<string, string> = {
  ecommerce: "text-blue-600 bg-blue-50 border-blue-100",
  auth:      "text-purple-600 bg-purple-50 border-purple-100",
  analytics: "text-emerald-600 bg-emerald-50 border-emerald-100",
  social:    "text-orange-600 bg-orange-50 border-orange-100",
  services:  "text-teal-600 bg-teal-50 border-teal-100",
}

const CATEGORY_DOT: Record<string, string> = {
  ecommerce: "#0068FF",
  auth:      "#7C3AED",
  analytics: "#059669",
  social:    "#F59E0B",
  services:  "#0D9488",
}

// ─── Wireframe design system ──────────────────────────────────────────────────

const S = {
  col: { display: "flex", flexDirection: "column" as const },
  row: { display: "flex", flexDirection: "row" as const },
  flex1: { flex: 1 },
  shrink0: { flexShrink: 0 },
}

function WfStatusBar({ light = false }: { light?: boolean }) {
  const fg = light ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.22)"
  return (
    <div style={{ ...S.row, alignItems: "center", justifyContent: "space-between", padding: "5px 8px 3px", flexShrink: 0, position: "relative" }}>
      <div style={{ width: 18, height: 4, background: fg, borderRadius: 2 }} />
      {/* Dynamic Island pill — always black, represents camera cutout */}
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 46, height: 13, background: "#0D0D0D", borderRadius: 8, zIndex: 1 }} />
      <div style={{ ...S.row, gap: 3, alignItems: "center" }}>
        <div style={{ width: 8, height: 4, background: fg, borderRadius: 1 }} />
        <div style={{ width: 5, height: 4, background: fg, borderRadius: 1 }} />
        <div style={{ width: 10, height: 4, background: fg, borderRadius: 1 }} />
      </div>
    </div>
  )
}

function WfTopBar({ color, title, hasBack = false }: { color: string; title: string; hasBack?: boolean }) {
  return (
    <div style={{ background: color, flexShrink: 0 }}>
      <WfStatusBar light />
      <div style={{ ...S.row, alignItems: "center", gap: 5, padding: "4px 8px 7px" }}>
        {hasBack && (
          <div style={{ width: 6, height: 10, borderLeft: "2px solid rgba(255,255,255,0.8)", borderBottom: "2px solid rgba(255,255,255,0.8)", transform: "rotate(45deg)", flexShrink: 0 }} />
        )}
        <div style={{ height: 7, background: "rgba(255,255,255,0.9)", borderRadius: 3, width: hasBack ? 44 : 36, flexShrink: 0 }} />
        <div style={{ flex: 1 }} />
        <div style={{ width: 14, height: 14, background: "rgba(255,255,255,0.25)", borderRadius: "50%", flexShrink: 0 }} />
      </div>
    </div>
  )
}

function WfBottomNav({ active = 0, color = "#0068FF", labels = ["🏠", "🔍", "👤"] }: { active?: number; color?: string; labels?: string[] }) {
  return (
    <div style={{
      ...S.row, justifyContent: "space-around", alignItems: "flex-start",
      padding: "7px 6px 4px",
      background: "#fff", borderTop: "1px solid #F1F1F1",
      flexShrink: 0, marginTop: "auto",
    }}>
      {labels.map((em, i) => (
        <div key={i} style={{ ...S.col, alignItems: "center", gap: 3, minWidth: 28 }}>
          <div style={{
            width: 20, height: 20, background: i === active ? `${color}18` : "#F5F5F7",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10,
          }}>{em}</div>
          {i === active && <div style={{ width: 14, height: 3, background: color, borderRadius: 2 }} />}
        </div>
      ))}
    </div>
  )
}

function WfSearchBar({ placeholder = "" }: { placeholder?: string }) {
  return (
    <div style={{ margin: "5px 7px 0", background: "#F2F2F7", borderRadius: 8, padding: "5px 8px", ...S.row, alignItems: "center", gap: 4, flexShrink: 0 }}>
      <div style={{ width: 8, height: 8, border: "1.5px solid #BBBBC0", borderRadius: "50%", flexShrink: 0 }} />
      <div style={{ height: 5, background: "#C7C7CC", borderRadius: 3, width: placeholder ? 52 : 40 }} />
    </div>
  )
}

function WfChips({ items, activeIdx = 0, color = "#0068FF" }: { items: string[]; activeIdx?: number; color?: string }) {
  return (
    <div style={{ ...S.row, gap: 4, padding: "6px 7px", flexShrink: 0, overflowX: "hidden" }}>
      {items.map((label, i) => (
        <div key={i} style={{
          height: 16, padding: "0 7px", display: "flex", alignItems: "center", justifyContent: "center",
          background: i === activeIdx ? color : "#F2F2F7",
          borderRadius: 8, flexShrink: 0,
        }}>
          <div style={{ height: 5, width: label.length * 3.5, background: i === activeIdx ? "rgba(255,255,255,0.9)" : "#C7C7CC", borderRadius: 3, maxWidth: 40 }} />
        </div>
      ))}
    </div>
  )
}

function WfProductCard({ seed, badge, color = "#0068FF" }: { seed: string; badge?: string; color?: string }) {
  const palettes = ["#FFD6CC", "#C8E6FF", "#D5F5E3", "#E8D5FF", "#FFF3CC", "#FFE4F0"]
  const bg = palettes[seed.charCodeAt(0) % palettes.length]
  return (
    <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
      <div style={{ height: 36, background: bg, position: "relative" }}>
        {badge && (
          <div style={{
            position: "absolute", top: 3, left: 3, background: color, borderRadius: 3,
            padding: "1px 4px", display: "flex", alignItems: "center",
          }}>
            <div style={{ height: 4, width: 12, background: "rgba(255,255,255,0.9)", borderRadius: 2 }} />
          </div>
        )}
      </div>
      <div style={{ padding: "4px 5px" }}>
        <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: "85%", marginBottom: 3 }} />
        <div style={{ ...S.row, alignItems: "center", gap: 3 }}>
          <div style={{ height: 6, background: color, borderRadius: 3, width: 30 }} />
          <div style={{ height: 5, background: "#F3F4F6", borderRadius: 3, width: 20 }} />
        </div>
      </div>
    </div>
  )
}

function WfProductGrid({ seeds, color = "#0068FF" }: { seeds: string[]; color?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: "5px 7px", flex: 1, overflow: "hidden", alignContent: "start" }}>
      {seeds.map((s, i) => <WfProductCard key={i} seed={s} badge={i % 3 === 0 ? "Sale" : undefined} color={color} />)}
    </div>
  )
}

function WfHeroBanner({ color = "#0068FF" }: { color?: string }) {
  return (
    <div style={{
      margin: "6px 7px 0", borderRadius: 10, overflow: "hidden", flexShrink: 0,
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      height: 62, position: "relative", display: "flex", alignItems: "flex-end", padding: 8,
    }}>
      <div style={{ position: "absolute", right: 8, top: 6, width: 40, height: 46, background: "rgba(255,255,255,0.15)", borderRadius: 6 }} />
      <div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.9)", borderRadius: 3, width: 60, marginBottom: 4 }} />
        <div style={{ height: 4, background: "rgba(255,255,255,0.55)", borderRadius: 3, width: 80 }} />
      </div>
    </div>
  )
}

function WfNotifItem({ color = "#0068FF", unread = false }: { color?: string; unread?: boolean }) {
  return (
    <div style={{ ...S.row, gap: 6, padding: "6px 8px", borderBottom: "1px solid #F5F5F5", alignItems: "flex-start", flexShrink: 0 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, background: color, borderRadius: "50%" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 3 }}>
          <div style={{ height: 6, background: unread ? "#1F2937" : "#D1D5DB", borderRadius: 3, width: "60%", fontWeight: unread ? 700 : 400 }} />
          <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: 20 }} />
        </div>
        <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: "85%" }} />
      </div>
      {unread && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#0068FF", flexShrink: 0, marginTop: 3 }} />}
    </div>
  )
}

function WfCartItem({ color = "#0068FF" }: { color?: string }) {
  const bg = ["#FFD6CC", "#C8E6FF", "#D5F5E3"][Math.floor(Math.random() * 3)]
  return (
    <div style={{ ...S.row, gap: 7, padding: "7px 8px", borderBottom: "1px solid #F5F5F5", alignItems: "center", flexShrink: 0 }}>
      <div style={{ width: 30, height: 30, borderRadius: 6, background: bg, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 6, background: "#D1D5DB", borderRadius: 3, width: "70%", marginBottom: 4 }} />
        <div style={{ ...S.row, gap: 6, alignItems: "center" }}>
          <div style={{ height: 6, background: color, borderRadius: 3, width: 32 }} />
          <div style={{ ...S.row, gap: 2, alignItems: "center" }}>
            <div style={{ width: 12, height: 12, background: "#F2F2F7", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 6, height: 2, background: "#9CA3AF", borderRadius: 1 }} />
            </div>
            <div style={{ height: 5, width: 8, background: "#E5E7EB", borderRadius: 2 }} />
            <div style={{ width: 12, height: 12, background: `${color}20`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 6, height: 2, background: color, borderRadius: 1 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Individual wireframes ────────────────────────────────────────────────────

function WireframeHome() {
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#F8F9FA" }}>
      <WfTopBar color="#0068FF" title="Trang chủ" />
      <WfHeroBanner color="#0068FF" />
      <WfChips items={["Tất cả", "Áo", "Quần", "Giày"]} color="#0068FF" />
      <WfProductGrid seeds={["a", "b", "c", "d"]} color="#0068FF" />
      <WfBottomNav active={0} color="#0068FF" labels={["🏠", "🔍", "👤"]} />
    </div>
  )
}

function WireframeProductList() {
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#F8F9FA" }}>
      <WfTopBar color="#0068FF" title="Khám phá" />
      <WfSearchBar />
      <WfChips items={["Tất cả", "Thời trang", "Phụ kiện"]} color="#0068FF" />
      <WfProductGrid seeds={["p1", "p2", "p3", "p4", "p5", "p6"]} color="#0068FF" />
      <WfBottomNav active={1} color="#0068FF" labels={["🏠", "🔍", "🛒"]} />
    </div>
  )
}

function WireframeDetail() {
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#fff" }}>
      <WfTopBar color="#0068FF" title="Chi tiết" hasBack />
      {/* Hero */}
      <div style={{ height: 68, background: "linear-gradient(135deg, #E8F4FF, #BFDBFE)", flexShrink: 0, position: "relative" }}>
        <div style={{ position: "absolute", bottom: 8, left: 8, ...S.row, gap: 3 }}>
          <div style={{ height: 12, width: 28, background: "#DBEAFE", borderRadius: 4, border: "1px solid #BFDBFE" }} />
          <div style={{ height: 12, width: 32, background: "#D1FAE5", borderRadius: 4, border: "1px solid #A7F3D0" }} />
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: "8px 8px 0", flex: 1, ...S.col, gap: 5 }}>
        <div style={{ height: 8, background: "#1F2937", borderRadius: 3, width: "85%" }} />
        {/* Stars */}
        <div style={{ ...S.row, gap: 2, alignItems: "center" }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ width: 7, height: 7, background: "#FBBF24", borderRadius: "50%" }} />)}
          <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: 28, marginLeft: 4 }} />
        </div>
        {/* Price */}
        <div style={{ ...S.row, alignItems: "baseline", gap: 6 }}>
          <div style={{ height: 11, background: "#0068FF", borderRadius: 3, width: 50 }} />
          <div style={{ height: 7, background: "#E5E7EB", borderRadius: 3, width: 36 }} />
        </div>
        {/* Description */}
        <div>
          <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: "100%", marginBottom: 3 }} />
          <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: "78%", marginBottom: 3 }} />
          <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3, width: "60%" }} />
        </div>
        {/* Progress */}
        <div>
          <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 3 }}>
            <div style={{ height: 5, background: "#9CA3AF", borderRadius: 3, width: 60 }} />
            <div style={{ height: 5, background: "#0068FF", borderRadius: 3, width: 20 }} />
          </div>
          <div style={{ height: 5, background: "#E5E7EB", borderRadius: 3 }}>
            <div style={{ height: 5, background: "#0068FF", borderRadius: 3, width: "68%" }} />
          </div>
        </div>
      </div>
      {/* CTA */}
      <div style={{ ...S.row, gap: 5, padding: "8px 8px 10px", flexShrink: 0, background: "#fff", borderTop: "1px solid #F1F1F1" }}>
        <div style={{ flex: 1, height: 26, background: "#F2F2F7", borderRadius: 7 }} />
        <div style={{ flex: 2, height: 26, background: "#0068FF", borderRadius: 7 }} />
      </div>
    </div>
  )
}

function WireframeCart() {
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#F8F9FA" }}>
      <WfTopBar color="#0068FF" title="Giỏ hàng (3)" hasBack />
      <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
        {/* Cart items */}
        <div style={{ background: "#fff", marginBottom: 5 }}>
          <WfCartItem color="#0068FF" />
          <WfCartItem color="#0068FF" />
          <WfCartItem color="#0068FF" />
        </div>
        {/* Voucher */}
        <div style={{ background: "#fff", padding: "7px 8px", marginBottom: 5, ...S.row, gap: 5 }}>
          <div style={{ flex: 1, height: 22, background: "#F2F2F7", borderRadius: 6, ...S.row, alignItems: "center", padding: "0 7px" }}>
            <div style={{ height: 5, background: "#D1D5DB", borderRadius: 3, width: 60 }} />
          </div>
          <div style={{ width: 44, height: 22, background: "#0068FF", borderRadius: 6 }} />
        </div>
        {/* Summary */}
        <div style={{ background: "#fff", padding: "7px 8px", flex: 1 }}>
          {[["Tạm tính", "#9CA3AF", "1.007K", "#374151"], ["Freeship", "#9CA3AF", "Miễn phí", "#059669"]].map(([l, lc, v, vc], i) => (
            <div key={i} style={{ ...S.row, justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ height: 5, background: lc, borderRadius: 3, width: 44 }} />
              <div style={{ height: 5, background: vc, borderRadius: 3, width: 34 }} />
            </div>
          ))}
          <div style={{ height: 1, background: "#F3F4F6", margin: "6px 0" }} />
          <div style={{ ...S.row, justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ height: 7, background: "#1F2937", borderRadius: 3, width: 54 }} />
            <div style={{ height: 8, background: "#0068FF", borderRadius: 3, width: 44 }} />
          </div>
        </div>
      </div>
      {/* Checkout */}
      <div style={{ padding: "7px 8px 9px", background: "#fff", borderTop: "1px solid #F1F1F1", flexShrink: 0 }}>
        <div style={{ height: 26, background: "#0068FF", borderRadius: 8 }} />
      </div>
      <WfBottomNav active={2} color="#0068FF" labels={["🏠", "🔍", "🛒"]} />
    </div>
  )
}

function WireframeProfile() {
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#F8F9FA" }}>
      <WfTopBar color="#0068FF" title="Cá nhân" />
      {/* Profile card */}
      <div style={{ background: "#fff", padding: "10px 8px 8px", marginBottom: 5 }}>
        <div style={{ ...S.row, alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0068FF, #7C3AED)", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 0 0 2px #0068FF20" }} />
          <div>
            <div style={{ height: 7, background: "#1F2937", borderRadius: 3, width: 70, marginBottom: 4 }} />
            <div style={{ height: 5, background: "#9CA3AF", borderRadius: 3, width: 90 }} />
          </div>
        </div>
        {/* Stats row */}
        <div style={{ ...S.row, gap: 0, marginTop: 10, borderTop: "1px solid #F3F4F6", paddingTop: 8 }}>
          {[["48", "Bài đăng", "#0068FF"], ["1.2K", "Followers", "#7C3AED"], ["234", "Following", "#059669"]].map(([v, l, c], i) => (
            <div key={i} style={{ flex: 1, ...S.col, alignItems: "center", gap: 2, borderRight: i < 2 ? "1px solid #F3F4F6" : "none" }}>
              <div style={{ height: 8, background: c, borderRadius: 3, width: 24 }} />
              <div style={{ height: 5, background: "#D1D5DB", borderRadius: 3, width: 28 }} />
            </div>
          ))}
        </div>
      </div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, padding: "0 7px", marginBottom: 5 }}>
        {[["#DBEAFE", "#0068FF"], ["#FEF3C7", "#F59E0B"], ["#FCE7F3", "#EC4899"]].map(([bg, c], i) => (
          <div key={i} style={{ background: bg, borderRadius: 8, padding: "6px 5px" }}>
            <div style={{ height: 9, background: c, borderRadius: 3, width: "55%", marginBottom: 4, opacity: 0.7 }} />
            <div style={{ height: 5, background: "rgba(0,0,0,0.15)", borderRadius: 3 }} />
          </div>
        ))}
      </div>
      {/* Settings */}
      <div style={{ background: "#fff", borderRadius: 10, margin: "0 7px" }}>
        {[true, false].map((on, i) => (
          <React.Fragment key={i}>
            <div style={{ ...S.row, justifyContent: "space-between", alignItems: "center", padding: "7px 8px" }}>
              <div>
                <div style={{ height: 6, background: "#374151", borderRadius: 3, width: 70, marginBottom: 3 }} />
                <div style={{ height: 4, background: "#D1D5DB", borderRadius: 3, width: 50 }} />
              </div>
              <div style={{ width: 26, height: 14, background: on ? "#0068FF" : "#D1D5DB", borderRadius: 7, flexShrink: 0, position: "relative" }}>
                <div style={{ position: "absolute", top: 2, [on ? "right" : "left"]: 2, width: 10, height: 10, background: "#fff", borderRadius: "50%" }} />
              </div>
            </div>
            {i < 1 && <div style={{ height: 1, background: "#F3F4F6", margin: "0 8px" }} />}
          </React.Fragment>
        ))}
      </div>
      <WfBottomNav active={2} color="#0068FF" labels={["🏠", "🔍", "👤"]} />
    </div>
  )
}

function WireframeNotifications() {
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#F8F9FA" }}>
      <WfTopBar color="#0068FF" title="Thông báo" />
      {/* Info banner */}
      <div style={{ margin: "6px 7px 0", background: "#EFF6FF", borderRadius: 8, padding: "6px 8px", ...S.row, gap: 5, alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, background: "#BFDBFE", borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ height: 5, background: "#93C5FD", borderRadius: 3, width: 90 }} />
      </div>
      <WfChips items={["Tất cả", "Đơn hàng", "Khuyến mãi"]} color="#0068FF" />
      <div style={{ flex: 1, background: "#fff", overflow: "hidden" }}>
        <WfNotifItem color="#059669" unread />
        <WfNotifItem color="#F59E0B" unread />
        <WfNotifItem color="#0068FF" unread />
        <WfNotifItem color="#7C3AED" />
        <WfNotifItem color="#6B7280" />
      </div>
      <WfBottomNav active={1} color="#0068FF" labels={["🏠", "🔔", "👤"]} />
    </div>
  )
}

function WireframeLogin() {
  return (
    <div style={{ ...S.col, height: "100%", background: "#fff", alignItems: "center" }}>
      <WfStatusBar />
      {/* Logo area */}
      <div style={{ ...S.col, alignItems: "center", padding: "16px 8px 8px" }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #0068FF, #3B82F6)", marginBottom: 8, boxShadow: "0 4px 12px #0068FF40" }} />
        <div style={{ height: 8, background: "#1F2937", borderRadius: 3, width: 70, marginBottom: 5 }} />
        <div style={{ height: 5, background: "#9CA3AF", borderRadius: 3, width: 100 }} />
      </div>
      {/* Form card */}
      <div style={{ margin: "6px 7px", background: "#fff", borderRadius: 12, padding: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", width: "calc(100% - 14px)", flexShrink: 0 }}>
        {["Số điện thoại", "Mật khẩu"].map((ph, i) => (
          <div key={i} style={{ marginBottom: 7, background: "#F8F9FA", borderRadius: 8, padding: "8px 10px", border: "1px solid #E5E7EB" }}>
            <div style={{ height: 4, background: "#9CA3AF", borderRadius: 3, width: 50, marginBottom: 4 }} />
            <div style={{ height: 6, background: "#E5E7EB", borderRadius: 3, width: "60%" }} />
          </div>
        ))}
        <div style={{ height: 26, background: "#0068FF", borderRadius: 8, marginBottom: 7 }} />
        <div style={{ ...S.row, alignItems: "center", gap: 5, marginBottom: 7 }}>
          <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
          <div style={{ height: 5, background: "#D1D5DB", borderRadius: 3, width: 16 }} />
          <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
        </div>
        <div style={{ height: 26, background: "#F2F2F7", borderRadius: 8 }} />
      </div>
      {/* Register link */}
      <div style={{ ...S.row, gap: 4, alignItems: "center", marginTop: 4 }}>
        <div style={{ height: 5, background: "#D1D5DB", borderRadius: 3, width: 56 }} />
        <div style={{ height: 5, background: "#0068FF", borderRadius: 3, width: 40 }} />
      </div>
    </div>
  )
}

function WireframeDashboard() {
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#F8F9FA" }}>
      <WfTopBar color="#0068FF" title="Dashboard" />
      {/* Greeting */}
      <div style={{ padding: "7px 8px 4px" }}>
        <div style={{ height: 7, background: "#1F2937", borderRadius: 3, width: 80, marginBottom: 4 }} />
        <div style={{ height: 5, background: "#9CA3AF", borderRadius: 3, width: 110 }} />
      </div>
      {/* KPI grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: "5px 7px", flexShrink: 0 }}>
        {[["#EFF6FF", "#0068FF", "128", "+12%"], ["#ECFDF5", "#059669", "4.2M", "+8%"], ["#F5F3FF", "#7C3AED", "96%", "+2%"], ["#FFFBEB", "#F59E0B", "4.8★", "→"]].map(([bg, c, v, trend], i) => (
          <div key={i} style={{ background: bg, borderRadius: 8, padding: "7px 8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ height: 10, background: c, borderRadius: 3, width: 30, marginBottom: 4 }} />
            <div style={{ height: 5, background: "rgba(0,0,0,0.15)", borderRadius: 3, width: 44, marginBottom: 4 }} />
            <div style={{ height: 5, background: c, borderRadius: 3, width: 24, opacity: 0.6 }} />
          </div>
        ))}
      </div>
      {/* Progress */}
      <div style={{ background: "#fff", borderRadius: 8, margin: "5px 7px", padding: "7px 8px", flexShrink: 0 }}>
        {[[72, "#0068FF"], [85, "#059669"], [48, "#F59E0B"]].map(([pct, c], i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 7 : 0 }}>
            <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 3 }}>
              <div style={{ height: 5, background: "#9CA3AF", borderRadius: 3, width: 40 }} />
              <div style={{ height: 5, background: c as string, borderRadius: 3, width: 20 }} />
            </div>
            <div style={{ height: 5, background: "#F3F4F6", borderRadius: 3 }}>
              <div style={{ height: 5, background: c as string, borderRadius: 3, width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      {/* Recent list */}
      <div style={{ flex: 1, background: "#fff", overflow: "hidden" }}>
        {["#374151", "#9CA3AF", "#D1D5DB"].map((c, i) => (
          <div key={i} style={{ ...S.row, justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderBottom: "1px solid #F5F5F5" }}>
            <div>
              <div style={{ height: 6, background: c, borderRadius: 3, width: 90, marginBottom: 3 }} />
              <div style={{ height: 4, background: "#E5E7EB", borderRadius: 3, width: 60 }} />
            </div>
            <div style={{ width: 6, height: 10, borderRight: "1.5px solid #D1D5DB", borderTop: "1.5px solid #D1D5DB", transform: "rotate(45deg)" }} />
          </div>
        ))}
      </div>
      <WfBottomNav active={0} color="#0068FF" labels={["📊", "📦", "👤"]} />
    </div>
  )
}

function WireframeFoodOrder() {
  const orange = "#FF6B35"
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#FFF8F5" }}>
      <WfTopBar color={orange} title="Đặt món" />
      {/* Promo banner */}
      <div style={{ margin: "6px 7px 0", background: "linear-gradient(135deg, #FFF3E0, #FFE0B2)", borderRadius: 8, padding: "6px 8px", ...S.row, gap: 5, alignItems: "center", flexShrink: 0, border: "1px solid #FFCC80" }}>
        <div style={{ width: 14, height: 14, background: "#FF9800", borderRadius: "50%", flexShrink: 0 }} />
        <div style={{ height: 5, background: "#F97316", borderRadius: 3, width: 90, opacity: 0.7 }} />
      </div>
      <WfChips items={["🍚 Cơm", "🍜 Phở", "🥗 Bún", "🧋 Uống"]} activeIdx={0} color={orange} />
      <WfProductGrid seeds={["f1", "f2", "f3", "f4"]} color={orange} />
      <WfBottomNav active={1} color={orange} labels={["🏠", "🍜", "🛒"]} />
    </div>
  )
}

function WireframeBooking() {
  const purple = "#7C3AED"
  return (
    <div style={{ ...S.col, height: "100%", overflow: "hidden", background: "#FAFAFA" }}>
      <WfTopBar color={purple} title="Đặt lịch" hasBack />
      {/* Service grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, padding: "7px 7px 0", flexShrink: 0 }}>
        {[["✂️", "Cắt tóc", "80K"], ["🎨", "Nhuộm", "250K"], ["💆", "Massage", "150K"], ["💅", "Nail", "120K"]].map(([em, l, p], i) => (
          <div key={i} style={{ background: i === 0 ? `${purple}15` : "#F5F3FF", borderRadius: 8, padding: "8px 7px", border: `1.5px solid ${i === 0 ? purple : "transparent"}` }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>{em}</div>
            <div style={{ height: 6, background: i === 0 ? purple : "#C4B5FD", borderRadius: 3, width: "70%", marginBottom: 3 }} />
            <div style={{ height: 5, background: "#DDD6FE", borderRadius: 3, width: "50%" }} />
          </div>
        ))}
      </div>
      {/* Time slots */}
      <div style={{ ...S.row, gap: 4, padding: "7px 7px 0", flexShrink: 0 }}>
        {[false, true, false, false].map((active, i) => (
          <div key={i} style={{ height: 22, flex: 1, background: active ? purple : "#F2F2F7", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ height: 5, width: 20, background: active ? "rgba(255,255,255,0.9)" : "#C4C4C8", borderRadius: 3 }} />
          </div>
        ))}
      </div>
      {/* Progress */}
      <div style={{ padding: "7px 7px 0" }}>
        <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 3 }}>
          <div style={{ height: 5, background: "#9CA3AF", borderRadius: 3, width: 70 }} />
          <div style={{ height: 5, background: purple, borderRadius: 3, width: 24 }} />
        </div>
        <div style={{ height: 6, background: "#EDE9FE", borderRadius: 4 }}>
          <div style={{ height: 6, background: purple, borderRadius: 4, width: "60%" }} />
        </div>
      </div>
      {/* CTA */}
      <div style={{ padding: "7px 7px 0", flexShrink: 0 }}>
        <div style={{ height: 28, background: purple, borderRadius: 8 }} />
      </div>
    </div>
  )
}

function WireframeOnboarding() {
  return (
    <div style={{ ...S.col, height: "100%", background: "linear-gradient(160deg, #0068FF 0%, #3B82F6 60%, #7C3AED 100%)", alignItems: "center", padding: "0 8px 10px" }}>
      <WfStatusBar light />
      {/* Illustration */}
      <div style={{ width: "100%", flex: 1, background: "rgba(255,255,255,0.13)", borderRadius: 12, margin: "8px 0", maxHeight: 90, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ ...S.row, gap: 5 }}>
          {[40, 52, 40].map((h, i) => (
            <div key={i} style={{ width: 24, height: h, background: "rgba(255,255,255,0.2)", borderRadius: 6, flexShrink: 0 }} />
          ))}
        </div>
      </div>
      {/* Text */}
      <div style={{ height: 10, background: "rgba(255,255,255,0.9)", borderRadius: 5, width: "68%", marginBottom: 6 }} />
      <div style={{ height: 5, background: "rgba(255,255,255,0.5)", borderRadius: 3, width: "85%", marginBottom: 3 }} />
      <div style={{ height: 5, background: "rgba(255,255,255,0.5)", borderRadius: 3, width: "70%", marginBottom: 10 }} />
      {/* Dots */}
      <div style={{ ...S.row, gap: 5, marginBottom: 10, alignItems: "center" }}>
        {[true, false, false].map((active, i) => (
          <div key={i} style={{ width: active ? 20 : 7, height: 7, background: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)", borderRadius: 4, transition: "width 0.2s" }} />
        ))}
      </div>
      {/* CTA */}
      <div style={{ width: "100%", height: 28, background: "rgba(255,255,255,0.95)", borderRadius: 9, marginBottom: 7, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }} />
      <div style={{ height: 5, background: "rgba(255,255,255,0.45)", borderRadius: 3, width: "50%" }} />
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
    <>
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
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
      <div
        className="bg-white rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ width: 880, maxHeight: "88vh", animation: "tmModalIn 180ms ease-out" }}
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
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm template..."
                className="pl-7 pr-3 h-7 text-[12px] bg-zinc-50 focus-visible:bg-white"
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
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 relative ${
                    selectedId === t.id
                      ? "bg-blue-50/80"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  {/* Active bar */}
                  {selectedId === t.id && (
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#0068FF]" />
                  )}
                  {/* Emoji icon with colored bg */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[15px] shrink-0 transition-all"
                    style={{
                      background: selectedId === t.id ? `${CATEGORY_DOT[t.category]}18` : "#F3F4F6",
                      border: selectedId === t.id ? `1.5px solid ${CATEGORY_DOT[t.category]}30` : "1.5px solid transparent",
                    }}
                  >
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] font-semibold truncate mb-1 ${
                      selectedId === t.id ? "text-[#0068FF]" : "text-zinc-700"
                    }`}>
                      {t.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: CATEGORY_DOT[t.category] }}
                      />
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {CATEGORY_LABELS[t.category]}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}

            {/* Blank canvas option — always visible */}
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
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0" style={{ background: "radial-gradient(ellipse at 60% 20%, #EFF6FF 0%, #F8FAFF 50%, #F0F4FF 100%)" }}>
          {/* Preview area */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-hidden" style={{ padding: "28px 24px 16px" }}>
            {hoveredId === "blank" || (!hoveredId && !selectedId) ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-3xl border-2 border-dashed border-zinc-300 bg-white flex items-center justify-center shadow-sm">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-zinc-500">Canvas trắng</p>
                <p className="text-[11px] text-zinc-400">Tự do thiết kế từ đầu</p>
              </div>
            ) : WireframeComponent ? (
              <div className="flex flex-col items-center gap-5">
                {/* Phone shell */}
                <div style={{
                  position: "relative",
                  width: 186,
                  flexShrink: 0,
                  animation: "tmPreviewFade 150ms ease-out",
                }} key={previewId}>
                  {/* Outer frame */}
                  <div style={{
                    borderRadius: 36,
                    background: "linear-gradient(160deg, #2D3748 0%, #1A202C 100%)",
                    padding: 6,
                    boxShadow: "0 20px 48px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.08) inset, -3px 0 8px rgba(0,0,0,0.3)",
                  }}>
                    {/* Screen */}
                    <div style={{
                      borderRadius: 30,
                      overflow: "hidden",
                      background: "#fff",
                      height: 372,
                      display: "flex",
                      flexDirection: "column",
                    }}>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <WireframeComponent />
                      </div>
                      {/* Home indicator */}
                      <div style={{ height: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.95)", flexShrink: 0 }}>
                        <div style={{ width: 44, height: 4, background: "#C7C7CC", borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                  {/* Side buttons */}
                  <div style={{ position: "absolute", right: -4, top: 80, width: 4, height: 24, background: "#374151", borderRadius: "0 3px 3px 0" }} />
                  <div style={{ position: "absolute", left: -4, top: 70, width: 4, height: 18, background: "#374151", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", left: -4, top: 96, width: 4, height: 28, background: "#374151", borderRadius: "3px 0 0 3px" }} />
                  <div style={{ position: "absolute", left: -4, top: 130, width: 4, height: 28, background: "#374151", borderRadius: "3px 0 0 3px" }} />
                </div>

                {/* Template info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1.5">
                    <span className="text-lg">{previewTemplate.emoji}</span>
                    <h3 className="text-sm font-bold text-zinc-800">{previewTemplate.name}</h3>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[240px]">
                    {previewTemplate.description}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Apply button */}
          <div className="px-5 pb-5 pt-3 shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)" }}>
            {hoveredId !== "blank" && selectedId ? (
              <button
                onClick={handleApply}
                className="w-full py-2.5 text-white text-[13px] font-semibold rounded-xl transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg, #0068FF, #3B82F6)", boxShadow: "0 4px 12px #0068FF40" }}
              >
                Áp dụng template này →
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
    </>
  )
}

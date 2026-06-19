"use client"

import React from "react"
import { nanoid } from "nanoid"
import { ComponentNode } from "@/types/builder"
import { useBuilderStore } from "@/store/builderStore"

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

  const section = mk("ZaloSection", { title: "Sản phẩm nổi bật", subtitle: "Xem thêm" })
  const grid = mk("Grid", { columns: "2", gap: "4", padding: "4" }, section.id)

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
  nest(section, grid)

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Khám phá", tab2Icon: "🔍", tab2Route: "/kham-pha",
    tab3Label: "Cá nhân", tab3Icon: "👤", tab3Route: "/profile",
    activeTab: "1",
  })

  return build([header, hero, chipRow, section, bnav], all)
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

  const section = mk("ZaloSection", { title: "Mô tả sản phẩm", subtitle: "" })
  const desc = mk("Text", {
    content: "Áo thun Oversized làm từ 100% cotton cao cấp, thoáng mát và thấm hút mồ hôi tốt. Phong cách streetwear hiện đại, phù hợp nhiều dịp từ đi chơi đến dạo phố.",
    tag: "p",
    size: "sm",
    weight: "normal",
    color: "#6B7280",
    align: "left",
  }, section.id)
  nest(section, desc)

  const divider = mk("Divider", { color: "#F3F4F6", thickness: "8px", margin: "none" })

  const progress = mk("ProgressBar", { value: 68, label: "Đã bán 68/100 sản phẩm", color: "#0068FF", bgColor: "#E5E7EB", showLabel: true })

  const btnStack = mk("Stack", { direction: "horizontal", gap: "3", padding: "4", background: "transparent", align: "stretch" })
  const wishBtn = mk("ZaloButton", { label: "❤  Yêu thích", variant: "secondary", fullWidth: false }, btnStack.id)
  const buyBtn = mk("ZaloButton", { label: "Thêm vào giỏ", variant: "primary", fullWidth: true }, btnStack.id)
  nest(btnStack, wishBtn, buyBtn)

  return build([header, image, tagRow, titleText, ratingRow, priceRow, section, divider, progress, btnStack], all)
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

  const settingSection = mk("ZaloSection", { title: "Cài đặt", subtitle: "" })
  const settingCard = mk("ZaloCard", { padding: "md", shadow: true, rounded: "xl" }, settingSection.id)
  const sw1 = mk("Switch", { label: "Nhận thông báo", description: "Đơn hàng, khuyến mãi", checked: true }, settingCard.id)
  const div1 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, settingCard.id)
  const sw2 = mk("Switch", { label: "Giao diện tối", description: "Chế độ Dark mode", checked: false }, settingCard.id)
  const div2 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, settingCard.id)
  const li1 = mk("ZaloListItem", { title: "Ngôn ngữ", subtitle: "Tiếng Việt", showArrow: true, showAvatar: false, avatarText: "" }, settingCard.id)
  const div3 = mk("Divider", { color: "#F3F4F6", thickness: "1px", margin: "none" }, settingCard.id)
  const li2 = mk("ZaloListItem", { title: "Bảo mật & Quyền riêng tư", subtitle: "Xác thực 2 lớp đang bật", showArrow: true, showAvatar: false, avatarText: "" }, settingCard.id)
  nest(settingCard, sw1, div1, sw2, div2, li1, div3, li2)
  nest(settingSection, settingCard)

  const logoutBtn = mk("ZaloButton", { label: "Đăng xuất", variant: "tertiary", fullWidth: true })

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Khám phá", tab2Icon: "🔍", tab2Route: "/kham-pha",
    tab3Label: "Cá nhân", tab3Icon: "👤", tab3Route: "/profile",
    activeTab: "3",
  })

  return build([header, profileCard, statGrid, settingSection, logoutBtn, bnav], all)
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

  const summarySection = mk("ZaloSection", { title: "Tổng đơn hàng", subtitle: "" })
  const summaryCard = mk("ZaloCard", { padding: "md", shadow: true, rounded: "xl" }, summarySection.id)
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
  nest(summarySection, summaryCard)

  const checkoutBtn = mk("ZaloButton", { label: "Đặt hàng ngay", variant: "primary", fullWidth: true })

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Khám phá", tab2Icon: "🔍", tab2Route: "/kham-pha",
    tab3Label: "Giỏ hàng", tab3Icon: "🛒", tab3Route: "/gio-hang",
    activeTab: "3",
  })

  return build([header, list, voucherCard, summarySection, checkoutBtn, bnav], all)
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

  const progressSection = mk("ZaloSection", { title: "Mục tiêu tháng", subtitle: "Xem chi tiết" })
  const progressCard = mk("ZaloCard", { padding: "md", shadow: true, rounded: "xl" }, progressSection.id)
  const pb1 = mk("ProgressBar", { label: "Doanh thu", value: 72, color: "#0068FF", showLabel: true }, progressCard.id)
  const pb2 = mk("ProgressBar", { label: "Đơn hàng", value: 85, color: "#059669", showLabel: true }, progressCard.id)
  const pb3 = mk("ProgressBar", { label: "Khách mới", value: 48, color: "#F59E0B", showLabel: true }, progressCard.id)
  nest(progressCard, pb1, pb2, pb3)
  nest(progressSection, progressCard)

  const recentSection = mk("ZaloSection", { title: "Đơn hàng gần đây", subtitle: "Xem tất cả" })
  const recentList = mk("ZaloList", {}, recentSection.id)
  const recentItems = [
    { title: "#DH2024088 — Áo thun Oversized", subtitle: "Đang giao · 129.000đ", icon: "🚚" },
    { title: "#DH2024087 — Quần jeans slim", subtitle: "Hoàn thành · 349.000đ", icon: "✅" },
    { title: "#DH2024086 — Giày sneaker", subtitle: "Chờ xác nhận · 529.000đ", icon: "⏳" },
  ].map(({ title, subtitle }) =>
    mk("ZaloListItem", { title, subtitle, showArrow: true, showAvatar: false, avatarText: "" }, recentList.id)
  )
  nest(recentList, ...recentItems)
  nest(recentSection, recentList)

  const bnav = mk("ZaloBottomNav", {
    tab1Label: "Dashboard", tab1Icon: "📊", tab1Route: "/",
    tab2Label: "Đơn hàng", tab2Icon: "📦", tab2Route: "/don-hang",
    tab3Label: "Cá nhân", tab3Icon: "👤", tab3Route: "/profile",
    activeTab: "1",
  })

  return build([header, greeting, subGreeting, kpiGrid, progressSection, recentSection, bnav], all)
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
    { value: "80K", label: "✂️ Cắt tóc", color: "#7C3AED" },
    { value: "250K", label: "🎨 Nhuộm tóc", color: "#7C3AED" },
    { value: "150K", label: "💆 Massage", color: "#7C3AED" },
    { value: "120K", label: "💅 Làm nail", color: "#7C3AED" },
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
              filtered.map((t) => (
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
    </>
  )
}

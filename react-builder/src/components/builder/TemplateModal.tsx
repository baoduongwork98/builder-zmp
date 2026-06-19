"use client"

import React, { useState } from "react"
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
    content: "Thứ Năm, 19/06/2026 · Cửa hàng đang hoạt động tốt",
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

// ─── TemplateModal ────────────────────────────────────────────────────────────

interface TemplateModalProps {
  onClose: () => void
}

type CategoryFilter = "all" | "ecommerce" | "auth" | "analytics" | "social" | "services"

export function TemplateModal({ onClose }: TemplateModalProps) {
  const loadTemplate = useBuilderStore((s) => s.loadTemplate)
  const [hovered, setHovered] = useState<string | null>(null)
  const [category, setCategory] = useState<CategoryFilter>("all")

  function handleSelect(template: Template) {
    const { nodes, rootIds } = template.build()
    loadTemplate(nodes, rootIds)
    onClose()
  }

  const filtered = category === "all" ? TEMPLATES : TEMPLATES.filter((t) => t.category === category)

  const FILTER_TABS: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "ecommerce", label: "E-commerce" },
    { key: "social", label: "Social" },
    { key: "auth", label: "Auth" },
    { key: "analytics", label: "Analytics" },
    { key: "services", label: "Services" },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-800">Chọn template</h2>
              <p className="text-[12px] text-zinc-400 mt-0.5">{TEMPLATES.length} layouts sẵn có — nhấn để áp dụng ngay</p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {/* Category filter */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={`shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${
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

        {/* Templates grid */}
        <div className="overflow-y-auto flex-1 p-4 scrollbar-hide">
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-150 group ${
                  hovered === t.id
                    ? "border-[#0068FF] bg-blue-50/70 shadow-lg shadow-blue-100"
                    : "border-zinc-100 hover:border-zinc-200 bg-white"
                }`}
              >
                {/* Emoji + name + category */}
                <div className="flex items-start gap-3 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                    hovered === t.id ? "bg-[#0068FF]/10" : "bg-zinc-100"
                  }`}>
                    {t.emoji}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="text-[13px] font-semibold text-zinc-800 mb-1 truncate">{t.name}</div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[t.category]}`}>
                      {CATEGORY_LABELS[t.category]}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-400 leading-relaxed">{t.description}</div>
                {hovered === t.id && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#0068FF]">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    Áp dụng template này
                  </div>
                )}
              </button>
            ))}

            {/* Blank option */}
            <button
              onClick={onClose}
              onMouseEnter={() => setHovered("blank")}
              onMouseLeave={() => setHovered(null)}
              className={`text-left p-4 rounded-xl border-2 border-dashed transition-all duration-150 ${
                hovered === "blank" ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zinc-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div className="pt-0.5">
                  <div className="text-[13px] font-semibold text-zinc-500 mb-1">Canvas trắng</div>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border text-zinc-400 bg-zinc-50 border-zinc-200">Custom</span>
                </div>
              </div>
              <div className="text-[11px] text-zinc-400 leading-relaxed">Tự do thiết kế từ trang rỗng</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

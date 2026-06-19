import { JSX } from "react"
import {
  RiLayoutLine,
  RiMenuLine,
  RiApps2Line,
  RiSquareLine,
  RiListUnordered,
  RiUserLine,
  RiPriceTag3Line,
  RiCursorLine,
  RiInputMethodLine,
  RiSearchLine,
  RiLayoutRowLine,
  RiLayoutBottomLine,
  RiFileTextLine,
  RiImageLine,
  RiLayoutGridLine,
  RiArrowUpDownLine,
  RiAlertLine,
  RiBarChartHorizontalLine,
  RiToggleLine,
  RiStarLine,
  RiEditBoxLine,
  RiFilterLine,
  RiStackLine,
  RiListCheck,
  // New icons for upgraded renderers
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiHomeLine,
  RiShoppingCartLine,
  RiHeartLine,
  RiSettings3Line,
  RiShoppingBag3Line,
  RiMoneyDollarCircleLine,
  RiBarChartLine,
  RiInformationLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from "react-icons/ri"
import { ComponentDefinition } from "@/types/builder"

const ind = (n: number) => "  ".repeat(n)

const tk = {
  shadow: {
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)",
    md: "0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.10)",
    lg: "0 4px 16px rgba(0,0,0,0.10), 0 16px 40px rgba(0,0,0,0.12)",
  },
  border: "1px solid rgba(0,0,0,0.06)",
  radius: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },
  accent: "#0068FF",
  accentGrad: "linear-gradient(135deg, #0068FF 0%, #0084FF 100%)",
  accentLight: "rgba(0,104,255,0.08)",
  accentShadow: "0 4px 12px rgba(0,104,255,0.28)",
  surface: "#FFFFFF",
  surfaceSub: "#F8F9FA",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
}

// ─── Generic components ────────────────────────────────────────────────────

const textDef: ComponentDefinition = {
  type: "Text",
  label: "Text",
  icon: RiFileTextLine,
  description: "Khối văn bản tùy chỉnh — tiêu đề, đoạn văn, span",
  category: "ui",
  acceptsChildren: false,
  zmpComponent: "Text",
  zmpImports: [],
  defaultProps: { content: "Edit this text", tag: "p", size: "base", weight: "normal", color: "#111827", align: "left" },
  propSchema: {
    content: { label: "Content", type: "textarea", defaultValue: "Edit this text" },
    tag: { label: "Tag", type: "select", defaultValue: "p", options: ["p", "h1", "h2", "h3", "h4", "span"] },
    size: { label: "Size", type: "select", defaultValue: "base", options: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"] },
    weight: { label: "Weight", type: "select", defaultValue: "normal", options: ["normal", "medium", "semibold", "bold"] },
    color: { label: "Color", type: "color", defaultValue: "#111827" },
    align: { label: "Align", type: "select", defaultValue: "left", options: ["left", "center", "right"] },
  },
  renderer: (props) => {
    const Tag = (props.tag as keyof JSX.IntrinsicElements) ?? "p"
    return (
      <Tag
        className={`text-${props.size as string} font-${props.weight as string} text-${props.align as string}`}
        style={{ color: props.color as string, lineHeight: 1.6 }}
      >
        {props.content as string}
      </Tag>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const tag = (props.tag as string) ?? "p"
    return `${ind(level)}<${tag} className="text-${props.size} font-${props.weight} text-${props.align}" style={{ color: "${props.color}" }}>${props.content}</${tag}>`
  },
}

const imageDef: ComponentDefinition = {
  type: "Image",
  label: "Image",
  icon: RiImageLine,
  description: "Hình ảnh với tùy chọn bo góc và object-fit",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { src: "https://placehold.co/600x300", alt: "Image", rounded: "md", objectFit: "cover", width: "100%", height: "180px" },
  propSchema: {
    src: { label: "URL ảnh", type: "string", defaultValue: "https://placehold.co/600x300" },
    alt: { label: "Alt text", type: "string", defaultValue: "Image" },
    rounded: { label: "Bo góc", type: "select", defaultValue: "md", options: ["none", "sm", "md", "lg", "xl", "full"] },
    objectFit: { label: "Object fit", type: "select", defaultValue: "cover", options: ["cover", "contain", "fill", "none"] },
    width: { label: "Width", type: "string", defaultValue: "100%" },
    height: { label: "Height", type: "string", defaultValue: "180px" },
  },
  renderer: (props) => (
    <div
      style={{
        width: props.width as string,
        height: props.height as string,
        borderRadius: ({
          none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
        } as Record<string, number>)[props.rounded as string] ?? 8,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.src as string}
        alt={props.alt as string}
        className={`w-full h-full object-${props.objectFit as string}`}
      />
    </div>
  ),
  toJSX: (props, _renderChildren, level) =>
    `${ind(level)}<img src="${props.src}" alt="${props.alt}" className="rounded-${props.rounded} object-${props.objectFit}" style={{ width: "${props.width}", height: "${props.height}" }} />`,
}

const stackGapMap: Record<string, string> = { "0": "0", "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px", "12": "48px" }
const stackPadMap: Record<string, string> = { "0": "0", "2": "8px", "4": "16px", "6": "24px", "8": "32px" }

const stackDef: ComponentDefinition = {
  type: "Stack",
  label: "Stack",
  icon: RiStackLine,
  description: "Container xếp chồng dọc hoặc ngang với gap tùy chỉnh",
  category: "layout",
  acceptsChildren: true,
  zmpImports: ["Box"],
  defaultProps: { direction: "vertical", gap: "4", align: "stretch", padding: "0", background: "transparent" },
  propSchema: {
    direction: { label: "Direction", type: "toggle", defaultValue: "vertical", options: ["vertical", "horizontal"] },
    gap: { label: "Gap", type: "select", defaultValue: "4", options: ["0", "1", "2", "3", "4", "6", "8", "12"] },
    align: { label: "Align", type: "select", defaultValue: "stretch", options: ["start", "center", "end", "stretch"] },
    padding: { label: "Padding", type: "select", defaultValue: "0", options: ["0", "2", "4", "6", "8"] },
    background: { label: "Background", type: "color", defaultValue: "transparent" },
  },
  renderer: (props, children) => (
    <div
      className="flex min-h-10"
      style={{
        flexDirection: props.direction === "horizontal" ? "row" : "column",
        gap: stackGapMap[props.gap as string] ?? "16px",
        alignItems: props.align as string,
        padding: stackPadMap[props.padding as string] ?? "0",
        background: props.background as string,
      }}
    >
      {children ?? (
        <div
          className="flex flex-col items-center justify-center gap-1 py-4 rounded-lg w-full"
          style={{ border: "2px dashed rgba(0,104,255,0.2)" }}
        >
          <span className="text-xs font-medium" style={{ color: "rgba(0,104,255,0.4)" }}>
            Thả component vào đây
          </span>
        </div>
      )}
    </div>
  ),
  toJSX: (props, renderChildren, level) => {
    const direction = props.direction === "horizontal" ? "flex-row" : "flex-col"
    const className = `flex ${direction} gap-${props.gap} items-${props.align} p-${props.padding}`
    const children = renderChildren(level + 1)
    const styleAttr = props.background && props.background !== "transparent"
      ? ` style={{ background: "${props.background}" }}`
      : ""
    if (!children) return `${ind(level)}<Box className="${className}"${styleAttr} />`
    return `${ind(level)}<Box className="${className}"${styleAttr}>\n${children}\n${ind(level)}</Box>`
  },
}

const dividerDef: ComponentDefinition = {
  type: "Divider",
  label: "Divider",
  icon: RiLayoutBottomLine,
  description: "Đường kẻ phân cách giữa các phần nội dung",
  category: "layout",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { color: "#e5e7eb", thickness: "1px", margin: "md" },
  propSchema: {
    color: { label: "Màu", type: "color", defaultValue: "#e5e7eb" },
    thickness: { label: "Độ dày", type: "string", defaultValue: "1px" },
    margin: { label: "Margin", type: "select", defaultValue: "md", options: ["none", "sm", "md", "lg"] },
  },
  renderer: (props) => {
    const marginClass: Record<string, string> = { none: "my-0", sm: "my-2", md: "my-4", lg: "my-8" }
    return (
      <div
        className={`w-full ${marginClass[props.margin as string] ?? "my-4"}`}
        style={{
          height: props.thickness as string,
          background: props.color as string,
          opacity: 0.5,
          borderRadius: 9999,
        }}
      />
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const marginMap: Record<string, string> = { none: "my-0", sm: "my-2", md: "my-4", lg: "my-8" }
    const marginClass = marginMap[props.margin as string] ?? "my-4"
    return `${ind(level)}<hr className="${marginClass}" style={{ borderColor: "${props.color}", borderTopWidth: "${props.thickness}" }} />`
  },
}

// ─── Zalo-specific components ────────────────────────────────────────────────

const zaloBtnDef: ComponentDefinition = {
  type: "ZaloButton",
  label: "Button",
  icon: RiCursorLine,
  description: "Nút bấm với kiểu primary, secondary hoặc tertiary",
  category: "zalo",
  acceptsChildren: false,
  zmpComponent: "Button",
  zmpImports: ["Button"],
  defaultProps: { label: "Xác nhận", variant: "primary", fullWidth: false },
  propSchema: {
    label: { label: "Label", type: "string", defaultValue: "Xác nhận" },
    variant: { label: "Variant", type: "select", defaultValue: "primary", options: ["primary", "secondary", "tertiary"] },
    fullWidth: { label: "Full width", type: "boolean", defaultValue: false },
  },
  renderer: (props) => {
    const base = `font-semibold transition-all active:scale-[0.97] ${props.fullWidth ? "w-full" : ""}`
    const style: React.CSSProperties = {
      borderRadius: tk.radius.md,
      fontSize: 15,
      letterSpacing: "-0.1px",
      padding: "12px 20px",
    }

    if ((props.variant as string) === "primary") {
      return (
        <button
          className={base}
          style={{ ...style, background: tk.accentGrad, color: "white", boxShadow: tk.accentShadow }}
        >
          {props.label as string}
        </button>
      )
    }
    if ((props.variant as string) === "secondary") {
      return (
        <button
          className={base}
          style={{ ...style, background: tk.surface, color: tk.accent, border: "1.5px solid rgba(0,104,255,0.25)" }}
        >
          {props.label as string}
        </button>
      )
    }
    return (
      <button className={`${base} bg-transparent`} style={{ ...style, color: tk.accent }}>
        <span className="underline underline-offset-2">{props.label as string}</span>
      </button>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const fullWidthProp = props.fullWidth ? " fullWidth" : ""
    return `${ind(level)}<Button variant="${props.variant}"${fullWidthProp}>${props.label}</Button>`
  },
}

const zaloInputDef: ComponentDefinition = {
  type: "ZaloInput",
  label: "Input",
  icon: RiInputMethodLine,
  description: "Ô nhập liệu có label, placeholder và validation",
  category: "zalo",
  acceptsChildren: false,
  zmpComponent: "Input",
  zmpImports: ["Input"],
  defaultProps: { label: "Họ và tên", placeholder: "Nhập thông tin...", type: "text", required: false },
  propSchema: {
    label: { label: "Label", type: "string", defaultValue: "Họ và tên" },
    placeholder: { label: "Placeholder", type: "string", defaultValue: "Nhập thông tin..." },
    type: { label: "Type", type: "select", defaultValue: "text", options: ["text", "email", "password", "number", "tel"] },
    required: { label: "Bắt buộc", type: "boolean", defaultValue: false },
  },
  renderer: (props) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium" style={{ color: tk.textSecondary }}>
        {props.label as string}
        {(props.required as boolean) && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className="flex items-center gap-2 bg-white"
        style={{ border: tk.border, borderRadius: tk.radius.md, padding: "10px 14px" }}
      >
        <RiUserLine style={{ fontSize: 16, color: tk.textTertiary, flexShrink: 0 }} />
        <input
          type={props.type as string}
          placeholder={props.placeholder as string}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: 14, color: tk.textPrimary }}
        />
      </div>
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    const requiredProp = props.required ? " required" : ""
    return `${ind(level)}<Input label="${props.label}" type="${props.type}" placeholder="${props.placeholder}"${requiredProp} />`
  },
}

const zaloHeaderDef: ComponentDefinition = {
  type: "ZaloHeader",
  label: "Header",
  icon: RiMenuLine,
  description: "Thanh tiêu đề cố định trên cùng của trang ZMP",
  category: "zalo",
  acceptsChildren: false,
  zmpComponent: "Header",
  zmpImports: ["Header"],
  defaultProps: { title: "Tiêu đề trang", showBack: true, bgColor: "#0068FF" },
  propSchema: {
    title: { label: "Tiêu đề", type: "string", defaultValue: "Tiêu đề trang" },
    showBack: { label: "Nút quay lại", type: "boolean", defaultValue: true },
    bgColor: { label: "Màu nền", type: "color", defaultValue: "#0068FF" },
  },
  renderer: (props) => (
    <div
      className="flex items-center gap-3 px-4 shrink-0"
      style={{
        background:
          (props.bgColor as string) === "#0068FF"
            ? tk.accentGrad
            : (props.bgColor as string),
        height: 44,
      }}
    >
      {(props.showBack as boolean) && (
        <RiArrowLeftSLine style={{ fontSize: 26, color: "white", flexShrink: 0 }} />
      )}
      <span
        className="flex-1 text-white font-semibold truncate"
        style={{ fontSize: 15, letterSpacing: "-0.2px" }}
      >
        {props.title as string}
      </span>
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    // zmp-ui Header uses showBackIcon and backgroundColor (not showBack/bgColor)
    const showBackProp = props.showBack === false ? ` showBackIcon={false}` : ""
    return `${ind(level)}<Header title="${props.title}"${showBackProp} backgroundColor="${props.bgColor}" />`
  },
}

const emojiIconMap: Record<string, React.ElementType> = {
  "🏠": RiHomeLine,
  "🔍": RiSearchLine,
  "👤": RiUserLine,
  "⭐": RiStarLine,
  "🛒": RiShoppingCartLine,
  "❤️": RiHeartLine,
  "⚙️": RiSettings3Line,
}

const zaloBottomNavDef: ComponentDefinition = {
  type: "ZaloBottomNav",
  label: "BottomNav",
  icon: RiApps2Line,
  description: "Thanh điều hướng dưới cùng với tối đa 3 tab — có thể gán route cho từng tab",
  category: "zalo",
  acceptsChildren: false,
  zmpComponent: "BottomNavigation",
  zmpImports: ["BottomNavigation"],
  defaultProps: {
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Tìm kiếm", tab2Icon: "🔍", tab2Route: "",
    tab3Label: "Tài khoản", tab3Icon: "👤", tab3Route: "",
    activeTab: "1",
  },
  propSchema: {
    tab1Icon: { label: "Tab 1 icon", type: "string", defaultValue: "🏠" },
    tab1Label: { label: "Tab 1 label", type: "string", defaultValue: "Trang chủ" },
    tab1Route: { label: "Tab 1 → Trang", type: "page-select", defaultValue: "/" },
    tab2Icon: { label: "Tab 2 icon", type: "string", defaultValue: "🔍" },
    tab2Label: { label: "Tab 2 label", type: "string", defaultValue: "Tìm kiếm" },
    tab2Route: { label: "Tab 2 → Trang", type: "page-select", defaultValue: "" },
    tab3Icon: { label: "Tab 3 icon", type: "string", defaultValue: "👤" },
    tab3Label: { label: "Tab 3 label", type: "string", defaultValue: "Tài khoản" },
    tab3Route: { label: "Tab 3 → Trang", type: "page-select", defaultValue: "" },
    activeTab: { label: "Tab active", type: "select", defaultValue: "1", options: ["1", "2", "3"] },
  },
  renderer: (props) => {
    const tabs = [
      { icon: props.tab1Icon as string, label: props.tab1Label as string, key: "1" },
      { icon: props.tab2Icon as string, label: props.tab2Label as string, key: "2" },
      { icon: props.tab3Icon as string, label: props.tab3Label as string, key: "3" },
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
          const isActive = props.activeTab === tab.key
          const IconComp = emojiIconMap[tab.icon]
          return (
            <div key={tab.key} className="flex flex-col items-center gap-0.5 flex-1 relative pt-1">
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
  // BottomNavigation.Item with onClick navigate when routes are set
  toJSX: (props, _renderChildren, level) => {
    const item = (label: string, key: string, route: string) => {
      const onClick = route ? ` onClick={() => navigate("${route}")}` : ""
      return `${ind(level + 1)}<BottomNavigation.Item label="${label}" itemKey="${key}"${onClick} />`
    }
    return [
      `${ind(level)}<BottomNavigation activeKey="${props.activeTab}">`,
      item(props.tab1Label as string, "1", (props.tab1Route as string) ?? ""),
      item(props.tab2Label as string, "2", (props.tab2Route as string) ?? ""),
      item(props.tab3Label as string, "3", (props.tab3Route as string) ?? ""),
      `${ind(level)}</BottomNavigation>`,
    ].join("\n")
  },
}

const zaloCardDef: ComponentDefinition = {
  type: "ZaloCard",
  label: "Card",
  icon: RiSquareLine,
  description: "Khung card nền trắng có bo góc và shadow",
  category: "zalo",
  acceptsChildren: true,
  zmpComponent: "Box",
  zmpImports: ["Box"],
  defaultProps: { padding: "md", shadow: true, rounded: "xl" },
  propSchema: {
    padding: { label: "Padding", type: "select", defaultValue: "md", options: ["none", "sm", "md", "lg"] },
    shadow: { label: "Shadow", type: "boolean", defaultValue: true },
    rounded: { label: "Bo góc", type: "select", defaultValue: "xl", options: ["none", "md", "lg", "xl", "2xl"] },
  },
  renderer: (props, children) => {
    const paddingMap: Record<string, string> = { none: "p-0", sm: "p-3", md: "p-4", lg: "p-5" }
    const radiusMap: Record<string, number> = { none: 0, md: 12, lg: 16, xl: 18, "2xl": 24 }
    return (
      <div
        className={`bg-white ${paddingMap[props.padding as string] ?? "p-4"} min-h-[40px]`}
        style={{
          borderRadius: radiusMap[props.rounded as string] ?? 18,
          border: tk.border,
          boxShadow: props.shadow ? tk.shadow.sm : "none",
        }}
      >
        {children ?? (
          <span className="text-xs" style={{ color: tk.textTertiary }}>
            Thả component vào đây
          </span>
        )}
      </div>
    )
  },
  toJSX: (props, renderChildren, level) => {
    const paddingMap: Record<string, string> = { none: "p-0", sm: "p-3", md: "p-4", lg: "p-6" }
    const paddingClass = paddingMap[props.padding as string] ?? "p-4"
    const shadowClass = props.shadow ? " shadow-sm" : ""
    const className = `bg-white rounded-${props.rounded}${shadowClass} ${paddingClass}`.trim()
    const children = renderChildren(level + 1)
    if (!children) return `${ind(level)}<Box className="${className}" />`
    return `${ind(level)}<Box className="${className}">\n${children}\n${ind(level)}</Box>`
  },
}

const zaloListDef: ComponentDefinition = {
  type: "ZaloList",
  label: "List",
  icon: RiListCheck,
  description: "Danh sách các mục — kéo thả ZaloListItem vào bên trong",
  category: "zalo",
  acceptsChildren: true,
  zmpComponent: "List",
  zmpImports: ["List"],
  defaultProps: {},
  propSchema: {},
  renderer: (_props, children) => (
    <div
      className="bg-white overflow-hidden"
      style={{
        borderRadius: tk.radius.xl,
        border: tk.border,
        boxShadow: tk.shadow.xs,
      }}
    >
      {children ?? (
        <>
          {[
            { title: "Mục thứ nhất", sub: "Mô tả ngắn gọn" },
            { title: "Mục thứ hai", sub: "Mô tả ngắn gọn" },
            { title: "Mục thứ ba", sub: "Mô tả ngắn gọn" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold truncate" style={{ color: tk.textPrimary }}>
                  {item.title}
                </p>
                <p className="text-[12px] truncate mt-0.5" style={{ color: tk.textSecondary }}>
                  {item.sub}
                </p>
              </div>
              <RiArrowRightSLine style={{ fontSize: 20, color: tk.textTertiary, flexShrink: 0 }} />
            </div>
          ))}
        </>
      )}
    </div>
  ),
  toJSX: (_props, renderChildren, level) => {
    const children = renderChildren(level + 1)
    if (!children) return `${ind(level)}<List />`
    return `${ind(level)}<List>\n${children}\n${ind(level)}</List>`
  },
}

const zaloListItemDef: ComponentDefinition = {
  type: "ZaloListItem",
  label: "List Item",
  icon: RiListUnordered,
  description: "Mục danh sách với tiêu đề, mô tả và tùy chọn avatar",
  category: "zalo",
  acceptsChildren: false,
  zmpComponent: "List",
  zmpImports: ["List"],
  defaultProps: { title: "Tên mục", subtitle: "Mô tả ngắn", showArrow: true, showAvatar: false, avatarText: "Z" },
  propSchema: {
    title: { label: "Tiêu đề", type: "string", defaultValue: "Tên mục" },
    subtitle: { label: "Mô tả", type: "string", defaultValue: "Mô tả ngắn" },
    showArrow: { label: "Hiện mũi tên", type: "boolean", defaultValue: true },
    showAvatar: { label: "Hiện avatar", type: "boolean", defaultValue: false },
    avatarText: { label: "Avatar text", type: "string", defaultValue: "Z" },
  },
  renderer: (props) => (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-white"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
    >
      {(props.showAvatar as boolean) && (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, #0068FF, #7C3AED)",
            boxShadow: "0 0 0 2px white, 0 0 0 4px rgba(0,104,255,0.15)",
          }}
        >
          {props.avatarText as string}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: tk.textPrimary }}>
          {props.title as string}
        </p>
        {(props.subtitle as string) && (
          <p className="text-[12px] truncate mt-0.5" style={{ color: tk.textSecondary }}>
            {props.subtitle as string}
          </p>
        )}
      </div>
      {(props.showArrow as boolean) && (
        <RiArrowRightSLine style={{ fontSize: 20, color: tk.textTertiary, flexShrink: 0 }} />
      )}
    </div>
  ),
  // zmp-ui uses List.Item (compound component) with title, subTitle, suffix
  toJSX: (props, _renderChildren, level) => {
    const subTitleProp = props.subtitle ? ` subTitle="${props.subtitle}"` : ""
    const arrowSuffix = props.showArrow ? ` suffix={<span style={{ fontSize: 18, color: "#9ca3af" }}>›</span>}` : ""
    return `${ind(level)}<List.Item title="${props.title}"${subTitleProp}${arrowSuffix} />`
  },
}

const zaloAvatarDef: ComponentDefinition = {
  type: "ZaloAvatar",
  label: "Avatar",
  icon: RiUserLine,
  description: "Ảnh đại diện hình tròn với fallback initials",
  category: "zalo",
  acceptsChildren: false,
  zmpComponent: "Avatar",
  zmpImports: ["Avatar"],
  defaultProps: { src: "", name: "Nguyễn Văn A", size: "md", showName: true },
  propSchema: {
    src: { label: "URL ảnh", type: "string", defaultValue: "" },
    name: { label: "Tên", type: "string", defaultValue: "Nguyễn Văn A" },
    size: { label: "Kích thước", type: "select", defaultValue: "md", options: ["sm", "md", "lg", "xl"] },
    showName: { label: "Hiện tên", type: "boolean", defaultValue: true },
  },
  renderer: (props) => {
    const sizeClass: Record<string, string> = {
      sm: "w-8 h-8 text-xs",
      md: "w-12 h-12 text-sm",
      lg: "w-16 h-16 text-base",
      xl: "w-20 h-20 text-lg",
    }
    const initials = (props.name as string)
      .split(" ")
      .map((n: string) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase()
    return (
      <div className="flex flex-col items-center gap-2">
        {(props.src as string) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.src as string}
            alt={props.name as string}
            className={`${sizeClass[props.size as string]} rounded-full object-cover`}
            style={{ boxShadow: "0 0 0 2px white, 0 0 0 4px rgba(0,104,255,0.2)" }}
          />
        ) : (
          <div
            className={`${sizeClass[props.size as string]} rounded-full flex items-center justify-center text-white font-bold`}
            style={{
              background: "linear-gradient(135deg, #0068FF 0%, #7C3AED 100%)",
              boxShadow: "0 0 0 2px white, 0 0 0 4px rgba(0,104,255,0.2)",
            }}
          >
            {initials}
          </div>
        )}
        {(props.showName as boolean) && (
          <span className="text-[13px] font-semibold" style={{ color: tk.textPrimary }}>
            {props.name as string}
          </span>
        )}
      </div>
    )
  },
  // zmp-ui Avatar: size is numeric (px), no showName/name props — wrap in div for the name label
  toJSX: (props, _renderChildren, level) => {
    const sizeMap: Record<string, number> = { sm: 32, md: 48, lg: 64, xl: 80 }
    const size = sizeMap[props.size as string] ?? 48
    const srcProp = props.src ? ` src="${props.src}"` : ""
    const avatarTag = `${ind(level + 1)}<Avatar${srcProp} size={${size}} />`
    if (!props.showName) return avatarTag.trimStart() === avatarTag ? `${ind(level)}<Avatar${srcProp} size={${size}} />` : avatarTag
    return [
      `${ind(level)}<div className="flex flex-col items-center gap-2">`,
      `${ind(level + 1)}<Avatar${srcProp} size={${size}} />`,
      `${ind(level + 1)}<span className="text-sm font-medium text-gray-800">${props.name}</span>`,
      `${ind(level)}</div>`,
    ].join("\n")
  },
}

const zaloTagDef: ComponentDefinition = {
  type: "ZaloTag",
  label: "Tag",
  icon: RiPriceTag3Line,
  description: "Nhãn phân loại màu sắc — blue, green, red, v.v.",
  category: "zalo",
  acceptsChildren: false,
  // zmp-ui has no Tag component — render as a plain styled span
  zmpImports: [],
  defaultProps: { label: "Mới", color: "blue" },
  propSchema: {
    label: { label: "Label", type: "string", defaultValue: "Mới" },
    color: { label: "Màu", type: "select", defaultValue: "blue", options: ["blue", "green", "red", "yellow", "purple", "gray"] },
  },
  renderer: (props) => {
    const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
      blue:   { bg: "rgba(0,104,255,0.08)",   text: "#0068FF",  dot: "#0068FF" },
      green:  { bg: "rgba(16,185,129,0.08)",   text: "#059669",  dot: "#10B981" },
      red:    { bg: "rgba(239,68,68,0.08)",    text: "#DC2626",  dot: "#EF4444" },
      yellow: { bg: "rgba(245,158,11,0.08)",   text: "#B45309",  dot: "#F59E0B" },
      purple: { bg: "rgba(124,58,237,0.08)",   text: "#7C3AED",  dot: "#7C3AED" },
      gray:   { bg: "rgba(107,114,128,0.08)",  text: "#4B5563",  dot: "#9CA3AF" },
    }
    const c = colorMap[props.color as string] ?? colorMap.blue
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold"
        style={{ background: c.bg, color: c.text }}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
        {props.label as string}
      </span>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-50 text-[#0068FF] border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      red: "bg-red-50 text-red-700 border-red-200",
      yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
    }
    const colorClass = colorMap[props.color as string] ?? colorMap.blue
    return `${ind(level)}<span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${colorClass}">${props.label}</span>`
  },
}

const zaloSearchBarDef: ComponentDefinition = {
  type: "ZaloSearchBar",
  label: "Search",
  icon: RiSearchLine,
  description: "Thanh tìm kiếm với placeholder tùy chỉnh",
  category: "zalo",
  acceptsChildren: false,
  zmpImports: ["Input"],
  defaultProps: { placeholder: "Tìm kiếm..." },
  propSchema: {
    placeholder: { label: "Placeholder", type: "string", defaultValue: "Tìm kiếm..." },
  },
  renderer: (props) => (
    <div
      className="flex items-center gap-2 mx-4"
      style={{
        background: "rgba(0,0,0,0.05)",
        borderRadius: tk.radius.md,
        padding: "10px 12px",
      }}
    >
      <RiSearchLine style={{ fontSize: 15, color: tk.textTertiary, flexShrink: 0 }} />
      <input
        type="text"
        placeholder={props.placeholder as string}
        className="flex-1 bg-transparent outline-none"
        style={{ fontSize: 14, color: tk.textSecondary }}
      />
    </div>
  ),
  toJSX: (props, _renderChildren, level) =>
    `${ind(level)}<Input.Search placeholder="${props.placeholder}" />`,
}

const zaloSectionDef: ComponentDefinition = {
  type: "ZaloSection",
  label: "Section",
  icon: RiLayoutRowLine,
  description: "Tiêu đề mục với link 'xem thêm' tùy chọn",
  category: "zalo",
  acceptsChildren: true,
  // No Section in zmp-ui — generates plain HTML with Tailwind
  zmpImports: [],
  defaultProps: { title: "Tiêu đề mục", subtitle: "" },
  propSchema: {
    title: { label: "Tiêu đề", type: "string", defaultValue: "Tiêu đề mục" },
    subtitle: { label: "Xem thêm link", type: "string", defaultValue: "" },
  },
  renderer: (props, children) => (
    <div className="flex flex-col">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: props.subtitle ? "1px solid rgba(0,0,0,0.05)" : "none" }}
      >
        <span
          className="font-semibold"
          style={{ fontSize: 15, letterSpacing: "-0.2px", color: tk.textPrimary }}
        >
          {props.title as string}
        </span>
        {(props.subtitle as string) && (
          <span
            className="flex items-center gap-0.5 text-[13px] font-medium"
            style={{ color: tk.accent }}
          >
            {props.subtitle as string}
            <RiArrowRightSLine style={{ fontSize: 16 }} />
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  ),
  // Children are nested two levels deep (section > content-div > children)
  toJSX: (props, renderChildren, level) => {
    const i0 = ind(level)
    const i1 = ind(level + 1)
    const i2 = ind(level + 2)
    const linkSpan = props.subtitle
      ? `\n${i2}<span className="text-xs text-[#0068FF]">${props.subtitle}</span>`
      : ""
    const header = `${i1}<div className="flex items-center justify-between px-4 py-3">\n${i2}<span className="text-sm font-semibold text-gray-900">${props.title}</span>${linkSpan}\n${i1}</div>`
    const children = renderChildren(level + 2)
    const content = children ? `\n${i1}<div>\n${children}\n${i1}</div>` : ""
    return `${i0}<div className="flex flex-col">\n${header}${content}\n${i0}</div>`
  },
}

const zaloPageDef: ComponentDefinition = {
  type: "ZaloPage",
  label: "Page",
  icon: RiLayoutLine,
  description: "Trang chính của ứng dụng ZMP — wrapper cho toàn bộ nội dung",
  category: "zalo",
  acceptsChildren: true,
  zmpComponent: "Page",
  zmpImports: ["Page"],
  defaultProps: { bgColor: "#F4F4F4", padding: "none" },
  propSchema: {
    bgColor: { label: "Màu nền", type: "color", defaultValue: "#F4F4F4" },
    padding: { label: "Padding", type: "select", defaultValue: "none", options: ["none", "sm", "md", "lg"] },
  },
  renderer: (props, children) => {
    const paddingClass: Record<string, string> = { none: "p-0", sm: "p-3", md: "p-4", lg: "p-6" }
    return (
      <div
        className={`flex flex-col min-h-full w-full ${paddingClass[props.padding as string] ?? "p-0"}`}
        style={{ backgroundColor: props.bgColor as string }}
      >
        {children ?? (
          <div className="flex flex-col items-center justify-center gap-1 py-8"
            style={{ border: "2px dashed rgba(0,104,255,0.15)", borderRadius: tk.radius.lg, margin: 16 }}>
            <span className="text-xs font-medium" style={{ color: "rgba(0,104,255,0.4)" }}>
              Thả component vào đây
            </span>
          </div>
        )}
      </div>
    )
  },
  toJSX: (props, renderChildren, level) => {
    const paddingMap: Record<string, string> = { none: "", sm: " p-3", md: " p-4", lg: " p-6" }
    const paddingClass = paddingMap[props.padding as string] ?? ""
    const className = `flex flex-col min-h-full w-full${paddingClass}`
    const styleAttr = ` style={{ backgroundColor: "${props.bgColor}" }}`
    const children = renderChildren(level + 1)
    if (!children) return `${ind(level)}<Page className="${className}"${styleAttr} />`
    return `${ind(level)}<Page className="${className}"${styleAttr}>\n${children}\n${ind(level)}</Page>`
  },
}

// ─── New mobile components ────────────────────────────────────────────────────

const gridDef: ComponentDefinition = {
  type: "Grid",
  label: "Grid",
  icon: RiLayoutGridLine,
  description: "Lưới nhiều cột cho danh sách sản phẩm, tính năng",
  category: "layout",
  acceptsChildren: true,
  zmpImports: [],
  defaultProps: { columns: "2", gap: "4", padding: "4" },
  propSchema: {
    columns: { label: "Cột", type: "select", defaultValue: "2", options: ["2", "3", "4"] },
    gap: { label: "Gap", type: "select", defaultValue: "4", options: ["2", "3", "4", "6"] },
    padding: { label: "Padding", type: "select", defaultValue: "4", options: ["0", "2", "4", "6"] },
  },
  renderer: (props, children) => (
    <div
      className={`grid gap-${props.gap as string} p-${props.padding as string} min-h-[60px]`}
      style={{ gridTemplateColumns: `repeat(${props.columns as string}, minmax(0, 1fr))` }}
    >
      {children ?? (
        <div
          className="col-span-full flex items-center justify-center py-4 rounded-lg"
          style={{ border: "2px dashed rgba(0,104,255,0.2)" }}
        >
          <span className="text-xs font-medium" style={{ color: "rgba(0,104,255,0.4)" }}>
            Thả component vào đây
          </span>
        </div>
      )}
    </div>
  ),
  toJSX: (props, renderChildren, level) => {
    const style = `gridTemplateColumns: "repeat(${props.columns}, minmax(0, 1fr))"`
    const className = `grid gap-${props.gap} p-${props.padding}`
    const children = renderChildren(level + 1)
    if (!children) return `${ind(level)}<div className="${className}" style={{ ${style} }} />`
    return `${ind(level)}<div className="${className}" style={{ ${style} }}>\n${children}\n${ind(level)}</div>`
  },
}

const spacerDef: ComponentDefinition = {
  type: "Spacer",
  label: "Spacer",
  icon: RiArrowUpDownLine,
  description: "Khoảng trống linh hoạt giữa các phần tử",
  category: "layout",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { size: "4", direction: "vertical" },
  propSchema: {
    size: { label: "Kích thước", type: "select", defaultValue: "4", options: ["1", "2", "4", "6", "8", "12", "16", "20", "24"] },
    direction: { label: "Hướng", type: "select", defaultValue: "vertical", options: ["vertical", "horizontal"] },
  },
  renderer: (props) => (
    <div
      className={`shrink-0 ${props.direction === "horizontal" ? `w-${props.size as string}` : `h-${props.size as string} w-full`}`}
      style={{
        background:
          "repeating-linear-gradient(45deg, rgba(0,104,255,0.06) 0px, rgba(0,104,255,0.06) 1px, transparent 1px, transparent 6px)",
        borderRadius: 4,
        opacity: 0.8,
      }}
    />
  ),
  toJSX: (props, _renderChildren, level) => {
    const className = props.direction === "horizontal"
      ? `w-${props.size} shrink-0`
      : `h-${props.size} w-full`
    return `${ind(level)}<div className="${className}" />`
  },
}

const bannerDef: ComponentDefinition = {
  type: "Banner",
  label: "Banner",
  icon: RiAlertLine,
  description: "Thông báo info / success / warning / error",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { message: "Đây là thông báo quan trọng", type: "info", showIcon: true },
  propSchema: {
    message: { label: "Nội dung", type: "textarea", defaultValue: "Đây là thông báo quan trọng" },
    type: { label: "Loại", type: "select", defaultValue: "info", options: ["info", "success", "warning", "error"] },
    showIcon: { label: "Hiện icon", type: "boolean", defaultValue: true },
  },
  renderer: (props) => {
    const variants: Record<string, { bg: string; border: string; iconColor: string; Icon: React.ElementType }> = {
      info:    { bg: "rgba(0,104,255,0.06)",    border: "rgba(0,104,255,0.15)",    iconColor: "#0068FF", Icon: RiInformationLine },
      success: { bg: "rgba(16,185,129,0.06)",   border: "rgba(16,185,129,0.15)",   iconColor: "#059669", Icon: RiCheckboxCircleLine },
      warning: { bg: "rgba(245,158,11,0.07)",   border: "rgba(245,158,11,0.2)",    iconColor: "#B45309", Icon: RiAlertLine },
      error:   { bg: "rgba(239,68,68,0.06)",    border: "rgba(239,68,68,0.15)",    iconColor: "#DC2626", Icon: RiCloseCircleLine },
    }
    const v = variants[props.type as string] ?? variants.info
    return (
      <div
        className="flex items-start gap-3 px-4 py-3"
        style={{
          background: v.bg,
          border: `1px solid ${v.border}`,
          borderRadius: tk.radius.lg,
        }}
      >
        {(props.showIcon as boolean) && (
          <v.Icon style={{ fontSize: 18, color: v.iconColor, flexShrink: 0, marginTop: 1 }} />
        )}
        <p className="text-[13px] leading-snug" style={{ color: tk.textPrimary }}>
          {props.message as string}
        </p>
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const classMap: Record<string, string> = {
      info:    "flex items-start gap-2.5 rounded-xl px-4 py-3 border bg-blue-50 border-blue-200",
      success: "flex items-start gap-2.5 rounded-xl px-4 py-3 border bg-green-50 border-green-200",
      warning: "flex items-start gap-2.5 rounded-xl px-4 py-3 border bg-yellow-50 border-yellow-200",
      error:   "flex items-start gap-2.5 rounded-xl px-4 py-3 border bg-red-50 border-red-200",
    }
    const textMap: Record<string, string> = {
      info: "text-blue-800", success: "text-green-800", warning: "text-yellow-800", error: "text-red-800",
    }
    const iconMap: Record<string, string> = { info: "ℹ️", success: "✅", warning: "⚠️", error: "❌" }
    const cls = classMap[props.type as string] ?? classMap.info
    const textCls = textMap[props.type as string] ?? textMap.info
    const iconEmoji = iconMap[props.type as string] ?? "ℹ️"
    const iconJSX = props.showIcon ? `\n${ind(level + 1)}<span className="text-base leading-snug shrink-0">${iconEmoji}</span>` : ""
    return `${ind(level)}<div className="${cls}">${iconJSX}\n${ind(level + 1)}<p className="text-sm ${textCls}">${props.message}</p>\n${ind(level)}</div>`
  },
}

const progressBarDef: ComponentDefinition = {
  type: "ProgressBar",
  label: "Progress",
  icon: RiBarChartHorizontalLine,
  description: "Thanh tiến trình với phần trăm và màu tùy chỉnh",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { value: 60, label: "Tiến độ", color: "#0068FF", bgColor: "#E5E7EB", showLabel: true },
  propSchema: {
    label: { label: "Nhãn", type: "string", defaultValue: "Tiến độ" },
    value: { label: "Giá trị (%)", type: "number", defaultValue: 60 },
    color: { label: "Màu thanh", type: "color", defaultValue: "#0068FF" },
    bgColor: { label: "Màu nền", type: "color", defaultValue: "#E5E7EB" },
    showLabel: { label: "Hiện nhãn", type: "boolean", defaultValue: true },
  },
  renderer: (props) => {
    const pct = Math.min(100, Math.max(0, props.value as number))
    return (
      <div className="flex flex-col gap-2 w-full">
        {(props.showLabel as boolean) && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium" style={{ color: tk.textSecondary }}>
              {props.label as string}
            </span>
            <span
              className="font-mono text-[11px] font-semibold rounded-md px-1.5 py-0.5"
              style={{ background: "rgba(0,0,0,0.06)", color: tk.textSecondary }}
            >
              {pct}%
            </span>
          </div>
        )}
        <div
          className="w-full overflow-hidden"
          style={{ height: 6, borderRadius: 9999, backgroundColor: props.bgColor as string }}
        >
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              borderRadius: 9999,
              background:
                (props.color as string) === "#0068FF"
                  ? "linear-gradient(90deg, #0068FF 0%, #60A5FA 100%)"
                  : (props.color as string),
            }}
          />
        </div>
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const pct = Math.min(100, Math.max(0, props.value as number))
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const labelRow = props.showLabel
      ? `\n${i1}<div className="flex items-center justify-between">\n${i2}<span className="text-xs font-medium text-gray-700">${props.label}</span>\n${i2}<span className="text-xs text-gray-500">${pct}%</span>\n${i1}</div>`
      : ""
    return `${i0}<div className="flex flex-col gap-1.5 w-full">${labelRow}\n${i1}<div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "${props.bgColor}" }}>\n${i2}<div className="h-full rounded-full" style={{ width: "${pct}%", backgroundColor: "${props.color}" }} />\n${i1}</div>\n${i0}</div>`
  },
}

const switchDef: ComponentDefinition = {
  type: "Switch",
  label: "Switch",
  icon: RiToggleLine,
  description: "Toggle bật/tắt cho cài đặt và tùy chọn",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { label: "Nhận thông báo", checked: true, description: "" },
  propSchema: {
    label: { label: "Nhãn", type: "string", defaultValue: "Nhận thông báo" },
    description: { label: "Mô tả phụ", type: "string", defaultValue: "" },
    checked: { label: "Bật", type: "boolean", defaultValue: true },
  },
  renderer: (props) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="flex flex-col min-w-0">
        <span className="text-[14px] font-semibold" style={{ color: tk.textPrimary }}>
          {props.label as string}
        </span>
        {(props.description as string) && (
          <span className="text-[12px] mt-0.5" style={{ color: tk.textSecondary }}>
            {props.description as string}
          </span>
        )}
      </div>
      <div
        className="relative shrink-0"
        style={{
          width: 44,
          height: 24,
          borderRadius: 9999,
          backgroundColor: (props.checked as boolean) ? tk.accent : "#D1D5DB",
          boxShadow: (props.checked as boolean) ? "0 0 0 3px rgba(0,104,255,0.12)" : "none",
          transition: "background-color 200ms",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: (props.checked as boolean) ? 20 : 2,
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: "white",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)",
            transition: "left 200ms",
          }}
        />
      </div>
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const bgColor = props.checked ? "#0068FF" : "#d1d5db"
    const translateX = props.checked ? "translate-x-5" : "translate-x-0.5"
    const desc = (props.description as string)
      ? `\n${i2}<span className="text-xs text-gray-500 mt-0.5">${props.description}</span>`
      : ""
    return [
      `${i0}<div className="flex items-center justify-between gap-3 py-2">`,
      `${i1}<div className="flex flex-col min-w-0">`,
      `${i2}<span className="text-sm font-medium text-gray-900">${props.label}</span>${desc}`,
      `${i1}</div>`,
      `${i1}<div className="relative w-11 h-6 rounded-full shrink-0" style={{ backgroundColor: "${bgColor}" }}>`,
      `${i2}<div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow ${translateX}" />`,
      `${i1}</div>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

const ratingDef: ComponentDefinition = {
  type: "Rating",
  label: "Rating",
  icon: RiStarLine,
  description: "Hiển thị đánh giá sao từ 1 đến 5",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { value: 4, max: "5", color: "#F59E0B", showValue: true },
  propSchema: {
    value: { label: "Số sao", type: "number", defaultValue: 4 },
    max: { label: "Tối đa", type: "select", defaultValue: "5", options: ["3", "5", "10"] },
    color: { label: "Màu sao", type: "color", defaultValue: "#F59E0B" },
    showValue: { label: "Hiện số", type: "boolean", defaultValue: true },
  },
  renderer: (props) => {
    const max = parseInt(props.max as string)
    const val = Math.min(max, Math.max(0, props.value as number))
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill={i < val ? (props.color as string) : "none"}
            stroke={i < val ? (props.color as string) : "#D1D5DB"}
            strokeWidth={1.5}
            style={
              i < val
                ? { filter: `drop-shadow(0 1px 2px rgba(245,158,11,0.35))` }
                : undefined
            }
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
        {(props.showValue as boolean) && (
          <span
            className="text-[11px] font-semibold rounded-md px-1.5 py-0.5 ml-1"
            style={{ background: "rgba(245,158,11,0.1)", color: "#B45309" }}
          >
            {val}/{max}
          </span>
        )}
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const max = parseInt(props.max as string)
    const val = Math.min(max, Math.max(0, props.value as number))
    const i0 = ind(level), i1 = ind(level + 1)
    const stars = Array.from({ length: max }).map((_, idx) => {
      const filled = idx < val
      return `${i1}<svg viewBox="0 0 24 24" className="w-5 h-5" fill="${filled ? props.color : "none"}" stroke="${filled ? props.color : "#d1d5db"}" strokeWidth={1.5}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>`
    }).join("\n")
    const valueSpan = props.showValue ? `\n${i1}<span className="text-sm font-semibold text-gray-700 ml-1">${val}/${max}</span>` : ""
    return `${i0}<div className="flex items-center gap-1">\n${stars}${valueSpan}\n${i0}</div>`
  },
}

const textareaDef: ComponentDefinition = {
  type: "Textarea",
  label: "Textarea",
  icon: RiEditBoxLine,
  description: "Ô nhập liệu nhiều dòng cho nội dung dài",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { label: "Ghi chú", placeholder: "Nhập nội dung...", rows: 4, required: false },
  propSchema: {
    label: { label: "Label", type: "string", defaultValue: "Ghi chú" },
    placeholder: { label: "Placeholder", type: "string", defaultValue: "Nhập nội dung..." },
    rows: { label: "Số hàng", type: "number", defaultValue: 4 },
    required: { label: "Bắt buộc", type: "boolean", defaultValue: false },
  },
  renderer: (props) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium" style={{ color: tk.textSecondary }}>
        {props.label as string}
        {(props.required as boolean) && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <textarea
          rows={props.rows as number}
          placeholder={props.placeholder as string}
          className="w-full bg-white outline-none resize-none"
          style={{
            border: tk.border,
            borderRadius: tk.radius.md,
            padding: "11px 14px",
            fontSize: 14,
            color: tk.textPrimary,
          }}
        />
        <span
          className="absolute bottom-2 right-3 text-[11px]"
          style={{ color: tk.textTertiary }}
        >
          0/∞
        </span>
      </div>
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    const req = props.required ? " required" : ""
    return `${ind(level)}<textarea rows={${props.rows}} placeholder="${props.placeholder}" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none resize-none"${req} />`
  },
}

const chipDef: ComponentDefinition = {
  type: "Chip",
  label: "Chip",
  icon: RiFilterLine,
  description: "Chip lọc / phân loại có trạng thái active",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { label: "Tất cả", active: true, color: "#0068FF" },
  propSchema: {
    label: { label: "Label", type: "string", defaultValue: "Tất cả" },
    active: { label: "Đang chọn", type: "boolean", defaultValue: true },
    color: { label: "Màu accent", type: "color", defaultValue: "#0068FF" },
  },
  renderer: (props) => (
    <button
      className="inline-flex items-center font-medium transition-all"
      style={{
        borderRadius: 9999,
        padding: "6px 16px",
        fontSize: 13,
        ...(props.active as boolean)
          ? {
              background: tk.accentGrad,
              color: "white",
              boxShadow: tk.accentShadow,
            }
          : {
              background: "rgba(0,0,0,0.05)",
              color: tk.textSecondary,
            }
      }}
    >
      {props.label as string}
    </button>
  ),
  toJSX: (props, _renderChildren, level) => {
    const className = `inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium border ${props.active ? "text-white border-transparent" : "bg-white text-gray-600 border-gray-200"}`
    const styleAttr = props.active ? ` style={{ backgroundColor: "${props.color}", borderColor: "${props.color}" }}` : ""
    return `${ind(level)}<button className="${className}"${styleAttr}>${props.label}</button>`
  },
}

// ─── Registry exports ─────────────────────────────────────────────────────────

export const registry: Record<string, ComponentDefinition> = {
  // Zalo components
  ZaloPage: zaloPageDef,
  ZaloHeader: zaloHeaderDef,
  ZaloBottomNav: zaloBottomNavDef,
  ZaloCard: zaloCardDef,
  ZaloList: zaloListDef,
  ZaloListItem: zaloListItemDef,
  ZaloAvatar: zaloAvatarDef,
  ZaloTag: zaloTagDef,
  ZaloButton: zaloBtnDef,
  ZaloInput: zaloInputDef,
  ZaloSearchBar: zaloSearchBarDef,
  ZaloSection: zaloSectionDef,
  // Layout
  Stack: stackDef,
  Grid: gridDef,
  Spacer: spacerDef,
  Divider: dividerDef,
  // UI
  Text: textDef,
  Image: imageDef,
  Banner: bannerDef,
  ProgressBar: progressBarDef,
  Switch: switchDef,
  Rating: ratingDef,
  Textarea: textareaDef,
  Chip: chipDef,
}

export const categoryOrder = ["zalo", "layout", "ui"] as const
export type CategoryKey = (typeof categoryOrder)[number]

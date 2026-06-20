import { JSX } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  RiLayoutColumnLine,
  RiArrowDownSLine,
  RiWindowLine,
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
  RiSlideshowLine,
  RiLoader2Line,
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
  renderer: (props, children) => {
    const isH = props.direction === "horizontal"
    return (
      <div
        className={isH ? "flex" : "flex flex-col min-h-10"}
        style={{
          flexDirection: isH ? "row" : "column",
          flexWrap: "nowrap",
          gap: stackGapMap[props.gap as string] ?? "16px",
          alignItems: props.align as string,
          padding: stackPadMap[props.padding as string] ?? "0",
          background: props.background as string,
          overflowX: isH ? "auto" : undefined,
          overflowY: isH ? "hidden" : undefined,
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
    )
  },
  toJSX: (props, renderChildren, level) => {
    const isH = props.direction === "horizontal"
    const gapMap: Record<string, string> = { "0": "0", "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px", "12": "48px" }
    const padMap: Record<string, string> = { "0": "0", "2": "8px", "4": "16px", "6": "24px", "8": "32px" }
    const styles: string[] = [
      `flexDirection: "${isH ? "row" : "column"}"`,
      `flexWrap: "nowrap"`,
      `gap: "${gapMap[props.gap as string] ?? "16px"}"`,
      `alignItems: "${props.align}"`,
      `padding: "${padMap[props.padding as string] ?? "0"}"`,
    ]
    if (isH) styles.push(`overflowX: "auto"`, `overflowY: "hidden"`)
    if (props.background && (props.background as string) !== "transparent") styles.push(`background: "${props.background}"`)
    const styleStr = `{{ display: "flex", ${styles.join(", ")} }}`
    const children = renderChildren(level + 1)
    if (!children) return `${ind(level)}<div style=${styleStr} />`
    return `${ind(level)}<div style=${styleStr}>\n${children}\n${ind(level)}</div>`
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
      <Separator
        className={marginClass[props.margin as string] ?? "my-4"}
        style={{ backgroundColor: props.color as string, height: props.thickness as string }}
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
      <Input
        type={props.type as string}
        placeholder={props.placeholder as string}
        className="h-10 text-sm"
      />
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
  description: "Thanh điều hướng dưới cùng với tối đa 5 tab — có thể gán route cho từng tab",
  category: "zalo",
  acceptsChildren: false,
  zmpComponent: "BottomNavigation",
  zmpImports: ["BottomNavigation"],
  defaultProps: {
    tabCount: "3",
    tab1Label: "Trang chủ", tab1Icon: "🏠", tab1Route: "/",
    tab2Label: "Tìm kiếm", tab2Icon: "🔍", tab2Route: "",
    tab3Label: "Tài khoản", tab3Icon: "👤", tab3Route: "",
    tab4Label: "", tab4Icon: "⭐", tab4Route: "",
    tab5Label: "", tab5Icon: "🛒", tab5Route: "",
    activeTab: "1",
  },
  propSchema: {
    tabCount: { label: "Số tab", type: "select", defaultValue: "3", options: ["2", "3", "4", "5"] },
    tab1Icon: { label: "Tab 1 icon", type: "string", defaultValue: "🏠" },
    tab1Label: { label: "Tab 1 label", type: "string", defaultValue: "Trang chủ" },
    tab1Route: { label: "Tab 1 → Trang", type: "page-select", defaultValue: "/" },
    tab2Icon: { label: "Tab 2 icon", type: "string", defaultValue: "🔍" },
    tab2Label: { label: "Tab 2 label", type: "string", defaultValue: "Tìm kiếm" },
    tab2Route: { label: "Tab 2 → Trang", type: "page-select", defaultValue: "" },
    tab3Icon: { label: "Tab 3 icon", type: "string", defaultValue: "👤" },
    tab3Label: { label: "Tab 3 label", type: "string", defaultValue: "Tài khoản" },
    tab3Route: { label: "Tab 3 → Trang", type: "page-select", defaultValue: "" },
    tab4Icon: { label: "Tab 4 icon", type: "string", defaultValue: "⭐" },
    tab4Label: { label: "Tab 4 label", type: "string", defaultValue: "" },
    tab4Route: { label: "Tab 4 → Trang", type: "page-select", defaultValue: "" },
    tab5Icon: { label: "Tab 5 icon", type: "string", defaultValue: "🛒" },
    tab5Label: { label: "Tab 5 label", type: "string", defaultValue: "" },
    tab5Route: { label: "Tab 5 → Trang", type: "page-select", defaultValue: "" },
    activeTab: { label: "Tab active", type: "select", defaultValue: "1", options: ["1", "2", "3", "4", "5"] },
  },
  renderer: (props) => {
    const navigate = props.__navigate__ as ((path: string) => void) | undefined
    const currentPath = props.__currentPath__ as string | undefined
    const tabCount = parseInt((props.tabCount as string) ?? "3")

    const allTabs = [
      { icon: props.tab1Icon as string, label: props.tab1Label as string, key: "1", route: (props.tab1Route as string) ?? "" },
      { icon: props.tab2Icon as string, label: props.tab2Label as string, key: "2", route: (props.tab2Route as string) ?? "" },
      { icon: props.tab3Icon as string, label: props.tab3Label as string, key: "3", route: (props.tab3Route as string) ?? "" },
      { icon: props.tab4Icon as string, label: props.tab4Label as string, key: "4", route: (props.tab4Route as string) ?? "" },
      { icon: props.tab5Icon as string, label: props.tab5Label as string, key: "5", route: (props.tab5Route as string) ?? "" },
    ]
    const tabs = allTabs.slice(0, tabCount)

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
  propGroups: [
    {
      label: "Tab 1",
      keys: ["tab1Icon", "tab1Label", "tab1Route"],
      defaultExpanded: true,
      preview: (props) => `${props.tab1Icon as string} ${props.tab1Label as string}`,
    },
    {
      label: "Tab 2",
      keys: ["tab2Icon", "tab2Label", "tab2Route"],
      defaultExpanded: false,
      preview: (props) => `${props.tab2Icon as string} ${props.tab2Label as string}`,
    },
    {
      label: "Tab 3",
      keys: ["tab3Icon", "tab3Label", "tab3Route"],
      defaultExpanded: false,
      preview: (props) => `${props.tab3Icon as string} ${props.tab3Label as string}`,
      showWhen: (props) => parseInt(props.tabCount as string) >= 3,
    },
    {
      label: "Tab 4",
      keys: ["tab4Icon", "tab4Label", "tab4Route"],
      defaultExpanded: false,
      preview: (props) => `${(props.tab4Icon as string) || "⭐"} ${(props.tab4Label as string) || "Tab 4"}`,
      showWhen: (props) => parseInt(props.tabCount as string) >= 4,
    },
    {
      label: "Tab 5",
      keys: ["tab5Icon", "tab5Label", "tab5Route"],
      defaultExpanded: false,
      preview: (props) => `${(props.tab5Icon as string) || "🛒"} ${(props.tab5Label as string) || "Tab 5"}`,
      showWhen: (props) => parseInt(props.tabCount as string) >= 5,
    },
  ],
  // BottomNavigation.Item with onClick navigate when routes are set
  toJSX: (props, _renderChildren, level) => {
    const tabCount = parseInt((props.tabCount as string) ?? "3")
    const allTabs = [
      { label: props.tab1Label as string, key: "1", route: (props.tab1Route as string) ?? "" },
      { label: props.tab2Label as string, key: "2", route: (props.tab2Route as string) ?? "" },
      { label: props.tab3Label as string, key: "3", route: (props.tab3Route as string) ?? "" },
      { label: props.tab4Label as string, key: "4", route: (props.tab4Route as string) ?? "" },
      { label: props.tab5Label as string, key: "5", route: (props.tab5Route as string) ?? "" },
    ]
    const item = (label: string, key: string, route: string) => {
      const onClick = route ? ` onClick={() => navigate("${route}")}` : ""
      return `${ind(level + 1)}<BottomNavigation.Item label="${label}" itemKey="${key}"${onClick} />`
    }
    return [
      `${ind(level)}<BottomNavigation activeKey="${props.activeTab}">`,
      ...allTabs.slice(0, tabCount).map((t) => item(t.label, t.key, t.route)),
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
    const sizeMap: Record<string, "sm" | "default" | "lg"> = { sm: "sm", md: "default", lg: "lg", xl: "lg" }
    const sizeClass: Record<string, string> = { sm: "size-8", md: "size-12", lg: "size-16", xl: "size-20" }
    const initials = (props.name as string)
      .split(" ")
      .map((n: string) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase()
    return (
      <div className="flex flex-col items-center gap-2">
        <Avatar
          size={sizeMap[props.size as string] ?? "default"}
          className={`${sizeClass[props.size as string]} ring-2 ring-white ring-offset-1 ring-offset-primary/20`}
        >
          <AvatarImage src={props.src as string} alt={props.name as string} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
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
  zmpImports: [],
  defaultProps: { placeholder: "Tìm kiếm..." },
  propSchema: {
    placeholder: { label: "Placeholder", type: "string", defaultValue: "Tìm kiếm..." },
  },
  renderer: (props) => (
    <div className="relative mx-4">
      <RiSearchLine
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ fontSize: 15, color: tk.textTertiary }}
      />
      <Input
        type="text"
        placeholder={props.placeholder as string}
        className="h-10 pl-9 bg-black/5 border-transparent text-sm focus-visible:bg-white"
      />
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1)
    return [
      `${i0}<div style={{ position: "relative" }}>`,
      `${i1}<svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>`,
      `${i1}<input type="text" placeholder="${props.placeholder}" style={{ width: "100%", height: 40, paddingLeft: 36, paddingRight: 12, borderRadius: 10, border: "none", background: "rgba(0,0,0,0.05)", fontSize: 14, outline: "none" }} />`,
      `${i0}</div>`,
    ].join("\n")
  },
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
        className={`flex flex-col h-full w-full ${paddingClass[props.padding as string] ?? "p-0"}`}
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
      className="grid min-h-[60px]"
      style={{
        gridTemplateColumns: `repeat(${props.columns as string}, minmax(0, 1fr))`,
        gap: ({ "2": "8px", "3": "12px", "4": "16px", "6": "24px" } as Record<string, string>)[props.gap as string] ?? "16px",
        padding: ({ "0": "0", "2": "8px", "3": "12px", "4": "16px", "6": "24px" } as Record<string, string>)[props.padding as string] ?? "0",
      }}
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
    const gapMap: Record<string, string> = { "2": "8px", "3": "12px", "4": "16px", "6": "24px" }
    const padMap: Record<string, string> = { "0": "0", "2": "8px", "3": "12px", "4": "16px", "6": "24px" }
    const styleStr = `{{ display: "grid", gridTemplateColumns: "repeat(${props.columns}, minmax(0, 1fr))", gap: "${gapMap[props.gap as string] ?? "16px"}", padding: "${padMap[props.padding as string] ?? "0"}" }}`
    const children = renderChildren(level + 1)
    if (!children) return `${ind(level)}<div style=${styleStr} />`
    return `${ind(level)}<div style=${styleStr}>\n${children}\n${ind(level)}</div>`
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
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-medium" style={{ color: tk.textSecondary }}>
              {props.label as string}
            </span>
            <span className="text-[11px] tabular-nums" style={{ color: tk.textSecondary }}>
              {pct}%
            </span>
          </div>
        )}
        <Progress value={pct} className="w-full" />
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
      <Switch
        defaultChecked={props.checked as boolean}
        className="data-[size=default]:h-6 data-[size=default]:w-11"
      />
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const checkedAttr = typeof props.checked === "boolean"
      ? `{${props.checked}}`
      : `"${props.checked}"`
    const desc = (props.description as string)
      ? `\n${i2}<span style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>${props.description}</span>`
      : ""
    return [
      `${i0}<label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 8, paddingBottom: 8, cursor: "pointer" }}>`,
      `${i1}<div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>`,
      `${i2}<span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>${props.label}</span>${desc}`,
      `${i1}</div>`,
      `${i1}<div style={{ position: "relative", display: "inline-flex", flexShrink: 0, width: 44, height: 24 }}>`,
      `${i2}<input type="checkbox" className="sr-only peer" defaultChecked=${checkedAttr} />`,
      `${i2}<div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "#D1D5DB", transition: "background 0.2s" }} className="peer-checked:!bg-[#0068FF]" />`,
      `${i2}<div style={{ position: "absolute", top: 2, left: 2, width: 20, height: 20, background: "white", borderRadius: "50%", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "transform 0.2s" }} className="peer-checked:translate-x-[22px]" />`,
      `${i1}</div>`,
      `${i0}</label>`,
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
      <ShadcnTextarea
        rows={props.rows as number}
        placeholder={props.placeholder as string}
        className="text-sm"
      />
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1)
    const req = props.required ? ` required` : ""
    const label = (props.label as string) ?? ""
    return [
      `${i0}<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>`,
      `${i1}<label style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}>${label}</label>`,
      `${i1}<textarea rows={${props.rows}} placeholder="${props.placeholder}" style={{ width: "100%", borderRadius: 10, border: "1px solid #E5E7EB", padding: "10px 14px", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit" }}${req} />`,
      `${i0}</div>`,
    ].join("\n")
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
      className="inline-flex items-center font-medium transition-all shrink-0"
      style={{
        borderRadius: 9999,
        padding: "5px 14px",
        fontSize: 13,
        whiteSpace: "nowrap",
        lineHeight: 1.25,
        ...(props.active as boolean)
          ? {
              background: tk.accentGrad,
              color: "white",
              boxShadow: tk.accentShadow,
            }
          : {
              background: "rgba(0,0,0,0.06)",
              color: tk.textSecondary,
            }
      }}
    >
      {props.label as string}
    </button>
  ),
  toJSX: (props, _renderChildren, level) => {
    const activeStyle = `background: "linear-gradient(135deg, #0068FF, #0084FF)", color: "white", boxShadow: "0 4px 12px rgba(0,104,255,0.28)"`
    const inactiveStyle = `background: "rgba(0,0,0,0.06)", color: "#6B7280"`
    const styleStr = `{{ borderRadius: 9999, padding: "5px 14px", fontSize: 13, whiteSpace: "nowrap", lineHeight: 1.25, border: "none", cursor: "pointer", ${(props.active as boolean) ? activeStyle : inactiveStyle} }}`
    return `${ind(level)}<button style=${styleStr}>${props.label}</button>`
  },
}

const productCardDef: ComponentDefinition = {
  type: "ProductCard",
  label: "Product Card",
  icon: RiShoppingBag3Line,
  description: "Card sản phẩm với hình ảnh, giá và nút thêm vào giỏ",
  category: "zalo",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: {
    imageSrc: "https://placehold.co/400x300",
    name: "Tên sản phẩm",
    price: "120.000đ",
    originalPrice: "150.000đ",
    rating: 4,
    badge: "Mới",
  },
  propSchema: {
    imageSrc: { label: "URL ảnh", type: "string", defaultValue: "https://placehold.co/400x300" },
    name: { label: "Tên sản phẩm", type: "string", defaultValue: "Tên sản phẩm" },
    price: { label: "Giá", type: "string", defaultValue: "120.000đ" },
    originalPrice: { label: "Giá gốc (để trống = ẩn)", type: "string", defaultValue: "150.000đ" },
    rating: { label: "Đánh giá (1–5)", type: "number", defaultValue: 4 },
    badge: { label: "Badge (để trống = ẩn)", type: "string", defaultValue: "Mới" },
  },
  renderer: (props) => (
    <div
      className="bg-white overflow-hidden"
      style={{ borderRadius: tk.radius.lg, border: tk.border, boxShadow: tk.shadow.sm }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.imageSrc as string}
          alt={props.name as string}
          className="w-full h-full object-cover"
        />
        {(props.badge as string) && (
          <span
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: tk.accentGrad }}
          >
            {props.badge as string}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-[12px] font-semibold truncate mb-1" style={{ color: tk.textPrimary }}>
          {props.name as string}
        </p>
        <div className="flex items-center gap-px mb-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className="w-2.5 h-2.5 shrink-0"
              fill={i < (props.rating as number) ? "#F59E0B" : "none"}
              stroke={i < (props.rating as number) ? "#F59E0B" : "#D1D5DB"}
              strokeWidth={1.5}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <div className="flex items-center justify-between gap-1 min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[13px] font-bold block truncate" style={{ color: tk.accent }}>
              {props.price as string}
            </span>
            {(props.originalPrice as string) && (
              <span className="text-[10px] line-through" style={{ color: tk.textTertiary }}>
                {props.originalPrice as string}
              </span>
            )}
          </div>
          <button
            className="text-white text-[14px] font-bold w-7 h-7 rounded-lg shrink-0 flex items-center justify-center leading-none"
            style={{ background: tk.accentGrad }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  ),
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2), i3 = ind(level + 3)
    const rating = Math.min(5, Math.max(0, props.rating as number))
    const stars = Array.from({ length: 5 }).map((_, idx) => {
      const filled = idx < rating
      return `${i3}<svg viewBox="0 0 24 24" style={{ width: 10, height: 10, flexShrink: 0 }} fill="${filled ? "#F59E0B" : "none"}" stroke="${filled ? "#F59E0B" : "#D1D5DB"}" strokeWidth={1.5}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>`
    }).join("\n")
    const badge = (props.badge as string)
      ? `\n${i2}<span style={{ position: "absolute", top: 8, left: 8, color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "#0068FF" }}>${props.badge}</span>`
      : ""
    const origPrice = (props.originalPrice as string)
      ? `\n${i3}<span style={{ fontSize: 10, textDecoration: "line-through", color: "#9CA3AF" }}>${props.originalPrice}</span>`
      : ""
    return [
      `${i0}<div style={{ background: "white", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>`,
      `${i1}<div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3" }}>`,
      `${i2}<img src="${props.imageSrc}" alt="${props.name}" style={{ width: "100%", height: "100%", objectFit: "cover" }} />${badge}`,
      `${i1}</div>`,
      `${i1}<div style={{ padding: 10 }}>`,
      `${i2}<p style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>${props.name}</p>`,
      `${i2}<div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 6 }}>`,
      stars,
      `${i2}</div>`,
      `${i2}<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>`,
      `${i3}<div style={{ minWidth: 0, flex: 1 }}>`,
      `${i3}<span style={{ fontSize: 13, fontWeight: 700, color: "#0068FF", display: "block" }}>${props.price}</span>${origPrice}`,
      `${i3}</div>`,
      `${i3}<button style={{ background: "linear-gradient(135deg, #0068FF, #0084FF)", color: "white", fontSize: 14, fontWeight: 700, width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>+</button>`,
      `${i2}</div>`,
      `${i1}</div>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

const heroSectionDef: ComponentDefinition = {
  type: "HeroSection",
  label: "Hero Section",
  icon: RiImageLine,
  description: "Banner lớn với hình nền, tiêu đề overlay và nút CTA",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: {
    imageSrc: "https://placehold.co/800x400",
    heading: "Khám phá ngay hôm nay",
    subtext: "Ưu đãi đặc biệt chỉ trong hôm nay",
    ctaLabel: "Khám phá",
    overlayOpacity: 45,
  },
  propSchema: {
    imageSrc: { label: "URL ảnh nền", type: "string", defaultValue: "https://placehold.co/800x400" },
    heading: { label: "Tiêu đề", type: "string", defaultValue: "Khám phá ngay hôm nay" },
    subtext: { label: "Mô tả phụ", type: "string", defaultValue: "Ưu đãi đặc biệt chỉ trong hôm nay" },
    ctaLabel: { label: "Nút CTA", type: "string", defaultValue: "Khám phá" },
    overlayOpacity: { label: "Độ tối overlay (0–80)", type: "number", defaultValue: 45 },
  },
  renderer: (props) => {
    const opacity = Math.min(80, Math.max(0, props.overlayOpacity as number)) / 100
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{ minHeight: 200, borderRadius: tk.radius.lg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props.imageSrc as string}
          alt={props.heading as string}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${opacity})` }} />
        <div className="relative z-10 flex flex-col justify-end p-5" style={{ minHeight: 200 }}>
          <h2
            className="text-white font-bold leading-snug mb-1"
            style={{ fontSize: 20 }}
          >
            {props.heading as string}
          </h2>
          <p className="text-[13px] mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>
            {props.subtext as string}
          </p>
          <button
            className="self-start text-[13px] font-semibold px-5 py-2.5 rounded-xl"
            style={{ background: "white", color: tk.accent }}
          >
            {props.ctaLabel as string}
          </button>
        </div>
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const opacity = Math.min(80, Math.max(0, props.overlayOpacity as number)) / 100
    return [
      `${i0}<div className="relative w-full overflow-hidden rounded-2xl" style={{ minHeight: 200 }}>`,
      `${i1}<img src="${props.imageSrc}" alt="${props.heading}" className="absolute inset-0 w-full h-full object-cover" />`,
      `${i1}<div className="absolute inset-0" style={{ background: "rgba(0,0,0,${opacity})" }} />`,
      `${i1}<div className="relative z-10 flex flex-col justify-end p-5" style={{ minHeight: 200 }}>`,
      `${i2}<h2 className="text-white font-bold leading-snug mb-1" style={{ fontSize: 20 }}>${props.heading}</h2>`,
      `${i2}<p className="text-[13px] mb-4" style={{ color: "rgba(255,255,255,0.8)" }}>${props.subtext}</p>`,
      `${i2}<button className="self-start text-[13px] font-semibold px-5 py-2.5 rounded-xl bg-white" style={{ color: "#0068FF" }}>${props.ctaLabel}</button>`,
      `${i1}</div>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

const statIconMap: Record<string, React.ElementType> = {
  user:  RiUserLine,
  cart:  RiShoppingCartLine,
  money: RiMoneyDollarCircleLine,
  chart: RiBarChartLine,
  heart: RiHeartLine,
  star:  RiStarLine,
}

const statCardDef: ComponentDefinition = {
  type: "StatCard",
  label: "Stat Card",
  icon: RiBarChartLine,
  description: "Thẻ số liệu với icon, giá trị lớn và nhãn — dùng trong Grid 3 cột",
  category: "ui",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { value: "1,234", label: "Khách hàng", icon: "user", color: "#0068FF", trend: "+12%" },
  propSchema: {
    value: { label: "Giá trị", type: "string", defaultValue: "1,234" },
    label: { label: "Nhãn", type: "string", defaultValue: "Khách hàng" },
    icon: {
      label: "Icon",
      type: "select",
      defaultValue: "user",
      options: ["user", "cart", "money", "chart", "heart", "star"],
    },
    color: { label: "Màu icon", type: "color", defaultValue: "#0068FF" },
    trend: { label: "Trend (để trống = ẩn)", type: "string", defaultValue: "+12%" },
  },
  renderer: (props) => {
    const IconComp = statIconMap[props.icon as string] ?? RiUserLine
    const lightBg = `${props.color as string}18`
    return (
      <div
        className="bg-white p-4"
        style={{ borderRadius: tk.radius.lg, border: tk.border, boxShadow: tk.shadow.xs }}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-xl"
            style={{ background: lightBg }}
          >
            <IconComp style={{ fontSize: 20, color: props.color as string }} />
          </div>
          {(props.trend as string) && (
            <span
              className="text-[11px] font-semibold rounded-md px-1.5 py-0.5"
              style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}
            >
              {props.trend as string}
            </span>
          )}
        </div>
        <p className="text-[22px] font-bold mb-0.5" style={{ color: tk.textPrimary }}>
          {props.value as string}
        </p>
        <p className="text-[12px]" style={{ color: tk.textSecondary }}>
          {props.label as string}
        </p>
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const iconMap: Record<string, string> = { user: "👤", cart: "🛒", money: "💰", chart: "📊", heart: "❤️", star: "⭐" }
    const iconEmoji = iconMap[props.icon as string] ?? "📊"
    const lightBg = `${props.color as string}18`
    const trendSpan = (props.trend as string)
      ? `\n${i2}<span className="text-[11px] font-semibold rounded-md px-1.5 py-0.5 bg-green-50 text-green-700">${props.trend}</span>`
      : ""
    return [
      `${i0}<div className="bg-white rounded-xl p-4 shadow-sm border border-black/5">`,
      `${i1}<div className="flex items-start justify-between mb-3">`,
      `${i2}<div className="w-10 h-10 flex items-center justify-center rounded-xl text-xl" style={{ background: "${lightBg}" }}>${iconEmoji}</div>${trendSpan}`,
      `${i1}</div>`,
      `${i1}<p className="text-[22px] font-bold mb-0.5 text-gray-900">${props.value}</p>`,
      `${i1}<p className="text-[12px] text-gray-500">${props.label}</p>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

const userProfileCardDef: ComponentDefinition = {
  type: "UserProfileCard",
  label: "Profile Card",
  icon: RiUserLine,
  description: "Card hồ sơ người dùng với avatar, tên, bio và 3 chỉ số",
  category: "zalo",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: {
    avatarSrc: "",
    name: "Nguyễn Văn A",
    bio: "Yêu thích khám phá và mua sắm trực tuyến",
    stat1Label: "Bài đăng",    stat1Value: "128",
    stat2Label: "Theo dõi",    stat2Value: "2.4K",
    stat3Label: "Đang theo dõi", stat3Value: "186",
  },
  propSchema: {
    avatarSrc:   { label: "URL avatar", type: "string", defaultValue: "" },
    name:        { label: "Tên",        type: "string", defaultValue: "Nguyễn Văn A" },
    bio:         { label: "Bio",        type: "string", defaultValue: "Yêu thích khám phá và mua sắm" },
    stat1Label:  { label: "Nhãn 1",     type: "string", defaultValue: "Bài đăng" },
    stat1Value:  { label: "Giá trị 1",  type: "string", defaultValue: "128" },
    stat2Label:  { label: "Nhãn 2",     type: "string", defaultValue: "Theo dõi" },
    stat2Value:  { label: "Giá trị 2",  type: "string", defaultValue: "2.4K" },
    stat3Label:  { label: "Nhãn 3",     type: "string", defaultValue: "Đang theo dõi" },
    stat3Value:  { label: "Giá trị 3",  type: "string", defaultValue: "186" },
  },
  renderer: (props) => {
    const initials = (props.name as string)
      .split(" ")
      .map((n: string) => n[0])
      .slice(-2)
      .join("")
      .toUpperCase()
    const stats = [
      { label: props.stat1Label as string, value: props.stat1Value as string },
      { label: props.stat2Label as string, value: props.stat2Value as string },
      { label: props.stat3Label as string, value: props.stat3Value as string },
    ]
    return (
      <div
        className="bg-white overflow-hidden"
        style={{ borderRadius: tk.radius.lg, border: tk.border, boxShadow: tk.shadow.sm }}
      >
        <div className="h-[72px]" style={{ background: tk.accentGrad }} />
        <div className="flex flex-col items-center -mt-9 pb-4 px-4">
          <div
            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xl"
            style={{
              background: "linear-gradient(135deg, #0068FF, #7C3AED)",
              boxShadow: "0 0 0 3px white, 0 0 0 5px rgba(0,104,255,0.2)",
            }}
          >
            {(props.avatarSrc as string) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.avatarSrc as string}
                alt={props.name as string}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <h3 className="mt-2 font-bold" style={{ fontSize: 16, color: tk.textPrimary }}>
            {props.name as string}
          </h3>
          <p className="text-[12px] mt-0.5 text-center" style={{ color: tk.textSecondary }}>
            {props.bio as string}
          </p>
          <div
            className="flex w-full mt-3 pt-3"
            style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center"
                style={{ borderLeft: i > 0 ? "1px solid rgba(0,0,0,0.05)" : "none" }}
              >
                <span className="font-bold" style={{ fontSize: 16, color: tk.textPrimary }}>
                  {stat.value}
                </span>
                <span className="text-[11px]" style={{ color: tk.textSecondary }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2), i3 = ind(level + 3), i4 = ind(level + 4)
    const initials = (props.name as string).split(" ").map((n: string) => n[0]).slice(-2).join("").toUpperCase()
    const avatarInner = (props.avatarSrc as string)
      ? `${i3}<img src="${props.avatarSrc}" alt="${props.name}" className="w-full h-full object-cover" />`
      : `${i3}${initials}`
    const stats = [
      { label: props.stat1Label as string, value: props.stat1Value as string },
      { label: props.stat2Label as string, value: props.stat2Value as string },
      { label: props.stat3Label as string, value: props.stat3Value as string },
    ]
    const statDivs = stats.map((stat, idx) => [
      `${i3}<div className="flex-1 flex flex-col items-center"${idx > 0 ? ' style={{ borderLeft: "1px solid rgba(0,0,0,0.05)" }}' : ""}>`,
      `${i4}<span className="font-bold text-gray-900" style={{ fontSize: 16 }}>${stat.value}</span>`,
      `${i4}<span className="text-[11px] text-gray-500">${stat.label}</span>`,
      `${i3}</div>`,
    ].join("\n")).join("\n")
    return [
      `${i0}<div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">`,
      `${i1}<div className="h-[72px]" style={{ background: "linear-gradient(135deg, #0068FF 0%, #0084FF 100%)" }} />`,
      `${i1}<div className="flex flex-col items-center -mt-9 pb-4 px-4">`,
      `${i2}<div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xl" style={{ background: "linear-gradient(135deg, #0068FF, #7C3AED)", boxShadow: "0 0 0 3px white, 0 0 0 5px rgba(0,104,255,0.2)" }}>`,
      avatarInner,
      `${i2}</div>`,
      `${i2}<h3 className="mt-2 font-bold text-gray-900" style={{ fontSize: 16 }}>${props.name}</h3>`,
      `${i2}<p className="text-[12px] mt-0.5 text-center text-gray-500">${props.bio}</p>`,
      `${i2}<div className="flex w-full mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>`,
      statDivs,
      `${i2}</div>`,
      `${i1}</div>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

const notifIconMap: Record<string, React.ElementType> = {
  check: RiCheckboxCircleLine,
  info:  RiInformationLine,
  user:  RiUserLine,
  cart:  RiShoppingCartLine,
  star:  RiStarLine,
  heart: RiHeartLine,
}

const notificationItemDef: ComponentDefinition = {
  type: "NotificationItem",
  label: "Notification",
  icon: RiAlertLine,
  description: "Mục thông báo với icon màu, tiêu đề, nội dung và thời gian",
  category: "zalo",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: {
    title: "Đơn hàng đã được giao",
    body: "Đơn hàng #1234 của bạn đã được giao thành công.",
    time: "2 phút trước",
    icon: "check",
    iconColor: "#0068FF",
    unread: true,
  },
  propSchema: {
    title:     { label: "Tiêu đề",   type: "string",  defaultValue: "Đơn hàng đã được giao" },
    body:      { label: "Nội dung",  type: "string",  defaultValue: "Đơn hàng #1234 của bạn đã được giao thành công." },
    time:      { label: "Thời gian", type: "string",  defaultValue: "2 phút trước" },
    icon: {
      label: "Icon",
      type: "select",
      defaultValue: "check",
      options: ["check", "info", "user", "cart", "star", "heart"],
    },
    iconColor: { label: "Màu icon",  type: "color",   defaultValue: "#0068FF" },
    unread:    { label: "Chưa đọc",  type: "boolean", defaultValue: true },
  },
  renderer: (props) => {
    const IconComp = notifIconMap[props.icon as string] ?? RiInformationLine
    const lightBg = `${props.iconColor as string}18`
    return (
      <div
        className="flex items-start gap-3 px-4 py-3 bg-white"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: lightBg }}
        >
          <IconComp style={{ fontSize: 18, color: props.iconColor as string }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[13px] truncate ${(props.unread as boolean) ? "font-semibold" : "font-medium"}`}
            style={{ color: tk.textPrimary }}
          >
            {props.title as string}
          </p>
          <p className="text-[12px] mt-0.5 truncate" style={{ color: tk.textSecondary }}>
            {props.body as string}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: tk.textTertiary }}>
            {props.time as string}
          </p>
        </div>
        {(props.unread as boolean) && (
          <div
            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
            style={{ background: tk.accent }}
          />
        )}
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const iconMap: Record<string, string> = { check: "✅", info: "ℹ️", user: "👤", cart: "🛒", star: "⭐", heart: "❤️" }
    const iconEmoji = iconMap[props.icon as string] ?? "ℹ️"
    const lightBg = `${props.iconColor as string}18`
    const titleWeight = (props.unread as boolean) ? "font-semibold" : "font-medium"
    const unreadDot = (props.unread as boolean)
      ? `\n${i1}<div className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-[#0068FF]" />`
      : ""
    return [
      `${i0}<div className="flex items-start gap-3 px-4 py-3 bg-white border-b border-black/5">`,
      `${i1}<div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-lg" style={{ background: "${lightBg}" }}>${iconEmoji}</div>`,
      `${i1}<div className="flex-1 min-w-0">`,
      `${i2}<p className="text-[13px] truncate ${titleWeight} text-gray-900">${props.title}</p>`,
      `${i2}<p className="text-[12px] mt-0.5 truncate text-gray-500">${props.body}</p>`,
      `${i2}<p className="text-[11px] mt-0.5 text-gray-400">${props.time}</p>`,
      `${i1}</div>${unreadDot}`,
      `${i0}</div>`,
    ].join("\n")
  },
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const tabsDef: ComponentDefinition = {
  type: "Tabs",
  label: "Tabs",
  icon: RiLayoutColumnLine,
  description: "Tab navigation với nhiều nội dung — kéo component vào tab",
  category: "layout",
  acceptsChildren: true,
  zmpImports: [],
  defaultProps: { tab1Label: "Tab 1", tab2Label: "Tab 2", tab3Label: "", activeTab: "1" },
  propSchema: {
    tab1Label: { label: "Tab 1", type: "string", defaultValue: "Tab 1" },
    tab2Label: { label: "Tab 2", type: "string", defaultValue: "Tab 2" },
    tab3Label: { label: "Tab 3 (tùy chọn)", type: "string", defaultValue: "" },
    activeTab: { label: "Tab mặc định", type: "select", defaultValue: "1", options: ["1", "2", "3"] },
  },
  renderer: (props, children) => {
    const active = (props.activeTab as string) ?? "1"
    const hasTab3 = Boolean(props.tab3Label as string)
    return (
      <Tabs defaultValue={active} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="1" className="flex-1">{props.tab1Label as string}</TabsTrigger>
          <TabsTrigger value="2" className="flex-1">{props.tab2Label as string}</TabsTrigger>
          {hasTab3 && (
            <TabsTrigger value="3" className="flex-1">{props.tab3Label as string}</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value={active} className="min-h-12">
          {children ?? (
            <div
              className="flex items-center justify-center py-6 text-xs rounded-lg"
              style={{ border: "2px dashed rgba(0,104,255,0.2)", color: "rgba(0,104,255,0.4)" }}
            >
              Thả component vào đây
            </div>
          )}
        </TabsContent>
        {active !== "2" && <TabsContent value="2" />}
        {hasTab3 && active !== "3" && <TabsContent value="3" />}
      </Tabs>
    )
  },
  toJSX: (props, renderChildren, level, nodeId) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const hasTab3 = Boolean(props.tab3Label as string)
    const safeId = nodeId ? nodeId.replace(/[^a-zA-Z0-9]/g, "_") : "tabs"
    const varName = `activeTab_${safeId}`
    const setter = `set${varName.charAt(0).toUpperCase()}${varName.slice(1)}`
    const defaultActive = (props.activeTab as string) ?? "1"
    const children = renderChildren(level + 2)
    const tabLabels = [props.tab1Label as string, props.tab2Label as string, hasTab3 ? props.tab3Label as string : null].filter(Boolean) as string[]
    const tabBtns = tabLabels.map((label, idx) => {
      const key = String(idx + 1)
      return `${i2}<button onClick={() => ${setter}("${key}")} style={{ flex: 1, padding: "10px 4px", fontSize: 13, background: "none", border: "none", cursor: "pointer", fontWeight: ${varName} === "${key}" ? 600 : 500, color: ${varName} === "${key}" ? "#0068FF" : "#6B7280", borderBottom: ${varName} === "${key}" ? "2px solid #0068FF" : "2px solid transparent" }}>${label}</button>`
    }).join("\n")
    const tabContents = tabLabels.map((_, idx) => {
      const key = String(idx + 1)
      const content = key === defaultActive && children ? children : `${i2}{/* Nội dung Tab ${key} */}`
      return `${i1}{${varName} === "${key}" && (\n${i2}<>\n${content}\n${i2}</>\n${i1})}`
    }).join("\n")
    return [
      `${i0}<div style={{ display: "flex", flexDirection: "column", width: "100%" }}>`,
      `${i1}<div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>`,
      tabBtns,
      `${i1}</div>`,
      `${i1}<div style={{ paddingTop: 12 }}>`,
      tabContents,
      `${i1}</div>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

// ─── SelectField ──────────────────────────────────────────────────────────────

const selectFieldDef: ComponentDefinition = {
  type: "SelectField",
  label: "Select",
  icon: RiArrowDownSLine,
  description: "Dropdown chọn giá trị từ danh sách tùy chỉnh",
  category: "form",
  acceptsChildren: false,
  zmpImports: [],
  defaultProps: { label: "Danh mục", placeholder: "Chọn...", options: "Tùy chọn 1, Tùy chọn 2, Tùy chọn 3", required: false },
  propSchema: {
    label: { label: "Label", type: "string", defaultValue: "Danh mục" },
    placeholder: { label: "Placeholder", type: "string", defaultValue: "Chọn..." },
    options: { label: "Danh sách (phân cách bằng dấu phẩy)", type: "textarea", defaultValue: "Tùy chọn 1, Tùy chọn 2, Tùy chọn 3" },
    required: { label: "Bắt buộc", type: "boolean", defaultValue: false },
  },
  renderer: (props) => {
    const options = (props.options as string).split(",").map((o) => o.trim()).filter(Boolean)
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium" style={{ color: tk.textSecondary }}>
          {props.label as string}
          {(props.required as boolean) && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <Select>
          <SelectTrigger className="w-full h-10 text-sm">
            <SelectValue placeholder={props.placeholder as string} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  },
  toJSX: (props, _renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const options = (props.options as string).split(",").map((o) => o.trim()).filter(Boolean)
    const optItems = options.map((o) => `${i2}<option value="${o}">${o}</option>`).join("\n")
    const req = props.required ? ` required` : ""
    return [
      `${i0}<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>`,
      `${i1}<label style={{ fontSize: 13, fontWeight: 500, color: "#6B7280" }}>${props.label}</label>`,
      `${i1}<select style={{ height: 40, borderRadius: 8, border: "1px solid #E5E7EB", padding: "0 12px", fontSize: 14, color: "#111827", background: "white", outline: "none" }}${req}>`,
      `${i2}<option value="">${props.placeholder}</option>`,
      optItems,
      `${i1}</select>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

// ─── BottomSheet ──────────────────────────────────────────────────────────────

const bottomSheetDef: ComponentDefinition = {
  type: "BottomSheet",
  label: "Bottom Sheet",
  icon: RiLayoutBottomLine,
  description: "Panel trượt từ dưới lên — thiết kế nội dung sheet",
  category: "layout",
  acceptsChildren: true,
  zmpImports: [],
  defaultProps: { title: "Tiêu đề Sheet", description: "", showHandle: true },
  propSchema: {
    title: { label: "Tiêu đề", type: "string", defaultValue: "Tiêu đề Sheet" },
    description: { label: "Mô tả", type: "string", defaultValue: "" },
    showHandle: { label: "Hiện drag handle", type: "boolean", defaultValue: true },
  },
  renderer: (props, children) => (
    <div
      className="flex flex-col w-full bg-white pt-2 pb-4 px-4"
      style={{ borderRadius: "16px 16px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.10)", border: tk.border }}
    >
      {(props.showHandle as boolean) && (
        <div className="w-9 h-1 rounded-full bg-zinc-200 mx-auto mb-3 shrink-0" />
      )}
      {(props.title as string) && (
        <h3 className="text-[15px] font-bold mb-1" style={{ color: tk.textPrimary }}>
          {props.title as string}
        </h3>
      )}
      {(props.description as string) && (
        <p className="text-[13px] mb-3" style={{ color: tk.textSecondary }}>
          {props.description as string}
        </p>
      )}
      {children ?? (
        <div
          className="flex items-center justify-center py-6 text-xs rounded-lg"
          style={{ border: "2px dashed rgba(0,104,255,0.2)", color: "rgba(0,104,255,0.4)" }}
        >
          Thả component vào đây
        </div>
      )}
    </div>
  ),
  toJSX: (props, renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1)
    const handle = (props.showHandle as boolean)
      ? `\n${i1}<div style={{ width: 36, height: 4, borderRadius: 9999, background: "#E5E7EB", margin: "0 auto 12px" }} />`
      : ""
    const title = (props.title as string)
      ? `\n${i1}<h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>${props.title}</h3>`
      : ""
    const desc = (props.description as string)
      ? `\n${i1}<p style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>${props.description}</p>`
      : ""
    const children = renderChildren(level + 1)
    return [
      `${i0}<div style={{ display: "flex", flexDirection: "column", width: "100%", background: "white", paddingTop: 8, paddingBottom: 16, paddingLeft: 16, paddingRight: 16, borderRadius: "16px 16px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.10)" }}>${handle}${title}${desc}`,
      children ?? "",
      `${i0}</div>`,
    ].join("\n")
  },
}

// ─── ModalCard ────────────────────────────────────────────────────────────────

const modalCardDef: ComponentDefinition = {
  type: "ModalCard",
  label: "Modal",
  icon: RiWindowLine,
  description: "Hộp thoại modal — thiết kế nội dung dialog",
  category: "layout",
  acceptsChildren: true,
  zmpImports: [],
  defaultProps: { title: "Tiêu đề Modal", description: "", showClose: true },
  propSchema: {
    title: { label: "Tiêu đề", type: "string", defaultValue: "Tiêu đề Modal" },
    description: { label: "Mô tả", type: "string", defaultValue: "" },
    showClose: { label: "Hiện nút đóng", type: "boolean", defaultValue: true },
  },
  renderer: (props, children) => (
    <div
      className="flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", borderRadius: tk.radius.xl }}
    >
      <div
        className="bg-white w-full flex flex-col gap-2"
        style={{ borderRadius: tk.radius.xl, padding: 20, boxShadow: tk.shadow.lg }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold" style={{ color: tk.textPrimary }}>
              {props.title as string}
            </h3>
            {(props.description as string) && (
              <p className="text-[13px] mt-0.5" style={{ color: tk.textSecondary }}>
                {props.description as string}
              </p>
            )}
          </div>
          {(props.showClose as boolean) && (
            <RiCloseCircleLine style={{ fontSize: 20, color: tk.textTertiary, flexShrink: 0, marginLeft: 8 }} />
          )}
        </div>
        {children ?? (
          <div
            className="flex items-center justify-center py-4 text-xs rounded-lg"
            style={{ border: "2px dashed rgba(0,104,255,0.2)", color: "rgba(0,104,255,0.4)" }}
          >
            Thả component vào đây
          </div>
        )}
      </div>
    </div>
  ),
  toJSX: (props, renderChildren, level) => {
    const i0 = ind(level), i1 = ind(level + 1), i2 = ind(level + 2)
    const closeBtn = (props.showClose as boolean)
      ? `\n${i2}<span style={{ fontSize: 20, color: "#9CA3AF", cursor: "pointer", flexShrink: 0, marginLeft: 8 }}>✕</span>`
      : ""
    const desc = (props.description as string)
      ? `\n${i2}<p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>${props.description}</p>`
      : ""
    const children = renderChildren(level + 2)
    return [
      `${i0}<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.35)", borderRadius: 24 }}>`,
      `${i1}<div style={{ background: "white", width: "100%", display: "flex", flexDirection: "column", gap: 8, borderRadius: 20, padding: 20, boxShadow: "0 20px 48px rgba(0,0,0,0.2)" }}>`,
      `${i2}<div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>`,
      `${i2}<div style={{ flex: 1, minWidth: 0 }}>`,
      `${i2}<h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>${props.title}</h3>${desc}`,
      `${i2}</div>${closeBtn}`,
      `${i2}</div>`,
      children ?? "",
      `${i1}</div>`,
      `${i0}</div>`,
    ].join("\n")
  },
}

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
  ProductCard: productCardDef,
  StatCard: statCardDef,
  UserProfileCard: userProfileCardDef,
  NotificationItem: notificationItemDef,
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
  HeroSection: heroSectionDef,
  Tabs: tabsDef,
  SelectField: selectFieldDef,
  Carousel: carouselDef,
  Skeleton: skeletonDef,
  BottomSheet: bottomSheetDef,
  ModalCard: modalCardDef,
}

export const categoryOrder = ["zalo", "layout", "ui", "form"] as const
export type CategoryKey = (typeof categoryOrder)[number]

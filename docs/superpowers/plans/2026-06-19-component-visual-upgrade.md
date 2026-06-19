# Component Visual Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade all 23 component `renderer` functions in `src/registry/index.tsx` to a Modern iOS/Android Clean aesthetic and add 5 new components.

**Architecture:** Approach A — single-file token-first rewrite. A `tk` design-token constant is inserted near the top of `registry/index.tsx`; every renderer is rewritten to use it. `toJSX`, `propSchema`, and `defaultProps` are NOT touched. `exportCode.ts` needs no changes — it is fully registry-driven via `toJSX`.

**Tech Stack:** React (inline JSX), Tailwind CSS v3 (static classes only for layout; dynamic values go in `style={{}}`), react-icons/ri (already installed).

## Global Constraints

- Only `src/registry/index.tsx` is modified.
- `toJSX`, `propSchema`, `defaultProps`, `zmpImports`, `acceptsChildren`, `label`, `icon`, `description`, `category` — none of these change on existing components.
- No new npm packages.
- Dynamic Tailwind class interpolation (e.g. `text-${size}`) must be kept where it already exists; do not introduce new ones. Dynamic values go in `style={{}}`.
- Existing `const ind = (n) => "  ".repeat(n)` stays at line 30.
- `const tk = { ... }` is inserted at line 31 (immediately after `ind`).
- All new icons are imported from `react-icons/ri` only.
- No `backdrop-filter` Tailwind class — use `style={{ backdropFilter: "...", WebkitBackdropFilter: "..." }}` for blur.

---

## Task 1: Add `tk` token object + new icon imports

**Files:**
- Modify: `src/registry/index.tsx` — lines 1–30 (imports + ind helper)

**What changes:**
1. Extend the existing react-icons import block with new icons.
2. Insert `const tk = { ... }` after the `ind` helper.

- [ ] **Step 1: Add new icon imports**

  In `src/registry/index.tsx`, replace the existing import block (lines 2–27):

  ```tsx
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
  ```

- [ ] **Step 2: Insert `tk` constant after `ind` helper**

  After line `const ind = (n: number) => "  ".repeat(n)`, insert:

  ```ts
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
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  cd react-builder && npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: zero errors. If icons are not found, check the exact name at [react-icons.github.io](https://react-icons.github.io/react-icons/icons/ri/).

- [ ] **Step 4: Commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: add design token system (tk) and new react-icons to registry"
  ```

---

## Task 2: Upgrade Layout component renderers (Stack, Grid, Divider, Spacer)

**Files:**
- Modify: `src/registry/index.tsx` — `stackDef.renderer`, `gridDef.renderer`, `dividerDef.renderer`, `spacerDef.renderer`

- [ ] **Step 1: Rewrite Stack renderer**

  Replace only the `renderer` property of `stackDef`:

  ```tsx
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
  ```

- [ ] **Step 2: Rewrite Grid renderer**

  Replace only the `renderer` property of `gridDef`:

  ```tsx
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
  ```

- [ ] **Step 3: Rewrite Divider renderer**

  Replace only the `renderer` property of `dividerDef`:

  ```tsx
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
  ```

- [ ] **Step 4: Rewrite Spacer renderer**

  Replace only the `renderer` property of `spacerDef`:

  ```tsx
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
  ```

- [ ] **Step 5: Start dev server and verify visually**

  ```bash
  cd react-builder && npm run dev
  ```

  Open `http://localhost:3000`. Drag Stack, Grid, Divider, Spacer to canvas. Check:
  - Stack/Grid show soft blue dashed placeholder when empty.
  - Divider renders as a thin colored band (not an `<hr>` border).
  - Spacer shows a diagonal dot pattern.

- [ ] **Step 6: Commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: upgrade layout component renderers (Stack, Grid, Divider, Spacer)"
  ```

---

## Task 3: Upgrade ZaloPage, ZaloHeader, ZaloBottomNav renderers

**Files:**
- Modify: `src/registry/index.tsx` — `zaloPageDef.renderer`, `zaloHeaderDef.renderer`, `zaloBottomNavDef.renderer`
- Also insert `emojiIconMap` constant before `zaloBottomNavDef`.

- [ ] **Step 1: Rewrite ZaloPage renderer**

  Replace only the `renderer` property of `zaloPageDef`:

  ```tsx
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
  ```

- [ ] **Step 2: Rewrite ZaloHeader renderer**

  Replace only the `renderer` property of `zaloHeaderDef`:

  ```tsx
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
  ```

- [ ] **Step 3: Insert `emojiIconMap` before `zaloBottomNavDef`**

  Insert this constant immediately before `const zaloBottomNavDef`:

  ```ts
  const emojiIconMap: Record<string, React.ElementType> = {
    "🏠": RiHomeLine,
    "🔍": RiSearchLine,
    "👤": RiUserLine,
    "⭐": RiStarLine,
    "🛒": RiShoppingCartLine,
    "❤️": RiHeartLine,
    "⚙️": RiSettings3Line,
  }
  ```

- [ ] **Step 4: Rewrite ZaloBottomNav renderer**

  Replace only the `renderer` property of `zaloBottomNavDef`:

  ```tsx
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
  ```

- [ ] **Step 5: Verify visually**

  With dev server running, drag ZaloPage, ZaloHeader, ZaloBottomNav to canvas.
  - Header: gradient blue when bgColor is default, icon back button visible.
  - BottomNav: frosted glass appearance, emoji 🏠 → RiHomeLine icon, active tab has blue pill indicator above icon.
  - Page: dashed placeholder when empty.

- [ ] **Step 6: Commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: upgrade ZaloPage, ZaloHeader, ZaloBottomNav renderers"
  ```

---

## Task 4: Upgrade ZaloCard, ZaloList, ZaloListItem, ZaloAvatar, ZaloTag, ZaloSection renderers

**Files:**
- Modify: `src/registry/index.tsx` — renderers for the 6 listed components

- [ ] **Step 1: Rewrite ZaloCard renderer**

  Replace only the `renderer` property of `zaloCardDef`:

  ```tsx
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
  ```

- [ ] **Step 2: Rewrite ZaloList renderer**

  Replace only the `renderer` property of `zaloListDef`:

  ```tsx
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
  ```

- [ ] **Step 3: Rewrite ZaloListItem renderer**

  Replace only the `renderer` property of `zaloListItemDef`:

  ```tsx
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
  ```

- [ ] **Step 4: Rewrite ZaloAvatar renderer**

  Replace only the `renderer` property of `zaloAvatarDef`:

  ```tsx
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
  ```

- [ ] **Step 5: Rewrite ZaloTag renderer**

  Replace only the `renderer` property of `zaloTagDef`:

  ```tsx
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
  ```

- [ ] **Step 6: Rewrite ZaloSection renderer**

  Replace only the `renderer` property of `zaloSectionDef`:

  ```tsx
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
  ```

- [ ] **Step 7: Verify visually**

  With dev server running, drag each of the 6 components to canvas:
  - Card: rounded-xl white surface with layered shadow, subtle border.
  - List: clean rows with inset divider, react-icon arrow.
  - ListItem: gradient avatar with ring, react-icon arrow.
  - Avatar: gradient initials background with white ring.
  - Tag: dot + colored pill, no hard border.
  - Section: tighter typography, accent link with arrow icon.

- [ ] **Step 8: Commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: upgrade ZaloCard, ZaloList, ZaloListItem, ZaloAvatar, ZaloTag, ZaloSection renderers"
  ```

---

## Task 5: Upgrade ZaloButton, ZaloInput, ZaloSearchBar renderers

**Files:**
- Modify: `src/registry/index.tsx` — renderers for 3 components

- [ ] **Step 1: Rewrite ZaloButton renderer**

  Replace only the `renderer` property of `zaloBtnDef`:

  ```tsx
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
  ```

- [ ] **Step 2: Rewrite ZaloInput renderer**

  Replace only the `renderer` property of `zaloInputDef`:

  ```tsx
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
  ```

- [ ] **Step 3: Rewrite ZaloSearchBar renderer**

  Replace only the `renderer` property of `zaloSearchBarDef`:

  ```tsx
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
  ```

- [ ] **Step 4: Verify visually**

  Drag Button (all 3 variants), Input, SearchBar to canvas:
  - Primary button: gradient blue with shadow.
  - Secondary button: white with blue border.
  - Tertiary button: transparent with underlined text.
  - Input: user icon on left, clean border.
  - SearchBar: gray frosted pill, magnifier icon.

- [ ] **Step 5: Commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: upgrade ZaloButton, ZaloInput, ZaloSearchBar renderers"
  ```

---

## Task 6: Upgrade UI component renderers (Text, Image, Banner, ProgressBar, Switch, Rating, Textarea, Chip)

**Files:**
- Modify: `src/registry/index.tsx` — renderers for 8 UI components

- [ ] **Step 1: Rewrite Text renderer**

  Replace only the `renderer` property of `textDef`:

  ```tsx
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
  ```

- [ ] **Step 2: Rewrite Image renderer**

  Replace only the `renderer` property of `imageDef`:

  ```tsx
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
  ```

- [ ] **Step 3: Rewrite Banner renderer**

  Replace only the `renderer` property of `bannerDef`. Also replace the `styles` object and use react-icons instead of emoji:

  ```tsx
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
  ```

- [ ] **Step 4: Rewrite ProgressBar renderer**

  Replace only the `renderer` property of `progressBarDef`:

  ```tsx
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
  ```

- [ ] **Step 5: Rewrite Switch renderer**

  Replace only the `renderer` property of `switchDef`:

  ```tsx
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
  ```

- [ ] **Step 6: Rewrite Rating renderer**

  Replace only the `renderer` property of `ratingDef`:

  ```tsx
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
  ```

- [ ] **Step 7: Rewrite Textarea renderer**

  Replace only the `renderer` property of `textareaDef`:

  ```tsx
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
  ```

- [ ] **Step 8: Rewrite Chip renderer**

  Replace only the `renderer` property of `chipDef`:

  ```tsx
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
  ```

- [ ] **Step 9: Verify visually**

  Drag each UI component to canvas:
  - Text: good line-height, color renders.
  - Image: corners clipped cleanly by overflow:hidden wrapper.
  - Banner: glass-look tinted surface, react-icon (no emoji).
  - ProgressBar: gradient fill bar, monospace % badge.
  - Switch: knob shadow, glow when active.
  - Rating: stars with amber drop-shadow, value badge.
  - Textarea: clean border, char-count hint.
  - Chip: gradient active vs flat inactive.

- [ ] **Step 10: Commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: upgrade UI component renderers (Text, Image, Banner, ProgressBar, Switch, Rating, Textarea, Chip)"
  ```

---

## Task 7: Add ProductCard and HeroSection components

**Files:**
- Modify: `src/registry/index.tsx` — add 2 new `ComponentDefinition` constants + 2 registry entries

- [ ] **Step 1: Add ProductCard definition**

  Insert the following before `// ─── Registry exports`:

  ```tsx
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
        <div className="p-3">
          <p className="text-[13px] font-semibold truncate mb-1.5" style={{ color: tk.textPrimary }}>
            {props.name as string}
          </p>
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                className="w-3 h-3"
                fill={i < (props.rating as number) ? "#F59E0B" : "none"}
                stroke={i < (props.rating as number) ? "#F59E0B" : "#D1D5DB"}
                strokeWidth={1.5}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[15px] font-bold" style={{ color: tk.accent }}>
                {props.price as string}
              </span>
              {(props.originalPrice as string) && (
                <span className="text-[11px] line-through ml-1.5" style={{ color: tk.textTertiary }}>
                  {props.originalPrice as string}
                </span>
              )}
            </div>
            <button
              className="text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: tk.accentGrad }}
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
    ),
    toJSX: (props, _renderChildren, level) =>
      `${ind(level)}<div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">{/* ProductCard: ${props.name} */}</div>`,
  }
  ```

- [ ] **Step 2: Add HeroSection definition**

  Insert immediately after `productCardDef`:

  ```tsx
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
    toJSX: (props, _renderChildren, level) =>
      `${ind(level)}<div className="relative w-full overflow-hidden rounded-2xl">{/* HeroSection: ${props.heading} */}</div>`,
  }
  ```

- [ ] **Step 3: Register both new components**

  In the `registry` export object at the bottom, add after the last `Chip` entry:

  ```ts
  // New components
  ProductCard: productCardDef,
  HeroSection: heroSectionDef,
  ```

- [ ] **Step 4: Verify visually**

  Drag ProductCard and HeroSection to canvas:
  - ProductCard: image, badge pill, stars, price in blue, Thêm button.
  - HeroSection: overlay gradient, white heading + subtext, white CTA button bottom-left.
  - Both appear in the component panel under correct categories.

- [ ] **Step 5: Commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: add ProductCard and HeroSection components"
  ```

---

## Task 8: Add StatCard, UserProfileCard, NotificationItem components

**Files:**
- Modify: `src/registry/index.tsx` — add 3 new defs + helpers + registry entries

- [ ] **Step 1: Insert `statIconMap` and `StatCard` definition**

  Insert after `heroSectionDef`:

  ```tsx
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
    toJSX: (props, _renderChildren, level) =>
      `${ind(level)}<div className="bg-white rounded-xl p-4 shadow-sm border border-black/5">{/* StatCard: ${props.label} */}</div>`,
  }
  ```

- [ ] **Step 2: Add UserProfileCard definition**

  Insert after `statCardDef`:

  ```tsx
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
    toJSX: (props, _renderChildren, level) =>
      `${ind(level)}<div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5">{/* UserProfileCard: ${props.name} */}</div>`,
  }
  ```

- [ ] **Step 3: Insert `notifIconMap` and `NotificationItem` definition**

  Insert after `userProfileCardDef`:

  ```tsx
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
    toJSX: (props, _renderChildren, level) =>
      `${ind(level)}<div className="flex items-start gap-3 px-4 py-3">{/* NotificationItem: ${props.title} */}</div>`,
  }
  ```

- [ ] **Step 4: Register all 3 new components**

  In the `registry` export object, add after `HeroSection`:

  ```ts
  StatCard: statCardDef,
  UserProfileCard: userProfileCardDef,
  NotificationItem: notificationItemDef,
  ```

- [ ] **Step 5: Verify TypeScript compiles**

  ```bash
  cd react-builder && npx tsc --noEmit 2>&1 | head -30
  ```

  Expected: zero errors.

- [ ] **Step 6: Verify visually**

  With dev server running, drag each to canvas:
  - StatCard: icon in colored square, large number, green trend badge.
  - UserProfileCard: gradient top band, avatar overlapping the band with white ring, 3-stat row.
  - NotificationItem: colored icon circle, bold title when unread, blue dot right side.
  - All 3 appear in the component panel.

- [ ] **Step 7: Final commit**

  ```bash
  git add react-builder/src/registry/index.tsx
  git commit -m "feat: add StatCard, UserProfileCard, NotificationItem components"
  ```

---

## Self-Review

**Spec coverage:**
- ✅ `tk` token object — Task 1
- ✅ All 23 existing component renderers upgraded — Tasks 2–6
- ✅ 5 new components added — Tasks 7–8
- ✅ New icon imports — Task 1
- ✅ `toJSX` / `propSchema` / `defaultProps` untouched — enforced per-step
- ✅ No exportCode.ts change needed (confirmed by reading the file — it is registry-driven)

**Placeholder scan:** No TBD/TODO. All renderers have complete JSX.

**Type consistency:** All new components use `ComponentDefinition` type. `statIconMap`, `notifIconMap`, `emojiIconMap` use `React.ElementType` consistently. `tk` is a plain `const` — no typing conflicts.

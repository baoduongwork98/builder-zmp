# Component Visual Upgrade — Design Spec

**Date:** 2026-06-19  
**Scope:** `react-builder/src/registry/index.tsx`  
**Approach:** Approach A — Token-first inline rewrite, all changes in one file

---

## Goal

Upgrade the `renderer` of every component in the registry from basic Tailwind-utility styling to a **Modern iOS/Android Clean** aesthetic (iOS 17 / Material 3 inspired). Simultaneously add 5 new components. The `toJSX` export functions are **not changed** — only the in-canvas renderer visuals change.

---

## Design Token System

A single `tk` constant at the top of the file (not exported), used by all renderers:

```ts
const tk = {
  shadow: {
    xs: "0 1px 2px rgba(0,0,0,0.04)",
    sm: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.08)",
    md: "0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.10)",
    lg: "0 4px 16px rgba(0,0,0,0.10), 0 16px 40px rgba(0,0,0,0.12)",
  },
  border: "1px solid rgba(0,0,0,0.06)",
  borderFocus: "1px solid rgba(0,104,255,0.5)",
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

---

## Existing Component Upgrades

### Layout Category

#### Stack
- Placeholder: dashed border `2px dashed rgba(0,104,255,0.2)` + centered drop-hint text `text-[#0068FF]/40`
- No visual change to layout itself — just placeholder state

#### Grid
- Same placeholder upgrade as Stack (dashed accent border, center hint)

#### Divider
- `border: none`, use `height: thickness` + `background: rgba(0,0,0,0.06)` instead of `border-color` — cleaner 1px line

#### Spacer
- Replace dashed outline with `background: repeating-linear-gradient(...)` dot pattern grid, opacity 0.3

---

### Zalo Category

#### ZaloPage
- No visual change (it's a full-page wrapper) — keep `bgColor` prop, just improve placeholder text style

#### ZaloHeader
- Background: use `accentGrad` when `bgColor === "#0068FF"`, else solid `bgColor`
- Back button: replace `‹` text with `<RiArrowLeftSLine />` icon, `text-white text-2xl`
- Title: `font-semibold text-[15px] tracking-[-0.2px]` — tighter, more iOS-like
- Height: keep 44px (status bar) but add `padding-bottom: 2px` for baseline alignment

#### ZaloBottomNav
- Container: `bg-white/95 backdrop-blur-xl`, `border-top: 1px solid rgba(0,0,0,0.06)`, height `60px`
- Tab icons: replace emoji props (`tab1Icon` etc.) with react-icons lookup table: `{ "🏠": RiHomeLine, "🔍": RiSearchLine, "👤": RiUserLine, "⭐": RiStarLine, "🛒": RiShoppingCartLine, "❤️": RiHeartLine, "⚙️": RiSettings3Line }`. Fall back to raw string if not found.
- Active tab: icon in `color: accent`, label `text-[10px] font-semibold text-[#0068FF]`; inactive: `text-gray-400`
- Active indicator: 3px pill `bg-[#0068FF]` centered above icon (not below)
- Icon size: 22px

#### ZaloCard
- `border-radius: 16px`, `border: 1px solid rgba(0,0,0,0.06)`, `box-shadow: tk.shadow.sm`
- Padding map: `sm=12px, md=16px, lg=20px`
- Remove `shadow-sm` Tailwind class, use inline `boxShadow`

#### ZaloList
- Container: `rounded-2xl overflow-hidden`, `border: tk.border`, `box-shadow: tk.shadow.xs`
- Row separator: `border-top: 1px solid rgba(0,0,0,0.05)` (except first row) — replace `divide-y divide-gray-100`
- Row mock items: updated typography using `tk.textPrimary / tk.textSecondary`

#### ZaloListItem
- Avatar (when shown): gradient background `linear-gradient(135deg, #0068FF, #7C3AED)` instead of flat blue; `ring: 2px solid white, box-shadow: 0 0 0 3px rgba(0,104,255,0.15)`
- Arrow: replace `›` with `<RiArrowRightSLine className="text-gray-300 text-lg" />`
- Title: `text-[14px] font-semibold`, subtitle: `text-[12px] text-gray-500`

#### ZaloAvatar
- Initials fallback: gradient `linear-gradient(135deg, #0068FF 0%, #7C3AED 100%)`
- Ring: `box-shadow: 0 0 0 2px white, 0 0 0 4px rgba(0,104,255,0.2)`
- Size map: `sm=32, md=48, lg=64, xl=80` — unchanged

#### ZaloTag
- Each color variant: pill with 2px left border accent, `bg-{color}/8 border border-{color}/15`
- Add subtle `font-medium text-[11px] tracking-wide uppercase` option already via existing prop

#### ZaloButton
- `primary`: `background: accentGrad`, `box-shadow: accentShadow`, `border-radius: 12px`, `padding: 12px 20px`, `font-semibold text-[15px] tracking-[-0.1px]`
- `secondary`: `bg-white border border-[#0068FF]/20 text-[#0068FF]`, same radius/padding
- `tertiary`: no background, no border, `text-[#0068FF] font-medium`, underline on the text
- Full-width: `width: 100%`

#### ZaloInput
- Label: `text-[13px] font-medium text-gray-600 mb-1.5`
- Field wrapper: `border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 12px`, `padding: 11px 14px`, `bg-white`
- Focus visual (static in canvas): default state rendered clean
- Required asterisk: `text-red-500`
- Icon slot: left icon hint `RiUserLine` faint gray (decorative only, no prop — just visual upgrade)

#### ZaloSearchBar
- Container: `bg-black/5 rounded-xl px-3 py-2.5 mx-4`
- Icon: replace emoji `🔍` with `<RiSearchLine className="text-gray-400 text-[15px]" />`
- Input: `text-[14px] text-gray-700 placeholder:text-gray-400`

#### ZaloSection
- Title: `text-[15px] font-semibold tracking-[-0.2px] text-gray-900`
- Link: accent color + `<RiArrowRightSLine />` inline icon
- Optional subtle separator below title: `border-bottom: 1px solid rgba(0,0,0,0.05)` when `subtitle` is set

---

### UI Category

#### Text
- Default `lineHeight: 1.6` added to renderer style
- No structural change

#### Image
- Add `overflow: hidden` on wrapper to respect `rounded` — currently missing
- No other change

#### Banner
- Container: `bg-white/80 backdrop-blur-sm rounded-2xl border border-{color}/15 p-4`
- Replace emoji icons with react-icons: `info → RiInformationLine`, `success → RiCheckboxCircleLine`, `warning → RiAlertLine`, `error → RiCloseCircleLine`
- Icon colored via `color: {semantic color}`, size `text-lg`

#### ProgressBar
- Track: `height: 6px` (up from 4px), `border-radius: 9999px`
- Fill: gradient `linear-gradient(90deg, accent 0%, #60A5FA 100%)`
- Value badge: `font-mono text-[11px] font-semibold` in a `rounded-md bg-gray-100 px-1.5 py-0.5`

#### Switch
- Knob: `box-shadow: 0 1px 4px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.12)`
- Track: `transition: background-color 200ms`
- Active track: subtle glow `box-shadow: 0 0 0 3px rgba(0,104,255,0.12)`

#### Rating
- SVG stars: filled ones get `filter: drop-shadow(0 1px 2px rgba(245,158,11,0.4))`
- Value badge: `bg-amber-50 text-amber-700 rounded-md px-1.5 py-0.5 text-[11px] font-semibold`

#### Textarea
- Same field style as ZaloInput: `border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 12px`, `px-4 py-3`
- Character count hint (decorative): faint `text-gray-300 text-[11px]` bottom-right `0/∞`

#### Chip
- Active: `background: accent, color: white, box-shadow: tk.accentShadow scale(1)`, `border-radius: 9999px`
- Inactive: `bg-black/[0.05] text-gray-600 border-transparent`
- Padding: `px-4 py-1.5 text-[13px] font-medium`

---

## New Components

All 5 new components use `tk` tokens and follow the same aesthetic.

### ProductCard
- **Category:** `zalo`
- **Props:** `imageSrc`, `name`, `price`, `originalPrice`, `rating`, `badge` (text | empty)
- **Renderer:** Image (aspect-ratio 4/3, `object-cover rounded-t-2xl`) + content area (`p-3`): badge pill (if set), product name `font-semibold text-[14px]`, price row (`text-[#0068FF] font-bold` + strikethrough old price `text-gray-400 text-xs`), rating stars (small, 12px) + "Thêm" button (small, accent, `rounded-xl px-3 py-1.5 text-xs`)
- **acceptsChildren:** false

### HeroSection
- **Category:** `ui`
- **Props:** `imageSrc`, `heading`, `subtext`, `ctaLabel`, `overlayOpacity` (0–80)
- **Renderer:** `relative` container, background image `object-cover`, `inset-0` gradient overlay `rgba(0,0,0,opacity)`, content centered bottom-left: heading `text-2xl font-bold text-white`, subtext `text-sm text-white/80`, CTA `<ZaloButton>` style white pill button
- **acceptsChildren:** false

### StatCard
- **Category:** `ui`
- **Props:** `value`, `label`, `icon` (select: `user`, `cart`, `money`, `chart`, `heart`, `star`), `color` (color picker), `trend` (+N% | empty)
- **Renderer:** Card surface (`rounded-2xl border border-black/6 shadow-sm p-4`), icon in colored rounded square (`rounded-xl w-10 h-10`), value `text-2xl font-bold`, label `text-xs text-gray-500`, trend pill (`bg-green-50 text-green-600 text-[11px]`)
- **acceptsChildren:** false

### UserProfileCard
- **Category:** `zalo`
- **Props:** `avatarSrc`, `name`, `bio`, `stat1Label/Value`, `stat2Label/Value`, `stat3Label/Value`
- **Renderer:** Gradient top band `h-20` + centered avatar overlapping boundary, name `text-[17px] font-bold`, bio `text-sm text-gray-500`, 3-column stats row with `border-t border-black/5 mt-3 pt-3`
- **acceptsChildren:** false

### NotificationItem
- **Category:** `zalo`
- **Props:** `title`, `body`, `time`, `iconColor` (color), `unread` (boolean)
- **Renderer:** Row with colored icon circle (`w-10 h-10 rounded-full flex-center`), title `font-semibold text-[13px]` (bold if unread), body `text-[12px] text-gray-500 line-clamp-1`, time `text-[11px] text-gray-400`, unread dot `w-2 h-2 bg-[#0068FF] rounded-full` right side
- **acceptsChildren:** false

---

## Constraints

- `toJSX` functions: **not modified** for any existing component.
- `propSchema` and `defaultProps`: **not modified** for existing components (no breaking changes).
- New components: must add entries to `ZMP_COMPONENT_MAP` in `src/lib/exportCode.ts` with a simple passthrough `toJSX`.
- All new icons used must already be imported from `react-icons/ri`.
- No new npm dependencies.
- Additional react-icons needed (not yet imported): `RiHomeLine`, `RiShoppingCartLine`, `RiHeartLine`, `RiSettings3Line`, `RiShoppingBag3Line`, `RiMoneyDollarCircleLine`, `RiBarChartLine`, `RiArrowLeftSLine`, `RiArrowRightSLine`, `RiInformationLine`, `RiCheckboxCircleLine`, `RiCloseCircleLine` — all from `react-icons/ri`, no new package needed.
- `backdrop-blur` works in Tailwind as `backdrop-blur-xl` — already in Tailwind config (assumed; verify if purge issue arises).

---

## Files Changed

| File | Change |
|---|---|
| `src/registry/index.tsx` | Add `tk` token object; rewrite all 23 renderers; add 5 new component defs + registry entries |
| `src/lib/exportCode.ts` | Add 5 new entries to `ZMP_COMPONENT_MAP` |

---

## Out of Scope

- `PropertiesPanel` changes (no new prop types needed)
- `ComponentPanel` changes (new components will appear automatically via registry)
- `toJSX` / code export quality
- Animation / interactive states (canvas is static preview)

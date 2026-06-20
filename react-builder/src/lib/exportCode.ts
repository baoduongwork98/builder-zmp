import { ComponentNode, PageSchema, AppConfig, Action, NodeEvents, Variable, ApiDefinition } from "@/types/builder"
import { registry } from "@/registry/index"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function indent(level: number) {
  return "  ".repeat(level)
}

/** Deduplicate page component names (e.g. two pages both named "Trang 1"). */
function makeComponentName(pageName: string, usedNames: Set<string>): string {
  const base =
    pageName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("") || "Page"

  const candidate = `${base}Page`
  if (!usedNames.has(candidate)) {
    usedNames.add(candidate)
    return candidate
  }
  let i = 2
  while (usedNames.has(`${candidate}${i}`)) i++
  const name = `${candidate}${i}`
  usedNames.add(name)
  return name
}

// ─── Layout-level components (extracted from pages into shared layout) ───────

const LAYOUT_COMPONENT_TYPES = new Set(["ZaloBottomNav"])

// ─── Action → code string ─────────────────────────────────────────────────────

function actionToCode(action: Action): string {
  switch (action.type) {
    case "navigate":    return `navigate("${action.to}")`
    case "openUrl":     return `openExternalLink({ url: "${action.url}" })`
    case "openPhone":   return `openPhone({ phone: "${action.phone}" })`
    case "openProfile": return `openProfile({ userId: "${action.userId}" })`
    case "followOA":    return `followOA({ id: "${action.oaId}" })`
    case "showSnackbar":return `openSnackbar({ text: "${action.message}", type: "success" })`
    case "share":       return `openShareSheet({ type: "zmp", data: { title: "", thumbnail: "", path: "/" } })`
    case "setState":    return `set${capitalize(action.variable)}(${JSON.stringify(action.value)})`
    case "callApi":     return `await call_${action.apiId}()`
    default:            return ""
  }
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/** Returns the zmp-sdk named imports required by an action */
function sdkImportsForAction(action: Action): string[] {
  switch (action.type) {
    case "openUrl":     return ["openExternalLink"]
    case "openPhone":   return ["openPhone"]
    case "openProfile": return ["openProfile"]
    case "followOA":    return ["followOA"]
    case "showSnackbar":return ["openSnackbar"]
    case "share":       return ["openShareSheet"]
    default:            return []
  }
}

/** Collect all zmp-sdk imports needed by event handlers across a page */
function collectSDKImports(nodes: Record<string, ComponentNode>, rootIds: string[]): string[] {
  const imports = new Set<string>()
  const walk = (id: string) => {
    const node = nodes[id]
    if (!node) return
    for (const action of Object.values(node.events ?? {}) as Array<Action | undefined>) {
      if (!action) continue
      sdkImportsForAction(action).forEach((i) => imports.add(i))
    }
    node.children.forEach(walk)
  }
  rootIds.forEach(walk)
  return Array.from(imports).sort()
}

/** Generate event handler props string for a node, e.g. onClick={() => navigate("/")} */
function eventProps(events: NodeEvents | undefined): string {
  if (!events) return ""
  const parts: string[] = []
  if (events.onClick) parts.push(`onClick={() => ${actionToCode(events.onClick)}}`)
  if (events.onChange) parts.push(`onChange={() => ${actionToCode(events.onChange)}}`)
  return parts.length ? " " + parts.join(" ") : ""
}

// ─── Node → JSX string ────────────────────────────────────────────────────────

function nodeToJSX(id: string, nodes: Record<string, ComponentNode>, level: number): string {
  const node = nodes[id]
  if (!node) return ""
  if (LAYOUT_COMPONENT_TYPES.has(node.type)) return ""
  const def = registry[node.type]
  if (!def) return ""

  const evtProps = eventProps(node.events)

  // Lazy children renderer — each component controls at what indent level its children appear
  const renderChildren = (childLevel: number): string =>
    node.children
      .map((childId) => nodeToJSX(childId, nodes, childLevel))
      .filter(Boolean)
      .join("\n")

  // Prefer the component's own toJSX for accurate prop mapping
  if (def.toJSX) {
    // Pass event props via a special wrapper when the component has events
    const base = def.toJSX(node.props, renderChildren, level, id)
    if (!evtProps) return base
    // Inject event props into the first opening tag
    return base.replace(/^(\s*<\w+)/, `$1${evtProps}`)
  }

  // Generic fallback: self-closing or wrapping with zmpComponent name
  const pad = indent(level)
  const comp = def.zmpComponent ?? def.type
  const childrenJSX = def.acceptsChildren ? renderChildren(level + 1) : ""

  if (!childrenJSX) return `${pad}<${comp}${evtProps} />`
  return `${pad}<${comp}${evtProps}>\n${childrenJSX}\n${pad}</${comp}>`
}

// ─── Import collection ────────────────────────────────────────────────────────

function collectZMPImports(nodes: Record<string, ComponentNode>, rootIds: string[]): string[] {
  const imports = new Set<string>()

  const walk = (id: string): void => {
    const node = nodes[id]
    if (!node) return
    if (LAYOUT_COMPONENT_TYPES.has(node.type)) return
    const def = registry[node.type]
    // Use explicit zmpImports list; fall back to zmpComponent for unported defs
    if (def?.zmpImports) {
      def.zmpImports.forEach((imp) => imports.add(imp))
    } else if (def?.zmpComponent && !["img", "hr", "div", "span", "p"].includes(def.zmpComponent)) {
      imports.add(def.zmpComponent)
    }
    node.children.forEach((childId) => walk(childId))
  }

  rootIds.forEach((id) => walk(id))
  return Array.from(imports).sort()
}

// ─── Page file generator ──────────────────────────────────────────────────────

function generatePageFile(page: PageSchema, componentName: string): string {
  // If the user placed a ZaloPage as a root node, don't add an outer <Page> wrapper
  const hasPageRoot = page.rootIds.some((id) => page.nodes[id]?.type === "ZaloPage")
  const rootLevel = hasPageRoot ? 2 : 3

  const bodyLines = page.rootIds
    .map((id) => nodeToJSX(id, page.nodes, rootLevel))
    .filter(Boolean)
    .join("\n")

  const collected = collectZMPImports(page.nodes, page.rootIds)

  // Check if any event action needs useNavigate
  const sdkImports = collectSDKImports(page.nodes, page.rootIds)
  const needsNavigate = (() => {
    const walk = (id: string): boolean => {
      const node = page.nodes[id]
      if (!node) return false
      if (Object.values(node.events ?? {}).some((a) => a?.type === "navigate")) return true
      return node.children.some(walk)
    }
    return page.rootIds.some(walk)
  })()

  // When there's no ZaloPage root, add Page to the import list for the auto-wrapper
  const zmpBaseImports = hasPageRoot ? collected : Array.from(new Set(["Page", ...collected])).sort()
  const allZmpImports = needsNavigate
    ? Array.from(new Set(["useNavigate", ...zmpBaseImports])).sort()
    : zmpBaseImports

  const zmpImportLine = allZmpImports.length
    ? `import { ${allZmpImports.join(", ")} } from "zmp-ui"\n`
    : ""

  const sdkImportLine = sdkImports.length
    ? `import { ${sdkImports.join(", ")} } from "zmp-sdk"\n`
    : ""

  const navigateHook = needsNavigate ? "\n  const navigate = useNavigate()" : ""

  if (hasPageRoot) {
    const body = bodyLines || `    {/* Chưa có nội dung */}`
    // Wrap in Fragment only when there are multiple root nodes alongside ZaloPage
    const needsFragment = page.rootIds.length > 1
    if (needsFragment) {
      const indentedBody = body.split("\n").map((line) => `  ${line}`).join("\n")
      return `${zmpImportLine}${sdkImportLine}
export default function ${componentName}() {${navigateHook}
  return (
    <>
${indentedBody}
    </>
  )
}
`
    }
    return `${zmpImportLine}${sdkImportLine}
export default function ${componentName}() {${navigateHook}
  return (
${body}
  )
}
`
  }

  const body = bodyLines || `      {/* Chưa có nội dung */}`
  return `${zmpImportLine}${sdkImportLine}
export default function ${componentName}() {${navigateHook}
  return (
    <Page>
${body}
    </Page>
  )
}
`
}

// ─── BottomNavigation component generator ────────────────────────────────────

function findBottomNavProps(pages: PageSchema[]): Record<string, unknown> | null {
  for (const page of pages) {
    for (const node of Object.values(page.nodes)) {
      if (node.type === "ZaloBottomNav") return node.props
    }
  }
  return null
}

function generateBottomNavFile(props: Record<string, unknown>): string {
  const tabs = [
    { key: "1", label: (props.tab1Label as string) ?? "", icon: (props.tab1Icon as string) ?? "", route: (props.tab1Route as string) ?? "" },
    { key: "2", label: (props.tab2Label as string) ?? "", icon: (props.tab2Icon as string) ?? "", route: (props.tab2Route as string) ?? "" },
    { key: "3", label: (props.tab3Label as string) ?? "", icon: (props.tab3Icon as string) ?? "", route: (props.tab3Route as string) ?? "" },
  ].filter((tab) => tab.label || tab.icon || tab.route)

  const tabsJson = JSON.stringify(tabs, null, 2)

  return `import { useNavigate } from "zmp-ui"
import { RiHomeLine, RiSearchLine, RiUserLine, RiStarLine, RiShoppingCartLine, RiHeartLine, RiSettings3Line } from "react-icons/ri"

const iconMap = {
  "🏠": RiHomeLine,
  "🔍": RiSearchLine,
  "👤": RiUserLine,
  "⭐": RiStarLine,
  "🛒": RiShoppingCartLine,
  "❤️": RiHeartLine,
  "⚙️": RiSettings3Line,
}

const tabs = ${tabsJson}

export default function BottomNavigation() {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 w-full flex items-center justify-around bg-white border-t border-gray-200 h-14 px-2 shrink-0">
      {tabs.map((tab) => {
        const IconComp = iconMap[tab.icon as keyof typeof iconMap]
        return (
          <button
            key={tab.key}
            className="flex flex-col items-center gap-0.5 flex-1"
            onClick={() => { if (tab.route) navigate(tab.route) }}
          >
            {IconComp ? <IconComp style={{ fontSize: 22, color: "#6B7280" }} /> : <span className="text-xl leading-none">{tab.icon}</span>}
            <span className="text-[10px] font-medium text-gray-500">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
`
}

// ─── Layout file generator ────────────────────────────────────────────────────

interface PageInfo {
  page: PageSchema
  componentName: string
  filename: string
}

function generateLayout(pageInfo: PageInfo[], hasBottomNav: boolean): string {
  const pageImports = pageInfo
    .map(({ componentName, filename }) => `import ${componentName} from "@/pages/${filename}"`)
    .join("\n")

  const bottomNavImport = hasBottomNav
    ? `import BottomNavigation from "@/components/bottom-navigation"\n`
    : ""

  const routes = pageInfo
    .map(({ page, componentName }) =>
      `            <Route path="${page.path}" element={<${componentName} />} />`
    )
    .join("\n")

  const bottomNavJSX = hasBottomNav ? `\n          <BottomNavigation />` : ""

  return `import { getSystemInfo } from "zmp-sdk"
import { App, AnimationRoutes, Route, SnackbarProvider, ZMPRouter } from "zmp-ui"
import { AppProps } from "zmp-ui/app"
${pageImports}
${bottomNavImport}
const Layout = () => {
  const systemInfo = (() => {
    try { return getSystemInfo() } catch { return {} as ReturnType<typeof getSystemInfo> }
  })()

  return (
    <App theme={(systemInfo.zaloTheme ?? "light") as AppProps["theme"]}>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
${routes}
          </AnimationRoutes>${bottomNavJSX}
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  )
}

export default Layout
`
}

// ─── App config generator ─────────────────────────────────────────────────────

function generateAppConfig(appConfig: AppConfig): string {
  return JSON.stringify(
    {
      app: {
        title: appConfig.title,
        textColor: { light: "black", dark: "white" },
        statusBar: appConfig.statusBar,
        actionBarHidden: appConfig.actionBarHidden,
        hideIOSSafeAreaBottom: true,
        hideAndroidBottomNavigationBar: false,
      },
      listCSS: [],
      listSyncJS: [],
      listAsyncJS: [],
    },
    null,
    2
  )
}

// ─── Static template files ────────────────────────────────────────────────────

const STATIC_INDEX_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: gap: content:"
    />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
    />

    <meta name="theme-color" content="#007aff" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
    <title>Zalo Mini App</title>
  </head>
  <body>
    <div id="app"></div>
    <!-- built script files will be auto injected -->

    <script type="module" src="/src/app.ts"></script>
  </body>
</html>
`

const STATIC_APP_TS = `// ZaUI stylesheet
import "zmp-ui/zaui.css";
// Tailwind stylesheet
import "@/css/tailwind.scss";
// Your stylesheet
import "@/css/app.scss";

// React core
import React from "react";
import { createRoot } from "react-dom/client";

// Mount the app
import Layout from "@/components/layout";

// Expose app configuration
import appConfig from "../app-config.json";

if (!window.APP_CONFIG) {
  window.APP_CONFIG = appConfig as any;
}

const root = createRoot(document.getElementById("app")!);
root.render(React.createElement(Layout));
`

const STATIC_APP_SCSS = `.page {
  padding: 16px 16px 96px 16px;
}

.section-container {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 24px;
}

.zaui-list-item {
  cursor: pointer;
}
`

const STATIC_TAILWIND_SCSS = `@tailwind base;
@tailwind components;
@tailwind utilities;
`

const STATIC_TSCONFIG = `{
  "compilerOptions": {
    "noEmit": true,
    "target": "es6",
    "module": "esnext",
    "noImplicitAny": false,
    "preserveConstEnums": true,
    "jsx": "react-jsx",
    "lib": ["dom", "es5", "es6", "es7", "es2017"],
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "skipLibCheck": true,
    "declaration": false,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": false,
    "strict": true,
    "strictFunctionTypes": false,
    "pretty": true,
    "removeComments": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "types": ["vite/client"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "exclude": ["node_modules"],
  "include": ["src"]
}
`

const STATIC_VITE_CONFIG = `import { defineConfig } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default () => {
  return defineConfig({
    root: "./src",
    base: "",
    plugins: [zaloMiniApp(), react()],
    build: {
      assetsInlineLimit: 0,
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  });
};
`

const STATIC_TAILWIND_CONFIG = `module.exports = {
  darkMode: ["selector", '[zaui-theme="dark"]'],
  purge: {
    enabled: true,
    content: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  },
  theme: {
    extend: {
      fontFamily: {
        mono: ["Roboto Mono", "monospace"],
      },
    },
  },
};
`

const STATIC_POSTCSS_CONFIG = `const tailwindcss = require("tailwindcss");

module.exports = {
  plugins: [tailwindcss("./tailwind.config.js"), require("autoprefixer")],
};
`

const STATIC_ENV = `# Điền APP_ID của ứng dụng Zalo Mini App vào đây (bắt buộc)
APP_ID=
ZMP_TOKEN=
`

const STATIC_GITIGNORE = `
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# Misc
.DS_Store
Thumbs.db

# Production build
www/
`

function generatePackageJson(appConfig: AppConfig): string {
  const name = appConfig.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "zmp-app"

  return JSON.stringify(
    {
      name,
      private: true,
      version: "1.0.0",
      description: appConfig.title,
      repository: "",
      license: "UNLICENSED",
      browserslist: [
        "Android >= 5",
        "IOS >= 9.3",
        "Edge >= 15",
        "Safari >= 9.1",
        "Chrome >= 49",
        "Firefox >= 31",
        "Samsung >= 5",
      ],
      scripts: {
        login: "zmp login",
        start: "zmp start",
        deploy: "zmp deploy",
      },
      dependencies: {
        jotai: "^2.12.1",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "react-icons": "^5.0.0",
        "zmp-sdk": "latest",
        "zmp-ui": "latest",
      },
      devDependencies: {
        "@types/react": "^18.3.1",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.1",
        autoprefixer: "^10.4.19",
        "cross-env": "^7.0.3",
        postcss: "^8.4.38",
        "postcss-cli": "^8.3.1",
        "postcss-preset-env": "^6.7.0",
        sass: "^1.76.0",
        tailwindcss: "^3.4.3",
        vite: "^5.2.13",
        "zmp-vite-plugin": "latest",
      },
    },
    null,
    2
  )
}

function generateZmpCliJson(appConfig: AppConfig): string {
  const name = appConfig.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "zmp-app"

  return JSON.stringify(
    {
      name,
      framework: "react-typescript",
      cssPreProcessor: "scss",
      includeTailwind: true,
      package: "zmp-ui",
      stateManagement: "jotai",
      newProject: true,
      template: "single-view",
      theming: {
        customColor: false,
        color: "#007aff",
        darkTheme: false,
        iconFonts: true,
        fillBars: false,
        useUiKits: true,
      },
    },
    null,
    2
  )
}

// ─── Variable atoms generator ─────────────────────────────────────────────────

function generateVariablesFile(variables: Variable[]): string {
  if (variables.length === 0) return `import { atom } from "jotai"\n\n// Chưa có biến nào được định nghĩa\n`

  const atomLines = variables.map((v) => {
    const defaultStr = JSON.stringify(v.defaultValue ?? null)
    return `export const ${v.name}Atom = atom(${defaultStr})`
  })

  return `import { atom } from "jotai"\n\n${atomLines.join("\n")}\n`
}

// ─── API services generator ───────────────────────────────────────────────────

function generateApiServicesFile(apis: ApiDefinition[], variables: Variable[]): string {
  if (apis.length === 0) return `// Chưa có API nào được định nghĩa\n`

  const varMap = Object.fromEntries(variables.map((v) => [v.id, v.name]))

  const functions = apis.map((api) => {
    const responseVar = api.responseVariable ? variables.find((v) => v.name === api.responseVariable) : null
    const hasBody = ["POST", "PUT", "PATCH"].includes(api.method) && api.body
    const headersObj = Object.fromEntries(
      api.headers.filter((h) => h.key).map((h) => [h.key, h.value])
    )
    if (hasBody && !headersObj["Content-Type"]) headersObj["Content-Type"] = "application/json"

    const headersStr = Object.keys(headersObj).length
      ? `, headers: ${JSON.stringify(headersObj)}`
      : ""

    const bodyStr = hasBody ? `, body: \`${api.body}\`` : ""

    const extractKey = api.responseKey
      ? api.responseKey.split(".").reduce((acc, k) => `${acc}?.["${k}"]`, "data")
      : "data"

    const storeResult = responseVar
      ? `\n  const result = ${extractKey}\n  set${capitalize(responseVar.name)}(result)`
      : ""

    // Interpolate {{varName}} in URL
    const urlExpr = api.url.replace(/\{\{(\w+)\}\}/g, (_: string, name: string) => `\${${name}}`)
    const urlStr = urlExpr.includes("${") ? `\`${urlExpr}\`` : `"${api.url}"`

    const setterImport = responseVar ? `\n  // set${capitalize(responseVar.name)} must be passed from component via closure` : ""
    void varMap
    void setterImport

    return `export async function call_${api.id}(set${capitalize(responseVar?.name ?? "result")}: (v: unknown) => void = () => {}) {
  try {
    const res = await fetch(${urlStr}, { method: "${api.method}"${headersStr}${bodyStr} })
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
    const data = await res.json()${storeResult ? storeResult : ""}
    return data
  } catch (err) {
    console.error("[API:${api.name}]", err)
  }
}`
  })

  return `// Auto-generated API service functions\n\n${functions.join("\n\n")}\n`
}

// ─── Page-level state imports ─────────────────────────────────────────────────

function collectPageStateImports(
  nodes: Record<string, ComponentNode>,
  rootIds: string[],
  variables: Variable[],
  pageId: string,
  apis: ApiDefinition[]
): { atomImports: string[]; apiImports: string[]; setters: string[] } {
  const usedVarNames = new Set<string>()
  const usedApiIds = new Set<string>()

  const walk = (id: string) => {
    const node = nodes[id]
    if (!node) return
    // bindings
    if (node.bindings) Object.values(node.bindings).forEach((n) => usedVarNames.add(n))
    // listBinding
    if (node.listBinding) usedVarNames.add(node.listBinding.variable)
    // visibleWhen
    if (node.visibleWhen) usedVarNames.add(node.visibleWhen)
    // events
    for (const action of Object.values(node.events ?? {}) as Array<Action | undefined>) {
      if (!action) continue
      if (action.type === "setState") usedVarNames.add(action.variable)
      if (action.type === "callApi") usedApiIds.add(action.apiId)
    }
    node.children.forEach(walk)
  }
  rootIds.forEach(walk)

  const relevantVars = variables.filter(
    (v) => usedVarNames.has(v.name) && (v.scope === "app" || (v.scope === "page" && v.pageId === pageId))
  )

  const atomImports = relevantVars.map((v) => `${v.name}Atom`)
  const setters = relevantVars.map((v) => `const [${v.name}, set${capitalize(v.name)}] = useAtom(${v.name}Atom)`)
  const apiImports = Array.from(usedApiIds).map((id) => `call_${id}`)

  return { atomImports, apiImports, setters }
}

// ─── Node → JSX string with bindings ─────────────────────────────────────────

function nodeToJSXWithBindings(
  id: string,
  nodes: Record<string, ComponentNode>,
  level: number,
  variables: Variable[]
): string {
  const node = nodes[id]
  if (!node) return ""
  if (LAYOUT_COMPONENT_TYPES.has(node.type)) return ""
  const def = registry[node.type]
  if (!def) return ""

  const pad = indent(level)

  // Merge props with bindings
  const resolvedProps: Record<string, unknown> = { ...node.props }
  if (node.bindings) {
    for (const [key, varName] of Object.entries(node.bindings)) {
      resolvedProps[key] = `__EXPR__${varName}`
    }
  }

  // Build event props
  const evtParts: string[] = []
  if (node.events?.onClick) evtParts.push(`onClick={() => ${actionToCode(node.events.onClick)}}`)
  if (node.events?.onChange) evtParts.push(`onChange={() => ${actionToCode(node.events.onChange)}}`)
  const evtProps = evtParts.length ? " " + evtParts.join(" ") : ""

  const renderChildren = (childLevel: number): string =>
    node.children
      .map((childId) => nodeToJSXWithBindings(childId, nodes, childLevel, variables))
      .filter(Boolean)
      .join("\n")

  // Generate JSX string
  let jsx: string
  if (def.toJSX) {
    const base = def.toJSX(resolvedProps, renderChildren, level, id)
    jsx = evtProps ? base.replace(/^(\s*<\w+)/, `$1${evtProps}`) : base
  } else {
    const comp = def.zmpComponent ?? def.type
    const childrenJSX = def.acceptsChildren ? renderChildren(level + 1) : ""
    jsx = !childrenJSX
      ? `${pad}<${comp}${evtProps} />`
      : `${pad}<${comp}${evtProps}>\n${childrenJSX}\n${pad}</${comp}>`
  }

  // Replace __EXPR__ placeholders with JSX expressions
  jsx = jsx.replace(/"__EXPR__(\w+)"/g, (_: string, name: string) => `{${name}}`)

  // Wrap with list binding
  if (node.listBinding?.variable) {
    const alias = node.listBinding.itemAlias || "item"
    const indented = jsx.split("\n").map((l) => `  ${l}`).join("\n")
    jsx = `${pad}{${node.listBinding.variable}.map((${alias}, _idx) => (\n${indented}\n${pad}))}`
  }

  // Wrap with visibility condition
  if (node.visibleWhen) {
    const indented = jsx.split("\n").map((l) => `  ${l}`).join("\n")
    jsx = `${pad}{${node.visibleWhen} && (\n${indented}\n${pad})}`
  }

  return jsx
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface ExportInput {
  pages: PageSchema[]
  appConfig: AppConfig
  variables?: Variable[]
  apis?: ApiDefinition[]
}

export function exportToZMP({ pages, appConfig, variables = [], apis = [] }: ExportInput): Record<string, string> {
  const files: Record<string, string> = {}
  const usedNames = new Set<string>()

  // Compute stable component names once so page files and layout stay in sync
  const pageInfo: PageInfo[] = pages.map((page) => ({
    page,
    componentName: makeComponentName(page.name, usedNames),
    filename: page.path === "/" ? "index" : page.path.replace(/^\//, "").replace(/\//g, "-"),
  }))

  pageInfo.forEach(({ page, componentName, filename }) => {
    files[`src/pages/${filename}.tsx`] = generatePageFileWithBindings(page, componentName, variables, apis)
  })

  const bottomNavProps = findBottomNavProps(pages)
  if (bottomNavProps) {
    files["src/components/bottom-navigation.tsx"] = generateBottomNavFile(bottomNavProps)
  }

  files["src/components/layout.tsx"] = generateLayout(pageInfo, !!bottomNavProps)
  files["app-config.json"] = generateAppConfig(appConfig)

  // State + API generated files
  files["src/state/variables.ts"] = generateVariablesFile(variables)
  files["src/services/api.ts"] = generateApiServicesFile(apis, variables)

  // Static files from template
  files["index.html"] = STATIC_INDEX_HTML
  files["src/app.ts"] = STATIC_APP_TS
  files["src/css/app.scss"] = STATIC_APP_SCSS
  files["src/css/tailwind.scss"] = STATIC_TAILWIND_SCSS
  files["tsconfig.json"] = STATIC_TSCONFIG
  files["vite.config.mts"] = STATIC_VITE_CONFIG
  files["tailwind.config.js"] = STATIC_TAILWIND_CONFIG
  files["postcss.config.js"] = STATIC_POSTCSS_CONFIG
  files[".gitignore"] = STATIC_GITIGNORE
  files[".env"] = STATIC_ENV

  // Dynamic config files
  files["package.json"] = generatePackageJson(appConfig)
  files["zmp-cli.json"] = generateZmpCliJson(appConfig)

  return files
}

// ─── Local React hooks collector (useState for Tabs, etc.) ───────────────────

function collectLocalHooks(
  nodes: Record<string, ComponentNode>,
  rootIds: string[]
): { lines: string[]; needsUseState: boolean } {
  const lines: string[] = []
  let needsUseState = false

  const walk = (id: string) => {
    const node = nodes[id]
    if (!node) return
    if (node.type === "Tabs") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const varName = `activeTab_${safeId}`
      const setter = `set${varName.charAt(0).toUpperCase()}${varName.slice(1)}`
      lines.push(`const [${varName}, ${setter}] = useState(${JSON.stringify(node.props.activeTab ?? "1")})`)
      needsUseState = true
    }
    if (node.type === "Accordion") {
      const safeId = id.replace(/[^a-zA-Z0-9]/g, "_")
      const stateVar = `isAccordion_${safeId}_Open`
      const setter = `set${stateVar.charAt(0).toUpperCase()}${stateVar.slice(1)}`
      lines.push(`const [${stateVar}, ${setter}] = useState(${JSON.stringify(node.props.defaultOpen ?? false)})`)
      needsUseState = true
    }
    node.children.forEach(walk)
  }
  rootIds.forEach(walk)

  return { lines, needsUseState }
}

// ─── Page file generator with bindings ───────────────────────────────────────

function generatePageFileWithBindings(
  page: PageSchema,
  componentName: string,
  variables: Variable[],
  apis: ApiDefinition[]
): string {
  const hasPageRoot = page.rootIds.some((id) => page.nodes[id]?.type === "ZaloPage")
  const rootLevel = hasPageRoot ? 2 : 3

  const { atomImports, apiImports, setters } = collectPageStateImports(
    page.nodes, page.rootIds, variables, page.id, apis
  )
  const { lines: localHookLines, needsUseState } = collectLocalHooks(page.nodes, page.rootIds)

  const bodyLines = page.rootIds
    .map((id) => nodeToJSXWithBindings(id, page.nodes, rootLevel, variables))
    .filter(Boolean)
    .join("\n")

  const collected = collectZMPImports(page.nodes, page.rootIds)
  const sdkImports = collectSDKImports(page.nodes, page.rootIds)

  const needsNavigate = (() => {
    const walk = (id: string): boolean => {
      const node = page.nodes[id]
      if (!node) return false
      if (Object.values(node.events ?? {}).some((a) => a?.type === "navigate")) return true
      return node.children.some(walk)
    }
    return page.rootIds.some(walk)
  })()

  const needsAsync = apiImports.length > 0

  const zmpBaseImports = hasPageRoot ? collected : Array.from(new Set(["Page", ...collected])).sort()
  const allZmpImports = needsNavigate
    ? Array.from(new Set(["useNavigate", ...zmpBaseImports])).sort()
    : zmpBaseImports

  const reactImportLine = needsUseState ? `import { useState } from "react"\n` : ""
  const zmpImportLine = allZmpImports.length ? `import { ${allZmpImports.join(", ")} } from "zmp-ui"\n` : ""
  const sdkImportLine = sdkImports.length ? `import { ${sdkImports.join(", ")} } from "zmp-sdk"\n` : ""
  const atomImportLine = atomImports.length ? `import { ${atomImports.join(", ")} } from "@/state/variables"\n` : ""
  const useAtomImportLine = atomImports.length ? `import { useAtom } from "jotai"\n` : ""
  const apiImportLine = apiImports.length ? `import { ${apiImports.join(", ")} } from "@/services/api"\n` : ""

  const navigateHook = needsNavigate ? "\n  const navigate = useNavigate()" : ""
  const setterLines = setters.length ? "\n  " + setters.join("\n  ") : ""
  const localHooks = localHookLines.length ? "\n  " + localHookLines.join("\n  ") : ""
  const asyncNote = needsAsync ? "  // API calls use async handlers — attach to onClick/onChange events\n" : ""

  const hookBlock = `${navigateHook}${setterLines}${localHooks}`

  const body = bodyLines || (hasPageRoot ? `    {/* Chưa có nội dung */}` : `      {/* Chưa có nội dung */}`)

  if (hasPageRoot) {
    const needsFragment = page.rootIds.length > 1
    const indentedBody = needsFragment ? body.split("\n").map((l) => `  ${l}`).join("\n") : body
    const returnContent = needsFragment ? `    <>\n${indentedBody}\n    </>` : body
    return `${reactImportLine}${zmpImportLine}${sdkImportLine}${useAtomImportLine}${atomImportLine}${apiImportLine}
export default function ${componentName}() {${hookBlock}
${asyncNote}  return (
${returnContent}
  )
}
`
  }

  return `${reactImportLine}${zmpImportLine}${sdkImportLine}${useAtomImportLine}${atomImportLine}${apiImportLine}
export default function ${componentName}() {${hookBlock}
${asyncNote}  return (
    <Page>
${body}
    </Page>
  )
}
`
}

// Legacy single-page export — kept for compatibility
export function exportToReact(
  state: Pick<{ nodes: Record<string, ComponentNode>; rootIds: string[] }, "nodes" | "rootIds">
): string {
  const { nodes, rootIds } = state
  const body = rootIds.map((id) => nodeToJSX(id, nodes, 3)).join("\n")

  return `import { Page } from "zmp-ui"

export default function Page() {
  return (
    <Page>
${body || "      {/* Chưa có nội dung */}"}
    </Page>
  )
}
`
}

import { ComponentNode, PageSchema, AppConfig } from "@/types/builder"
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

// ─── Node → JSX string ────────────────────────────────────────────────────────

function nodeToJSX(id: string, nodes: Record<string, ComponentNode>, level: number): string {
  const node = nodes[id]
  if (!node) return ""
  const def = registry[node.type]
  if (!def) return ""

  // Lazy children renderer — each component controls at what indent level its children appear
  const renderChildren = (childLevel: number): string =>
    node.children
      .map((childId) => nodeToJSX(childId, nodes, childLevel))
      .filter(Boolean)
      .join("\n")

  // Prefer the component's own toJSX for accurate prop mapping
  if (def.toJSX) {
    return def.toJSX(node.props, renderChildren, level)
  }

  // Generic fallback: self-closing or wrapping with zmpComponent name
  const pad = indent(level)
  const comp = def.zmpComponent ?? def.type
  const childrenJSX = def.acceptsChildren ? renderChildren(level + 1) : ""

  if (!childrenJSX) return `${pad}<${comp} />`
  return `${pad}<${comp}>\n${childrenJSX}\n${pad}</${comp}>`
}

// ─── Import collection ────────────────────────────────────────────────────────

function collectZMPImports(nodes: Record<string, ComponentNode>, rootIds: string[]): string[] {
  const imports = new Set<string>()

  const walk = (id: string): void => {
    const node = nodes[id]
    if (!node) return
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
  // When there's no ZaloPage root, add Page to the import list for the auto-wrapper
  const allImports = hasPageRoot
    ? collected
    : Array.from(new Set(["Page", ...collected])).sort()

  const zmpImportLine = allImports.length
    ? `import { ${allImports.join(", ")} } from "zmp-ui"\n`
    : ""

  if (hasPageRoot) {
    const body = bodyLines || `    {/* Chưa có nội dung */}`
    // Wrap in Fragment only when there are multiple root nodes alongside ZaloPage
    const needsFragment = page.rootIds.length > 1
    if (needsFragment) {
      const indentedBody = body.split("\n").map((line) => `  ${line}`).join("\n")
      return `${zmpImportLine}
export default function ${componentName}() {
  return (
    <>
${indentedBody}
    </>
  )
}
`
    }
    return `${zmpImportLine}
export default function ${componentName}() {
  return (
${body}
  )
}
`
  }

  const body = bodyLines || `      {/* Chưa có nội dung */}`
  return `${zmpImportLine}
export default function ${componentName}() {
  return (
    <Page>
${body}
    </Page>
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

function generateLayout(pageInfo: PageInfo[]): string {
  const pageImports = pageInfo
    .map(({ componentName, filename }) => `import ${componentName} from "@/pages/${filename}"`)
    .join("\n")

  const routes = pageInfo
    .map(({ page, componentName }) =>
      `            <Route path="${page.path}" element={<${componentName} />} />`
    )
    .join("\n")

  return `import { getSystemInfo } from "zmp-sdk"
import { App, AnimationRoutes, Route, SnackbarProvider, ZMPRouter } from "zmp-ui"
import { AppProps } from "zmp-ui/app"
${pageImports}

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
          </AnimationRoutes>
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

// ─── Public API ───────────────────────────────────────────────────────────────

interface ExportInput {
  pages: PageSchema[]
  appConfig: AppConfig
}

export function exportToZMP({ pages, appConfig }: ExportInput): Record<string, string> {
  const files: Record<string, string> = {}
  const usedNames = new Set<string>()

  // Compute stable component names once so page files and layout stay in sync
  const pageInfo: PageInfo[] = pages.map((page) => ({
    page,
    componentName: makeComponentName(page.name, usedNames),
    filename: page.path === "/" ? "index" : page.path.replace(/^\//, "").replace(/\//g, "-"),
  }))

  pageInfo.forEach(({ page, componentName, filename }) => {
    files[`src/pages/${filename}.tsx`] = generatePageFile(page, componentName)
  })

  files["src/components/layout.tsx"] = generateLayout(pageInfo)
  files["app-config.json"] = generateAppConfig(appConfig)

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

  // Dynamic config files
  files["package.json"] = generatePackageJson(appConfig)
  files["zmp-cli.json"] = generateZmpCliJson(appConfig)

  return files
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

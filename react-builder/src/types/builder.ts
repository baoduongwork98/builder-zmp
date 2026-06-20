import type React from "react"

export type PropType = "string" | "number" | "boolean" | "color" | "select" | "textarea" | "toggle" | "page-select"

// ─── Variable system ──────────────────────────────────────────────────────────

export type VariableType = "string" | "number" | "boolean" | "list" | "object"
export type VariableScope = "app" | "page"

export interface Variable {
  id: string
  name: string
  scope: VariableScope
  /** Page id — only set when scope === "page" */
  pageId?: string
  type: VariableType
  defaultValue: unknown
}

// ─── API Integration ──────────────────────────────────────────────────────────

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface ApiHeader {
  key: string
  value: string
}

export interface ApiDefinition {
  id: string
  name: string
  url: string
  method: HttpMethod
  headers: ApiHeader[]
  /** JSON string template — supports {{variableName}} interpolation */
  body: string
  /** After a successful call, store response into this variable name */
  responseVariable: string
  /** Optional dot-path to extract from response, e.g. "data.items" */
  responseKey: string
}

// ─── Action system ────────────────────────────────────────────────────────────

export type Action =
  | { type: "navigate"; to: string }
  | { type: "openUrl"; url: string }
  | { type: "openPhone"; phone: string }
  | { type: "openProfile"; userId: string }
  | { type: "followOA"; oaId: string }
  | { type: "showSnackbar"; message: string }
  | { type: "share" }
  | { type: "setState"; variable: string; value: string }
  | { type: "callApi"; apiId: string }

export type EventType = "onClick" | "onChange"

export interface NodeEvents {
  onClick?: Action
  onChange?: Action
}

export interface PropSchema {
  label: string
  type: PropType
  defaultValue: unknown
  options?: string[]
}

export interface PropGroup {
  label: string
  keys: string[]
  defaultExpanded?: boolean
  showWhen?: (props: Record<string, unknown>) => boolean
  preview?: (props: Record<string, unknown>) => string
}

/** prop key → variable name */
export type PropBindings = Record<string, string>

export interface ListBinding {
  /** Variable name (must be type "list") */
  variable: string
  /** Alias for each item inside children, e.g. "item" */
  itemAlias: string
}

export interface ComponentNode {
  id: string
  type: string
  props: Record<string, unknown>
  events?: NodeEvents
  children: string[]
  parentId: string | null
  /** Bind props to variables: { propKey: variableName } */
  bindings?: PropBindings
  /** When set, this node renders once per list item */
  listBinding?: ListBinding
  /** Hide this node when the named variable is falsy */
  visibleWhen?: string
}

export interface ComponentDefinition {
  type: string
  label: string
  /** A react-icons component, e.g. RiLayoutLine */
  icon: React.ElementType
  description?: string
  category: "layout" | "ui" | "form" | "zalo"
  propSchema: Record<string, PropSchema>
  defaultProps: Record<string, unknown>
  acceptsChildren: boolean
  renderer: (props: Record<string, unknown>, children?: React.ReactNode) => React.ReactElement
  zmpComponent?: string
  /** Named exports to import from "zmp-ui" when this component is used */
  zmpImports?: string[]
  /**
   * Generate the JSX string for code export.
   * renderChildren(level) renders all children indented at the given level.
   */
  toJSX?: (
    props: Record<string, unknown>,
    renderChildren: (level: number) => string,
    level: number,
    nodeId?: string
  ) => string
  propGroups?: PropGroup[]
}

export interface PageSchema {
  id: string
  name: string
  path: string
  nodes: Record<string, ComponentNode>
  rootIds: string[]
}

export interface AppConfig {
  title: string
  themeColor: string
  statusBar: "transparent" | "white" | "auto"
  actionBarHidden: boolean
  appId: string
  localUrl: string
}

export interface BuilderState {
  pages: PageSchema[]
  currentPageId: string
  selectedId: string | null
  viewport: "desktop" | "tablet" | "mobile"
  history: { pages: PageSchema[]; currentPageId: string }[]
  historyIndex: number
  appConfig: AppConfig
  variables: Variable[]
  apis: ApiDefinition[]
}

export type PropType = "string" | "number" | "boolean" | "color" | "select" | "textarea"

export interface PropSchema {
  label: string
  type: PropType
  defaultValue: unknown
  options?: string[]
}

export interface ComponentNode {
  id: string
  type: string
  props: Record<string, unknown>
  children: string[]
  parentId: string | null
}

export interface ComponentDefinition {
  type: string
  label: string
  icon: string
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
    level: number
  ) => string
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
}

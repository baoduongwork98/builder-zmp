import { PageSchema, ComponentNode } from "@/types/builder"
import { PreviewSnapshot } from "./previewChannel"

export function readFromLocalStorage(): PreviewSnapshot | null {
  try {
    const raw = localStorage.getItem("zmp-builder-v2")
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: PreviewSnapshot }
    const s = parsed?.state
    if (!s?.pages) return null
    return {
      pages: s.pages,
      appConfig: s.appConfig,
      variables: s.variables ?? [],
      apis: s.apis ?? [],
    }
  } catch {
    return null
  }
}

export function findGlobalBottomNav(
  pages: PageSchema[]
): { node: ComponentNode; nodes: Record<string, ComponentNode> } | null {
  for (const page of pages) {
    for (const node of Object.values(page.nodes)) {
      if (node.type === "ZaloBottomNav") return { node, nodes: page.nodes }
    }
  }
  return null
}

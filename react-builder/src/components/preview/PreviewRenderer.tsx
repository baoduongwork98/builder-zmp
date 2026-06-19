"use client"

import { createContext, useContext } from "react"
import { toast } from "sonner"
import { registry } from "@/registry/index"
import { ComponentNode } from "@/types/builder"

// ─── Context ──────────────────────────────────────────────────────────────────

type PreviewContextValue = {
  currentPath: string
  navigate: (path: string) => void
}

export const PreviewContext = createContext<PreviewContextValue>({
  currentPath: "/",
  navigate: () => {},
})

// ─── Action executor ──────────────────────────────────────────────────────────

function executeAction(
  action: Record<string, unknown>,
  navigate: (path: string) => void
) {
  switch (action.type) {
    case "navigate":
      navigate(action.to as string)
      break
    case "openUrl":
      window.open(action.url as string, "_blank")
      break
    case "openPhone":
      window.open(`tel:${action.phone as string}`)
      break
    case "showSnackbar":
      toast(action.message as string, {
        description: action.description as string | undefined,
      })
      break
  }
}

// ─── PreviewNode ──────────────────────────────────────────────────────────────

export function PreviewNode({
  id,
  nodes,
}: {
  id: string
  nodes: Record<string, ComponentNode>
}) {
  const node = nodes[id]
  const def = node ? registry[node.type] : null
  const { navigate, currentPath } = useContext(PreviewContext)

  if (!node || !def) return null

  const handleClick = node.events?.onClick
    ? (e: React.MouseEvent) => {
        e.stopPropagation()
        executeAction(node.events!.onClick as Record<string, unknown>, navigate)
      }
    : undefined

  // ZaloBottomNav needs navigate + currentPath injected as special props
  const extraProps =
    node.type === "ZaloBottomNav"
      ? { __navigate__: navigate, __currentPath__: currentPath }
      : {}

  const childrenEl =
    node.children.length > 0 ? (
      <>
        {node.children.map((cid) => (
          <PreviewNode key={cid} id={cid} nodes={nodes} />
        ))}
      </>
    ) : undefined

  const rendered = def.renderer({ ...node.props, ...extraProps }, childrenEl)

  if (!handleClick) return rendered

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      {rendered}
    </div>
  )
}

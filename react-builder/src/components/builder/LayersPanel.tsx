"use client"

import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { ComponentNode } from "@/types/builder"
import { registry } from "@/registry/index"
import { cn } from "@/lib/utils"

interface LayerItemProps {
  id: string
  nodes: Record<string, ComponentNode>
  depth: number
}

function LayerItem({ id, nodes, depth }: LayerItemProps) {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const setSelected = useBuilderStore((s) => s.setSelected)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const node = nodes[id]
  const def = registry[node?.type ?? ""]
  const isSelected = selectedId === id

  if (!node) return null

  return (
    <>
      <div
        onClick={() => setSelected(id)}
        className={cn(
          "flex items-center gap-1.5 py-1 rounded-md cursor-pointer text-[11px] group transition-colors relative",
          isSelected
            ? "bg-[#0068FF]/12 text-blue-400"
            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/4"
        )}
        style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: "6px" }}
      >
        {/* Left accent line for selected */}
        {isSelected && (
          <div className="absolute left-0 top-0.5 bottom-0.5 w-0.5 rounded-full bg-[#0068FF]" />
        )}

        {/* Tree indent guide */}
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-[#2A2A32]"
            style={{ left: `${4 + (depth - 1) * 12}px` }}
          />
        )}

        <span className="text-sm leading-none opacity-60 shrink-0">{def?.icon ?? "□"}</span>
        <span className="flex-1 font-medium truncate tracking-tight">{node.type}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            removeNode(id)
          }}
          className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all text-[10px] w-4 h-4 flex items-center justify-center rounded shrink-0"
        >
          x
        </button>
      </div>
      {node.children.map((childId) => (
        <LayerItem key={childId} id={childId} nodes={nodes} depth={depth + 1} />
      ))}
    </>
  )
}

export function LayersPanel() {
  const currentPage = useBuilderStore(selectCurrentPage)
  const nodes = currentPage?.nodes ?? {}
  const rootIds = currentPage?.rootIds ?? []

  return (
    <div className="border-t border-[#1E1E24] bg-[#141417] flex flex-col flex-1 min-h-0">
      <div className="px-3 py-2 shrink-0">
        <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em]">Layers</p>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2 scrollbar-hide">
        {rootIds.length === 0 ? (
          <p className="text-[11px] text-zinc-700 text-center py-4">Chua co layer</p>
        ) : (
          rootIds.map((id) => (
            <LayerItem key={id} id={id} nodes={nodes} depth={0} />
          ))
        )}
      </div>
    </div>
  )
}

"use client"

import React from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { ComponentNode } from "@/types/builder"
import { registry } from "@/registry/index"
import { cn } from "@/lib/utils"

interface LayerDropZoneProps {
  parentId: string | null
  index: number
}

function LayerDropZone({ parentId, index }: LayerDropZoneProps) {
  const id = `layer-dz__${parentId ?? "root"}__${index}`
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { isLayerDrop: true, parentId, index },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-0.5 rounded-full mx-2 transition-all duration-100",
        isOver ? "bg-[#0068FF] h-1" : "bg-transparent"
      )}
    />
  )
}

interface LayerItemProps {
  id: string
  nodes: Record<string, ComponentNode>
  depth: number
  parentId: string | null
  index: number
  siblingCount: number
}

function LayerItem({ id, nodes, depth, parentId, index, siblingCount }: LayerItemProps) {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const setSelected = useBuilderStore((s) => s.setSelected)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const node = nodes[id]
  const def = registry[node?.type ?? ""]
  const isSelected = selectedId === id
  const IconComp = def ? (def.icon as React.FC<{ size?: number; className?: string }>) : null

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: `layer__${id}`,
    data: { isLayer: true, nodeId: id },
  })

  const { setNodeRef: setDropRef, isOver: isOverContainer } = useDroppable({
    id: `layer-into__${id}`,
    data: { isLayerDrop: true, parentId: id, index: 0 },
    disabled: !def?.acceptsChildren,
  })

  if (!node) return null

  return (
    <>
      {/* Drop zone before this item */}
      <LayerDropZone parentId={parentId} index={index} />

      <div
        ref={(el) => {
          setDragRef(el)
          if (def?.acceptsChildren) setDropRef(el)
        }}
        onClick={() => setSelected(id)}
        className={cn(
          "flex items-center gap-1.5 py-1 rounded-md cursor-pointer text-[11px] group transition-colors relative",
          isDragging && "opacity-30",
          isSelected
            ? "bg-[#0068FF]/12 text-blue-400"
            : "text-zinc-500 hover:text-zinc-300 hover:bg-white/4",
          def?.acceptsChildren && isOverContainer && !isDragging && "bg-[#0068FF]/10 outline outline-[#0068FF]/40"
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

        {/* Drag handle */}
        <span
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing text-[11px] shrink-0 select-none"
        >
          ⠿
        </span>

        {IconComp ? <IconComp size={14} className="opacity-60 shrink-0" /> : <span className="text-sm leading-none opacity-60 shrink-0">□</span>}
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

      {/* Children */}
      {node.children.map((childId, childIndex) => (
        <LayerItem
          key={childId}
          id={childId}
          nodes={nodes}
          depth={depth + 1}
          parentId={id}
          index={childIndex}
          siblingCount={node.children.length}
        />
      ))}

      {/* Drop zone after last item at this level */}
      {index === siblingCount - 1 && (
        <LayerDropZone parentId={parentId} index={siblingCount} />
      )}
    </>
  )
}

export function LayersPanel() {
  const currentPage = useBuilderStore(selectCurrentPage)
  const nodes = currentPage?.nodes ?? {}
  const rootIds = currentPage?.rootIds ?? []

  return (
    <div className="border-t border-[#1E1E24] bg-[#141417] flex flex-col shrink-0 min-h-[160px] max-h-[40%] overflow-hidden">
      <div className="px-3 py-2 shrink-0">
        <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em]">Layers</p>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5 pb-2 scrollbar-hide">
        {rootIds.length === 0 ? (
          <p className="text-[11px] text-zinc-700 text-center py-4">Chua co layer</p>
        ) : (
          rootIds.map((id, i) => (
            <LayerItem
              key={id}
              id={id}
              nodes={nodes}
              depth={0}
              parentId={null}
              index={i}
              siblingCount={rootIds.length}
            />
          ))
        )}
      </div>
    </div>
  )
}

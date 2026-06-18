"use client"

import React, { useCallback } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { registry } from "@/registry/index"
import { useBuilderStore } from "@/store/builderStore"
import { ComponentNode } from "@/types/builder"
import { cn } from "@/lib/utils"

interface DropZoneProps {
  parentId: string | null
  index: number
  isVisible: boolean
}

export function DropZone({ parentId, index, isVisible }: DropZoneProps) {
  const id = `dropzone__${parentId ?? "root"}__${index}`
  const { setNodeRef, isOver } = useDroppable({ id, data: { parentId, index, isDropZone: true } })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-150 rounded-md mx-1",
        isVisible ? "h-7" : "h-0.5",
        isOver
          ? "bg-[#0068FF]/10 border-2 border-dashed border-[#0068FF]/60 h-9"
          : isVisible
            ? "border border-dashed border-zinc-300/60"
            : ""
      )}
    />
  )
}

interface CanvasNodeProps {
  id: string
  nodes: Record<string, ComponentNode>
  depth?: number
  isDraggingAny: boolean
}

export function CanvasNode({ id, nodes, depth = 0, isDraggingAny }: CanvasNodeProps) {
  const node = nodes[id]
  const selectedId = useBuilderStore((s) => s.selectedId)
  const setSelected = useBuilderStore((s) => s.setSelected)
  const removeNode = useBuilderStore((s) => s.removeNode)

  const isSelected = selectedId === id
  const def = registry[node?.type ?? ""]

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id,
    data: { type: "canvas-node", nodeType: node?.type },
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `node__${id}`,
    data: { parentId: id, index: node?.children.length ?? 0, isDropZone: false },
    disabled: !def?.acceptsChildren,
  })

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setSelected(id)
    },
    [id, setSelected]
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      removeNode(id)
    },
    [id, removeNode]
  )

  if (!node || !def) return null

  const children =
    def.acceptsChildren && node.children.length > 0
      ? node.children.flatMap((childId, i) => [
          <DropZone key={`dz-${i}`} parentId={id} index={i} isVisible={isDraggingAny} />,
          <CanvasNode key={childId} id={childId} nodes={nodes} depth={depth + 1} isDraggingAny={isDraggingAny} />,
        ]).concat(
          <DropZone key="dz-last" parentId={id} index={node.children.length} isVisible={isDraggingAny} />
        )
      : def.acceptsChildren
        ? [<DropZone key="dz-empty" parentId={id} index={0} isVisible={true} />]
        : undefined

  const rendered = def.renderer(node.props, children ? <>{children}</> : undefined)

  return (
    <div
      ref={(el) => {
        setDragRef(el)
        if (def.acceptsChildren) setDropRef(el)
      }}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={cn(
        "relative group",
        isDragging ? "opacity-30 cursor-grabbing" : "cursor-grab",
        isSelected && "outline outline-2 outline-[#0068FF] outline-offset-1 rounded-sm",
        !isSelected && "hover:outline hover:outline-1 hover:outline-[#0068FF]/40 hover:outline-offset-1 hover:rounded-sm",
        def.acceptsChildren && isOver && !isDragging && "ring-2 ring-[#0068FF]/30 ring-inset"
      )}
    >
      {/* Floating toolbar on select */}
      {isSelected && (
        <div className="absolute -top-7 left-0 z-50 flex items-center gap-1">
          <span className="bg-[#0068FF] text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-tight shadow-sm">
            {node.type}
          </span>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold shadow-sm transition-colors"
          >
            Del
          </button>
        </div>
      )}
      {rendered}
    </div>
  )
}

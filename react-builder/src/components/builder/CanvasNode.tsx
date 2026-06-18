"use client"

import React, { useCallback } from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { registry } from "@/registry/index"
import { useBuilderStore } from "@/store/builderStore"
import { ComponentNode } from "@/types/builder"
import { cn } from "@/lib/utils"
import { useDragState } from "@/components/builder/BuilderDnd"

interface DropZoneProps {
  parentId: string | null
  index: number
  isVisible: boolean
  direction?: "vertical" | "horizontal"
}

export function DropZone({ parentId, index, isVisible, direction = "vertical" }: DropZoneProps) {
  const id = `dropzone__${parentId ?? "root"}__${index}`
  const { setNodeRef, isOver } = useDroppable({ id, data: { parentId, index, isDropZone: true } })
  const { draggingLabel } = useDragState()

  const isHorizontal = direction === "horizontal"

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative transition-all duration-150",
        isHorizontal
          ? cn("w-1 self-stretch", isVisible ? "w-4" : "w-0.5")
          : cn("rounded-md mx-1", isVisible ? "h-4" : "h-0.5")
      )}
      style={{ overflow: "visible" }}
    >
      {isOver && (
        <>
          {/* Insertion line */}
          <div
            className={cn(
              "absolute bg-[#0068FF] pointer-events-none",
              isHorizontal
                ? "top-0 bottom-0 w-0.5 left-1/2 -translate-x-1/2"
                : "left-0 right-0 h-0.5 top-1/2 -translate-y-1/2"
            )}
          />
          {/* Label chip */}
          <div
            className={cn(
              "absolute z-50 bg-[#0068FF] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold pointer-events-none whitespace-nowrap",
              isHorizontal
                ? "top-0 left-1/2 -translate-x-1/2 -translate-y-full"
                : "top-1/2 left-0 -translate-y-1/2"
            )}
          >
            {draggingLabel || "Thả vào đây"}
          </div>
        </>
      )}
    </div>
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

  const isHorizontalStack = node.type === "Stack" && node.props.direction === "horizontal"
  const dzDirection = isHorizontalStack ? "horizontal" : "vertical"

  const children =
    def.acceptsChildren && node.children.length > 0
      ? node.children.flatMap((childId, i) => [
          <DropZone key={`dz-${i}`} parentId={id} index={i} isVisible={isDraggingAny} direction={dzDirection} />,
          <CanvasNode key={childId} id={childId} nodes={nodes} depth={depth + 1} isDraggingAny={isDraggingAny} />,
        ]).concat(
          <DropZone key="dz-last" parentId={id} index={node.children.length} isVisible={isDraggingAny} direction={dzDirection} />
        )
      : def.acceptsChildren
        ? [<DropZone key="dz-empty" parentId={id} index={0} isVisible={true} direction={dzDirection} />]
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
        def.acceptsChildren && isDraggingAny && node.children.length === 0 && "min-h-16",
        isSelected && "outline outline-2 outline-[#0068FF] outline-offset-1 rounded-sm",
        !isSelected && "hover:outline hover:outline-1 hover:outline-[#0068FF]/40 hover:outline-offset-1 hover:rounded-sm",
        def.acceptsChildren && isOver && !isDragging && "outline outline-2 outline-dashed outline-[#0068FF]/60 bg-[#0068FF]/5 rounded-sm"
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
      {/* Container drop hint */}
      {def.acceptsChildren && isOver && !isDragging && (
        <div className="absolute top-1 right-1 z-50 bg-[#0068FF] text-white text-[9px] px-1.5 py-0.5 rounded font-semibold pointer-events-none">
          Thả vào đây
        </div>
      )}
      {rendered}
    </div>
  )
}

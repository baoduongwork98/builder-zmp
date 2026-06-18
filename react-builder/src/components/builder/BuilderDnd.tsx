"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  CollisionDetection,
} from "@dnd-kit/core"
import { useBuilderStore } from "@/store/builderStore"
import { registry } from "@/registry/index"

interface DragState {
  isDraggingAny: boolean
  draggingLabel: string
  draggingIsPanel: boolean
}

const DragStateContext = createContext<DragState>({
  isDraggingAny: false,
  draggingLabel: "",
  draggingIsPanel: false,
})

export const useIsDraggingAny = () => useContext(DragStateContext).isDraggingAny
export const useDragState = () => useContext(DragStateContext)

const collisionDetection: CollisionDetection = (args) => {
  const hits = pointerWithin(args)
  if (hits.length > 0) return hits
  return closestCenter(args)
}

export function BuilderDnd({ children }: { children: React.ReactNode }) {
  const addNode = useBuilderStore((s) => s.addNode)
  const moveNode = useBuilderStore((s) => s.moveNode)

  const [draggingType, setDraggingType] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [draggingIsPanel, setDraggingIsPanel] = useState(false)

  const isDraggingAny = draggingType !== null || draggingId !== null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.isPanel) {
      const nodeType = active.data.current.nodeType as string
      setDraggingType(nodeType)
      setDraggingIsPanel(true)
    } else if (active.data.current?.isLayer) {
      const nodeId = active.data.current.nodeId as string
      setDraggingId(nodeId)
      setDraggingIsPanel(false)
    } else {
      setDraggingId(active.id as string)
      setDraggingIsPanel(false)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingType(null)
      setDraggingId(null)
      setDraggingIsPanel(false)
      const { active, over } = event
      if (!over) return
      const overData = over.data.current as
        | { parentId: string | null; index: number; isLayerDrop?: boolean }
        | undefined
      if (!overData) return

      if (active.data.current?.isLayer) {
        if (overData.isLayerDrop) {
          const { parentId, index } = overData
          const nodeId = active.data.current.nodeId as string
          if (nodeId !== over.id) moveNode(nodeId, parentId, index)
        }
        return
      }

      const { parentId, index } = overData
      if (active.data.current?.isPanel) {
        addNode(active.data.current.nodeType as string, parentId, index)
      } else {
        const activeId = active.id as string
        if (activeId !== over.id) moveNode(activeId, parentId, index)
      }
    },
    [addNode, moveNode]
  )

  const dragLabel = (() => {
    if (draggingType != null) return registry[draggingType]?.label ?? draggingType
    if (draggingId != null) {
      const state = useBuilderStore.getState()
      const page = state.pages.find((p) => p.id === state.currentPageId)
      const nodeType = page?.nodes[draggingId]?.type
      if (nodeType) return registry[nodeType]?.label ?? nodeType
    }
    return ""
  })()

  return (
    <DragStateContext.Provider value={{ isDraggingAny, draggingLabel: dragLabel, draggingIsPanel }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {draggingType && (
            <div className="bg-white border-2 border-[#0068FF] rounded-xl px-3 py-2 text-sm shadow-2xl flex items-center gap-2 pointer-events-none min-w-[120px]">
              <span className="text-base">{registry[draggingType]?.icon}</span>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-800 text-[11px] leading-tight">
                  {registry[draggingType]?.label ?? draggingType}
                </span>
                <span className="text-[9px] text-[#0068FF] font-semibold uppercase tracking-wide">Mới</span>
              </div>
            </div>
          )}
          {draggingId && (
            <div className="bg-white border-2 border-zinc-300 rounded-xl px-3 py-2 text-sm shadow-2xl flex items-center gap-2 pointer-events-none min-w-[100px]">
              <span className="text-zinc-400 text-base">⠿</span>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-800 text-[11px] leading-tight">Di chuyển</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">Canvas</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DragStateContext.Provider>
  )
}

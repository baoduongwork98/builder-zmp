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

const DragStateContext = createContext({ isDraggingAny: false })
export const useIsDraggingAny = () => useContext(DragStateContext).isDraggingAny

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
  const isDraggingAny = draggingType !== null || draggingId !== null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    if (active.data.current?.isPanel) {
      setDraggingType(active.data.current.nodeType as string)
    } else {
      setDraggingId(active.id as string)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingType(null)
      setDraggingId(null)
      const { active, over } = event
      if (!over) return
      const overData = over.data.current as { parentId: string | null; index: number } | undefined
      if (!overData) return
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

  return (
    <DragStateContext.Provider value={{ isDraggingAny }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {draggingType && (
            <div className="bg-white border border-blue-400 rounded-lg px-3 py-2 text-sm shadow-xl opacity-90 flex items-center gap-2 pointer-events-none">
              <span>{registry[draggingType]?.icon}</span>
              <span>{registry[draggingType]?.label ?? draggingType}</span>
            </div>
          )}
          {draggingId && (
            <div className="bg-white border border-blue-400 rounded-lg px-3 py-2 text-sm shadow-xl opacity-80 pointer-events-none">
              Di chuyển...
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </DragStateContext.Provider>
  )
}

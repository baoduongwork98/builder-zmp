"use client"

import { useDroppable } from "@dnd-kit/core"
import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { CanvasNode, DropZone } from "./CanvasNode"
import { PhoneMockup } from "./PhoneMockup"
import { useIsDraggingAny } from "./BuilderDnd"
import { cn } from "@/lib/utils"
import { ComponentNode } from "@/types/builder"

const VIEWPORT_WIDTH: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

interface RootDropZoneProps {
  rootIds: string[]
  nodes: Record<string, ComponentNode>
  isDraggingAny: boolean
}

function RootDropZone({ rootIds, nodes, isDraggingAny }: RootDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "root-canvas",
    data: { parentId: null, index: rootIds.length },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-full bg-white relative flex flex-col",
        isOver && "ring-2 ring-[#0068FF]/40 ring-inset"
      )}
    >
      {rootIds.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div
            className="w-10 h-10 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center mb-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="text-zinc-400 text-[11px] font-medium text-center">
            Keo component vao day
          </p>
        </div>
      ) : (
        <>
          {rootIds.flatMap((id, i) => [
            <DropZone key={`dz-${i}`} parentId={null} index={i} isVisible={isDraggingAny} />,
            <CanvasNode key={id} id={id} nodes={nodes} isDraggingAny={isDraggingAny} />,
          ])}
          <DropZone key="dz-last" parentId={null} index={rootIds.length} isVisible={isDraggingAny} />
        </>
      )}
    </div>
  )
}

export function Canvas() {
  const currentPage = useBuilderStore(selectCurrentPage)
  const viewport = useBuilderStore((s) => s.viewport)
  const setSelected = useBuilderStore((s) => s.setSelected)

  const rootIds = currentPage?.rootIds ?? []
  const nodes = currentPage?.nodes ?? {}
  const isDraggingAny = useIsDraggingAny()

  const canvasContent = (
    <RootDropZone rootIds={rootIds} nodes={nodes} isDraggingAny={isDraggingAny} />
  )

  return (
    <div
      className="flex-1 overflow-auto"
      style={{
        background: viewport === "mobile"
          ? "#1A1A1E"
          : "#ECEDF2",
        backgroundImage: viewport === "mobile"
          ? "radial-gradient(circle, #2A2A32 1px, transparent 1px)"
          : "radial-gradient(circle, #D4D5DC 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      onClick={() => setSelected(null)}
    >
      {viewport === "mobile" ? (
        <PhoneMockup>
          {canvasContent}
        </PhoneMockup>
      ) : (
        <div
          className="mx-auto transition-all duration-300 min-h-full shadow-sm"
          style={{ width: VIEWPORT_WIDTH[viewport] }}
        >
          {canvasContent}
        </div>
      )}
    </div>
  )
}

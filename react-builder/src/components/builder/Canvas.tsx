"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { CanvasNode, DropZone } from "./CanvasNode"
import { PhoneMockup } from "./PhoneMockup"
import { useIsDraggingAny } from "./BuilderDnd"
import { TemplateModal } from "./TemplateModal"
import { cn } from "@/lib/utils"
import { ComponentNode } from "@/types/builder"
import { findGlobalBottomNav } from "@/lib/previewUtils"

const VIEWPORT_WIDTH: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
}

// Component types that render at layout level, not inline with page content
const LAYOUT_NODE_TYPES = new Set(["ZaloBottomNav"])

interface RootDropZoneProps {
  rootIds: string[]
  nodes: Record<string, ComponentNode>
  isDraggingAny: boolean
  onOpenTemplates: () => void
}

function RootDropZone({ rootIds, nodes, isDraggingAny, onOpenTemplates }: RootDropZoneProps) {
  const contentIds = rootIds.filter((id) => !LAYOUT_NODE_TYPES.has(nodes[id]?.type))

  const { setNodeRef, isOver } = useDroppable({
    id: "root-canvas",
    data: { parentId: null, index: contentIds.length },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full min-h-full bg-white relative flex flex-col",
        isOver && "ring-2 ring-[#0068FF]/40 ring-inset"
      )}
    >
      {contentIds.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
          <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center mb-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <p className="text-zinc-300 text-[12px] font-medium mb-3">Kéo component vào đây</p>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenTemplates() }}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0068FF] border border-[#0068FF]/30 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Chọn template
          </button>
        </div>
      ) : (
        <>
          {contentIds.flatMap((id, i) => [
            <DropZone key={`dz-${i}`} parentId={null} index={i} isVisible={isDraggingAny} />,
            <CanvasNode key={id} id={id} nodes={nodes} isDraggingAny={isDraggingAny} />,
          ])}
          <DropZone key="dz-last" parentId={null} index={contentIds.length} isVisible={isDraggingAny} />
        </>
      )}
    </div>
  )
}

export function Canvas() {
  const currentPage = useBuilderStore(selectCurrentPage)
  const allPages = useBuilderStore((s) => s.pages)
  const viewport = useBuilderStore((s) => s.viewport)
  const setSelected = useBuilderStore((s) => s.setSelected)
  const [showTemplates, setShowTemplates] = useState(false)

  const rootIds = currentPage?.rootIds ?? []
  const nodes = currentPage?.nodes ?? {}
  const isDraggingAny = useIsDraggingAny()

  const bottomNavEntry = findGlobalBottomNav(allPages)
  const bottomNavContent = bottomNavEntry ? (
    <CanvasNode
      id={bottomNavEntry.node.id}
      nodes={bottomNavEntry.nodes}
      isDraggingAny={isDraggingAny}
    />
  ) : null

  const canvasContent = (
    <RootDropZone
      rootIds={rootIds}
      nodes={nodes}
      isDraggingAny={isDraggingAny}
      onOpenTemplates={() => setShowTemplates(true)}
    />
  )

  return (
    <>
      <div
        className="flex-1 overflow-auto"
        style={{
          background: viewport === "mobile" ? "#1A1A1E" : "#ECEDF2",
          backgroundImage: viewport === "mobile"
            ? "radial-gradient(circle, #2A2A32 1px, transparent 1px)"
            : "radial-gradient(circle, #D4D5DC 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        onClick={() => setSelected(null)}
      >
        {viewport === "mobile" ? (
          <PhoneMockup bottomNav={bottomNavContent}>
            {canvasContent}
          </PhoneMockup>
        ) : (
          <div
            className="mx-auto transition-all duration-300 min-h-full shadow-sm flex flex-col"
            style={{ width: VIEWPORT_WIDTH[viewport] }}
          >
            <div className="flex-1">{canvasContent}</div>
            {bottomNavContent && (
              <div className="sticky bottom-0 left-0 right-0 z-10">
                {bottomNavContent}
              </div>
            )}
          </div>
        )}
      </div>

      {showTemplates && <TemplateModal onClose={() => setShowTemplates(false)} />}
    </>
  )
}

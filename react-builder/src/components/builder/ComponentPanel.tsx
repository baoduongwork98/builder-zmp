"use client"

import React, { useState } from "react"
import { useDraggable } from "@dnd-kit/core"
import { registry, categoryOrder } from "@/registry/index"
import { ComponentDefinition } from "@/types/builder"
import { cn } from "@/lib/utils"

interface DraggableComponentItemProps {
  def: ComponentDefinition
}

function DraggableComponentItem({ def }: DraggableComponentItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel__${def.type}`,
    data: { isPanel: true, nodeType: def.type },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex flex-col items-center gap-1.5 p-2.5 rounded-lg cursor-grab select-none transition-all duration-150",
        "bg-[#1E1E24] border border-[#2A2A32]",
        "hover:border-[#0068FF]/50 hover:bg-[#1A1D2E]",
        isDragging && "opacity-40 cursor-grabbing scale-95"
      )}
    >
      <span className="text-lg leading-none">{def.icon}</span>
      <span className="text-[10px] text-zinc-500 font-medium leading-none tracking-tight">
        {def.label}
      </span>
    </div>
  )
}

const categoryLabels: Record<string, string> = {
  zalo: "Zalo UI",
  layout: "Layout",
  ui: "Content",
  form: "Form",
}

export function ComponentPanel() {
  const [search, setSearch] = useState("")

  const grouped = categoryOrder.reduce(
    (acc, cat) => {
      const items = Object.values(registry).filter(
        (d) =>
          d.category === cat &&
          (search === "" || d.label.toLowerCase().includes(search.toLowerCase()))
      )
      if (items.length) acc[cat] = items
      return acc
    },
    {} as Record<string, ComponentDefinition[]>
  )

  return (
    <div className="w-52 border-r border-[#1E1E24] bg-[#141417] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2.5 shrink-0">
        <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em] mb-2">
          Components
        </p>
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none"
            width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full text-[11px] bg-[#1A1A1E] border border-[#2A2A32] rounded-lg pl-7 pr-2.5 py-1.5 outline-none focus:border-[#0068FF]/60 text-zinc-300 placeholder:text-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Component list */}
      <div className="overflow-y-auto flex-1 px-2 pb-3 scrollbar-hide">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-[11px] text-zinc-700 text-center mt-8">Khong tim thay</p>
        ) : (
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-[9px] font-semibold text-zinc-700 uppercase tracking-[0.12em] px-1 mb-1.5">
                {categoryLabels[cat] ?? cat}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map((def) => (
                  <DraggableComponentItem key={def.type} def={def} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

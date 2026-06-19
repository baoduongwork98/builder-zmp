"use client"

import React, { useState, useRef, useEffect } from "react"
import { useDraggable } from "@dnd-kit/core"
import { registry, categoryOrder } from "@/registry/index"
import { ComponentDefinition } from "@/types/builder"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// ─── Tooltip ────────────────────────────────────────────────────────────────

const categoryChipClass: Record<string, string> = {
  zalo: "bg-blue-950 text-blue-400",
  layout: "bg-purple-950 text-purple-400",
  ui: "bg-emerald-950 text-emerald-400",
}

const categoryLabels: Record<string, string> = {
  zalo: "Zalo UI",
  layout: "Layout",
  ui: "Content",
  form: "Form",
}

function ComponentTooltip({ def, y }: { def: ComponentDefinition; y: number }) {
  const maxY = typeof window !== "undefined" ? window.innerHeight - 260 : 400
  const clampedY = Math.max(8, Math.min(y, maxY))
  const Icon = def.icon as React.FC<{ size?: number; className?: string }>

  return (
    <div
      className="fixed z-50 w-56 rounded-xl border border-[#2A2A32] bg-[#1E1E24] shadow-2xl p-3 pointer-events-none"
      style={{ left: 40 + 192 + 8, top: clampedY }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={18} className="text-zinc-300 shrink-0" />
        <span className="text-sm font-semibold text-zinc-100 flex-1 truncate">
          {def.label}
        </span>
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
            categoryChipClass[def.category] ?? "bg-zinc-800 text-zinc-400"
          )}
        >
          {categoryLabels[def.category] ?? def.category}
        </span>
      </div>

      {/* Live preview */}
      <div
        className="bg-white rounded-lg overflow-hidden mb-2.5"
        style={{ height: 88 }}
      >
        <div
          style={{
            transform: "scale(0.75)",
            transformOrigin: "top left",
            width: "133%",
            pointerEvents: "none",
          }}
        >
          {def.renderer(def.defaultProps, null)}
        </div>
      </div>

      {/* Description */}
      {def.description && (
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          {def.description}
        </p>
      )}
    </div>
  )
}

// ─── Draggable card ──────────────────────────────────────────────────────────

interface DraggableComponentItemProps {
  def: ComponentDefinition
  onHover: (def: ComponentDefinition, y: number) => void
  onLeave: () => void
}

function DraggableComponentItem({
  def,
  onHover,
  onLeave,
}: DraggableComponentItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `panel__${def.type}`,
    data: { isPanel: true, nodeType: def.type },
  })

  const Icon = def.icon as React.FC<{ size?: number; className?: string }>

  function handleMouseEnter(e: React.MouseEvent) {
    const rect = e.currentTarget.getBoundingClientRect()
    onHover(def, rect.top)
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      className={cn(
        "group flex flex-col items-center gap-2 p-3 rounded-lg cursor-grab select-none transition-all duration-150",
        "bg-[#1E1E24] border border-[#2A2A32]",
        "hover:border-[#0068FF]/50 hover:bg-[#1A1D2E]",
        isDragging && "opacity-40 cursor-grabbing scale-95"
      )}
    >
      <Icon
        size={18}
        className={cn(
          "transition-colors duration-150",
          isDragging ? "text-zinc-300" : "text-zinc-400 group-hover:text-zinc-200"
        )}
      />
      <span className="text-[11px] text-zinc-500 font-medium leading-none tracking-tight text-center">
        {def.label}
      </span>
    </div>
  )
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export function ComponentPanel() {
  const [search, setSearch] = useState("")
  const [tooltip, setTooltip] = useState<{
    def: ComponentDefinition
    y: number
  } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Cmd+K / Ctrl+K focuses search
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setSearch("")
        inputRef.current?.blur()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  function showTooltip(def: ComponentDefinition, y: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setTooltip({ def, y }), 150)
  }

  function hideTooltip() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTooltip(null)
  }

  const q = search.toLowerCase()
  const grouped = categoryOrder.reduce(
    (acc, cat) => {
      const items = Object.values(registry).filter(
        (d) => d.category === cat && (q === "" || d.label.toLowerCase().includes(q))
      )
      if (items.length) acc[cat] = items
      return acc
    },
    {} as Record<string, ComponentDefinition[]>
  )

  return (
    <>
      <div className="border-r border-[#1E1E24] bg-[#141417] flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="px-3 pt-3 pb-2.5 shrink-0">
          <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em] mb-2">
            Components
          </p>
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none"
              width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm... (⌘K)"
              className="text-[11px] bg-[#1A1A1E] border-[#2A2A32] rounded-lg pl-7 pr-7 h-7 focus-visible:border-[#0068FF]/60 focus-visible:ring-[#0068FF]/20 text-zinc-300 placeholder:text-zinc-700"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); inputRef.current?.focus() }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Component list */}
        <div className="overflow-y-auto flex-1 px-2 pb-3 scrollbar-hide">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-[11px] text-zinc-700 text-center mt-8">
              Không tìm thấy component nào
            </p>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-4">
                <p className="text-[9px] font-semibold text-zinc-700 uppercase tracking-[0.12em] px-1 mb-1.5">
                  {categoryLabels[cat] ?? cat}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {items.map((def) => (
                    <DraggableComponentItem
                      key={def.type}
                      def={def}
                      onHover={showTooltip}
                      onLeave={hideTooltip}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tooltip — rendered outside the panel div so it's not clipped */}
      {tooltip && <ComponentTooltip def={tooltip.def} y={tooltip.y} />}
    </>
  )
}

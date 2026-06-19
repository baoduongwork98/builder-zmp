"use client"

import { useEffect, useState } from "react"
import { BuilderDnd } from "@/components/builder/BuilderDnd"
import { Topbar } from "@/components/builder/Topbar"
import { ComponentPanel } from "@/components/builder/ComponentPanel"
import { Canvas } from "@/components/builder/Canvas"
import { PropertiesPanel } from "@/components/builder/PropertiesPanel"
import { LayersPanel } from "@/components/builder/LayersPanel"
import { VariablesPanel } from "@/components/builder/VariablesPanel"
import { ApiPanel } from "@/components/builder/ApiPanel"
import { useBuilderStore } from "@/store/builderStore"
import { broadcastState } from "@/lib/previewChannel"
import { RiLayoutLine, RiStackLine, RiDatabase2Line, RiFlashlightLine } from "react-icons/ri"

function KeyboardShortcuts() {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const removeNode = useBuilderStore((s) => s.removeNode)
  const setSelected = useBuilderStore((s) => s.setSelected)
  const undo = useBuilderStore((s) => s.undo)
  const redo = useBuilderStore((s) => s.redo)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isEditable = (e.target as HTMLElement).isContentEditable
      const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || isEditable

      if (e.key === "Escape") { setSelected(null); return }

      if ((e.key === "Delete" || e.key === "Backspace") && !inInput) {
        if (selectedId) { e.preventDefault(); removeNode(selectedId) }
        return
      }

      if ((e.metaKey || e.ctrlKey) && !inInput) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); return }
        if (e.key === "y" || (e.key === "z" && e.shiftKey)) { e.preventDefault(); redo(); return }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedId, removeNode, setSelected, undo, redo])

  return null
}

function PreviewBroadcaster() {
  useEffect(() => {
    return useBuilderStore.subscribe((state) => {
      broadcastState({
        pages: state.pages,
        appConfig: state.appConfig,
        variables: state.variables,
        apis: state.apis,
      })
    })
  }, [])
  return null
}

type LeftTab = "components" | "layers" | "variables" | "api"

const LEFT_TABS: { key: LeftTab; icon: React.ElementType; label: string }[] = [
  { key: "components", icon: RiLayoutLine, label: "Components" },
  { key: "layers", icon: RiStackLine, label: "Layers" },
  { key: "variables", icon: RiDatabase2Line, label: "Variables" },
  { key: "api", icon: RiFlashlightLine, label: "API" },
]

export default function BuilderContent() {
  const [leftTab, setLeftTab] = useState<LeftTab>("components")

  return (
    <BuilderDnd>
      <KeyboardShortcuts />
      <PreviewBroadcaster />
      <div className="flex flex-col h-screen overflow-hidden bg-[#141417]">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="flex h-full overflow-hidden shrink-0">
            {/* Icon rail */}
            <div className="flex flex-col items-center gap-0.5 w-10 bg-[#1a1a1f] border-r border-zinc-800 py-2 shrink-0">
              {LEFT_TABS.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setLeftTab(key)}
                  title={label}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    leftTab === key
                      ? "bg-[#0068FF] text-white"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700"
                  }`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>

            {/* Panel content */}
            <div className="w-48 h-full flex flex-col overflow-hidden bg-white">
              {leftTab === "components" && <ComponentPanel />}
              {leftTab === "layers" && <LayersPanel />}
              {leftTab === "variables" && <VariablesPanel />}
              {leftTab === "api" && <ApiPanel />}
            </div>
          </div>

          {/* Canvas */}
          <Canvas />

          {/* Right panel */}
          <PropertiesPanel />
        </div>
      </div>
    </BuilderDnd>
  )
}

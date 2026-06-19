"use client"

import { useEffect } from "react"
import { BuilderDnd } from "@/components/builder/BuilderDnd"
import { Topbar } from "@/components/builder/Topbar"
import { ComponentPanel } from "@/components/builder/ComponentPanel"
import { Canvas } from "@/components/builder/Canvas"
import { PropertiesPanel } from "@/components/builder/PropertiesPanel"
import { LayersPanel } from "@/components/builder/LayersPanel"
import { useBuilderStore } from "@/store/builderStore"

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

      if (e.key === "Escape") {
        setSelected(null)
        return
      }

      if ((e.key === "Delete" || e.key === "Backspace") && !inInput) {
        if (selectedId) {
          e.preventDefault()
          removeNode(selectedId)
        }
        return
      }

      if ((e.metaKey || e.ctrlKey) && !inInput) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault()
          undo()
          return
        }
        if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault()
          redo()
          return
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedId, removeNode, setSelected, undo, redo])

  return null
}

export default function BuilderContent() {
  return (
    <BuilderDnd>
      <KeyboardShortcuts />
      <div className="flex flex-col h-screen overflow-hidden bg-[#141417]">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="flex flex-col w-52 shrink-0 h-full overflow-hidden">
            <ComponentPanel />
            <LayersPanel />
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

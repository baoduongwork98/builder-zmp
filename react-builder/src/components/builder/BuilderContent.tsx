"use client"

import { BuilderDnd } from "@/components/builder/BuilderDnd"
import { Topbar } from "@/components/builder/Topbar"
import { ComponentPanel } from "@/components/builder/ComponentPanel"
import { Canvas } from "@/components/builder/Canvas"
import { PropertiesPanel } from "@/components/builder/PropertiesPanel"
import { LayersPanel } from "@/components/builder/LayersPanel"

export default function BuilderContent() {
  return (
    <BuilderDnd>
      <div className="flex flex-col h-screen overflow-hidden bg-[#141417]">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="flex flex-col w-52 shrink-0">
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

"use client"

import { useCallback } from "react"
import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { registry } from "@/registry/index"
import { PropSchema } from "@/types/builder"

interface PropEditorProps {
  propKey: string
  schema: PropSchema
  value: unknown
  onChange: (key: string, value: unknown) => void
}

function PropEditor({ propKey, schema, value, onChange }: PropEditorProps) {
  const handleChange = useCallback(
    (val: unknown) => onChange(propKey, val),
    [propKey, onChange]
  )

  const inputBase = "w-full text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-zinc-50 text-zinc-800 transition-colors placeholder:text-zinc-400"

  return (
    <div className="mb-3.5">
      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">
        {schema.label}
      </label>
      {schema.type === "string" && (
        <input
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          className={inputBase}
        />
      )}
      {schema.type === "textarea" && (
        <textarea
          value={(value as string) ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          rows={3}
          className={`${inputBase} resize-none leading-relaxed`}
        />
      )}
      {schema.type === "number" && (
        <input
          type="number"
          value={(value as number) ?? 0}
          onChange={(e) => handleChange(Number(e.target.value))}
          className={inputBase}
        />
      )}
      {schema.type === "boolean" && (
        <button
          onClick={() => handleChange(!value)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
            value ? "bg-[#0068FF]" : "bg-zinc-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              value ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      )}
      {schema.type === "select" && (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => handleChange(e.target.value)}
          className={`${inputBase} cursor-pointer`}
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {schema.type === "color" && (
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0">
            <input
              type="color"
              value={(value as string) ?? "#000000"}
              onChange={(e) => handleChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-8 h-8 rounded-lg border-2 border-white shadow-md ring-1 ring-zinc-200 cursor-pointer"
              style={{ backgroundColor: (value as string) ?? "#000000" }}
            />
          </div>
          <input
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className={`${inputBase} flex-1 font-mono`}
            placeholder="#000000"
          />
        </div>
      )}
    </div>
  )
}

function AppConfigPanel() {
  const appConfig = useBuilderStore((s) => s.appConfig)
  const updateAppConfig = useBuilderStore((s) => s.updateAppConfig)

  const inputBase = "w-full text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-zinc-50 text-zinc-800 transition-colors"

  return (
    <div className="p-4">
      <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.1em] mb-4">
        App Settings
      </p>

      <div className="mb-3.5">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">
          Ten ung dung
        </label>
        <input
          type="text"
          value={appConfig.title}
          onChange={(e) => updateAppConfig({ title: e.target.value })}
          className={inputBase}
        />
      </div>

      <div className="mb-3.5">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">
          Mau chu dao
        </label>
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0">
            <input
              type="color"
              value={appConfig.themeColor}
              onChange={(e) => updateAppConfig({ themeColor: e.target.value })}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div
              className="w-8 h-8 rounded-lg border-2 border-white shadow-md ring-1 ring-zinc-200 cursor-pointer"
              style={{ backgroundColor: appConfig.themeColor }}
            />
          </div>
          <input
            type="text"
            value={appConfig.themeColor}
            onChange={(e) => updateAppConfig({ themeColor: e.target.value })}
            className={`${inputBase} flex-1 font-mono`}
          />
        </div>
      </div>

      <div className="mb-3.5">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">
          Status bar
        </label>
        <select
          value={appConfig.statusBar}
          onChange={(e) => updateAppConfig({ statusBar: e.target.value as "transparent" | "white" | "auto" })}
          className={`${inputBase} cursor-pointer`}
        >
          <option value="transparent">Transparent</option>
          <option value="white">White</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">
          An action bar
        </label>
        <button
          onClick={() => updateAppConfig({ actionBarHidden: !appConfig.actionBarHidden })}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
            appConfig.actionBarHidden ? "bg-[#0068FF]" : "bg-zinc-200"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
              appConfig.actionBarHidden ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  )
}

export function PropertiesPanel() {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const currentPage = useBuilderStore(selectCurrentPage)
  const updateProp = useBuilderStore((s) => s.updateProp)

  const nodes = currentPage?.nodes ?? {}
  const node = selectedId ? nodes[selectedId] : null
  const def = node ? registry[node.type] : null

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (selectedId) updateProp(selectedId, key, value)
    },
    [selectedId, updateProp]
  )

  if (!node || !def) {
    return (
      <div className="w-64 border-l border-zinc-200 bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
          <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.1em]">Properties</p>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-hide">
          <AppConfigPanel />
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 border-l border-zinc-200 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.1em]">Properties</p>
        <span className="text-[10px] bg-blue-50 text-[#0068FF] px-2 py-0.5 rounded-full font-semibold border border-blue-100">
          {node.type}
        </span>
      </div>
      {/* Props */}
      <div className="overflow-y-auto flex-1 p-4 scrollbar-hide">
        {Object.entries(def.propSchema).map(([key, schema]) => (
          <PropEditor
            key={key}
            propKey={key}
            schema={schema}
            value={node.props[key]}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  )
}

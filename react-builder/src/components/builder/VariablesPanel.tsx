"use client"

import { useState } from "react"
import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { Variable, VariableScope, VariableType } from "@/types/builder"
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiCheckLine, RiCloseLine, RiDatabase2Line } from "react-icons/ri"

const TYPE_OPTIONS: VariableType[] = ["string", "number", "boolean", "list", "object"]
const TYPE_LABELS: Record<VariableType, string> = {
  string: "STR", number: "NUM", boolean: "BOOL", list: "LIST", object: "OBJ",
}
const TYPE_COLORS: Record<VariableType, string> = {
  string:  "text-emerald-400 bg-emerald-950 border-emerald-800",
  number:  "text-blue-400 bg-blue-950 border-blue-800",
  boolean: "text-purple-400 bg-purple-950 border-purple-800",
  list:    "text-orange-400 bg-orange-950 border-orange-800",
  object:  "text-zinc-400 bg-zinc-800 border-zinc-700",
}

function defaultValueFor(type: VariableType): unknown {
  switch (type) {
    case "string": return ""
    case "number": return 0
    case "boolean": return false
    case "list": return []
    case "object": return {}
  }
}

const inputBase = "w-full text-[11px] border border-[#2A2A32] rounded-md px-2 py-1 outline-none focus:border-[#0068FF] bg-[#1A1A1E] text-zinc-300 placeholder:text-zinc-600"

interface VariableRowProps {
  variable: Variable
  onUpdate: (id: string, patch: Partial<Omit<Variable, "id">>) => void
  onRemove: (id: string) => void
}

function VariableRow({ variable, onUpdate, onRemove }: VariableRowProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: variable.name, type: variable.type })

  function save() {
    onUpdate(variable.id, {
      name: draft.name.trim() || variable.name,
      type: draft.type,
      defaultValue: draft.type !== variable.type ? defaultValueFor(draft.type) : variable.defaultValue,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#1A1D2E] border border-[#0068FF]/40 rounded-lg">
        <input
          autoFocus
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className={`${inputBase} flex-1 min-w-0`}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false) }}
        />
        <select
          value={draft.type}
          onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as VariableType }))}
          className="text-[10px] border border-[#2A2A32] rounded px-1 py-1 bg-[#1A1A1E] text-zinc-400 outline-none"
        >
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={save} className="p-1 text-[#0068FF] hover:text-blue-400 rounded shrink-0">
          <RiCheckLine size={12} />
        </button>
        <button onClick={() => setEditing(false)} className="p-1 text-zinc-600 hover:text-zinc-400 rounded shrink-0">
          <RiCloseLine size={12} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1E1E24] group cursor-default">
      <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${TYPE_COLORS[variable.type]} shrink-0`}>
        {TYPE_LABELS[variable.type]}
      </span>
      <span className="font-mono text-[11px] text-zinc-300 flex-1 truncate">{variable.name}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => { setDraft({ name: variable.name, type: variable.type }); setEditing(true) }}
          className="p-1 text-zinc-600 hover:text-zinc-300 rounded"
        >
          <RiEditLine size={11} />
        </button>
        <button onClick={() => onRemove(variable.id)} className="p-1 text-zinc-600 hover:text-red-400 rounded">
          <RiDeleteBinLine size={11} />
        </button>
      </div>
    </div>
  )
}

interface AddVariableFormProps {
  onAdd: (name: string, type: VariableType) => void
}

function AddVariableForm({ onAdd }: AddVariableFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<VariableType>("string")

  function submit() {
    if (!name.trim()) return
    onAdd(name.trim(), type)
    setName("")
    setType("string")
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-[#0068FF] font-medium mt-1 px-2 py-1 rounded transition-colors"
      >
        <RiAddLine size={12} />
        Thêm biến
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 mt-1 bg-[#1A1D2E] border border-[#0068FF]/40 rounded-lg">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`${inputBase} flex-1 min-w-0`}
        placeholder="tênBiến"
        onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") setOpen(false) }}
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as VariableType)}
        className="text-[10px] border border-[#2A2A32] rounded px-1 py-1 bg-[#1A1A1E] text-zinc-400 outline-none"
      >
        {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <button onClick={submit} className="p-1 text-[#0068FF] hover:text-blue-400 rounded shrink-0">
        <RiCheckLine size={12} />
      </button>
      <button onClick={() => setOpen(false)} className="p-1 text-zinc-600 hover:text-zinc-400 rounded shrink-0">
        <RiCloseLine size={12} />
      </button>
    </div>
  )
}

interface SectionProps {
  label: string
  badge?: string
  variables: Variable[]
  onUpdate: (id: string, patch: Partial<Omit<Variable, "id">>) => void
  onRemove: (id: string) => void
  onAdd: (name: string, type: VariableType) => void
}

function VariableSection({ label, badge, variables, onUpdate, onRemove, onAdd }: SectionProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 px-2 mb-1">
        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.12em]">{label}</span>
        {badge && (
          <span className="text-[8px] text-zinc-700 font-mono bg-zinc-800 px-1 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        {variables.map((v) => (
          <VariableRow key={v.id} variable={v} onUpdate={onUpdate} onRemove={onRemove} />
        ))}
        {variables.length === 0 && (
          <p className="text-[10px] text-zinc-700 italic px-2 py-1">Trống</p>
        )}
      </div>
      <AddVariableForm onAdd={onAdd} />
    </div>
  )
}

export function VariablesPanel() {
  const variables = useBuilderStore((s) => s.variables)
  const currentPage = useBuilderStore(selectCurrentPage)
  const currentPageId = useBuilderStore((s) => s.currentPageId)
  const addVariable = useBuilderStore((s) => s.addVariable)
  const updateVariable = useBuilderStore((s) => s.updateVariable)
  const removeVariable = useBuilderStore((s) => s.removeVariable)

  const appVars = variables.filter((v) => v.scope === "app")
  const pageVars = variables.filter((v) => v.scope === "page" && v.pageId === currentPageId)

  return (
    <div className="flex flex-col h-full bg-[#141417] overflow-hidden border-r border-[#1E1E24]">
      {/* Header */}
      <div className="px-3 pt-3 pb-2.5 shrink-0 border-b border-[#1E1E24]">
        <div className="flex items-center gap-2">
          <RiDatabase2Line size={13} className="text-zinc-600" />
          <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em]">Variables</p>
          {variables.length > 0 && (
            <span className="ml-auto text-[9px] text-zinc-700 font-mono bg-zinc-800 px-1.5 rounded">
              {variables.length}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide pt-3">
        {/* App State */}
        <VariableSection
          label="App State"
          badge={`${appVars.length}`}
          variables={appVars}
          onUpdate={updateVariable}
          onRemove={removeVariable}
          onAdd={(name, type) => addVariable(name, "app", type, defaultValueFor(type))}
        />

        {/* Divider */}
        <div className="h-px bg-[#1E1E24] mx-3 mb-4" />

        {/* Page State */}
        <VariableSection
          label={`Page — ${currentPage?.name ?? ""}`}
          badge={`${pageVars.length}`}
          variables={pageVars}
          onUpdate={updateVariable}
          onRemove={removeVariable}
          onAdd={(name, type) => addVariable(name, "page", type, defaultValueFor(type), currentPageId)}
        />

        {/* Footer hint */}
        <div className="mx-3 mt-2 mb-4 p-2.5 bg-[#1E1E24] rounded-lg border border-[#2A2A32]">
          <p className="text-[9px] text-zinc-600 leading-relaxed">
            <span className="text-zinc-500 font-semibold">App State</span> — tồn tại xuyên app<br />
            <span className="text-zinc-500 font-semibold">Page State</span> — reset khi rời trang<br />
            Bind props bằng tab <span className="text-[#0068FF] font-semibold">Bind</span> trong Properties
          </p>
        </div>
      </div>
    </div>
  )
}

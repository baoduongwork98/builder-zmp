"use client"

import { useState } from "react"
import { useBuilderStore } from "@/store/builderStore"
import { ApiDefinition, ApiHeader, HttpMethod } from "@/types/builder"
import {
  RiAddLine, RiDeleteBinLine, RiArrowLeftSLine, RiCheckLine, RiFlashlightLine, RiEditLine,
} from "react-icons/ri"

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]
const METHOD_COLORS: Record<HttpMethod, string> = {
  GET:    "text-emerald-400 bg-emerald-950 border-emerald-800",
  POST:   "text-blue-400 bg-blue-950 border-blue-800",
  PUT:    "text-orange-400 bg-orange-950 border-orange-800",
  PATCH:  "text-yellow-400 bg-yellow-950 border-yellow-800",
  DELETE: "text-red-400 bg-red-950 border-red-800",
}

const inputBase =
  "w-full text-[11px] border border-[#2A2A32] rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-[#1A1A1E] text-zinc-300 transition-colors placeholder:text-zinc-600"

interface ApiEditorProps {
  api: ApiDefinition
  variables: string[]
  onBack: () => void
}

function ApiEditor({ api, variables, onBack }: ApiEditorProps) {
  const updateApi = useBuilderStore((s) => s.updateApi)

  function patch(p: Partial<Omit<ApiDefinition, "id">>) { updateApi(api.id, p) }

  function addHeader() { patch({ headers: [...api.headers, { key: "", value: "" }] }) }
  function updateHeader(i: number, field: keyof ApiHeader, value: string) {
    patch({ headers: api.headers.map((h, idx) => idx === i ? { ...h, [field]: value } : h) })
  }
  function removeHeader(i: number) { patch({ headers: api.headers.filter((_, idx) => idx !== i) }) }

  return (
    <div className="flex flex-col h-full bg-[#141417]">
      {/* Header */}
      <div className="px-2.5 py-2.5 border-b border-[#1E1E24] flex items-center gap-1.5 shrink-0">
        <button onClick={onBack} className="p-1 text-zinc-600 hover:text-zinc-300 rounded transition-colors">
          <RiArrowLeftSLine size={15} />
        </button>
        <span className="text-[11px] font-semibold text-zinc-300 truncate flex-1">{api.name}</span>
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${METHOD_COLORS[api.method]}`}>
          {api.method}
        </span>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide px-3 py-3 space-y-3">
        {/* Name */}
        <div>
          <label className="block text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.1em] mb-1.5">Tên API</label>
          <input value={api.name} onChange={(e) => patch({ name: e.target.value })} className={inputBase} placeholder="Lấy danh sách..." />
        </div>

        {/* Method + URL */}
        <div>
          <label className="block text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.1em] mb-1.5">Endpoint</label>
          <div className="flex gap-1.5">
            <select
              value={api.method}
              onChange={(e) => patch({ method: e.target.value as HttpMethod })}
              className="text-[10px] font-bold border border-[#2A2A32] rounded-lg px-1.5 py-1.5 bg-[#1A1A1E] text-zinc-300 outline-none focus:border-[#0068FF] w-16 shrink-0 cursor-pointer"
            >
              {HTTP_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              value={api.url}
              onChange={(e) => patch({ url: e.target.value })}
              className={`${inputBase} flex-1 font-mono text-[10px]`}
              placeholder="https://api.example.com/..."
            />
          </div>
          <p className="text-[9px] text-zinc-700 mt-1 px-0.5">Dùng {"{{varName}}"} trong URL</p>
        </div>

        {/* Headers */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.1em]">Headers</label>
            <button onClick={addHeader} className="text-[9px] text-[#0068FF] hover:text-blue-400 font-semibold flex items-center gap-0.5 transition-colors">
              <RiAddLine size={11} /> Thêm
            </button>
          </div>
          <div className="space-y-1.5">
            {api.headers.length === 0 ? (
              <p className="text-[10px] text-zinc-700 italic">Không có header</p>
            ) : (
              api.headers.map((h, i) => (
                <div key={i} className="flex gap-1">
                  <input value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} className={`${inputBase} flex-1 font-mono text-[10px]`} placeholder="Key" />
                  <input value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} className={`${inputBase} flex-1 font-mono text-[10px]`} placeholder="Value" />
                  <button onClick={() => removeHeader(i)} className="p-1.5 text-zinc-700 hover:text-red-400 rounded transition-colors">
                    <RiDeleteBinLine size={11} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Body */}
        {["POST", "PUT", "PATCH"].includes(api.method) && (
          <div>
            <label className="block text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.1em] mb-1.5">Body (JSON)</label>
            <textarea
              value={api.body}
              onChange={(e) => patch({ body: e.target.value })}
              rows={4}
              className={`${inputBase} resize-none font-mono text-[10px] leading-relaxed`}
              placeholder={'{\n  "key": "{{varName}}"\n}'}
            />
          </div>
        )}

        {/* Response */}
        <div className="border-t border-[#1E1E24] pt-3">
          <label className="block text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.1em] mb-2">Lưu Response</label>
          <div className="space-y-2">
            <div>
              <label className="block text-[9px] text-zinc-600 mb-1">Biến lưu kết quả</label>
              <select
                value={api.responseVariable}
                onChange={(e) => patch({ responseVariable: e.target.value })}
                className={`${inputBase} cursor-pointer`}
              >
                <option value="">— Không lưu —</option>
                {variables.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              {variables.length === 0 && (
                <p className="text-[9px] text-zinc-700 mt-1">Tạo biến kiểu "list" trong tab Variables trước</p>
              )}
            </div>
            {api.responseVariable && (
              <div>
                <label className="block text-[9px] text-zinc-600 mb-1">Trích xuất field</label>
                <input
                  value={api.responseKey}
                  onChange={(e) => patch({ responseKey: e.target.value })}
                  className={`${inputBase} font-mono text-[10px]`}
                  placeholder="data.items"
                />
                <p className="text-[9px] text-zinc-700 mt-0.5">Để trống → lưu toàn bộ response</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ApiPanel() {
  const apis = useBuilderStore((s) => s.apis)
  const variables = useBuilderStore((s) => s.variables)
  const addApi = useBuilderStore((s) => s.addApi)
  const removeApi = useBuilderStore((s) => s.removeApi)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)

  const variableNames = variables.map((v) => v.name)
  const editingApi = editingId ? apis.find((a) => a.id === editingId) : null

  if (editingApi) {
    return <ApiEditor api={editingApi} variables={variableNames} onBack={() => setEditingId(null)} />
  }

  function handleAdd() {
    if (!newName.trim()) return
    const id = addApi(newName.trim())
    setNewName("")
    setAdding(false)
    setEditingId(id)
  }

  return (
    <div className="flex flex-col h-full bg-[#141417] overflow-hidden border-r border-[#1E1E24]">
      {/* Header */}
      <div className="px-3 pt-3 pb-2.5 shrink-0 border-b border-[#1E1E24]">
        <div className="flex items-center gap-2">
          <RiFlashlightLine size={13} className="text-zinc-600" />
          <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-[0.12em]">API Manager</p>
          {apis.length > 0 && (
            <span className="ml-auto text-[9px] text-zinc-700 font-mono bg-zinc-800 px-1.5 rounded">{apis.length}</span>
          )}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide px-2 pt-3">
        {/* Empty state */}
        {apis.length === 0 && !adding && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#1E1E24] border border-[#2A2A32] flex items-center justify-center">
              <RiFlashlightLine size={18} className="text-zinc-700" />
            </div>
            <p className="text-[10px] text-zinc-700 leading-relaxed">Chưa có API<br />nào được định nghĩa</p>
          </div>
        )}

        {/* List */}
        <div className="space-y-1 mb-3">
          {apis.map((api) => (
            <div
              key={api.id}
              className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-[#1E1E24] group cursor-pointer"
              onClick={() => setEditingId(api.id)}
            >
              <span className={`text-[8px] font-bold px-1 py-0.5 rounded border shrink-0 ${METHOD_COLORS[api.method]}`}>
                {api.method}
              </span>
              <span className="flex-1 text-[11px] text-zinc-400 font-medium truncate">{api.name}</span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={(e) => { e.stopPropagation(); setEditingId(api.id) }} className="p-1 text-zinc-600 hover:text-zinc-300 rounded">
                  <RiEditLine size={11} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); removeApi(api.id) }} className="p-1 text-zinc-600 hover:text-red-400 rounded">
                  <RiDeleteBinLine size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {adding ? (
          <div className="flex items-center gap-1 px-2 py-1.5 bg-[#1A1D2E] border border-[#0068FF]/40 rounded-lg">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`${inputBase} flex-1`}
              placeholder="Tên API call"
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false) }}
            />
            <button onClick={handleAdd} className="p-1 text-[#0068FF] hover:text-blue-400 rounded shrink-0">
              <RiCheckLine size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-[#0068FF] font-medium px-2 py-1 rounded transition-colors"
          >
            <RiAddLine size={12} /> Thêm API
          </button>
        )}

        {/* Footer hint */}
        {apis.length > 0 && (
          <div className="mx-1 mt-4 mb-4 p-2.5 bg-[#1E1E24] rounded-lg border border-[#2A2A32]">
            <p className="text-[9px] text-zinc-600 leading-relaxed">
              Kích hoạt bằng action <span className="text-[#0068FF] font-semibold">callApi</span> trong Events panel.
              Response được lưu vào biến để bind vào UI.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

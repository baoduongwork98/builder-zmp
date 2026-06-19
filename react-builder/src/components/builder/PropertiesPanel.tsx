"use client"

import { useCallback, useState } from "react"
import { useBuilderStore, selectCurrentPage } from "@/store/builderStore"
import { registry } from "@/registry/index"
import { PageSchema, PropSchema, Action, NodeEvents, Variable, ListBinding } from "@/types/builder"
import { RiLinkM, RiCloseLine } from "react-icons/ri"

// ─── PropEditor ───────────────────────────────────────────────────────────────

interface PropEditorProps {
  propKey: string
  schema: PropSchema
  value: unknown
  onChange: (key: string, value: unknown) => void
  pages: PageSchema[]
  boundVariable?: string
  allVariables: Variable[]
  onBindVariable: (propKey: string, varName: string | null) => void
}

function PropEditor({ propKey, schema, value, onChange, pages, boundVariable, allVariables, onBindVariable }: PropEditorProps) {
  const handleChange = useCallback(
    (val: unknown) => onChange(propKey, val),
    [propKey, onChange]
  )

  const inputBase = "w-full text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-zinc-50 text-zinc-800 transition-colors placeholder:text-zinc-400"
  const isBound = !!boundVariable

  return (
    <div className="mb-3.5">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">
          {schema.label}
        </label>
        <div className="flex items-center gap-1">
          {isBound ? (
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-[#0068FF] font-mono bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                {boundVariable}
              </span>
              <button
                onClick={() => onBindVariable(propKey, null)}
                className="p-0.5 text-zinc-300 hover:text-red-400 rounded"
                title="Huỷ binding"
              >
                <RiCloseLine size={11} />
              </button>
            </div>
          ) : (
            <select
              value=""
              onChange={(e) => { if (e.target.value) onBindVariable(propKey, e.target.value) }}
              className="text-[9px] text-zinc-300 hover:text-[#0068FF] border border-transparent hover:border-zinc-200 rounded px-1 py-0.5 cursor-pointer bg-transparent outline-none transition-colors"
              title="Bind tới biến"
            >
              <option value="">
                {allVariables.length === 0 ? "Chưa có biến" : "Bind…"}
              </option>
              {allVariables.map((v) => (
                <option key={v.id} value={v.name}>{v.name} ({v.type})</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isBound ? (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
          <RiLinkM size={11} className="text-[#0068FF] shrink-0" />
          <span className="text-[11px] text-[#0068FF] font-mono">{`{${boundVariable}}`}</span>
        </div>
      ) : (
        <>
          {schema.type === "string" && (
            <input type="text" value={(value as string) ?? ""} onChange={(e) => handleChange(e.target.value)} className={inputBase} />
          )}
          {schema.type === "textarea" && (
            <textarea value={(value as string) ?? ""} onChange={(e) => handleChange(e.target.value)} rows={3} className={`${inputBase} resize-none leading-relaxed`} />
          )}
          {schema.type === "number" && (
            <input type="number" value={(value as number) ?? 0} onChange={(e) => handleChange(Number(e.target.value))} className={inputBase} />
          )}
          {schema.type === "boolean" && (
            <button onClick={() => handleChange(!value)} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${value ? "bg-[#0068FF]" : "bg-zinc-200"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          )}
          {schema.type === "select" && (
            <select value={(value as string) ?? ""} onChange={(e) => handleChange(e.target.value)} className={`${inputBase} cursor-pointer`}>
              {schema.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
          {schema.type === "toggle" && (
            <div className="flex rounded-lg overflow-hidden border border-zinc-200">
              {schema.options?.map((opt) => (
                <button key={opt} onClick={() => handleChange(opt)} className={`flex-1 text-[11px] py-1.5 font-medium capitalize transition-colors ${value === opt ? "bg-[#0068FF] text-white" : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"}`}>
                  {opt}
                </button>
              ))}
            </div>
          )}
          {schema.type === "page-select" && (
            <select value={(value as string) ?? ""} onChange={(e) => handleChange(e.target.value)} className={`${inputBase} cursor-pointer`}>
              <option value="">— Không liên kết —</option>
              {pages.map((p) => <option key={p.id} value={p.path}>{p.name} ({p.path})</option>)}
            </select>
          )}
          {schema.type === "color" && (
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 shrink-0">
                <input type="color" value={(value as string) ?? "#000000"} onChange={(e) => handleChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="w-8 h-8 rounded-lg border-2 border-white shadow-md ring-1 ring-zinc-200 cursor-pointer" style={{ backgroundColor: (value as string) ?? "#000000" }} />
              </div>
              <input type="text" value={(value as string) ?? ""} onChange={(e) => handleChange(e.target.value)} className={`${inputBase} flex-1 font-mono`} placeholder="#000000" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── ListBindingEditor ────────────────────────────────────────────────────────

interface ListBindingEditorProps {
  nodeId: string
  binding: ListBinding | undefined
  listVariables: Variable[]
}

function ListBindingEditor({ nodeId, binding, listVariables }: ListBindingEditorProps) {
  const updateListBinding = useBuilderStore((s) => s.updateListBinding)
  const [itemAlias, setItemAlias] = useState(binding?.itemAlias ?? "item")
  const inputBase = "w-full text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-zinc-50 text-zinc-800 transition-colors"

  return (
    <div className="p-4 border-t border-zinc-100">
      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-3">List Binding</p>
      <div className="space-y-2.5">
        <div>
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">Nguồn dữ liệu</label>
          <select
            value={binding?.variable ?? ""}
            onChange={(e) => {
              if (!e.target.value) { updateListBinding(nodeId, null) }
              else { updateListBinding(nodeId, { variable: e.target.value, itemAlias }) }
            }}
            className={`${inputBase} cursor-pointer`}
          >
            <option value="">— Không bind —</option>
            {listVariables.map((v) => <option key={v.id} value={v.name}>{v.name}</option>)}
          </select>
          {listVariables.length === 0 && (
            <p className="text-[9px] text-zinc-300 mt-1">Tạo biến kiểu "list" trong tab Variables</p>
          )}
        </div>

        {binding?.variable && (
          <>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">Tên item (alias)</label>
              <input
                value={itemAlias}
                onChange={(e) => setItemAlias(e.target.value)}
                onBlur={() => { if (binding?.variable && itemAlias.trim()) updateListBinding(nodeId, { variable: binding.variable, itemAlias: itemAlias.trim() }) }}
                className={inputBase}
                placeholder="item"
              />
              <p className="text-[9px] text-zinc-300 mt-1">Dùng <code className="font-mono">{`{${itemAlias}.field}`}</code> trong children</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <p className="text-[9px] text-[#0068FF] font-semibold">
                Lặp qua từng item trong <code className="font-mono">{binding.variable}</code>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── VisibilityEditor ─────────────────────────────────────────────────────────

interface VisibilityEditorProps {
  nodeId: string
  visibleWhen: string | undefined
  allVariables: Variable[]
}

function VisibilityEditor({ nodeId, visibleWhen, allVariables }: VisibilityEditorProps) {
  const updateVisibleWhen = useBuilderStore((s) => s.updateVisibleWhen)
  const inputBase = "w-full text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-zinc-50 text-zinc-800 transition-colors cursor-pointer"

  return (
    <div>
      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">Hiển thị khi</label>
      <select value={visibleWhen ?? ""} onChange={(e) => updateVisibleWhen(nodeId, e.target.value || null)} className={inputBase}>
        <option value="">— Luôn hiển thị —</option>
        {allVariables.map((v) => <option key={v.id} value={v.name}>{v.name} ({v.type})</option>)}
      </select>
    </div>
  )
}

// ─── EventsPanel ─────────────────────────────────────────────────────────────

const ACTION_TYPES: { value: Action["type"]; label: string; fields: string[] }[] = [
  { value: "navigate",     label: "Điều hướng trang",  fields: ["to"] },
  { value: "openUrl",      label: "Mở URL",            fields: ["url"] },
  { value: "openPhone",    label: "Gọi điện",          fields: ["phone"] },
  { value: "openProfile",  label: "Xem profile Zalo",  fields: ["userId"] },
  { value: "followOA",     label: "Theo dõi OA",       fields: ["oaId"] },
  { value: "showSnackbar", label: "Hiện thông báo",    fields: ["message"] },
  { value: "share",        label: "Chia sẻ ứng dụng", fields: [] },
  { value: "setState",     label: "Cập nhật biến",     fields: ["variable", "value"] },
  { value: "callApi",      label: "Gọi API",           fields: ["apiId"] },
]

const ACTION_FIELD_LABELS: Record<string, string> = {
  to: "Đường dẫn trang", url: "URL", phone: "Số điện thoại",
  userId: "User ID Zalo", oaId: "OA ID", message: "Nội dung thông báo",
  variable: "Biến", value: "Giá trị mới", apiId: "API",
}

interface ActionEditorProps {
  action: Action | undefined
  onSave: (action: Action) => void
  onClear: () => void
  pages: PageSchema[]
  variables: Variable[]
  apis: { id: string; name: string }[]
}

function ActionEditor({ action, onSave, onClear, pages, variables, apis }: ActionEditorProps) {
  const [type, setType] = useState<Action["type"]>(action?.type ?? "navigate")
  const [fields, setFields] = useState<Record<string, string>>(() => {
    if (!action) return {}
    const { type: _t, ...rest } = action as Record<string, string>
    void _t
    return rest
  })

  const def = ACTION_TYPES.find((a) => a.value === type)!
  const inputBase = "w-full text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-zinc-50 text-zinc-800 transition-colors"

  function handleSave() {
    if (type === "share") { onSave({ type: "share" }); return }
    onSave({ type, ...fields } as Action)
  }

  function renderField(field: string) {
    if (field === "to") return (
      <select value={fields[field] ?? ""} onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))} className={`${inputBase} cursor-pointer`}>
        <option value="">— Chọn trang —</option>
        {pages.map((p) => <option key={p.id} value={p.path}>{p.name} ({p.path})</option>)}
      </select>
    )
    if (field === "variable") return (
      <select value={fields[field] ?? ""} onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))} className={`${inputBase} cursor-pointer`}>
        <option value="">— Chọn biến —</option>
        {variables.map((v) => <option key={v.id} value={v.name}>{v.name} ({v.type})</option>)}
      </select>
    )
    if (field === "apiId") return (
      <select value={fields[field] ?? ""} onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))} className={`${inputBase} cursor-pointer`}>
        <option value="">— Chọn API —</option>
        {apis.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
    )
    return (
      <input type="text" value={fields[field] ?? ""} onChange={(e) => setFields((f) => ({ ...f, [field]: e.target.value }))} className={inputBase} placeholder={ACTION_FIELD_LABELS[field]} />
    )
  }

  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2.5">
      <div>
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">Hành động</label>
        <select value={type} onChange={(e) => { setType(e.target.value as Action["type"]); setFields({}) }} className={`${inputBase} cursor-pointer`}>
          {ACTION_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
        </select>
      </div>
      {def.fields.map((field) => (
        <div key={field}>
          <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">{ACTION_FIELD_LABELS[field] ?? field}</label>
          {renderField(field)}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} className="flex-1 text-[11px] font-semibold bg-[#0068FF] text-white rounded-lg py-1.5 hover:bg-blue-600 transition-colors">Lưu</button>
        {action && (
          <button onClick={onClear} className="text-[11px] font-semibold text-zinc-400 hover:text-red-500 px-3 rounded-lg border border-zinc-200 hover:border-red-200 transition-colors">Xoá</button>
        )}
      </div>
    </div>
  )
}

interface EventRowProps {
  label: string
  eventKey: keyof NodeEvents
  action: Action | undefined
  pages: PageSchema[]
  variables: Variable[]
  apis: { id: string; name: string }[]
  onSave: (eventKey: keyof NodeEvents, action: Action) => void
  onClear: (eventKey: keyof NodeEvents) => void
}

function EventRow({ label, eventKey, action, pages, variables, apis, onSave, onClear }: EventRowProps) {
  const [open, setOpen] = useState(false)
  const actionDef = ACTION_TYPES.find((a) => a.value === action?.type)

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between cursor-pointer group mb-1.5" onClick={() => setOpen((v) => !v)}>
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">{label}</span>
        {action ? (
          <span className="text-[10px] bg-blue-50 text-[#0068FF] px-2 py-0.5 rounded-full font-semibold border border-blue-100">{actionDef?.label ?? action.type}</span>
        ) : (
          <span className="text-[10px] text-zinc-300 group-hover:text-zinc-500 transition-colors">+ Thêm</span>
        )}
      </div>
      {open && (
        <ActionEditor
          action={action} pages={pages} variables={variables} apis={apis}
          onSave={(a) => { onSave(eventKey, a); setOpen(false) }}
          onClear={() => { onClear(eventKey); setOpen(false) }}
        />
      )}
    </div>
  )
}

interface EventsPanelProps {
  nodeId: string
  events: NodeEvents | undefined
  pages: PageSchema[]
  variables: Variable[]
  apis: { id: string; name: string }[]
}

function EventsPanel({ nodeId, events, pages, variables, apis }: EventsPanelProps) {
  const updateEvent = useBuilderStore((s) => s.updateEvent)
  const clearEvent = useBuilderStore((s) => s.clearEvent)

  return (
    <div className="p-4">
      <EventRow label="onClick" eventKey="onClick" action={events?.onClick} pages={pages} variables={variables} apis={apis} onSave={(k, a) => updateEvent(nodeId, k, a)} onClear={(k) => clearEvent(nodeId, k)} />
      <EventRow label="onChange" eventKey="onChange" action={events?.onChange} pages={pages} variables={variables} apis={apis} onSave={(k, a) => updateEvent(nodeId, k, a)} onClear={(k) => clearEvent(nodeId, k)} />
      <p className="text-[10px] text-zinc-300 leading-relaxed mt-2">Sự kiện được export thành code thực thi trong file tsx.</p>
    </div>
  )
}

// ─── AppConfigPanel ───────────────────────────────────────────────────────────

function AppConfigPanel() {
  const appConfig = useBuilderStore((s) => s.appConfig)
  const updateAppConfig = useBuilderStore((s) => s.updateAppConfig)
  const inputBase = "w-full text-[11px] border border-zinc-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#0068FF] bg-zinc-50 text-zinc-800 transition-colors"

  return (
    <div className="p-4">
      <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.1em] mb-4">App Settings</p>
      <div className="mb-3.5">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">Tên ứng dụng</label>
        <input type="text" value={appConfig.title} onChange={(e) => updateAppConfig({ title: e.target.value })} className={inputBase} />
      </div>
      <div className="mb-3.5">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">Màu chủ đạo</label>
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 shrink-0">
            <input type="color" value={appConfig.themeColor} onChange={(e) => updateAppConfig({ themeColor: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <div className="w-8 h-8 rounded-lg border-2 border-white shadow-md ring-1 ring-zinc-200 cursor-pointer" style={{ backgroundColor: appConfig.themeColor }} />
          </div>
          <input type="text" value={appConfig.themeColor} onChange={(e) => updateAppConfig({ themeColor: e.target.value })} className={`${inputBase} flex-1 font-mono`} />
        </div>
      </div>
      <div className="mb-3.5">
        <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em] mb-1.5">Status bar</label>
        <select value={appConfig.statusBar} onChange={(e) => updateAppConfig({ statusBar: e.target.value as "transparent" | "white" | "auto" })} className={`${inputBase} cursor-pointer`}>
          <option value="transparent">Transparent</option>
          <option value="white">White</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.08em]">Ẩn action bar</label>
        <button onClick={() => updateAppConfig({ actionBarHidden: !appConfig.actionBarHidden })} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${appConfig.actionBarHidden ? "bg-[#0068FF]" : "bg-zinc-200"}`}>
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${appConfig.actionBarHidden ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  )
}

// ─── PropertiesPanel ──────────────────────────────────────────────────────────

type Tab = "props" | "events" | "binding"

export function PropertiesPanel() {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const currentPage = useBuilderStore(selectCurrentPage)
  const currentPageId = useBuilderStore((s) => s.currentPageId)
  const updateProp = useBuilderStore((s) => s.updateProp)
  const updateBinding = useBuilderStore((s) => s.updateBinding)
  const pages = useBuilderStore((s) => s.pages)
  const variables = useBuilderStore((s) => s.variables)
  const apis = useBuilderStore((s) => s.apis)
  const [activeTab, setActiveTab] = useState<Tab>("props")

  const nodes = currentPage?.nodes ?? {}
  const node = selectedId ? nodes[selectedId] : null
  const def = node ? registry[node.type] : null

  const handleChange = useCallback(
    (key: string, value: unknown) => { if (selectedId) updateProp(selectedId, key, value) },
    [selectedId, updateProp]
  )
  const handleBindVariable = useCallback(
    (propKey: string, varName: string | null) => { if (selectedId) updateBinding(selectedId, propKey, varName) },
    [selectedId, updateBinding]
  )

  const accessibleVars = variables.filter(
    (v) => v.scope === "app" || (v.scope === "page" && v.pageId === currentPageId)
  )
  const listVars = accessibleVars.filter((v) => v.type === "list")

  if (!node || !def) {
    return (
      <div className="w-64 border-l border-zinc-200 bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
          <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.1em]">Properties</p>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-hide"><AppConfigPanel /></div>
      </div>
    )
  }

  const hasEvents = node.events && Object.keys(node.events).length > 0
  const hasBindings = (node.bindings && Object.keys(node.bindings).length > 0) || !!node.listBinding || !!node.visibleWhen

  return (
    <div className="w-64 border-l border-zinc-200 bg-white flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <p className="text-[9px] font-semibold text-zinc-400 uppercase tracking-[0.1em]">Properties</p>
        <span className="text-[10px] bg-blue-50 text-[#0068FF] px-2 py-0.5 rounded-full font-semibold border border-blue-100">{node.type}</span>
      </div>

      <div className="flex border-b border-zinc-100 shrink-0">
        {(["props", "events", "binding"] as Tab[]).map((tab) => {
          const badge = (tab === "events" && hasEvents) || (tab === "binding" && hasBindings)
          return (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${activeTab === tab ? "text-[#0068FF] border-b-2 border-[#0068FF]" : "text-zinc-400 hover:text-zinc-600"}`}>
              {tab === "props" ? "Props" : tab === "events" ? "Events" : "Bind"}
              {badge && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-[#0068FF] align-middle" />}
            </button>
          )
        })}
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {activeTab === "props" && (
          <div className="p-4">
            {Object.entries(def.propSchema).map(([key, schema]) => (
              <PropEditor
                key={key} propKey={key} schema={schema} value={node.props[key]}
                onChange={handleChange} pages={pages}
                boundVariable={node.bindings?.[key]}
                allVariables={accessibleVars}
                onBindVariable={handleBindVariable}
              />
            ))}
          </div>
        )}
        {activeTab === "events" && (
          <EventsPanel nodeId={node.id} events={node.events} pages={pages} variables={accessibleVars} apis={apis} />
        )}
        {activeTab === "binding" && (
          <div>
            <div className="p-4">
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-3">Visibility</p>
              <VisibilityEditor nodeId={node.id} visibleWhen={node.visibleWhen} allVariables={accessibleVars} />
            </div>
            {def.acceptsChildren ? (
              <ListBindingEditor nodeId={node.id} binding={node.listBinding} listVariables={listVars} />
            ) : (
              <div className="px-4">
                <p className="text-[9px] text-zinc-300">List binding chỉ khả dụng với container có acceptsChildren.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

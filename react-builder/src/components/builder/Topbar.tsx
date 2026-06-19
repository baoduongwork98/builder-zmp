"use client"

import { useState, useRef, useEffect } from "react"
import JSZip from "jszip"
import { useBuilderStore } from "@/store/builderStore"
import { exportToZMP } from "@/lib/exportCode"
import { QRPreviewModal } from "./QRPreviewModal"
import { GitHubExportTab } from "./GitHubExportTab"

function UndoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  )
}

function DesktopIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function TabletIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <circle cx="12" cy="18" r="0.5" fill="currentColor" />
    </svg>
  )
}

function MobileIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="16" height="20" rx="3" />
      <circle cx="10" cy="19" r="0.5" fill="currentColor" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M16.9 16.9l1.4 1.4M5.6 18.4l1.4-1.4M16.9 7.1l1.4-1.4" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

type ViewportKey = "desktop" | "tablet" | "mobile"

const viewportOptions: { key: ViewportKey; label: string; icon: React.ReactNode }[] = [
  { key: "desktop", label: "Desktop", icon: <DesktopIcon /> },
  { key: "tablet", label: "Tablet", icon: <TabletIcon /> },
  { key: "mobile", label: "Mobile", icon: <MobileIcon /> },
]

function loadDemo() {
  const store = useBuilderStore.getState()
  store.clearCanvas()
  store.addNode("ZaloHeader", null)
  store.addNode("ZaloSearchBar", null)
  const card = store.addNode("ZaloCard", null)
  store.addNode("ZaloAvatar", card)
  store.addNode("ZaloSection", null)
  store.addNode("ZaloListItem", null)
  store.addNode("ZaloListItem", null)
  store.addNode("ZaloListItem", null)
  store.addNode("ZaloBottomNav", null)
}

export function Topbar() {
  const viewport = useBuilderStore((s) => s.viewport)
  const setViewport = useBuilderStore((s) => s.setViewport)
  const undo = useBuilderStore((s) => s.undo)
  const redo = useBuilderStore((s) => s.redo)
  const clearCanvas = useBuilderStore((s) => s.clearCanvas)
  const historyIndex = useBuilderStore((s) => s.historyIndex)
  const history = useBuilderStore((s) => s.history)

  const pages = useBuilderStore((s) => s.pages)
  const currentPageId = useBuilderStore((s) => s.currentPageId)
  const addPage = useBuilderStore((s) => s.addPage)
  const removePage = useBuilderStore((s) => s.removePage)
  const setCurrentPage = useBuilderStore((s) => s.setCurrentPage)
  const renamePage = useBuilderStore((s) => s.renamePage)

  const appConfig = useBuilderStore((s) => s.appConfig)
  const allPages = useBuilderStore((s) => s.pages)

  // Detect GitHub OAuth redirect on first render — initialize state directly
  const [showExport, setShowExport] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    const p = new URLSearchParams(window.location.search)
    return !!p.get("github_token") || !!p.get("github_error")
  })
  const [exportTab, setExportTab] = useState<"files" | "github">(() => {
    if (typeof window === "undefined") return "files"
    const p = new URLSearchParams(window.location.search)
    return p.get("github_token") || p.get("github_error") ? "github" : "files"
  })
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  // Side-effects only: persist token + clean up URL after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("github_token")
    if (token) {
      localStorage.setItem("github_token", token)
      window.history.replaceState({}, "", window.location.pathname)
    } else if (params.get("github_error")) {
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  const PREVIEW_W = 430
  const PREVIEW_H = 932

  const handlePreview = () => {
    const { localUrl } = appConfig
    if (localUrl) {
      const left = Math.round(window.screenX + (window.outerWidth - PREVIEW_W) / 2)
      const top = Math.round(window.screenY + (window.outerHeight - PREVIEW_H) / 2)
      window.open(
        localUrl,
        "zmp-preview",
        `width=${PREVIEW_W},height=${PREVIEW_H},left=${left},top=${top},resizable=yes,scrollbars=yes`
      )
    } else {
      setShowQR(true)
    }
  }

  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const renameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingPageId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [editingPageId])

  const exportFiles = exportToZMP({ pages: allPages, appConfig })

  const handleCopy = async (filename: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(filename)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDownloadZip = async () => {
    setDownloading(true)
    try {
      const zip = new JSZip()
      Object.entries(exportFiles).forEach(([path, content]) => {
        zip.file(path, content)
      })
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${appConfig.title.replace(/\s+/g, "-").toLowerCase() || "zmp-app"}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const handleAddPage = () => {
    addPage(`Trang ${pages.length + 1}`)
  }

  const handleRenameStart = (id: string, name: string) => {
    setEditingPageId(id)
    setEditingName(name)
  }

  const handleRenameEnd = () => {
    if (editingPageId && editingName.trim()) {
      renamePage(editingPageId, editingName.trim())
    }
    setEditingPageId(null)
  }

  return (
    <>
      {/* Topbar */}
      <div className="h-11 border-b border-zinc-800 bg-[#0F0F10] flex items-center px-3 gap-2 shrink-0 z-10">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-zinc-800">
          <div className="w-6 h-6 rounded-md bg-[#0068FF] flex items-center justify-center">
            <span className="text-white text-[9px] font-bold tracking-tight leading-none">ZMP</span>
          </div>
          <span className="text-[12px] font-semibold text-zinc-300 tracking-tight">Builder</span>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-2.5 border-r border-zinc-800">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-25 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <UndoIcon />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-md hover:bg-zinc-800 disabled:opacity-25 text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <RedoIcon />
          </button>
        </div>

        {/* Page tabs */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto min-w-0 scrollbar-hide">
          {pages.map((page) => (
            <div
              key={page.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer group shrink-0 transition-all duration-150 ${
                page.id === currentPageId
                  ? "bg-zinc-700 text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
              }`}
              onClick={() => setCurrentPage(page.id)}
              onDoubleClick={() => handleRenameStart(page.id, page.name)}
            >
              {editingPageId === page.id ? (
                <input
                  ref={renameInputRef}
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleRenameEnd}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameEnd()
                    if (e.key === "Escape") setEditingPageId(null)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-20 bg-transparent outline-none text-[11px] text-zinc-100"
                />
              ) : (
                <span>{page.name}</span>
              )}
              {pages.length > 1 && page.id === currentPageId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removePage(page.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all text-[10px] ml-0.5 w-3 h-3 flex items-center justify-center"
                >
                  x
                </button>
              )}
            </div>
          ))}
          <button
            onClick={handleAddPage}
            className="shrink-0 px-2 py-1 rounded-md text-[11px] text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            + Page
          </button>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center bg-zinc-800/80 rounded-lg p-0.5 shrink-0 gap-0.5">
          {viewportOptions.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              title={label}
              className={`p-1.5 rounded-md transition-all duration-150 ${
                viewport === key
                  ? "bg-zinc-600 text-zinc-100 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-300"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 pl-2.5 border-l border-zinc-800">
          <button
            onClick={loadDemo}
            title="Load demo content"
            className="flex items-center gap-1.5 text-[11px] text-zinc-600 hover:text-zinc-200 px-2 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <SparkleIcon />
            Demo
          </button>
          <button
            onClick={clearCanvas}
            title="Xoa trang"
            className="p-1.5 rounded-md text-zinc-700 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <TrashIcon />
          </button>
          <button
            onClick={handlePreview}
            className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
          >
            <PlayIcon />
            Preview
          </button>
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-1.5 bg-[#0068FF] hover:bg-blue-500 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            <CodeIcon />
            Export
          </button>
        </div>
      </div>

      {showQR && <QRPreviewModal onClose={() => setShowQR(false)} />}

      {/* Export modal */}
      {showExport && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-6 backdrop-blur-sm"
          onClick={() => setShowExport(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[88vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 tracking-tight">Export Zalo Mini App</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Tải xuống ZIP, copy từng file, hoặc push lên GitHub</p>
              </div>
              <div className="flex items-center gap-2">
                {exportTab === "files" && (
                  <button
                    onClick={handleDownloadZip}
                    disabled={downloading}
                    className="flex items-center gap-1.5 bg-[#0068FF] hover:bg-blue-500 disabled:opacity-60 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    {downloading ? (
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    )}
                    {downloading ? "Đang tạo..." : "Tải ZIP"}
                  </button>
                )}
                <button
                  onClick={() => setShowExport(false)}
                  className="w-7 h-7 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 flex items-center justify-center text-base transition-colors"
                >
                  x
                </button>
              </div>
            </div>

            {/* App summary bar */}
            <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-50 border-b border-zinc-100 shrink-0">
              <div className="w-5 h-5 rounded bg-[#0068FF] flex items-center justify-center shrink-0">
                <span className="text-white text-[8px] font-bold">Z</span>
              </div>
              <span className="text-xs font-medium text-zinc-700">{appConfig.title}</span>
              <code className="text-[10px] font-mono bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded">
                {appConfig.themeColor}
              </code>
              <span className="text-xs text-zinc-400">{pages.length} trang</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-100 shrink-0 px-5">
              <button
                onClick={() => setExportTab("files")}
                className={`py-2.5 text-[11px] font-medium border-b-2 transition-colors mr-4 ${
                  exportTab === "files"
                    ? "border-[#0068FF] text-[#0068FF]"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Files
              </button>
              <button
                onClick={() => setExportTab("github")}
                className={`py-2.5 text-[11px] font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  exportTab === "github"
                    ? "border-[#0068FF] text-[#0068FF]"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Tab content */}
            {exportTab === "files" ? (
              <div className="overflow-y-auto flex-1 divide-y divide-zinc-100">
                {Object.entries(exportFiles).map(([filename, content]) => (
                  <div key={filename} className="p-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <code className="text-[12px] font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-md font-mono">
                        {filename}
                      </code>
                      <button
                        onClick={() => handleCopy(filename, content)}
                        className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                          copied === filename
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        {copied === filename ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-zinc-500 leading-relaxed bg-zinc-50 border border-zinc-100 p-4 rounded-xl overflow-x-auto max-h-44 scrollbar-hide">
                      {content}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <GitHubExportTab files={exportFiles} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { listenPreviewState, PreviewSnapshot } from "@/lib/previewChannel"
import { readFromLocalStorage, findGlobalBottomNav, getBottomNavRoutes } from "@/lib/previewUtils"
import { PhoneMockup } from "@/components/builder/PhoneMockup"
import { PreviewContext, PreviewNode } from "@/components/preview/PreviewRenderer"

const LAYOUT_NODE_TYPES = new Set(["ZaloBottomNav"])

export default function PreviewPage() {
  const [snapshot, setSnapshot] = useState<PreviewSnapshot | null>(null)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)

  // Load from localStorage after hydration (client only)
  useEffect(() => {
    const initial = readFromLocalStorage()
    if (initial) {
      setSnapshot(initial)
      setCurrentPageId(initial.pages[0]?.id ?? null)
    }
  }, [])

  // Live sync from builder via BroadcastChannel
  useEffect(() => {
    return listenPreviewState((s) => {
      setSnapshot(s)
      setCurrentPageId((prev) => {
        // Keep current page if it still exists, else fall back to first
        const stillExists = s.pages.some((p) => p.id === prev)
        return stillExists ? prev : (s.pages[0]?.id ?? null)
      })
    })
  }, [])

  const navigate = useCallback(
    (path: string) => {
      const page = snapshot?.pages.find((p) => p.path === path)
      if (page) setCurrentPageId(page.id)
    },
    [snapshot]
  )

  const currentPage = snapshot?.pages.find((p) => p.id === currentPageId)
  const currentPath = currentPage?.path ?? "/"
  const bottomNavEntry = findGlobalBottomNav(snapshot?.pages ?? [])
  const showBottomNav = !!bottomNavEntry && getBottomNavRoutes(bottomNavEntry.node.props).has(currentPath)

  const contentNodeIds = (currentPage?.rootIds ?? []).filter(
    (id) => !LAYOUT_NODE_TYPES.has(currentPage!.nodes[id]?.type)
  )

  return (
    <PreviewContext.Provider value={{ currentPath, navigate }}>
      <div
        className="flex items-center justify-center min-h-screen bg-[#1A1A1E]"
        style={{
          backgroundImage: "radial-gradient(circle, #2A2A32 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {snapshot ? (
          <PhoneMockup
            themeColor={snapshot.appConfig.themeColor}
            bottomNav={
              showBottomNav ? (
                <PreviewNode
                  id={bottomNavEntry.node.id}
                  nodes={bottomNavEntry.nodes}
                />
              ) : undefined
            }
          >
            <div className="flex flex-col bg-white min-h-full">
              {contentNodeIds.map((id) => (
                <PreviewNode key={id} id={id} nodes={currentPage!.nodes} />
              ))}
            </div>
          </PhoneMockup>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#0068FF]/10 flex items-center justify-center">
              <span className="text-[#0068FF] text-xl">Z</span>
            </div>
            <p className="text-zinc-400 text-sm">Mở builder để bắt đầu</p>
            <p className="text-zinc-600 text-xs">
              Giữ cửa sổ này mở — preview sẽ tự động cập nhật
            </p>
          </div>
        )}
      </div>
    </PreviewContext.Provider>
  )
}

"use client"

import { useState, useCallback, useRef } from "react"
import { useBuilderStore } from "@/store/builderStore"

const IPHONE_14_PRO_MAX = { w: 430, h: 932 } as const

interface QRPreviewModalProps {
  onClose: () => void
}

function buildPreviewUrl(appId: string, localUrl: string): string {
  const base = `https://zalo.me/app/link/zapps/${appId}/`
  const params = new URLSearchParams({ env: "TESTING_LOCAL", clientIp: localUrl })
  return `${base}?${params.toString()}`
}

export function QRPreviewModal({ onClose }: QRPreviewModalProps) {
  const appConfig = useBuilderStore((s) => s.appConfig)
  const updateAppConfig = useBuilderStore((s) => s.updateAppConfig)

  const [inputId, setInputId] = useState(appConfig.appId ?? "")
  const [inputUrl, setInputUrl] = useState(appConfig.localUrl ?? "")
  const [showConfig, setShowConfig] = useState(false)
  const previewWinRef = useRef<Window | null>(null)

  const appId = inputId.trim()
  const localUrl = inputUrl.trim().replace(/\/$/, "")

  const previewUrl = appId && localUrl ? buildPreviewUrl(appId, localUrl) : ""
  const qrImageUrl = previewUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(previewUrl)}&format=svg&margin=12`
    : ""

  const handleSave = useCallback(() => {
    updateAppConfig({ appId, localUrl })
    setShowConfig(false)
  }, [appId, localUrl, updateAppConfig])

  const handleOpenBrowser = useCallback(() => {
    if (!localUrl) return
    if (previewWinRef.current && !previewWinRef.current.closed) {
      previewWinRef.current.focus()
      return
    }
    const left = Math.round(window.screenX + (window.outerWidth - IPHONE_14_PRO_MAX.w) / 2)
    const top = Math.round(window.screenY + (window.outerHeight - IPHONE_14_PRO_MAX.h) / 2)
    previewWinRef.current = window.open(
      localUrl,
      "zmp-preview",
      `width=${IPHONE_14_PRO_MAX.w},height=${IPHONE_14_PRO_MAX.h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
  }, [localUrl])

  const isReady = Boolean(appId && localUrl)

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0068FF] flex items-center justify-center shrink-0">
              <span className="text-white text-sm">Z</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">Xem trên Zalo</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Main content */}
        <div className="px-5 pb-5 flex flex-col items-center gap-4">

          {isReady && !showConfig ? (
            <>
              {/* QR Code */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-inner p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="QR code"
                  width={220}
                  height={220}
                  className="block"
                />
              </div>

              {/* Instruction */}
              <div className="text-center space-y-1">
                <p className="text-base font-semibold text-gray-800">Quét mã bằng Zalo</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Mở Zalo → nhấn biểu tượng{" "}
                  <span className="font-medium text-gray-700">QR</span>{" "}
                  → quét mã bên trên
                </p>
              </div>

              {/* Zalo logo hint */}
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2.5 w-full">
                <div className="w-8 h-8 rounded-full bg-[#0068FF] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">Z</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#0068FF]">Zalo Mini App</p>
                  <p className="text-[11px] text-blue-400 truncate">{appConfig.title || "My Zalo App"}</p>
                </div>
              </div>

              {/* Open in browser */}
              <button
                onClick={handleOpenBrowser}
                className="w-full flex items-center justify-center gap-2 bg-[#0068FF] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <span>↗</span>
                <span>Mở trong trình duyệt</span>
                <span className="text-[11px] font-normal opacity-75">(iPhone 14 Pro Max)</span>
              </button>

              {/* Config link */}
              <button
                onClick={() => setShowConfig(true)}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                ⚙ Thay đổi cấu hình
              </button>
            </>
          ) : (
            <>
              {/* Config form */}
              {isReady && (
                <p className="text-xs text-gray-500 self-start -mb-1">Cập nhật thông tin kết nối</p>
              )}
              {!isReady && (
                <div className="text-center py-2">
                  <div className="text-5xl mb-3 opacity-10">▣</div>
                  <p className="text-sm font-medium text-gray-700">Chưa có cấu hình</p>
                  <p className="text-xs text-gray-400 mt-1">Điền thông tin bên dưới để tạo QR</p>
                </div>
              )}

              <div className="w-full space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Mini App ID
                  </label>
                  <input
                    type="text"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    placeholder="Ví dụ: 1234567890"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Preview URL
                  </label>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://blue-insect-53.mini.123c.vn"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0068FF] bg-gray-50 font-mono"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">URL từ output của lệnh <code className="bg-gray-100 px-1 rounded">zmp start</code></p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!appId || !localUrl}
                  className="w-full bg-[#0068FF] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Tạo QR
                </button>
                {isReady && (
                  <button
                    onClick={() => setShowConfig(false)}
                    className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 transition-colors"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

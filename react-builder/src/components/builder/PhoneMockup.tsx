"use client"

import { useBuilderStore } from "@/store/builderStore"

interface PhoneMockupProps {
  children: React.ReactNode
  bottomNav?: React.ReactNode
}

export function PhoneMockup({ children, bottomNav }: PhoneMockupProps) {
  const themeColor = useBuilderStore((s) => s.appConfig.themeColor)

  return (
    <div className="flex items-start justify-center py-10 px-4">
      {/* Phone shell */}
      <div
        className="relative shrink-0"
        style={{
          width: 375,
          borderRadius: 50,
          background: "linear-gradient(145deg, #2a2a2e, #1a1a1e)",
          padding: "13px",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.06), 0 40px 100px rgba(0,0,0,0.6), 0 12px 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Screen */}
        <div
          className="relative overflow-hidden bg-[#F4F4F4] flex flex-col"
          style={{ borderRadius: 38, height: 700 }}
        >
          {/* Status bar */}
          <div
            className="flex items-center justify-between px-6 shrink-0 z-10 relative"
            style={{ backgroundColor: themeColor, height: 44 }}
          >
            <span className="text-white text-[12px] font-semibold">9:41</span>
            {/* Dynamic island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[88px] h-6 bg-[#1a1a1e] rounded-full" />
            {/* Status icons */}
            <div className="flex items-center gap-1.5">
              {/* Signal */}
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                <rect x="0" y="4" width="2.5" height="7" rx="0.5" fill="white" />
                <rect x="4" y="2.5" width="2.5" height="8.5" rx="0.5" fill="white" />
                <rect x="8" y="0.5" width="2.5" height="10.5" rx="0.5" fill="white" />
                <rect x="12" y="0" width="2.5" height="11" rx="0.5" fill="white" fillOpacity="0.35" />
              </svg>
              {/* WiFi */}
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                <path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5L14.5 3.7C12.7 1.9 10.2 0.8 7.5 0.8C4.8 0.8 2.3 1.9 0.5 3.7L1.8 5C3.2 3.5 5.2 2.5 7.5 2.5Z" fill="white"/>
                <path d="M7.5 5.2C9 5.2 10.4 5.8 11.4 6.8L12.7 5.5C11.3 4.2 9.5 3.5 7.5 3.5C5.5 3.5 3.7 4.2 2.3 5.5L3.6 6.8C4.6 5.8 6 5.2 7.5 5.2Z" fill="white"/>
                <circle cx="7.5" cy="9.5" r="1.5" fill="white"/>
              </svg>
              {/* Battery */}
              <div className="flex items-center gap-0.5">
                <div className="w-[22px] h-[11px] rounded-[3px] border border-white/80 flex items-center p-[1.5px]">
                  <div className="h-full w-3/4 rounded-[1.5px] bg-white" />
                </div>
                <div className="w-[2px] h-[5px] rounded-r-full bg-white/60" />
              </div>
            </div>
          </div>

          {/* Scrollable app content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>

          {/* Bottom nav — pinned outside scroll, mirrors ZMPRouter placement */}
          {bottomNav && (
            <div className="shrink-0">
              {bottomNav}
            </div>
          )}
        </div>

        {/* Physical buttons */}
        <div className="absolute -left-[4px] top-28 w-[4px] h-7 bg-[#3a3a3e] rounded-l-md" />
        <div className="absolute -left-[4px] top-40 w-[4px] h-12 bg-[#3a3a3e] rounded-l-md" />
        <div className="absolute -left-[4px] top-56 w-[4px] h-12 bg-[#3a3a3e] rounded-l-md" />
        <div className="absolute -right-[4px] top-36 w-[4px] h-16 bg-[#3a3a3e] rounded-r-md" />

        {/* Home indicator */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#3a3a3e] rounded-full" />
      </div>
    </div>
  )
}

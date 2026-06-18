"use client"

import dynamic from "next/dynamic"

const BuilderContent = dynamic(
  () => import("@/components/builder/BuilderContent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-400 text-sm">Loading builder...</span>
      </div>
    ),
  }
)

export default function BuilderPage() {
  return <BuilderContent />
}

"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="page-container flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="glass-card p-8 max-w-sm w-full text-center space-y-4">
        <div className="mx-auto h-10 w-10 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(248,113,113,0.1)" }}>
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h2 className="font-semibold">Page Error</h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            {error.message || "Something went wrong on this page."}
          </p>
        </div>
        <button onClick={reset} className="btn-primary gap-2 w-full">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      </div>
    </div>
  )
}
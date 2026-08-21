"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body style={{ backgroundColor: "hsl(224 71% 4%)", color: "hsl(213 31% 91%)", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
            <div style={{ display: "inline-flex", height: "3rem", width: "3rem", alignItems: "center", justifyContent: "center", borderRadius: "0.75rem", backgroundColor: "rgba(248,113,113,0.1)", marginBottom: "1rem" }}>
              <AlertTriangle style={{ height: "1.5rem", width: "1.5rem", color: "#f87171" }} />
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>Something went wrong</h1>
            <p style={{ color: "hsl(215 20% 55%)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", borderRadius: "0.5rem", backgroundColor: "hsl(210 100% 66%)", padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "hsl(222 47% 11%)", border: "none", cursor: "pointer" }}
            >
              <RefreshCw style={{ height: "1rem", width: "1rem" }} /> Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
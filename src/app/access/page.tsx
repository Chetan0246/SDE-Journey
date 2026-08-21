"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react"

export default function AccessPage() {
  const router = useRouter()
  const [key, setKey] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    })

    if (res.ok) {
      router.push("/dashboard")
      router.refresh()
    } else {
      setError("Invalid access key.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-900/5 pointer-events-none" />
      <div className="relative w-full max-w-sm">
        <div className="glass-card p-8 animate-fade-in">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">SDE Journey</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Personal placement tracker
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="access-form">
            <div className="space-y-1.5">
              <label htmlFor="access-key" className="text-sm font-medium">Access Key</label>
              <div className="relative">
                <input
                  id="access-key"
                  type={show ? "text" : "password"}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="form-input pr-10"
                  placeholder="Enter your key"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "hsl(0 84% 70%)" }}>{error}</p>
            )}

            <button
              type="submit"
              id="access-submit"
              disabled={loading || !key.trim()}
              className="btn-primary w-full"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
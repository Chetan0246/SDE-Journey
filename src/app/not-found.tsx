import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-background)" }}>
      <div className="text-center space-y-5 max-w-sm">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl"
          style={{ backgroundColor: "var(--color-accent)" }}>
          <Search className="h-6 w-6" style={{ color: "var(--color-muted-foreground)" }} />
        </div>
        <div>
          <p className="text-5xl font-black mb-2" style={{ color: "var(--color-primary)" }}>404</p>
          <h1 className="text-lg font-semibold">Page not found</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            This page doesn&apos;t exist or was removed.
          </p>
        </div>
        <Link href="/dashboard" className="btn-primary gap-2">
          <Home className="h-4 w-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X,
  LayoutDashboard, CalendarDays, ClipboardList, BookOpen,
  Code2, FolderKanban, BarChart3, Calendar, Target, Settings, Zap, AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/plan",           label: "Plan My Day",    icon: CalendarDays },
  { href: "/log",            label: "Daily Log",      icon: ClipboardList },
  { href: "/reflect",        label: "Reflect",        icon: BookOpen },
  { href: "/brutal-reality", label: "Brutal Reality", icon: AlertTriangle, accent: true },
  { href: "/dsa",            label: "DSA Tracker",    icon: Code2 },
  { href: "/projects",       label: "Projects",       icon: FolderKanban },
  { href: "/analytics",      label: "Analytics",      icon: BarChart3 },
  { href: "/calendar",       label: "History",        icon: Calendar },
  { href: "/weekly-review",  label: "Weekly Review",  icon: Target },
  { href: "/settings",       label: "Settings",       icon: Settings },
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b"
        style={{ borderColor: "rgba(var(--color-border), 0.2)" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "rgba(var(--color-primary), 0.1)" }}>
          <Zap className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">SDE Journey</p>
          <p className="text-[10px]" style={{ color: "var(--color-muted-foreground)" }}>2027 Placement Tracker</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, accent }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn("nav-item", isActive ? "nav-item-active" : "nav-item-inactive")}
              style={accent && !isActive ? { color: "hsl(0 84% 70%)" } : {}}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {accent && <span className="ml-auto text-[9px] font-bold uppercase tracking-widest opacity-60">NEW</span>}
            </Link>
          )
        })}
      </nav>
    </>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
          <span className="text-sm font-semibold">SDE Journey</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg"
          style={{ backgroundColor: "var(--color-accent)" }} id="mobile-menu-btn"
          aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <div className="relative flex w-64 flex-col border-r animate-slide-up"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-muted-foreground)" }}
              id="close-menu-btn" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
            <NavContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-full w-60 flex-col border-r"
        style={{ borderColor: "rgba(var(--color-border), 0.3)", backgroundColor: "rgba(var(--color-card), 0.4)", backdropFilter: "blur(8px)" }}>
        <NavContent />
      </aside>
    </>
  )
}
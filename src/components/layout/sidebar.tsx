"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r" style={{ borderColor: "rgba(var(--color-border), 0.3)", backgroundColor: "rgba(var(--color-card), 0.4)", backdropFilter: "blur(8px)" }}>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: "rgba(var(--color-border), 0.2)" }}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(var(--color-primary), 0.1)" }}>
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
    </aside>
  )
}
import { Sidebar } from "@/components/layout/sidebar"
import { Pomodoro } from "@/components/pomodoro"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-background)" }}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* pt-14 on mobile to clear the fixed topbar; hidden on lg */}
        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 relative">
          {children}
        </main>
      </div>
      <Pomodoro />
    </div>
  )
}
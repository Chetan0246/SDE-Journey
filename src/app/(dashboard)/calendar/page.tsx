"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getPlans, type DailyPlan } from "@/lib/store"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  excellent: "#34d399", good: "#60a5fa", average: "#fbbf24", poor: "#f87171", not_logged: ""
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [plans, setPlans] = useState<Record<string, DailyPlan>>({})

  useEffect(() => { setPlans(getPlans()) }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)
  const today = format(new Date(), "yyyy-MM-dd")

  const loggedDays = Object.values(plans).filter((p) => p.status !== "not_logged")
  const monthDays = days.map((d) => format(d, "yyyy-MM-dd"))
  const monthLogged = loggedDays.filter((p) => monthDays.includes(p.date))
  const monthActual = monthLogged.reduce((s, p) => s + (p.actual_hours ?? 0), 0)

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
          {loggedDays.length} days logged total
        </p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {[["Excellent","#34d399"],["Good","#60a5fa"],["Average","#fbbf24"],["Poor","#f87171"]].map(([l,c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
            <span style={{ color: "var(--color-muted-foreground)" }}>{l}</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        {/* Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth()-1, 1))}
            className="btn-secondary p-2" id="prev-month"><ChevronLeft className="h-4 w-4" /></button>
          <div className="text-center">
            <p className="font-semibold">{format(currentMonth, "MMMM yyyy")}</p>
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              {monthLogged.length} days · {monthActual.toFixed(0)}h
            </p>
          </div>
          <button onClick={() => setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth()+1, 1))}
            className="btn-secondary p-2" id="next-month"><ChevronRight className="h-4 w-4" /></button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center text-[11px] py-1" style={{ color: "var(--color-muted-foreground)" }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const ds = format(day, "yyyy-MM-dd")
            const plan = plans[ds]
            const color = plan ? STATUS_COLORS[plan.status] : ""
            const isToday = ds === today
            return (
              <div key={ds}
                title={plan ? `${plan.actual_hours?.toFixed(1) ?? 0}h / ${plan.planned_hours?.toFixed(1) ?? 0}h planned (${plan.status})` : ds}
                className="aspect-square flex items-center justify-center rounded-lg text-xs transition-all"
                style={{
                  backgroundColor: color ? color + "25" : "var(--color-accent)",
                  color: color || "var(--color-muted-foreground)",
                  fontWeight: color ? 600 : 400,
                  outline: isToday ? `2px solid var(--color-primary)` : undefined,
                  outlineOffset: isToday ? "2px" : undefined,
                }}
                id={`cal-${ds}`}>
                {format(day, "d")}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
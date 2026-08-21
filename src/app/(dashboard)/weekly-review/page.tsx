"use client"

import { useEffect, useState } from "react"
import { getAllReviews, getPlans, getTaskLogs, type DailyReview, type DailyPlan } from "@/lib/store"
import { format, parseISO, startOfWeek, endOfWeek, subWeeks } from "date-fns"
import { TrendingUp, TrendingDown } from "lucide-react"

interface WeekSummary {
  start: string; end: string
  days: number; plannedH: number; actualH: number
  avgScore: number; bestDay: string; worstDay: string
  scoreByDim: Record<string, number>
}

function summarizeWeek(weekStart: Date, plans: Record<string, DailyPlan>, reviews: Record<string, DailyReview>): WeekSummary {
  const weekEnd = endOfWeek(weekStart)
  let plannedH = 0, actualH = 0, days = 0
  let bestScore = -1, worstScore = 11, bestDay = "", worstDay = ""
  const dimTotals: Record<string, number> = {}
  const dimCounts: Record<string, number> = {}
  const dims = ["score_focus","score_discipline","score_learning","score_productivity","score_technical","score_energy"]

  const cur = new Date(weekStart)
  while (cur <= weekEnd) {
    const ds = format(cur, "yyyy-MM-dd")
    const plan = plans[ds]
    const review = reviews[ds]
    if (plan) { plannedH += plan.planned_hours ?? 0; actualH += plan.actual_hours ?? 0; days++ }
    if (review) {
      const avg = dims.reduce((s, d) => s + (review[d as keyof DailyReview] as number ?? 5), 0) / dims.length
      if (avg > bestScore) { bestScore = avg; bestDay = format(cur, "EEE") }
      if (avg < worstScore) { worstScore = avg; worstDay = format(cur, "EEE") }
      dims.forEach((d) => {
        dimTotals[d] = (dimTotals[d] || 0) + (review[d as keyof DailyReview] as number ?? 5)
        dimCounts[d] = (dimCounts[d] || 0) + 1
      })
    }
    cur.setDate(cur.getDate() + 1)
  }

  const avgScore = Object.keys(dimTotals).length
    ? dims.reduce((s, d) => s + (dimTotals[d] / (dimCounts[d] || 1)), 0) / dims.length
    : 0

  const scoreByDim: Record<string, number> = {}
  dims.forEach((d) => { scoreByDim[d] = dimTotals[d] ? dimTotals[d] / dimCounts[d] : 0 })

  return {
    start: format(weekStart, "yyyy-MM-dd"),
    end: format(weekEnd, "yyyy-MM-dd"),
    days, plannedH, actualH,
    avgScore: parseFloat(avgScore.toFixed(1)),
    bestDay: bestDay || "—", worstDay: worstDay || "—",
    scoreByDim,
  }
}

const DIM_LABELS: Record<string, string> = {
  score_focus: "Focus", score_discipline: "Discipline", score_learning: "Learning",
  score_productivity: "Productivity", score_technical: "Technical", score_energy: "Energy"
}

export default function WeeklyReviewPage() {
  const [weeks, setWeeks] = useState<WeekSummary[]>([])

  useEffect(() => {
    const plans = getPlans()
    const reviews = getAllReviews()
    const now = new Date()
    const summaries: WeekSummary[] = []
    for (let i = 0; i < 8; i++) {
      const ws = startOfWeek(subWeeks(now, i))
      const s = summarizeWeek(ws, plans, reviews)
      if (s.days > 0) summaries.push(s)
    }
    setWeeks(summaries)
  }, [])

  if (weeks.length === 0) {
    return (
      <div className="page-container animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Weekly Review</h1>
        <div className="glass-card py-16 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          No data yet. Log your days for at least one week.
        </div>
      </div>
    )
  }

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Weekly Review</h1>
      {weeks.map((w) => {
        const pct = w.plannedH > 0 ? Math.round((w.actualH / w.plannedH) * 100) : 0
        const statusColor = pct >= 90 ? "#34d399" : pct >= 70 ? "#60a5fa" : pct >= 50 ? "#fbbf24" : "#f87171"
        return (
          <div key={w.start} className="glass-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{format(parseISO(w.start), "MMM d")} – {format(parseISO(w.end), "MMM d, yyyy")}</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>{w.days} days logged</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: statusColor }}>{pct}%</p>
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>completion</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { l: "Planned", v: `${w.plannedH.toFixed(0)}h` },
                { l: "Actual", v: `${w.actualH.toFixed(0)}h` },
                { l: "Best day", v: w.bestDay },
                { l: "Avg score", v: w.avgScore > 0 ? w.avgScore.toFixed(1) : "—" },
              ].map(({ l, v }) => (
                <div key={l} className="rounded-lg p-2.5" style={{ backgroundColor: "var(--color-accent)" }}>
                  <p className="text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>{l}</p>
                  <p className="text-sm font-semibold mt-0.5">{v}</p>
                </div>
              ))}
            </div>

            {Object.keys(w.scoreByDim).some((d) => w.scoreByDim[d] > 0) && (
              <div className="space-y-1.5">
                {Object.entries(w.scoreByDim).filter(([, v]) => v > 0).map(([dim, val]) => {
                  const barColor = val >= 8 ? "#34d399" : val >= 6 ? "#60a5fa" : val >= 4 ? "#fbbf24" : "#f87171"
                  return (
                    <div key={dim} className="flex items-center gap-2">
                      <span className="text-xs w-24" style={{ color: "var(--color-muted-foreground)" }}>{DIM_LABELS[dim]}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
                        <div className="h-full rounded-full" style={{ width: `${val*10}%`, backgroundColor: barColor }} />
                      </div>
                      <span className="text-xs w-8 text-right font-medium" style={{ color: barColor }}>{val.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
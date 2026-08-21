"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getLast30DaysStats, getTaskLogs, getDSAProblems, type DailyStats } from "@/lib/store"
import { format, parseISO } from "date-fns"

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DailyStats[]>([])
  const [categoryData, setCategoryData] = useState<{ name: string; hours: number }[]>([])
  const [dsaByTopic, setDsaByTopic] = useState<{ topic: string; solved: number }[]>([])

  useEffect(() => {
    const s = getLast30DaysStats()
    setStats(s)

    // Category hours from all task logs
    const catMap: Record<string, number> = {}
    s.forEach((day) => {
      const logs = getTaskLogs(day.date)
      logs.forEach((l) => { catMap[l.category] = (catMap[l.category] || 0) + (l.actual_duration || 0) })
    })
    setCategoryData(
      Object.entries(catMap).map(([name, mins]) => ({ name, hours: parseFloat((mins/60).toFixed(1)) }))
        .sort((a, b) => b.hours - a.hours).slice(0, 8)
    )

    // DSA by topic
    const problems = getDSAProblems().filter((p) => p.date_solved)
    const topicMap: Record<string, number> = {}
    problems.forEach((p) => { topicMap[p.topic] = (topicMap[p.topic] || 0) + 1 })
    setDsaByTopic(
      Object.entries(topicMap).map(([topic, solved]) => ({ topic, solved }))
        .sort((a, b) => b.solved - a.solved)
    )
  }, [])

  const chartData = stats.map((s) => ({
    date: format(parseISO(s.date), "MMM d"),
    planned: parseFloat(s.plannedHours.toFixed(1)),
    actual: parseFloat(s.actualHours.toFixed(1)),
  })).filter((d) => d.planned > 0 || d.actual > 0)

  const totalPlanned = stats.reduce((s, d) => s + d.plannedHours, 0)
  const totalActual = stats.reduce((s, d) => s + d.actualHours, 0)
  const completionPct = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0
  const loggedDays = stats.filter((d) => d.plannedHours > 0).length

  const TT = ({ active, payload, label }: { active?: boolean; payload?: {color:string;name:string;value:number}[]; label?: string }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border p-2 text-xs" style={{ backgroundColor: "hsl(224 71% 6%)", borderColor: "hsl(216 34% 17%)" }}>
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}h</p>
        ))}
      </div>
    )
  }

  return (
    <div className="page-container space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Logged days (30d)", value: loggedDays.toString() },
          { label: "Planned (30d)", value: `${totalPlanned.toFixed(0)}h` },
          { label: "Actual (30d)", value: `${totalActual.toFixed(0)}h` },
          { label: "Completion rate", value: `${completionPct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="metric-card">
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
            <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--color-primary)" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Reality vs Plan */}
      <div className="glass-card p-4">
        <h2 className="section-heading mb-4">Reality vs Plan (30 days)</h2>
        {chartData.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            No data yet. Start logging your days.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="planned-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="actual-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/><stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
              <Tooltip content={<TT />} />
              <Area type="monotone" dataKey="planned" stroke="#60a5fa" strokeWidth={2} fill="url(#planned-g)" name="Planned (h)" />
              <Area type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} fill="url(#actual-g)" name="Actual (h)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category breakdown */}
      {categoryData.length > 0 && (
        <div className="glass-card p-4">
          <h2 className="section-heading mb-4">Time by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} margin={{ top: 4, right: 4, bottom: 40, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
              <Tooltip content={<TT />} />
              <Bar dataKey="hours" fill="var(--color-primary)" radius={[4,4,0,0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* DSA by topic */}
      {dsaByTopic.length > 0 && (
        <div className="glass-card p-4">
          <h2 className="section-heading mb-4">DSA Solved by Topic</h2>
          <div className="space-y-2">
            {dsaByTopic.map(({ topic, solved }) => (
              <div key={topic} className="flex items-center gap-3 text-sm">
                <span className="w-36 text-xs truncate" style={{ color: "var(--color-muted-foreground)" }}>{topic}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(solved/12)*100}%`, backgroundColor: "#34d399" }} />
                </div>
                <span className="w-6 text-xs text-right" style={{ color: "#34d399" }}>{solved}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
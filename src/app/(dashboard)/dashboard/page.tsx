"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, ArrowRight, Target, Zap, Code2, TrendingUp, AlertTriangle } from "lucide-react"
import {
  getProfile, getPlans, getTasks, getDSAProblems,
  getAllReviews, type DailyPlan, type Profile
} from "@/lib/store"
import { todayStr, daysUntil, formatDisplayDate, minutesToHours } from "@/lib/utils"

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [todayPlan, setTodayPlan] = useState<DailyPlan | null>(null)
  const [dsaSolved, setDsaSolved] = useState(0)
  const [streak, setStreak] = useState(0)
  const [weekAvg, setWeekAvg] = useState(0)
  const [today] = useState(todayStr())

  useEffect(() => {
    const p = getProfile()
    setProfile(p)

    const plans = getPlans()
    setTodayPlan(plans[today] ?? null)

    const dsa = getDSAProblems()
    setDsaSolved(dsa.filter((d) => d.date_solved !== null).length)

    // Streak: consecutive days logged ending today
    let s = 0
    const d = new Date()
    while (true) {
      const ds = d.toISOString().split("T")[0]
      if (plans[ds] && plans[ds].status !== "not_logged") { s++; d.setDate(d.getDate() - 1) }
      else break
    }
    setStreak(s)

    // Last 7 days avg actual hours
    const last7: number[] = []
    for (let i = 0; i < 7; i++) {
      const d2 = new Date(); d2.setDate(d2.getDate() - i)
      const ds = d2.toISOString().split("T")[0]
      if (plans[ds]) last7.push(plans[ds].actual_hours ?? 0)
    }
    setWeekAvg(last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : 0)
  }, [today])

  if (!profile) return null

  const daysLeft = daysUntil(profile.placement_date)
  const dsaTarget = profile.dsa_target
  const dsaPct = Math.min(100, Math.round((dsaSolved / dsaTarget) * 100))
  const topSkills = [...profile.skills].sort((a, b) => b.current_level - a.current_level).slice(0, 4)

  const statusColors: Record<string, string> = {
    excellent: "#34d399", good: "#60a5fa", average: "#fbbf24", poor: "#f87171", not_logged: "#6b7280"
  }
  const statusColor = todayPlan ? statusColors[todayPlan.status] : "#6b7280"

  return (
    <div className="page-container space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {formatDisplayDate(today)}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            <span className="font-semibold" style={{ color: "var(--color-primary)" }}>{daysLeft} days</span> until placement · Aug 21, 2027
          </p>
        </div>
        <Link href="/plan" className="btn-primary gap-2" id="plan-today-btn">
          <CalendarDays className="h-4 w-4" /> Plan Today <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Days to Placement", value: daysLeft.toString(), icon: Target, color: "var(--color-primary)" },
          { label: "DSA Solved", value: `${dsaSolved}/${dsaTarget}`, icon: Code2, color: "#34d399" },
          { label: "Current Streak", value: `${streak}d`, icon: Zap, color: "#fbbf24" },
          { label: "Avg (7d)", value: `${weekAvg.toFixed(1)}h`, icon: TrendingUp, color: "#a78bfa" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="metric-card">
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{label}</p>
              <Icon className="h-3.5 w-3.5" style={{ color }} />
            </div>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's plan */}
        <div className="glass-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-heading">Today's Status</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: statusColor + "20", color: statusColor }}>
              {todayPlan?.status?.replace("_", " ") ?? "Not planned"}
            </span>
          </div>
          {todayPlan ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span style={{ color: "var(--color-muted-foreground)" }}>Planned</span>
                <span className="font-semibold">{minutesToHours(todayPlan.planned_hours * 60)}</span>
                <span style={{ color: "var(--color-muted-foreground)" }}>Actual</span>
                <span className="font-semibold" style={{ color: todayPlan.actual_hours >= todayPlan.planned_hours ? "#34d399" : "#fbbf24" }}>
                  {minutesToHours((todayPlan.actual_hours ?? 0) * 60)}
                </span>
              </div>
              {todayPlan.planned_hours > 0 && (
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayPlan.actual_hours / todayPlan.planned_hours) * 100)}%`, backgroundColor: statusColor }} />
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Link href="/log" className="btn-secondary text-xs py-1.5" id="log-btn">Log Progress</Link>
                <Link href="/reflect" className="btn-secondary text-xs py-1.5" id="reflect-btn">Reflect</Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p style={{ color: "var(--color-muted-foreground)" }} className="text-sm">No plan for today yet.</p>
              <Link href="/plan" className="btn-primary mt-3 text-xs" id="plan-now-btn">Plan Now →</Link>
            </div>
          )}
        </div>

        {/* Brutal Reality teaser */}
        <Link href="/brutal-reality" className="glass-card p-4 group transition-all hover:border-red-500/40 block" id="brutal-reality-card">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h2 className="section-heading text-red-400">Brutal Reality</h2>
          </div>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            See where you'll end up if you continue exactly like this.
          </p>
          <p className="mt-3 text-xs font-medium" style={{ color: "hsl(0 84% 70%)" }}>
            View projection →
          </p>
        </Link>
      </div>

      {/* Skills */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-heading">Career Skills</h2>
          <Link href="/settings" className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Edit →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topSkills.map((skill) => (
            <div key={skill.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{skill.name}</span>
                <span style={{ color: "var(--color-primary)" }}>{skill.current_level}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${skill.current_level}%`, backgroundColor: "var(--color-primary)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DSA progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-heading">NeetCode 150 Progress</h2>
          <Link href="/dsa" className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>View all →</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${dsaPct}%`, background: "linear-gradient(to right, var(--color-primary), #34d399)" }} />
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{dsaPct}%</span>
          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{dsaSolved}/{dsaTarget}</span>
        </div>
      </div>
    </div>
  )
}
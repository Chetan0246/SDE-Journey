"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CalendarDays, ArrowRight, Target, Zap, Code2, TrendingUp,
  AlertTriangle, BookOpen, Flame, Clock, ChevronRight,
} from "lucide-react"
import {
  getProfile, getPlans, getDSAProblems, getAllReviews,
  type DailyPlan, type Profile
} from "@/lib/store"
import { todayStr, daysUntil, formatDisplayDate, minutesToHours } from "@/lib/utils"
import { format, subDays, parseISO } from "date-fns"

// ─── Data helpers ──────────────────────────────────────────────────────────

function buildDashboardData() {
  const profile = getProfile()
  const plans   = getPlans()
  const reviews = getAllReviews()
  const dsa     = getDSAProblems()
  const today   = todayStr()

  const dsaSolved = dsa.filter(d => d.date_solved !== null).length

  // Streak
  let streak = 0
  const d = new Date()
  while (true) {
    const ds = d.toISOString().split("T")[0]
    if (plans[ds] && plans[ds].status !== "not_logged") { streak++; d.setDate(d.getDate() - 1) }
    else break
  }

  // 7-day avg
  const last7: number[] = []
  for (let i = 0; i < 7; i++) {
    const d2 = new Date(); d2.setDate(d2.getDate() - i)
    const ds = d2.toISOString().split("T")[0]
    if (plans[ds]) last7.push(plans[ds].actual_hours ?? 0)
  }
  const weekAvg = last7.length ? last7.reduce((a, b) => a + b, 0) / last7.length : 0

  // Last 7 days for mini chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const dt = subDays(new Date(), 6 - i)
    const ds = format(dt, "yyyy-MM-dd")
    const plan = plans[ds]
    return {
      date: ds, day: format(dt, "EEE"),
      planned: plan?.planned_hours ?? 0,
      actual: plan?.actual_hours ?? 0,
      status: plan?.status ?? "not_logged",
    }
  })

  // 12-week heatmap (84 days)
  const heatmap = Array.from({ length: 84 }).map((_, i) => {
    const dt = subDays(new Date(), 83 - i)
    const ds = format(dt, "yyyy-MM-dd")
    const plan = plans[ds]
    const rev  = reviews[ds]
    const hours = plan?.actual_hours ?? 0
    const intensity = hours === 0 ? 0 : hours < 2 ? 1 : hours < 4 ? 2 : hours < 6 ? 3 : 4
    return { date: ds, hours, intensity, status: plan?.status ?? "not_logged", hasReview: !!rev }
  })

  // DSA by topic (top 5 solved)
  const topicMap: Record<string, { solved: number; total: number }> = {}
  dsa.forEach(p => {
    if (!topicMap[p.topic]) topicMap[p.topic] = { solved: 0, total: 0 }
    topicMap[p.topic].total++
    if (p.date_solved) topicMap[p.topic].solved++
  })
  const dsaTopics = Object.entries(topicMap)
    .map(([topic, { solved, total }]) => ({ topic, solved, total, pct: Math.round((solved / total) * 100) }))
    .filter(t => t.solved > 0)
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 5)

  return {
    profile, today, todayPlan: plans[today] ?? null,
    dsaSolved, streak, weekAvg, last7Days, heatmap, dsaTopics,
  }
}

// ─── Heatmap cell color ────────────────────────────────────────────────────

function heatColor(intensity: number, status: string) {
  if (intensity === 0) return "rgba(255,255,255,0.04)"
  const colors = ["", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa"]
  if (status === "excellent") return ["", "#065f46", "#047857", "#059669", "#34d399"][intensity]
  if (status === "poor")      return ["", "#7f1d1d", "#991b1b", "#b91c1c", "#f87171"][intensity]
  return colors[intensity]
}

const STATUS_META: Record<string, { label: string; color: string; glow: string }> = {
  excellent:  { label: "Excellent",  color: "#34d399", glow: "rgba(52,211,153,0.3)" },
  good:       { label: "Good",       color: "#60a5fa", glow: "rgba(96,165,250,0.3)" },
  average:    { label: "Average",    color: "#fbbf24", glow: "rgba(251,191,36,0.3)"  },
  poor:       { label: "Poor",       color: "#f87171", glow: "rgba(248,113,113,0.3)" },
  not_logged: { label: "Not Logged", color: "#6b7280", glow: "transparent" },
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data] = useState(() => buildDashboardData())
  const { profile, today, todayPlan, dsaSolved, streak, weekAvg, last7Days, heatmap, dsaTopics } = data

  const daysLeft    = daysUntil(profile.placement_date)
  const dsaTarget   = profile.dsa_target
  const dsaPct      = Math.min(100, Math.round((dsaSolved / dsaTarget) * 100))
  const topSkills   = [...profile.skills].sort((a, b) => b.current_level - a.current_level).slice(0, 5)
  const statusMeta  = STATUS_META[todayPlan?.status ?? "not_logged"]
  const maxActual   = Math.max(...last7Days.map(d => d.actual), 1)

  // Placement urgency color
  const urgency = daysLeft < 90 ? "#f87171" : daysLeft < 180 ? "#fbbf24" : "#60a5fa"

  return (
    <div className="page-container space-y-5 animate-fade-in" style={{ maxWidth: "90rem" }}>

      {/* ── Hero header ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, rgba(30,40,80,0.9) 0%, rgba(15,20,40,0.95) 100%)",
          border: "1px solid rgba(96,165,250,0.15)",
          boxShadow: "0 0 60px rgba(96,165,250,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>
        {/* Decorative blur orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium mb-1 tracking-widest uppercase"
              style={{ color: "rgba(96,165,250,0.7)" }}>
              SDE Placement Tracker
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {formatDisplayDate(today)}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
                style={{ backgroundColor: `${urgency}15`, color: urgency, border: `1px solid ${urgency}30` }}>
                <Target className="h-3.5 w-3.5" />
                {daysLeft} days
              </div>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                until placement · Aug 21, 2027
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/log" className="btn-secondary gap-2 text-sm" id="log-today-btn">
              <Clock className="h-4 w-4" /> Log Day
            </Link>
            <Link href="/plan" className="btn-primary gap-2 text-sm" id="plan-today-btn">
              <CalendarDays className="h-4 w-4" /> Plan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Days Left",    value: daysLeft.toString(), sub: "to placement",    icon: Target,    color: urgency },
          { label: "DSA Solved",   value: `${dsaSolved}`,      sub: `of ${dsaTarget}`, icon: Code2,     color: "#34d399" },
          { label: "Streak",       value: `${streak}d`,        sub: "consecutive",     icon: Flame,     color: "#f97316" },
          { label: "7-Day Avg",    value: `${weekAvg.toFixed(1)}h`, sub: "per day",   icon: TrendingUp, color: "#a78bfa" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="relative overflow-hidden rounded-xl p-4 group"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
              transition: "all 0.3s",
            }}>
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at 50% 0%, ${color}10 0%, transparent 70%)` }} />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-black tracking-tight" style={{ color }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main grid ────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Today's status + bar chart */}
        <div className="lg:col-span-2 space-y-4">

          {/* Today status */}
          <div className="rounded-xl p-5"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              boxShadow: todayPlan ? `0 0 30px ${statusMeta.glow}` : "none",
            }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm tracking-wide uppercase" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
                Today&apos;s Session
              </h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${statusMeta.color}18`, color: statusMeta.color, border: `1px solid ${statusMeta.color}30` }}>
                {statusMeta.label}
              </span>
            </div>

            {todayPlan ? (
              <div className="space-y-4">
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Planned</p>
                    <p className="text-3xl font-black text-white">{minutesToHours(todayPlan.planned_hours * 60)}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Actual</p>
                    <p className="text-3xl font-black" style={{ color: statusMeta.color }}>
                      {minutesToHours((todayPlan.actual_hours ?? 0) * 60)}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Completion</p>
                    <p className="text-3xl font-black" style={{ color: statusMeta.color }}>
                      {todayPlan.planned_hours > 0
                        ? Math.round((todayPlan.actual_hours / todayPlan.planned_hours) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
                {/* Glowing progress bar */}
                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full transition-all duration-700 relative"
                    style={{
                      width: `${Math.min(100, (todayPlan.actual_hours / todayPlan.planned_hours) * 100)}%`,
                      background: `linear-gradient(90deg, ${statusMeta.color}aa, ${statusMeta.color})`,
                      boxShadow: `0 0 12px ${statusMeta.color}`,
                    }} />
                </div>
                <div className="flex gap-2">
                  <Link href="/log" className="btn-secondary text-xs py-1.5" id="log-progress-btn">Log Progress</Link>
                  <Link href="/reflect" className="btn-secondary text-xs py-1.5" id="reflect-btn">Reflect</Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>No plan yet — what will you do today?</p>
                <Link href="/plan" className="btn-primary text-sm" id="plan-now-btn">Plan Today →</Link>
              </div>
            )}
          </div>

          {/* 7-day bar chart */}
          <div className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <h2 className="font-semibold text-sm tracking-wide uppercase mb-4"
              style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
              Last 7 Days
            </h2>
            <div className="flex items-end gap-2 h-28">
              {last7Days.map((day) => {
                const pct = (day.actual / maxActual) * 100
                const color = STATUS_META[day.status]?.color ?? "#6b7280"
                const isToday = day.date === today
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="relative w-full flex items-end" style={{ height: "5.5rem" }}>
                      {/* Planned ghost */}
                      {day.planned > 0 && (
                        <div className="absolute inset-x-0 bottom-0 rounded-t-sm"
                          style={{ height: `${(day.planned / maxActual) * 100}%`, backgroundColor: "rgba(255,255,255,0.06)" }} />
                      )}
                      {/* Actual */}
                      <div className="absolute inset-x-0 bottom-0 rounded-t-sm transition-all duration-500"
                        style={{
                          height: `${Math.max(pct, day.actual > 0 ? 4 : 0)}%`,
                          backgroundColor: color,
                          opacity: 0.8,
                          boxShadow: isToday ? `0 0 10px ${color}` : "none",
                        }} />
                    </div>
                    <span className="text-[10px] font-medium"
                      style={{ color: isToday ? "white" : "rgba(255,255,255,0.35)" }}>
                      {day.day}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-4 mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm bg-white opacity-10" /> Planned
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm" style={{ backgroundColor: "#60a5fa" }} /> Actual
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Brutal Reality CTA */}
          <Link href="/brutal-reality" id="brutal-reality-card"
            className="block rounded-xl p-5 group transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(127,29,29,0.4) 0%, rgba(30,10,10,0.6) 100%)",
              border: "1px solid rgba(248,113,113,0.2)",
              backdropFilter: "blur(12px)",
            }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ backgroundColor: "rgba(248,113,113,0.15)" }}>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <h2 className="font-semibold text-red-400">Brutal Reality</h2>
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              Where will you be on Aug 21, 2027 if you continue exactly like this?
            </p>
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-red-400 group-hover:gap-2 transition-all">
              View projection <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          {/* DSA progress ring-style */}
          <div className="rounded-xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm tracking-wide uppercase"
                style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>NeetCode 150</h2>
              <Link href="/dsa" className="text-xs flex items-center gap-0.5 hover:opacity-80"
                style={{ color: "#60a5fa" }} id="dsa-link">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* SVG donut */}
              <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0 -rotate-90">
                <circle cx="40" cy="40" r="32" fill="none" strokeWidth="8"
                  stroke="rgba(255,255,255,0.06)" />
                <circle cx="40" cy="40" r="32" fill="none" strokeWidth="8"
                  stroke="url(#dsaGrad)"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - dsaPct / 100)}`}
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <defs>
                  <linearGradient id="dsaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <p className="text-3xl font-black text-white">{dsaSolved}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>of {dsaTarget} problems</p>
                <p className="text-sm font-bold mt-1" style={{ color: "#34d399" }}>{dsaPct}% done</p>
              </div>
            </div>
            {/* Top topics */}
            {dsaTopics.length > 0 && (
              <div className="mt-4 space-y-2">
                {dsaTopics.slice(0, 3).map(t => (
                  <div key={t.topic}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "rgba(255,255,255,0.6)" }}>{t.topic}</span>
                      <span style={{ color: "#60a5fa" }}>{t.solved}/{t.total}</span>
                    </div>
                    <div className="h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${t.pct}%`, backgroundColor: "#60a5fa" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <h2 className="font-semibold text-sm tracking-wide uppercase mb-3"
              style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>Quick Access</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/dsa",       label: "DSA",       icon: Code2,        color: "#3b82f6" },
                { href: "/roadmap",   label: "Roadmap",   icon: BookOpen,     color: "#34d399" },
                { href: "/schedule",  label: "Schedule",  icon: Clock,        color: "#a78bfa" },
                { href: "/analytics", label: "Analytics", icon: TrendingUp,   color: "#f97316" },
              ].map(({ href, label, icon: Icon, color }) => (
                <Link key={href} href={href} id={`quick-${label.toLowerCase()}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: `${color}12`, color, border: `1px solid ${color}20` }}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />{label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Skills ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm tracking-wide uppercase"
            style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>Career Skills</h2>
          <Link href="/settings" className="text-xs flex items-center gap-0.5 hover:opacity-80"
            style={{ color: "rgba(255,255,255,0.4)" }} id="skills-settings-link">
            Edit <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {topSkills.map((skill, i) => {
            const hue = [210, 142, 280, 25, 170][i % 5]
            const color = `hsl(${hue} 80% 60%)`
            return (
              <div key={skill.id}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-white">{skill.name}</span>
                  <span style={{ color }}>{skill.current_level}%</span>
                </div>
                {/* Segmented progress */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }).map((_, seg) => {
                    const filled = seg < Math.floor(skill.current_level / 10)
                    const partial = seg === Math.floor(skill.current_level / 10)
                    const partialPct = skill.current_level % 10 * 10
                    return (
                      <div key={seg} className="h-1.5 flex-1 rounded-sm overflow-hidden"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                        {(filled || partial) && (
                          <div className="h-full rounded-sm"
                            style={{
                              width: filled ? "100%" : `${partialPct}%`,
                              backgroundColor: color,
                              boxShadow: filled ? `0 0 4px ${color}80` : "none",
                            }} />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>Now</span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{skill.category}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Activity Heatmap ──────────────────────────────────────────── */}
      <div className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h2 className="font-semibold text-sm tracking-wide uppercase"
            style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
            12-Week Activity
          </h2>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: i === 0 ? "rgba(255,255,255,0.04)" : `rgba(96,165,250,${0.15 + i * 0.2})` }} />
            ))}
            <span>More</span>
          </div>
        </div>
        {/* 12 cols (weeks) × 7 rows (days) grid */}
        <div className="overflow-x-auto">
          <div className="inline-grid gap-1"
            style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gridTemplateRows: "repeat(7, 1fr)", minWidth: "480px" }}>
            {/* Reorder heatmap: group by week-column first */}
            {Array.from({ length: 12 }).flatMap((_, week) =>
              Array.from({ length: 7 }).map((_, day) => {
                const idx = week * 7 + day
                const cell = heatmap[idx]
                if (!cell) return <div key={`${week}-${day}`} />
                const bg = heatColor(cell.intensity, cell.status)
                return (
                  <div key={cell.date}
                    className="h-5 w-full rounded-sm cursor-default transition-transform hover:scale-110"
                    style={{ backgroundColor: bg, boxShadow: cell.intensity >= 3 ? `0 0 6px ${bg}` : "none" }}
                    title={`${cell.date}: ${cell.hours.toFixed(1)}h`}
                  />
                )
              })
            )}
          </div>
        </div>
        {/* Month labels */}
        <div className="flex justify-between mt-2">
          {Array.from({ length: 4 }).map((_, i) => {
            const dt = subDays(new Date(), (3 - i) * 21)
            return (
              <span key={i} className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                {format(dt, "MMM")}
              </span>
            )
          })}
        </div>
      </div>

      {/* ── Streak + Zap ─────────────────────────────────────────────── */}
      {streak >= 3 && (
        <div className="rounded-xl p-4 flex items-center gap-4 animate-fade-in"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(30,20,10,0.3) 100%)",
            border: "1px solid rgba(249,115,22,0.2)",
            backdropFilter: "blur(12px)",
          }}>
          <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: "rgba(249,115,22,0.15)" }}>
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <p className="font-bold text-white">
              🔥 {streak}-day streak
            </p>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              You&apos;ve logged every day for {streak} days. Don&apos;t break the chain.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Target, Loader2, RefreshCw } from "lucide-react"
import { getProfile, getPlans, getDSAProblems, getAllReviews, type Profile } from "@/lib/store"
import { differenceInDays, format, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface Projection {
  daysElapsed: number
  daysLeft: number
  consistencyPct: number           // % days you actually logged
  planCompletionPct: number        // avg actual/planned
  dsaSolved: number
  dsaTarget: number
  dsaRate: number                  // problems per day
  dsaProjected: number             // at current rate
  dsaGap: number                   // target - projected
  avgDailyHours: number
  projectedDailyHours: number
  skills: { name: string; current: number; ratePerMonth: number; projected: number }[]
  biggestRisk: string
  strongestArea: string
  overallVerdict: "on_track" | "at_risk" | "critical"
  recommendedActions: string[]
}

function computeProjection(): Projection {
  const profile = getProfile()
  const plans = getPlans()
  const problems = getDSAProblems()
  const reviews = getAllReviews()

  const today = new Date()
  const placementDate = parseISO(profile.placement_date)
  const appStart = parseISO("2026-08-21")   // first possible log date
  const daysElapsed = Math.max(1, differenceInDays(today, appStart))
  const daysLeft = Math.max(1, differenceInDays(placementDate, today))

  // Logged days
  const loggedDays = Object.values(plans).filter((p) => p.status !== "not_logged")
  const consistencyPct = Math.round((loggedDays.length / daysElapsed) * 100)

  // Plan completion
  const withPlan = loggedDays.filter((p) => p.planned_hours > 0)
  const planCompletionPct = withPlan.length > 0
    ? Math.round(withPlan.reduce((s, p) => s + (p.actual_hours / p.planned_hours), 0) / withPlan.length * 100)
    : 0

  // DSA
  const dsaSolved = problems.filter((p) => p.date_solved).length
  const dsaTarget = profile.dsa_target
  const dsaRate = dsaSolved / daysElapsed         // per day
  const dsaProjected = Math.round(dsaSolved + dsaRate * daysLeft)
  const dsaGap = dsaTarget - dsaProjected

  // Avg daily hours
  const avgDailyHours = loggedDays.length > 0
    ? loggedDays.reduce((s, p) => s + (p.actual_hours ?? 0), 0) / loggedDays.length
    : 0
  // Projected: if consistency stays same, avg hours same
  const projectedDailyHours = avgDailyHours * (consistencyPct / 100)

  // Skills projection — compute rate from history or assume 0
  const skills = profile.skills.map((skill) => {
    const reviewEntries = Object.values(reviews)
    const recentScores = reviewEntries.slice(-14).map((r) => r.score_technical ?? 5)
    const avgTechnical = recentScores.length
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 5
    // Rate: assume 1% per month per skill if they score > 6, 0.3% if below, 2% if > 8
    const ratePerMonth = avgTechnical >= 8 ? 2 : avgTechnical >= 6 ? 1 : 0.3
    const monthsLeft = daysLeft / 30
    const projected = Math.min(100, Math.round(skill.current_level + ratePerMonth * monthsLeft))
    return { name: skill.name, current: skill.current_level, ratePerMonth, projected }
  })

  // Biggest risk
  const risks: { label: string; severity: number }[] = [
    { label: "You skip logging most days — your data is unreliable", severity: consistencyPct < 40 ? 10 : consistencyPct < 70 ? 5 : 0 },
    { label: "DSA pace won't reach your target", severity: dsaGap > 50 ? 10 : dsaGap > 20 ? 6 : 0 },
    { label: "You consistently complete less than 60% of your plan", severity: planCompletionPct < 60 ? 9 : planCompletionPct < 75 ? 4 : 0 },
    { label: "Average productive hours is critically low", severity: avgDailyHours < 2 ? 10 : avgDailyHours < 4 ? 5 : 0 },
    { label: "Skills are stagnating — no measurable progress in reviews", severity: skills.every((s) => s.ratePerMonth < 0.5) ? 8 : 0 },
  ]
  const topRisk = risks.sort((a, b) => b.severity - a.severity)[0]
  const biggestRisk = topRisk.severity > 0 ? topRisk.label : "No critical risk identified yet"

  // Strongest area
  const strongestSkill = [...skills].sort((a, b) => b.current - a.current)[0]
  const strongestArea = strongestSkill && strongestSkill.current > 0
    ? `${strongestSkill.name} (${strongestSkill.current}%)`
    : "No standout skill yet"

  // Verdict
  const riskScore = topRisk.severity
  const overallVerdict: "on_track" | "at_risk" | "critical" =
    riskScore >= 8 || consistencyPct < 40 ? "critical"
    : riskScore >= 5 || planCompletionPct < 70 ? "at_risk"
    : "on_track"

  // Recommended actions
  const recommendedActions: string[] = []
  if (consistencyPct < 70) recommendedActions.push(`Log every day — your consistency is ${consistencyPct}%. Projection math is unreliable below 70%.`)
  if (dsaGap > 20) recommendedActions.push(`Solve ${Math.ceil(dsaRate > 0 ? dsaTarget / daysLeft : 1)} DSA problems/day minimum to hit ${dsaTarget} by placement.`)
  if (planCompletionPct < 75) recommendedActions.push(`Reduce daily plan by 25% — you only complete ${planCompletionPct}% on average. Smaller plans, fully executed, compound.`)
  if (avgDailyHours < 4) recommendedActions.push(`Target at least 4h of focused work daily. Current average: ${avgDailyHours.toFixed(1)}h.`)
  if (recommendedActions.length === 0) recommendedActions.push("Maintain current trajectory. DSA pace and consistency are on track.")

  return {
    daysElapsed, daysLeft, consistencyPct, planCompletionPct,
    dsaSolved, dsaTarget, dsaRate, dsaProjected, dsaGap,
    avgDailyHours, projectedDailyHours, skills,
    biggestRisk, strongestArea, overallVerdict, recommendedActions,
  }
}

const VERDICT_CONFIG = {
  on_track: { label: "On Track", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.25)" },
  at_risk:  { label: "At Risk",  color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)" },
  critical: { label: "Critical", color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
}

export default function BrutalRealityPage() {
  const [proj, setProj] = useState<Projection | null>(null)
  const [aiText, setAiText] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { setProj(computeProjection()) }, [])

  async function fetchAI() {
    if (!proj) return
    setAiLoading(true)
    const prompt = `
Student profile — Days elapsed: ${proj.daysElapsed}, Days to placement: ${proj.daysLeft}
Consistency: ${proj.consistencyPct}% days logged
Plan completion rate: ${proj.planCompletionPct}%
Avg daily hours: ${proj.avgDailyHours.toFixed(1)}h
DSA solved: ${proj.dsaSolved} / ${proj.dsaTarget} target. Projected at current pace: ${proj.dsaProjected} (gap: ${proj.dsaGap})
Skills: ${proj.skills.map((s) => `${s.name}=${s.current}%→projected ${s.projected}%`).join(", ")}
Biggest identified risk: ${proj.biggestRisk}
Strongest area: ${proj.strongestArea}

Answer: "If this student continues exactly like this for the next 6 months, where will they end up?" Be specific, honest, and data-driven.`
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "brutal_reality", prompt }) })
      if (res.ok) { const { result } = await res.json(); setAiText(result) }
      else { const { error } = await res.json(); setAiText(`⚠️ ${error}`) }
    } catch { setAiText("Could not reach AI. Check your GEMINI_API_KEY.") }
    setAiLoading(false)
  }

  if (!proj) return null

  const verdict = VERDICT_CONFIG[proj.overallVerdict]
  const dsaOnTrack = proj.dsaProjected >= proj.dsaTarget
  const monthsLeft = (proj.daysLeft / 30).toFixed(1)

  return (
    <div className="page-container space-y-5 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h1 className="text-2xl font-bold tracking-tight">Brutal Reality</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            If you continue exactly like this — where will you be on placement day?
          </p>
        </div>
        <button onClick={() => { setProj(computeProjection()); setAiText(null) }}
          className="btn-secondary gap-2 text-sm" id="refresh-btn">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Overall Verdict */}
      <div className="rounded-xl border p-5 flex items-center justify-between"
        style={{ backgroundColor: verdict.bg, borderColor: verdict.border }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: verdict.color }}>
            Overall Trajectory
          </p>
          <p className="text-3xl font-bold" style={{ color: verdict.color }}>{verdict.label}</p>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
            {proj.daysElapsed} days elapsed · {proj.daysLeft} days to Aug 21, 2027
          </p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black" style={{ color: verdict.color }}>{proj.consistencyPct}%</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>consistency</p>
        </div>
      </div>

      {/* DSA Projection */}
      <div className="glass-card p-5 space-y-4">
        <h2 className="section-heading flex items-center gap-2">
          <span>DSA Projection</span>
          {dsaOnTrack
            ? <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(52,211,153,0.1)", color: "#34d399" }}>On Track</span>
            : <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(248,113,113,0.1)", color: "#f87171" }}>Behind</span>}
        </h2>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-[11px] mb-1" style={{ color: "var(--color-muted-foreground)" }}>Target</p>
            <p className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>{proj.dsaTarget}</p>
          </div>
          <div>
            <p className="text-[11px] mb-1" style={{ color: "var(--color-muted-foreground)" }}>Projected at current pace</p>
            <p className="text-2xl font-bold" style={{ color: dsaOnTrack ? "#34d399" : "#f87171" }}>{proj.dsaProjected}</p>
          </div>
          <div>
            <p className="text-[11px] mb-1" style={{ color: "var(--color-muted-foreground)" }}>Current pace</p>
            <p className="text-2xl font-bold">{proj.dsaRate > 0 ? proj.dsaRate.toFixed(2) : "0.00"}<span className="text-sm font-normal ml-0.5">/day</span></p>
          </div>
        </div>

        {/* Visual bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            <span>0</span><span>{proj.dsaTarget}</span>
          </div>
          <div className="relative h-4 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
            {/* Current */}
            <div className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-1"
              style={{ width: `${(proj.dsaSolved / proj.dsaTarget) * 100}%`, backgroundColor: "#60a5fa" }}>
              {proj.dsaSolved > 5 && <span className="text-[9px] font-bold text-white">{proj.dsaSolved}</span>}
            </div>
            {/* Projected */}
            <div className="absolute inset-y-0 left-0 rounded-full opacity-30"
              style={{ width: `${Math.min(100, (proj.dsaProjected / proj.dsaTarget) * 100)}%`, backgroundColor: dsaOnTrack ? "#34d399" : "#f87171" }} />
          </div>
          <div className="flex justify-between text-[11px]">
            <span style={{ color: "#60a5fa" }}>■ Solved now ({proj.dsaSolved})</span>
            <span style={{ color: dsaOnTrack ? "#34d399" : "#f87171" }}>■ Projected ({proj.dsaProjected})</span>
          </div>
        </div>

        {!dsaOnTrack && proj.dsaGap > 0 && (
          <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171" }}>
            You will fall short by <strong>{proj.dsaGap} problems</strong>. You need{" "}
            <strong>{((proj.dsaTarget - proj.dsaSolved) / Math.max(1, proj.daysLeft)).toFixed(2)} problems/day</strong> from today.
          </div>
        )}
      </div>

      {/* Skills projection */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="section-heading">Skill Projections ({monthsLeft} months)</h2>
        <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Based on your current level and recent reflection scores.
        </p>
        <div className="space-y-2">
          {proj.skills.map((skill) => {
            const gap = skill.projected - skill.current
            const projColor = skill.projected >= 70 ? "#34d399" : skill.projected >= 40 ? "#60a5fa" : "#f87171"
            return (
              <div key={skill.name} className="grid items-center gap-2" style={{ gridTemplateColumns: "7rem 1fr auto auto" }}>
                <span className="text-xs font-medium truncate">{skill.name}</span>
                <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
                  <div className="absolute inset-y-0 left-0 rounded-full"
                    style={{ width: `${skill.current}%`, backgroundColor: "var(--color-border)" }} />
                  <div className="absolute inset-y-0 left-0 rounded-full opacity-50"
                    style={{ width: `${skill.projected}%`, backgroundColor: projColor }} />
                </div>
                <span className="text-xs w-8 text-right font-medium" style={{ color: projColor }}>{skill.projected}%</span>
                <span className="text-xs w-10 text-right" style={{ color: gap > 0 ? "#34d399" : "var(--color-muted-foreground)" }}>
                  {gap > 0 ? `+${gap}` : "—"}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Risk / Strength */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-4 space-y-2" style={{ borderColor: "rgba(248,113,113,0.25)" }}>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">Current Biggest Risk</h3>
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>{proj.biggestRisk}</p>
        </div>
        <div className="glass-card p-4 space-y-2" style={{ borderColor: "rgba(52,211,153,0.25)" }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-400">Current Strongest Area</h3>
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>{proj.strongestArea}</p>
        </div>
      </div>

      {/* Recommended corrections */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
          <h2 className="section-heading">Recommended Corrections</h2>
        </div>
        <ol className="space-y-2">
          {proj.recommendedActions.map((action, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 font-bold text-xs pt-0.5 w-5 h-5 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}>{i+1}</span>
              <span style={{ color: "var(--color-foreground)" }}>{action}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* AI Assessment */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-400" />
            <h2 className="section-heading">AI Verdict</h2>
          </div>
          {!aiText && (
            <button onClick={fetchAI} disabled={aiLoading} className="btn-primary gap-2 text-sm" id="get-ai-verdict-btn">
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</> : "Get Gemini Assessment"}
            </button>
          )}
          {aiText && (
            <button onClick={() => { setAiText(null) }} className="btn-secondary text-xs" id="reset-ai-btn">Re-run</button>
          )}
        </div>
        {aiText ? (
          <div className="text-sm leading-relaxed whitespace-pre-line animate-slide-up"
            style={{ color: "var(--color-muted-foreground)" }}>{aiText}</div>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Click "Get Gemini Assessment" for an honest, data-driven verdict on your current trajectory.
          </p>
        )}
      </div>
    </div>
  )
}
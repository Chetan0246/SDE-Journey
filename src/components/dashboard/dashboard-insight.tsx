"use client"

import { Lightbulb } from "lucide-react"

interface Props {
  weeklyCompletion: number | null
  streak: number
  skills: { name: string; current_level: number }[]
  weekPlans: { planned_hours: number; actual_hours: number | null }[]
}

function generateInsight(
  weeklyCompletion: number | null,
  streak: number,
  skills: { name: string; current_level: number }[],
  weekPlans: { planned_hours: number; actual_hours: number | null }[]
): string {
  if (weekPlans.length === 0) return "Start planning your day to see personalized insights here."

  const totalPlanned = weekPlans.reduce((s, p) => s + (p.planned_hours || 0), 0)
  const totalActual = weekPlans.reduce((s, p) => s + (p.actual_hours || 0), 0)
  const ratio = totalPlanned > 0 ? totalActual / totalPlanned : 0

  if (ratio < 0.5 && totalPlanned > 0) {
    const overPlanPct = Math.round((1 - ratio) * 100)
    return `You're over-planning by ~${overPlanPct}%. Try cutting planned hours by 30% to build realistic momentum.`
  }

  if (weeklyCompletion !== null && weeklyCompletion >= 80 && streak >= 5) {
    return `Strong week — ${weeklyCompletion}% completion rate with a ${streak}-day streak. Keep the consistency.`
  }

  const weakSkill = skills
    .filter((s) => s.current_level < 30)
    .sort((a, b) => a.current_level - b.current_level)[0]

  if (weakSkill) {
    return `${weakSkill.name} is at ${weakSkill.current_level}% — your lowest skill. Consider prioritizing it this week.`
  }

  if (weeklyCompletion !== null && weeklyCompletion >= 70) {
    return `${weeklyCompletion}% weekly completion. You're on track — maintain the discipline.`
  }

  return "Log your day consistently to unlock personalized pattern analysis."
}

export function DashboardInsight({ weeklyCompletion, streak, skills, weekPlans }: Props) {
  const insight = generateInsight(weeklyCompletion, streak, skills, weekPlans)

  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-sm text-foreground/90">{insight}</p>
    </div>
  )
}

import { Clock, Flame, TrendingUp, CheckCircle2 } from "lucide-react"
import { minutesToHours } from "@/lib/utils"

interface Props {
  plan: { planned_hours: number; actual_hours: number | null; status: string } | null
  weeklyCompletion: number | null
  streak: number
}

export function TodayStatus({ plan, weeklyCompletion, streak }: Props) {
  const metrics = [
    {
      label: "Planned today",
      value: plan ? `${plan.planned_hours}h` : "—",
      icon: Clock,
      color: "text-blue-400",
    },
    {
      label: "Actual today",
      value: plan?.actual_hours != null ? `${plan.actual_hours}h` : "—",
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      label: "Week completion",
      value: weeklyCompletion != null ? `${weeklyCompletion}%` : "—",
      icon: TrendingUp,
      color: "text-purple-400",
    },
    {
      label: "Current streak",
      value: streak > 0 ? `${streak} days` : "—",
      icon: Flame,
      color: "text-orange-400",
    },
  ]

  return (
    <div className="glass-card p-4 space-y-3">
      <h2 className="section-heading">Today&apos;s Status</h2>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg bg-accent/50 p-3 space-y-1">
            <div className={`flex items-center gap-1.5 ${color}`}>
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

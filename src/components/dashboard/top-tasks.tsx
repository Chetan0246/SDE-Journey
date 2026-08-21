import Link from "next/link"
import { ListTodo, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface Task {
  id: string
  name: string
  category: string
  estimated_duration: number
  priority: number
}

const CATEGORY_COLORS: Record<string, string> = {
  DSA: "bg-blue-500/10 text-blue-400",
  Java: "bg-orange-500/10 text-orange-400",
  "Spring Boot": "bg-green-500/10 text-green-400",
  SQL: "bg-purple-500/10 text-purple-400",
  "CS Fundamentals": "bg-yellow-500/10 text-yellow-400",
  Project: "bg-pink-500/10 text-pink-400",
  AI: "bg-cyan-500/10 text-cyan-400",
  College: "bg-gray-500/10 text-gray-400",
}

export function TopTasks({ tasks, hasPlan }: { tasks: Task[]; hasPlan: boolean }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <h2 className="section-heading">Top Priorities</h2>
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          {hasPlan ? (
            <>
              <ListTodo className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No high-priority tasks yet</p>
            </>
          ) : (
            <>
              <CalendarDays className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Plan your day to see priorities</p>
              <Link href="/plan" className="btn-primary mt-3 text-xs px-3 py-1.5">
                Plan now
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, i) => (
            <div
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{task.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className={cn("badge text-[10px]", CATEGORY_COLORS[task.category] || "bg-gray-500/10 text-gray-400")}>
                    {task.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{task.estimated_duration}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

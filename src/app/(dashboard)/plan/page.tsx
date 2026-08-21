"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, GripVertical, Save, Loader2, CalendarDays } from "lucide-react"
import { todayStr, formatDisplayDate } from "@/lib/utils"
import { getTasks, saveTasks, upsertPlan, getPlan, type Task, type TaskCategory } from "@/lib/store"

const CATEGORIES: TaskCategory[] = [
  "DSA","Java","Spring Boot","SQL","CS Fundamentals",
  "Project","AI","College","Internship/Placement","Personal","Other"
]

const BLANK_TASK = (): Omit<Task,"id"|"sort_order"> => ({
  name: "", category: "DSA", priority: 2,
  estimated_duration: 60, planned_start: "09:00", planned_end: "10:00",
})

export default function PlanPage() {
  const router = useRouter()
  const [date, setDate] = useState(todayStr())
  const [tasks, setTasks] = useState<Task[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setTasks(getTasks(date))
  }, [date])

  function addTask() {
    const t: Task = { ...BLANK_TASK(), id: crypto.randomUUID(), sort_order: tasks.length }
    setTasks([...tasks, t])
  }

  function removeTask(id: string) { setTasks(tasks.filter((t) => t.id !== id)) }

  function updateTask(id: string, field: keyof Task, value: unknown) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, [field]: value } : t)))
  }

  function handleSave() {
    setSaving(true)
    saveTasks(date, tasks)
    const totalMins = tasks.reduce((s, t) => s + t.estimated_duration, 0)
    const existing = getPlan(date)
    upsertPlan({
      date,
      planned_hours: parseFloat((totalMins / 60).toFixed(2)),
      actual_hours: existing?.actual_hours ?? 0,
      status: existing?.status ?? "not_logged",
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalHours = (tasks.reduce((s, t) => s + t.estimated_duration, 0) / 60).toFixed(1)

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-5 w-5" style={{ color: "var(--color-primary)" }} /> Plan My Day
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            {formatDisplayDate(date)} Â· {totalHours}h planned
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" className="form-input w-auto text-sm" value={date}
            onChange={(e) => setDate(e.target.value)} id="plan-date" />
          <button onClick={handleSave} className={`btn-primary gap-2 ${saved ? "opacity-90" : ""}`}
            disabled={saving} id="save-plan-btn">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Plan"}
          </button>
        </div>
      </div>

      <div className="glass-card divide-y" style={{ }}>
        {tasks.length === 0 ? (
          <div className="py-14 text-center">
            <p style={{ color: "var(--color-muted-foreground)" }} className="text-sm">No tasks yet. Add your first block.</p>
          </div>
        ) : (
          tasks.map((task, i) => (
            <div key={task.id} className="p-3 grid gap-2 sm:grid-cols-[auto_1fr_auto_auto_auto_auto]
              items-center animate-slide-up">
              <GripVertical className="h-4 w-4 hidden sm:block" style={{ color: "var(--color-muted-foreground)" }} />
              <input className="form-input" placeholder="Task nameâ€¦" value={task.name}
                onChange={(e) => updateTask(task.id, "name", e.target.value)}
                id={`task-name-${i}`} />
              <select className="form-input w-auto" value={task.category}
                onChange={(e) => updateTask(task.id, "category", e.target.value)}
                id={`task-cat-${i}`}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-1">
                <input type="number" className="form-input w-20 text-sm" value={task.estimated_duration}
                  min={15} max={480} step={15}
                  onChange={(e) => updateTask(task.id, "estimated_duration", parseInt(e.target.value))}
                  id={`task-dur-${i}`} />
                <span className="text-xs whitespace-nowrap" style={{ color: "var(--color-muted-foreground)" }}>min</span>
              </div>
              <select className="form-input w-auto text-xs" value={task.priority}
                onChange={(e) => updateTask(task.id, "priority", parseInt(e.target.value))}
                id={`task-pri-${i}`}>
                <option value={1}>P1 â€” Critical</option>
                <option value={2}>P2 â€” Important</option>
                <option value={3}>P3 â€” Nice to have</option>
              </select>
              <button onClick={() => removeTask(task.id)} className="p-1.5 rounded-md transition-colors
                hover:bg-red-500/10" style={{ color: "var(--color-muted-foreground)" }}
                id={`remove-task-${i}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
        <div className="p-3">
          <button onClick={addTask} className="btn-secondary gap-2 text-sm" id="add-task-btn">
            <Plus className="h-4 w-4" /> Add Task Block
          </button>
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--color-muted-foreground)" }}>Category breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              tasks.reduce<Record<string,number>>((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.estimated_duration; return acc
              }, {})
            ).map(([cat, mins]) => (
              <div key={cat} className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                {cat} <span style={{ color: "var(--color-primary)" }}>{(mins/60).toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
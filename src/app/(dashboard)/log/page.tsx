"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, XCircle, RotateCcw, Plus, Save, Loader2 } from "lucide-react"
import { todayStr, formatDisplayDate, minutesToHours } from "@/lib/utils"
import {
  getTasks, getTaskLogs, saveTaskLogs, upsertPlan, getPlan,
  type Task, type TaskLog, type TaskStatus
} from "@/lib/store"

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: React.ElementType; color: string }[] = [
  { value: "completed",   label: "Done",        icon: CheckCircle2, color: "#34d399" },
  { value: "partial",     label: "Partial",     icon: Clock,        color: "#60a5fa" },
  { value: "skipped",     label: "Skipped",     icon: XCircle,      color: "#fbbf24" },
  { value: "rescheduled", label: "Rescheduled", icon: RotateCcw,    color: "#a78bfa" },
]

export default function LogPage() {
  const [date, setDate] = useState(todayStr())
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<TaskLog[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const t = getTasks(date)
    setTasks(t)
    const existing = getTaskLogs(date)
    if (existing.length > 0) {
      setLogs(existing)
    } else {
      setLogs(t.map((task) => ({
        task_id: task.id, name: task.name, category: task.category,
        status: "completed" as TaskStatus,
        actual_duration: task.estimated_duration,
        completion_percent: 100, is_unplanned: false,
      })))
    }
  }, [date])

  function updateLog(idx: number, field: keyof TaskLog, value: unknown) {
    setLogs(logs.map((l, i) => (i === idx ? { ...l, [field]: value } : l)))
  }

  function addUnplanned() {
    setLogs([...logs, {
      task_id: null, name: "", category: "Other", status: "completed",
      actual_duration: 30, completion_percent: 100, is_unplanned: true,
    }])
  }

  function removeLog(idx: number) { setLogs(logs.filter((_, i) => i !== idx)) }

  function handleSave() {
    setSaving(true)
    saveTaskLogs(date, logs)
    const totalMins = logs.reduce((s, l) => s + (l.actual_duration ?? 0), 0)
    const actualHours = parseFloat((totalMins / 60).toFixed(2))
    const existing = getPlan(date)
    const planned = existing?.planned_hours ?? 0
    const ratio = planned > 0 ? actualHours / planned : 1
    const status = ratio >= 0.9 ? "excellent" : ratio >= 0.75 ? "good" : ratio >= 0.5 ? "average" : "poor"
    upsertPlan({ date, planned_hours: planned, actual_hours: actualHours, status })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalActual = logs.reduce((s, l) => s + (l.actual_duration ?? 0), 0)

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            {formatDisplayDate(date)} · {minutesToHours(totalActual)} logged
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" className="form-input w-auto text-sm" value={date}
            onChange={(e) => setDate(e.target.value)} id="log-date" />
          <button onClick={handleSave} disabled={saving}
            className={`btn-primary gap-2 ${saved ? "opacity-90" : ""}`} id="save-log-btn">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saved ? "Saved!" : "Save Log"}
          </button>
        </div>
      </div>

      <div className="glass-card divide-y">
        {logs.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            No planned tasks found. Add an unplanned entry below.
          </div>
        )}
        {logs.map((log, i) => {
          const statusOpt = STATUS_OPTIONS.find((s) => s.value === log.status) ?? STATUS_OPTIONS[0]
          const Icon = statusOpt.icon
          return (
            <div key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {log.is_unplanned
                  ? <input className="form-input flex-1" placeholder="Unplanned activity…" value={log.name}
                      onChange={(e) => updateLog(i, "name", e.target.value)} id={`log-name-${i}`} />
                  : <div className="flex-1 font-medium text-sm">{log.name}
                      <span className="ml-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>({log.category})</span>
                    </div>
                }
                <button onClick={() => removeLog(i)} className="text-xs px-2 py-1 rounded opacity-50 hover:opacity-100"
                  style={{ color: "var(--color-muted-foreground)" }} id={`remove-log-${i}`}>✕</button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Status */}
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((s) => {
                    const S = s.icon
                    return (
                      <button key={s.value} onClick={() => updateLog(i, "status", s.value)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
                        style={{
                          backgroundColor: log.status === s.value ? s.color + "20" : "var(--color-accent)",
                          color: log.status === s.value ? s.color : "var(--color-muted-foreground)",
                          borderWidth: 1,
                          borderColor: log.status === s.value ? s.color + "40" : "transparent",
                        }}
                        id={`status-${i}-${s.value}`}>
                        <S className="h-3 w-3" />{s.label}
                      </button>
                    )
                  })}
                </div>
                {/* Duration */}
                <div className="flex items-center gap-1.5 text-sm">
                  <span style={{ color: "var(--color-muted-foreground)" }}>Time:</span>
                  <input type="number" min={0} max={480} step={15} value={log.actual_duration}
                    onChange={(e) => updateLog(i, "actual_duration", parseInt(e.target.value))}
                    className="form-input w-20 text-sm" id={`log-dur-${i}`} />
                  <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>min</span>
                </div>
                {/* Completion % */}
                <div className="flex items-center gap-1.5 text-sm">
                  <span style={{ color: "var(--color-muted-foreground)" }}>Done:</span>
                  <input type="range" min={0} max={100} step={10} value={log.completion_percent}
                    onChange={(e) => updateLog(i, "completion_percent", parseInt(e.target.value))}
                    className="w-24 accent-primary" id={`log-pct-${i}`} />
                  <span className="text-xs font-medium w-8" style={{ color: "var(--color-primary)" }}>{log.completion_percent}%</span>
                </div>
              </div>
            </div>
          )
        })}
        <div className="p-3">
          <button onClick={addUnplanned} className="btn-secondary gap-2 text-sm" id="add-unplanned-btn">
            <Plus className="h-4 w-4" /> Add Unplanned
          </button>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, XCircle, RotateCcw, Plus, Save, Loader2, Trash2, AlertTriangle } from "lucide-react"
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

const WASTE_CATEGORIES = [
  "Social Media (Instagram/YouTube shorts)",
  "Random YouTube",
  "Aimless phone browsing",
  "Excessive chatting",
  "Unnecessary napping",
  "Gaming",
  "Unplanned TV/Reels",
  "Other distraction",
]

interface WasteEntry {
  category: string
  minutes: number
  note: string
}

const WASTE_KEY = "sde_waste_log_v1"

function loadWaste(date: string): WasteEntry[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(WASTE_KEY)
    if (!stored) return []
    const all: Record<string, WasteEntry[]> = JSON.parse(stored)
    return all[date] ?? []
  } catch { return [] }
}

function saveWaste(date: string, entries: WasteEntry[]) {
  if (typeof window === "undefined") return
  try {
    const stored = localStorage.getItem(WASTE_KEY)
    const all: Record<string, WasteEntry[]> = stored ? JSON.parse(stored) : {}
    all[date] = entries
    localStorage.setItem(WASTE_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

export default function LogPage() {
  const [date, setDate] = useState(todayStr())
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<TaskLog[]>([])
  const [waste, setWaste] = useState<WasteEntry[]>([])
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
    setWaste(loadWaste(date))
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

  function addWaste() {
    setWaste([...waste, { category: WASTE_CATEGORIES[0], minutes: 15, note: "" }])
  }

  function updateWaste(idx: number, field: keyof WasteEntry, value: string | number) {
    setWaste(waste.map((w, i) => (i === idx ? { ...w, [field]: value } : w)))
  }

  function removeWaste(idx: number) { setWaste(waste.filter((_, i) => i !== idx)) }

  function handleSave() {
    setSaving(true)
    saveTaskLogs(date, logs)
    saveWaste(date, waste)
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
  const totalWasted = waste.reduce((s, w) => s + w.minutes, 0)

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Log</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            {formatDisplayDate(date)} · {minutesToHours(totalActual)} productive
            {totalWasted > 0 && (
              <span style={{ color: "hsl(0 84% 70%)" }}> · {minutesToHours(totalWasted)} wasted</span>
            )}
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Productive</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(142 71% 45%)" }}>{minutesToHours(totalActual)}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Wasted</p>
          <p className="text-2xl font-bold" style={{ color: totalWasted > 60 ? "hsl(0 84% 70%)" : "var(--color-foreground)" }}>
            {minutesToHours(totalWasted)}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Tasks</p>
          <p className="text-2xl font-bold">{logs.filter(l => l.status === "completed").length}/{logs.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Efficiency</p>
          <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
            {totalActual + totalWasted > 0
              ? Math.round((totalActual / (totalActual + totalWasted)) * 100)
              : 100}%
          </p>
        </div>
      </div>

      {/* Task logs */}
      <div className="glass-card divide-y" style={{ borderColor: "var(--color-border)" }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="section-heading">Tasks</h2>
        </div>
        {logs.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            No planned tasks. Add an unplanned entry below.
          </div>
        )}
        {logs.map((log, i) => {
          const statusOpt = STATUS_OPTIONS.find((s) => s.value === log.status) ?? STATUS_OPTIONS[0]
          const Icon = statusOpt.icon
          return (
            <div key={i} className="p-4 space-y-3" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-3">
                {log.is_unplanned
                  ? <input className="form-input flex-1" placeholder="Unplanned activity…" value={log.name}
                      onChange={(e) => updateLog(i, "name", e.target.value)} id={`log-name-${i}`} />
                  : <div className="flex-1 font-medium text-sm">{log.name}
                      <span className="ml-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>({log.category})</span>
                    </div>
                }
                <button onClick={() => removeLog(i)} className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--color-muted-foreground)" }} id={`remove-log-${i}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 flex-wrap">
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
                <div className="flex items-center gap-1.5 text-sm">
                  <span style={{ color: "var(--color-muted-foreground)" }}>Time:</span>
                  <input type="number" min={0} max={480} step={15} value={log.actual_duration}
                    onChange={(e) => updateLog(i, "actual_duration", parseInt(e.target.value))}
                    className="form-input w-20 text-sm" id={`log-dur-${i}`} />
                  <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>min</span>
                </div>
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
            <Plus className="h-4 w-4" /> Add Unplanned Task
          </button>
        </div>
      </div>

      {/* ── Time Wasted Tracker ─────────────────────────────────────── */}
      <div className="glass-card divide-y" style={{ borderColor: "var(--color-border)" }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" style={{ color: "hsl(0 84% 70%)" }} />
            <h2 className="section-heading">Time Wasted</h2>
          </div>
          {totalWasted > 0 && (
            <span className="text-sm font-bold" style={{ color: "hsl(0 84% 70%)" }}>
              {minutesToHours(totalWasted)} lost today
            </span>
          )}
        </div>

        {waste.length === 0 && (
          <div className="py-8 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            No time wasted logged — great, or be honest.
          </div>
        )}

        {waste.map((entry, i) => (
          <div key={i} className="p-4 space-y-2" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <select
                className="form-input flex-1 text-sm"
                value={entry.category}
                onChange={(e) => updateWaste(i, "category", e.target.value)}
                id={`waste-cat-${i}`}
              >
                {WASTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex items-center gap-1.5">
                <input type="number" min={5} max={300} step={5} value={entry.minutes}
                  onChange={(e) => updateWaste(i, "minutes", parseInt(e.target.value))}
                  className="form-input w-20 text-sm" id={`waste-min-${i}`} />
                <span className="text-xs shrink-0" style={{ color: "var(--color-muted-foreground)" }}>min</span>
              </div>
              <button onClick={() => removeWaste(i)} className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: "var(--color-muted-foreground)" }} id={`remove-waste-${i}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              className="form-input text-sm"
              placeholder="Note (optional) — what triggered it?"
              value={entry.note}
              onChange={(e) => updateWaste(i, "note", e.target.value)}
              id={`waste-note-${i}`}
            />
          </div>
        ))}

        <div className="p-3 flex items-center justify-between">
          <button onClick={addWaste} className="btn-secondary gap-2 text-sm" id="add-waste-btn">
            <Plus className="h-4 w-4" /> Log Wasted Time
          </button>
          {totalWasted > 120 && (
            <p className="text-xs" style={{ color: "hsl(0 84% 70%)" }}>
              ⚠ Over 2h wasted — this will show in your Brutal Reality report
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
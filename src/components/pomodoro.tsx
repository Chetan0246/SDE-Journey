"use client"

import { useState, useEffect } from "react"
import { Timer, Play, Pause, Square, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react"
import { getTasks, saveTaskLogs, getTaskLogs, type Task, type TaskLog } from "@/lib/store"
import { todayStr } from "@/lib/utils"

interface PomodoroState {
  isActive: boolean
  isPaused: boolean
  startTime: number | null
  pausedAt: number | null
  accumulatedMs: number
  mode: "pomodoro" | "stopwatch"
  taskId: string | null
}

const DEFAULT_STATE: PomodoroState = {
  isActive: false,
  isPaused: false,
  startTime: null,
  pausedAt: null,
  accumulatedMs: 0,
  mode: "pomodoro",
  taskId: null,
}

const POMODORO_MINS = 25

export function Pomodoro() {
  const [expanded, setExpanded] = useState(false)
  const [state, setState] = useState<PomodoroState>(DEFAULT_STATE)
  const [tasks, setTasks] = useState<Task[]>([])
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("sde_pomodoro_state")
    if (saved) {
      try { setState(JSON.parse(saved)) } catch {}
    }
  }, [])

  // Poll for tasks whenever expanded
  useEffect(() => {
    if (expanded) setTasks(getTasks(todayStr()))
  }, [expanded])

  // Timer loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (state.isActive && !state.isPaused && state.startTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const totalMs = (now - state.startTime!) + state.accumulatedMs
        setElapsedSecs(Math.floor(totalMs / 1000))
      }, 500)
    } else if (state.isActive && state.isPaused) {
       // Static elapsed time
       setElapsedSecs(Math.floor(state.accumulatedMs / 1000))
    } else {
       setElapsedSecs(0)
    }
    return () => clearInterval(interval)
  }, [state])

  const saveState = (newState: PomodoroState) => {
    setState(newState)
    localStorage.setItem("sde_pomodoro_state", JSON.stringify(newState))
  }

  const togglePlay = () => {
    if (!state.taskId) return alert("Select a task first!")
    
    if (!state.isActive) {
      // Start fresh
      saveState({ ...state, isActive: true, isPaused: false, startTime: Date.now(), accumulatedMs: 0 })
    } else if (state.isPaused) {
      // Resume
      saveState({ ...state, isPaused: false, startTime: Date.now() })
    } else {
      // Pause
      const now = Date.now()
      const diff = now - (state.startTime || now)
      saveState({ ...state, isPaused: true, startTime: null, accumulatedMs: state.accumulatedMs + diff })
    }
  }

  const stopAndLog = () => {
    if (!state.isActive) return
    const now = Date.now()
    const diff = !state.isPaused ? (now - (state.startTime || now)) : 0
    const finalMs = state.accumulatedMs + diff
    const finalMins = Math.round(finalMs / 60000)

    if (finalMins > 0 && state.taskId) {
      const task = tasks.find(t => t.id === state.taskId)
      if (task) {
        const date = todayStr()
        const logs = getTaskLogs(date)
        const existing = logs.find(l => l.task_id === task.id)
        
        if (existing) {
          existing.actual_duration += finalMins
          if (existing.actual_duration >= task.estimated_duration) existing.status = "completed"
        } else {
          logs.push({
            task_id: task.id,
            name: task.name,
            category: task.category,
            status: finalMins >= task.estimated_duration ? "completed" : "partial",
            actual_duration: finalMins,
            completion_percent: Math.min(100, Math.round((finalMins / task.estimated_duration) * 100)),
            is_unplanned: false
          })
        }
        saveTaskLogs(date, logs)
        alert(`Logged ${finalMins} minutes to ${task.name}`)
      }
    }
    saveState({ ...state, isActive: false, isPaused: false, startTime: null, accumulatedMs: 0 })
  }

  const cancel = () => {
    saveState({ ...state, isActive: false, isPaused: false, startTime: null, accumulatedMs: 0 })
  }

  if (!mounted) return null

  // Calculate display time
  let displayMins = 0
  let displaySecs = 0
  
  if (state.mode === "pomodoro") {
    const totalSecs = POMODORO_MINS * 60
    const remaining = Math.max(0, totalSecs - elapsedSecs)
    displayMins = Math.floor(remaining / 60)
    displaySecs = remaining % 60
  } else {
    displayMins = Math.floor(elapsedSecs / 60)
    displaySecs = elapsedSecs % 60
  }

  const timeStr = `${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {expanded && (
        <div className="mb-4 w-72 glass-card p-4 animate-slide-up shadow-2xl border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Focus Session</h3>
            <div className="flex gap-2 bg-black/40 p-1 rounded-md">
              <button 
                onClick={() => saveState({...state, mode: 'pomodoro'})}
                className={`text-[10px] px-2 py-1 rounded ${state.mode === 'pomodoro' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400'}`}>
                Pomodoro
              </button>
              <button 
                onClick={() => saveState({...state, mode: 'stopwatch'})}
                className={`text-[10px] px-2 py-1 rounded ${state.mode === 'stopwatch' ? 'bg-[var(--color-primary)] text-white' : 'text-gray-400'}`}>
                Stopwatch
              </button>
            </div>
          </div>

          <div className="text-4xl font-mono text-center my-6 tracking-wider" style={{ color: state.isActive && !state.isPaused ? "var(--color-primary)" : "white" }}>
            {timeStr}
          </div>

          <select 
            className="form-input text-xs w-full mb-4"
            value={state.taskId || ""}
            onChange={(e) => saveState({...state, taskId: e.target.value})}
            disabled={state.isActive}
          >
            <option value="">Select task...</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.estimated_duration}m)</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button 
              onClick={togglePlay}
              className="flex-1 btn-primary py-2 flex justify-center items-center"
            >
              {state.isActive && !state.isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            
            {state.isActive && (
              <>
                <button 
                  onClick={stopAndLog}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-md flex justify-center items-center transition-colors"
                  title="Stop and Log Time"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={cancel}
                  className="w-10 bg-red-900/50 hover:bg-red-800 text-red-200 rounded-md flex justify-center items-center transition-colors"
                  title="Cancel Session"
                >
                  <Square className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => setExpanded(!expanded)}
        className="h-12 w-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        style={{ 
          background: state.isActive && !state.isPaused ? "var(--color-primary)" : "rgba(25, 25, 30, 0.9)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: state.isActive && !state.isPaused ? "0 0 20px var(--color-primary)" : "0 4px 12px rgba(0,0,0,0.5)"
        }}
      >
        {expanded ? <ChevronDown className="h-5 w-5" /> : (
          state.isActive ? (
             <span className="text-xs font-mono font-bold">{displayMins}m</span>
          ) : (
            <Timer className="h-5 w-5" />
          )
        )}
      </button>
    </div>
  )
}
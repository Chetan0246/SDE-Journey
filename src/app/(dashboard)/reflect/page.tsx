"use client"

import { useState, useCallback } from "react"
import { ChevronRight, ChevronLeft, Loader2, Check } from "lucide-react"
import { todayStr, formatDisplayDate } from "@/lib/utils"
import { getReview, saveReview, getTaskLogs, type DailyReview } from "@/lib/store"

const STEPS = [
  { id: "most_valuable", label: "Most valuable task today?", placeholder: "What was the single most important thing you completed?" },
  { id: "failed_task", label: "What did you fail to do?", placeholder: "Be honest. Which task did you skip or do poorly?" },
  { id: "learnings", label: "What did you learn?", placeholder: "One technical or personal insight from today." },
  { id: "mistake_to_avoid", label: "Mistake to avoid tomorrow?", placeholder: "One behaviour to change." },
  { id: "tomorrow_one_thing", label: "Tomorrow's one priority?", placeholder: "The single most important task for tomorrow." },
]

const SCORE_DIMS = [
  { id: "score_focus",       label: "Focus",       desc: "Deep work vs distracted?" },
  { id: "score_discipline",  label: "Discipline",  desc: "Did you follow the plan?" },
  { id: "score_learning",    label: "Learning",    desc: "Gained real understanding?" },
  { id: "score_productivity",label: "Productivity",desc: "Output vs time invested?" },
  { id: "score_technical",   label: "Technical",   desc: "Skills improved today?" },
  { id: "score_energy",      label: "Energy",      desc: "Mental/physical state?" },
]

const BLANK = (): DailyReview => ({
  date: todayStr(),
  most_valuable: "", failed_task: "", failure_reasons: [],
  learnings: "", mistake_to_avoid: "", tomorrow_one_thing: "",
  score_focus: 5, score_discipline: 5, score_learning: 5,
  score_productivity: 5, score_technical: 5, score_energy: 5,
  overall_score: 5, ai_review: null, ai_tomorrow_plan: null,
})

export default function ReflectPage() {
  const [date, setDate] = useState(todayStr())
  const [step, setStep] = useState(0)
  const [review, setReview] = useState<DailyReview>(() => {
    const today = todayStr()
    return getReview(today) ?? { ...BLANK(), date: today }
  })
  const [aiLoading, setAiLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const TOTAL_STEPS = STEPS.length + 1 // +1 for scores

  const handleDateChange = useCallback((newDate: string) => {
    setDate(newDate)
    setReview(getReview(newDate) ?? { ...BLANK(), date: newDate })
    setStep(0)
    setSaved(false)
  }, [])

  function setValue(field: keyof DailyReview, value: unknown) {
    setReview((r) => ({ ...r, [field]: value }))
  }

  function avgScore(r: DailyReview) {
    const s = [r.score_focus, r.score_discipline, r.score_learning,
      r.score_productivity, r.score_technical, r.score_energy]
    return parseFloat((s.reduce((a, b) => a + b, 0) / s.length).toFixed(1))
  }

  async function handleSave() {
    const final = { ...review, overall_score: avgScore(review) }
    setAiLoading(true)

    try {
      const taskLogs = getTaskLogs(date)
      const prompt = `Date: ${date}
Most valuable: ${final.most_valuable}
Failed task: ${final.failed_task}
Learnings: ${final.learnings}
Mistake to avoid: ${final.mistake_to_avoid}
Tomorrow priority: ${final.tomorrow_one_thing}
Scores — Focus:${final.score_focus} Discipline:${final.score_discipline} Learning:${final.score_learning} Productivity:${final.score_productivity} Technical:${final.score_technical} Energy:${final.score_energy}
Tasks done today: ${taskLogs.map((l) => `${l.name}(${l.status},${l.actual_duration}min)`).join(", ")}`

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "daily_review", prompt }),
      })
      if (res.ok) {
        const { result } = await res.json()
        final.ai_review = result
      }
    } catch { /* no AI, save anyway */ }

    saveReview(final)
    setReview(final)
    setAiLoading(false)
    setSaved(true)
  }

  const isLastStep = step === TOTAL_STEPS - 1
  const currentText = STEPS[step]

  return (
    <div className="page-container max-w-2xl animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Reflection</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>{formatDisplayDate(date)}</p>
        </div>
        <input type="date" className="form-input w-auto text-sm" value={date}
          onChange={(e) => handleDateChange(e.target.value)} id="reflect-date" />
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <button key={i} onClick={() => setStep(i)} className="h-1.5 flex-1 rounded-full transition-all"
            style={{ backgroundColor: i <= step ? "var(--color-primary)" : "var(--color-accent)" }}
            id={`step-indicator-${i}`} />
        ))}
      </div>

      <div className="glass-card p-6 animate-slide-up" key={step}>
        {step < STEPS.length ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--color-muted-foreground)" }}>
                Step {step + 1} of {TOTAL_STEPS}
              </p>
              <h2 className="text-lg font-semibold">{currentText.label}</h2>
            </div>
            <textarea rows={4} className="form-input"
              placeholder={currentText.placeholder}
              value={(review[currentText.id as keyof DailyReview] as string) ?? ""}
              onChange={(e) => setValue(currentText.id as keyof DailyReview, e.target.value)}
              id={`reflect-field-${step}`} />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "var(--color-muted-foreground)" }}>Step {TOTAL_STEPS} of {TOTAL_STEPS}</p>
              <h2 className="text-lg font-semibold">Self-Assessment</h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>Rate each dimension honestly (1–10)</p>
            </div>
            <div className="space-y-4">
              {SCORE_DIMS.map(({ id, label, desc }) => {
                const val = review[id as keyof DailyReview] as number
                const color = val >= 8 ? "#34d399" : val >= 6 ? "#60a5fa" : val >= 4 ? "#fbbf24" : "#f87171"
                return (
                  <div key={id}>
                    <div className="flex justify-between text-sm mb-1">
                      <div><span className="font-medium">{label}</span>
                        <span className="text-xs ml-2" style={{ color: "var(--color-muted-foreground)" }}>{desc}</span>
                      </div>
                      <span className="font-bold text-base" style={{ color }}>{val}</span>
                    </div>
                    <input type="range" min={1} max={10} value={val}
                      onChange={(e) => setValue(id as keyof DailyReview, parseInt(e.target.value))}
                      className="w-full accent-primary" id={`score-${id}`} />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="btn-secondary gap-1.5 text-sm" id="reflect-prev">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          {isLastStep ? (
            <button onClick={handleSave} disabled={aiLoading || saved}
              className={`btn-primary gap-2 ${saved ? "opacity-90" : ""}`} id="reflect-save">
              {aiLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>
                : saved ? <><Check className="h-4 w-4" /> Saved!</>
                : "Save + AI Review"}
            </button>
          ) : (
            <button onClick={() => setStep(step + 1)} className="btn-primary gap-1.5 text-sm" id="reflect-next">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {saved && review.ai_review && (
        <div className="glass-card p-4 mt-4 animate-slide-up"
          style={{ borderColor: "rgba(96,165,250,0.3)", backgroundColor: "rgba(96,165,250,0.05)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-primary)" }}>AI MENTOR FEEDBACK</p>
          <p className="text-sm whitespace-pre-line" style={{ color: "var(--color-muted-foreground)" }}>{review.ai_review}</p>
        </div>
      )}
    </div>
  )
}
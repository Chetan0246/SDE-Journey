"use client"

import { useState } from "react"
import { STUDY_SCHEDULE, COLLEGE_BLOCKS, DAILY_TARGETS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/schedule-data"
import { format } from "date-fns"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function minutesToHm(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export default function SchedulePage() {
  const today = new Date().getDay() // 0=Sun ... 6=Sat
  const [selectedDay, setSelectedDay] = useState(today)

  const isWeekend = selectedDay === 0 || selectedDay === 6

  const todayCollegeBlocks = COLLEGE_BLOCKS.filter(b => b.days.includes(selectedDay))
  const todayStudyBlocks = STUDY_SCHEDULE.filter(b => b.days.includes(selectedDay))

  // All blocks sorted by start time
  const allBlocks = [...todayCollegeBlocks, ...todayStudyBlocks].sort((a, b) =>
    a.start.localeCompare(b.start)
  )

  const studyMinutes = todayStudyBlocks.reduce((s, b) => s + b.duration, 0)

  return (
    <div className="page-container animate-fade-in space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Daily Schedule</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
          Study windows built around your college timetable · {format(new Date(), "EEEE, MMM d")}
        </p>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {DAYS.map((day, i) => (
          <button
            key={day}
            id={`day-${day.toLowerCase()}`}
            onClick={() => setSelectedDay(i)}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: selectedDay === i ? "var(--color-primary)" : "var(--color-accent)",
              color: selectedDay === i ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
              border: i === today && selectedDay !== i ? "1px solid var(--color-primary)" : "1px solid transparent",
            }}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Daily targets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>DSA Target</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(210 100% 66%)" }}>
            {isWeekend ? DAILY_TARGETS.dsaWeekend : DAILY_TARGETS.dsa}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>problems</p>
        </div>
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Study Time</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(142 71% 45%)" }}>
            {minutesToHm(studyMinutes)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>available</p>
        </div>
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Backend</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(142 71% 45%)" }}>
            {minutesToHm(DAILY_TARGETS.backend)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Spring Boot</p>
        </div>
        <div className="metric-card">
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Projects</p>
          <p className="text-2xl font-bold" style={{ color: "hsl(280 65% 65%)" }}>
            {minutesToHm(DAILY_TARGETS.projects)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>build time</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-4 space-y-2">
        <h2 className="section-heading mb-3">Today&apos;s Timeline</h2>
        {allBlocks.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-muted-foreground)" }}>
            No blocks for this day.
          </p>
        ) : (
          <div className="space-y-2">
            {allBlocks.map((block, i) => {
              const isCollege = block.category === "college"
              const color = CATEGORY_COLORS[block.category]
              return (
                <div key={i} className="flex gap-3 items-start">
                  {/* Time */}
                  <div className="text-right shrink-0 pt-0.5" style={{ width: "4.5rem" }}>
                    <p className="text-xs font-mono font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                      {block.start}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: "var(--color-muted-foreground)", opacity: 0.6 }}>
                      {block.end}
                    </p>
                  </div>

                  {/* Bar */}
                  <div className="w-1 rounded-full shrink-0 self-stretch mt-1" style={{ backgroundColor: color, minHeight: "2.5rem" }} />

                  {/* Content */}
                  <div className="flex-1 rounded-lg p-2.5"
                    style={{ backgroundColor: isCollege ? "rgba(100,100,100,0.08)" : `${color.replace("hsl(", "hsl(").replace(")", " / 0.08)")}` }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium"
                        style={{ color: isCollege ? "var(--color-muted-foreground)" : "var(--color-foreground)" }}>
                        {block.label}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: `${color} / 0.15`, color }}>
                        {minutesToHm(block.duration)}
                      </span>
                    </div>
                    {!isCollege && (
                      <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                        {block.focus}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Category legend */}
      <div className="glass-card p-4">
        <h2 className="section-heading mb-3">Focus Areas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(CATEGORY_LABELS).filter(([k]) => k !== "college" && k !== "break").map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[key] }} />
              <span className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Study principle */}
      <div className="glass-card p-4 border-l-4" style={{ borderLeftColor: "var(--color-primary)" }}>
        <p className="text-sm font-semibold mb-1">The Rule</p>
        <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          College runs 8 AM–7 PM. You have <strong>3 guaranteed windows</strong> daily:
          early morning for DSA, lunch for CS theory, evening for backend + project.
          Missing any one of these is acceptable once. Missing all three is a wasted day.
        </p>
      </div>
    </div>
  )
}

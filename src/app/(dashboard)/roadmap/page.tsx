"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import {
  loadRoadmap, saveRoadmapStatus, getRoadmapProgress,
  type RoadmapSection, type RoadmapItem, type RoadmapStatus,
} from "@/lib/roadmap-data"

const STATUS_CYCLE: RoadmapStatus[] = ["not_started", "in_progress", "done"]

function statusNext(s: RoadmapStatus): RoadmapStatus {
  const i = STATUS_CYCLE.indexOf(s)
  return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length]
}

function StatusIcon({ status }: { status: RoadmapStatus }) {
  if (status === "done") return <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "hsl(142 71% 50%)" }} />
  if (status === "in_progress") return <Clock className="h-4 w-4 shrink-0" style={{ color: "hsl(45 93% 55%)" }} />
  return <Circle className="h-4 w-4 shrink-0" style={{ color: "var(--color-muted-foreground)" }} />
}

function RoadmapItemRow({ item, onToggle }: { item: RoadmapItem; onToggle: (id: string) => void }) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className="w-full text-left flex items-start gap-3 p-3 rounded-lg transition-all"
      style={{
        backgroundColor: item.status === "done"
          ? "rgba(34,197,94,0.05)"
          : item.status === "in_progress"
          ? "rgba(234,179,8,0.05)"
          : "transparent",
      }}
      title="Click to cycle: not started → in progress → done"
    >
      <div className="mt-0.5">
        <StatusIcon status={item.status} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{
          color: item.status === "done" ? "var(--color-muted-foreground)" : "var(--color-foreground)",
          textDecoration: item.status === "done" ? "line-through" : "none",
        }}>
          {item.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
          {item.description}
        </p>
      </div>
    </button>
  )
}

function SectionCard({ section, onToggle }: { section: RoadmapSection; onToggle: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const done = section.items.filter(i => i.status === "done").length
  const inProg = section.items.filter(i => i.status === "in_progress").length
  const pct = Math.round((done / section.items.length) * 100)

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 transition-all hover:opacity-90"
        id={`roadmap-section-${section.id}`}
      >
        <span className="text-xl">{section.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{section.title}</span>
            {inProg > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "rgba(234,179,8,0.15)", color: "hsl(45 93% 65%)" }}>
                {inProg} IN PROGRESS
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: section.color }} />
            </div>
            <span className="text-xs tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>
              {done}/{section.items.length}
            </span>
          </div>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--color-muted-foreground)" }} />
          : <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--color-muted-foreground)" }} />
        }
      </button>

      {open && (
        <div className="border-t divide-y" style={{ borderColor: "var(--color-border)", borderTopColor: "var(--color-border)" }}>
          {section.items.map(item => (
            <div key={item.id} style={{ borderColor: "var(--color-border)" }}>
              <RoadmapItemRow item={item} onToggle={onToggle} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoadmapPage() {
  const [sections, setSections] = useState<RoadmapSection[]>(() => loadRoadmap())
  const progress = getRoadmapProgress(sections)

  function handleToggle(itemId: string) {
    setSections(prev => {
      const next = prev.map(section => ({
        ...section,
        items: section.items.map(item => {
          if (item.id !== itemId) return item
          const newStatus = statusNext(item.status)
          saveRoadmapStatus(itemId, newStatus)
          return { ...item, status: newStatus }
        }),
      }))
      return next
    })
  }

  return (
    <div className="page-container animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight gradient-text">Java Backend Roadmap</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Spring Boot developer path — roadmap.sh · Click any item to update progress
          </p>
        </div>
        <a
          href="https://roadmap.sh/spring-boot"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary gap-1.5 text-xs shrink-0"
          id="roadmap-external-link"
        >
          <ExternalLink className="h-3.5 w-3.5" /> roadmap.sh
        </a>
      </div>

      {/* Overall progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
            {progress.pct}%
          </span>
        </div>
        <div className="h-2 rounded-full" style={{ backgroundColor: "var(--color-accent)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress.pct}%`, background: "linear-gradient(to right, hsl(142 71% 45%), hsl(210 100% 66%))" }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          <span>
            <span className="font-semibold" style={{ color: "hsl(142 71% 50%)" }}>{progress.done}</span> done
          </span>
          <span>
            <span className="font-semibold" style={{ color: "hsl(45 93% 55%)" }}>{progress.inProgress}</span> in progress
          </span>
          <span>
            <span className="font-semibold" style={{ color: "var(--color-foreground)" }}>
              {progress.total - progress.done - progress.inProgress}
            </span> not started
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
        <span className="flex items-center gap-1.5"><Circle className="h-3.5 w-3.5" /> Not started</span>
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" style={{ color: "hsl(45 93% 55%)" }} /> In progress</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" style={{ color: "hsl(142 71% 50%)" }} /> Done</span>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map(section => (
          <SectionCard key={section.id} section={section} onToggle={handleToggle} />
        ))}
      </div>
    </div>
  )
}

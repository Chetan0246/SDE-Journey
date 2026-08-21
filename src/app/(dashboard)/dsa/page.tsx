"use client"

import { useState, useEffect, useMemo } from "react"
import { ExternalLink, Check, ChevronDown, ChevronUp, Search } from "lucide-react"
import { getDSAProblems, saveDSAProblems, updateDSAProblem, type DSAProblem, type DSATopic } from "@/lib/store"
import { buildNeetCode150 } from "@/lib/neetcode-150"
import { todayStr } from "@/lib/utils"
import { cn } from "@/lib/utils"

const TOPICS: DSATopic[] = [
  "Arrays & Hashing","Two Pointers","Sliding Window","Stack","Binary Search",
  "Linked List","Trees","Tries","Heap","Backtracking","Graphs","Advanced Graphs",
  "1-D DP","2-D DP","Greedy","Intervals","Math & Geometry","Bit Manipulation"
]

const DIFF_COLOR: Record<string, string> = {
  easy: "#34d399", medium: "#fbbf24", hard: "#f87171"
}

export default function DSAPage() {
  const [problems, setProblems] = useState<DSAProblem[]>([])
  const [selectedTopic, setSelectedTopic] = useState<DSATopic | "All">("All")
  const [search, setSearch] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    let p = getDSAProblems()
    if (p.length === 0) {
      p = buildNeetCode150()
      saveDSAProblems(p)
    }
    setProblems(p)
  }, [])

  function toggleSolved(id: string) {
    const p = problems.find((x) => x.id === id)
    if (!p) return
    const updates: Partial<DSAProblem> = p.date_solved
      ? { date_solved: null, is_mastered: false }
      : { date_solved: todayStr(), is_mastered: false }
    updateDSAProblem(id, updates)
    setProblems(getDSAProblems())
  }

  function updateNote(id: string, notes: string) {
    updateDSAProblem(id, { notes })
    setProblems(getDSAProblems())
  }

  function updateConf(id: string, confidence: 1|2|3|4|5) {
    updateDSAProblem(id, { confidence })
    setProblems(getDSAProblems())
  }

  const filtered = useMemo(() =>
    problems.filter((p) =>
      (selectedTopic === "All" || p.topic === selectedTopic) &&
      (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
    ), [problems, selectedTopic, search])

  const solved = problems.filter((p) => p.date_solved !== null).length
  const total = problems.length

  const topicStats = useMemo(() =>
    TOPICS.map((t) => {
      const all = problems.filter((p) => p.topic === t)
      const done = all.filter((p) => p.date_solved).length
      return { topic: t, total: all.length, done }
    }), [problems])

  return (
    <div className="page-container space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">DSA Tracker</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
          NeetCode 150 · <span className="font-semibold" style={{ color: "var(--color-primary)" }}>{solved}</span> / {total} solved
        </p>
      </div>

      {/* Overall progress */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-accent)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(solved/total)*100}%`, background: "linear-gradient(to right, var(--color-primary), #34d399)" }} />
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{Math.round((solved/total)*100)}%</span>
        </div>
      </div>

      {/* Topic chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSelectedTopic("All")} id="topic-all"
          className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all border",
            selectedTopic === "All"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-border/60")}>
          All ({total})
        </button>
        {topicStats.map(({ topic, total: t, done }) => (
          <button key={topic} onClick={() => setSelectedTopic(topic)} id={`topic-${topic.replace(/\s/g,"-")}`}
            className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all border",
              selectedTopic === topic
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-border/60")}>
            {topic} <span className={done === t ? "text-emerald-400" : ""}>{done}/{t}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
        <input className="form-input pl-9" placeholder="Search problems…" value={search}
          onChange={(e) => setSearch(e.target.value)} id="dsa-search" />
      </div>

      {/* Problem list */}
      <div className="glass-card divide-y">
        {filtered.map((p) => {
          const isSolved = p.date_solved !== null
          const isOpen = expanded === p.id
          return (
            <div key={p.id}>
              <div className="flex items-center gap-3 p-3">
                {/* Checkbox */}
                <button onClick={() => toggleSolved(p.id)}
                  className="h-5 w-5 rounded flex items-center justify-center shrink-0 transition-all"
                  style={{
                    backgroundColor: isSolved ? "#34d399" : "var(--color-accent)",
                    border: isSolved ? "none" : "1px solid var(--color-border)",
                  }} id={`solve-${p.id}`}>
                  {isSolved && <Check className="h-3 w-3 text-white" />}
                </button>

                {/* Name */}
                <span className={cn("flex-1 text-sm font-medium", isSolved ? "line-through opacity-50" : "")}>
                  {p.name}
                </span>

                {/* Difficulty */}
                <span className="text-[11px] font-semibold uppercase"
                  style={{ color: DIFF_COLOR[p.difficulty] }}>{p.difficulty}</span>

                {/* LeetCode link */}
                <a href={p.url} target="_blank" rel="noopener noreferrer" id={`link-${p.id}`}
                  className="p-1 rounded transition-colors hover:bg-accent"
                  style={{ color: "var(--color-muted-foreground)" }}>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {/* Expand notes */}
                <button onClick={() => setExpanded(isOpen ? null : p.id)} id={`expand-${p.id}`}
                  className="p-1 rounded transition-colors hover:bg-accent"
                  style={{ color: "var(--color-muted-foreground)" }}>
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {isOpen && (
                <div className="px-4 pb-3 space-y-2 animate-slide-up">
                  <div className="flex items-center gap-3 text-xs">
                    <span style={{ color: "var(--color-muted-foreground)" }}>Confidence:</span>
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => updateConf(p.id, n as 1|2|3|4|5)}
                        className="w-6 h-6 rounded font-medium transition-all"
                        style={{
                          backgroundColor: p.confidence >= n ? "var(--color-primary)" : "var(--color-accent)",
                          color: p.confidence >= n ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                        }} id={`conf-${p.id}-${n}`}>{n}</button>
                    ))}
                    {isSolved && <span className="ml-auto" style={{ color: "var(--color-muted-foreground)" }}>Solved: {p.date_solved}</span>}
                  </div>
                  <textarea rows={2} className="form-input text-xs"
                    placeholder="Notes, patterns, gotchas…" value={p.notes}
                    onChange={(e) => updateNote(p.id, e.target.value)}
                    id={`notes-${p.id}`} />
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            No problems match.
          </div>
        )}
      </div>
    </div>
  )
}
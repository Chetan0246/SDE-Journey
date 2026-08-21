"use client"

import { useState, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Profile {
  placement_date: string        // "2027-08-21"
  dsa_target: number            // 150
  skills: Skill[]
}

export interface Skill {
  id: string
  name: string
  current_level: number         // 0–100
  initial_level: number         // snapshot when first set, for velocity
  category: string
  sort_order: number
  history: { date: string; level: number }[]
}

export type TaskCategory =
  | "DSA" | "Java" | "Spring Boot" | "SQL" | "CS Fundamentals"
  | "Project" | "AI" | "College" | "Internship/Placement" | "Personal" | "Other"

export interface Task {
  id: string
  name: string
  category: TaskCategory
  priority: 1 | 2 | 3
  estimated_duration: number    // minutes
  planned_start: string
  planned_end: string
  sort_order: number
}

export type TaskStatus = "completed" | "partial" | "skipped" | "rescheduled"

export interface TaskLog {
  task_id: string | null
  name: string
  category: string
  status: TaskStatus
  actual_duration: number       // minutes
  completion_percent: number    // 0–100
  is_unplanned: boolean
}

export interface DailyPlan {
  date: string
  planned_hours: number
  actual_hours: number
  status: "excellent" | "good" | "average" | "poor" | "not_logged"
}

export interface DailyReview {
  date: string
  most_valuable: string
  failed_task: string
  failure_reasons: string[]
  learnings: string
  mistake_to_avoid: string
  tomorrow_one_thing: string
  score_focus: number
  score_discipline: number
  score_learning: number
  score_productivity: number
  score_technical: number
  score_energy: number
  overall_score: number
  ai_review: string | null
  ai_tomorrow_plan: { name: string; category: string; duration: number }[] | null
}

export type DSATopic =
  | "Arrays & Hashing" | "Two Pointers" | "Sliding Window" | "Stack"
  | "Binary Search" | "Linked List" | "Trees" | "Tries" | "Heap"
  | "Backtracking" | "Graphs" | "Advanced Graphs" | "1-D DP" | "2-D DP"
  | "Greedy" | "Intervals" | "Math & Geometry" | "Bit Manipulation"

export interface DSAProblem {
  id: string
  name: string
  topic: DSATopic
  difficulty: "easy" | "medium" | "hard"
  url: string
  date_solved: string | null
  time_taken: number | null
  solved_independently: boolean
  needed_hint: boolean
  needed_solution: boolean
  reattempt_date: string | null
  confidence: 1 | 2 | 3 | 4 | 5
  is_mastered: boolean
  notes: string
}

export interface Project {
  id: string
  name: string
  goal: string
  technologies: string[]
  deployment_status: string
  github_url: string
  tasks: { id: string; title: string; status: "todo" | "in_progress" | "completed" }[]
  bugs: { id: string; title: string; is_resolved: boolean }[]
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  profile: "sde_profile",
  plans: "sde_plans",
  tasks: "sde_tasks",
  task_logs: "sde_task_logs",
  reviews: "sde_reviews",
  dsa: "sde_dsa_problems",
  projects: "sde_projects",
} as const

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SKILLS: Skill[] = [
  { id: "java",     name: "Java",                   current_level: 0, initial_level: 0, category: "Technical", sort_order: 1, history: [] },
  { id: "dsa",      name: "DSA",                    current_level: 0, initial_level: 0, category: "Technical", sort_order: 2, history: [] },
  { id: "sql",      name: "SQL",                    current_level: 0, initial_level: 0, category: "Technical", sort_order: 3, history: [] },
  { id: "spring",   name: "Spring Boot",            current_level: 0, initial_level: 0, category: "Technical", sort_order: 4, history: [] },
  { id: "postgres", name: "PostgreSQL",             current_level: 0, initial_level: 0, category: "Technical", sort_order: 5, history: [] },
  { id: "backend",  name: "Backend Engineering",    current_level: 0, initial_level: 0, category: "Technical", sort_order: 6, history: [] },
  { id: "system",   name: "System Design",          current_level: 0, initial_level: 0, category: "Technical", sort_order: 7, history: [] },
  { id: "cs",       name: "CS Fundamentals",        current_level: 0, initial_level: 0, category: "Technical", sort_order: 8, history: [] },
  { id: "docker",   name: "Docker/Cloud",           current_level: 0, initial_level: 0, category: "Technical", sort_order: 9, history: [] },
  { id: "ai",       name: "AI-assisted Engineering",current_level: 0, initial_level: 0, category: "Technical", sort_order: 10, history: [] },
]

export const DEFAULT_PROFILE: Profile = {
  placement_date: "2027-08-21",
  dsa_target: 150,
  skills: DEFAULT_SKILLS,
}

// ─── Raw get/set ───────────────────────────────────────────────────────────────

export function readStore<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch {
    return defaultValue
  }
}

export function writeStore<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

// Typed accessors ──────────────────────────────────────────────────────────────

export function getProfile(): Profile {
  return readStore(KEYS.profile, DEFAULT_PROFILE)
}
export function saveProfile(p: Profile) { writeStore(KEYS.profile, p) }

export function getPlans(): Record<string, DailyPlan> {
  return readStore(KEYS.plans, {})
}
export function savePlans(p: Record<string, DailyPlan>) { writeStore(KEYS.plans, p) }
export function getPlan(date: string): DailyPlan | null {
  return getPlans()[date] ?? null
}
export function upsertPlan(plan: DailyPlan) {
  const plans = getPlans()
  plans[plan.date] = plan
  savePlans(plans)
}

export function getTasks(date: string): Task[] {
  return readStore<Record<string, Task[]>>(KEYS.tasks, {})[date] ?? []
}
export function saveTasks(date: string, tasks: Task[]) {
  const all = readStore<Record<string, Task[]>>(KEYS.tasks, {})
  all[date] = tasks
  writeStore(KEYS.tasks, all)
}

export function getTaskLogs(date: string): TaskLog[] {
  return readStore<Record<string, TaskLog[]>>(KEYS.task_logs, {})[date] ?? []
}
export function saveTaskLogs(date: string, logs: TaskLog[]) {
  const all = readStore<Record<string, TaskLog[]>>(KEYS.task_logs, {})
  all[date] = logs
  writeStore(KEYS.task_logs, all)
}

export function getReview(date: string): DailyReview | null {
  return readStore<Record<string, DailyReview>>(KEYS.reviews, {})[date] ?? null
}
export function saveReview(review: DailyReview) {
  const all = readStore<Record<string, DailyReview>>(KEYS.reviews, {})
  all[review.date] = review
  writeStore(KEYS.reviews, all)
}
export function getAllReviews(): Record<string, DailyReview> {
  return readStore(KEYS.reviews, {})
}

export function getDSAProblems(): DSAProblem[] {
  return readStore(KEYS.dsa, [])
}
export function saveDSAProblems(problems: DSAProblem[]) {
  writeStore(KEYS.dsa, problems)
}
export function updateDSAProblem(id: string, updates: Partial<DSAProblem>) {
  const problems = getDSAProblems()
  const idx = problems.findIndex((p) => p.id === id)
  if (idx !== -1) {
    problems[idx] = { ...problems[idx], ...updates }
    saveDSAProblems(problems)
  }
}

export function getProjects(): Project[] {
  return readStore(KEYS.projects, [])
}
export function saveProjects(projects: Project[]) {
  writeStore(KEYS.projects, projects)
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export function exportAllData(): string {
  const data: Record<string, unknown> = {}
  Object.values(KEYS).forEach((k) => {
    const raw = localStorage.getItem(k)
    if (raw) data[k] = JSON.parse(raw)
  })
  return JSON.stringify(data, null, 2)
}

export function importAllData(json: string): void {
  const data = JSON.parse(json) as Record<string, unknown>
  Object.entries(data).forEach(([k, v]) => {
    localStorage.setItem(k, JSON.stringify(v))
  })
}

// ─── Derived analytics helpers ────────────────────────────────────────────────

export interface DailyStats {
  date: string
  plannedHours: number
  actualHours: number
  completionPct: number
  status: string
}

export function getLast30DaysStats(): DailyStats[] {
  const plans = getPlans()
  const result: DailyStats[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const plan = plans[dateStr]
    result.push({
      date: dateStr,
      plannedHours: plan?.planned_hours ?? 0,
      actualHours: plan?.actual_hours ?? 0,
      completionPct: plan?.planned_hours ? (plan.actual_hours / plan.planned_hours) * 100 : 0,
      status: plan?.status ?? "not_logged",
    })
  }
  return result
}

export function getAllLoggedDays(): DailyPlan[] {
  return Object.values(getPlans()).filter((p) => p.status !== "not_logged")
}

// ─── useStore hook ────────────────────────────────────────────────────────────

export function useStore<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  // Lazy initializer: reads localStorage once on mount, no extra render
  const [value, setValue] = useState<T>(() => readStore<T>(key, defaultValue))

  const set = useCallback((v: T) => {
    writeStore(key, v)
    setValue(v)
  }, [key])

  return [value, set]
}

// Convenience typed hooks
export function useProfile() {
  const [profile, setProfile] = useStore(KEYS.profile, DEFAULT_PROFILE)
  return { profile, setProfile }
}
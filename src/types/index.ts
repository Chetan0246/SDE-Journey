export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DayStatus = "excellent" | "good" | "average" | "poor" | "not_logged"
export type TaskStatus = "todo" | "completed" | "partial" | "skipped" | "rescheduled"
export type ProjectTaskStatus = "todo" | "in_progress" | "completed"
export type Difficulty = "easy" | "medium" | "hard"
export type DSAPlatform = "LeetCode" | "CodeForces" | "HackerRank" | "GeeksForGeeks" | "Other"

export type TaskCategory =
  | "DSA"
  | "Java"
  | "Spring Boot"
  | "SQL"
  | "CS Fundamentals"
  | "Project"
  | "AI"
  | "College"
  | "Internship/Placement"
  | "Personal"
  | "Other"

export type DSATopic =
  | "Arrays"
  | "Hashing"
  | "Two Pointers"
  | "Sliding Window"
  | "Stack"
  | "Binary Search"
  | "Linked List"
  | "Trees"
  | "Heap"
  | "Graphs"
  | "Greedy"
  | "Backtracking"
  | "Dynamic Programming"

export type DistractionCategory =
  | "Social Media"
  | "YouTube"
  | "Gaming"
  | "Random Browsing"
  | "Phone"
  | "Other"

export interface User {
  id: string
  email: string
  created_at: string
  placement_target_date: string | null
  dsa_target: number
}

export interface DailyPlan {
  id: string
  user_id: string
  date: string
  planned_hours: number
  actual_hours: number | null
  status: DayStatus
  created_at: string
}

export interface Task {
  id: string
  daily_plan_id: string
  user_id: string
  name: string
  category: TaskCategory
  priority: 1 | 2 | 3
  estimated_duration: number // minutes
  planned_start: string | null
  planned_end: string | null
  sort_order: number
  created_at: string
}

export interface TaskLog {
  id: string
  task_id: string
  user_id: string
  date: string
  status: TaskStatus
  actual_duration: number | null // minutes
  completion_percent: number | null
  is_unplanned: boolean
  category: TaskCategory | null
  notes: string | null
  created_at: string
}

export interface TimeLog {
  id: string
  daily_plan_id: string
  user_id: string
  date: string
  category: string
  minutes: number
  is_productive: boolean
  created_at: string
}

export interface DailyReview {
  id: string
  daily_plan_id: string
  user_id: string
  date: string
  // Reflection answers
  most_valuable: string | null
  failed_task: string | null
  failure_reasons: string[]
  learnings: string | null
  mistake_to_avoid: string | null
  tomorrow_one_thing: string | null
  // Self-assessment scores 1-10
  score_focus: number | null
  score_discipline: number | null
  score_learning: number | null
  score_productivity: number | null
  score_technical: number | null
  score_energy: number | null
  overall_score: number | null
  // AI review
  ai_review: AiReview | null
  ai_tomorrow_plan: SuggestedTask[] | null
  created_at: string
}

export interface AiReview {
  reality_check: string
  patterns: string[]
  root_cause: string
  career_alignment: string
  recommendations: string[]
}

export interface SuggestedTask {
  name: string
  category: TaskCategory
  duration: number // minutes
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Skill {
  id: string
  user_id: string
  name: string
  current_level: number // 0-100
  target_level: number
  category: string
  sort_order: number
  created_at: string
}

export interface DSAProblem {
  id: string
  user_id: string
  name: string
  platform: DSAPlatform
  topic: DSATopic
  difficulty: Difficulty
  url: string | null
  date_solved: string
  time_taken: number | null // minutes
  solved_independently: boolean
  needed_hint: boolean
  needed_solution: boolean
  reattempt_date: string | null
  confidence: 1 | 2 | 3 | 4 | 5
  is_mastered: boolean
  notes: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  goal: string | null
  architecture: string | null
  technologies: string[]
  deployment_status: string | null
  github_url: string | null
  is_active: boolean
  created_at: string
}

export interface ProjectTask {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  status: ProjectTaskStatus
  sort_order: number
  created_at: string
}

export interface ProjectBug {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  is_resolved: boolean
  created_at: string
}

export interface DistractionLog {
  id: string
  user_id: string
  date: string
  category: DistractionCategory
  duration: number // minutes
  is_intentional: boolean
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string
  week_end: string
  planned_hours: number
  actual_hours: number
  completion_percent: number
  avg_daily_hours: number
  most_productive_day: string | null
  least_productive_day: string | null
  most_common_distraction: string | null
  most_skipped_category: string | null
  most_consistent_habit: string | null
  category_breakdown: Record<string, number>
  ai_assessment: WeeklyAiAssessment | null
  created_at: string
}

export interface WeeklyAiAssessment {
  improved: string
  worsened: string
  bottleneck: string
  change_next_week: string
  one_priority: string
}

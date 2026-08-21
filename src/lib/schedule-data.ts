// College timetable analysis — free study windows
// Timetable runs Mon-Fri 8:00-19:00, Sat/Sun lighter

export interface StudyBlock {
  label: string
  start: string // "HH:MM"
  end: string
  duration: number // minutes
  focus: string
  category: "dsa" | "backend" | "projects" | "cs" | "review" | "college" | "break"
  days: number[] // 0=Sun, 1=Mon, ... 6=Sat
}

// These are the FIXED college class windows (blocked time)
export const COLLEGE_BLOCKS: StudyBlock[] = [
  { label: "College — Morning", start: "08:00", end: "12:31", duration: 271, focus: "Classes", category: "college", days: [1, 2, 3, 4, 5] },
  { label: "College — Afternoon", start: "14:00", end: "19:00", duration: 300, focus: "Classes / Lab", category: "college", days: [1, 2, 3, 4, 5] },
  { label: "College (Light)", start: "08:00", end: "12:30", duration: 270, focus: "Classes", category: "college", days: [6] },
]

// Recommended STUDY blocks around the timetable
export const STUDY_SCHEDULE: StudyBlock[] = [
  {
    label: "🌅 DSA Morning Grind",
    start: "05:30",
    end: "07:45",
    duration: 135,
    focus: "2 LeetCode problems (NeetCode 150 order). No hints for 30 min.",
    category: "dsa",
    days: [1, 2, 3, 4, 5],
  },
  {
    label: "🍱 Lunch Review",
    start: "12:35",
    end: "13:45",
    duration: 70,
    focus: "CS Fundamentals (OS / DBMS / Networks). Read, not code.",
    category: "cs",
    days: [1, 2, 3, 4, 5],
  },
  {
    label: "🌙 Backend Deep Work",
    start: "19:30",
    end: "21:30",
    duration: 120,
    focus: "Spring Boot learning — follow roadmap section, build mini feature.",
    category: "backend",
    days: [1, 2, 3, 4, 5],
  },
  {
    label: "🔨 Project Build",
    start: "21:30",
    end: "22:30",
    duration: 60,
    focus: "Work on portfolio project (implement today's Spring Boot concept).",
    category: "projects",
    days: [1, 2, 3, 4, 5],
  },
  {
    label: "⚡ Weekend DSA Block",
    start: "08:00",
    end: "10:30",
    duration: 150,
    focus: "5 LeetCode problems — focus on the week's weak topic.",
    category: "dsa",
    days: [0, 6],
  },
  {
    label: "🚀 Weekend Deep Dive",
    start: "11:00",
    end: "14:00",
    duration: 180,
    focus: "Spring Boot project or system design study.",
    category: "backend",
    days: [0, 6],
  },
  {
    label: "📐 Weekend System Design",
    start: "15:00",
    end: "16:30",
    duration: 90,
    focus: "One full system design case (URL shortener, Twitter, etc.).",
    category: "cs",
    days: [0, 6],
  },
  {
    label: "📋 Weekly Review",
    start: "20:00",
    end: "21:00",
    duration: 60,
    focus: "Review week's progress. Update roadmap statuses. Plan next week.",
    category: "review",
    days: [0], // Sunday evening
  },
]

export const DAILY_TARGETS = {
  dsa: 2,          // problems per weekday
  dsaWeekend: 5,   // problems per weekend day
  backend: 120,    // minutes
  projects: 60,    // minutes
  cs: 60,          // minutes
  total: 360,      // total study minutes per weekday
}

export const CATEGORY_COLORS: Record<string, string> = {
  dsa:      "hsl(210 100% 66%)",
  backend:  "hsl(142 71% 45%)",
  projects: "hsl(280 65% 65%)",
  cs:       "hsl(45 93% 55%)",
  review:   "hsl(200 80% 55%)",
  college:  "hsl(0 0% 35%)",
  break:    "hsl(0 0% 25%)",
}

export const CATEGORY_LABELS: Record<string, string> = {
  dsa:      "DSA",
  backend:  "Spring Boot",
  projects: "Projects",
  cs:       "CS Fundamentals",
  review:   "Review",
  college:  "College",
  break:    "Break",
}

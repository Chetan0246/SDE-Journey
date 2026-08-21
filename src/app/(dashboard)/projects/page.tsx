"use client"

import { useState } from "react"
import { Plus, CheckCircle2, Circle, Clock, Trash2 } from "lucide-react"
import { getProjects, saveProjects, type Project } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === "undefined") return []
    return getProjects()
  })
  const [selected, setSelected] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    const p = getProjects()
    return p.length > 0 ? p[0].id : null
  })
  const [newName, setNewName] = useState("")
  const [newTask, setNewTask] = useState("")

  function save(p: Project[]) { setProjects(p); saveProjects(p) }

  function addProject() {
    if (!newName.trim()) return
    const p: Project = {
      id: crypto.randomUUID(), name: newName, goal: "",
      technologies: [], deployment_status: "In Progress",
      github_url: "", tasks: [], bugs: [],
    }
    save([...projects, p])
    setSelected(p.id)
    setNewName("")
  }

  const project = projects.find((p) => p.id === selected)

  function updateProject(id: string, upd: Partial<Project>) {
    save(projects.map((p) => (p.id === id ? { ...p, ...upd } : p)))
  }

  function addTask() {
    if (!newTask.trim() || !project) return
    const tasks = [...project.tasks, { id: crypto.randomUUID(), title: newTask, status: "todo" as const }]
    updateProject(project.id, { tasks })
    setNewTask("")
  }

  function cycleTaskStatus(projectId: string, taskId: string) {
    const p = projects.find((x) => x.id === projectId)!
    const cycle: Record<string, "todo"|"in_progress"|"completed"> = { todo: "in_progress", in_progress: "completed", completed: "todo" }
    const tasks = p.tasks.map((t) => (t.id === taskId ? { ...t, status: cycle[t.status] } : t))
    updateProject(projectId, { tasks })
  }

  function removeTask(projectId: string, taskId: string) {
    const p = projects.find((x) => x.id === projectId)!
    updateProject(projectId, { tasks: p.tasks.filter((t) => t.id !== taskId) })
  }

  const STATUS_ICON: Record<string, React.ElementType> = { todo: Circle, in_progress: Clock, completed: CheckCircle2 }
  const STATUS_COLOR: Record<string, string> = { todo: "var(--color-muted-foreground)", in_progress: "#60a5fa", completed: "#34d399" }

  return (
    <div className="page-container space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Projects</h1>

      {/* Project tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {projects.map((p) => (
          <button key={p.id} onClick={() => setSelected(p.id)} id={`proj-${p.id}`}
            className={cn("rounded-lg px-3 py-1.5 text-sm font-medium transition-all border",
              selected === p.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-border/60")}>
            {p.name}
          </button>
        ))}
        <div className="flex gap-2">
          <input className="form-input text-sm w-44" placeholder="New project…" value={newName}
            onChange={(e) => setNewName(e.target.value)} id="new-project-input"
            onKeyDown={(e) => e.key === "Enter" && addProject()} />
          <button onClick={addProject} className="btn-secondary text-sm" id="add-project-btn">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!project ? (
        <div className="glass-card py-16 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
          Create a project to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Project meta */}
          <div className="glass-card p-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>Goal</label>
              <input className="form-input mt-1 text-sm" value={project.goal}
                onChange={(e) => updateProject(project.id, { goal: e.target.value })}
                placeholder="What should this project achieve?" id="proj-goal" />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>Tech Stack (comma-sep)</label>
              <input className="form-input mt-1 text-sm" value={project.technologies.join(", ")}
                onChange={(e) => updateProject(project.id, { technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="Java, Spring Boot, PostgreSQL" id="proj-tech" />
            </div>
          </div>

          {/* Kanban */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <input className="form-input flex-1 text-sm" placeholder="Add a task…" value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()} id="proj-task-input" />
              <button onClick={addTask} className="btn-secondary" id="add-task-btn">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(["todo", "in_progress", "completed"] as const).map((status) => {
                const Icon = STATUS_ICON[status]
                const colTasks = project.tasks.filter((t) => t.status === status)
                const labels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", completed: "Done" }
                return (
                  <div key={status} className="rounded-xl p-3 space-y-2"
                    style={{ backgroundColor: "var(--color-accent)" }}>
                    <div className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: STATUS_COLOR[status] }}>
                      <Icon className="h-3.5 w-3.5" /> {labels[status]}
                      <span className="ml-auto text-xs" style={{ color: "var(--color-muted-foreground)" }}>{colTasks.length}</span>
                    </div>
                    {colTasks.map((t) => (
                      <div key={t.id} className="rounded-lg p-2 text-xs flex items-start justify-between gap-1"
                        style={{ backgroundColor: "var(--color-card)" }}>
                        <button className="text-left flex-1 leading-relaxed"
                          onClick={() => cycleTaskStatus(project.id, t.id)} id={`task-cycle-${t.id}`}>
                          {t.title}
                        </button>
                        <button onClick={() => removeTask(project.id, t.id)} id={`task-del-${t.id}`}
                          style={{ color: "var(--color-muted-foreground)" }} className="hover:text-red-400 transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
interface Skill {
  id: string
  name: string
  current_level: number
  target_level: number
}

export function SkillsGrid({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) {
    return <p className="text-sm text-muted-foreground">No skills found. Add them in Settings.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {skills.map((skill) => {
        const pct = Math.round((skill.current_level / Math.max(skill.target_level, 1)) * 100)
        return (
          <div key={skill.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium truncate">{skill.name}</span>
              <span className="text-muted-foreground ml-2 shrink-0">{skill.current_level}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                style={{ width: `${Math.min(100, skill.current_level)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Save, Download, Upload, Loader2, Check } from "lucide-react"
import { getProfile, saveProfile, exportAllData, importAllData, DEFAULT_SKILLS, type Profile } from "@/lib/store"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(() => getProfile())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaving(true)
    saveProfile(profile!)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExport() {
    const json = exportAllData()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `sde-journey-${new Date().toISOString().split("T")[0]}.json`
    a.click(); URL.revokeObjectURL(url)
  }

  function handleImport() {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try { importAllData(ev.target!.result as string); window.location.reload() }
        catch { alert("Invalid backup file.") }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="page-container space-y-5 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {/* Profile */}
      <div className="glass-card p-4 space-y-4">
        <h2 className="section-heading">Placement Goal</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium" htmlFor="placement-date">Target date</label>
            <input type="date" id="placement-date" className="form-input mt-1"
              value={profile.placement_date}
              onChange={(e) => setProfile({ ...profile, placement_date: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="dsa-target">DSA target</label>
            <input type="number" id="dsa-target" className="form-input mt-1"
              min={50} max={500} value={profile.dsa_target}
              onChange={(e) => setProfile({ ...profile, dsa_target: parseInt(e.target.value) })} />
            <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>NeetCode 150 seeded by default</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="glass-card p-4 space-y-4">
        <h2 className="section-heading">Career Skills</h2>
        <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Set your current level honestly. These drive the Brutal Reality projections.
        </p>
        <div className="space-y-3">
          {profile.skills.map((skill, i) => {
            const col = skill.current_level >= 70 ? "#34d399" : skill.current_level >= 40 ? "#60a5fa" : "#fbbf24"
            return (
              <div key={skill.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{skill.name}</span>
                  <span className="font-bold" style={{ color: col }}>{skill.current_level}%</span>
                </div>
                <input type="range" min={0} max={100} value={skill.current_level}
                  onChange={(e) => {
                    const skills = [...profile.skills]
                    skills[i] = { ...skill, current_level: parseInt(e.target.value) }
                    setProfile({ ...profile, skills })
                  }}
                  className="w-full accent-primary" id={`skill-${skill.id}`} />
              </div>
            )
          })}
        </div>
        <button onClick={() => setProfile({ ...profile, skills: DEFAULT_SKILLS })}
          className="text-xs" style={{ color: "var(--color-muted-foreground)" }} id="reset-skills-btn">
          Reset all to 0
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} id="save-settings-btn"
          className={`btn-primary gap-2 ${saved ? "opacity-90" : ""}`}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" />
            : saved ? <Check className="h-4 w-4" />
            : <Save className="h-4 w-4" />}
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      {/* Data */}
      <div className="glass-card p-4 space-y-3">
        <h2 className="section-heading">Data Backup</h2>
        <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Data lives in your browser. Export a backup regularly.
        </p>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-secondary gap-2 text-sm" id="export-btn">
            <Download className="h-4 w-4" /> Export JSON
          </button>
          <button onClick={handleImport} className="btn-secondary gap-2 text-sm" id="import-btn">
            <Upload className="h-4 w-4" /> Import JSON
          </button>
        </div>
      </div>
    </div>
  )
}
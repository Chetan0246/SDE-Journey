export default function DashboardLoading() {
  return (
    <div className="page-container space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg" style={{ backgroundColor: "var(--color-accent)" }} />
          <div className="h-4 w-64 rounded" style={{ backgroundColor: "var(--color-accent)" }} />
        </div>
        <div className="h-9 w-28 rounded-lg" style={{ backgroundColor: "var(--color-accent)" }} />
      </div>
      {/* Card skeletons */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="metric-card">
            <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--color-border)" }} />
            <div className="h-8 w-16 rounded mt-1" style={{ backgroundColor: "var(--color-border)" }} />
          </div>
        ))}
      </div>
      <div className="glass-card p-4 h-48" />
      <div className="glass-card p-4 h-32" />
    </div>
  )
}
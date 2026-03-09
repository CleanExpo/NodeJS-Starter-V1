"use client";

/**
 * Analytics Dashboard — Template Page
 *
 * This page is a template. The analytics backend has been removed as a
 * degraded stub. To activate, implement apps/backend/src/api/routes/_templates/analytics.py
 * with real PostgreSQL queries and register it in main.py.
 *
 * Design: Scientific Luxury — OLED Black, no Lucide icons.
 */

export default function AnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-[#050505] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-[0.5px] border-white/[0.06] rounded-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-mono font-bold text-white">Analytics Dashboard</h1>
              <p className="text-white/50 mt-1 text-sm">
                Monitor agent performance, costs, and system health
              </p>
            </div>
            <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono rounded-sm">
              TEMPLATE
            </span>
          </div>
        </div>

        {/* Not implemented notice */}
        <div className="border-[0.5px] border-[#FFB800]/20 rounded-sm p-6 bg-[#FFB800]/5">
          <p className="text-[#FFB800] font-mono text-sm font-medium mb-2">
            ⚠ Analytics not yet configured
          </p>
          <p className="text-white/60 text-sm leading-relaxed">
            The analytics endpoint has been removed as a degraded stub. To activate:
          </p>
          <ol className="mt-3 space-y-1 text-white/50 text-sm list-decimal list-inside font-mono">
            <li>Implement <code className="text-[#00F5FF]">apps/backend/src/api/routes/_templates/analytics.py</code></li>
            <li>Replace stub responses with real SQLAlchemy queries</li>
            <li>Register the router in <code className="text-[#00F5FF]">apps/backend/src/api/main.py</code></li>
            <li>Remove this notice and restore the metrics UI below</li>
          </ol>
        </div>

        {/* Metric card scaffolds */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Total Runs", "Success Rate", "Active Runs", "Total Cost (AUD)"].map((label) => (
            <div key={label} className="border-[0.5px] border-white/[0.06] rounded-sm p-4">
              <p className="text-white/40 text-xs font-mono mb-2">{label}</p>
              <div className="h-8 bg-white/[0.04] rounded-sm animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {["Agent Performance", "Token Usage"].map((label) => (
            <div key={label} className="border-[0.5px] border-white/[0.06] rounded-sm p-6">
              <p className="text-white/60 text-sm font-mono font-medium mb-4">{label}</p>
              <div className="space-y-3">
                <div className="h-4 bg-white/[0.04] rounded-sm animate-pulse" />
                <div className="h-4 bg-white/[0.04] rounded-sm animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

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
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="rounded-sm border-[0.5px] border-white/[0.06] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-mono text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="mt-1 text-sm text-white/50">
                Monitor agent performance, costs, and system health
              </p>
            </div>
            <span className="rounded-sm border border-amber-500/20 bg-amber-500/10 px-2 py-1 font-mono text-xs text-amber-400">
              TEMPLATE
            </span>
          </div>
        </div>

        {/* Not implemented notice */}
        <div className="rounded-sm border-[0.5px] border-[#FFB800]/20 bg-[#FFB800]/5 p-6">
          <p className="mb-2 font-mono text-sm font-medium text-[#FFB800]">
            ⚠ Analytics not yet configured
          </p>
          <p className="text-sm leading-relaxed text-white/60">
            The analytics endpoint has been removed as a degraded stub. To activate:
          </p>
          <ol className="mt-3 list-inside list-decimal space-y-1 font-mono text-sm text-white/50">
            <li>
              Implement{' '}
              <code className="text-[#00F5FF]">
                apps/backend/src/api/routes/_templates/analytics.py
              </code>
            </li>
            <li>Replace stub responses with real SQLAlchemy queries</li>
            <li>
              Register the router in{' '}
              <code className="text-[#00F5FF]">apps/backend/src/api/main.py</code>
            </li>
            <li>Remove this notice and restore the metrics UI below</li>
          </ol>
        </div>

        {/* Metric card scaffolds */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {['Total Runs', 'Success Rate', 'Active Runs', 'Total Cost (AUD)'].map((label) => (
            <div key={label} className="rounded-sm border-[0.5px] border-white/[0.06] p-4">
              <p className="mb-2 font-mono text-xs text-white/40">{label}</p>
              <div className="h-8 animate-pulse rounded-sm bg-white/[0.04]" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {['Agent Performance', 'Token Usage'].map((label) => (
            <div key={label} className="rounded-sm border-[0.5px] border-white/[0.06] p-6">
              <p className="mb-4 font-mono text-sm font-medium text-white/60">{label}</p>
              <div className="space-y-3">
                <div className="h-4 animate-pulse rounded-sm bg-white/[0.04]" />
                <div className="h-4 w-3/4 animate-pulse rounded-sm bg-white/[0.04]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

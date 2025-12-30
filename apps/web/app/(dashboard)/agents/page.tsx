/**
 * Agent Dashboard Page
 *
 * Displays real-time agent metrics, task history, and performance trends.
 * Built with Next.js 15 Server Components for optimal performance.
 */

import { Suspense } from 'react'
import { AgentStats } from './components/AgentStats'
import { AgentList } from './components/AgentList'
import { TaskHistory } from './components/TaskHistory'
import { PerformanceTrends } from './components/PerformanceTrends'

export const metadata = {
  title: 'Agent Dashboard | Agentic Layer',
  description: 'Monitor autonomous agent performance and metrics',
}

async function fetchAgentStats() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/agents/stats`, {
    cache: 'no-store', // Real-time data
  })

  if (!res.ok) {
    throw new Error('Failed to fetch agent statistics')
  }

  return res.json()
}

export default async function AgentDashboardPage() {
  const stats = await fetchAgentStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Agent Dashboard</h1>
        <p className="text-gray-600">
          Real-time monitoring of the autonomous agentic layer
        </p>
      </div>

      {/* Overview Stats */}
      <div className="mb-8">
        <Suspense fallback={<AgentStatsSkeleton />}>
          <AgentStats stats={stats} />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Agent List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Active Agents</h2>
          <Suspense fallback={<AgentListSkeleton />}>
            <AgentList />
          </Suspense>
        </div>

        {/* Recent Tasks */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Tasks</h2>
          <Suspense fallback={<TaskHistorySkeleton />}>
            <TaskHistory limit={10} />
          </Suspense>
        </div>
      </div>

      {/* Performance Trends */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Performance Trends</h2>
        <Suspense fallback={<PerformanceTrendsSkeleton />}>
          <PerformanceTrends days={7} />
        </Suspense>
      </div>
    </div>
  )
}

// Loading skeletons
function AgentStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

function AgentListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  )
}

function TaskHistorySkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  )
}

function PerformanceTrendsSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="h-64 bg-gray-200 rounded" />
    </div>
  )
}

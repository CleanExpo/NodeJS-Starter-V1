/**
 * QueueStats Component
 *
 * Displays queue statistics (pending, in progress, completed, failed).
 */

interface QueueStatsProps {
  stats: {
    total_tasks: number;
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
  };
}

export function QueueStats({ stats }: QueueStatsProps) {
  const items = [
    { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
    { label: 'In Progress', value: stats.in_progress, color: 'text-blue-600' },
    { label: 'Completed', value: stats.completed, color: 'text-green-600' },
    { label: 'Failed', value: stats.failed, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-white p-4 text-center shadow">
          <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
          <div className="mt-1 text-sm text-gray-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

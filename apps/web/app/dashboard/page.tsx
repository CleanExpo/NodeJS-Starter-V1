import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <LayoutDashboard className="h-12 w-12 text-white/20" />
      <h1 className="text-xl font-medium text-white/60">Dashboard</h1>
      <p className="text-sm text-white/30">Coming soon</p>
    </div>
  );
}

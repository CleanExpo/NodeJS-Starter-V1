'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
  Utensils,
  BookOpen,
  CalendarDays,
  ClipboardList,
  User,
} from 'lucide-react';

const navigation: { name: string; href: string; icon: typeof LayoutDashboard }[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Activity', href: '/dashboard/activity', icon: Activity },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const nutritionNav: { name: string; href: string; icon: typeof LayoutDashboard }[] = [
  { name: 'Overview', href: '/nutrition', icon: Utensils },
  { name: 'Recipes', href: '/nutrition/recipes', icon: BookOpen },
  { name: 'Meal Plan', href: '/nutrition/meal-plan', icon: CalendarDays },
  { name: 'Diary', href: '/nutrition/diary', icon: ClipboardList },
  { name: 'Health Profile', href: '/nutrition/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useAppStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  const renderLink = (item: { name: string; href: string; icon: typeof LayoutDashboard }) => {
    const isActive =
      pathname === item.href ||
      (item.href !== '/nutrition' && item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <Link
        key={item.name}
        href={item.href as `/${string}`}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}
        title={collapsed ? item.name : undefined}
      >
        <item.icon className="h-4 w-4" />
        {!collapsed && item.name}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'bg-muted/40 border-r transition-all duration-200',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span>Agent Orchestrator</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground rounded-sm p-1 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map(renderLink)}

        {/* Nutrition section */}
        <div className="mt-4 mb-1">
          {!collapsed && (
            <span className="text-muted-foreground px-3 text-xs font-semibold tracking-wider uppercase">
              Nutrition
            </span>
          )}
        </div>
        {nutritionNav.map(renderLink)}
      </nav>
    </aside>
  );
}

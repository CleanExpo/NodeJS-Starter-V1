# Page Layout — Scientific Luxury Layout Template

> Standard page layout with OLED Black background, fixed sidebar, header with DataStrip, and main content area.

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode, useState } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  label?: string;
  sidebar?: ReactNode;
  metrics?: Array<{
    label: string;
    value: string | number;
    colour?: string;
  }>;
}

export function PageLayout({
  children,
  title,
  label,
  sidebar,
  metrics,
}: PageLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-white">
      {/* Sidebar */}
      {sidebar && (
        <aside
          className={cn(
            'fixed top-0 left-0 h-full border-r border-white/[0.06] bg-[#050505]',
            'transition-none z-20',
            sidebarOpen ? 'w-60' : 'w-16'
          )}
        >
          <div className="flex h-full flex-col">
            {/* Sidebar toggle */}
            <motion.button
              className="flex h-14 items-center justify-center border-b border-white/[0.06]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              transition={{ ease: [0.19, 1, 0.22, 1] }}
            >
              <span className="font-mono text-xs text-white/40">
                {sidebarOpen ? '◀' : '▶'}
              </span>
            </motion.button>

            {/* Sidebar content */}
            <nav className="flex-1 overflow-y-auto py-4">
              {sidebar}
            </nav>
          </div>
        </aside>
      )}

      {/* Main content */}
      <div className={cn(sidebar && (sidebarOpen ? 'ml-60' : 'ml-16'))}>
        {/* Header */}
        <header className="border-b border-white/[0.06] px-8 py-6">
          {label && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
              {label}
            </p>
          )}
          <h1 className="text-4xl font-extralight tracking-tight text-white">
            {title}
          </h1>

          {/* DataStrip — inline metrics */}
          {metrics && metrics.length > 0 && (
            <div className="mt-4 flex items-center gap-8 border-[0.5px] border-white/[0.06] bg-white/[0.01] px-6 py-3">
              {metrics.map((metric, index) => (
                <div key={metric.label} className="flex items-center gap-2">
                  {index > 0 && (
                    <div className="mr-6 h-4 w-px bg-white/10" />
                  )}
                  <span className="text-[10px] uppercase tracking-widest text-white/30">
                    {metric.label}
                  </span>
                  <span
                    className="font-mono text-lg font-medium tabular-nums"
                    style={{ color: metric.colour || '#00F5FF' }}
                  >
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Content area */}
        <main className="px-8 py-8">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-8 py-4">
          <p className="font-mono text-[10px] text-white/20">
            {new Date().toLocaleDateString('en-AU')}
          </p>
        </footer>
      </div>
    </div>
  );
}
```

## Sidebar Navigation Item

```tsx
interface NavItemProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  icon?: ReactNode;
}

function NavItem({ label, active, onClick, collapsed, icon }: NavItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-2.5 text-left',
        active
          ? 'border-l-2 border-[#00F5FF] text-white/90'
          : 'border-l-2 border-transparent text-white/40 hover:text-white/60'
      )}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
      transition={{ ease: [0.19, 1, 0.22, 1] }}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {!collapsed && (
        <span className="text-sm font-light">{label}</span>
      )}
    </motion.button>
  );
}
```

## Usage

```tsx
<PageLayout
  title="Command Centre"
  label="Real-Time Monitoring"
  sidebar={
    <>
      <NavItem label="Overview" active />
      <NavItem label="Agents" />
      <NavItem label="Analytics" />
      <NavItem label="Settings" />
    </>
  }
  metrics={[
    { label: 'Active', value: 12, colour: '#00F5FF' },
    { label: 'Completed', value: 847, colour: '#00FF88' },
    { label: 'Failed', value: 3, colour: '#FF4444' },
  ]}
>
  <TimelineContent />
</PageLayout>
```

## Checklist

- [x] `bg-[#050505]` OLED Black background
- [x] `border-white/[0.06]` single-pixel borders throughout
- [x] `rounded-sm` only (none used — sharp layout edges)
- [x] `font-extralight tracking-tight` hero title
- [x] `text-[10px] tracking-[0.3em] uppercase` labels
- [x] `font-mono tabular-nums` data values
- [x] Framer Motion for hover states
- [x] `AnimatePresence` for content transitions
- [x] Cyan `#00F5FF` active nav indicator
- [x] `min-h-[100dvh]` for full-height
- [x] Australian date format in footer

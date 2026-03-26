# Premium Card — Generic Dark-Mode Template

> Portable premium card component. No project-specific branding — uses generic dark-mode tokens.

```tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PremiumCardProps {
  title: string;
  label?: string;
  value?: string | number;
  children?: ReactNode;
  index?: number;
  className?: string;
}

export function PremiumCard({
  title,
  label,
  value,
  children,
  index = 0,
  className,
}: PremiumCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        'rounded-sm border border-white/[0.08] bg-white/[0.02] p-6',
        className
      )}
    >
      {label && (
        <span className="text-[11px] uppercase tracking-widest text-white/40">
          {label}
        </span>
      )}
      <h3 className="mt-1 text-lg font-light text-white/90">{title}</h3>
      {value !== undefined && (
        <p className="mt-2 font-mono text-2xl font-medium tabular-nums text-white/80">
          {value}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
}
```

## Usage

```tsx
<div className="space-y-4">
  <PremiumCard title="Total Users" label="Analytics" value="1,247" index={0} />
  <PremiumCard title="Revenue" label="Monthly" value="$12,340" index={1} />
</div>
```

## Customisation Points

- Replace `rounded-sm` with your project's chosen radius
- Replace `border-white/[0.08]` with your border token
- Replace `bg-white/[0.02]` with your elevation token
- Add accent colour to value via a `colour` prop
- Swap Framer Motion for CSS transitions if preferred

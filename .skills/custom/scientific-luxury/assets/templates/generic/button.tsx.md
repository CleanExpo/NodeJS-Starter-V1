# Premium Button — Generic Dark-Mode Template

> Portable premium button component. No project-specific spectral colours — uses CSS custom properties for theming.

```tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
}: PremiumButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-sm border border-white/10 bg-transparent',
        'font-medium tracking-wide',
        'text-white/80',
        SIZES[size],
        disabled && 'opacity-30 cursor-not-allowed',
        className
      )}
      whileHover={
        disabled
          ? undefined
          : { backgroundColor: 'rgba(255, 255, 255, 0.04)' }
      }
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.button>
  );
}
```

## Usage

```tsx
<PremiumButton onClick={handleAction}>Submit</PremiumButton>
<PremiumButton variant="secondary" size="sm">Cancel</PremiumButton>
```

## Customisation Points

- Replace `rounded-sm` with your project's chosen radius
- Replace `border-white/10` with your border opacity token
- Add variant colours via CSS custom properties or a theme object
- Swap Framer Motion for CSS transitions if the project does not use Framer

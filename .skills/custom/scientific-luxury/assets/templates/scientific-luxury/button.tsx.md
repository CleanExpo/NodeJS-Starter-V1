# SpectralButton — Scientific Luxury Button Template

> Copy and adapt. Uses OLED Black foundation, spectral colours, single-pixel borders, and Framer Motion.

```tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpectralButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const VARIANTS = {
  primary: {
    border: 'border-[#00F5FF]/30',
    text: 'text-[#00F5FF]',
    glow: '#00F5FF',
    hoverBg: 'rgba(0, 245, 255, 0.05)',
  },
  secondary: {
    border: 'border-white/[0.1]',
    text: 'text-white/70',
    glow: '#FFFFFF',
    hoverBg: 'rgba(255, 255, 255, 0.02)',
  },
  danger: {
    border: 'border-[#FF4444]/30',
    text: 'text-[#FF4444]',
    glow: '#FF4444',
    hoverBg: 'rgba(255, 68, 68, 0.05)',
  },
} as const;

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export function SpectralButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
}: SpectralButtonProps) {
  const v = VARIANTS[variant];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative rounded-sm border-[0.5px] font-mono tracking-wide uppercase',
        'bg-transparent transition-none',
        v.border,
        v.text,
        SIZES[size],
        disabled && 'opacity-30 cursor-not-allowed',
        className
      )}
      whileHover={
        disabled
          ? undefined
          : {
              backgroundColor: v.hoverBg,
              boxShadow: `0 0 20px ${v.glow}15`,
            }
      }
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
    >
      {children}
    </motion.button>
  );
}
```

## Usage

```tsx
<SpectralButton variant="primary" onClick={handleSubmit}>
  Initialise
</SpectralButton>

<SpectralButton variant="secondary" size="sm">
  Cancel
</SpectralButton>

<SpectralButton variant="danger" onClick={handleDelete}>
  Terminate
</SpectralButton>
```

## Checklist

- [x] `rounded-sm` corners
- [x] `border-[0.5px]` single-pixel border
- [x] Spectral colour variants
- [x] Framer Motion for hover/tap animations
- [x] `font-mono` for button text
- [x] No CSS transitions
- [x] OLED-safe (transparent background)

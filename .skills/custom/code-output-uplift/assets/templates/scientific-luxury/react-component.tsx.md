---
template: react-component
variant: scientific-luxury
locale: en-AU
design-system: scientific-luxury
---

# React component template — Scientific Luxury

```tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';

// --- Types ---

interface {ComponentName}Props {
  /** Primary identifier for the resource this component displays. */
  {resourceId}: string;
  /** Optional callback fired when the user completes the primary action. */
  onComplete?: (result: {ResultType}) => void;
}

interface {ResultType} {
  id: string;
  status: 'active' | 'complete' | 'error';
  updatedAt: string;
}

// --- Constants ---

const FADE_IN_VARIANT: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

const STAGGER_CHILDREN: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// --- Component ---

export function {ComponentName}({ {resourceId}, onComplete }: {ComponentName}Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePrimaryAction = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const actionResult = await executePrimaryAction({resourceId});
      onComplete?.(actionResult);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'An unexpected error occurred. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [{resourceId}, onComplete]);

  // --- Loading state ---

  if (!{resourceId}) {
    return (
      <div className="flex items-centre justify-centre p-8 text-white/40">
        No resource selected.
      </div>
    );
  }

  // --- Error state ---

  if (submitError) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={FADE_IN_VARIANT}
        className="rounded-sm border border-[#FF4444]/20 bg-[#FF4444]/5 p-4"
      >
        <p className="text-sm text-[#FF4444]">{submitError}</p>
        <button
          onClick={() => setSubmitError(null)}
          className="mt-2 text-xs text-white/60 underline hover:text-white/90"
        >
          Dismiss
        </button>
      </motion.div>
    );
  }

  // --- Main render ---

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={STAGGER_CHILDREN}
      className="space-y-4"
    >
      <motion.div variants={FADE_IN_VARIANT} className="rounded-sm bg-white/5 p-6">
        {/* Component content here — domain-specific layout */}
      </motion.div>

      <motion.div variants={FADE_IN_VARIANT}>
        <button
          onClick={handlePrimaryAction}
          disabled={isSubmitting}
          className="rounded-sm bg-[#00F5FF]/10 px-4 py-2 text-sm text-[#00F5FF] transition-colors hover:bg-[#00F5FF]/20 disabled:opacity-40"
        >
          {isSubmitting ? 'Processing...' : 'Confirm'}
        </button>
      </motion.div>
    </motion.section>
  );
}
```

## Template notes

**Naming**: Replace `{ComponentName}`, `{resourceId}`, and `{ResultType}` with domain-specific names. The component name should describe what it renders: `AgentExecutionPanel`, `NutritionEntryForm`, `SessionTimeline`.

**Animation**: All animations use Framer Motion with the `[0.4, 0, 0.2, 1]` smooth easing from the design system. Stagger children for list-like content. Use `FADE_IN_VARIANT` as the baseline motion — override only when the interaction demands it.

**Colours**: Reference spectral palette values directly. Cyan `#00F5FF` for interactive elements, Red `#FF4444` for error states. Background surfaces use `bg-white/5` for subtle elevation against the OLED black base.

**Border radius**: `rounded-sm` exclusively. No exceptions.

**Error handling**: Every async action has explicit error catching with user-readable messages. Error state renders inline with spectral Red styling.

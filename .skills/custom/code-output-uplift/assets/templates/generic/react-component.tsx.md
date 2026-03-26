---
template: react-component
variant: generic
locale: en-AU
---

# React component template — Generic

```tsx
'use client';

import { useState, useCallback } from 'react';

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

const SUBMIT_BUTTON_LABEL = 'Confirm';
const SUBMITTING_BUTTON_LABEL = 'Processing...';

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
      <div className="flex items-center justify-center p-8 text-gray-400">
        No resource selected.
      </div>
    );
  }

  // --- Error state ---

  if (submitError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{submitError}</p>
        <button
          onClick={() => setSubmitError(null)}
          className="mt-2 text-xs text-gray-500 underline hover:text-gray-700"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // --- Main render ---

  return (
    <section className="space-y-4">
      <div className="rounded border border-gray-200 bg-white p-6">
        {/* Component content here — domain-specific layout */}
      </div>

      <div>
        <button
          onClick={handlePrimaryAction}
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
        >
          {isSubmitting ? SUBMITTING_BUTTON_LABEL : SUBMIT_BUTTON_LABEL}
        </button>
      </div>
    </section>
  );
}
```

## Template notes

**Naming**: Replace `{ComponentName}`, `{resourceId}`, and `{ResultType}` with domain-specific names. The component name describes what it renders: `UserProfileEditor`, `OrderSummaryPanel`, `TaskListView`.

**No animation library required**: The generic template uses CSS transitions via Tailwind utility classes rather than Framer Motion. Add Framer Motion only if the project requires complex animations.

**Colours**: Uses standard Tailwind colour classes. Replace with project-specific tokens if a design system is in use.

**Error handling**: Identical pattern to the Scientific Luxury variant — every async action has explicit error catching with user-readable messages. The error state renders inline.

**Structure**: The same internal ordering applies: types, constants, component function, state declarations, callbacks, early returns, main render.

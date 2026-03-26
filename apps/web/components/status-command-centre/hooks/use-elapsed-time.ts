'use client';

/**
 * useElapsedTime - Real-time elapsed timer hook
 * Elite Command Centre hook
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatElapsedAU, calculateDuration } from '../utils/format-duration';
import type { UseElapsedTimeResult } from '../types';
import { DEFAULTS } from '../constants';

export function useElapsedTime(
  startTime: string | null,
  endTime?: string | null
): UseElapsedTimeResult {
  const [, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate elapsed time
  const calculateElapsed = useCallback(() => {
    if (!startTime) return 0;
    return calculateDuration(startTime, endTime ?? undefined);
  }, [startTime, endTime]);

  // Start interval to trigger re-renders for live updates
  useEffect(() => {
    // If there's an end time or no start, no interval needed
    if (endTime || !startTime) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, DEFAULTS.refreshInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startTime, endTime]);

  // Compute current elapsed during render — avoids synchronous setState in effect
  const elapsed = calculateElapsed();

  return {
    elapsed,
    formatted: formatElapsedAU(elapsed),
    isRunning: Boolean(startTime && !endTime),
  };
}

/**
 * useCountdown - Countdown timer hook
 * For estimated time remaining display
 */
export function useCountdown(estimatedSeconds: number | null): UseElapsedTimeResult {
  const [remaining, setRemaining] = useState(estimatedSeconds ?? 0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (estimatedSeconds === null || estimatedSeconds <= 0) {
      return;
    }

    // Decrement remaining via interval callback — async setState is allowed
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, DEFAULTS.refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [estimatedSeconds]);

  const displayRemaining = estimatedSeconds === null || estimatedSeconds <= 0 ? 0 : remaining;

  return {
    elapsed: displayRemaining,
    formatted: formatElapsedAU(displayRemaining),
    isRunning: displayRemaining > 0,
  };
}

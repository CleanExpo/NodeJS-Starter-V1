import { act, renderHook, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { useDiary } from '@/hooks/nutrition/use-diary';
import { useHealthProfile } from '@/hooks/nutrition/use-health-profile';
import { useMealPlan } from '@/hooks/nutrition/use-meal-plan';
import { useSymptoms } from '@/hooks/nutrition/use-symptoms';
import { getWeekStartDate } from '@/lib/nutrition/meal-plans';
import type { MealPlan, UserHealthProfile } from '@/types/nutrition';

global.fetch = vi.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

const ok = (data: unknown) => ({ ok: true, json: async () => ({ data }) });
const failed = (error: string) => ({ ok: false, json: async () => ({ error }) });

describe('nutrition hook mutation races', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not let an older profile GET overwrite an update', async () => {
    const oldRequest = deferred<{
      ok: boolean;
      json: () => Promise<{ data: UserHealthProfile }>;
    }>();
    const updated = { id: 'profile', protein_target_g: 120 } as UserHealthProfile;
    (global.fetch as Mock)
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValueOnce(ok(updated));
    const { result } = renderHook(() => useHealthProfile());
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const oldSignal = (global.fetch as Mock).mock.calls[0][1].signal as AbortSignal;

    await act(async () => {
      await result.current.updateProfile({ protein_target_g: 120 });
    });
    expect(oldSignal.aborted).toBe(true);
    expect(result.current.profile).toEqual(updated);

    await act(async () => {
      oldRequest.resolve(
        ok({ id: 'profile', protein_target_g: 80 } as UserHealthProfile) as {
          ok: boolean;
          json: () => Promise<{ data: UserHealthProfile }>;
        }
      );
    });
    expect(result.current.profile).toEqual(updated);
  });

  it('terminates diary loading when a mutation invalidates a GET and fails', async () => {
    const pendingRead = new Promise<never>(() => undefined);
    (global.fetch as Mock).mockImplementation((_input: string, init?: RequestInit) =>
      init?.method === 'POST' ? Promise.resolve(failed('save failed')) : pendingRead
    );
    const { result } = renderHook(() => useDiary('2026-08-13'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    await act(async () => {
      await expect(result.current.addEntry({})).rejects.toThrow('save failed');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error?.message).toBe('save failed');
  });

  it('lets an unmounted diary mutation settle without state publication or refetch', async () => {
    const mutation = deferred<ReturnType<typeof ok>>();
    (global.fetch as Mock).mockImplementation((_input: string, init?: RequestInit) =>
      init?.method === 'POST' ? mutation.promise : Promise.resolve(ok([]))
    );
    const { result, unmount } = renderHook(() => useDiary('2026-08-13'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let mutationPromise!: Promise<unknown>;
    act(() => {
      mutationPromise = result.current.addEntry({});
    });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
    expect((global.fetch as Mock).mock.calls[2][1].signal).toBeUndefined();
    const stateBeforeUnmount = result.current;

    unmount();
    await act(async () => {
      mutation.resolve(ok({ id: 'entry' }));
      await mutationPromise;
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(result.current).toBe(stateBeforeUnmount);
  });

  it('ignores an older same-date diary mutation completion', async () => {
    const first = deferred<ReturnType<typeof failed>>();
    const second = deferred<ReturnType<typeof ok>>();
    let mutationCount = 0;
    (global.fetch as Mock).mockImplementation((_input: string, init?: RequestInit) => {
      if (init?.method === 'POST') return ++mutationCount === 1 ? first.promise : second.promise;
      return Promise.resolve(ok([]));
    });
    const { result } = renderHook(() => useDiary('2026-08-13'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let firstPromise!: Promise<unknown>;
    let secondPromise!: Promise<unknown>;
    act(() => {
      firstPromise = result.current.addEntry({});
      secondPromise = result.current.addEntry({});
    });
    expect((global.fetch as Mock).mock.calls[2][1].signal).toBeUndefined();

    await act(async () => {
      second.resolve(ok({ id: 'newer' }));
      await secondPromise;
    });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(6));

    await act(async () => {
      first.resolve(failed('stale failure'));
      await expect(firstPromise).rejects.toThrow('stale failure');
    });

    expect(global.fetch).toHaveBeenCalledTimes(6);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('does not refetch a captured diary date after the current date changes', async () => {
    const mutation = deferred<ReturnType<typeof ok>>();
    const pendingRead = new Promise<never>(() => undefined);
    (global.fetch as Mock).mockImplementation((input: string, init?: RequestInit) => {
      if (init?.method === 'POST') return mutation.promise;
      if (input.includes('date=2026-08-14')) return Promise.resolve(ok([]));
      return pendingRead;
    });
    const { result } = renderHook(() => useDiary('2026-08-13'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    let mutationPromise!: Promise<unknown>;
    act(() => {
      mutationPromise = result.current.addEntry({});
    });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
    act(() => result.current.setDate('2026-08-14'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(5));

    await act(async () => {
      mutation.resolve(ok({ id: 'entry' }));
      await mutationPromise;
    });

    const oldDateReads = (global.fetch as Mock).mock.calls.filter(
      ([input, init]) => !init?.method && String(input).includes('date=2026-08-13')
    );
    expect(oldDateReads).toHaveLength(2);
  });

  it('terminates symptoms loading when a mutation invalidates a GET and fails', async () => {
    const pendingRead = new Promise<never>(() => undefined);
    (global.fetch as Mock).mockImplementation((_input: string, init?: RequestInit) =>
      init?.method === 'POST' ? Promise.resolve(failed('symptom save failed')) : pendingRead
    );
    const { result } = renderHook(() => useSymptoms('2026-08-13'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await act(async () => {
      await expect(result.current.addLog({})).rejects.toThrow('symptom save failed');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error?.message).toBe('symptom save failed');
  });

  it('terminates meal-plan loading after a failed mutation invalidates its GET', async () => {
    const plan = { id: 'plan', week_start_date: '2026-08-10' } as MealPlan;
    const pendingRead = new Promise<never>(() => undefined);
    (global.fetch as Mock).mockImplementation((_input: string, init?: RequestInit) => {
      if (init?.method === 'POST') return Promise.resolve(failed('meal save failed'));
      return pendingRead;
    });
    const { result } = renderHook(() => useMealPlan());
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    await act(async () => {
      await expect(result.current.addEntry(1, 'breakfast', plan.id)).rejects.toThrow(
        'meal save failed'
      );
    });

    const mutationCall = (global.fetch as Mock).mock.calls.find(
      ([, init]) => init?.method === 'POST'
    );
    expect(mutationCall?.[1].signal).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error?.message).toBe('meal save failed');
  });

  it('never reuses the previous plan when adding before the new week fetch settles', async () => {
    let oldWeek = '';
    let newWeek = '';
    (global.fetch as Mock).mockImplementation(async (input: string, init?: RequestInit) => {
      if (!init?.method) {
        const week = new URL(input, 'http://localhost').searchParams.get('week_start') || '';
        if (!oldWeek) oldWeek = week;
        return ok({ id: week === oldWeek ? 'old-plan' : 'new-plan', week_start_date: week });
      }
      if (input === '/api/nutrition/meal-plans') {
        newWeek = JSON.parse(String(init.body)).week_start_date;
        return ok({ id: 'new-plan', week_start_date: newWeek });
      }
      return ok({ id: 'entry' });
    });
    const { result } = renderHook(() => useMealPlan());
    await waitFor(() => expect(result.current.plan?.id).toBe('old-plan'));

    act(() => result.current.navigateWeek('next'));
    await act(async () => {
      await result.current.addEntry(1, 'breakfast', 'recipe');
    });

    const entryUrls = (global.fetch as Mock).mock.calls
      .filter(([, init]) => init?.method === 'POST')
      .map(([input]) => String(input));
    expect(newWeek).not.toBe(oldWeek);
    expect(entryUrls).toContain('/api/nutrition/meal-plans');
    expect(entryUrls).toContain('/api/nutrition/meal-plans/new-plan/entries');
    expect(entryUrls).not.toContain('/api/nutrition/meal-plans/old-plan/entries');
  });

  it('finishes entry insertion when the visible week changes after plan creation starts', async () => {
    const planCreation = deferred<ReturnType<typeof ok>>();
    const initialWeek = getWeekStartDate();
    (global.fetch as Mock).mockImplementation((input: string, init?: RequestInit) => {
      if (!init?.method) return Promise.resolve(ok(null));
      if (input === '/api/nutrition/meal-plans') return planCreation.promise;
      return Promise.resolve(ok({ id: 'entry' }));
    });
    const { result } = renderHook(() => useMealPlan());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let mutationPromise!: Promise<unknown>;
    act(() => {
      mutationPromise = result.current.addEntry(1, 'breakfast', 'recipe');
    });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    act(() => result.current.navigateWeek('next'));

    await act(async () => {
      planCreation.resolve(ok({ id: 'created-plan', week_start_date: initialWeek }));
      await mutationPromise;
    });

    const mutationCalls = (global.fetch as Mock).mock.calls.filter(([, init]) => init?.method);
    expect(mutationCalls.map(([input]) => String(input))).toEqual([
      '/api/nutrition/meal-plans',
      '/api/nutrition/meal-plans/created-plan/entries',
    ]);
    expect(mutationCalls.every(([, init]) => init?.signal === undefined)).toBe(true);
  });
});

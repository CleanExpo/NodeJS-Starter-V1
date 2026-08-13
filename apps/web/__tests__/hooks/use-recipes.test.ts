import { act, renderHook, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { useRecipes } from '@/hooks/nutrition/use-recipes';
import type { Recipe } from '@/types/nutrition';

global.fetch = vi.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

describe('useRecipes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not let an old filter request replace newer recipes', async () => {
    const oldRequest = deferred<{ ok: boolean; json: () => Promise<{ data: Recipe[] }> }>();
    const newRequest = deferred<{ ok: boolean; json: () => Promise<{ data: Recipe[] }> }>();
    (global.fetch as Mock)
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);

    const { result } = renderHook(() => useRecipes());
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    act(() => result.current.updateFilters({ search: 'new' }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    await act(async () => {
      newRequest.resolve({
        ok: true,
        json: async () => ({ data: [{ id: 'new' } as Recipe] }),
      });
    });
    await waitFor(() => expect(result.current.recipes[0]?.id).toBe('new'));

    await act(async () => {
      oldRequest.resolve({
        ok: true,
        json: async () => ({ data: [{ id: 'old' } as Recipe] }),
      });
    });
    expect(result.current.recipes[0]?.id).toBe('new');
  });
});

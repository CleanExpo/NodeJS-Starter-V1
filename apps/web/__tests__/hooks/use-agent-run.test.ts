import { act, renderHook, waitFor } from '@testing-library/react';
import { vi, type Mock } from 'vitest';
import { useAgentRun, type AgentRun } from '@/hooks/use-agent-runs';

global.fetch = vi.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function agentRun(id: string): AgentRun {
  return { id } as AgentRun;
}

describe('useAgentRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('returns empty state immediately for an empty ID', () => {
    const { result } = renderHook(() => useAgentRun(null));

    expect(result.current).toEqual({ run: null, loading: false, error: null });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('ignores a stale run after the run ID changes', async () => {
    const oldRequest = deferred<{ ok: boolean; json: () => Promise<AgentRun> }>();
    const newRequest = deferred<{ ok: boolean; json: () => Promise<AgentRun> }>();
    (global.fetch as Mock)
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);

    const { result, rerender } = renderHook(({ id }) => useAgentRun(id), {
      initialProps: { id: 'run_old' as string | null },
    });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    rerender({ id: 'run_new' });
    expect(result.current).toEqual({ run: null, loading: true, error: null });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    await act(async () => {
      newRequest.resolve({ ok: true, json: async () => agentRun('run_new') });
    });
    await waitFor(() => expect(result.current.run?.id).toBe('run_new'));

    await act(async () => {
      oldRequest.resolve({ ok: true, json: async () => agentRun('run_old') });
    });
    expect(result.current.run?.id).toBe('run_new');

    rerender({ id: null });
    expect(result.current).toEqual({ run: null, loading: false, error: null });
  });

  it('does not re-enter loading state during background polling', async () => {
    vi.useFakeTimers();
    const refreshRequest = deferred<{ ok: boolean; json: () => Promise<AgentRun> }>();
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => agentRun('run_123') })
      .mockReturnValueOnce(refreshRequest.promise);

    const { result } = renderHook(() => useAgentRun('run_123'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.run?.id).toBe('run_123');
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      refreshRequest.resolve({ ok: true, json: async () => agentRun('run_123') });
    });
    expect(result.current.loading).toBe(false);
    vi.useRealTimers();
  });

  it('waits for a slow response to settle before scheduling the next poll', async () => {
    vi.useFakeTimers();
    const firstRequest = deferred<{ ok: boolean; json: () => Promise<AgentRun> }>();
    (global.fetch as Mock)
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce({ ok: true, json: async () => agentRun('run_123') });

    const { result } = renderHook(() => useAgentRun('run_123'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(3001);
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);

    await act(async () => {
      firstRequest.resolve({ ok: true, json: async () => agentRun('run_123') });
    });
    expect(result.current.run?.id).toBe('run_123');
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2999);
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('does not reuse a same-ID run after the ID is cleared', async () => {
    const secondRequest = deferred<{ ok: boolean; json: () => Promise<AgentRun> }>();
    (global.fetch as Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => agentRun('run_123') })
      .mockReturnValueOnce(secondRequest.promise);
    const { result, rerender } = renderHook(({ id }) => useAgentRun(id), {
      initialProps: { id: 'run_123' as string | null },
    });
    await waitFor(() => expect(result.current.run?.id).toBe('run_123'));

    rerender({ id: null });
    rerender({ id: 'run_123' });

    expect(result.current).toEqual({ run: null, loading: true, error: null });
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  it('passes an abort signal and aborts it on unmount', async () => {
    const request = deferred<{ ok: boolean; json: () => Promise<AgentRun> }>();
    (global.fetch as Mock).mockReturnValueOnce(request.promise);
    const { unmount } = renderHook(() => useAgentRun('run_123'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const signal = (global.fetch as Mock).mock.calls[0][1].signal as AbortSignal;

    unmount();

    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(true);
  });
});

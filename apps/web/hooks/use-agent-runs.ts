"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Agent Run Status Types
 * Matches the backend TaskStatus enum
 */
export type AgentRunStatus =
  | "pending"
  | "in_progress"
  | "awaiting_verification"
  | "verification_in_progress"
  | "verification_passed"
  | "verification_failed"
  | "completed"
  | "failed"
  | "blocked"
  | "escalated_to_human";

/**
 * Agent Run Record
 * Matches the agent_runs table schema
 */
export interface AgentRun {
  id: string;
  task_id: string;
  user_id: string | null;
  agent_name: string;
  agent_id: string;
  status: AgentRunStatus;
  current_step: string | null;
  progress_percent: number;
  result: any;
  error: string | null;
  metadata: Record<string, any>;
  verification_attempts: number;
  verification_evidence: any[];
  started_at: string;
  completed_at: string | null;
  updated_at: string;
}

/**
 * Realtime Event Types
 */
type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

interface RealtimePayload {
  eventType: RealtimeEvent;
  new: AgentRun;
  old: AgentRun;
  errors: any;
}

/**
 * Hook to subscribe to agent run updates in real-time
 *
 * @param taskId - Optional task ID to filter runs
 * @param agentName - Optional agent name to filter runs
 *
 * @example
 * ```tsx
 * function AgentMonitor() {
 *   const { runs, loading, error } = useAgentRuns();
 *
 *   return (
 *     <div>
 *       {runs.map(run => (
 *         <div key={run.id}>
 *           {run.agent_name}: {run.status} - {run.progress_percent}%
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAgentRuns(taskId?: string, agentName?: string) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch initial runs
  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        let query = supabase
          .from("agent_runs")
          .select("*")
          .order("started_at", { ascending: false });

        if (taskId) {
          query = query.eq("task_id", taskId);
        }

        if (agentName) {
          query = query.eq("agent_name", agentName);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setRuns(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch agent runs"));
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, [taskId, agentName]);

  // Subscribe to real-time updates
  useEffect(() => {
    const supabase = createClient();

    // Create channel for realtime subscription
    const realtimeChannel = supabase
      .channel("agent_runs_changes")
      .on<AgentRun>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_runs",
          filter: taskId ? `task_id=eq.${taskId}` : undefined,
        },
        (payload: RealtimePayload) => {
          const { eventType, new: newRun, old: oldRun } = payload;

          // Apply filters
          if (agentName && newRun.agent_name !== agentName) {
            return;
          }

          setRuns((prevRuns) => {
            switch (eventType) {
              case "INSERT":
                // Add new run to the beginning
                return [newRun, ...prevRuns];

              case "UPDATE":
                // Update existing run
                return prevRuns.map((run) =>
                  run.id === newRun.id ? newRun : run
                );

              case "DELETE":
                // Remove deleted run
                return prevRuns.filter((run) => run.id !== oldRun.id);

              default:
                return prevRuns;
            }
          });
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    // Cleanup subscription
    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [taskId, agentName]);

  return { runs, loading, error, channel };
}

/**
 * Hook to subscribe to a single agent run by ID
 *
 * @param runId - Agent run ID to monitor
 *
 * @example
 * ```tsx
 * function AgentRunMonitor({ runId }: { runId: string }) {
 *   const { run, loading } = useAgentRun(runId);
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!run) return <div>Run not found</div>;
 *
 *   return (
 *     <div>
 *       <h2>{run.agent_name}</h2>
 *       <progress value={run.progress_percent} max={100} />
 *       <p>{run.current_step}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAgentRun(runId: string | null) {
  const [run, setRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!runId) {
      setRun(null);
      setLoading(false);
      return;
    }

    const fetchRun = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("agent_runs")
          .select("*")
          .eq("id", runId)
          .single();

        if (fetchError) throw fetchError;

        setRun(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch agent run"));
      } finally {
        setLoading(false);
      }
    };

    fetchRun();

    // Subscribe to updates for this specific run
    const supabase = createClient();
    const channel = supabase
      .channel(`agent_run_${runId}`)
      .on<AgentRun>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "agent_runs",
          filter: `id=eq.${runId}`,
        },
        (payload) => {
          setRun(payload.new);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [runId]);

  return { run, loading, error };
}

/**
 * Hook to get only active (in-progress) agent runs
 *
 * @example
 * ```tsx
 * function ActiveAgentsWidget() {
 *   const { activeRuns } = useActiveAgentRuns();
 *
 *   return (
 *     <div>
 *       <h3>Active Agents ({activeRuns.length})</h3>
 *       {activeRuns.map(run => (
 *         <AgentRunCard key={run.id} run={run} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useActiveAgentRuns() {
  const { runs, loading, error } = useAgentRuns();

  const activeRuns = runs.filter((run) =>
    ["pending", "in_progress", "awaiting_verification", "verification_in_progress"].includes(
      run.status
    )
  );

  return { activeRuns, loading, error };
}

/**
 * Utility function to trigger an agent run from the frontend
 *
 * @param taskDescription - Description of the task
 * @param backendUrl - URL of the FastAPI backend
 *
 * @example
 * ```tsx
 * async function handleRunAgent() {
 *   const runId = await triggerAgentRun(
 *     "Build a new feature",
 *     "http://localhost:8000"
 *   );
 *
 *   console.log("Started agent run:", runId);
 * }
 * ```
 */
export async function triggerAgentRun(
  taskDescription: string,
  backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
): Promise<string> {
  const response = await fetch(`${backendUrl}/api/agents/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task_description: taskDescription,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger agent run: ${response.statusText}`);
  }

  const data = await response.json();
  return data.run_id;
}

"use client";

import { useState } from "react";
import { useActiveAgentRuns, triggerAgentRun } from "@/hooks/use-agent-runs";
import { AgentRunCard } from "@/components/agent-run-monitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play } from "lucide-react";

export default function AgentsPage() {
  const { activeRuns, loading, error } = useActiveAgentRuns();
  const [taskDescription, setTaskDescription] = useState("");
  const [triggering, setTriggering] = useState(false);

  const handleTriggerAgent = async () => {
    if (!taskDescription.trim()) {
      alert("Please enter a task description");
      return;
    }

    setTriggering(true);

    try {
      const runId = await triggerAgentRun(taskDescription);
      alert(`Agent run started: ${runId}`);
      setTaskDescription("");
    } catch (err) {
      alert(
        `Failed to trigger agent: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Orchestration</h1>
        <p className="text-muted-foreground">
          Trigger and monitor AI agent runs in real-time via Supabase Realtime
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trigger Agent Card */}
        <Card>
          <CardHeader>
            <CardTitle>Trigger Agent Run</CardTitle>
            <CardDescription>
              Enter a task description to start a new agent execution
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="task" className="text-sm font-medium">
                Task Description
              </label>
              <Input
                id="task"
                placeholder="e.g., Build a new login page"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !triggering) {
                    handleTriggerAgent();
                  }
                }}
                disabled={triggering}
              />
            </div>

            <Button
              onClick={handleTriggerAgent}
              disabled={triggering || !taskDescription.trim()}
              className="w-full"
            >
              {triggering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Agent...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Agent Run
                </>
              )}
            </Button>

            <div className="pt-4 border-t space-y-2">
              <p className="text-sm font-medium">Quick Examples:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Create a new component",
                  "Refactor authentication",
                  "Add database migration",
                  "Run tests and fix errors",
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => setTaskDescription(example)}
                    disabled={triggering}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Runs Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Agents</CardTitle>
                <CardDescription>Real-time updates via Supabase</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <span className="text-2xl font-bold">{activeRuns.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 mb-4">
                <p className="text-sm text-destructive">Error: {error.message}</p>
              </div>
            )}

            {activeRuns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No active agent runs</p>
                <p className="text-xs mt-1">Trigger a new run to see live updates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRuns.map((run) => (
                  <AgentRunCard key={run.id} run={run} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How It Works Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How the Event Bridge Works</CardTitle>
          <CardDescription>
            Real-time communication between Next.js and FastAPI via Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h3 className="font-medium">Frontend Triggers</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                User submits a task → Next.js sends HTTP request to FastAPI backend
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h3 className="font-medium">Backend Publishes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                FastAPI agent publishes status updates to Supabase `agent_runs` table
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h3 className="font-medium">Frontend Subscribes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Next.js subscribes to Realtime changes → UI updates automatically
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ No polling required - true real-time updates</li>
              <li>✓ Automatic reconnection on network issues</li>
              <li>✓ Scales to multiple users simultaneously</li>
              <li>✓ Uses existing Supabase infrastructure</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

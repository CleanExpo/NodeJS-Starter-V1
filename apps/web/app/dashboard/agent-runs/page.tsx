"use client";

import { useState, useMemo } from "react";
import { useAgentRuns, type AgentRunStatus } from "@/hooks/use-agent-runs";
import { AgentRunMonitor } from "@/components/agent-run-monitor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function AgentRunsDashboard() {
  const { runs, loading, error } = useAgentRuns();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgentRunStatus | "all">("all");
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  // Filter and search runs
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesSearch =
        !searchQuery ||
        run.agent_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        run.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        run.current_step?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || run.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [runs, searchQuery, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = runs.length;
    const completed = runs.filter((r) => r.status === "completed").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const active = runs.filter((r) =>
      ["in_progress", "awaiting_verification", "verification_in_progress"].includes(r.status)
    ).length;
    const successRate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0.0";

    return { total, completed, failed, active, successRate };
  }, [runs]);

  const getStatusColor = (status: AgentRunStatus) => {
    const colors: Record<AgentRunStatus, string> = {
      pending: "bg-gray-500",
      in_progress: "bg-blue-500",
      awaiting_verification: "bg-yellow-500",
      verification_in_progress: "bg-yellow-600",
      verification_passed: "bg-green-500",
      verification_failed: "bg-red-500",
      completed: "bg-green-600",
      failed: "bg-red-600",
      blocked: "bg-orange-500",
      escalated_to_human: "bg-purple-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Agent Runs Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time monitoring and observability for agent executions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time agent executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently running agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.failed} failed runs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by agent name, run ID, or step..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AgentRunStatus | "all")}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="awaiting_verification">Awaiting Verification</SelectItem>
              <SelectItem value="verification_failed">Verification Failed</SelectItem>
              <SelectItem value="escalated_to_human">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">Error loading agent runs: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Agent Runs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Agent Runs ({filteredRuns.length})</CardTitle>
              <CardDescription>Click a row to view detailed information</CardDescription>
            </div>
            {loading && <Clock className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No agent runs found</p>
              {searchQuery || statusFilter !== "all" ? (
                <p className="text-xs mt-1">Try adjusting your filters</p>
              ) : null}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Current Step</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRuns.map((run) => {
                  const duration = run.completed_at
                    ? Math.round(
                        (new Date(run.completed_at).getTime() -
                          new Date(run.started_at).getTime()) /
                          1000
                      )
                    : Math.round(
                        (Date.now() - new Date(run.started_at).getTime()) / 1000
                      );

                  return (
                    <TableRow
                      key={run.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRunId(run.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(run.status)}`} />
                          <span className="text-xs capitalize">
                            {run.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{run.agent_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-secondary rounded-full h-1.5">
                            <div
                              className="bg-primary rounded-full h-1.5"
                              style={{ width: `${run.progress_percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {run.progress_percent.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                        {run.current_step || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(run.started_at).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {duration}s
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRunId(run.id);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detailed View Modal/Drawer */}
      {selectedRunId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Agent Run Details</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedRunId(null)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <AgentRunMonitor runId={selectedRunId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

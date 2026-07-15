'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Workflow, Clock, Tag } from 'lucide-react';
import type { WorkflowDefinition } from '@/types/workflow';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch('/api/workflows');
        if (response.ok) {
          const data = await response.json();
          setWorkflows(data);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch workflows:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Workflows</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage visual workflows with node-based canvas
          </p>
        </div>
        <Link href="/workflows/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="bg-muted h-6 w-3/4 rounded" />
                <div className="bg-muted mt-2 h-4 w-1/2 rounded" />
              </CardHeader>
              <CardContent>
                <div className="bg-muted h-4 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <Card className="p-12 text-center">
          <Workflow className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h3 className="mb-2 text-xl font-semibold">No workflows yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first visual workflow
          </p>
          <Link href="/workflows/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5" />
                    {workflow.name}
                  </CardTitle>
                  <CardDescription>{workflow.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Updated {new Date(workflow.updated_at).toLocaleDateString()}
                    </div>
                    {workflow.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag className="text-muted-foreground h-4 w-4" />
                        {workflow.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-muted-foreground text-xs">
                      {workflow.nodes.length} nodes · {workflow.edges.length} connections
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

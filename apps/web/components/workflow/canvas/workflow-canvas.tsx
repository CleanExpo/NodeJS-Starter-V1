'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import StartNode from '../nodes/start-node';
import EndNode from '../nodes/end-node';
import LLMNode from '../nodes/llm-node';
import AgentNode from '../nodes/agent-node';
import ToolNode from '../nodes/tool-node';
import ConditionalNode from '../nodes/conditional-node';
import { Button } from '@/components/ui/button';
import { Save, Play } from 'lucide-react';

const nodeTypes: NodeTypes = {
  start: StartNode,
  end: EndNode,
  llm: LLMNode,
  agent: AgentNode,
  tool: ToolNode,
  conditional: ConditionalNode,
};

interface WorkflowCanvasProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => Promise<void>;
  onExecute?: () => Promise<void>;
  readonly?: boolean;
}

export function WorkflowCanvas({
  initialNodes = [
    {
      id: 'start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: { label: 'Workflow Start' },
    },
    {
      id: 'end',
      type: 'end',
      position: { x: 250, y: 250 },
      data: { label: 'Workflow End' },
    },
  ],
  initialEdges = [],
  onSave,
  onExecute,
  readonly = false,
}: WorkflowCanvasProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const handleSave = async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(nodes, edges);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!onExecute) return;

    try {
      await onExecute();
    } catch (error) {
      console.error('Failed to execute workflow:', error);
    }
  };

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readonly ? undefined : onNodesChange}
        onEdgesChange={readonly ? undefined : onEdgesChange}
        onConnect={readonly ? undefined : onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        nodesDraggable={!readonly}
        nodesConnectable={!readonly}
        elementsSelectable={!readonly}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          className="!bg-background !border-border"
          nodeColor={(node) => {
            if (node.type === 'start') return '#22c55e';
            if (node.type === 'end') return '#ef4444';
            return '#3b82f6';
          }}
        />
      </ReactFlow>

      {/* Action buttons */}
      {!readonly && (
        <div className="absolute right-4 bottom-4 z-10 flex gap-2">
          {onExecute && (
            <Button onClick={handleExecute} variant="default">
              <Play className="mr-2 h-4 w-4" />
              Execute
            </Button>
          )}
          {onSave && (
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

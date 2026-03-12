'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Bot } from 'lucide-react';

type AgentNodeType = Node<{ label: string; agent_name?: string }, 'agent'>;

function AgentNode({ data, selected }: NodeProps<AgentNodeType>) {
  return (
    <div
      className={`min-w-[180px] rounded-lg border-2 px-4 py-3 shadow-md ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
      } `}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-purple-500" />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
          <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-muted-foreground text-xs">{data.agent_name || 'Agent'}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3 !bg-purple-500" />
    </div>
  );
}

export default memo(AgentNode);

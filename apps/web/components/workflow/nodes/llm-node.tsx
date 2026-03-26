'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

type LLMNodeType = Node<{ label: string; model?: string }, 'llm'>;

function LLMNode({ data, selected }: NodeProps<LLMNodeType>) {
  return (
    <div
      className={`min-w-[180px] rounded-lg border-2 px-4 py-3 shadow-md ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
      } `}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-blue-500" />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-muted-foreground text-xs">{data.model || 'LLM'}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3 !bg-blue-500" />
    </div>
  );
}

export default memo(LLMNode);

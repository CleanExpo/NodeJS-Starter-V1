'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Wrench } from 'lucide-react';

type ToolNodeType = Node<{ label: string; tool_name?: string }, 'tool'>;

function ToolNode({ data, selected }: NodeProps<ToolNodeType>) {
  return (
    <div
      className={`min-w-[180px] rounded-lg border-2 px-4 py-3 shadow-md ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
      } `}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-orange-500" />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
          <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-muted-foreground text-xs">{data.tool_name || 'Tool'}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="h-3 w-3 !bg-orange-500" />
    </div>
  );
}

export default memo(ToolNode);

'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

type ConditionalNodeType = Node<{ label: string; condition?: string }, 'conditional'>;

function ConditionalNode({ data, selected }: NodeProps<ConditionalNodeType>) {
  return (
    <div
      className={`min-w-[180px] rounded-lg border-2 px-4 py-3 shadow-md ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
      } `}
    >
      <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-yellow-500" />

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
          <GitBranch className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-muted-foreground text-xs">If/Else</div>
        </div>
      </div>

      {/* Two output handles for true/false */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!left-[30%] h-3 w-3 !bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!left-[70%] h-3 w-3 !bg-red-500"
      />
    </div>
  );
}

export default memo(ConditionalNode);

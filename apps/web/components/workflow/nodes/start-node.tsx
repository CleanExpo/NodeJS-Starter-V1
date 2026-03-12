'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';

type StartNodeType = Node<{ label: string }, 'start'>;

function StartNode({ data, selected }: NodeProps<StartNodeType>) {
  return (
    <div
      className={`min-w-[150px] rounded-lg border-2 px-4 py-3 shadow-md ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
      } `}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-muted-foreground text-xs">Start</div>
        </div>
      </div>

      {/* Only output handle for start node */}
      <Handle type="source" position={Position.Bottom} className="h-3 w-3 !bg-green-500" />
    </div>
  );
}

export default memo(StartNode);

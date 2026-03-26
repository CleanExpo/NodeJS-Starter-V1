'use client';

import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';

type EndNodeType = Node<{ label: string }, 'end'>;

function EndNode({ data, selected }: NodeProps<EndNodeType>) {
  return (
    <div
      className={`min-w-[150px] rounded-lg border-2 px-4 py-3 shadow-md ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
      } `}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <Square className="h-4 w-4 fill-current text-red-600 dark:text-red-400" />
        </div>
        <div>
          <div className="text-sm font-semibold">{data.label}</div>
          <div className="text-muted-foreground text-xs">End</div>
        </div>
      </div>

      {/* Only input handle for end node */}
      <Handle type="target" position={Position.Top} className="h-3 w-3 !bg-red-500" />
    </div>
  );
}

export default memo(EndNode);

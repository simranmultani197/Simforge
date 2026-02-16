import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { QueueFlowNode } from '../../../types/flow';

function QueueNodeComponent({ data, selected }: NodeProps<QueueFlowNode>) {
  return (
    <div className={`sf-node sf-node--queue ${selected ? 'selected' : ''}`}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--sf-node-queue)' }}
      />

      <div className="flex items-center gap-3">
        <div className="sf-node__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="4" rx="1" />
            <rect x="3" y="10" width="18" height="4" rx="1" />
            <rect x="3" y="17" width="18" height="4" rx="1" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--sf-text-primary)] truncate">
            {data.label}
          </div>
          <div className="text-[11px] text-[var(--sf-text-secondary)] mt-0.5">
            depth {data.config.maxDepth.toLocaleString()}
            {data.config.deadLetterEnabled ? ' · DLQ' : ''}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--sf-node-queue)' }}
      />
    </div>
  );
}

export const QueueNode = memo(QueueNodeComponent);

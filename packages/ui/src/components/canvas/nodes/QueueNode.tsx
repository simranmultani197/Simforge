import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { QueueFlowNode } from '../../../types/flow';
import { getNodeIcon } from '../../../data/icons/cloud-icons';
import { useNodeVisualClasses } from './useNodeVisualClasses';

function QueueNodeComponent({ id, data, selected }: NodeProps<QueueFlowNode>) {
  const stateClass = useNodeVisualClasses(id);
  const Icon = getNodeIcon('queue', data.presetId);

  return (
    <div
      className={`sf-node sf-node--queue ${selected ? 'selected' : ''} ${stateClass}`}
      role="group"
      aria-label={`Queue: ${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--sf-node-queue)' }}
        aria-label="Input connection"
      />

      <div className="flex items-center gap-3">
        <div className="sf-node__icon">
          <Icon />
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
        aria-label="Output connection"
      />
    </div>
  );
}

export const QueueNode = memo(QueueNodeComponent);

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LoadBalancerFlowNode } from '../../../types/flow';
import { getNodeIcon } from '../../../data/icons/cloud-icons';
import { useNodeVisualClasses } from './useNodeVisualClasses';

function LoadBalancerNodeComponent({ id, data, selected }: NodeProps<LoadBalancerFlowNode>) {
  const stateClass = useNodeVisualClasses(id);
  const Icon = getNodeIcon('load-balancer', data.presetId);

  return (
    <div
      className={`sf-node sf-node--lb ${selected ? 'selected' : ''} ${stateClass}`}
      role="group"
      aria-label={`Load Balancer: ${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--sf-node-lb)' }}
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
            {data.config.algorithm} · {data.config.maxConnections.toLocaleString()} max
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--sf-node-lb)' }}
        aria-label="Output connection"
      />
    </div>
  );
}

export const LoadBalancerNode = memo(LoadBalancerNodeComponent);

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LoadBalancerFlowNode } from '../../../types/flow';
import { useNodeVisualClasses } from './useNodeVisualClasses';

function LoadBalancerNodeComponent({ id, data, selected }: NodeProps<LoadBalancerFlowNode>) {
  const stateClass = useNodeVisualClasses(id);

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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="2" x2="12" y2="6" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <circle cx="12" cy="12" r="4" />
            <line x1="4" y1="12" x2="8" y2="12" />
            <line x1="16" y1="12" x2="20" y2="12" />
            <line x1="5.6" y1="5.6" x2="8.5" y2="8.5" />
            <line x1="15.5" y1="15.5" x2="18.4" y2="18.4" />
            <line x1="5.6" y1="18.4" x2="8.5" y2="15.5" />
            <line x1="15.5" y1="8.5" x2="18.4" y2="5.6" />
          </svg>
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

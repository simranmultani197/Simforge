import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CacheFlowNode } from '../../../types/flow';
import { useSimulationStore } from '../../../stores/simulation-store';

function CacheNodeComponent({ id, data, selected }: NodeProps<CacheFlowNode>) {
  const visualState = useSimulationStore((s) => s.nodeVisualStates[id]);
  const stateClass = visualState ? `sf-node--${visualState}` : '';

  return (
    <div
      className={`sf-node sf-node--cache ${selected ? 'selected' : ''} ${stateClass}`}
      role="group"
      aria-label={`Cache: ${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--sf-node-cache)' }}
        aria-label="Input connection"
      />

      <div className="flex items-center gap-3">
        <div className="sf-node__icon">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="5" width="16" height="5" rx="1" />
            <rect x="4" y="11" width="16" height="5" rx="1" />
            <rect x="4" y="17" width="16" height="2" rx="1" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--sf-text-primary)] truncate">{data.label}</div>
          <div className="text-[11px] text-[var(--sf-text-secondary)] mt-0.5">
            {data.config.evictionPolicy.toUpperCase()} · {Math.round(data.config.hitRate * 100)}% hit
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--sf-node-cache)' }}
        aria-label="Output connection"
      />
    </div>
  );
}

export const CacheNode = memo(CacheNodeComponent);

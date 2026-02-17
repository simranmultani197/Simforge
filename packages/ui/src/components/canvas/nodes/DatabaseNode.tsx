import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DatabaseFlowNode } from '../../../types/flow';
import { useSimulationStore } from '../../../stores/simulation-store';

function DatabaseNodeComponent({ id, data, selected }: NodeProps<DatabaseFlowNode>) {
  const visualState = useSimulationStore((s) => s.nodeVisualStates[id]);
  const stateClass = visualState ? `sf-node--${visualState}` : '';

  return (
    <div
      className={`sf-node sf-node--database ${selected ? 'selected' : ''} ${stateClass}`}
      role="group"
      aria-label={`Database: ${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--sf-node-database)' }}
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
            <ellipse cx="12" cy="5" rx="7" ry="3" />
            <path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
            <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--sf-text-primary)] truncate">{data.label}</div>
          <div className="text-[11px] text-[var(--sf-text-secondary)] mt-0.5">
            {data.config.engine} · {data.config.maxConnections.toLocaleString()} conn.
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--sf-node-database)' }}
        aria-label="Output connection"
      />
    </div>
  );
}

export const DatabaseNode = memo(DatabaseNodeComponent);

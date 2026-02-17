import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ApiGatewayFlowNode } from '../../../types/flow';
import { useSimulationStore } from '../../../stores/simulation-store';

function ApiGatewayNodeComponent({ id, data, selected }: NodeProps<ApiGatewayFlowNode>) {
  const visualState = useSimulationStore((s) => s.nodeVisualStates[id]);
  const stateClass = visualState ? `sf-node--${visualState}` : '';

  return (
    <div
      className={`sf-node sf-node--api-gateway ${selected ? 'selected' : ''} ${stateClass}`}
      role="group"
      aria-label={`API Gateway: ${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: 'var(--sf-node-gateway)' }}
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
            <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
            <path d="M9 12h6" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--sf-text-primary)] truncate">{data.label}</div>
          <div className="text-[11px] text-[var(--sf-text-secondary)] mt-0.5">
            {data.config.rateLimitRps.toLocaleString()} rps · {data.config.routes} routes
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--sf-node-gateway)' }}
        aria-label="Output connection"
      />
    </div>
  );
}

export const ApiGatewayNode = memo(ApiGatewayNodeComponent);

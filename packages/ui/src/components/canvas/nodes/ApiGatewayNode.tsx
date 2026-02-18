import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ApiGatewayFlowNode } from '../../../types/flow';
import { getNodeIcon } from '../../../data/icons/cloud-icons';
import { useNodeVisualClasses } from './useNodeVisualClasses';

function ApiGatewayNodeComponent({ id, data, selected }: NodeProps<ApiGatewayFlowNode>) {
  const stateClass = useNodeVisualClasses(id);
  const Icon = getNodeIcon('api-gateway', data.presetId);

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
          <Icon />
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

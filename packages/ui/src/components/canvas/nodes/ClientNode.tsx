import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ClientFlowNode } from '../../../types/flow';
import { getNodeIcon } from '../../../data/icons/cloud-icons';
import { useNodeVisualClasses } from './useNodeVisualClasses';

function ClientNodeComponent({ id, data, selected }: NodeProps<ClientFlowNode>) {
  const stateClass = useNodeVisualClasses(id);
  const Icon = getNodeIcon('client', data.presetId);

  return (
    <div
      className={`sf-node sf-node--client ${selected ? 'selected' : ''} ${stateClass}`}
      role="group"
      aria-label={`Client: ${data.label}`}
    >
      <div className="flex items-center gap-3">
        <div className="sf-node__icon">
          <Icon />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--sf-text-primary)] truncate">
            {data.label}
          </div>
          <div className="text-[11px] text-[var(--sf-text-secondary)] mt-0.5">
            Request source
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: 'var(--sf-node-client)' }}
        aria-label="Output connection"
      />
    </div>
  );
}

export const ClientNode = memo(ClientNodeComponent);

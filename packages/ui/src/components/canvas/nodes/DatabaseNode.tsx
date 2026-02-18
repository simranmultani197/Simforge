import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { DatabaseFlowNode } from '../../../types/flow';
import { getNodeIcon } from '../../../data/icons/cloud-icons';
import { useNodeVisualClasses } from './useNodeVisualClasses';

function DatabaseNodeComponent({ id, data, selected }: NodeProps<DatabaseFlowNode>) {
  const stateClass = useNodeVisualClasses(id);
  const Icon = getNodeIcon('database', data.presetId);

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
          <Icon />
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
